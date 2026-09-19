<template>
  <div class="space-y-6 animate-fade-in max-w-3xl">
    <div>
      <button class="btn-secondary text-sm py-2 px-4 mb-4 flex items-center gap-2" type="button" @click="navigateTo('/')">
        <ArrowLeft class="w-4 h-4" /> Voltar ao dashboard
      </button>
      <h2 class="font-display font-bold text-2xl text-white">Subscrição</h2>
      <p class="text-white/40 text-xs mt-1">Escolhe um plano e a forma de pagamento (via EasyPay)</p>
    </div>

    <!-- Current status -->
    <div class="glass-card rounded-3xl p-6">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p class="text-white/40 text-xs">Plano atual</p>
          <p class="text-white font-bold text-lg">{{ TIER_LABEL[currentTier] }}</p>
          <p v-if="currentBillingMode === 'auto' && currentStatus === 'active'" class="text-white/40 text-xs mt-1">
            Auto-renovação ativa ({{ currentPaymentMethod === 'cc' ? 'Cartão' : 'Débito Direto' }}){{
              currentPeriodEnd ? ` · próxima cobrança ${formatDate(currentPeriodEnd)}` : ''
            }}
          </p>
          <p v-else-if="currentBillingMode === 'auto' && currentStatus === 'canceled'" class="text-amber-400 text-xs mt-1">
            Auto-renovação cancelada · acesso até {{ currentPeriodEnd ? formatDate(currentPeriodEnd) : '—' }}, depois passa a Gratuito
          </p>
          <p v-else-if="currentBillingMode === 'push_confirm'" class="text-white/40 text-xs mt-1">
            MB WAY (pago por período){{ currentStatus === 'pending' ? ' · a aguardar confirmação na app MB WAY' : '' }}{{
              currentPeriodEnd ? ` · expira ${formatDate(currentPeriodEnd)}` : ''
            }}
          </p>
          <p v-else-if="currentBillingMode === 'manual_reference'" class="text-white/40 text-xs mt-1">
            Multibanco (pago por período) · {{ currentPeriodEnd ? `expira ${formatDate(currentPeriodEnd)}` : 'sem período ativo' }}
          </p>
        </div>
        <button
          v-if="currentBillingMode === 'auto' && currentStatus === 'active'"
          class="btn-secondary text-sm py-2"
          type="button"
          :disabled="canceling"
          @click="handleCancel"
        >
          {{ canceling ? 'A cancelar...' : 'Cancelar auto-renovação' }}
        </button>
        <button
          v-else-if="(currentBillingMode === 'push_confirm' || currentBillingMode === 'manual_reference') && currentStatus === 'pending'"
          class="btn-secondary text-sm py-2"
          type="button"
          :disabled="checkingPayment"
          @click="handleCheckPayment"
        >
          {{ checkingPayment ? 'A verificar...' : 'Verificar pagamento' }}
        </button>
      </div>
    </div>

    <!-- Referência Multibanco por pagar -->
    <div v-if="multibancoReference" class="glass-card rounded-3xl p-6 border border-amber-500/30">
      <p class="text-white font-semibold">Tens uma referência Multibanco por pagar</p>
      <p class="text-white/50 text-sm mt-2">
        Entidade <span class="font-mono text-brand-300">{{ multibancoEntity }}</span> · Referência
        <span class="font-mono text-brand-300">{{ multibancoReference }}</span>
      </p>
      <p class="text-white/40 text-xs mt-1">
        {{ multibancoExpiresAt ? `Válida até ${formatDate(multibancoExpiresAt)}.` : '' }} Paga no ATM ou homebanking — o plano
        atualiza automaticamente assim que confirmarmos o pagamento.
      </p>
    </div>

    <!-- Plans -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div
        v-for="t in SUBSCRIPTION_TIERS"
        :key="t"
        class="glass-card rounded-3xl p-5 border-2 transition-all cursor-pointer"
        :class="selectedTier === t ? 'border-brand-500' : 'border-transparent hover:border-white/10'"
        @click="selectedTier = t"
      >
        <p class="font-semibold text-white">{{ TIER_LABEL[t] }}</p>
        <p class="text-2xl font-bold text-brand-300 mt-1">
          {{ TIER_PRICE_EUR[t].toFixed(2).replace('.', ',') }} €<span class="text-xs text-white/40 font-normal">/mês</span>
        </p>
        <ul class="mt-3 space-y-1.5 text-xs text-white/50">
          <li v-for="f in planFeatures[t]" :key="f" class="flex items-start gap-1.5">
            <Check class="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> {{ f }}
          </li>
        </ul>
        <p v-if="t === currentTier" class="text-emerald-400 text-xs font-semibold mt-3">Plano atual</p>
      </div>
    </div>

    <!-- Payment method -->
    <div v-if="selectedTier !== 'free' && selectedTier !== currentTier" class="glass-card rounded-3xl p-6 space-y-5">
      <div>
        <label class="form-label">Método de pagamento</label>
        <div class="grid grid-cols-2 gap-2 mt-1.5">
          <button
            v-for="m in METHODS"
            :key="m.value"
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
        <label class="form-label">Período</label>
        <div class="flex gap-2 flex-wrap mt-1.5">
          <button
            v-for="p in PERIODS"
            :key="p"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            :class="periodMonths === p ? 'bg-brand-600 text-white' : 'bg-surface-700/50 text-white/50 hover:text-white'"
            type="button"
            @click="periodMonths = p"
          >
            {{ p }} {{ p === 1 ? 'mês' : 'meses' }}
          </button>
        </div>
      </div>

      <p class="text-white/50 text-sm text-center">
        <template v-if="selectedMethod === 'mbway' || selectedMethod === 'multibanco'">
          Total: <span class="text-brand-300 font-bold">{{ prepaidTotal }} €</span>
          ({{ periodMonths }} × {{ TIER_PRICE_EUR[selectedTier].toFixed(2).replace('.', ',') }} €, sem renovação automática)
        </template>
        <template v-else>{{ TIER_PRICE_EUR[selectedTier].toFixed(2).replace('.', ',') }} €/mês</template>
      </p>

      <button
        class="btn-primary w-full"
        type="button"
        :disabled="submitting"
        @click="beginCheckout"
      >
        {{ submitting ? 'A abrir EasyPay...' : 'Continuar' }}
      </button>
    </div>

    <!-- MB WAY: à espera de confirmação no telemóvel -->
    <div v-if="mbwayWaiting" class="glass-card rounded-3xl p-6 text-center border border-brand-500/30">
      <Loader2 class="w-6 h-6 text-brand-400 animate-spin mx-auto mb-3" />
      <p class="text-white font-semibold">Confirma o pagamento na app MB WAY</p>
      <p class="text-white/40 text-sm mt-1">Vais receber uma notificação no telemóvel associado à tua conta.</p>
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
import { ArrowLeft, Check, Loader2 } from 'lucide-vue-next'
import { SUBSCRIPTION_TIERS, TIER_LABEL, TIER_PRICE_EUR, type SubscriptionTier } from '~/shared/features'

