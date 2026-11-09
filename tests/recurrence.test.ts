import { describe, expect, it } from 'vitest'
import { dueOccurrence, nextOccurrence, suggestedDate } from '../shared/recurrence'

const d = (s: string) => new Date(`${s}T00:00:00Z`)
const iso = (x: Date | null) => x?.toISOString().slice(0, 10) ?? null

describe('nextOccurrence', () => {
  it('mensal mantém o dia da série, mesmo depois de um mês mais curto', () => {
    expect(iso(nextOccurrence(d('2026-01-31'), 'monthly', 31))).toBe('2026-02-28')
    expect(iso(nextOccurrence(d('2026-02-28'), 'monthly', 31))).toBe('2026-03-31')
    expect(iso(nextOccurrence(d('2026-10-23'), 'monthly', 23))).toBe('2026-11-23')
  })

  it('semanal, anual e sem recorrência', () => {
    expect(iso(nextOccurrence(d('2026-12-29'), 'weekly', 29))).toBe('2027-01-05')
    expect(iso(nextOccurrence(d('2028-02-29'), 'yearly', 29))).toBe('2029-02-28')
    expect(nextOccurrence(d('2026-10-23'), 'none', 23)).toBeNull()
  })
})

describe('dueOccurrence', () => {
  it('aparece 3 dias antes da data prevista, não antes', () => {
    expect(dueOccurrence(d('2026-11-23'), 'monthly', 23, d('2026-11-19'))).toBeNull()
    expect(iso(dueOccurrence(d('2026-11-23'), 'monthly', 23, d('2026-11-20')))).toBe('2026-11-23')
  })

  it('meses sem resposta não se acumulam: propõe só o mais recente', () => {
    expect(iso(dueOccurrence(d('2026-08-23'), 'monthly', 23, d('2026-11-21')))).toBe('2026-11-23')
    expect(iso(dueOccurrence(d('2026-08-23'), 'monthly', 23, d('2026-11-10')))).toBe('2026-10-23')
  })
})

describe('suggestedDate', () => {
  it('hoje se for antes da data prevista; a prevista se já passou', () => {
    expect(iso(suggestedDate(d('2026-11-23'), new Date('2026-11-21T15:00:00Z')))).toBe('2026-11-21')
    expect(iso(suggestedDate(d('2026-11-23'), d('2026-11-25')))).toBe('2026-11-23')
  })
})
