// Fase 7, tarefa 6 — câmbio para transações em moeda estrangeira. Decisão do
// utilizador (2026-09-22): a transação guarda o valor e a moeda ORIGINAIS
// (fidelidade ao documento) — este utilitário só calcula o equivalente em
// EUR usado internamente pelas agregações (KPIs, estatísticas, orçamentos de
// grupo, previsões), que continuam a somar um único valor em € como sempre
// fizeram (ver server/models/index.ts, `ITransaction.amount`/`exchangeRate`).
//
// Fonte: Twelve Data `/exchange_rate` (mesma chave TWELVE_DATA_API_KEY da
// Fase 3 — server/utils/marketData.ts). Parâmetros confirmados via Context7
// (OpenAPI spec da Twelve Data). NÃO CONFIRMADO em sandbox real nesta sessão
// se o plano gratuito cobre pares forex (só índices/ETFs foram testados na
// Fase 3) — por validar antes de depender disto em produção.
const TWELVE_DATA_EXCHANGE_RATE_URL = 'https://api.twelvedata.com/exchange_rate'

interface TwelveDataExchangeRate {
  symbol: string
  rate: number
  timestamp: number
}

// Devolve a taxa FROM→EUR (quantos EUR vale 1 unidade de `from`) na data
// indicada, ou `null` se `from` já for EUR, a chave não estiver configurada,
// ou o pedido falhar — o chamador trata `null` como "não foi possível
// converter agora", nunca assume 1:1.
export async function getExchangeRateToEur(from: string, date?: string): Promise<number | null> {
  const currency = from.toUpperCase()
  if (currency === 'EUR') return 1

  const config = useRuntimeConfig()
  if (!config.twelveDataApiKey) return null

  try {
    const params = new URLSearchParams({ symbol: `${currency}/EUR`, apikey: config.twelveDataApiKey })
    if (date) params.set('date', date)

    const res = await fetch(`${TWELVE_DATA_EXCHANGE_RATE_URL}?${params.toString()}`)
    if (!res.ok) return null

    const data = (await res.json()) as TwelveDataExchangeRate | { code: number; message: string }
    if (!('rate' in data) || typeof data.rate !== 'number' || !Number.isFinite(data.rate)) return null

    return data.rate
  } catch (error) {
    console.error('[exchangeRates] falha a obter taxa', currency, '→ EUR:', error)
    return null
  }
}
