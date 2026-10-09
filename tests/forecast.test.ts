import { describe, expect, it } from 'vitest'
import {
  PREDICTION_MIN_MONTHS,
  addMonths,
  currentMonthKey,
  forecastSeries,
  linearRegression,
  splitCompleteMonths,
} from '../shared/forecast'

// Upgrade 04, parte A — funções puras das previsões.

describe('mês em curso (fuso de Lisboa)', () => {
  it('às 00:30 de 1 de outubro em Lisboa já é outubro, mesmo com o servidor em UTC', () => {
    // 23:30 UTC de 30 de setembro = 00:30 em Lisboa (hora de verão, UTC+1).
    expect(currentMonthKey(new Date('2026-09-30T23:30:00Z'))).toBe('2026-10')
    expect(currentMonthKey(new Date('2026-09-30T22:30:00Z'))).toBe('2026-09')
  })

  it('addMonths atravessa anos nos dois sentidos', () => {
    expect(addMonths('2026-11', 2)).toBe('2027-01')
    expect(addMonths('2026-01', -1)).toBe('2025-12')
    expect(addMonths('2026-10', -12)).toBe('2025-10')
  })
})

describe('meses completos', () => {
  const series = [
    { month: '2026-07', income: 1000, expense: 800, balance: 200 },
    { month: '2026-10', income: 1000, expense: 100, balance: 900 },
    { month: '2026-08', income: 1000, expense: 800, balance: 200 },
    { month: '2026-09', income: 1000, expense: 800, balance: 200 },
  ]

  it('o mês em curso fica de fora das contas e vem à parte', () => {
    const { complete, current } = splitCompleteMonths(series, '2026-10')
    expect(complete.map((m) => m.month)).toEqual(['2026-07', '2026-08', '2026-09'])
    expect(current?.expense).toBe(100)
  })

  it('meses futuros (transações com data à frente) também não contam', () => {
    const { complete, current } = splitCompleteMonths([...series, { month: '2026-11', income: 0, expense: 50, balance: -50 }], '2026-10')
    expect(complete).toHaveLength(3)
    expect(current?.month).toBe('2026-10')
  })

  it('um só mínimo: 2 meses para a previsão simples, 5 para o modelo de IA', () => {
    expect(PREDICTION_MIN_MONTHS).toEqual({ simple: 2, model: 5 })
  })
})

describe('previsão simples (tendência limitada)', () => {
  it('sem tendência usa a média dos últimos 3 meses', () => {
    const f = forecastSeries([1500, 1500, 1500, 1500], 3)
    expect(f.method).toBe('average')
    expect(f.values).toEqual([1500, 1500, 1500])
  })

  it('despesas a subir mês a mês: a previsão continua a subir (não é plana)', () => {
    const f = forecastSeries([1000, 1100, 1200, 1300], 3)
    expect(f.method).toBe('trend')
    expect(f.values[0]).toBeCloseTo(1400)
    expect(f.values[1]).toBeCloseTo(1500)
    expect(f.values[2]).toBeCloseTo(1600)
  })

  it('nunca projeta valores negativos', () => {
    const f = forecastSeries([900, 600, 300], 3)
    expect(f.method).toBe('trend')
    expect(Math.min(...f.values)).toBeGreaterThanOrEqual(0)
    expect(f.values[2]).toBe(0)
  })

  it('cada mês projetado não salta mais do que a maior variação do histórico', () => {
    // Um salto grande no fim inclina a reta, mas a maior variação vista é 500.
    const values = [1000, 1000, 1000, 1500]
    const f = forecastSeries(values, 3)
    let previous = values[values.length - 1]
    for (const v of f.values) {
      expect(Math.abs(v - previous)).toBeLessThanOrEqual(500 + 1e-9)
      previous = v
    }
  })

  it('variações pequenas (< 4% por mês) contam como estáveis', () => {
    expect(forecastSeries([1000, 1010, 1005, 1015], 2).method).toBe('average')
  })

  it('sem histórico devolve zeros', () => {
    expect(forecastSeries([], 2)).toEqual({ method: 'average', values: [0, 0] })
  })

  it('regressão linear: inclinação e valor inicial', () => {
    const { slope, intercept } = linearRegression([2, 4, 6])
    expect(slope).toBeCloseTo(2)
    expect(intercept).toBeCloseTo(2)
  })
})
