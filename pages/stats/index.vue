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
          Voltar ao dashboard
        </button>
        <h2 class="font-display font-bold text-2xl text-white">Estatísticas</h2>
        <p class="text-white/40 text-xs mt-0.5">Análise detalhada das tuas finanças</p>
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
          <div v-if="loading" class="skeleton h-7 w-28 rounded" />
          <template v-else>{{ card.value }}</template>
        </div>
        <p v-if="card.sub" class="text-white/30 text-xs mt-1">{{ card.sub }}</p>
      </div>
    </div>

    <!-- Charts grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Monthly bar chart -->
      <div class="chart-wrapper">
        <h3 class="font-semibold text-white mb-1">Receitas vs Despesas</h3>
        <p class="text-white/40 text-xs mb-5">Comparativo mensal</p>
        <BarChart :data="stats?.monthly || []" :loading="loading" />
      </div>

      <!-- Balance trend -->
      <div class="chart-wrapper">
        <h3 class="font-semibold text-white mb-1">Evolução do Saldo</h3>
        <p class="text-white/40 text-xs mb-5">Tendência acumulada</p>
        <AreaChart :data="stats?.monthly || []" :loading="loading" />
      </div>

      <!-- Expense by category -->
      <div class="chart-wrapper">
        <h3 class="font-semibold text-white mb-1">Despesas por Categoria</h3>
        <p class="text-white/40 text-xs mb-5">Distribuição no período</p>
        <HorizontalBarChart
          :data="expenseCategories"
          :loading="loading"
          color="rose"
        />
      </div>

      <!-- Income by category -->
      <div class="chart-wrapper">
        <h3 class="font-semibold text-white mb-1">Receitas por Categoria</h3>
        <p class="text-white/40 text-xs mb-5">Distribuição no período</p>
        <HorizontalBarChart
          :data="incomeCategories"
          :loading="loading"
          color="emerald"
        />
      </div>
    </div>

    <!-- Monthly detail table -->
    <div class="glass-card rounded-3xl overflow-hidden">
      <div class="p-6 border-b border-white/[0.08]">
        <h3 class="font-semibold text-white">Detalhe por Mês</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr class="bg-surface-800/50">
              <th>Mês</th>
              <th class="text-right text-emerald-400/70">Receitas</th>
              <th class="text-right text-rose-400/70">Despesas</th>
              <th class="text-right">Saldo</th>
              <th class="text-right hidden sm:table-cell">Poupança</th>
              <th class="hidden md:table-cell">Progressão</th>
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
                <div class="skeleton h-4 w-full rounded" />
              </td>
            </tr>
          </tbody>
          <tfoot v-if="!loading && stats?.monthly?.length">
            <tr class="border-t-2 border-white/[0.15] bg-surface-800/30">
              <td class="font-bold text-white">Total</td>
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
import { pt } from 'date-fns/locale'

definePageMeta({ layout: 'default' })

const { formatCurrency, formatCompact } = useFormatters()
const loading = ref(false)
const stats = ref<any>(null)
const period = ref('6')

const periodOptions = [
  { value: '3', label: '3M' },
  { value: '6', label: '6M' },
  { value: '12', label: '1A' },
  { value: '24', label: '2A' },
]

async function loadStats() {
  loading.value = true
  try {
    stats.value = await $fetch('/api/stats/overview', { params: { months: period.value } })
  } finally {
    loading.value = false
  }
}

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
  return [
    { label: 'Total Receitas', value: formatCompact(totals.value.income), colorClass: 'text-emerald-400', sub: `${parseInt(period.value)} meses` },
    { label: 'Total Despesas', value: formatCompact(totals.value.expense), colorClass: 'text-rose-400', sub: `${parseInt(period.value)} meses` },
    { label: 'Saldo Acumulado', value: formatCompact(totals.value.balance), colorClass: totals.value.balance >= 0 ? 'text-emerald-400' : 'text-rose-400' },
    { label: 'Média Mensal (saldo)', value: formatCompact(totals.value.balance / Math.max(1, parseInt(period.value))), colorClass: 'text-white' },
  ]
})

const monthlyTableData = computed(() =>
  [...(stats.value?.monthly || [])].reverse().map((m: any) => {
    const [year, month] = m.month.split('-')
    const d = new Date(parseInt(year), parseInt(month) - 1, 1)
    return {
      ...m,
      label: format(d, 'MMMM yyyy', { locale: pt }),
    }
  })
)

onMounted(loadStats)
</script>
