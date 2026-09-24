import { randomBytes, createHash, createCipheriv, createDecipheriv, timingSafeEqual } from 'node:crypto'
import * as OTPAuth from 'otpauth'

// Autenticação de dois fatores por app autenticadora (TOTP) — Fase 8, ponto 3.
// Ver context/features/08-FASE-8-seguranca-qualidade.md: só TOTP (Google
// Authenticator/Authy/1Password), email e SMS ficaram fora de âmbito.

const ISSUER = 'FinanceFlow'
const BACKUP_CODE_COUNT = 10

function getEncryptionKey(): Buffer {
  const secret = useRuntimeConfig().twoFactorEncryptionKey
  if (!secret) {
    throw createError({ statusCode: 500, message: 'Servidor mal configurado (TWO_FACTOR_ENCRYPTION_KEY em falta)' })
  }
  // Aceita qualquer string com pelo menos 32 bytes de entropia — deriva uma
  // chave AES-256 fixa por hash em vez de exigir exatamente 32 bytes em hex.
  return createHash('sha256').update(secret).digest()
}

// AES-256-GCM: o segredo TOTP nunca fica em texto simples na base de dados
// (spec, ponto 3). Formato guardado: `${ivHex}:${authTagHex}:${cipherHex}`.
export function encryptSecret(plainText: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decryptSecret(stored: string): string {
  const [ivHex, authTagHex, cipherHex] = stored.split(':')
  if (!ivHex || !authTagHex || !cipherHex) {
    throw createError({ statusCode: 500, message: 'Segredo 2FA corrompido' })
  }
  const key = getEncryptionKey()
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
  const decrypted = Buffer.concat([decipher.update(Buffer.from(cipherHex, 'hex')), decipher.final()])
  return decrypted.toString('utf8')
}

export function generateTotpSecret(email: string): { secretBase32: string; otpauthUrl: string } {
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: new OTPAuth.Secret({ size: 20 }),
  })
  return { secretBase32: totp.secret.base32, otpauthUrl: totp.toString() }
}

// `window: 1` tolera um passo de 30s de desfasamento de relógio para trás/frente
// — suficiente para relógios ligeiramente dessincronizados sem abrir demasiado
// a janela de códigos válidos.
export function verifyTotpCode(secretBase32: string, code: string): boolean {
  if (!/^\d{6}$/.test(code)) return false
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  })
  return totp.validate({ token: code, window: 1 }) !== null
}

function hashBackupCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

// Códigos de recuperação: 10 caracteres alfanuméricos maiúsculos (sem 0/O/1/I
// para evitar ambiguidade visual ao transcrever), formatados em dois grupos de
// 5 para facilitar a leitura (ex. "7K9XP-2MJQR"). Devolvidos ao utilizador em
// texto simples só uma vez, no momento em que são gerados — só o hash SHA-256
// fica guardado (não usamos scrypt/bcrypt como na password: são strings
// aleatórias de alta entropia, não escolhidas por humanos, por isso não
// precisam de um hash lento nem de salt individual).
const BACKUP_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateBackupCode(): string {
  const bytes = randomBytes(10)
  let raw = ''
  for (let i = 0; i < 10; i++) raw += BACKUP_CODE_ALPHABET[bytes[i] % BACKUP_CODE_ALPHABET.length]
  return `${raw.slice(0, 5)}-${raw.slice(5)}`
}

export function generateBackupCodes(): { plain: string[]; hashed: string[] } {
  const plain = Array.from({ length: BACKUP_CODE_COUNT }, generateBackupCode)
  return { plain, hashed: plain.map(hashBackupCode) }
}

// Verifica um código de recuperação contra a lista de hashes guardados e
// devolve a lista SEM o código usado (uso único) — ou `null` se não bateu
// certo com nenhum. Comparação em tempo constante por hash para não vazar,
// por timing, qual posição da lista quase bateu certo.
export function consumeBackupCode(hashedCodes: string[], candidate: string): string[] | null {
  const candidateHash = Buffer.from(hashBackupCode(candidate.trim().toUpperCase()), 'hex')
  const index = hashedCodes.findIndex((h) => {
    const hBuf = Buffer.from(h, 'hex')
    return hBuf.length === candidateHash.length && timingSafeEqual(hBuf, candidateHash)
  })
  if (index === -1) return null
  return [...hashedCodes.slice(0, index), ...hashedCodes.slice(index + 1)]
}
