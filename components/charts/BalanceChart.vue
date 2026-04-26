<template>
  <ClientOnly>
    <div class="relative h-64">
      <Line v-if="chartData" :data="chartData" :options="opts" />
      <ChartSkeleton v-else-if="loading" />
      <ChartEmpty v-else />
    </div>
    <template #fallback><ChartSkeleton /></template>
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
  return {
    labels: props.data.map(m => formatMonthYear(m.month)),
    datasets: [
      {
        label: 'Receitas',
        data: props.data.map(m => m.income),
        borderColor: '#34d399',
        backgroundColor: 'rgba(52,211,153,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: '#34d399',
        borderWidth: 2.5,
      },
      {
        label: 'Despesas',
        data: props.data.map(m => m.expense),
        borderColor: '#fb7185',
        backgroundColor: 'rgba(251,113,133,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: '#fb7185',
        borderWidth: 2.5,
      },
    ],
  }
})

const opts = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`,
      },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 } },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: {
        color: 'rgba(255,255,255,0.4)',
        font: { size: 11 },
        callback: (v: any) => formatCurrency(v),
      },
    },
  },
}))
</script>
