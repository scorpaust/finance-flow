<template>
  <ClientOnly>
    <div class="relative h-72">
      <Line v-if="chartData" :data="chartData" :options="opts" />
      <ChartEmpty v-else />
    </div>
    <template #fallback><ChartSkeleton class="h-72" /></template>
  </ClientOnly>
</template>
<script setup lang="ts">
import { Line } from 'vue-chartjs'
import '~/utils/chartjs'
const props = defineProps<{
  historical: Array<{ month: string; income: number; expense: number }>
  forecasts:  Array<{ month: string; income: { value: number }; expense: { value: number } }>
  // Upgrade 04 — mês em curso (incompleto): pontos à parte, nunca ligados ao histórico.
  current?:   { month: string; income: number; expense: number } | null
}>()
const { t } = useI18n()
const { formatCurrency, formatMonthYear } = useFormatters()

const chartData = computed(() => {
  if (!props.historical?.length) return null
  const hl  = props.historical.length
  const nulls = (n: number) => Array(n).fill(null)

  const histInc = props.historical.map(m => m.income)
  const histExp = props.historical.map(m => m.expense)

  // Bridge: last historical point + forecast
  const bridgeInc = [props.historical[hl - 1].income, ...(props.forecasts || []).map(f => f.income.value)]
  const bridgeExp = [props.historical[hl - 1].expense, ...(props.forecasts || []).map(f => f.expense.value)]

  const allLabels = [
    ...props.historical.map(m => formatMonthYear(m.month)),
    ...(props.forecasts || []).map(f => `${formatMonthYear(f.month)} ✦`),
  ]

  // O mês em curso costuma ser o 1.º mês previsto: os valores reais até hoje
  // aparecem como pontos ocos na mesma coluna, para comparar com a previsão.
  const months = [...props.historical.map(m => m.month), ...(props.forecasts || []).map(f => f.month)]
  const currentIdx = props.current ? months.indexOf(props.current.month) : -1
  const currentPoints = (key: 'income' | 'expense') =>
    months.map((_, i) => (i === currentIdx ? props.current![key] : null))
  const currentDatasets = currentIdx < 0 ? [] : [
    { label: `${t('charts.incomeReal')} (${t('predictions.legendCurrent')})`, data: currentPoints('income'), borderColor: '#34d399', backgroundColor: 'transparent', showLine: false, pointRadius: 6, pointBorderWidth: 2, pointBackgroundColor: 'transparent', pointBorderColor: '#34d399' },
    { label: `${t('charts.expenseReal')} (${t('predictions.legendCurrent')})`, data: currentPoints('expense'), borderColor: '#fb7185', backgroundColor: 'transparent', showLine: false, pointRadius: 6, pointBorderWidth: 2, pointBackgroundColor: 'transparent', pointBorderColor: '#fb7185' },
  ]

  return {
    labels: allLabels,
    datasets: [
      ...currentDatasets,
      { label: t('charts.incomeReal'),     data: histInc, borderColor: '#34d399', fill: false, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#34d399', borderWidth: 2.5 },
      { label: t('charts.expenseReal'),    data: histExp, borderColor: '#fb7185', fill: false, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#fb7185', borderWidth: 2.5 },
      { label: t('charts.incomeForecast'), data: [...nulls(hl - 1), ...bridgeInc], borderColor: '#34d399', backgroundColor: 'rgba(52,211,153,0.08)', fill: false, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#34d399', borderWidth: 2, borderDash: [6, 3] },
      { label: t('charts.expenseForecast'), data: [...nulls(hl - 1), ...bridgeExp], borderColor: '#fb7185', backgroundColor: 'rgba(251,113,133,0.08)', fill: false, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#fb7185', borderWidth: 2, borderDash: [6, 3] },
    ],
  }
})

const opts = computed(() => ({
  responsive: true, maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any) => ctx.raw !== null ? ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` : '',
        filter: (item: any) => item.raw !== null,
      },
    },
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 }, maxRotation: 45 } },
    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 }, callback: (v: any) => formatCurrency(v) } },
  },
}))
</script>
