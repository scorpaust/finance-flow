import { describe, expect, it } from 'vitest'
import { isValidPortugueseNif, normalizeFiscalId } from '../shared/fiscalId'

// Upgrade 11 — NIF para as faturas.
describe('NIF português', () => {
  it('aceita NIF com dígito de controlo certo (com espaços, pontos ou prefixo PT)', () => {
    expect(isValidPortugueseNif('123456789')).toBe(true)
    expect(isValidPortugueseNif('123 456 789')).toBe(true)
    expect(isValidPortugueseNif('PT123456789')).toBe(true)
    expect(isValidPortugueseNif('501964843')).toBe(true)
  })

  it('recusa dígito de controlo errado, tamanho errado e letras', () => {
    expect(isValidPortugueseNif('123456780')).toBe(false)
    expect(isValidPortugueseNif('12345678')).toBe(false)
    expect(isValidPortugueseNif('12345678A')).toBe(false)
    expect(isValidPortugueseNif('')).toBe(false)
  })

  it('normaliza', () => expect(normalizeFiscalId(' pt 123.456-789 ')).toBe('123456789'))
})
