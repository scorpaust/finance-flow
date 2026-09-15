// Fonte única da matriz de features por plano (ver context/00-CODE-SPEC.md secção 3).
// Usado tanto no client (useSubscription) como no server (requireFeature) — nunca duplicar.

export type SubscriptionTier = 'free' | 'pro' | 'premium'

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = ['free', 'pro', 'premium']

export const TIER_PRICE_EUR: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 5.0,
  premium: 12.99,
}

export const TIER_LABEL: Record<SubscriptionTier, string> = {
  free: 'Gratuito',
  pro: 'Pro',
  premium: 'Premium',
}

export type FeatureKey =
  | 'groups'
  | 'statsAdvanced'
  | 'csvExport'
  | 'predictions'
  | 'prioritySupport'

// Tier mínimo que desbloqueia cada feature.
const FEATURE_MATRIX: Record<FeatureKey, SubscriptionTier> = {
  groups: 'pro',
  statsAdvanced: 'pro',
  csvExport: 'pro',
  predictions: 'premium',
  prioritySupport: 'premium',
}

const TIER_RANK: Record<SubscriptionTier, number> = { free: 0, pro: 1, premium: 2 }

export function hasFeature(tier: SubscriptionTier, feature: FeatureKey): boolean {
  return TIER_RANK[tier] >= TIER_RANK[FEATURE_MATRIX[feature]]
}

export function requiredTierFor(feature: FeatureKey): SubscriptionTier {
  return FEATURE_MATRIX[feature]
}

// Limites numéricos (null = ilimitado) — não são on/off como hasFeature, por isso
// vivem à parte da FEATURE_MATRIX.
export interface TierLimits {
  transactionsPerMonth: number | null
  customCategories: number | null
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: { transactionsPerMonth: 50, customCategories: 2 },
  pro: { transactionsPerMonth: null, customCategories: null },
  premium: { transactionsPerMonth: null, customCategories: null },
}
