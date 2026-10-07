<template>
  <div class="space-y-6 animate-fade-in max-w-3xl">
    <div>
      <button class="btn-secondary text-sm py-2 px-4 mb-4 flex items-center gap-2" type="button" @click="navigateTo('/')">
        <ArrowLeft class="w-4 h-4" /> {{ t('common.backToDashboard') }}
      </button>
      <h2 class="font-display font-bold text-2xl text-white">{{ t('subscription.title') }}</h2>
      <p class="text-white/40 text-xs mt-1">{{ t('subscription.subtitle') }}</p>
    </div>

    <!-- Current status -->
    <div class="glass-card rounded-3xl p-6">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p class="text-white/40 text-xs">{{ t('subscription.currentPlan') }}</p>
          <p class="text-white font-bold text-lg">{{ TIER_LABEL[currentTier] }}</p>
          <p v-if="currentBillingMode === 'auto' && currentStatus === 'active'" class="text-white/40 text-xs mt-1">
            {{ t('subscription.autoRenewActive', { method: currentPaymentMethod === 'cc' ? t('subscription.methodCard') : t('subscription.methodDirectDebit') }) }}{{
              currentPeriodEnd ? t('subscription.nextCharge', { date: formatDate(currentPeriodEnd) }) : ''
            }}
          </p>
          <p v-else-if="currentBillingMode === 'auto' && currentStatus === 'canceled'" class="text-amber-400 text-xs mt-1">
            {{ t('subscription.autoRenewCanceled', { date: currentPeriodEnd ? formatDate(currentPeriodEnd) : t('subscription.noDate') }) }}
          </p>
          <p v-else-if="currentBillingMode === 'push_confirm'" class="text-white/40 text-xs mt-1">
            {{ t('subscription.mbwayPaidPeriod') }}{{ currentStatus === 'pending' ? t('subscription.mbwayPendingConfirm') : '' }}{{
              currentPeriodEnd ? t('subscription.expiresOn', { date: formatDate(currentPeriodEnd) }) : ''
            }}
          </p>
          <p v-else-if="currentBillingMode === 'manual_reference'" class="text-white/40 text-xs mt-1">
            {{ t('subscription.multibancoPaidPeriod') }} · {{ currentPeriodEnd ? t('subscription.expiresOnPlain', { date: formatDate(currentPeriodEnd) }) : t('subscription.noActivePeriod') }}
          </p>
          <!-- Upgrade 01 — comprado na Google Play (app Android). -->
          <p v-else-if="currentBillingMode === 'google_play' && currentStatus === 'pending'" class="text-amber-400 text-xs mt-1">
            {{ t('subscription.playPendingStatus') }}
          </p>
          <p v-else-if="currentBillingMode === 'google_play' && currentStatus === 'canceled'" class="text-amber-400 text-xs mt-1">
            {{ t('subscription.playAutoRenewCanceled', { date: currentPeriodEnd ? formatDate(currentPeriodEnd) : t('subscription.noDate') }) }}
          </p>
          <p v-else-if="currentBillingMode === 'google_play' && currentAutoRenew" class="text-white/40 text-xs mt-1">
            {{ t('subscription.playAutoRenewActive') }}{{ currentPeriodEnd ? t('subscription.nextCharge', { date: formatDate(currentPeriodEnd) }) : '' }}
          </p>
          <p v-else-if="currentBillingMode === 'google_play' && currentPeriodEnd" class="text-white/40 text-xs mt-1">
            {{ t('subscription.playPrepaidActive', { date: formatDate(currentPeriodEnd) }) }}
          </p>
        </div>
        <a
          v-if="currentBillingMode === 'google_play' && currentTier !== 'free'"
          class="btn-secondary text-sm py-2"
          :href="playManageLink"
          target="_blank"
          rel="noopener"
        >
          {{ t('subscription.manageOnGooglePlay') }}
        </a>
        <!-- Decisão 7 — na app Android, nada que leve a pagar ou gerir pagamentos fora da Google Play. -->
        <button
          v-else-if="!isNative && currentBillingMode === 'auto' && currentStatus === 'active'"
          class="btn-secondary text-sm py-2"
          type="button"
          :disabled="canceling"
          @click="handleCancel"
        >
          {{ canceling ? t('subscription.cancelingAutoRenew') : t('subscription.cancelAutoRenew') }}
        </button>
        <button
          v-else-if="!isNative && (currentBillingMode === 'push_confirm' || currentBillingMode === 'manual_reference') && currentStatus === 'pending'"
          class="btn-secondary text-sm py-2"
          type="button"
          :disabled="checkingPayment"
          @click="handleCheckPayment"
        >
          {{ checkingPayment ? t('subscription.checkingPayment') : t('subscription.checkPayment') }}
        </button>
      </div>
    </div>

    <!-- Upgrade 01, decisão 7 — app Android com um plano comprado na web. -->
    <div v-if="webManaged" class="glass-card rounded-3xl p-6 border border-brand-500/30" data-testid="subscription-managed-web">
      <p class="text-white font-semibold">{{ t('subscription.managedOnWebTitle') }}</p>
      <p class="text-white/50 text-sm mt-1">{{ t('subscription.managedOnWebBody') }}</p>
    </div>

    <!-- Upgrade 01 — site com um plano comprado na Google Play. -->
    <div v-if="playManagedOnWeb" class="glass-card rounded-3xl p-6 border border-brand-500/30" data-testid="subscription-managed-play">
      <p class="text-white font-semibold">{{ t('subscription.managedOnPlayTitle') }}</p>
      <p class="text-white/50 text-sm mt-1">{{ t('subscription.managedOnPlayBody') }}</p>
    </div>

    <!-- Referência Multibanco por pagar -->
    <div v-if="multibancoReference && !isNative" class="glass-card rounded-3xl p-6 border border-amber-500/30">
      <p class="text-white font-semibold">{{ t('subscription.pendingReferenceTitle') }}</p>
      <p class="text-white/50 text-sm mt-2">
        {{ t('subscription.entity') }} <span class="font-mono text-brand-300">{{ multibancoEntity }}</span> · {{ t('subscription.reference') }}
        <span class="font-mono text-brand-300">{{ multibancoReference }}</span>
      </p>
      <p class="text-white/40 text-xs mt-1">
        {{ multibancoExpiresAt ? t('subscription.validUntil', { date: formatDate(multibancoExpiresAt) }) : '' }} {{ t('subscription.payAtAtm') }}
      </p>
    </div>

    <!-- Plans -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div
        v-for="tierOption in SUBSCRIPTION_TIERS"
        :key="tierOption"
        class="glass-card rounded-3xl p-5 border-2 transition-all cursor-pointer"
        :class="selectedTier === tierOption ? 'border-brand-500' : 'border-transparent hover:border-white/10'"
        @click="selectedTier = tierOption"
      >
        <p class="font-semibold text-white">{{ TIER_LABEL[tierOption] }}</p>
        <p class="text-2xl font-bold text-brand-300 mt-1">
          {{ planPrice(tierOption) }}<span class="text-xs text-white/40 font-normal">{{ t('subscription.perMonth') }}</span>
        </p>
        <ul class="mt-3 space-y-1.5 text-xs text-white/50">
          <li v-for="f in planFeatures[tierOption]" :key="f" class="flex items-start gap-1.5">
            <Check class="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> {{ f }}
          </li>
        </ul>
        <p v-if="tierOption === currentTier" class="text-emerald-400 text-xs font-semibold mt-3">{{ t('subscription.currentPlanBadge') }}</p>
      </div>
    </div>

    <!-- Payment method -->
    <div v-if="!isNative && !playManagedOnWeb && selectedTier !== 'free' && selectedTier !== currentTier" class="glass-card rounded-3xl p-6 space-y-5">
      <div>
        <label class="form-label">{{ t('subscription.paymentMethodLabel') }}</label>
        <div class="grid grid-cols-2 gap-2 mt-1.5" data-testid="subscription-methods">
          <button
            v-for="m in METHODS"
            :key="m.value"
            :data-testid="`subscription-method-${m.value}`"
            class="py-2.5 rounded-xl text-sm font-semibold transition-all"
            :class="selectedMethod === m.value ? 'bg-brand-600 text-white' : 'bg-surface-700/50 text-white/50 hover:text-white'"
            type="button"
            @click="selectedMethod = m.value"
          >
            {{ m.label }}
          </button>
        </div>
        <p class="text-white/40 text-xs mt-2">{{ METHOD_DESCRIPTION[selectedMethod] }}</p>
      </div>

      <!-- MB WAY/Multibanco: pagamento único de um período fixo (nenhum dos
           dois permite renovação automática sem ação manual a cada ciclo —
           decisão de 2026-09-19). -->
      <div v-if="selectedMethod === 'mbway' || selectedMethod === 'multibanco'">
        <label class="form-label">{{ t('subscription.periodLabel') }}</label>
        <div class="flex gap-2 flex-wrap mt-1.5">
          <button
            v-for="p in PERIODS"
            :key="p"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            :class="periodMonths === p ? 'bg-brand-600 text-white' : 'bg-surface-700/50 text-white/50 hover:text-white'"
            type="button"
            @click="periodMonths = p"
          >
            {{ p }} {{ p === 1 ? t('subscription.month') : t('subscription.months') }}
          </button>
        </div>
      </div>

      <p class="text-white/50 text-sm text-center">
        <template v-if="selectedMethod === 'mbway' || selectedMethod === 'multibanco'">
          {{ t('subscription.totalLabel') }}: <span class="text-brand-300 font-bold">{{ formatPrice(prepaidTotal) }}</span>
          ({{ periodMonths }} × {{ formatCurrency(TIER_PRICE_EUR[selectedTier], 'EUR') }}, {{ t('subscription.totalSuffix') }}
        </template>
        <template v-else>{{ formatPrice(TIER_PRICE_EUR[selectedTier]) }}{{ t('subscription.perMonth') }}</template>
      </p>

      <button
        class="btn-primary w-full"
        type="button"
        :disabled="submitting"
        @click="beginCheckout"
      >
        {{ submitting ? t('subscription.openingEasyPay') : t('subscription.continueButton') }}
      </button>
    </div>

    <!-- Upgrade 01 — app Android: a única forma de pagar é a Google Play. -->
    <div v-if="isNative && !webManaged && selectedTier !== 'free'" class="glass-card rounded-3xl p-6 space-y-5" data-testid="subscription-play">
      <p v-if="playLoading" class="text-white/40 text-sm text-center flex items-center justify-center gap-2">
        <Loader2 class="w-4 h-4 animate-spin" /> {{ t('subscription.playLoading') }}
      </p>
      <p v-else-if="!play.available" class="text-white/50 text-sm text-center">{{ t('subscription.playUpdateApp') }}</p>
      <p v-else-if="!playProducts" class="text-white/50 text-sm text-center">{{ t('subscription.playUnavailable') }}</p>
      <template v-else>
        <div>
          <label class="form-label">{{ t('subscription.paymentMethodLabel') }}</label>
          <div class="grid grid-cols-2 gap-2 mt-1.5">
            <button
              v-for="m in PLAY_MODES"
              :key="m"
              class="py-2.5 rounded-xl text-sm font-semibold transition-all"
              :class="playMode === m ? 'bg-brand-600 text-white' : 'bg-surface-700/50 text-white/50 hover:text-white'"
              type="button"
              @click="playMode = m"
            >
              {{ m === 'auto' ? t('subscription.playModeAuto') : t('subscription.playModePrepaid') }}
            </button>
          </div>
          <p class="text-white/40 text-xs mt-2">{{ playMode === 'auto' ? t('subscription.playModeAutoDesc') : t('subscription.playModePrepaidDesc') }}</p>
        </div>

        <div v-if="playMode === 'prepaid'">
          <label class="form-label">{{ t('subscription.periodLabel') }}</label>
          <div class="flex gap-2 flex-wrap mt-1.5">
            <button
              v-for="p in PLAY_PREPAID_PERIODS"
              :key="p"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              :class="playPeriod === p ? 'bg-brand-600 text-white' : 'bg-surface-700/50 text-white/50 hover:text-white'"
              type="button"
              @click="playPeriod = p"
            >
              {{ p }} {{ p === 1 ? t('subscription.month') : t('subscription.months') }}
            </button>
          </div>
        </div>

        <p v-if="selectedOffer" class="text-white/50 text-sm text-center">
          <span class="text-brand-300 font-bold">{{ selectedOffer.formattedPrice }}</span>
          <template v-if="playMode === 'auto'">{{ t('subscription.perMonth') }}</template>
          <span class="block text-white/30 text-xs mt-1">{{ t('subscription.playPriceNote') }}</span>
        </p>
        <p v-else class="text-white/50 text-sm text-center">{{ t('subscription.playUnavailable') }}</p>

        <p v-if="playAction.kind === 'current'" class="text-white/50 text-sm text-center">{{ t('subscription.playCurrentPlan') }}</p>
        <p v-else-if="playAction.kind === 'wait'" class="text-white/50 text-sm text-center">
          {{ t('subscription.playExtendFrom', { date: formatDate(playAction.until!) }) }}
        </p>
        <button
          v-else
          class="btn-primary w-full"
          type="button"
          :disabled="playBuying || !selectedOffer"
          @click="buyWithPlay"
        >
          <Loader2 v-if="playBuying" class="w-4 h-4 animate-spin inline mr-2" />
          {{ playAction.kind === 'change' ? t('subscription.playChangePlan') : playAction.kind === 'topup' ? t('subscription.playExtend') : t('subscription.payWithGooglePlay') }}
        </button>
      </template>
    </div>

    <!-- MB WAY: à espera de confirmação no telemóvel -->
    <div v-if="mbwayWaiting" class="glass-card rounded-3xl p-6 text-center border border-brand-500/30">
      <Loader2 class="w-6 h-6 text-brand-400 animate-spin mx-auto mb-3" />
      <p class="text-white font-semibold">{{ t('subscription.mbwayWaitingTitle') }}</p>
      <p class="text-white/40 text-sm mt-1">{{ t('subscription.mbwayWaitingHint') }}</p>
    </div>

    <!-- Elemento anfitrião do formulário EasyPay Checkout (modo inline — o
         modo 'popup' do SDK não abre sozinho: fica à espera de um clique no
         próprio elemento com este id, pensado para apontar a um botão
         visível tipo "Pagar", não para ser aberto programaticamente a partir
         de startCheckout(); confirmado na prática em sandbox, 2026-09-18).
         Fundo branco fixo (o iframe é conteúdo cross-origin hospedado pela
         EasyPay, não conseguimos aplicar o tema escuro lá dentro) — envolto
         num cartão branco arredondado para não destoar tanto do resto. -->
    <div v-if="checkoutOpen" class="space-y-2">
      <p v-if="confirming" class="text-white/50 text-xs text-center flex items-center justify-center gap-2">
        <Loader2 class="w-3.5 h-3.5 animate-spin" /> A confirmar com a EasyPay — não feches esta página...
      </p>
      <div class="rounded-3xl bg-white p-4 flex justify-center shadow-xl">
        <div id="easypay-checkout" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Import explícito: `navigateTo` é usado no template, e só assim o type-check o vê.
import { navigateTo } from '#imports'
import { ArrowLeft, Check, Loader2 } from 'lucide-vue-next'
import { SUBSCRIPTION_TIERS, TIER_LABEL, TIER_PRICE_EUR, type SubscriptionTier } from '~/shared/features'
import {
  PLAY_MONTHLY_BASE_PLAN,
  PLAY_PACKAGE_NAME,
  PLAY_PREPAID_PERIODS,
  PLAY_PRODUCT_IDS,
  playManageUrl,
  playReplacementMode,
  prepaidBasePlanId,
  type PaidTier,
  type PlayPrepaidPeriod,
} from '~/shared/playBilling'
import type { PlayConfig, PlayProduct } from '~/composables/usePlayBilling'

definePageMeta({ layout: 'default' })

const toast = useToastStore()
const sub = useSubscription()
const platform = usePlatform()
const isNative = platform.isNative
const play = usePlayBilling()
const route = useRoute()
const { t, locale } = useI18n()

const currentTier = sub.tier
const currentStatus = sub.status
const currentBillingMode = sub.billingMode
const currentPaymentMethod = sub.paymentMethod
const currentAutoRenew = sub.autoRenew
const currentPeriodEnd = sub.currentPeriodEnd
const multibancoEntity = sub.multibancoEntity
const multibancoReference = sub.multibancoReference
const multibancoExpiresAt = sub.multibancoExpiresAt

const selectedTier = ref<SubscriptionTier>((route.query.tier as SubscriptionTier) || 'pro')

type Method = 'cc' | 'dd' | 'mbway' | 'multibanco'
const ALL_METHODS = computed<{ value: Method; label: string }[]>(() => [
  { value: 'cc', label: t('subscription.methodCC') },
  { value: 'dd', label: t('subscription.methodDD') },
  { value: 'mbway', label: t('subscription.methodMBWAY') },
  { value: 'multibanco', label: t('subscription.methodMultibanco') },
])

// MB WAY/Multibanco disponíveis em qualquer país desde a Fase 9 (emigrantes
// com conta portuguesa; bloqueio geográfico — ver shared/paymentMethods.ts).
// A lista continua a vir do servidor (/api/subscription/payment-methods).
const availablePrepaidMethods = ref<string[]>([])
const METHODS = computed(() =>
  ALL_METHODS.value.filter((m) => m.value === 'cc' || m.value === 'dd' || availablePrepaidMethods.value.includes(m.value))
)

onMounted(async () => {
  try {
    const r = await $fetch<{ prepaidMethods: string[] }>('/api/subscription/payment-methods')
    availablePrepaidMethods.value = r.prepaidMethods
  } catch {
    // País desconhecido/erro de geolocalização → trata como "sem métodos
    // pré-pagos locais", igual a qualquer país fora de Portugal.
    availablePrepaidMethods.value = []
  }
})
const METHOD_DESCRIPTION = computed<Record<Method, string>>(() => ({
  cc: t('subscription.descCC'),
  dd: t('subscription.descDD'),
  mbway: t('subscription.descMBWAY'),
  multibanco: t('subscription.descMultibanco'),
}))
const selectedMethod = ref<Method>('cc')
const PERIODS = [1, 3, 6, 12] as const
const periodMonths = ref<(typeof PERIODS)[number]>(1)
const prepaidTotal = computed(() => Math.round(TIER_PRICE_EUR[selectedTier.value] * periodMonths.value * 100) / 100)

// Fase 10 — os preços são cobrados em euros (EasyPay); noutra moeda de
// apresentação mostra-se também o valor aproximado: "5,00 € (≈ 5,62 $)".
const { formatCurrency } = useFormatters()
const fx = useCurrencyStore()
function formatPrice(eur: number): string {
  const inEur = formatCurrency(eur, 'EUR')
  return fx.currency === 'EUR' ? inEur : `${inEur} (≈ ${formatCurrency(eur)})`
}

const submitting = ref(false)
const canceling = ref(false)
const checkingPayment = ref(false)
const mbwayWaiting = ref(false)
const checkoutOpen = ref(false)
const confirming = ref(false)

const planFeatures = computed<Record<SubscriptionTier, string[]>>(() => ({
  free: [t('subscription.planFreeF1'), t('subscription.planFreeF2'), t('subscription.planFreeF3')],
  pro: [t('subscription.planProF1'), t('subscription.planProF2'), t('subscription.planProF3'), t('subscription.planProF4')],
  premium: [t('subscription.planPremiumF1'), t('subscription.planPremiumF2'), t('subscription.planPremiumF3')],
}))

const { intlLocale } = useLocaleFormat()
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(intlLocale.value)
}

