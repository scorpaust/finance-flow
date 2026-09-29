import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

// Extraído de server/api/auth/session.ts (Fase 8) para ser reutilizável por
// server/api/auth/2fa/disable.post.ts, que também precisa de confirmar a
// password atual antes de desativar o 2FA.
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false

  const expected = Buffer.from(hash, 'hex')
  const actual = scryptSync(password, salt, 64)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}
