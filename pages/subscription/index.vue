<template>
  <div class="space-y-6 animate-fade-in max-w-3xl">
    <div>
      <button class="btn-secondary text-sm py-2 px-4 mb-4 flex items-center gap-2" type="button" @click="navigateTo('/')">
        <ArrowLeft class="w-4 h-4" /> Voltar ao dashboard
      </button>
      <h2 class="font-display font-bold text-2xl text-white">Subscrição</h2>
      <p class="text-white/40 text-xs mt-1">Escolhe um plano e a forma de pagamento</p>
    </div>

    <!-- Current status -->
    <div class="glass-card rounded-3xl p-6">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p class="text-white/40 text-xs">Plano atual</p>
          <p class="text-white font-bold text-lg">{{ TIER_LABEL[currentTier] }}</p>
          <p v-if="currentPeriodType === 'recurring' && currentStatus === 'active'" class="text-white/40 text-xs mt-1">
            Auto-renovação ativa{{ currentPeriodEnd ? ` · próxima cobrança ${formatDate(currentPeriodEnd)}` : '' }}
          </p>
          <p v-else-if="currentPeriodType === 'recurring' && currentStatus === 'canceled'" class="text-amber-400 text-xs mt-1">
            Auto-renovação cancelada · acesso até {{ currentPeriodEnd ? formatDate(currentPeriodEnd) : '—' }}, depois passa a Gratuito
          </p>
          <p v-else-if="currentPeriodType === 'prepaid'" class="text-white/40 text-xs mt-1">
            Pago por período{{ currentPeriodEnd ? ` · expira ${formatDate(currentPeriodEnd)}` : '' }}
          </p>
        </div>
        <button
          v-if="currentPeriodType === 'recurring' && currentStatus === 'active'"
          class="btn-secondary text-sm py-2"
          type="button"
          :disabled="canceling"
          @click="handleCancel"
        >
          {{ canceling ? 'A cancelar...' : 'Cancelar auto-renovação' }}
        </button>
      </div>
    </div>

    <!-- Referência MB WAY/Multibanco por pagar -->
    <div v-if="pendingPurchase" class="glass-card rounded-3xl p-6 border border-amber-500/30">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p class="text-white font-semibold">
            Tens uma referência {{ pendingPurchase.paymentMethod === 'mbway' ? 'MB WAY' : 'Multibanco' }} por pagar
          </p>
          <p class="text-white/40 text-xs mt-1">
            {{ TIER_LABEL[pendingPurchase.tier] }} · {{ pendingPurchase.periodMonths }}
            {{ pendingPurchase.periodMonths === 1 ? 'mês' : 'meses' }} · criada {{ formatDate(pendingPurchase.createdAt) }}
          </p>
          <p class="text-white/40 text-xs mt-1">
            O teu plano só muda quando o pagamento for confirmado. Não pagaste ou desististe? Podes limpar isto.
          </p>
        </div>
        <button class="btn-secondary text-sm py-2" type="button" :disabled="cancelingPending" @click="handleCancelPending">
          {{ cancelingPending ? 'A limpar...' : 'Limpar referência' }}
        </button>
      </div>
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

    <!-- Mudar de plano in-place (já tem auto-renovação ativa — sem novo checkout) -->
    <div
      v-if="selectedTier !== 'free' && selectedTier !== currentTier && canChangePlanInPlace"
      class="glass-card rounded-3xl p-6 space-y-4 text-center"
    >
      <p class="text-white/50 text-sm">
        Mudar de {{ TIER_LABEL[currentTier] }} para <span class="text-brand-300 font-semibold">{{ TIER_LABEL[selectedTier] }}</span> —
        acesso muda já; a cobrança de {{ TIER_PRICE_EUR[selectedTier].toFixed(2).replace('.', ',') }} €/mês
        só entra em vigor no próximo ciclo (a PayPal não permite prorações automáticas).
      </p>
      <button class="btn-primary w-full" type="button" :disabled="changingPlan" @click="handleChangePlan">
        {{ changingPlan ? 'A mudar de plano...' : `Mudar para ${TIER_LABEL[selectedTier]}` }}
      </button>
    </div>

    <!-- Payment method (only for a paid tier different from the current one, sem subscrição recorrente já ativa) -->
    <div v-else-if="selectedTier !== 'free' && selectedTier !== currentTier" class="glass-card rounded-3xl p-6 space-y-5">
      <div class="flex gap-2 bg-surface-700/50 rounded-2xl p-1">
        <button
          class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
          :class="paymentMode === 'recurring' ? 'bg-brand-600 text-white' : 'text-white/50 hover:text-white'"
          type="button"
          @click="paymentMode = 'recurring'"
        >
          Renovação automática (cartão/PayPal)
        </button>
        <button
          class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
          :class="paymentMode === 'prepaid' ? 'bg-brand-600 text-white' : 'text-white/50 hover:text-white'"
          type="button"
          @click="paymentMode = 'prepaid'"
        >
          Pagar um período (MB WAY/Multibanco)
        </button>
      </div>

      <!-- Recurring -->
      <div v-if="paymentMode === 'recurring'" class="text-center space-y-4">
        <p class="text-white/50 text-sm">
          Cobrança automática de {{ TIER_PRICE_EUR[selectedTier].toFixed(2).replace('.', ',') }} €/mês via PayPal (cartão ou saldo).
        </p>
        <button class="btn-primary w-full" type="button" :disabled="submitting" @click="startRecurring">
          {{ submitting ? 'A abrir PayPal...' : 'Subscrever com PayPal' }}
        </button>
      </div>

      <!-- Prepaid -->
      <div v-else class="space-y-4">
        <div>
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

        <div>
          <label class="form-label">Método</label>
          <div class="flex gap-2 mt-1.5">
            <button
              class="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              :class="prepaidMethod === 'mbway' ? 'bg-brand-600 text-white' : 'bg-surface-700/50 text-white/50 hover:text-white'"
              type="button"
              @click="prepaidMethod = 'mbway'"
            >
              MB WAY
            </button>
            <button
              class="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              :class="prepaidMethod === 'multibanco' ? 'bg-brand-600 text-white' : 'bg-surface-700/50 text-white/50 hover:text-white'"
              type="button"
              @click="prepaidMethod = 'multibanco'"
            >
              Multibanco
            </button>
          </div>
        </div>

        <div v-if="prepaidMethod === 'mbway'">
          <label class="form-label">Nº de telemóvel</label>
          <input v-model="mbwayPhone" class="form-input" type="tel" placeholder="9XXXXXXXX" />
        </div>
        <p v-else class="text-white/40 text-xs">
          Vais receber uma referência Multibanco (entidade + referência) para pagar no ATM ou homebanking. Confirmação até 7 dias.
        </p>

        <p class="text-white/50 text-sm text-center">
          Total: <span class="text-brand-300 font-bold">{{ prepaidTotal }} €</span>
          ({{ periodMonths }} × {{ TIER_PRICE_EUR[selectedTier].toFixed(2).replace('.', ',') }} €, sem auto-renovação)
        </p>

        <button
          class="btn-primary w-full"
          type="button"
          :disabled="submitting || (prepaidMethod === 'mbway' && !mbwayPhone)"
          @click="startPrepaid"
        >
          {{ submitting ? 'A processar...' : 'Pagar agora' }}
        </button>
      </div>
    </div>

    <!-- MB WAY: à espera de confirmação no telemóvel -->
    <div v-if="mbwayWaiting" class="glass-card rounded-3xl p-6 text-center border border-brand-500/30">
      <Loader2 class="w-6 h-6 text-brand-400 animate-spin mx-auto mb-3" />
      <p class="text-white font-semibold">Confirma o pagamento na app MB WAY</p>
      <p class="text-white/40 text-sm mt-1">Vais receber uma notificação no telemóvel associado a este número.</p>
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
const currentPeriodType = sub.periodType
const currentPeriodEnd = sub.currentPeriodEnd
const pendingPurchase = sub.pendingPurchase