definePageMeta({ layout: 'default' })

const toast = useToastStore()
const sub = useSubscription()
const platform = usePlatform()
const route = useRoute()

const currentTier = sub.tier
const currentStatus = sub.status
const currentBillingMode = sub.billingMode
const currentPaymentMethod = sub.paymentMethod
const currentPeriodEnd = sub.currentPeriodEnd
const multibancoEntity = sub.multibancoEntity
const multibancoReference = sub.multibancoReference
const multibancoExpiresAt = sub.multibancoExpiresAt

const selectedTier = ref<SubscriptionTier>((route.query.tier as SubscriptionTier) || 'pro')

type Method = 'cc' | 'dd' | 'mbway' | 'multibanco'
const METHODS: { value: Method; label: string }[] = [
  { value: 'cc', label: 'Cartão' },
  { value: 'dd', label: 'Débito Direto' },
  { value: 'mbway', label: 'MB WAY' },
  { value: 'multibanco', label: 'Multibanco' },
]
const METHOD_DESCRIPTION: Record<Method, string> = {
  cc: 'Renovação automática mensal — sem ação da tua parte a cada ciclo.',
  dd: 'Renovação automática mensal via mandato de débito direto — IBAN e dados do mandato são pedidos no formulário seguinte, pela própria EasyPay.',
  mbway: 'Pagamento único do período escolhido, confirmado com uma notificação push na app MB WAY. Sem renovação automática.',
  multibanco: 'Pagamento único do período escolhido, através de uma referência para pagar no ATM ou homebanking. Sem renovação automática.',
}
const selectedMethod = ref<Method>('cc')
const PERIODS = [1, 3, 6, 12] as const
const periodMonths = ref<(typeof PERIODS)[number]>(1)
const prepaidTotal = computed(() => (TIER_PRICE_EUR[selectedTier.value] * periodMonths.value).toFixed(2).replace('.', ','))

