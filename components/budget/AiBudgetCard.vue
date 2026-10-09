<template>
  <div class="glass-card rounded-3xl p-5 sm:p-6 border border-brand-500/20" data-testid="ai-budget-card">
    <div class="flex items-center gap-2 mb-1 flex-wrap">
      <Sparkles class="w-4 h-4 text-brand-400" />
      <h3 class="font-display font-bold text-lg text-white">{{ t('aiBudget.title') }}</h3>
      <span class="text-xs px-2 py-0.5 rounded-full bg-brand-600/30 text-brand-300 font-semibold">{{ t('tiers.premium') }}</span>
    </div>

    <!-- Pro: bloqueado (paywall Premium) -->
    <div v-if="!canUse" class="mt-3">
      <p class="text-white/50 text-sm mb-4 max-w-2xl">{{ t('aiBudget.lockedDescription') }}</p>
      <button class="btn-primary text-sm" type="button" data-testid="ai-budget-locked" @click="showPaywall = true">
        {{ t('common.viewPlans') }}
      </button>
      <PaywallModal
        v-if="showPaywall"
        required-tier="premium"
        :feature-label="t('aiBudget.paywallFeatureLabel')"
        @close="showPaywall = false"
      />
    </div>

    <div v-else-if="loading" class="mt-4 space-y-3">
      <SkeletonBlock rounded="2xl" class="h-16" />
      <SkeletonBlock rounded="2xl" class="h-32" />
    </div>

    <!-- Sem proposta este mês -->
    <div v-else-if="state && !state.proposal" class="mt-3 space-y-4">
      <p class="text-white/50 text-sm max-w-2xl">{{ t('aiBudget.intro') }}</p>

      <p
        v-if="state.completeMonths < state.minMonths"
        class="text-yellow-300/90 text-sm bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-3"
        data-testid="ai-budget-need-months"
      >
        {{ t('aiBudget.needMonths', { min: state.minMonths, have: state.completeMonths }) }}
      </p>

      <p v-else-if="!state.canRequest" class="text-white/50 text-sm">{{ t('aiBudget.pending') }}</p>

      <template v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
          <div>
            <label class="form-label" for="ai-budget-wc">{{ t('aiBudget.workingCapitalLabel') }}</label>
            <div class="flex items-center gap-2">
              <input id="ai-budget-wc" v-model.number="workingCapitalPct" type="number" min="0" :max="BUDGET_MAX_PCT" step="1" class="form-input" />
              <span class="text-white/40 text-sm">%</span>
            </div>
            <p class="text-white/30 text-xs mt-1">{{ t('aiBudget.workingCapitalHelp') }}</p>
          </div>
          <div>
            <label class="form-label" for="ai-budget-savings">{{ t('aiBudget.savingsLabel') }}</label>
            <div class="flex items-center gap-2">
              <input id="ai-budget-savings" v-model.number="savingsPct" type="number" min="0" :max="BUDGET_MAX_PCT" step="1" class="form-input" />
              <span class="text-white/40 text-sm">%</span>
            </div>
            <p class="text-white/30 text-xs mt-1">{{ t('aiBudget.savingsHelp') }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <button
            class="btn-primary text-sm flex items-center gap-2"
            type="button"
            data-testid="ai-budget-request"
            :disabled="requesting || !pctValid"
            @click="requestProposal"
          >
            <Loader2 v-if="requesting" class="w-4 h-4 animate-spin" />
            <Sparkles v-else class="w-4 h-4" />
            {{ requesting ? t('aiBudget.requesting') : t('aiBudget.requestButton') }}
          </button>
          <p class="text-white/30 text-xs">{{ t('aiBudget.oncePerMonth') }}</p>
        </div>
      </template>

      <p class="text-white/25 text-xs">{{ t('aiBudget.privacyNote') }}</p>
    </div>

    <!-- Proposta do mês -->
    <div v-else-if="proposal" class="mt-4 space-y-5" data-testid="ai-budget-proposal">
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div v-for="tile in summaryTiles" :key="tile.key" class="bg-surface-700/40 rounded-2xl p-3">
          <p class="text-white/40 text-xs">{{ tile.label }}</p>
          <p class="font-bold text-sm mt-0.5" :class="tile.class">{{ formatCurrency(tile.value) }}</p>
        </div>
      </div>

      <p
        v-if="proposal.summary.status !== 'ok'"
        class="text-yellow-300/90 text-sm bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-3"
      >
        {{ proposal.summary.status === 'fixedExceedAvailable' ? t('aiBudget.statusFixedExceed') : t('aiBudget.statusTight') }}
      </p>

      <p class="text-white/60 text-sm">
        {{ proposal.source === 'ai' && proposal.overview ? proposal.overview : t(proposal.source === 'ai' ? 'aiBudget.sourceAi' : 'aiBudget.sourceDeterministic') }}
      </p>

      <!-- Categorias -->
      <div v-if="proposal.categories.length">
        <h4 class="text-sm font-semibold text-white/70 mb-2">{{ t('aiBudget.categoriesTitle') }}</h4>
        <div class="hidden sm:grid grid-cols-12 gap-2 px-3 text-xs text-white/30 mb-1">
          <span class="col-span-5">{{ t('aiBudget.colCategory') }}</span>
          <span class="col-span-2 text-right">{{ t('aiBudget.colAverage') }}</span>
          <span class="col-span-3">{{ t('aiBudget.colLimit', { currency: currencySymbol }) }}</span>
          <span class="col-span-2 text-right">{{ t('aiBudget.colDiff') }}</span>
        </div>
        <div class="space-y-1.5">
          <div
            v-for="line in proposal.categories"
            :key="line.id"
            class="grid grid-cols-12 gap-2 items-center bg-surface-700/30 rounded-2xl px-3 py-2.5"
            data-testid="ai-budget-category-row"
          >
            <div class="col-span-12 sm:col-span-5 min-w-0">
              <p class="text-white text-sm font-medium truncate">
                {{ line.name }}
                <span class="ml-1 text-[10px] px-1.5 py-0.5 rounded-full align-middle" :class="kindClass(line.kind)">{{ t(`aiBudget.kind.${line.kind}`) }}</span>
              </p>
              <p class="text-white/35 text-xs mt-0.5">{{ line.note || t(`aiBudget.reason.${line.reason}`) }}</p>
            </div>
            <p class="col-span-4 sm:col-span-2 text-right text-white/60 text-sm">
              <span class="sm:hidden text-white/30 text-xs mr-1">{{ t('aiBudget.colAverage') }}</span>{{ formatCurrency(line.mean) }}
            </p>
            <div class="col-span-5 sm:col-span-3">
              <input
                v-model.number="categoryLimits[line.id]"
                type="number"
                min="0"
                step="1"
                class="form-input py-1.5 text-sm"
                :aria-label="t('aiBudget.limitAria', { name: line.name })"
              />
            </div>
            <p class="col-span-3 sm:col-span-2 text-right text-sm font-semibold" :class="diffClass(categoryLimits[line.id], line.mean)">
              {{ formatDiff(categoryLimits[line.id], line.mean) }}
            </p>
          </div>
        </div>
        <p class="text-xs mt-2" :class="overAvailable ? 'text-rose-400' : 'text-white/40'" data-testid="ai-budget-total">
          {{ t('aiBudget.total', { total: formatCurrency(editedTotalEur), available: formatCurrency(proposal.summary.available) }) }}
          <template v-if="overAvailable"> — {{ t('aiBudget.overAvailable') }}</template>
        </p>
      </div>
      <p v-else class="text-white/40 text-sm">{{ t('aiBudget.noLines') }}</p>

      <!-- Grupos -->
      <div v-if="proposal.groups.length">
        <h4 class="text-sm font-semibold text-white/70 mb-2">{{ t('aiBudget.groupsTitle') }}</h4>
        <div class="space-y-1.5">
          <div
            v-for="g in proposal.groups"
            :key="g.id"
            class="grid grid-cols-12 gap-2 items-center bg-surface-700/30 rounded-2xl px-3 py-2.5"
            data-testid="ai-budget-group-row"
          >
            <p class="col-span-12 sm:col-span-4 text-white text-sm font-medium truncate">{{ g.name }}</p>
            <p class="col-span-4 sm:col-span-2 text-right text-white/60 text-sm">
              <span class="text-white/30 text-xs mr-1">{{ t('aiBudget.colAverage') }}</span>{{ formatCurrency(g.mean) }}
            </p>
            <div class="col-span-4 sm:col-span-3">
              <input
                v-model.number="groupLimits[g.id]"
                type="number"
                min="0"
                step="1"
                class="form-input py-1.5 text-sm"
                :aria-label="t('aiBudget.limitAria', { name: g.name })"
              />
            </div>
            <div class="col-span-4 sm:col-span-3 flex items-center gap-1">
              <input
                v-model.number="groupAlerts[g.id]"
                type="number"
                min="50"
                max="100"
                step="5"
                class="form-input py-1.5 text-sm"
                :aria-label="t('aiBudget.alertAria', { name: g.name })"
              />
              <span class="text-white/40 text-xs">%</span>
            </div>
          </div>
        </div>
        <p class="text-white/30 text-xs mt-1">{{ t('aiBudget.groupsHelp') }}</p>
      </div>

      <div class="flex items-center gap-3 flex-wrap">
        <button
          class="btn-primary text-sm flex items-center gap-2"
          type="button"
          data-testid="ai-budget-apply"
          :disabled="applying || !hasLines"
          @click="applyLimits"
        >
          <Loader2 v-if="applying" class="w-4 h-4 animate-spin" />
          <Check v-else class="w-4 h-4" />
          {{ t('aiBudget.apply') }}
        </button>
        <button
          v-if="proposal.canUndo"
          class="btn-secondary text-sm flex items-center gap-2"
          type="button"
          data-testid="ai-budget-undo"
          :disabled="applying"
          @click="undoLimits"
        >
          <Undo2 class="w-4 h-4" /> {{ t('aiBudget.undo') }}
        </button>
        <p v-if="proposal.appliedAt" class="text-emerald-400/80 text-xs">{{ t('aiBudget.appliedAt', { date: formatDate(proposal.appliedAt, 'dd MMM yyyy HH:mm') }) }}</p>
      </div>

      <p class="text-white/25 text-xs">
        {{ t('aiBudget.nextRequest', { date: formatDate(`${state!.nextRequestMonth}-01`, 'd MMMM yyyy') }) }}
        · {{ t('aiBudget.privacyNote') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sparkles, Loader2, Check, Undo2 } from 'lucide-vue-next'
import { BUDGET_DEFAULT_PCT, BUDGET_MAX_PCT, type BudgetGroupLine, type BudgetLine, type BudgetSummary } from '~/shared/budget'

// Upgrade 04 — orçamento sugerido por IA (Premium), no topo de /groups. Ver
// context/features/upgrades/04-orcamento-ia-e-previsoes.md. Os valores vêm em
// euros; os campos escrevem-se na moeda de apresentação e gravam-se em euros
// (como os tetos dos grupos).

interface Proposal {
  month: string
  settings: { workingCapitalPct: number; savingsPct: number }
  summary: BudgetSummary
  categories: BudgetLine[]
  groups: BudgetGroupLine[]
  source: 'ai' | 'deterministic'
  overview: string | null
  appliedAt: string | null
  canUndo: boolean
}
interface BudgetState {
  month: string
  nextRequestMonth: string
  completeMonths: number
  minMonths: number
  canRequest: boolean
  proposal: Proposal | null
}

const emit = defineEmits<{ applied: [] }>()

const { t } = useI18n()
const toast = useToastStore()
const sub = useSubscription()
const fx = useCurrencyStore()
const { formatCurrency, formatDate, currencySymbol } = useFormatters()
const canUse = computed(() => sub.hasFeature('aiBudget'))

const loading = ref(false)
const requesting = ref(false)
const applying = ref(false)
const showPaywall = ref(false)
const state = ref<BudgetState | null>(null)
const proposal = computed(() => state.value?.proposal || null)

const workingCapitalPct = ref<number>(BUDGET_DEFAULT_PCT.workingCapital)
const savingsPct = ref<number>(BUDGET_DEFAULT_PCT.savings)
const pctValid = computed(() =>
  [workingCapitalPct.value, savingsPct.value].every((v) => typeof v === 'number' && v >= 0 && v <= BUDGET_MAX_PCT)
)

// Campos editáveis, na moeda de apresentação.
const categoryLimits = reactive<Record<string, number | null>>({})
const groupLimits = reactive<Record<string, number | null>>({})
const groupAlerts = reactive<Record<string, number | null>>({})
const toDisplay = (eur: number) => Math.round(fx.fromEur(eur) * 100) / 100

function fillEdits(p: Proposal | null) {
  for (const k of Object.keys(categoryLimits)) delete categoryLimits[k]
  for (const k of Object.keys(groupLimits)) delete groupLimits[k]
  for (const k of Object.keys(groupAlerts)) delete groupAlerts[k]
  if (!p) return
  for (const l of p.categories) categoryLimits[l.id] = toDisplay(l.limit)
  for (const g of p.groups) {
    groupLimits[g.id] = toDisplay(g.limit)
    groupAlerts[g.id] = g.alertThreshold
  }
}
watch(proposal, fillEdits)
// Mudar a moeda de apresentação volta a converter os valores propostos.
watch(() => fx.rate, () => fillEdits(proposal.value))

const hasLines = computed(() => !!proposal.value && (proposal.value.categories.length + proposal.value.groups.length) > 0)
const editedTotalEur = computed(() =>
  (proposal.value?.categories || []).reduce((s, l) => s + fx.toEur(Number(categoryLimits[l.id]) || 0), 0)
)
const overAvailable = computed(() => !!proposal.value && editedTotalEur.value > proposal.value.summary.available + 0.5)

const summaryTiles = computed(() => {
  const p = proposal.value
  if (!p) return []
  return [
    { key: 'income', label: t('aiBudget.summaryIncome'), value: p.summary.expectedIncome, class: 'text-emerald-400' },
    { key: 'fixed', label: t('aiBudget.summaryFixed'), value: p.summary.fixedTotal, class: 'text-white' },
    { key: 'wc', label: t('aiBudget.summaryWorkingCapital', { pct: p.settings.workingCapitalPct }), value: p.summary.workingCapital, class: 'text-white' },
    { key: 'savings', label: t('aiBudget.summarySavings', { pct: p.settings.savingsPct }), value: p.summary.savings, class: 'text-white' },
    { key: 'available', label: t('aiBudget.summaryAvailable'), value: p.summary.available, class: 'text-brand-300' },
  ]
})

function kindClass(kind: string) {
  if (kind === 'fixed') return 'bg-sky-500/15 text-sky-300'
  if (kind === 'discretionary') return 'bg-amber-500/15 text-amber-300'
  return 'bg-white/10 text-white/50'
}
function diffEur(limitDisplay: number | null | undefined, meanEur: number) {
  return fx.toEur(Number(limitDisplay) || 0) - meanEur
}
function diffClass(limitDisplay: number | null | undefined, meanEur: number) {
  const d = diffEur(limitDisplay, meanEur)
  return d < -0.5 ? 'text-rose-400' : d > 0.5 ? 'text-emerald-400' : 'text-white/40'
}
function formatDiff(limitDisplay: number | null | undefined, meanEur: number) {
  const d = diffEur(limitDisplay, meanEur)
  return `${d > 0 ? '+' : ''}${formatCurrency(d)}`
}

async function load() {
  loading.value = true
  try {
    state.value = await $fetch<BudgetState>('/api/insights/budget')
  } catch (e: any) {
    if (e?.data?.data?.error !== 'feature_locked') toast.error(t('aiBudget.errorGeneric'))
  } finally {
    loading.value = false
  }
}

async function requestProposal() {
  requesting.value = true
  try {
    state.value = await $fetch<BudgetState>('/api/insights/budget', {
      method: 'POST',
      body: { workingCapitalPct: workingCapitalPct.value, savingsPct: savingsPct.value },
    })
  } catch (e: any) {
    // 400 (meses insuficientes) e 429 (já pediu este mês) vêm traduzidos do servidor.
    toast.error(e?.data?.message && [400, 429].includes(e?.statusCode) ? e.data.message : t('aiBudget.errorGeneric'))
    await load()
  } finally {
    requesting.value = false
  }
}

async function applyLimits() {
  const p = proposal.value
  if (!p) return
  applying.value = true
  try {
    await $fetch('/api/budget/apply', {
      method: 'POST',
      body: {
        categories: p.categories.map((l) => ({ id: l.id, monthlyLimit: fx.toEur(Math.max(0, Number(categoryLimits[l.id]) || 0)) })),
        groups: p.groups.map((g) => ({
          id: g.id,
          monthlyLimit: fx.toEur(Math.max(0, Number(groupLimits[g.id]) || 0)),
          alertThreshold: Math.min(100, Math.max(50, Math.round(Number(groupAlerts[g.id]) || 80))),
        })),
      },
    })
    p.canUndo = true
    p.appliedAt = new Date().toISOString()
    toast.success(t('aiBudget.toastApplied'))
    emit('applied')
  } catch (e: any) {
    toast.error(e?.data?.message || t('aiBudget.toastError'))
  } finally {
    applying.value = false
  }
}

async function undoLimits() {
  const p = proposal.value
  if (!p) return
  applying.value = true
  try {
    await $fetch('/api/budget/undo', { method: 'POST' })
    p.canUndo = false
    p.appliedAt = null
    toast.success(t('aiBudget.toastUndone'))
    emit('applied')
  } catch (e: any) {
    toast.error(e?.data?.message || t('aiBudget.toastError'))
  } finally {
    applying.value = false
  }
}

watch(canUse, (allowed) => {
  if (allowed) load()
}, { immediate: true })
</script>
