<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div v-for="tile in tiles" :key="tile.label" class="stat-card cursor-default">
      <div
        class="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20"
        :style="{ backgroundColor: tile.accent }"
      />
      <div class="relative">
        <p class="text-white/50 text-xs font-medium mb-1">{{ tile.label }}</p>
        <SkeletonBlock v-if="loading" class="h-8 w-28" />
        <p v-else class="font-display font-bold text-xl sm:text-2xl flex items-center gap-1.5" :class="tile.class">
          <component :is="tile.icon" v-if="tile.icon" class="w-5 h-5 shrink-0" />
          {{ tile.value }}
        </p>
        <p v-if="tile.hint && !loading" class="text-white/30 text-xs mt-1">{{ tile.hint }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'
import type { PortfolioSummary } from '~/shared/portfolio'

const props = defineProps<{ summary: PortfolioSummary | null; loading?: boolean }>()

const { formatCurrency, formatSignedCurrency, formatReturnPct } = useFormatters()

// Não usa o KpiCard: esse mostra valores compactos ("1.1k €") e a percentagem
// com 1 casa e cores de "taxa de poupança". Aqui interessam os valores exatos e
// a rentabilidade como na folha (2 casas).
const tiles = computed(() => {
  const s = props.summary
  const gain = s?.gain ?? 0
  const trend = gain > 0 ? 'text-emerald-400' : gain < 0 ? 'text-rose-400' : 'text-white'
  const icon = gain > 0 ? TrendingUp : gain < 0 ? TrendingDown : Minus
  return [
    { label: 'Total investido', value: formatCurrency(s?.totalInvested ?? 0), accent: '#6366f1', class: 'text-white' },
    { label: 'Valor atual', value: formatCurrency(s?.totalValue ?? 0), accent: '#3b82f6', class: 'text-white' },
    { label: 'Ganho / perda', value: formatSignedCurrency(gain), accent: gain < 0 ? '#f43f5e' : '#10b981', class: trend, icon },
    {
      label: 'Rentabilidade',
      value: formatReturnPct(s?.returnPct),
      accent: gain < 0 ? '#f43f5e' : '#10b981',
      class: trend,
      icon,
      hint: 'sobre o capital investido',
    },
  ]
})
</script>
