import { createHash, randomBytes } from 'node:crypto'
import { User } from '../models'
import { hashPassword } from './password'
import { sendEmail } from './email'
import { passwordChangedEmail } from './emailTemplates'
import type { ServerLocale } from './i18n'

// Upgrade 05 — recuperação de password. Ver
// context/features/upgrades/05-recuperacao-password.md.

// Validade do link de recuperação (decisão: 30 minutos, uso único).
export const RESET_TOKEN_TTL_MINUTES = 30

// 32 bytes aleatórios em base64url para o link; na base de dados só o SHA-256.
export function newResetToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString('base64url')
  return { token, tokenHash: hashResetToken(token) }
}

export function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

// Aparência de um token gerado acima — rejeita lixo antes de ir à base de dados.
export function isWellFormedToken(token: unknown): token is string {
  return typeof token === 'string' && /^[A-Za-z0-9_-]{43}$/.test(token)
}

// Mesmo tempo de resposta quer a conta exista quer não (o envio do email só
// acontece num dos casos): não deixa adivinhar pelo tempo quem tem conta.
export async function atLeast<T>(ms: number, work: Promise<T>): Promise<T> {
  const [result] = await Promise.all([work, new Promise((r) => setTimeout(r, ms))])
  return result
}

// Grava a nova password, invalida todas as sessões (incrementa a versão) e
// avisa por email. Devolve a nova versão das sessões.
export async function setNewPassword(opts: {
  userId: string
  password: string
  locale: ServerLocale
}): Promise<number> {
  const user = await User.findByIdAndUpdate(
    opts.userId,
    {
      $set: { passwordHash: hashPassword(opts.password), provider: 'password' },
      $inc: { sessionVersion: 1 },
    },
    { new: true }
  ).select('email name sessionVersion')
  if (!user) throw createError({ statusCode: 404, message: 'User not found' })
  await sendEmail(passwordChangedEmail({ to: user.email, name: user.name, locale: opts.locale }))
  return user.sessionVersion ?? 1
}
