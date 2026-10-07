import { TIER_PRICE_EUR } from '../../shared/features'
import { PLAY_MONTHLY_BASE_PLAN, PLAY_PREPAID_PERIODS, PLAY_PRODUCT_IDS, prepaidBasePlanId, type PaidTier, type PlayPrepaidPeriod } from '../../shared/playBilling'
import { isPlayConfigured, playFetch } from './googlePlay'
import { logEvent } from './logger'

// Preços: a Play Console é a ÚNICA fonte (reportado a 2026-10-07 — a Play
// mostrava 8,49 €/21,99 € e o site 7 €/18 €; a Google exige o mesmo preço em
// todo o lado). O servidor lê na Google Play Developer API o preço de
// PORTUGAL de cada base plan (o que a Google cobra a um cliente em Portugal,
// IVA incluído) e o site mostra e cobra (EasyPay) exatamente esse valor.
// Mudar um preço = mudá-lo na Play Console; o site acompanha em minutos.
// Sem acesso à Google (não configurado, erro), usa o último valor lido ou,
// em último caso, TIER_PRICE_EUR.

export type TierPrices = { monthly: number; prepaid: Record<PlayPrepaidPeriod, number> }
export type PlanPrices = Record<PaidTier, TierPrices>

const REGION = 'PT'
const TTL_MS = 10 * 60 * 1000

// Cópia dos preços da Play Console em 2026-10-07 (Portugal, IVA incluído):
// pré-pagos com desconto, 12 meses = 10 meses. Só para quando a Google não
// responde — mudar um preço é na Play Console, não aqui.
const FALLBACK_PREPAID: Record<PaidTier, Record<PlayPrepaidPeriod, number>> = {
  pro: { 1: 8.49, 3: 23.99, 6: 45.99, 12: 84.99 },
  premium: { 1: 21.99, 3: 59.99, 6: 114.99, 12: 219.99 },
}

function fallbackPrices(): PlanPrices {
  const tier = (t: PaidTier): TierPrices => ({ monthly: TIER_PRICE_EUR[t], prepaid: { ...FALLBACK_PREPAID[t] } })
  return { pro: tier('pro'), premium: tier('premium') }
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}

interface Money {
  currencyCode?: string
  units?: string
  nanos?: number
}
interface PlaySubscriptionProduct {
  basePlans?: { basePlanId?: string; state?: string; regionalConfigs?: { regionCode?: string; price?: Money }[] }[]
}

function eurAmount(price: Money | undefined): number | null {
  if (!price || price.currencyCode !== 'EUR') return null
  return round(Number(price.units || 0) + (price.nanos || 0) / 1e9)
}

async function readTier(tier: PaidTier): Promise<TierPrices | null> {
  const product = await playFetch<PlaySubscriptionProduct>(`/subscriptions/${encodeURIComponent(PLAY_PRODUCT_IDS[tier])}`)
  const priceOf = (basePlanId: string) => {
    const plan = product.basePlans?.find((b) => b.basePlanId === basePlanId)
    return eurAmount(plan?.regionalConfigs?.find((r) => r.regionCode === REGION)?.price)
  }
  const monthly = priceOf(PLAY_MONTHLY_BASE_PLAN)
  if (monthly === null) return null
  const prepaid = Object.fromEntries(
    PLAY_PREPAID_PERIODS.map((m) => [m, priceOf(prepaidBasePlanId(m)) ?? round(monthly * m)])
  ) as Record<PlayPrepaidPeriod, number>
  return { monthly, prepaid }
}

let cache: { prices: PlanPrices; expiresAt: number } | null = null

export async function getPlanPrices(): Promise<{ prices: PlanPrices; source: 'google_play' | 'cache' | 'fallback' }> {
  if (cache && cache.expiresAt > Date.now()) return { prices: cache.prices, source: 'cache' }
  if (isPlayConfigured()) {
    try {
      const [pro, premium] = await Promise.all([readTier('pro'), readTier('premium')])
      if (pro && premium) {
        cache = { prices: { pro, premium }, expiresAt: Date.now() + TTL_MS }
        return { prices: cache.prices, source: 'google_play' }
      }
      logEvent('error', 'google_play.prices_missing', { region: REGION })
    } catch (e: any) {
      logEvent('error', 'google_play.prices_failed', { message: String(e?.message || e).slice(0, 200) })
    }
  }
  // Último preço lido da Google (mesmo expirado) antes do valor fixo.
  if (cache) return { prices: cache.prices, source: 'cache' }
  return { prices: fallbackPrices(), source: 'fallback' }
}
