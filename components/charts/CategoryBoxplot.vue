<template>
  <ClientOnly>
    <div class="relative" :style="{ height: Math.max(224, data.length * 44) + 'px' }">
      <Chart v-if="chartData" type="boxplot" :data="chartData" :options="opts" />
      <ChartSkeleton v-else-if="loading" />
      <ChartEmpty v-else />
    </div>
    <template #fallback><ChartSkeleton class="h-56" /></template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { Chart } from 'vue-chartjs'

interface CategoryBoxStats {
  name: string
  icon: string
  color: string
  count: number
  min: number
  q1: number
  median: number
  q3: number
  max: number
  outliers: number[]
}

const props = defineProps<{
  data: CategoryBoxStats[]
  loading?: boolean
}>()
const { t } = useI18n()
const { formatCurrency } = useFormatters()

// Identidade (categoria) -> cor própria da categoria, já usada no resto da
// app (donut, badges) — nunca reatribuída aqui.
const chartData = computed(() => {
  if (!props.data?.length) return null
  return {
    labels: props.data.map((c) => `${c.icon} ${c.name}`),
    datasets: [
      {
        label: t('charts.expenseDistribution'),
        data: props.data.map((c) => ({
          min: c.min,
          q1: c.q1,
          median: c.median,
          q3: c.q3,
          max: c.max,
          outliers: c.outliers,
        })),
        backgroundColor: props.data.map((c) => c.color + '33'),
        borderColor: props.data.map((c) => c.color),
        borderWidth: 2,
        outlierColor: props.data.map((c) => c.color),
        itemRadius: 3,
        itemStyle: 'circle',
        medianColor: '#ffffff',
      },
    ],
  }
})

const opts = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y' as const, // nomes de categorias podem ser longos — horizontal evita colisão de labels
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any) => {
          const s = ctx.raw
          return [
            ` ${t('charts.median')}: ${formatCurrency(s.median)}`,
            ` ${t('charts.q1q3')}: ${formatCurrency(s.q1)} – ${formatCurrency(s.q3)}`,
            ` ${t('charts.minMax')}: ${formatCurrency(s.min)} – ${formatCurrency(s.max)}`,
          ]
        },
      },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 }, callback: (v: any) => formatCurrency(v) },
    },
    y: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 12 } } },
  },
}))
</script>