// A EasyPay Checkout não redireciona para fora da app — o SDK
// (@easypaypt/checkout-sdk) embebe o formulário diretamente na página
// (confirmado no manifest devolvido pelo servidor: { id, session, config },
// ver server/utils/easypay.ts). Carregado dinamicamente (client-only) porque
// manipula o DOM diretamente. Modo 'inline' (não 'popup'): testado em sandbox
// (2026-09-18) e confirmado que 'popup' não abre sozinho — fica à espera de
// um clique no próprio elemento com o `id` indicado (pensado para apontar a
// um botão visível "Pagar" já existente, não para abrir programaticamente a
// partir de startCheckout()). 'inline' embebe o iframe assim que é chamado,
// que é o comportamento que precisamos aqui. Só no site: na app Android a
// única forma de pagar é a Google Play (Upgrade 01).
let checkoutInstance: { unmount: () => void } | null = null

// Fase 7 — mapeia o locale ativo da app para um dos 3 idiomas que o SDK da
// EasyPay aceita (ver comentário mais abaixo, em beginCheckout).
const EASYPAY_LANGUAGE: Record<string, 'en' | 'pt_PT' | 'es_ES'> = {
  'pt-PT': 'pt_PT',
  es: 'es_ES',
}

// Checkout EasyPay — só no site (na app Android paga-se pela Google Play,
// ver buyWithPlay mais abaixo).
async function beginCheckout() {
  submitting.value = true
  mbwayWaiting.value = false
  try {
    const isAuto = selectedMethod.value === 'cc' || selectedMethod.value === 'dd'
    const manifest = isAuto
      ? (
          await $fetch<{ manifest: any }>('/api/subscription/easypay/create-subscription', {
            method: 'POST',
            body: {
              tier: selectedTier.value,
              method: selectedMethod.value,
            },
          })
        ).manifest
      : (
          await $fetch<{ manifest: any }>('/api/subscription/easypay/create-prepaid', {
            method: 'POST',
            body: { tier: selectedTier.value, method: selectedMethod.value, periodMonths: periodMonths.value },
          })
        ).manifest

    const { startCheckout } = await import('@easypaypt/checkout-sdk')
    const config = useRuntimeConfig()

    // O elemento anfitrião só existe no DOM depois de checkoutOpen passar a
    // true (v-if) — esperar o próximo tick antes de o procurar.
    checkoutOpen.value = true
    await nextTick()
    document.getElementById('easypay-checkout')?.scrollIntoView({ behavior: 'smooth', block: 'center' })

    checkoutInstance = startCheckout(manifest, {
      id: 'easypay-checkout',
      display: 'inline',
      testing: config.public.easypayTesting,
      // Fase 7 — o SDK da EasyPay só suporta "en", "pt_PT" e "es_ES"
      // (confirmado via Context7, docs.easypay.pt); fr/de/it caem em inglês.
      language: EASYPAY_LANGUAGE[locale.value] || 'en',
      onSuccess: async () => {
        // Não fecha o painel já — o formulário da EasyPay às vezes mostra a
        // entidade/referência Multibanco no próprio ecrã final, e fechar de
        // imediato não dava tempo de ler (reportado em sandbox, 2026-09-19).
        // Mostra "a confirmar" e só fecha depois de terminar a confirmação
        // (ver abaixo), altura em que o nosso próprio cartão de referência
        // Multibanco já está atualizado.
        confirming.value = true

        // O webhook (server/api/subscription/easypay/webhook.post.ts) é o
        // caminho principal, mas não é fiável em dev local (a EasyPay não
        // consegue entregar um POST a um localhost não exposto publicamente)
        // — confirma também a partir daqui, com o id do checkout que o nosso
        // próprio servidor devolveu ao criá-lo (manifest.id), não o
        // `payment.id` do SDK (esse não bateu certo com os endpoints de
        // leitura diretos em sandbox). Mesma lógica idempotente dos dois
        // lados (ver server/utils/subscriptionSync.ts).
        try {
          await $fetch('/api/subscription/easypay/confirm', {
            method: 'POST',
            body: { checkoutId: manifest.id },
          })
        } catch {
          // Sem efeito visível: o webhook e o polling abaixo acabam por confirmar.
        }

        submitting.value = false
        confirming.value = false
        checkoutOpen.value = false
        checkoutInstance?.unmount()
        if (selectedMethod.value === 'mbway') mbwayWaiting.value = true
        toast.success(t('subscription.toastPaymentConfirmedCheck'))
        pollUntilConfirmed()
      },
      onError: (error: { code: string }) => {
        submitting.value = false
        mbwayWaiting.value = false
        checkoutOpen.value = false
        toast.error(t('subscription.errorEasyPayCode', { code: error.code }))
        checkoutInstance?.unmount()
      },
      onPaymentError: () => {
        toast.error(t('subscription.toastPaymentFailed'))
      },
      onClose: () => {
        submitting.value = false
        checkoutOpen.value = false
      },
    })
  } catch (e: any) {
    toast.error(e?.data?.message || e?.message || t('subscription.errorStartPayment'))
    submitting.value = false
    checkoutOpen.value = false
  }
}