const submitting = ref(false)
const canceling = ref(false)
const checkingPayment = ref(false)
const mbwayWaiting = ref(false)
const checkoutOpen = ref(false)
const confirming = ref(false)

const planFeatures: Record<SubscriptionTier, string[]> = {
  free: ['Dashboard e KPIs básicos', 'Até 50 transações/mês', '2 categorias personalizadas'],
  pro: ['Transações e categorias ilimitadas', 'Grupos e orçamentos', 'Estatísticas avançadas', 'Exportar CSV'],
  premium: ['Tudo do Pro', 'Previsões com IA (ConvNeXt-1D)', 'Suporte prioritário'],
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-PT')
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
// que é o comportamento que precisamos aqui. A app Android (Capacitor)
// mantém-se dentro do WebView — sem `@capacitor/browser`; mantemos só um
// disclosure ligeiro antes de iniciar, já que continua a ser um pagamento
// fora do Google Play Billing (âmbito exato da tarefa 10, por confirmar).
let checkoutInstance: { unmount: () => void } | null = null

async function beginCheckout() {
  if (platform.isNative.value && !confirm('Vais completar o pagamento através da EasyPay. Continuar?')) {
    return
  }

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
      language: 'pt_PT',
      onSuccess: async (checkoutInfo: unknown) => {
        console.log('[EasyPay] onSuccess checkoutInfo:', checkoutInfo)
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
          const r = await $fetch('/api/subscription/easypay/confirm', {
            method: 'POST',
            body: { checkoutId: manifest.id },
          })
          console.log('[EasyPay] confirm respondeu:', r)
        } catch (e) {
          console.error('[EasyPay] confirm falhou:', e)
        }

        submitting.value = false
        confirming.value = false
        checkoutOpen.value = false
        checkoutInstance?.unmount()
        if (selectedMethod.value === 'mbway') mbwayWaiting.value = true
        toast.success('Pagamento confirmado! Verifica o estado da subscrição abaixo.')
        pollUntilConfirmed()
      },
      onError: (error: { code: string }) => {
        submitting.value = false
        mbwayWaiting.value = false
        checkoutOpen.value = false
        toast.error(`Erro no checkout EasyPay (${error.code})`)
        checkoutInstance?.unmount()
      },
      onPaymentError: () => {
        toast.error('Pagamento falhou — podes tentar outro método no formulário.')
      },
      onClose: () => {
        submitting.value = false
        checkoutOpen.value = false
      },
    })
  } catch (e: any) {
    toast.error(e?.data?.message || e?.message || 'Erro ao iniciar pagamento EasyPay')
    submitting.value = false
    checkoutOpen.value = false
  }
}

async function pollUntilConfirmed() {
  for (let i = 0; i < 15; i++) {
    await sub.refresh()
    if (sub.tier.value === selectedTier.value) {
      toast.success('Pagamento confirmado! 🎉')
      break
    }
    await new Promise((r) => setTimeout(r, 2000))
  }
  mbwayWaiting.value = false
}

async function handleCancel() {
  if (!confirm('Cancelar a auto-renovação? Deixas de ser cobrado, mas o acesso ao plano mantém-se até ao fim do período já pago.')) return
  canceling.value = true
  try {
    await $fetch('/api/subscription/easypay/cancel', { method: 'POST' })
    toast.success('Auto-renovação cancelada')
    await sub.refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || e?.message || 'Erro ao cancelar')
  } finally {
    canceling.value = false
  }
}

async function handleCheckPayment() {
  checkingPayment.value = true
  try {
    const r = await $fetch<{ status: string }>('/api/subscription/easypay/check-payment', { method: 'POST' })
    if (r.status === 'active') {
      toast.success('Pagamento confirmado! 🎉')
    } else {
      toast.info('Ainda não recebemos a confirmação do pagamento — tenta outra vez mais tarde.')
    }
    await sub.refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || e?.message || 'Erro ao verificar o pagamento')
  } finally {
    checkingPayment.value = false
  }
}

if (route.query.canceled) {
  toast.info('Pagamento cancelado')
}
</script>
