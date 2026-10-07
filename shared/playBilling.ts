import type { SubscriptionTier } from './features'

// Upgrade 01 — Google Play Billing na app Android
// (context/features/upgrades/01-google-play-billing-android.md). Os ids têm
// de bater certo com os produtos criados na Play Console (Monetizar →
// Subscrições). A oferta é a mesma da web: mensal com renovação automática
// (como cartão/débito direto) e pré-pagos de 1/3/6/12 meses (como MB WAY/
// Multibanco), aos mesmos preços (TIER_PRICE_EUR).

export type PaidTier = Exclude<SubscriptionTier, 'free'>

export const PLAY_PRODUCT_IDS: Record<PaidTier, string> = { pro: 'pro', premium: 'premium' }

export const PLAY_MONTHLY_BASE_PLAN = 'mensal'
export const PLAY_PREPAID_PERIODS = [1, 3, 6, 12] as const
export type PlayPrepaidPeriod = (typeof PLAY_PREPAID_PERIODS)[number]

export function prepaidBasePlanId(months: PlayPrepaidPeriod): string {
  return `prepago-${months}m`
}

export function tierForPlayProduct(productId: string | null | undefined): PaidTier | null {
  if (productId === PLAY_PRODUCT_IDS.pro) return 'pro'
  if (productId === PLAY_PRODUCT_IDS.premium) return 'premium'
  return null
}

const TIER_RANK: Record<PaidTier, number> = { pro: 1, premium: 2 }

// Modos de substituição da Play Billing Library (decisão 6 da especificação).
// Pré-pagos só aceitam CHARGE_FULL_PRICE (regra da Google).
export type PlayReplacementMode = 'CHARGE_PRORATED_PRICE' | 'DEFERRED' | 'CHARGE_FULL_PRICE'

export function playReplacementMode(from: { tier: PaidTier; autoRenew: boolean }, to: { tier: PaidTier; autoRenew: boolean }): PlayReplacementMode {
  if (!from.autoRenew || !to.autoRenew) return 'CHARGE_FULL_PRICE'
  return TIER_RANK[to.tier] > TIER_RANK[from.tier] ? 'CHARGE_PRORATED_PRICE' : 'DEFERRED'
}

// Página "Subscrições" da Play Store para esta app (gerir/cancelar).
export function playManageUrl(packageName: string, productId?: string | null): string {
  const sku = productId ? `sku=${encodeURIComponent(productId)}&` : ''
  return `https://play.google.com/store/account/subscriptions?${sku}package=${encodeURIComponent(packageName)}`
}

export const PLAY_PACKAGE_NAME = 'com.dinismcosta.financeflow'
