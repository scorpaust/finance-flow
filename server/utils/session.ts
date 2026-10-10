import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { User } from '../models'

// Sessão assinada (Fase 8, ponto 2) — substitui o cookie `userId` com o _id em
// claro. O valor do cookie passa a ser `${userId}.${expiresAt}.${hmac}`, onde
// `hmac` cobre um `purpose` ('session' ou '2fa-pending') para que um cookie de
// um tipo nunca possa ser reaproveitado como o outro. `expiresAt` vai dentro do
// valor assinado (não só no `maxAge` do cookie) para que a expiração seja
// verificada no servidor mesmo que o cookie tenha sido copiado/retido.
const SESSION_COOKIE = 'session'
const PENDING_2FA_COOKIE = 'pending_2fa'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 dias, igual ao cookie anterior
const PENDING_2FA_TTL_SECONDS = 60 * 10 // 10 minutos — só o tempo de introduzir o código

function getSessionSecret(): string {
  const secret = useRuntimeConfig().sessionSecret
  if (!secret) {
    // Falha alto e cedo: sem isto qualquer sessão seria inválida de qualquer forma.
    throw createError({ statusCode: 500, message: 'Servidor mal configurado (SESSION_SECRET em falta)' })
  }
  return secret
}

// Upgrade 05 — o cookie leva também a versão das sessões do utilizador
// (`User.sessionVersion`): `${userId}.${version}.${expiresAt}.${hmac}`. Mudar
// a password incrementa a versão e as sessões antigas deixam de valer (ver
// readValidSession). Os cookies de antes deste formato (3 partes, sem versão)
// contam como versão 0 — ninguém é desligado no deploy.
export interface SessionClaims {
  userId: string
  version: number
}

function hmacHex(payload: string): string {
  return createHmac('sha256', getSessionSecret()).update(payload).digest('hex')
}

function sign(purpose: string, userId: string, expiresAt: number, version = 0): string {
  const hmac = hmacHex(`${purpose}.${userId}.${version}.${expiresAt}`)
  return `${userId}.${version}.${expiresAt}.${hmac}`
}

function verify(purpose: string, token: string | undefined | null): SessionClaims | null {
  if (!token) return null
  const parts = token.split('.')
  let userId: string, versionStr: string, expiresAtStr: string, hmac: string, payload: string
  if (parts.length === 4) {
    ;[userId, versionStr, expiresAtStr, hmac] = parts
    payload = `${purpose}.${userId}.${versionStr}.${expiresAtStr}`
  } else if (parts.length === 3) {
    ;[userId, expiresAtStr, hmac] = parts
    versionStr = '0'
    payload = `${purpose}.${userId}.${expiresAtStr}`
  } else {
    return null
  }
  const expiresAt = Number(expiresAtStr)
  const version = Number(versionStr)
  if (!userId || !hmac || !Number.isFinite(expiresAt) || !Number.isInteger(version) || version < 0) return null
  if (Date.now() > expiresAt) return null

  const expectedBuf = Buffer.from(hmacHex(payload), 'hex')
  const actualBuf = Buffer.from(hmac, 'hex')
  if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) return null
  return { userId, version }
}

function cookieOpts(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge,
    path: '/',
  }
}

// `version` = `User.sessionVersion` atual (0 se a conta não tiver o campo).
export function issueSession(event: H3Event, userId: string, version = 0): void {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000
  setCookie(event, SESSION_COOKIE, sign('session', userId, expiresAt, version), cookieOpts(SESSION_TTL_SECONDS))
  deleteCookie(event, PENDING_2FA_COOKIE, { path: '/' })
}

// Só a assinatura e a validade do cookie — sem confirmar a versão na base de
// dados. Para autorizar pedidos, usar readValidSession / requireAuth.
export function readSessionClaims(event: H3Event): SessionClaims | null {
  return verify('session', getCookie(event, SESSION_COOKIE))
}

// Sessão válida = cookie assinado e dentro do prazo E com a versão atual do
// utilizador (uma password mudada noutro dispositivo invalida-a).
export async function readValidSession(event: H3Event): Promise<string | null> {
  const claims = readSessionClaims(event)
  if (!claims) return null
  const user = await User.findById(claims.userId).select('sessionVersion').lean<{ sessionVersion?: number }>()
  if (!user || (user.sessionVersion ?? 0) !== claims.version) return null
  return claims.userId
}

export function clearAppSession(event: H3Event): void {
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
  deleteCookie(event, PENDING_2FA_COOKIE, { path: '/' })
}

// Estado intermédio de login quando o utilizador tem 2FA ativo: prova que a
// password já foi validada, sem ainda conceder uma sessão completa.
export function issuePending2fa(event: H3Event, userId: string): void {
  const expiresAt = Date.now() + PENDING_2FA_TTL_SECONDS * 1000
  setCookie(event, PENDING_2FA_COOKIE, sign('2fa-pending', userId, expiresAt), cookieOpts(PENDING_2FA_TTL_SECONDS))
}

export function readPending2fa(event: H3Event): string | null {
  return verify('2fa-pending', getCookie(event, PENDING_2FA_COOKIE))?.userId ?? null
}

// Exposto só para os testes unitários (formato e compatibilidade dos cookies).
export const __test = { sign, verify }
