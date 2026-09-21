<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content max-w-sm w-full" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="font-display font-bold text-lg text-white">
              {{ mode === 'reinforce' ? 'Reforçar' : 'Atualizar situação' }}
            </h2>
            <p class="text-white/40 text-xs mt-0.5 truncate max-w-[16rem]">{{ investment.name }}</p>
          </div>
          <button class="btn-icon" aria-label="Fechar" @click="$emit('close')">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div
          v-if="formError"
          class="mb-4 flex items-center gap-2 bg-rose-500/[0.15] border border-rose-500/30 rounded-2xl px-4 py-3 text-rose-400 text-sm"
        >
          <AlertCircle class="w-4 h-4 shrink-0" />
          {{ formError }}
        </div>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label class="form-label" for="quick-amount">
              {{ mode === 'reinforce' ? 'Valor a acrescentar (€)' : 'Nova situação (€)' }}
            </label>
            <div class="input-group">
              <span class="input-prefix font-medium">€</span>
              <input
                id="quick-amount"
                v-model="amount"
                type="number"
                step="0.01"
                :min="mode === 'reinforce' ? 0.01 : 0"
                class="form-input pl-8"
                placeholder="0,00"
                required
                autofocus
              />
            </div>
          </div>

          <!-- O que vai acontecer, antes de guardar -->
          <div class="rounded-2xl bg-surface-700/40 border border-white/10 px-4 py-3 text-xs text-white/50 space-y-1">
            <template v-if="mode === 'reinforce'">
              <p>
                Reforço: {{ formatCurrency(investment.reinforcement) }} →
                <span class="text-white/80 font-medium">{{ formatCurrency(next.reinforcement) }}</span>
              </p>
              <p>Investido no total: <span class="text-white/80 font-medium">{{ formatCurrency(next.invested) }}</span></p>
              <p class="text-white/30">
                A situação não muda sozinha — atualiza-a a seguir se o valor da posição também mudou.
              </p>
            </template>
            <template v-else>
              <p>
                Situação: {{ formatCurrency(investment.currentValue) }} →
                <span class="text-white/80 font-medium">{{ formatCurrency(next.currentValue) }}</span>
              </p>
              <p>
                Rentabilidade: {{ formatReturnPct(investment.returnPct) }} →
                <span class="text-white/80 font-medium">{{ formatReturnPct(next.returnPct) }}</span>
              </p>
            </template>
          </div>

          <div class="flex gap-3 pt-1">
            <button type="button" class="btn-secondary flex-1" @click="$emit('close')">Cancelar</button>
            <button type="submit" :disabled="saving" class="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
              <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
              <Check v-else class="w-4 h-4" />
              {{ saving ? 'A guardar...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X, Loader2, Check, AlertCircle } from 'lucide-vue-next'
import { investedAmount, returnPct, roundMoney, type InvestmentDto } from '~/shared/portfolio'

const props = defineProps<{ investment: InvestmentDto; mode: 'reinforce' | 'value' }>()
const emit = defineEmits<{ close: []; saved: [] }>()

const { update } = useInvestments()
const { formatCurrency, formatReturnPct } = useFormatters()

const saving = ref(false)
const formError = ref('')
// "Reforçar" escreve o valor a ACRESCENTAR (não o novo total, que é fácil de
// errar); "Atualizar situação" já vem com o valor atual para ajustar.
const amount = ref(props.mode === 'value' ? String(props.investment.currentValue) : '')

const next = computed(() => {
  const n = parseFloat(amount.value)
  const value = Number.isFinite(n) ? n : 0
  const reinforcement = props.mode === 'reinforce' ? roundMoney(props.investment.reinforcement + Math.max(0, value)) : props.investment.reinforcement
  const currentValue = props.mode === 'value' ? Math.max(0, value) : props.investment.currentValue
  const amounts = { initialAmount: props.investment.initialAmount, reinforcement, currentValue }
  return { reinforcement, currentValue, invested: investedAmount(amounts), returnPct: returnPct(amounts) }
})

async function handleSubmit() {
  formError.value = ''
  const n = parseFloat(amount.value)
  if (props.mode === 'reinforce' && !(n > 0)) { formError.value = 'Indica um valor maior que zero.'; return }
  if (props.mode === 'value' && !(Number.isFinite(n) && n >= 0)) { formError.value = 'Indica um valor válido (≥ 0).'; return }

  saving.value = true
  try {
    await update(
      props.investment._id,
      props.mode === 'reinforce' ? { reinforcement: next.value.reinforcement } : { currentValue: roundMoney(n) }
    )
    emit('saved')
  } catch (e: any) {
    formError.value = e?.data?.message || 'Erro ao guardar. Tenta novamente.'
  } finally {
    saving.value = false
  }
}
</script>