const selectedTier = ref<SubscriptionTier>((route.query.tier as SubscriptionTier) || 'pro')
const paymentMode = ref<'recurring' | 'prepaid'>('recurring')
const PERIODS = [1, 3, 6, 12] as const
const periodMonths = ref<(typeof PERIODS)[number]>(1)
const prepaidMethod = ref<'mbway' | 'multibanco'>('mbway')
const mbwayPhone = ref('')
const submitting = ref(false)
const canceling = ref(false)
const cancelingPending = ref(false)
const changingPlan = ref(false)

const canChangePlanInPlace = computed(
  () => currentPeriodType.value === 'recurring' && currentStatus.value === 'active'
)
const mbwayWaiting = ref(false)

const planFeatures: Record<SubscriptionTier, string[]> = {
  free: ['Dashboard e KPIs básicos', 'Até 50 transações/mês', '2 categorias personalizadas'],
  pro: ['Transações e categorias ilimitadas', 'Grupos e orçamentos', 'Estatísticas avançadas', 'Exportar CSV'],
  premium: ['Tudo do Pro', 'Previsões com IA (ConvNeXt-1D)', 'Suporte prioritário'],
}

const prepaidTotal = computed(() => (TIER_PRICE_EUR[selectedTier.value] * periodMonths.value).toFixed(2).replace('.', ','))

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-PT')
}

