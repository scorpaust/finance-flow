// Upgrade 04, parte A — funções puras das previsões (sem TF.js nem Vue), usadas
// pelo servidor (/api/predictions/data, orçamento sugerido) e pelo client
// (composables/useMLPrediction.ts). Ver
// context/features/upgrades/04-orcamento-ia-e-previsoes.md.

// Um só mínimo, dito da mesma forma em todo o lado (antes a página dizia 3
// meses, o aviso 2 e o modelo precisava de 5). Meses COMPLETOS: o mês atual
// nunca conta.
export const PREDICTION_MIN_MONTHS = {
  // Previsão simples (tendência ou média).
  simple: 2,
  // Modelo de IA (ConvNeXt-1D): janela de 3 meses + 2 exemplos de treino.
  model: 5,
} as const

// Fuso do servidor para "mês civil" (o mesmo de shared/easypayDate.ts): em
// produção o servidor corre em UTC, e às 00:30 de dia 1 em Lisboa ainda seria
// o mês anterior.
export const APP_TIME_ZONE = 'Europe/Lisbon'

// 'YYYY-MM' do mês em curso no fuso da app.
export function currentMonthKey(now: Date = new Date(), timeZone: string = APP_TIME_ZONE): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone, year: 'numeric', month: '2-digit' })
      .formatToParts(now)
      .map((p) => [p.type, p.value])
  )
  return `${parts.year}-${parts.month}`
}

// Soma `n` meses a uma chave 'YYYY-MM' (n pode ser negativo).
export function addMonths(monthKey: string, n: number): string {
  const [y, m] = monthKey.split('-').map(Number)
  const total = y * 12 + (m - 1) + n
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`
}

export interface MonthlyPoint {
  month: string
  income: number
  expense: number
  balance: number
}

// Separa os meses completos do mês em curso. Meses futuros (transações
// agendadas com data à frente) também ficam de fora.
export function splitCompleteMonths<T extends { month: string }>(
  series: T[],
  currentMonth: string
): { complete: T[]; current: T | null } {
  const sorted = [...series].sort((a, b) => a.month.localeCompare(b.month))
  return {
    complete: sorted.filter((m) => m.month < currentMonth),
    current: sorted.find((m) => m.month === currentMonth) || null,
  }
}

// Reta de mínimos quadrados: inclinação por mês e valor no primeiro ponto (x = 0).
export function linearRegression(values: number[]): { slope: number; intercept: number } {
  const n = values.length
  if (n === 0) return { slope: 0, intercept: 0 }
  if (n === 1) return { slope: 0, intercept: values[0] }
  const xMean = (n - 1) / 2
  const yMean = values.reduce((s, v) => s + v, 0) / n
  let num = 0
  let den = 0
  values.forEach((v, i) => {
    num += (i - xMean) * (v - yMean)
    den += (i - xMean) ** 2
  })
  const slope = den === 0 ? 0 : num / den
  return { slope, intercept: yMean - slope * xMean }
}

// Abaixo disto (variação por mês relativa à média) não há tendência: usa-se a
// média. O mesmo limiar que o resto da página usa para "estável".
export const TREND_THRESHOLD = 0.04

export interface SeriesForecast {
  method: 'trend' | 'average'
  values: number[]
}

// Previsão simples de uma série (receitas ou despesas): regressão linear sobre
// os meses completos, limitada — nunca valores negativos, e cada mês projetado
// não se afasta do anterior mais do que a maior variação de um mês para o
// outro vista no histórico. Sem tendência, a média dos últimos 3 meses.
export function forecastSeries(values: number[], n: number): SeriesForecast {
  if (!values.length) return { method: 'average', values: Array(n).fill(0) }
  const recent = values.slice(-3)
  const average = recent.reduce((s, v) => s + v, 0) / recent.length
  const mean = values.reduce((s, v) => s + v, 0) / values.length
  const { slope, intercept } = linearRegression(values)

  if (values.length < 2 || mean === 0 || Math.abs(slope / mean) < TREND_THRESHOLD) {
    return { method: 'average', values: Array(n).fill(Math.max(0, average)) }
  }

  let maxStep = 0
  for (let i = 1; i < values.length; i++) maxStep = Math.max(maxStep, Math.abs(values[i] - values[i - 1]))

  const out: number[] = []
  let previous = values[values.length - 1]
  for (let i = 0; i < n; i++) {
    const raw = intercept + slope * (values.length + i)
    const bounded = Math.min(previous + maxStep, Math.max(previous - maxStep, raw))
    const value = Math.max(0, bounded)
    out.push(value)
    previous = value
  }
  return { method: 'trend', values: out }
}
