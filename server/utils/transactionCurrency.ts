import { getExchangeRateToEur } from './exchangeRates'

export interface ResolvedTransactionAmount {
  amount:         number       // sempre em EUR — usado por todas as agregações existentes
  currency:       string
  originalAmount: number | null
  exchangeRate:   number | null
}

// Fase 7, tarefa 6 — quando `currency` não é EUR, `rawAmount` é o valor no
// documento/formulário NESSA moeda (nunca em €); esta função obtém a taxa do
// dia e devolve o equivalente em EUR para `amount` (nunca grava a moeda
// estrangeira como se fosse €, nem assume uma taxa 1:1). Lança 422 se a taxa
// não puder ser obtida — o utilizador escolhe tentar de novo mais tarde ou
// preencher manualmente em €.
export async function resolveTransactionAmount(
  rawAmount: number,
  currency: string | undefined,
  date: string | Date
): Promise<ResolvedTransactionAmount> {
  const code = (currency || 'EUR').toUpperCase()

  if (code === 'EUR') {
    return { amount: rawAmount, currency: 'EUR', originalAmount: null, exchangeRate: null }
  }

  const isoDate = typeof date === 'string' ? date.slice(0, 10) : date.toISOString().slice(0, 10)
  const rate = await getExchangeRateToEur(code, isoDate)
  if (rate === null) {
    throw createError({
      statusCode: 422,
      message: `Não foi possível obter a taxa de câmbio de ${code} para EUR — tenta novamente ou indica o valor em €`,
      data: { error: 'exchange_rate_unavailable', currency: code },
    })
  }

  return {
    amount: Math.round(rawAmount * rate * 100) / 100,
    currency: code,
    originalAmount: rawAmount,
    exchangeRate: rate,
  }
}