// Pára o polling e desmonta o checkout ao sair da página (antes o polling
// continuava a fazer pedidos em segundo plano até 30 s).
let disposed = false
onBeforeUnmount(() => {
  disposed = true
  checkoutInstance?.unmount()
})

async function pollUntilConfirmed() {
  for (let i = 0; i < 15 && !disposed; i++) {
    await sub.refresh()
    if (sub.tier.value === selectedTier.value) {
      toast.success(t('subscription.toastPaymentConfirmedCelebrate'))
      break
    }
    await new Promise((r) => setTimeout(r, 2000))
  }
  mbwayWaiting.value = false
}

async function handleCancel() {
  if (!confirm(t('subscription.confirmCancelAutoRenew'))) return
  canceling.value = true
  try {
    await $fetch('/api/subscription/easypay/cancel', { method: 'POST' })
    toast.success(t('subscription.toastAutoRenewCanceled'))
    await sub.refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || e?.message || t('subscription.errorCancel'))
  } finally {
    canceling.value = false
  }
}

async function handleCheckPayment() {
  checkingPayment.value = true
  try {
    const r = await $fetch<{ status: string }>('/api/subscription/easypay/check-payment', { method: 'POST' })
    if (r.status === 'active') {
      toast.success(t('subscription.toastPaymentConfirmedCelebrate'))
    } else {
      toast.info(t('subscription.toastPaymentNotYetConfirmed'))
    }
    await sub.refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || e?.message || t('subscription.errorCheckPayment'))
  } finally {
    checkingPayment.value = false
  }
}

