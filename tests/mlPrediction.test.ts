import { describe, expect, it } from 'vitest'
import { useMLPrediction } from '../composables/useMLPrediction'

// Fase 8, ponto 6 — "lógica de previsão (partes não-TF)": predictNextMonths()
// cai sempre para o caminho simpleForecast() em ambiente sem `window` (o caso
// do Vitest em Node), nunca chegando a importar '@tensorflow/tfjs' — exatamente
// o mesmo caminho usado no browser quando há menos de 5 meses completos.
// Upgrade 04 — a previsão simples segue a tendência (shared/forecast.ts), diz o
// método por chave traduzível e não inventa percentagem de confiança.
function series(months: Array<{ income: number; expense: number }>) {
  return months.map((m, i) => ({
    month: `2026-${String(i + 1).padStart(2, '0')}`,
    income: m.income,
    expense: m.expense,
    balance: m.income - m.expense,
  }))
}

describe('useMLPrediction — previsão simples sem TF.js', () => {
  it('meses iguais: média, método "average", sem confiança', async () => {
    const { predictNextMonths } = useMLPrediction()
    const data = series([
      { income: 2000, expense: 1500 },
      { income: 2000, expense: 1500 },
      { income: 2000, expense: 1500 },
    ])
    const result = await predictNextMonths(data, 2)
    expect(result.modelType).toBe('average')
    expect(result.confidence).toBeNull()
    expect(result.completeMonths).toBe(3)
    expect(result.forecasts).toHaveLength(2)
    expect(result.forecasts[0].income.value).toBeCloseTo(2000)
    expect(result.forecasts[0].expense.value).toBeCloseTo(1500)
    expect(result.forecasts[0].balance).toBeCloseTo(500)
  })

  it('REGRESSÃO (tester-premium): despesas a subir não dão 3 meses iguais', async () => {
    const { predictNextMonths } = useMLPrediction()
    const data = series([
      { income: 2000, expense: 1000 },
      { income: 2000, expense: 1100 },
      { income: 2000, expense: 1200 },
      { income: 2000, expense: 1300 },
    ])
    const result = await predictNextMonths(data, 3)
    expect(result.modelType).toBe('trend')
    expect(result.trend.expense).toBe('up')
    expect(result.trend.income).toBe('stable')
    const expenses = result.forecasts.map((f) => f.expense.value)
    expect(expenses[1]).toBeGreaterThan(expenses[0])
    expect(expenses[2]).toBeGreaterThan(expenses[1])
  })

  it('gera meses consecutivos a partir do último mês completo', async () => {
    const { predictNextMonths } = useMLPrediction()
    const data = series([{ income: 1000, expense: 800 }, { income: 1000, expense: 800 }])
    const result = await predictNextMonths(data, 3)
    expect(result.forecasts.map((f) => f.month)).toEqual(['2026-03', '2026-04', '2026-05'])
  })

  it('sem histórico, não rebenta (zeros)', async () => {
    const { predictNextMonths } = useMLPrediction()
    const result = await predictNextMonths([], 2)
    expect(result.forecasts).toHaveLength(2)
    expect(result.forecasts[0].income.value).toBe(0)
    expect(result.forecasts[0].expense.value).toBe(0)
  })
})
