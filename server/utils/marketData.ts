// Wrapper fino sobre a Quote API da Twelve Data (plano gratuito: 800 pedidos/
// dia, atraso de 4h — irrelevante aqui porque não é preciso preço em tempo
// real). Chamado só pelo job diário de MarketSnapshot
// (server/api/insights/market-snapshot.post.ts), nunca por utilizador/pedido.
// Só índices/mercados globais principais, nunca ações individuais. Ver
// context/features/03-FASE-3-insights-ia.md tarefa 1. Requer
// TWELVE_DATA_API_KEY em runtimeConfig.
//
// Parâmetros confirmados via Context7 (Twelve Data OpenAPI spec): endpoint
// GET /quote, símbolos separados por vírgula num único pedido — resposta
// passa a ser um objeto chaveado por símbolo em vez de um único quote.

const TWELVE_DATA_API_URL = 'https://api.twelvedata.com/quote'

// Índices globais principais como contexto geral de mercado, não recomendação
// de ativos específicos. Os símbolos "puros" de índice (ex. SPX, IXIC,
// STOXX50E, PSI20) exigem um plano pago da Twelve Data — confirmado em
// sandbox real (403/404 no plano gratuito). Usamos em vez disso os ETFs mais
// líquidos que replicam cada índice (disponíveis no plano gratuito),
// exibidos ao utilizador pelo nome do índice subjacente, não do ETF.
const TRACKED_INDICES: { symbol: string; name: string }[] = [
  { symbol: 'SPY', name: 'S&P 500' },
  { symbol: 'QQQ', name: 'Nasdaq 100' },
  { symbol: 'DIA', name: 'Dow Jones' },
  { symbol: 'VGK', name: 'Europa (FTSE Europe)' },
]

interface TwelveDataQuote {
  symbol: string
  close: string
  percent_change: string
}

export interface MarketIndexQuote {
  symbol: string
  name: string
  price: number
  changePercent: number
}

export async function fetchMarketSnapshot(): Promise<MarketIndexQuote[]> {
  const config = useRuntimeConfig()
  if (!config.twelveDataApiKey) {
    throw createError({
      statusCode: 500,
      message: 'Twelve Data não configurado (TWELVE_DATA_API_KEY em falta)',
    })
  }

  const symbols = TRACKED_INDICES.map((i) => i.symbol).join(',')
  const url = `${TWELVE_DATA_API_URL}?symbol=${encodeURIComponent(symbols)}&apikey=${config.twelveDataApiKey}`
  const res = await fetch(url)

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw createError({ statusCode: 502, message: `Erro Twelve Data (${res.status}): ${detail.slice(0, 500)}` })
  }

  const data = (await res.json()) as Record<string, TwelveDataQuote> | TwelveDataQuote

  // Um único símbolo devolve o quote diretamente; vários símbolos devolvem um
  // objeto chaveado por símbolo.
  const quotesBySymbol: Record<string, TwelveDataQuote> =
    'symbol' in data ? { [data.symbol]: data } : data

  return TRACKED_INDICES.map((tracked) => {
    const quote = quotesBySymbol[tracked.symbol]
    return {
      symbol: tracked.symbol,
      name: tracked.name,
      price: quote ? parseFloat(quote.close) : 0,
      changePercent: quote ? parseFloat(quote.percent_change) : 0,
    }
  })
}
