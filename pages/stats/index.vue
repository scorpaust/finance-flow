<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <button
          class="btn-secondary text-sm py-2 px-4 mb-4 flex items-center gap-2"
          type="button"
          @click="navigateTo('/')"
        >
          <ArrowLeft class="w-4 h-4" />
          {{ t('common.backToDashboard') }}
        </button>
        <h2 class="font-display font-bold text-2xl text-white">{{ t('stats.title') }}</h2>
        <p class="text-white/40 text-xs mt-0.5">{{ t('stats.subtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <button
          v-for="p in periodOptions"
          :key="p.value"
          class="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
          :class="period === p.value ? 'bg-brand-600 text-white shadow-glow-sm' : 'glass-card text-white/60 hover:text-white'"
          @click="period = p.value; loadStats()"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="card in summaryCards" :key="card.label" class="stat-card">
        <p class="text-white/50 text-xs font-medium mb-2">{{ card.label }}</p>
        <div class="font-display font-bold text-xl" :class="card.colorClass">
          <SkeletonBlock v-if="loading" class="h-7 w-28" />
          <template v-else>{{ card.value }}</template>
        </div>
        <p v-if="card.sub" class="text-white/30 text-xs mt-1">{{ card.sub }}</p>
      </div>
    </div>

    <!-- Charts grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Monthly bar chart -->
      <div class="chart-wrapper">
        <h3 class="font-semibold text-white mb-1">{{ t('stats.chartMonthlyTitle') }}</h3>
        <p class="text-white/40 text-xs mb-5">{{ t('stats.chartMonthlySubtitle') }}</p>
        <BarChart :data="stats?.monthly || []" :loading="loading" />
      </div>

      <!-- Balance trend -->
      <div class="chart-wrapper">
        <h3 class="font-semibold text-white mb-1">{{ t('stats.chartBalanceTitle') }}</h3>
        <p class="text-white/40 text-xs mb-5">{{ t('stats.chartBalanceSubtitle') }}</p>
        <AreaChart :data="stats?.monthly || []" :loading="loading" />
      </div>

      <!-- Expense by category -->
      <div class="chart-wrapper">
        <h3 class="font-semibold text-white mb-1">{{ t('stats.chartExpenseCategoryTitle') }}</h3>
        <p class="text-white/40 text-xs mb-5">{{ t('stats.chartCategorySubtitle') }}</p>
        <HorizontalBarChart
          :data="expenseCategories"
          :loading="loading"
          color="rose"
        />
      </div>

      <!-- Income by category -->
      <div class="chart-wrapper">
        <h3 class="font-semibold text-white mb-1">{{ t('stats.chartIncomeCategoryTitle') }}</h3>
        <p class="text-white/40 text-xs mb-5">{{ t('stats.chartCategorySubtitle') }}</p>
        <HorizontalBarChart
          :data="incomeCategories"
          :loading="loading"
          color="emerald"
        />
      </div>
    </div>

    <!-- Advanced stats (Pro+) -->
    <div>
      <div class="flex items-center gap-2 mb-4">
        <h3 class="font-display font-bold text-lg text-white">{{ t('stats.advancedTitle') }}</h3>
        <span class="text-xs px-2 py-0.5 rounded-full bg-brand-600/30 text-brand-300 font-semibold">Pro</span>
      </div>

      <div v-if="!canUseAdvanced" class="glass-card rounded-3xl p-10 text-center">
        <div class="text-4xl mb-3">📊</div>
        <h4 class="font-semibold text-white mb-2">{{ t('stats.advancedLockedTitle') }}</h4>
        <p class="text-white/40 text-sm mb-6 max-w-md mx-auto">
          {{ t('stats.advancedLockedDescription') }}
        </p>
        <button class="btn-primary" @click="navigateTo('/subscription')">{{ t('common.viewPlans') }}</button>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="chart-wrapper">
          <h3 class="font-semibold text-white mb-1">{{ t('stats.distributionTitle') }}</h3>
          <p class="text-white/40 text-xs mb-5">{{ t('stats.distributionSubtitle') }}</p>
          <DistributionHistogram :data="advancedStats?.distribution || []" :loading="loadingAdvanced" />
        </div>

        <div class="chart-wrapper">
          <h3 class="font-semibold text-white mb-1">{{ t('stats.boxplotTitle') }}</h3>
          <p class="text-white/40 text-xs mb-5">{{ t('stats.boxplotSubtitle') }}</p>
          <CategoryBoxplot :data="advancedStats?.boxplot || []" :loading="loadingAdvanced" />
        </div>
      </div>
    </div>

    <!-- AI stats insights (Pro+) -->
    <StatsInsightCard :months="parseInt(period)" />

    <!-- Monthly detail table -->
    <div class="glass-card rounded-3xl overflow-hidden">
      <div class="p-6 border-b border-white/[0.08]">
        <h3 class="font-semibold text-white">{{ t('stats.monthlyDetailTitle') }}</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr class="bg-surface-800/50">
              <th>{{ t('stats.colMonth') }}</th>
              <th class="text-right text-emerald-400/70">{{ t('stats.colIncome') }}</th>
              <th class="text-right text-rose-400/70">{{ t('stats.colExpense') }}</th>
              <th class="text-right">{{ t('stats.colBalance') }}</th>
              <th class="text-right hidden sm:table-cell">{{ t('stats.colSavings') }}</th>
              <th class="hidden md:table-cell">{{ t('stats.colProgress') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in monthlyTableData" :key="i">
              <td class="font-medium capitalize">{{ row.label }}</td>
              <td class="text-right text-emerald-400 font-semibold">{{ formatCurrency(row.income) }}</td>
              <td class="text-right text-rose-400 font-semibold">{{ formatCurrency(row.expense) }}</td>
              <td class="text-right font-bold" :class="row.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                {{ formatCurrency(row.balance) }}
              </td>
              <td class="text-right hidden sm:table-cell text-white/60">
                {{ row.income > 0 ? ((row.balance / row.income) * 100).toFixed(1) + '%' : '-' }}
              </td>
              <td class="hidden md:table-cell w-40">
                <div class="progress-bar h-1.5">
                  <div
                    class="h-full rounded-full transition-all duration-700"
                    :style="{
                      width: Math.max(0, Math.min(100, row.income > 0 ? (row.balance / row.income) * 100 : 0)) + '%',
                      background: row.balance >= 0 ? '#10b981' : '#f43f5e'
                    }"
                  />
                </div>
              </td>
            </tr>
            <tr v-if="loading">
              <td v-for="i in 6" :key="i">
                <SkeletonBlock class="h-4 w-full" />
              </td>
            </tr>
          </tbody>
          <tfoot v-if="!loading && stats?.monthly?.length">
            <tr class="border-t-2 border-white/[0.15] bg-surface-800/30">
              <td class="font-bold text-white">{{ t('stats.totalRow') }}</td>
              <td class="text-right font-bold text-emerald-400">{{ formatCurrency(totals.income) }}</td>
              <td class="text-right font-bold text-rose-400">{{ formatCurrency(totals.expense) }}</td>
              <td class="text-right font-bold" :class="totals.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                {{ formatCurrency(totals.balance) }}
              </td>
              <td class="text-right text-white/60 hidden sm:table-cell">
                {{ totals.income > 0 ? ((totals.balance / totals.income) * 100).toFixed(1) + '%' : '-' }}
              </td>
              <td class="hidden md:table-cell" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { format } from 'date-fns'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const { dateFnsLocale } = useLocaleFormat()
const { formatCurrency, formatCompact } = useFormatters()
const sub = useSubscription()
const canUseAdvanced = computed(() => sub.hasFeature('statsAdvanced'))
const loading = ref(false)
const stats = ref<any>(null)
const period = ref('6')
const advancedStats = ref<any>(null)
const loadingAdvanced = ref(false)

const periodOptions = computed(() => [
  { value: '3', label: t('stats.period3m') },
  { value: '6', label: t('stats.period6m') },
  { value: '12', label: t('stats.period1y') },
  { value: '24', label: t('stats.period2y') },
])

async function loadStats() {
  loading.value = true
  try {
    stats.value = await $fetch('/api/stats/overview', { params: { months: period.value } })
  } finally {
    loading.value = false
  }
  await loadAdvancedStats()
}

async function loadAdvancedStats() {
  if (!canUseAdvanced.value) return
  loadingAdvanced.value = true
  try {
    advancedStats.value = await $fetch('/api/stats/advanced', { params: { months: period.value } })
  } finally {
    loadingAdvanced.value = false
  }
}

// canUseAdvanced só fica certo depois do fetch assíncrono de useSubscription()
// resolver — se ficou true depois do primeiro loadStats(), vai buscar agora.
watch(canUseAdvanced, (allowed) => {
  if (allowed && !advancedStats.value) loadAdvancedStats()
})

const expenseCategories = computed(() =>
  (stats.value?.topCategories || []).filter((c: any) => c.type === 'expense')
)
const incomeCategories = computed(() =>
  (stats.value?.topCategories || []).filter((c: any) => c.type === 'income')
)

const totals = computed(() => ({
  income: (stats.value?.monthly || []).reduce((s: number, m: any) => s + m.income, 0),
  expense: (stats.value?.monthly || []).reduce((s: number, m: any) => s + m.expense, 0),
  balance: (stats.value?.monthly || []).reduce((s: number, m: any) => s + m.balance, 0),
}))

const summaryCards = computed(() => {
  const monthsSub = t('stats.monthsSuffix', { months: parseInt(period.value) })
  return [
    { label: t('stats.cardTotalIncome'), value: formatCompact(totals.value.income), colorClass: 'text-emerald-400', sub: monthsSub },
    { label: t('stats.cardTotalExpense'), value: formatCompact(totals.value.expense), colorClass: 'text-rose-400', sub: monthsSub },
    { label: t('stats.cardAccumulatedBalance'), value: formatCompact(totals.value.balance), colorClass: totals.value.balance >= 0 ? 'text-emerald-400' : 'text-rose-400' },
    { label: t('stats.cardMonthlyAverage'), value: formatCompact(totals.value.balance / Math.max(1, parseInt(period.value))), colorClass: 'text-white' },
  ]
})

const monthlyTableData = computed(() =>
  [...(stats.value?.monthly || [])].reverse().map((m: any) => {
    const [year, month] = m.month.split('-')
    const d = new Date(parseInt(year), parseInt(month) - 1, 1)
    return {
      ...m,
      label: format(d, 'MMMM yyyy', { locale: dateFnsLocale.value }),
    }
  })
)

onMounted(loadStats)
</script>
