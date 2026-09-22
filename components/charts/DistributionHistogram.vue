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
  data: Array<{ rangeStart: number; rangeEnd: number; count: number }>
  loading?: boolean
}>()
const { t } = useI18n()
const { formatCompact } = useFormatters()

// Um único hue (magnitude já está codificada na altura da barra — cor
// variável por barra seria redundante/"rainbow bar chart").
const BAR_COLOR = 'rgba(99,102,241,0.75)' // brand-500

const chartData = computed(() => {
  if (!props.data?.length) return null
  return {
    labels: props.data.map((b) => `${formatCompact(b.rangeStart)}–${formatCompact(b.rangeEnd)}`),
    datasets: [
      {
        label: t('charts.transactions'),
        data: props.data.map((b) => b.count),
        backgroundColor: BAR_COLOR,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }
})

const opts = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: (items: any) => `${t('charts.between')} ${items[0].label}`,
        label: (ctx: any) => ` ${ctx.raw === 1 ? t('charts.transactionSingular', { count: ctx.raw }) : t('charts.transactionsPlural', { count: ctx.raw })}`,
      },
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 }, maxRotation: 0 } },
    y: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 }, precision: 0 },
    },
  },
}))
</script>
