import { describe, expect, it } from 'vitest'
import * as OTPAuth from 'otpauth'
import { consumeBackupCode, generateBackupCodes, generateTotpSecret, verifyTotpCode } from '../server/utils/twoFactor'

describe('TOTP', () => {
  it('aceita o código atual gerado a partir do segredo', () => {
    const { secretBase32 } = generateTotpSecret('teste@example.com')
    const code = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(secretBase32) }).generate()
    expect(verifyTotpCode(secretBase32, code)).toBe(true)
  })

  it('rejeita códigos errados e formatos inválidos', () => {
    const { secretBase32 } = generateTotpSecret('teste@example.com')
    expect(verifyTotpCode(secretBase32, '000000') || verifyTotpCode(secretBase32, '000001')).toBe(false)
    expect(verifyTotpCode(secretBase32, '12345')).toBe(false)
    expect(verifyTotpCode(secretBase32, 'abcdef')).toBe(false)
    expect(verifyTotpCode(secretBase32, '')).toBe(false)
  })

  it('o URL otpauth identifica a app e a conta', () => {
    const { otpauthUrl } = generateTotpSecret('teste@example.com')
    expect(otpauthUrl).toMatch(/^otpauth:\/\/totp\/FinanceFlow/)
    expect(otpauthUrl).toContain('teste%40example.com')
  })
})

describe('códigos de recuperação', () => {
  it('geram 10 códigos únicos com o formato XXXXX-XXXXX', () => {
    const { plain, hashed } = generateBackupCodes()
    expect(plain).toHaveLength(10)
    expect(new Set(plain).size).toBe(10)
    for (const c of plain) expect(c).toMatch(/^[A-Z2-9]{5}-[A-Z2-9]{5}$/)
    expect(hashed).toHaveLength(10)
    expect(hashed.some((h) => plain.includes(h))).toBe(false)
  })

  it('cada código só funciona uma vez e é removido da lista', () => {
    const { plain, hashed } = generateBackupCodes()
    const remaining = consumeBackupCode(hashed, plain[3])
    expect(remaining).not.toBeNull()
    expect(remaining).toHaveLength(9)
    expect(consumeBackupCode(remaining!, plain[3])).toBeNull()
  })

  it('é tolerante a espaços e minúsculas mas rejeita códigos inventados', () => {
    const { plain, hashed } = generateBackupCodes()
    expect(consumeBackupCode(hashed, `  ${plain[0].toLowerCase()} `)).not.toBeNull()
    expect(consumeBackupCode(hashed, 'AAAAA-AAAAA')).toBeNull()
    expect(consumeBackupCode([], plain[0])).toBeNull()
  })
})
