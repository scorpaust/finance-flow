<template>
  <!-- TABLE ROW MODE -->
  <tr v-if="showTableCells" class="group cursor-pointer" @click="$emit('edit')">
    <td>
      <div class="flex items-center gap-3">
        <div
          class="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 transition-transform duration-200 group-hover:scale-110"
          :style="catStyle('bg')"
        >
          {{ cat?.icon || '💰' }}
        </div>
        <div class="min-w-0">
          <p class="text-sm font-medium text-white truncate max-w-48">{{ transaction.description }}</p>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span
              v-for="tag in transaction.tags?.slice(0, 2)"
              :key="tag"
              class="text-xs text-white/30 bg-white/5 px-1.5 py-0.5 rounded"
            >#{{ tag }}</span>
          </div>
        </div>
      </div>
    </td>

    <td class="hidden sm:table-cell">
      <span class="category-pill" :style="catPillStyle">
        {{ cat?.name || '—' }}
      </span>
    </td>

    <td class="text-white/50 text-xs whitespace-nowrap">{{ relativeTime(transaction.date) }}</td>

    <td class="text-right">
      <span
        class="font-bold tabular-nums"
        :class="transaction.type === 'income' ? 'amount-positive' : 'amount-negative'"
      >
        {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
      </span>
    </td>

    <td class="hidden md:table-cell">
      <span
        v-if="transaction.recurrence && transaction.recurrence !== 'none'"
        class="badge bg-brand-600/20 text-brand-300 border border-brand-500/30"
      >
        🔄 {{ recurrenceLabel(transaction.recurrence) }}
      </span>
      <span v-else class="text-white/25 text-xs">—</span>
    </td>

    <td class="text-center">
      <div class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          class="w-7 h-7 rounded-lg hover:bg-brand-600/30 flex items-center justify-center transition-colors"
          @click.stop="$emit('edit')"
        >
          <Pencil class="w-3.5 h-3.5 text-brand-400" />
        </button>
        <button
          class="w-7 h-7 rounded-lg hover:bg-rose-600/30 flex items-center justify-center transition-colors"
          @click.stop="$emit('delete')"
        >
          <Trash2 class="w-3.5 h-3.5 text-rose-400" />
        </button>
      </div>
    </td>
  </tr>

  <!-- LIST ROW MODE (dashboard) -->
  <div
    v-else
    class="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors duration-200 cursor-pointer group"
    @click="$emit('edit')"
  >
    <div
      class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
      :style="catStyle('bg')"
    >
      {{ cat?.icon || '💰' }}
    </div>

    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-white truncate">{{ transaction.description }}</p>
      <p class="text-xs text-white/40 mt-0.5">
        {{ cat?.name || '—' }} · {{ relativeTime(transaction.date) }}
      </p>
    </div>

    <span
      class="font-bold tabular-nums shrink-0"
      :class="transaction.type === 'income' ? 'amount-positive' : 'amount-negative'"
    >
      {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
    </span>

    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
      <button
        class="w-7 h-7 rounded-lg hover:bg-brand-600/30 flex items-center justify-center"
        @click.stop="$emit('edit')"
      >
        <Pencil class="w-3.5 h-3.5 text-brand-400" />
      </button>
      <button
        class="w-7 h-7 rounded-lg hover:bg-rose-600/30 flex items-center justify-center"
        @click.stop="$emit('delete')"
      >
        <Trash2 class="w-3.5 h-3.5 text-rose-400" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pencil, Trash2 } from 'lucide-vue-next'
import type { Transaction } from '~/types'

const props = defineProps<{
  transaction: Transaction
  showTableCells?: boolean
}>()
defineEmits(['edit', 'delete'])

const { formatCurrency, relativeTime } = useFormatters()

// Mongoose populates categoryId in-place — support both populated and raw
const cat = computed(() => {
  const c = (props.transaction as any).categoryId
  if (c && typeof c === 'object' && c.name) return c   // populated
  return (props.transaction as any).category || null    // fallback alias
})

function catStyle(type: 'bg' | 'text') {
  const color = cat.value?.color || '#6366f1'
  if (type === 'bg') return { backgroundColor: color + '20', border: `1px solid ${color}30` }
  return { color }
}

const catPillStyle = computed(() => {
  const color = cat.value?.color || '#6366f1'
  return {
    backgroundColor: color + '20',
    color,
    border: `1px solid ${color}30`,
  }
})

function recurrenceLabel(r: string) {
  const map: Record<string, string> = {
    daily: 'Diária',
    weekly: 'Semanal',
    monthly: 'Mensal',
    yearly: 'Anual',
  }
  return map[r] || r
}
</script>
