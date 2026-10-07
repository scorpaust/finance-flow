import { Capacitor, registerPlugin } from '@capacitor/core'
import { PLAY_PRODUCT_IDS } from '~/shared/playBilling'

// Upgrade 01 — ponte para o plugin nativo PlayBillingPlugin.java (Google Play
// Billing). Só faz sentido na app Android; no browser não é usado.
// Ver context/features/upgrades/01-google-play-billing-android.md.

export interface PlayOffer {
  basePlanId: string
  offerToken: string
  formattedPrice: string
  priceMicros: number
  currency: string
  billingPeriod: string
  prepaid: boolean
}

export interface PlayProduct {
  productId: string
  offers: PlayOffer[]
}

export interface PlayPurchase {
  purchaseToken: string
  productIds: string[]
  state: 'purchased' | 'pending' | 'unknown'
  acknowledged: boolean
}

type PurchaseResult =
  | ({ status: 'purchased' | 'pending' } & PlayPurchase)
  | { status: 'canceled' | 'already_owned' | 'error'; code?: number }

interface PlayBillingPlugin {
  getProducts(opts: { productIds: string[] }): Promise<{ status: 'ok'; products: PlayProduct[] } | { status: 'unavailable'; code?: number }>
  purchase(opts: {
    productId: string
    offerToken: string
    accountId: string
    oldPurchaseToken?: string
    replacementMode?: string
  }): Promise<PurchaseResult>
  queryPurchases(): Promise<{ status: 'ok'; purchases: PlayPurchase[] } | { status: 'unavailable'; code?: number }>
  addListener(event: 'purchasesUpdated', cb: (data: { purchases: PlayPurchase[] }) => void): Promise<{ remove: () => Promise<void> }>
}

const PlayBilling = registerPlugin<PlayBillingPlugin>('PlayBilling')

export interface PlayConfig {
  accountId: string
  packageName: string
  webSubscriptionActive: boolean
  current: {
    tier: 'pro' | 'premium'
    productId: string | null
    basePlanId: string | null
    purchaseToken: string | null
    autoRenew: boolean
    allowExtendAfter: string | null
  } | null
}

export function usePlayBilling() {
  // Versões da app anteriores à 1.1.0 não têm o plugin nativo: a página pede
  // para atualizar em vez de rebentar ("plugin is not implemented").
  const available = Capacitor.isPluginAvailable('PlayBilling')

  async function loadConfig(): Promise<PlayConfig> {
    return $fetch<PlayConfig>('/api/billing/google-play/config')
  }

  async function loadProducts(): Promise<PlayProduct[] | null> {
    try {
      const r = await PlayBilling.getProducts({ productIds: Object.values(PLAY_PRODUCT_IDS) })
      return r.status === 'ok' ? r.products : null
    } catch {
      return null
    }
  }

  // O plano é aplicado pelo servidor, que confirma a compra na Google.
  async function verify(purchaseToken: string) {
    return $fetch<{ outcome: string; tier: string | null; status: string | null }>('/api/billing/google-play/verify', {
      method: 'POST',
      body: { purchaseToken },
    })
  }

  // Compras que a Google já tem mas o servidor ainda não confirmou (app
  // fechada a meio, rede em baixo): a Google reembolsa ao fim de 3 dias sem
  // confirmação, por isso tenta-se sempre ao abrir a página.
  async function recoverUnacknowledged(): Promise<boolean> {
    try {
      const r = await PlayBilling.queryPurchases()
      if (r.status !== 'ok') return false
      let any = false
      for (const p of r.purchases) {
        if (p.state === 'purchased' && !p.acknowledged) {
          await verify(p.purchaseToken).catch(() => {})
          any = true
        }
      }
      return any
    } catch {
      return false
    }
  }

  function onPurchasesUpdated(cb: (purchases: PlayPurchase[]) => void) {
    return PlayBilling.addListener('purchasesUpdated', (data) => cb(data.purchases || []))
  }

  return { available, loadConfig, loadProducts, purchase: (opts: Parameters<PlayBillingPlugin['purchase']>[0]) => PlayBilling.purchase(opts), verify, recoverUnacknowledged, onPurchasesUpdated }
}
