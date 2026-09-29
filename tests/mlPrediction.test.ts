import { describe, expect, it } from 'vitest'
import { useMLPrediction } from '../composables/useMLPrediction'

// Fase 8, ponto 6 — "lógica de previsão (partes não-TF)": predictNextMonths()
// cai sempre para o caminho simpleForecast() em ambiente sem `window` (o caso
// do Vitest em Node), nunca chegando a importar '@tensorflow/tfjs' — exatamente
// o mesmo caminho usado no browser quando a série é curta demais para treinar.
function series(months: Array<{ income: number; expense: number }>) {
  return months.map((m, i) => ({
    month: `2026-${String(i + 1).padStart(2, '0')}`,
    income: m.income,
    expense: m.expense,
    balance: m.income - m.expense,
  }))
}

describe('useMLPrediction — fallback sem TF.js (simpleForecast)', () => {
  it('usa a média dos últimos 3 meses e assinala o modelo como fallback', async () => {
    const { predictNextMonths } = useMLPrediction()
    const data = series([
      { income: 2000, expense: 1500 },
      { income: 2000, expense: 1500 },
      { income: 2000, expense: 1500 },
    ])
    const result = await predictNextMonths(data, 2)
    expect(result.modelType).toBe('LinearAverage (fallback)')
    expect(result.forecasts).toHaveLength(2)
    expect(result.forecasts[0].income.value).toBeCloseTo(2000)
    expect(result.forecasts[0].expense.value).toBeCloseTo(1500)
    expect(result.forecasts[0].balance).toBeCloseTo(500)
  })

  it('gera meses consecutivos a partir do último mês da série', async () => {
    const { predictNextMonths } = useMLPrediction()
    const data = series([{ income: 1000, expense: 800 }, { income: 1000, expense: 800 }])
    const result = await predictNextMonths(data, 3)
    expect(result.forecasts.map((f) => f.month)).toEqual(['2026-03', '2026-04', '2026-05'])
  })

  it('a tendência é sempre "stable" e a confiança fixa no fallback (0.58)', async () => {
    const { predictNextMonths } = useMLPrediction()
    const data = series([{ income: 500, expense: 5000 }, { income: 500, expense: 5000 }])
    const result = await predictNextMonths(data, 1)
    expect(result.trend).toEqual({ income: 'stable', expense: 'stable' })
    expect(result.confidence).toBe(0.58)
  })

  it('sem histórico suficiente, não rebenta (usa o que houver, mesmo vazio)', async () => {
    const { predictNextMonths } = useMLPrediction()
    const result = await predictNextMonths([], 2)
    expect(result.forecasts).toHaveLength(2)
    expect(result.forecasts[0].income.value).toBe(0)
    expect(result.forecasts[0].expense.value).toBe(0)
  })
})