// ── Upgrade 01 — Google Play Billing (app Android) ──────────────────────────
// A Google cobra; a app só abre a compra e manda o token ao servidor, que a
// confirma na Google e aplica o plano (server/utils/googlePlay.ts). Mesma
// oferta da web: mensal com renovação ou pré-pago de 1/3/6/12 meses.
const PLAY_MODES = ['auto', 'prepaid'] as const
const playConfig = ref<PlayConfig | null>(null)
const playProducts = ref<PlayProduct[] | null>(null)
const playLoading = ref(false)
const playMode = ref<(typeof PLAY_MODES)[number]>('auto')
const playPeriod = ref<PlayPrepaidPeriod>(1)
const playBuying = ref(false)

const webManaged = computed(() => isNative.value && !!playConfig.value?.webSubscriptionActive)
const playManagedOnWeb = computed(() => !isNative.value && currentBillingMode.value === 'google_play' && currentTier.value !== 'free')
const playManageLink = computed(() => playManageUrl(PLAY_PACKAGE_NAME, sub.googlePlayProductId.value))

const selectedBasePlan = computed(() => (playMode.value === 'auto' ? PLAY_MONTHLY_BASE_PLAN : prepaidBasePlanId(playPeriod.value)))
const selectedOffer = computed(() => {
  if (selectedTier.value === 'free') return null
  const product = playProducts.value?.find((p) => p.productId === PLAY_PRODUCT_IDS[selectedTier.value as PaidTier])
  return product?.offers.find((o) => o.basePlanId === selectedBasePlan.value) || null
})

