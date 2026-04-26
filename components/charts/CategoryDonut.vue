<template>
  <ClientOnly>
    <div class="flex flex-col items-center gap-4">
      <div class="relative h-48 w-48">
        <Doughnut v-if="chartData" :data="chartData" :options="opts" />
        <ChartEmpty v-else-if="!loading && !categories?.length" />
        <ChartSkeleton v-else-if="loading" />
        <div v-if="!loading && chartData" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p class="text-white/40 text-xs">Total</p>
          <p class="text-white font-bold text-sm">{{ formatCompact(total) }}</p>
        </div>
      </div>
      <div class="w-full space-y-1.5 max-h-32 overflow-y-auto no-scrollbar">
        <div v-for="cat in categories?.slice(0, 8)" :key="cat._id" class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: cat.color }" />
          <span class="text-xs text-white/60 flex-1 truncate">{{ cat.icon }} {{ cat.name }}</span>
          <span class="text-xs text-white/80 font-medium tabular-nums">{{ formatCompact(cat.total) }}</span>
          <span class="text-xs text-white/30 tabular-nums w-10 text-right">
            {{ total > 0 ? ((cat.total / total) * 100).toFixed(0) : 0 }}%
          </span>
        </div>
      </div>
    </div>
    <template #fallback>
      <div class="h-48 w-48 mx-auto"><ChartSkeleton /></div>
    </template>
  </ClientOnly>
</template>
<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
const props = defineProps<{
  categories: Array<{ _id: string; name: string; icon: string; color: string; total: number }>
  loading?: boolean
}>()
const { formatCompact } = useFormatters()
const total = computed(() => props.categories?.reduce((s, c) => s + c.total, 0) ?? 0)
const chartData = computed(() => {
  if (!props.categories?.length) return null
  return {
    labels: props.categories.map(c => `${c.icon} ${c.name}`),
    datasets: [{
      data: props.categories.map(c => c.total),
      backgroundColor: props.categories.map(c => c.color + 'cc'),
      borderColor: props.categories.map(c => c.color),
      borderWidth: 1.5,
      hoverOffset: 8,
    }],
  }
})
const opts = {
  responsive: true, maintainAspectRatio: false, cutout: '70%',
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.formattedValue} €` } },
  },
}
</script>
