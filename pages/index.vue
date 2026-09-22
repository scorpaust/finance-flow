<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Greeting -->
    <div class="flex items-start justify-between flex-wrap gap-4">
      <div>
        <h2 class="font-display font-bold text-2xl sm:text-3xl text-white">
          {{ greeting }}, <span class="gradient-text">{{ firstName }}</span> 👋
        </h2>
        <p class="text-white/40 mt-1 text-sm">{{ t('dashboard.subtitle') }}</p>
      </div>
      <div class="flex items-center flex-wrap gap-2">
        <select v-model="selectedPeriod" class="form-select text-sm py-2 w-auto" @change="loadStats">
          <option value="3">{{ t('dashboard.period3') }}</option>
          <option value="6">{{ t('dashboard.period6') }}</option>
          <option value="12">{{ t('dashboard.period12') }}</option>
        </select>
        <button
          class="btn-primary text-sm py-2 px-4 flex items-center gap-2"
          type="button"
          @click="showModal = true"
        >
          <Plus class="w-4 h-4" />
          {{ t('dashboard.newTransaction') }}
        </button>
        <DocumentScanButton @scanned="onScanned" @manual="openManual" />
        <button
          class="flex items-center gap-2 rounded-2xl border border-rose-500/30 px-4 py-2 text-sm font-semibold text-rose-400 transition-all hover:border-rose-400 hover:bg-rose-500/10"
          type="button"
          @click="auth.signOut()"
        >
          <LogOut class="w-4 h-4" />
          {{ t('dashboard.signOut') }}
        </button>
      </div>
    </div>

    <UpsellBanner />

    <!-- Quick navigation -->
    <div class="flex flex-wrap gap-2">
      <NuxtLink to="/transactions" class="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
        <ArrowLeftRight class="w-4 h-4" /> {{ t('dashboard.navTransactions') }}
      </NuxtLink>
      <NuxtLink to="/groups" class="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
        <Layers class="w-4 h-4" /> {{ t('dashboard.navGroups') }}
      </NuxtLink>
      <NuxtLink to="/stats" class="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
        <BarChart3 class="w-4 h-4" /> {{ t('dashboard.navStats') }}
      </NuxtLink>
      <NuxtLink to="/predictions" class="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
        <Brain class="w-4 h-4" /> {{ t('dashboard.navPredictions') }}
      </NuxtLink>
      <NuxtLink to="/investimento" class="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
        <TrendingUp class="w-4 h-4" /> {{ t('dashboard.navInvestments') }}
      </NuxtLink>
      <NuxtLink to="/settings" class="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
        <Settings class="w-4 h-4" /> {{ t('dashboard.navSettings') }}
      </NuxtLink>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <KpiCard
        :title="t('dashboard.kpiBalance')"
        :value="stats?.overview.currentBalance || 0"
        :change="stats?.overview.incomeChange"
        icon="💰"
        color="brand"
        :loading="loading"
      />
      <KpiCard
        :title="t('dashboard.kpiIncome')"
        :value="stats?.overview.currentMonthIncome || 0"
        :change="stats?.overview.incomeChange"
        icon="📈"
        color="emerald"
        :loading="loading"
      />
      <KpiCard
        :title="t('dashboard.kpiExpense')"
        :value="stats?.overview.currentMonthExpense || 0"
        :change="stats?.overview.expenseChange"
        icon="📉"
        color="rose"
        :invert="true"
        :loading="loading"
      />
      <KpiCard
        :title="t('dashboard.kpiSavingsRate')"
        :value="stats?.overview.savingsRate || 0"
        icon="🎯"
        color="purple"
        :is-percentage="true"
        :loading="loading"
      />
    </div>

    <!-- AI forecast entry point -->
    <div class="glass-card rounded-3xl p-5 border border-brand-500/20">
      <div class="flex flex-col lg:flex-row lg:items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center shrink-0">
          <Brain class="w-6 h-6 text-brand-400" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-white">{{ t('dashboard.forecastTitle') }}</h3>
          <p class="text-white/45 text-sm mt-1">
            {{ t('dashboard.forecastDescription') }}
          </p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button
            class="btn-primary text-sm py-2 flex items-center gap-2"
            :disabled="isTraining"
            @click="runDashboardPrediction"
          >
            <Loader2 v-if="isTraining" class="w-4 h-4 animate-spin" />
            <Brain v-else class="w-4 h-4" />
            {{ isTraining ? t('dashboard.forecastTraining') : t('dashboard.forecastRun') }}
          </button>
          <NuxtLink to="/predictions" class="btn-secondary text-sm py-2 px-4">
            {{ t('dashboard.forecastDetail') }}
          </NuxtLink>
        </div>
      </div>

      <div v-if="predictionResult" class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
        <div
          v-for="forecast in predictionResult.forecasts"
          :key="forecast.month"
          class="bg-surface-700/30 rounded-2xl p-4 border border-white/10"
        >
          <p class="text-white/50 text-xs font-medium capitalize mb-3">{{ formatMonthYear(forecast.month) }}</p>
          <div class="space-y-1.5 text-sm">
            <div class="flex justify-between gap-3">
              <span class="text-white/40">{{ t('dashboard.forecastIncome') }}</span>
              <span class="text-emerald-400 font-semibold">{{ formatCompact(forecast.income.value) }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-white/40">{{ t('dashboard.forecastExpense') }}</span>
              <span class="text-rose-400 font-semibold">{{ formatCompact(forecast.expense.value) }}</span>
            </div>
            <div class="flex justify-between gap-3 border-t border-white/10 pt-1.5 mt-1.5">
              <span class="text-white/40">{{ t('dashboard.forecastBalance') }}</span>
              <span class="font-semibold" :class="forecast.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                {{ formatCompact(forecast.balance) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Balance evolution -->
      <div class="lg:col-span-2 chart-wrapper">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="font-semibold text-white">{{ t('dashboard.chartBalanceTitle') }}</h3>
            <p class="text-white/40 text-xs mt-0.5">{{ t('dashboard.chartBalanceSubtitle') }}</p>
          </div>
          <div class="flex items-center gap-3 text-xs text-white/50">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />{{ t('dashboard.chartIncomeLegend') }}</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />{{ t('dashboard.chartExpenseLegend') }}</span>
          </div>
        </div>
        <BalanceChart :data="stats?.monthly || []" :loading="loading" />
      </div>

      <!-- Donut breakdown -->
      <div class="chart-wrapper">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="font-semibold text-white">{{ t('dashboard.chartCategoryTitle') }}</h3>
            <p class="text-white/40 text-xs mt-0.5">{{ t('dashboard.chartCategorySubtitle') }}</p>
          </div>
          <select v-model="donutType" class="form-select text-xs py-1.5 w-28">
            <option value="expense">{{ t('dashboard.donutExpense') }}</option>
            <option value="income">{{ t('dashboard.donutIncome') }}</option>
          </select>
        </div>
        <CategoryDonut
          :categories="filteredTopCategories"
          :loading="loading"
        />
      </div>
    </div>

    <!-- Budget alerts -->
    <div v-if="stats?.budgetGroups?.length" class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 glass-card rounded-3xl p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-semibold text-white">{{ t('dashboard.budgetTitle') }}</h3>
            <p class="text-white/40 text-xs mt-0.5">{{ t('dashboard.budgetSubtitle') }}</p>
          </div>
          <span class="text-xs text-white/40">{{ t('dashboard.budgetAlertThreshold') }}</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="group in stats.budgetGroups"
            :key="group._id"
            class="bg-surface-700/30 rounded-2xl p-3 border"
            :class="budgetBorderClass(group.status)"
          >
            <div class="flex items-center justify-between gap-3 mb-2">
              <div class="min-w-0">
                <p class="text-sm font-semibold text-white truncate">{{ group.name }}</p>
                <p class="text-xs text-white/40">
                  {{ formatCurrency(group.spent) }} / {{ formatCurrency(group.monthlyLimit) }}
                </p>
              </div>
              <span class="text-xs font-bold" :class="budgetTextClass(group.status)">
                {{ Math.round(group.percent) }}%
              </span>
            </div>
            <div class="progress-bar h-2">
              <div
                class="h-full rounded-full transition-all duration-700"
                :style="{ width: Math.min(100, Math.max(0, group.percent)) + '%', background: budgetColor(group.status, group.color) }"
              />
            </div>
            <p class="text-xs text-white/35 mt-2">
              {{ t('dashboard.budgetRemaining') }}: {{ formatCurrency(group.remaining) }}
              <span v-if="group.weeklyLimit"> · {{ t('dashboard.budgetWeek') }}: {{ formatCurrency(group.weeklyLimit) }}</span>
            </p>
          </div>
        </div>
      </div>

      <div class="glass-card rounded-3xl p-5">
        <h3 class="font-semibold text-white mb-4">{{ t('dashboard.alertsTitle') }}</h3>
        <div v-if="stats.budgetAlerts?.length" class="space-y-3">
          <div
            v-for="alert in stats.budgetAlerts.slice(0, 5)"
            :key="alert._id"
            class="rounded-2xl p-3 border"
            :class="alert.status === 'danger' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-yellow-500/10 border-yellow-500/30'"
          >
            <p class="text-sm font-semibold" :class="budgetTextClass(alert.status)">{{ alert.name }}</p>
            <p class="text-xs text-white/55 mt-1">
              {{ alert.status === 'danger' ? t('dashboard.alertOver') : t('dashboard.alertNear') }}:
              {{ t('dashboard.alertDetail', { spent: formatCurrency(alert.spent), limit: formatCurrency(alert.monthlyLimit) }) }}
            </p>
          </div>
        </div>
        <div v-else class="text-sm text-white/40">
          {{ t('dashboard.alertsEmpty') }}
        </div>
      </div>
    </div>

    <!-- Recent transactions + Quick stats -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Recent transactions -->
      <div class="lg:col-span-2 glass-card rounded-3xl overflow-hidden">
        <div class="flex items-center justify-between p-6 border-b border-white/[0.08]">
          <div>
            <h3 class="font-semibold text-white">{{ t('dashboard.recentTitle') }}</h3>
            <p class="text-white/40 text-xs mt-0.5">{{ t('dashboard.recentTotal', { count: finance.total }) }}</p>
          </div>
          <NuxtLink to="/transactions" class="text-brand-400 text-sm hover:text-brand-300 transition-colors font-medium">
            {{ t('dashboard.recentViewAll') }}
          </NuxtLink>
        </div>
        <div class="divide-y divide-white/5">
          <TransactionRow
            v-for="tx in recentTransactions"
            :key="tx._id"
            :transaction="tx"
            @edit="editTx = tx; showModal = true"
            @delete="handleDelete(tx._id)"
          />
          <div v-if="!recentTransactions.length && !finance.loading" class="py-12 text-center text-white/30">
            <p class="text-4xl mb-3">📭</p>
            <p class="text-sm">{{ t('dashboard.recentEmpty') }}</p>
            <button class="btn-primary text-sm mt-4 py-2" @click="showModal = true">{{ t('dashboard.recentAddFirst') }}</button>
          </div>
        </div>
      </div>

      <!-- Quick insights -->
      <div class="space-y-4">
        <!-- Monthly balance card -->
        <div class="glass-card rounded-3xl p-5">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2">
            <span>📊</span> {{ t('dashboard.monthCardTitle') }}
          </h3>
          <div class="space-y-3">
            <div>
              <div class="flex justify-between text-xs text-white/50 mb-1">
                <span>{{ t('dashboard.monthSavings') }}</span>
                <span>{{ formatCurrency(monthBalance) }}</span>
              </div>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: Math.max(0, Math.min(100, savingsPercent)) + '%' }"
                  :class="savingsPercent < 0 ? '!bg-gradient-to-r !from-rose-600 !to-rose-400' : ''"
                />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2 mt-4">
              <div class="bg-emerald-500/10 rounded-2xl p-3 border border-emerald-500/20">
                <p class="text-emerald-400 text-xs font-medium mb-1">{{ t('dashboard.monthIncome') }}</p>
                <p class="text-white font-bold text-sm">{{ formatCompact(stats?.overview.currentMonthIncome || 0) }}</p>
              </div>
              <div class="bg-rose-500/10 rounded-2xl p-3 border border-rose-500/20">
                <p class="text-rose-400 text-xs font-medium mb-1">{{ t('dashboard.monthExpense') }}</p>
                <p class="text-white font-bold text-sm">{{ formatCompact(stats?.overview.currentMonthExpense || 0) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Top categories -->
        <div class="glass-card rounded-3xl p-5">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2">
            <span>🏆</span> {{ t('dashboard.topCategoriesTitle') }}
          </h3>
          <div class="space-y-2">
            <div
              v-for="cat in topExpenseCategories.slice(0, 4)"
              :key="cat._id"
              class="flex items-center gap-3"
            >
              <span class="text-lg w-7">{{ cat.icon }}</span>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between text-xs mb-0.5">
                  <span class="text-white/70 truncate">{{ cat.name }}</span>
                  <span class="text-white font-medium ml-2 shrink-0">{{ formatCompact(cat.total) }}</span>
                </div>
                <div class="progress-bar h-1.5">
                  <div
                    class="progress-fill h-full"
                    :style="{ width: (cat.total / maxCatTotal * 100) + '%', background: cat.color }"
                  />
                </div>
              </div>
            </div>
            <div v-if="!topExpenseCategories.length && !loading" class="text-center text-white/30 py-4 text-sm">
              {{ t('dashboard.topCategoriesEmpty') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transaction modal -->
    <TransactionModal
      v-if="showModal"
      :transaction="editTx"
      :prefill="scanPrefill"
      @close="showModal = false; editTx = null; scanPrefill = null"
      @saved="onSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { Brain, Loader2, LogOut, Plus, ArrowLeftRight, Layers, BarChart3, Settings, TrendingUp } from 'lucide-vue-next'
import type { Transaction, DocumentScanResult } from '~/types'

definePageMeta({ layout: 'default' })

const auth = useAuthStore()
const finance = useFinanceStore()
const toast = useToastStore()
const { formatCurrency, formatCompact, formatMonthYear } = useFormatters()
const { t } = useI18n()
const ml = useMLPrediction()
const isTraining = ml.isTraining

const loading = ref(false)
const stats = ref<any>(null)
const predictionResult = ref<any>(null)
const selectedPeriod = ref('6')
const donutType = ref<'income' | 'expense'>('expense')
const showModal = ref(false)
const editTx = ref<Transaction | null>(null)
const scanPrefill = ref<DocumentScanResult | null>(null)

const firstName = computed(() => auth.user?.name?.split(' ')[0] || 'Utilizador')
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return t('dashboard.greetingMorning')
  if (h < 18) return t('dashboard.greetingAfternoon')
  return t('dashboard.greetingEvening')
})

async function loadStats() {
  loading.value = true
  try {
    stats.value = await $fetch('/api/stats/overview', { params: { months: selectedPeriod.value } })
  } finally {
    loading.value = false
  }
}

const recentTransactions = computed(() => finance.transactions.slice(0, 8))

const filteredTopCategories = computed(() =>
  (stats.value?.topCategories || []).filter((c: any) => c.type === donutType.value)
)

const topExpenseCategories = computed(() =>
  (stats.value?.topCategories || []).filter((c: any) => c.type === 'expense')
)

const maxCatTotal = computed(() => Math.max(...topExpenseCategories.value.map((c: any) => c.total), 1))

const monthBalance = computed(() =>
  (stats.value?.overview.currentMonthIncome || 0) - (stats.value?.overview.currentMonthExpense || 0)
)

const savingsPercent = computed(() => {
  const inc = stats.value?.overview.currentMonthIncome || 0
  if (!inc) return 0
  return (monthBalance.value / inc) * 100
})

function budgetTextClass(status: string) {
  if (status === 'danger') return 'text-rose-400'
  if (status === 'warning') return 'text-yellow-400'
  return 'text-emerald-400'
}

function budgetBorderClass(status: string) {
  if (status === 'danger') return 'border-rose-500/30'
  if (status === 'warning') return 'border-yellow-500/30'
  return 'border-white/10'
}

function budgetColor(status: string, fallback: string) {
  if (status === 'danger') return '#f43f5e'
  if (status === 'warning') return '#eab308'
  return fallback || '#10b981'
}

async function runDashboardPrediction() {
  try {
    const data = await $fetch<any>('/api/predictions/data', { params: { months: 12 } })
    const monthlySeries = data.monthlySeries || []

    if (monthlySeries.length < 2) {
      toast.error(t('dashboard.toastPredictionErrorMinData'))
      return
    }

    predictionResult.value = await ml.predictNextMonths(monthlySeries, 3)
    toast.success(t('dashboard.toastPredictionSuccess'))
  } catch (error: any) {
    toast.error(error?.data?.message || error?.message || t('dashboard.toastPredictionError'))
  }
}

async function handleDelete(id: string) {
  if (!confirm(t('dashboard.confirmDeleteTransaction'))) return
  try {
    await finance.deleteTransaction(id)
    toast.success(t('dashboard.toastTransactionDeleted'))
    await loadStats()
  } catch {
    toast.error(t('dashboard.toastDeleteError'))
  }
}

// Fase 5 — o scan só abre o formulário pré-preenchido; a transação é criada
// quando o utilizador confirma (onSaved).
function onScanned(result: DocumentScanResult) {
  editTx.value = null
  scanPrefill.value = result
  showModal.value = true
}

function openManual() {
  editTx.value = null
  scanPrefill.value = null
  showModal.value = true
}

async function onSaved() {
  showModal.value = false
  editTx.value = null
  scanPrefill.value = null
  toast.success(t('dashboard.toastTransactionSaved'))
  await finance.fetchTransactions({ page: 1 })
  await loadStats()
}

onMounted(async () => {
  await Promise.all([
    loadStats(),
    finance.fetchTransactions({ page: 1, limit: 20 }),
    finance.fetchCategories(),
  ])
})
</script>