// O que o botão faz: compra nova, mudança de plano (com o token da compra
// atual), carregamento de um pré-pago, ou nada (já é o plano atual).
const playAction = computed<{ kind: 'buy' | 'change' | 'topup' | 'current' | 'wait'; until?: string }>(() => {
  const cur = playConfig.value?.current
  if (!cur?.purchaseToken || selectedTier.value === 'free') return { kind: 'buy' }
  const sameItem = cur.productId === PLAY_PRODUCT_IDS[selectedTier.value as PaidTier] && cur.basePlanId === selectedBasePlan.value
  if (!sameItem) return { kind: 'change' }
  if (playMode.value === 'auto') return { kind: 'current' }
  if (cur.allowExtendAfter && new Date(cur.allowExtendAfter) > new Date()) return { kind: 'wait', until: cur.allowExtendAfter }
  return { kind: 'topup' }
})

// Preço mensal nos cartões: na app, o da Google (moeda e impostos do país).
function planPrice(tier: SubscriptionTier): string {
  if (isNative.value && tier !== 'free') {
    const monthly = playProducts.value
      ?.find((p) => p.productId === PLAY_PRODUCT_IDS[tier as PaidTier])
      ?.offers.find((o) => o.basePlanId === PLAY_MONTHLY_BASE_PLAN)
    if (monthly) return monthly.formattedPrice
  }
  return formatPrice(TIER_PRICE_EUR[tier])
}

