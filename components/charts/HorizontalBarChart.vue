<template>
  <ClientOnly>
    <div class="relative h-56">
      <Bar v-if="chartData" :data="chartData" :options="opts" />
      <ChartSkeleton v-else-if="loading" />
      <ChartEmpty v-else />
    </div>
    <template #fallback><ChartSkeleton class="h-56" /></template>
  </ClientOnly>
</template>
<script setup lang="ts">
import { Bar } from 'vue-chartjs'
const props = defineProps<{
  data: Array<{ name: string; icon: string; color: string; total: number }>
  loading?: boolean
  color?: string
}>()
const { formatCurrency } = useFormatters()
const chartData = computed(() => {
  if (!props.data?.length) return null
  const top = [...props.data].sort((a, b) => b.total - a.total).slice(0, 7)
  return {
    labels: top.map(c => `${c.icon} ${c.name}`),
    datasets: [{
      data: top.map(c => c.total),
      backgroundColor: top.map(c => c.color + 'bb'),
      borderColor: top.map(c => c.color),
      borderWidth: 1, borderRadius: 6, borderSkipped: false,
    }],
  }
})
const opts = computed(() => ({
  indexAxis: 'y' as const,
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (ctx: any) => ` ${formatCurrency(ctx.raw)}` } },
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 }, callback: (v: any) => formatCurrency(v) } },
    y: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 11 } } },
  },
}))
</script>
