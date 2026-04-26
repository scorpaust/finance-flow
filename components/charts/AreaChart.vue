<template>
  <ClientOnly>
    <div class="relative h-56">
      <Line v-if="chartData" :data="chartData" :options="opts" />
      <ChartSkeleton v-else-if="loading" />
      <ChartEmpty v-else />
    </div>
    <template #fallback><ChartSkeleton class="h-56" /></template>
  </ClientOnly>
</template>
<script setup lang="ts">
import { Line } from 'vue-chartjs'
const props = defineProps<{
  data: Array<{ month: string; income: number; expense: number; balance: number }>
  loading?: boolean
}>()
const { formatCurrency, formatMonthYear } = useFormatters()
const chartData = computed(() => {
  if (!props.data?.length) return null
  let running = 0
  const cumulative = props.data.map(m => { running += m.balance; return running })
  return {
    labels: props.data.map(m => formatMonthYear(m.month)),
    datasets: [{
      label: 'Saldo Acumulado',
      data: cumulative,
      borderColor: '#818cf8',
      backgroundColor: 'rgba(99,102,241,0.12)',
      fill: true, tension: 0.4,
      pointRadius: 4, pointHoverRadius: 7,
      pointBackgroundColor: '#818cf8', borderWidth: 2.5,
    }],
  }
})
const opts = computed(() => ({
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (ctx: any) => ` Saldo: ${formatCurrency(ctx.raw)}` } },
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 } } },
    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 }, callback: (v: any) => formatCurrency(v) } },
  },
}))
</script>
