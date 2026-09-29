import { describe, expect, it } from 'vitest'
import { useFormatters } from '../composables/useFormatters'

// Fase 8, ponto 6 — useFormatters() depende de useI18n()/useLocaleFormat()
// (auto-imports do Nuxt, stubados em tests/setup/nuxtStubs.ts para fixar o
// locale em pt-PT); os testes cobrem a lógica de arredondamento/sinal, não a
// tradução em si.
const { formatCurrency, formatCompact, formatDate, formatMonthYear, formatPercentage, formatReturnPct, formatSignedCurrency, relativeTime } =
  useFormatters()

describe('formatCurrency / formatCompact', () => {
  it('formata em euros com 2 casas decimais, locale pt-PT', () => {
    expect(formatCurrency(1234.5)).toMatch(/1[.  ]?234,50[  ]?€/)
  })

  it('trata null/undefined como zero', () => {
    expect(formatCurrency(undefined as unknown as number)).toBe(formatCurrency(0))
  })

  it('abrevia valores grandes em k€/M€', () => {
    expect(formatCompact(1_500)).toBe('1.5k €')
    expect(formatCompact(2_500_000)).toBe('2.5M €')
    expect(formatCompact(999)).toBe(formatCurrency(999))
  })
})

describe('formatPercentage / formatReturnPct', () => {
  it('formatPercentage mostra sempre o sinal', () => {
    expect(formatPercentage(5)).toBe('+5.0%')
    expect(formatPercentage(-5)).toBe('-5.0%')
    expect(formatPercentage(0)).toBe('+0.0%')
  })

  it('formatReturnPct — regressão da folha de investimentos (Fase 6): 1,94% / -2,00%', () => {
    expect(formatReturnPct(1.94)).toMatch(/1,94\s?%/)
    expect(formatReturnPct(-2)).toMatch(/-2,00\s?%/)
  })

  it('formatReturnPct devolve "—" sem capital investido (null/undefined/NaN)', () => {
    expect(formatReturnPct(null)).toBe('—')
    expect(formatReturnPct(undefined)).toBe('—')
    expect(formatReturnPct(NaN)).toBe('—')
  })
})

describe('formatSignedCurrency', () => {
  it('mostra o sinal explícito só quando != 0', () => {
    expect(formatSignedCurrency(20)).toMatch(/^\+/)
    expect(formatSignedCurrency(-1)).toMatch(/^-/)
    expect(formatSignedCurrency(0)).not.toMatch(/^[+-]/)
  })
})

describe('formatDate / formatMonthYear', () => {
  it('devolve "—" para datas inválidas ou em falta', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate(undefined)).toBe('—')
    expect(formatDate('not-a-date')).toBe('—')
  })

  it('formata uma data ISO válida', () => {
    expect(formatDate('2026-03-15')).toMatch(/15/)
  })

  it('formatMonthYear cai no próprio monthKey se inválido', () => {
    expect(formatMonthYear('lixo')).toBe('lixo')
    expect(formatMonthYear('2026-03')).not.toBe('2026-03')
  })
})

describe('relativeTime', () => {
  it('devolve "—" sem data', () => {
    expect(relativeTime(null)).toBe('—')
  })

  it('hoje/ontem usam as chaves de tradução dedicadas (stub devolve a própria chave)', () => {
    expect(relativeTime(new Date())).toBe('common.today')
    expect(relativeTime(new Date(Date.now() - 86_400_000))).toBe('common.yesterday')
  })

  it('mais de 30 dias cai para uma data formatada, não uma chave de tradução', () => {
    const result = relativeTime(new Date(Date.now() - 40 * 86_400_000))
    expect(result).not.toMatch(/^common\./)
  })
})
