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
  | 'aiStatsInsights'
  | 'aiInvestmentTips'
  | 'documentScan'
  | 'investmentTracker'

// Tier mínimo que desbloqueia cada feature.
const FEATURE_MATRIX: Record<FeatureKey, SubscriptionTier> = {
  groups: 'pro',
  statsAdvanced: 'pro',
  csvExport: 'pro',
  predictions: 'premium',
  prioritySupport: 'premium',
  // Fase 3 — split explícito do dono do produto (ver context/features/03-FASE-3-insights-ia.md):
  // interpretação de estatísticas é Pro+, dicas de investimento ficam exclusivas Premium.
  aiStatsInsights: 'pro',
  aiInvestmentTips: 'premium',
  // Fase 5 — digitalização de recibos/faturas com IA, Pro e Premium (decisão do
  // utilizador de 2026-09-19, ver context/features/05-FASE-5-scan-documentos-ia.md).
  documentScan: 'pro',
  // Fase 6 — registo de investimentos (portfolio pessoal), Premium por omissão
  // (a confirmar, ver context/features/06-FASE-6-registo-investimentos.md): a
  // zona de investimentos já é Premium, e baixar o plano mais tarde é gratuito
  // enquanto subi-lo com utilizadores já a ter dados registados não é.
  // Chave própria, separada de aiInvestmentTips, para os dois poderem divergir.
  investmentTracker: 'premium',
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
  // Teto mensal contra abuso do scan de documentos (Fase 5) — o custo por
  // documento é residual, mas cada um é uma chamada paga à Anthropic. Free = 0
  // porque a feature está bloqueada (documentScan é 'pro').
  documentScansPerMonth: number
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: { transactionsPerMonth: 50, customCategories: 2, documentScansPerMonth: 0 },
  pro: { transactionsPerMonth: null, customCategories: null, documentScansPerMonth: 30 },
  premium: { transactionsPerMonth: null, customCategories: null, documentScansPerMonth: 100 },
}
