import { FxCache, User } from '../models'
import { logEvent } from './logger'

// Fase 10 — moeda de apresentação. Todos os valores estão guardados em euros;
// o utilizador escolhe a moeda em que os vê, convertida ao câmbio do DIA
// (decisão do utilizador, context/features/10-FASE-10-moeda-de-apresentacao.md).
//
// Câmbio e lista de moedas vêm da Twelve Data (mesma chave da Fase 3/7) e
// ficam em cache na coleção FxCache — um pedido por moeda por dia, partilhado
// por todos os utilizadores. Se o fornecedor falhar, usa-se a última taxa
// conhecida; sem nenhuma, a app mostra euros (nunca parte por causa disto).

const BASE = 'EUR'
const API = () => process.env.TWELVE_DATA_API_BASE_URL || 'https://api.twelvedata.com'
const ISO_CODE = /^[A-Z]{3}$/

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function apiKey(): string {
  return String(useRuntimeConfig().twelveDataApiKey || '')
}

async function cached<T>(id: string): Promise<{ value: T; fresh: boolean } | null> {
  const doc = await FxCache.findById(id).lean()
  if (!doc) return null
  return { value: doc.value as T, fresh: doc.day === today() }
}

async function store(id: string, value: unknown): Promise<void> {
  await FxCache.updateOne({ _id: id }, { $set: { value, day: today() } }, { upsert: true })
}

// Moedas suportadas: as que a Twelve Data tem a partir do euro (121 em
// 2026-10-01), mais o próprio euro.
export async function getSupportedCurrencies(): Promise<string[]> {
  const hit = await cached<string[]>('currencies')
  if (hit?.fresh) return hit.value

  const key = apiKey()
  if (key) {
    try {
      const res = await fetch(`${API()}/forex_pairs?currency_base=${BASE}&apikey=${encodeURIComponent(key)}`)
      // O código vem em `symbol` ("EUR/USD"); `currency_quote` é o NOME da
      // moeda ("US Dollar") — usá-lo deixava a lista só com o euro (1.º deploy
      // da Fase 10, 2026-10-01).
      const data = (await res.json()) as { data?: { symbol?: string }[]; message?: string }
      const codes = new Set<string>([BASE])
      for (const pair of data.data || []) {
        const code = (pair.symbol?.split('/')[1] || '').toUpperCase()
        if (ISO_CODE.test(code)) codes.add(code)
      }
      if (codes.size > 1) {
        const list = [...codes].sort()
        await store('currencies', list)
        return list
      }
      logEvent('warn', 'fx.currencies_empty', { status: res.status, message: String(data.message || '').slice(0, 200) })
    } catch (e: any) {
      logEvent('warn', 'fx.currencies_fetch_failed', { message: String(e?.message || e).slice(0, 200) })
    }
  }
  return hit?.value || [BASE]
}

export interface DisplayRate {
  currency: string
  // Quantas unidades de `currency` vale 1 euro.
  rate: number
  // Dia da taxa (AAAA-MM-DD); null quando se caiu para euros.
  day: string | null
  // A taxa não é de hoje (fornecedor em baixo) — a UI pode avisar.
  stale: boolean
}

export async function getEurRate(currency: string): Promise<DisplayRate> {
  const code = currency.toUpperCase()
  if (code === BASE) return { currency: BASE, rate: 1, day: today(), stale: false }

  const id = `rate:${code}`
  const hit = await cached<number>(id)
  if (hit?.fresh) return { currency: code, rate: hit.value, day: today(), stale: false }

  const key = apiKey()
  if (key) {
    try {
      const res = await fetch(`${API()}/exchange_rate?symbol=${BASE}/${code}&apikey=${encodeURIComponent(key)}`)
      const data = (await res.json()) as { rate?: number }
      if (typeof data.rate === 'number' && Number.isFinite(data.rate) && data.rate > 0) {
        await store(id, data.rate)
        return { currency: code, rate: data.rate, day: today(), stale: false }
      }
      logEvent('warn', 'fx.rate_invalid', { currency: code })
    } catch (e: any) {
      logEvent('warn', 'fx.rate_fetch_failed', { currency: code, message: String(e?.message || e).slice(0, 200) })
    }
  }

  if (hit) {
    const doc = await FxCache.findById(id).select('day').lean()
    return { currency: code, rate: hit.value, day: doc?.day || null, stale: true }
  }
  // Nunca houve taxa para esta moeda: mostra euros em vez de inventar.
  return { currency: BASE, rate: 1, day: null, stale: true }
}

export async function getUserDisplayCurrency(userId: string): Promise<string> {
  const user = await User.findById(userId).select('displayCurrency').lean<{ displayCurrency?: string }>()
  return user?.displayCurrency || BASE
}
