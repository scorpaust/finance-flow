<template>
  <div>
    <!-- Desktop / tablet largo: as mesmas colunas da folha de origem -->
    <div class="hidden md:block glass-card rounded-3xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-white/40 text-xs text-left border-b border-white/[0.08]">
              <th class="font-semibold px-5 py-3">Portfolio</th>
              <th class="font-semibold px-3 py-3 text-right">Inicial</th>
              <th class="font-semibold px-3 py-3 text-right">Data</th>
              <th class="font-semibold px-3 py-3 text-right">Reforço</th>
              <th class="font-semibold px-3 py-3 text-right">Situação</th>
              <th class="font-semibold px-3 py-3 text-right">%</th>
              <th class="px-3 py-3"><span class="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in items"
              :key="item._id"
              class="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.03] transition-colors"
            >
              <td class="px-5 py-3.5">
                <p class="font-semibold text-white">{{ item.name }}</p>
                <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span v-if="item.assetClass" class="text-xs text-white/40">{{ ASSET_CLASS_LABEL[item.assetClass] }}</span>
                  <span
                    v-if="isValuationStale(item.valueUpdatedAt)"
                    class="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-lg bg-amber-500/[0.12] text-amber-300 border border-amber-500/25"
                    :title="`Situação atualizada há ${daysSince(item.valueUpdatedAt)} dias`"
                  >
                    <Clock class="w-3 h-3" /> Desatualizada
                  </span>
                </div>
              </td>
              <td class="px-3 py-3.5 text-right text-white/70 whitespace-nowrap">{{ formatCurrency(item.initialAmount) }}</td>
              <td class="px-3 py-3.5 text-right text-white/70 whitespace-nowrap">{{ formatDate(item.initialDate, 'dd/MM/yyyy') }}</td>
              <td class="px-3 py-3.5 text-right text-white/70 whitespace-nowrap">{{ formatCurrency(item.reinforcement) }}</td>
              <td class="px-3 py-3.5 text-right whitespace-nowrap">
                <p class="text-white font-medium">{{ formatCurrency(item.currentValue) }}</p>
                <p class="text-white/30 text-[11px]">{{ relativeTime(item.valueUpdatedAt) }}</p>
              </td>
              <td class="px-3 py-3.5 text-right whitespace-nowrap">
                <span class="inline-flex items-center justify-end gap-1 font-semibold" :class="trendClass(item)">
                  <component :is="trendIcon(item)" class="w-3.5 h-3.5" />
                  {{ formatReturnPct(item.returnPct) }}
                </span>
                <p class="text-[11px]" :class="trendClass(item)">{{ formatSignedCurrency(item.gain) }}</p>
              </td>
              <td class="px-3 py-3.5">
                <div class="flex items-center justify-end gap-1">
                  <button class="btn-icon w-8 h-8" title="Reforçar" aria-label="Reforçar" @click="$emit('reinforce', item)">
                    <Plus class="w-3.5 h-3.5" />
                  </button>
                  <button class="btn-icon w-8 h-8" title="Atualizar situação" aria-label="Atualizar situação" @click="$emit('updateValue', item)">
                    <RefreshCw class="w-3.5 h-3.5" />
                  </button>
                  <button class="btn-icon w-8 h-8" title="Editar" aria-label="Editar investimento" @click="$emit('edit', item)">
                    <Pencil class="w-3.5 h-3.5" />
                  </button>
                  <button class="btn-icon w-8 h-8 hover:border-rose-500/30" title="Eliminar" aria-label="Eliminar investimento" @click="$emit('remove', item)">
                    <Trash2 class="w-3.5 h-3.5 text-rose-400" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile: uma tabela de 6 colunas não cabe num telemóvel, por isso cartões -->
    <div class="md:hidden space-y-3">
      <div v-for="item in items" :key="item._id" class="glass-card rounded-3xl p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="font-semibold text-white truncate">{{ item.name }}</p>
            <div class="flex items-center gap-2 mt-0.5 flex-wrap">
              <span v-if="item.assetClass" class="text-xs text-white/40">{{ ASSET_CLASS_LABEL[item.assetClass] }}</span>
              <span
                v-if="isValuationStale(item.valueUpdatedAt)"
                class="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-lg bg-amber-500/[0.12] text-amber-300 border border-amber-500/25"
              >
                <Clock class="w-3 h-3" /> Desatualizada
              </span>
            </div>
          </div>
          <div class="text-right shrink-0">
            <span class="inline-flex items-center gap-1 font-display font-bold" :class="trendClass(item)">
              <component :is="trendIcon(item)" class="w-4 h-4" />
              {{ formatReturnPct(item.returnPct) }}
            </span>
            <p class="text-xs" :class="trendClass(item)">{{ formatSignedCurrency(item.gain) }}</p>
          </div>
        </div>

        <dl class="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-xs">
          <div>
            <dt class="text-white/40">Inicial</dt>
            <dd class="text-white/80 font-medium">{{ formatCurrency(item.initialAmount) }}</dd>
          </div>
          <div>
            <dt class="text-white/40">Data</dt>
            <dd class="text-white/80 font-medium">{{ formatDate(item.initialDate, 'dd/MM/yyyy') }}</dd>
          </div>
          <div>
            <dt class="text-white/40">Reforço</dt>
            <dd class="text-white/80 font-medium">{{ formatCurrency(item.reinforcement) }}</dd>
          </div>
          <div>
            <dt class="text-white/40">Situação</dt>
            <dd class="text-white font-medium">
              {{ formatCurrency(item.currentValue) }}
              <span class="text-white/30 font-normal">· {{ relativeTime(item.valueUpdatedAt) }}</span>
            </dd>
          </div>
        </dl>

        <div class="flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.08]">
          <button class="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5" @click="$emit('reinforce', item)">
            <Plus class="w-3 h-3" /> Reforçar
          </button>
          <button class="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5" @click="$emit('updateValue', item)">
            <RefreshCw class="w-3 h-3" /> Situação
          </button>
          <div class="flex-1" />
          <button class="btn-icon w-8 h-8" aria-label="Editar investimento" @click="$emit('edit', item)">
            <Pencil class="w-3.5 h-3.5" />
          </button>
          <button class="btn-icon w-8 h-8 hover:border-rose-500/30" aria-label="Eliminar investimento" @click="$emit('remove', item)">
            <Trash2 class="w-3.5 h-3.5 text-rose-400" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, RefreshCw, Pencil, Trash2, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'
import { ASSET_CLASS_LABEL, daysSince, isValuationStale, type InvestmentDto } from '~/shared/portfolio'

defineProps<{ items: InvestmentDto[] }>()
defineEmits<{
  edit: [item: InvestmentDto]
  reinforce: [item: InvestmentDto]
  updateValue: [item: InvestmentDto]
  remove: [item: InvestmentDto]
}>()

const { formatCurrency, formatSignedCurrency, formatDate, formatReturnPct, relativeTime } = useFormatters()

// Ganho e perda distinguem-se por ícone e sinal, não só pela cor.
function trendIcon(item: InvestmentDto) {
  if (!item.gain) return Minus
  return item.gain > 0 ? TrendingUp : TrendingDown
}
function trendClass(item: InvestmentDto) {
  if (!item.gain) return 'text-white/50'
  return item.gain > 0 ? 'text-emerald-400' : 'text-rose-400'
}
</script>
