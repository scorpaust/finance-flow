import { defineStore } from 'pinia'
import type { FeatureKey, SubscriptionTier } from '~/shared/features'
import { hasFeature as checkFeature } from '~/shared/features'

interface SubscriptionState {
  tier: SubscriptionTier
  status: 'active' | 'pending' | 'past_due' | 'canceled' | 'expired'
  provider: 'paypal' | 'none'
  paymentMethod: 'card' | 'paypal_balance' | 'mbway' | 'multibanco' | 'none'
  periodType: 'recurring' | 'prepaid' | 'none'
  autoRenew: boolean
  currentPeriodEnd: string | null
}

const DEFAULT_STATE: SubscriptionState = {
  tier: 'free',
  status: 'active',
  provider: 'none',
  paymentMethod: 'none',
  periodType: 'none',
  autoRenew: false,
  currentPeriodEnd: null,
}

interface PendingPurchase {
  tier: SubscriptionTier
  periodMonths: number
  paymentMethod: 'mbway' | 'multibanco'
  createdAt: string
}

// Estado Pinia (por-request no SSR, evitando fugas de dados entre utilizadores
// — ao contrário de um singleton a nível de módulo) que suporta o composable
// useSubscription() exposto ao resto da app.
export const useSubscriptionStore = defineStore('subscription', () => {
  const subscription = ref<SubscriptionState>({ ...DEFAULT_STATE })
  const daysUntilExpiry = ref<number | null>(null)
  const pendingPurchase = ref<PendingPurchase | null>(null)
  const isLoading = ref(false)
  const _fetched = ref(false)

  async function refresh() {
    isLoading.value = true
    try {
      const data = await $fetch<{
        subscription: SubscriptionState
        daysUntilExpiry: number | null
        pendingPurchase: PendingPurchase | null
      }>('/api/subscription')
      subscription.value = data.subscription
      daysUntilExpiry.value = data.daysUntilExpiry
      pendingPurchase.value = data.pendingPurchase
    } catch {
      subscription.value = { ...DEFAULT_STATE }
      daysUntilExpiry.value = null
      pendingPurchase.value = null
    } finally {
      isLoading.value = false
      _fetched.value = true
    }
  }

  async function ensureFetched() {
    if (!_fetched.value) await refresh()
  }

  function hasFeature(feature: FeatureKey): boolean {
    return checkFeature(subscription.value.tier, feature)
  }

  const isExpiringSoon = computed(
    () => subscription.value.periodType === 'prepaid' && daysUntilExpiry.value !== null && daysUntilExpiry.value <= 7
  )

  return {
    subscription,
    daysUntilExpiry,
    pendingPurchase,
    isLoading,
    isExpiringSoon,
    hasFeature,
    refresh,
    ensureFetched,
  }
})
