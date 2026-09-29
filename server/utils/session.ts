import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

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

function sign(purpose: string, userId: string, expiresAt: number): string {
  const payload = `${purpose}.${userId}.${expiresAt}`
  const hmac = createHmac('sha256', getSessionSecret()).update(payload).digest('hex')
  return `${userId}.${expiresAt}.${hmac}`
}

function verify(purpose: string, token: string | undefined | null): string | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [userId, expiresAtStr, hmac] = parts
  const expiresAt = Number(expiresAtStr)
  if (!userId || !hmac || !Number.isFinite(expiresAt)) return null
  if (Date.now() > expiresAt) return null

  const expected = createHmac('sha256', getSessionSecret())
    .update(`${purpose}.${userId}.${expiresAtStr}`)
    .digest('hex')
  const expectedBuf = Buffer.from(expected, 'hex')
  const actualBuf = Buffer.from(hmac, 'hex')
  if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) return null
  return userId
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

export function issueSession(event: H3Event, userId: string): void {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000
  setCookie(event, SESSION_COOKIE, sign('session', userId, expiresAt), cookieOpts(SESSION_TTL_SECONDS))
  deleteCookie(event, PENDING_2FA_COOKIE, { path: '/' })
}

export function readSession(event: H3Event): string | null {
  return verify('session', getCookie(event, SESSION_COOKIE))
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
  return verify('2fa-pending', getCookie(event, PENDING_2FA_COOKIE))
}
