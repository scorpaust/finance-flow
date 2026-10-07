import { defineStore } from 'pinia'
import type { FeatureKey, SubscriptionTier } from '~/shared/features'
import { hasFeature as checkFeature } from '~/shared/features'

interface SubscriptionState {
  tier: SubscriptionTier
  status: 'active' | 'pending' | 'past_due' | 'canceled' | 'expired'
  provider: 'easypay' | 'google_play' | 'none'
  paymentMethod: 'cc' | 'dd' | 'mbway' | 'multibanco' | 'google_play' | 'none'
  billingMode: 'auto' | 'push_confirm' | 'manual_reference' | 'google_play' | 'none'
  autoRenew: boolean
  currentPeriodEnd: string | null
  multibancoEntity?: string
  multibancoReference?: string
  multibancoExpiresAt?: string | null
  // Upgrade 01 — compra na Google Play (app Android).
  googlePlayProductId?: string
  googlePlayBasePlanId?: string
  googlePlayAllowExtendAfter?: string | null
}

const DEFAULT_STATE: SubscriptionState = {
  tier: 'free',
  status: 'active',
  provider: 'none',
  paymentMethod: 'none',
  billingMode: 'none',
  autoRenew: false,
  currentPeriodEnd: null,
}

// Estado Pinia (por-request no SSR, evitando fugas de dados entre utilizadores
// — ao contrário de um singleton a nível de módulo) que suporta o composable
// useSubscription() exposto ao resto da app.
export const useSubscriptionStore = defineStore('subscription', () => {
  const subscription = ref<SubscriptionState>({ ...DEFAULT_STATE })
  const daysUntilExpiry = ref<number | null>(null)
  const isLoading = ref(false)
  const _fetched = ref(false)

  async function refresh() {
    isLoading.value = true
    try {
      const data = await $fetch<{
        subscription: SubscriptionState
        daysUntilExpiry: number | null
      }>('/api/subscription')
      subscription.value = data.subscription
      daysUntilExpiry.value = data.daysUntilExpiry
    } catch {
      subscription.value = { ...DEFAULT_STATE }
      daysUntilExpiry.value = null
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

  // MB WAY e Multibanco são pagamentos únicos por período fixo, sem
  // renovação automática (decisão de 2026-09-19) — avisar antes do período
  // expirar é o único caso em que faz sentido mostrar isto aqui. Upgrade 01:
  // o mesmo para os pré-pagos da Google Play.
  const isPrepaid = computed(
    () =>
      subscription.value.billingMode === 'manual_reference' ||
      subscription.value.billingMode === 'push_confirm' ||
      (subscription.value.billingMode === 'google_play' && !subscription.value.autoRenew && subscription.value.status === 'active')
  )
  const isExpiringSoon = computed(
    () =>
      isPrepaid.value &&
      daysUntilExpiry.value !== null &&
      // >= 0: depois de expirar o plano já é gratuito (ver effectiveTier); antes,
      // `<= 7` incluía negativos e a faixa mostrava "expira em -1 dias".
      daysUntilExpiry.value >= 0 &&
      daysUntilExpiry.value <= 7
  )

  return {
    subscription,
    daysUntilExpiry,
    isLoading,
    isExpiringSoon,
    hasFeature,
    refresh,
    ensureFetched,
  }
})
