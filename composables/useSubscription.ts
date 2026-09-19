import type { FeatureKey } from '~/shared/features'

// Ver context/00-CODE-SPEC.md secção 4 — expõe tier/hasFeature ao resto da app.
// Estado real vive em stores/subscription.ts (Pinia, seguro em SSR); isto é só
// a fachada pedida pela especificação da Fase 2.
export function useSubscription() {
  const store = useSubscriptionStore()
  store.ensureFetched()

  return {
    tier: computed(() => store.subscription.tier),
    status: computed(() => store.subscription.status),
    billingMode: computed(() => store.subscription.billingMode),
    paymentMethod: computed(() => store.subscription.paymentMethod),
    autoRenew: computed(() => store.subscription.autoRenew),
    currentPeriodEnd: computed(() => store.subscription.currentPeriodEnd),
    daysUntilExpiry: computed(() => store.daysUntilExpiry),
    multibancoEntity: computed(() => store.subscription.multibancoEntity),
    multibancoReference: computed(() => store.subscription.multibancoReference),
    multibancoExpiresAt: computed(() => store.subscription.multibancoExpiresAt),
    isExpiringSoon: computed(() => store.isExpiringSoon),
    isLoading: computed(() => store.isLoading),
    hasFeature: (feature: FeatureKey) => store.hasFeature(feature),
    refresh: () => store.refresh(),
  }
}
