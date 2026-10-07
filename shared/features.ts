// Fonte única da matriz de features por plano (ver context/00-CODE-SPEC.md secção 3).
// Usado tanto no client (useSubscription) como no server (requireFeature) — nunca duplicar.

export type SubscriptionTier = 'free' | 'pro' | 'premium'

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = ['free', 'pro', 'premium']

// Só um RECURSO: os preços reais vêm da Play Console (preço de Portugal, IVA
// incluído — server/utils/playPrices.ts). Usado se a Google não responder.
// Decisão do utilizador (2026-10-07): Pro 8 €, Premium 18 €.
export const TIER_PRICE_EUR: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 8,
  premium: 18,
}

// Nomes dos planos: traduzidos em i18n (`tiers.free|pro|premium`) — antes
// havia aqui um TIER_LABEL fixo em português, que aparecia ("Gratuito") na
// versão inglesa.

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

// Fase 8, ponto 5 — o plano que o utilizador REALMENTE pode usar agora. Antes,
// o servidor lia só `subscription.tier`, e `syncSinglePayment` grava o `tier`
// logo ao criar uma referência Multibanco/MB WAY ainda por pagar
// (`status: 'pending'`) — quem criasse a referência e não pagasse ficava com
// acesso completo. Regras:
//  - `active`: o tier, exceto pré-pagos (MB WAY/Multibanco) já fora do período
//    pago — o cron de expiração não corre em nenhum lado por agora, por isso a
//    data tem de ser verificada aqui, em tempo real. Auto-renovação (CC/DD)
//    confia no `status` (a renovação estende o período fora deste controlo).
//  - `canceled`/`past_due`: mantém o tier só até ao fim do período pago.
//  - `pending`/`expired`/qualquer outro: gratuito.
export interface SubscriptionLike {
  tier?: SubscriptionTier
  status?: string
  billingMode?: string
  currentPeriodEnd?: Date | string | null
}

export function effectiveTier(sub: SubscriptionLike | null | undefined, now: Date = new Date()): SubscriptionTier {
  if (!sub?.tier || sub.tier === 'free') return 'free'
  const end = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).getTime() : null
  const stillPaid = end !== null && end > now.getTime()
  // Upgrade 01 — Google Play: o fim do período é o `expiryTime` da Google
  // (renovações estendem-no por notificação ou reconciliação), por isso a data
  // manda sempre, como nos pré-pagos.
  const dateBound = sub.billingMode === 'push_confirm' || sub.billingMode === 'manual_reference' || sub.billingMode === 'google_play'

  if (sub.status === 'active') return dateBound && !stillPaid ? 'free' : sub.tier
  if (sub.status === 'canceled' || sub.status === 'past_due') return stillPaid ? sub.tier : 'free'
  return 'free'
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

// Destaques de cada plano na página de subscrição (texto em i18n:
// `planHighlights.<id>`). Gerados a partir da matriz e dos limites acima: cada
// FeatureKey tem de aparecer no plano mínimo que a desbloqueia — teste em
// tests/features.test.ts. Antes, a lista era texto solto e ficou para trás
// (faltavam o registo e as dicas de investimento no Premium, o scan e a IA
// das estatísticas no Pro).
export interface PlanHighlight {
  id: string
  features?: FeatureKey[]
  params?: Record<string, number>
}

export const PLAN_HIGHLIGHTS: Record<SubscriptionTier, PlanHighlight[]> = {
  free: [
    { id: 'dashboard' },
    { id: 'transactionsLimit', params: { n: TIER_LIMITS.free.transactionsPerMonth! } },
    { id: 'categoriesLimit', params: { n: TIER_LIMITS.free.customCategories! } },
  ],
  pro: [
    { id: 'unlimited' },
    { id: 'groups', features: ['groups'] },
    { id: 'statsCsv', features: ['statsAdvanced', 'csvExport'] },
    { id: 'aiStats', features: ['aiStatsInsights'] },
    { id: 'documentScan', features: ['documentScan'], params: { n: TIER_LIMITS.pro.documentScansPerMonth } },
  ],
  premium: [
    { id: 'everythingPro' },
    { id: 'predictions', features: ['predictions'] },
    { id: 'investmentTracker', features: ['investmentTracker'] },
    { id: 'aiInvestmentTips', features: ['aiInvestmentTips'] },
    { id: 'documentScanMore', params: { n: TIER_LIMITS.premium.documentScansPerMonth } },
    { id: 'prioritySupport', features: ['prioritySupport'] },
  ],
}

export const ALL_FEATURE_KEYS = Object.keys(FEATURE_MATRIX) as FeatureKey[]
