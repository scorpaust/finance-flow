import { TIER_PRICE_EUR, type SubscriptionTier } from '~/shared/features'
import { PLAY_MONTHLY_BASE_PLAN, PLAY_PRODUCT_IDS, type PaidTier } from '~/shared/playBilling'
import type { PlayProduct } from '~/composables/usePlayBilling'

// Fonte única do preço mostrado em toda a app (página de subscrição, avisos
// de funcionalidade bloqueada…). Antes, o aviso do scan dizia "7 €" e a
// página de subscrição na app mostrava o preço da Google — dois números
// diferentes para o mesmo plano.
//   - App Android: o preço da Google Play, tal como a Google o cobra (moeda e
//     impostos do país do utilizador). Carregado uma vez por sessão.
//   - Site: o preço em euros da EasyPay (TIER_PRICE_EUR), com o aproximado na
//     moeda de apresentação (Fase 10): "7,00 € (≈ 7,87 $)".
const playProducts = ref<PlayProduct[] | null>(null)
let loading: Promise<void> | null = null

export function usePlanPrice() {
  const { isNative } = usePlatform()
  const { formatCurrency } = useFormatters()
  const fx = useCurrencyStore()
  const play = usePlayBilling()

  function ensurePlayPrices(): Promise<void> {
    if (!isNative.value || !play.available) return Promise.resolve()
    if (!loading) {
      loading = play.loadProducts().then((products) => {
        playProducts.value = products
        // Sem produtos (ex. instalação fora da Play): volta a tentar da próxima vez.
        if (!products) loading = null
      })
    }
    return loading
  }

  function setPlayProducts(products: PlayProduct[] | null) {
    playProducts.value = products
    if (products) loading = Promise.resolve()
  }

  function playOffer(tier: PaidTier, basePlanId: string) {
    return playProducts.value?.find((p) => p.productId === PLAY_PRODUCT_IDS[tier])?.offers.find((o) => o.basePlanId === basePlanId) || null
  }

  // Euros + aproximado na moeda escolhida (site, e app enquanto a Google não respondeu).
  function formatEur(eur: number): string {
    const inEur = formatCurrency(eur, 'EUR')
    return fx.currency === 'EUR' ? inEur : `${inEur} (≈ ${formatCurrency(eur)})`
  }

  function monthlyPrice(tier: SubscriptionTier): string {
    if (isNative.value && tier !== 'free') {
      const offer = playOffer(tier as PaidTier, PLAY_MONTHLY_BASE_PLAN)
      if (offer) return offer.formattedPrice
    }
    return formatEur(TIER_PRICE_EUR[tier])
  }

  return { playProducts, ensurePlayPrices, setPlayProducts, playOffer, formatEur, monthlyPrice }
}