async function refreshPlay() {
  await sub.refresh()
  try {
    playConfig.value = await play.loadConfig()
  } catch {
    // Sem configuração: o botão de compra fica sem efeito até voltar a abrir.
  }
}

async function buyWithPlay() {
  const offer = selectedOffer.value
  const config = playConfig.value
  if (!offer || !config || selectedTier.value === 'free') return
  const tier = selectedTier.value as PaidTier
  const cur = config.current
  const change = playAction.value.kind === 'change' && cur?.purchaseToken
  const mode = change
    ? playReplacementMode({ tier: cur!.tier, autoRenew: cur!.basePlanId === PLAY_MONTHLY_BASE_PLAN }, { tier, autoRenew: playMode.value === 'auto' })
    : undefined

  playBuying.value = true
  try {
    const result = await play.purchase({
      productId: PLAY_PRODUCT_IDS[tier],
      offerToken: offer.offerToken,
      accountId: config.accountId,
      ...(change ? { oldPurchaseToken: cur!.purchaseToken!, replacementMode: mode } : {}),
    })
    if (result.status === 'canceled') return
    if (result.status === 'already_owned') {
      await play.recoverUnacknowledged()
      await refreshPlay()
      toast.info(t('subscription.playAlreadyOwned'))
      return
    }
    if (result.status !== 'purchased' && result.status !== 'pending') {
      toast.error(t('subscription.playPurchaseError'))
      return
    }
    await play.verify(result.purchaseToken)
    await refreshPlay()
    if (result.status === 'pending') toast.info(t('subscription.playPendingPayment'))
    else if (mode === 'DEFERRED') toast.success(t('subscription.playDowngradeDeferred', { plan: TIER_LABEL[tier] }))
    else toast.success(t('subscription.toastPaymentConfirmedCelebrate'))
  } catch (e: any) {
    toast.error(e?.data?.message || t('subscription.playPurchaseError'))
  } finally {
    playBuying.value = false
  }
}

