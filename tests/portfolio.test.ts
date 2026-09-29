import { describe, expect, it } from 'vitest'
import { gainAmount, investedAmount, isValuationStale, returnPct, roundMoney, summarizePortfolio } from '../shared/portfolio'

const NOW = new Date('2026-09-24T12:00:00Z')

describe('cálculo de um investimento', () => {
  it('investido = inicial + reforço', () => {
    expect(investedAmount({ initialAmount: 1000, reinforcement: 250 })).toBe(1250)
  })

  it('ganho e rentabilidade sobre o capital investido', () => {
    const p = { initialAmount: 1000, reinforcement: 0, currentValue: 1019.4 }
    expect(gainAmount(p)).toBe(19.4)
    expect(returnPct(p)).toBeCloseTo(1.94, 5)
  })

  it('perda dá percentagem negativa (-2,00%)', () => {
    expect(returnPct({ initialAmount: 1000, reinforcement: 0, currentValue: 980 })).toBeCloseTo(-2, 5)
  })

  it('sem capital investido a rentabilidade é null (a UI mostra "—")', () => {
    expect(returnPct({ initialAmount: 0, reinforcement: 0, currentValue: 100 })).toBeNull()
  })

  it('roundMoney evita erros de vírgula flutuante', () => {
    expect(roundMoney(0.1 + 0.2)).toBe(0.3)
    expect(roundMoney(1.005)).toBe(1.01)
  })
})

describe('resumo do portfolio', () => {
  const at = '2026-09-20T00:00:00Z'
  const positions = [
    { initialAmount: 1000, reinforcement: 0, currentValue: 1019.4, assetClass: 'etf' as const, valueUpdatedAt: at },
    { initialAmount: 500, reinforcement: 0, currentValue: 490, assetClass: 'acao' as const, valueUpdatedAt: '2026-06-01T00:00:00Z' },
  ]

  it('retorno agregado sobre os TOTAIS, não média das percentagens', () => {
    const s = summarizePortfolio(positions, NOW)
    expect(s.totalInvested).toBe(1500)
    expect(s.totalValue).toBe(1509.4)
    expect(s.gain).toBe(9.4)
    expect(s.returnPct).toBeCloseTo((9.4 / 1500) * 100, 5)
  })

  it('pesos por classe somam 100% e ordenam do maior para o menor', () => {
    const s = summarizePortfolio(positions, NOW)
    expect(s.allocation.reduce((sum, a) => sum + a.weightPct, 0)).toBeCloseTo(100, 5)
    expect(s.allocation[0].assetClass).toBe('etf')
    expect(s.oldestValuationDays).toBeGreaterThan(30)
  })

  it('portfolio vazio não rebenta', () => {
    const s = summarizePortfolio([], NOW)
    expect(s.positions).toBe(0)
    expect(s.returnPct).toBeNull()
    expect(s.allocation).toEqual([])
    expect(s.oldestValuationDays).toBeNull()
  })

  it('valorização desatualizada passados 30 dias', () => {
    expect(isValuationStale('2026-09-20T00:00:00Z', NOW)).toBe(false)
    expect(isValuationStale('2026-06-01T00:00:00Z', NOW)).toBe(true)
  })
})