// Fluxo Android: pagamentos externos ao Google Play Billing exigem disclosure
// explícito antes de sair da app — ver context/features/02-FASE-2-sistema-subscricoes.md tarefa 8.
async function openApprovalUrl(approvalUrl: string) {
  if (platform.isNative.value) {
    if (!confirm('Vais sair da app para completar o pagamento em paypal.com. Continuar?')) {
      submitting.value = false
      return
    }
    const { Browser } = await import('@capacitor/browser')
    await Browser.open({ url: approvalUrl })
  } else {
    window.location.href = approvalUrl
  }
}

async function startRecurring() {
  submitting.value = true
  try {
    const data = await $fetch<{ approvalUrl: string }>('/api/subscription/paypal/create-subscription', {
      method: 'POST',
      body: { tier: selectedTier.value },
    })
    await openApprovalUrl(data.approvalUrl)
  } catch (e: any) {
    toast.error(e?.data?.message || e?.message || 'Erro ao iniciar subscrição PayPal')
    submitting.value = false
  }
}

// MB WAY confirma no telemóvel (sem redirect). Multibanco é redirect-based —
// a página da PayPal é que mostra a referência ao buyer — ver server/utils/paypal.ts.
async function startPrepaid() {
  submitting.value = true
  mbwayWaiting.value = false
  try {
    const data = await $fetch<{ approvalUrl?: string }>('/api/subscription/paypal/create-order', {
      method: 'POST',
      body: {
        tier: selectedTier.value,
        periodMonths: periodMonths.value,
        paymentMethod: prepaidMethod.value,
        phoneNationalNumber: prepaidMethod.value === 'mbway' ? mbwayPhone.value : undefined,
      },
    })

    if (prepaidMethod.value === 'mbway') {
      mbwayWaiting.value = true
      submitting.value = false
      await pollUntilConfirmed()
      return
    }

    if (!data.approvalUrl) {
      toast.error('A PayPal não devolveu o link da referência Multibanco')
      submitting.value = false
      return
    }
    await openApprovalUrl(data.approvalUrl)
  } catch (e: any) {
    toast.error(e?.data?.message || e?.message || 'Erro ao iniciar pagamento PayPal')
    submitting.value = false
  }
}

// Curto polling ao estado da subscrição enquanto se espera pela confirmação
// no telemóvel (webhook assíncrono) — só faz sentido para MB WAY, que é quase
// instantâneo; Multibanco pode demorar até 7 dias, não vale a pena esperar aqui.
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
  if (!confirm('Cancelar a auto-renovação? Deixas de ser cobrado, mas o acesso ao plano termina de imediato.')) return
  canceling.value = true
  try {
    await $fetch('/api/subscription/paypal/cancel', { method: 'POST' })
    toast.success('Auto-renovação cancelada')
    await sub.refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || e?.message || 'Erro ao cancelar')
  } finally {
    canceling.value = false
  }
}

async function handleCancelPending() {
  cancelingPending.value = true
  try {
    await $fetch('/api/subscription/paypal/cancel-pending', { method: 'POST' })
    toast.success('Referência limpa')
    await sub.refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || e?.message || 'Erro ao limpar')
  } finally {
    cancelingPending.value = false
  }
}

async function handleChangePlan() {
  changingPlan.value = true
  try {
    await $fetch('/api/subscription/paypal/change-plan', { method: 'POST', body: { tier: selectedTier.value } })
    toast.success(`Plano mudado para ${TIER_LABEL[selectedTier.value]}!`)
    await sub.refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || e?.message || 'Erro ao mudar de plano')
  } finally {
    changingPlan.value = false
  }
}

if (route.query.canceled) {
  toast.info('Pagamento cancelado')
}
</script>