// O estado do plano pode mudar fora desta página — cancelar na Google Play,
// pagar uma referência Multibanco, outro dispositivo. Sempre que a página
// abre e sempre que a app/separador volta ao primeiro plano (ex. regresso da
// Play Store), lê de novo do servidor; o store só o carregava uma vez por sessão.
function onVisible() {
  if (document.visibilityState !== 'visible') return
  if (isNative.value) refreshPlay()
  else sub.refresh()
}
onMounted(() => {
  sub.refresh()
  document.addEventListener('visibilitychange', onVisible)
})
onBeforeUnmount(() => document.removeEventListener('visibilitychange', onVisible))

let removePlayListener: (() => Promise<void>) | null = null
onMounted(async () => {
  if (!isNative.value) return
  if (!play.available) {
    playConfig.value = await play.loadConfig().catch(() => null)
    return
  }
  playLoading.value = true
  try {
    const [config, products] = await Promise.all([play.loadConfig().catch(() => null), play.loadProducts()])
    playConfig.value = config
    playProducts.value = config ? products : null
    // Compras que a Google tem mas que o servidor ainda não confirmou.
    if (await play.recoverUnacknowledged()) await refreshPlay()
    const handle = await play.onPurchasesUpdated(async (purchases) => {
      for (const p of purchases) if (p.state === 'purchased') await play.verify(p.purchaseToken).catch(() => {})
      await refreshPlay()
    })
    removePlayListener = handle.remove
  } finally {
    playLoading.value = false
  }
})
onBeforeUnmount(() => {
  removePlayListener?.()
})

if (route.query.canceled) {
  toast.info(t('subscription.toastPaymentCanceled'))
}
</script>
