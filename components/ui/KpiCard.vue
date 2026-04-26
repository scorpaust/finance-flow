<template>
  <div class="stat-card group cursor-default">
    <!-- Gradient accent (inline style — avoids Tailwind purge of dynamic classes) -->
    <div
      class="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20 transition-opacity duration-300 group-hover:opacity-40"
      :style="{ backgroundColor: accentColor }"
    />

    <div class="relative">
      <div class="flex items-start justify-between mb-4">
        <!-- Icon box -->
        <div
          class="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
          :style="{
            backgroundColor: accentColor + '25',
            border: `1px solid ${accentColor}40`,
          }"
        >
          {{ icon }}
        </div>

        <!-- Change badge -->
        <div
          v-if="change !== undefined && !loading"
          class="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-xl"
          :class="changePositive
            ? 'bg-emerald-500/[0.15] text-emerald-400 border border-emerald-500/25'
            : 'bg-rose-500/[0.15] text-rose-400 border border-rose-500/25'"
        >
          <TrendingUp v-if="changePositive" class="w-3 h-3" />
          <TrendingDown v-else class="w-3 h-3" />
          {{ Math.abs(change || 0).toFixed(1) }}%
        </div>
      </div>

      <p class="text-white/50 text-xs font-medium mb-1">{{ title }}</p>

      <!-- Loading skeleton -->
      <div v-if="loading" class="skeleton h-8 w-36 rounded mb-1" />

      <!-- Value -->
      <p v-else class="font-display font-bold text-2xl text-white">
        <template v-if="isPercentage">
          <span :class="savingsRateClass">{{ (value || 0).toFixed(1) }}%</span>
        </template>
        <template v-else>{{ formatCompact(value || 0) }}</template>
      </p>

      <p v-if="change !== undefined && !loading" class="text-white/30 text-xs mt-1">
        vs mês anterior
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrendingUp, TrendingDown } from 'lucide-vue-next'

const props = defineProps<{
  title: string
  value?: number
  change?: number
  icon: string
  color: string
  loading?: boolean
  isPercentage?: boolean
  invert?: boolean
}>()

const { formatCompact } = useFormatters()

// Map color prop to actual hex — avoids dynamic Tailwind class purging
const colorMap: Record<string, string> = {
  brand:  '#6366f1',
  purple: '#8b5cf6',
  emerald:'#10b981',
  rose:   '#f43f5e',
  yellow: '#eab308',
  blue:   '#3b82f6',
  teal:   '#14b8a6',
}

const accentColor = computed(() => colorMap[props.color] ?? colorMap.brand)

const changePositive = computed(() => {
  if (props.change === undefined) return true
  return props.invert ? props.change <= 0 : props.change >= 0
})

const savingsRateClass = computed(() => {
  const v = props.value ?? 0
  if (v >= 20) return 'text-emerald-400'
  if (v >= 0)  return 'text-yellow-400'
  return 'text-rose-400'
})
</script>
