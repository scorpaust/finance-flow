<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content max-w-lg w-full" @click.stop>

        <!-- Header -->
        <div class="flex items-center justify-between mb-5">
          <div>
            <h2 class="font-display font-bold text-xl text-white">
              {{ isEditing ? t('investment.modal.editTitle') : t('investment.modal.newTitle') }}
            </h2>
            <p class="text-white/40 text-xs mt-0.5">
              {{ isEditing ? t('investment.modal.editSubtitle') : t('investment.modal.newSubtitle') }}
            </p>
          </div>
          <button class="btn-icon" :aria-label="t('investment.modal.closeAria')" @click="$emit('close')">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Error banner -->
        <div
          v-if="formError"
          class="mb-4 flex items-center gap-2 bg-rose-500/[0.15] border border-rose-500/30 rounded-2xl px-4 py-3 text-rose-400 text-sm"
        >
          <AlertCircle class="w-4 h-4 shrink-0" />
          {{ formError }}
        </div>

        <form class="space-y-4" @submit.prevent="handleSubmit">

          <!-- Nome -->
          <div>
            <label class="form-label" for="inv-name">{{ t('investment.modal.nameLabel') }}</label>
            <input
              id="inv-name"
              v-model="form.name"
              type="text"
              class="form-input"
              maxlength="80"
              :placeholder="t('investment.modal.namePlaceholder')"
              required
              autofocus
            />
          </div>

          <!-- Classe de ativo -->
          <div>
            <label class="form-label" for="inv-class">
              {{ t('investment.modal.assetClassLabel') }} <span class="text-white/30 font-normal">{{ t('investment.modal.optional') }}</span>
            </label>
            <select id="inv-class" v-model="form.assetClass" class="form-select">
              <option value="">{{ t('investment.assetClass.none') }}</option>
              <option v-for="c in ASSET_CLASSES" :key="c" :value="c">{{ t(`investment.assetClass.${c}`) }}</option>
            </select>
          </div>

          <!-- Inicial + Data -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label" for="inv-initial">{{ t('investment.modal.initialLabel') }}</label>
              <div class="input-group">
                <span class="input-prefix font-medium">€</span>
                <input
                  id="inv-initial"
                  v-model="form.initialAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  class="form-input pl-8"
                  placeholder="0,00"
                  required
                />
              </div>
            </div>
            <div>
              <label class="form-label" for="inv-date">{{ t('investment.modal.dateLabel') }}</label>
              <input id="inv-date" v-model="form.initialDate" type="date" class="form-input" required />
            </div>
          </div>

          <!-- Reforço + Situação -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label" for="inv-reinf">{{ t('investment.modal.reinforcementLabel') }}</label>
              <div class="input-group">
                <span class="input-prefix font-medium">€</span>
                <input
                  id="inv-reinf"
                  v-model="form.reinforcement"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-input pl-8"
                  placeholder="0,00"
                />
              </div>
            </div>
            <div>
              <label class="form-label" for="inv-value">{{ t('investment.modal.valueLabel') }}</label>
              <div class="input-group">
                <span class="input-prefix font-medium">€</span>
                <input
                  id="inv-value"
                  v-model="form.currentValue"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-input pl-8"
                  placeholder="0,00"
                  required
                  @input="valueTouched = true"
                />
              </div>
            </div>
          </div>
          <p class="text-white/30 text-xs -mt-2">
            {{ t('investment.modal.hint') }}
          </p>

          <!-- Pré-visualização da rentabilidade -->
          <div
            class="rounded-2xl border px-4 py-3 flex items-center justify-between gap-3"
            :class="previewClass"
            aria-live="polite"
          >
            <div class="text-xs text-white/50">
              <p>{{ t('investment.modal.invested') }}: <span class="text-white/80 font-medium">{{ formatCurrency(preview.invested) }}</span></p>
              <p v-if="preview.valid" class="mt-0.5">
                {{ preview.gain >= 0 ? t('investment.modal.gain') : t('investment.modal.loss') }}:
                <span class="text-white/80 font-medium">{{ formatSignedCurrency(preview.gain) }}</span>
              </p>
            </div>
            <div class="flex items-center gap-1.5 font-display font-bold text-lg">
              <component :is="previewIcon" v-if="preview.valid" class="w-4 h-4" />
              {{ preview.valid ? formatReturnPct(preview.returnPct) : '—' }}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-1">
            <button type="button" class="btn-secondary flex-1" @click="$emit('close')">{{ t('common.cancel') }}</button>
            <button
              type="submit"
              :disabled="saving"
              class="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
              <Check v-else class="w-4 h-4" />
              {{ saving ? t('investment.modal.saving') : isEditing ? t('common.update') : t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X, Loader2, Check, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'
import {
  ASSET_CLASSES,
  gainAmount,
  investedAmount,
  returnPct,
  roundMoney,
  type AssetClass,
  type InvestmentDto,
} from '~/shared/portfolio'

const props = defineProps<{ investment?: InvestmentDto | null }>()
const emit = defineEmits<{ close: []; saved: [] }>()

const { create, update } = useInvestments()
const { formatCurrency, formatSignedCurrency, formatReturnPct } = useFormatters()
const { t } = useI18n()

const isEditing = computed(() => !!props.investment)
const saving = ref(false)
const formError = ref('')

const today = new Date().toISOString().split('T')[0]

const form = reactive({
  name: props.investment?.name ?? '',
  assetClass: (props.investment?.assetClass ?? '') as AssetClass | '',
  initialAmount: props.investment ? String(props.investment.initialAmount) : '',
  initialDate: props.investment ? new Date(props.investment.initialDate).toISOString().split('T')[0] : today,
  reinforcement: props.investment ? String(props.investment.reinforcement) : '0',
  currentValue: props.investment ? String(props.investment.currentValue) : '',
})

// Ao criar, a Situação acompanha Inicial + Reforço até o utilizador a escrever
// (uma posição nova vale, à partida, o que se investiu).
const valueTouched = ref(isEditing.value)
watch(
  () => [form.initialAmount, form.reinforcement],
  () => {
    if (valueTouched.value) return
    const invested = roundMoney((parseFloat(form.initialAmount) || 0) + (parseFloat(form.reinforcement) || 0))
    form.currentValue = invested > 0 ? String(invested) : ''
  }
)

const preview = computed(() => {
  const initialAmount = parseFloat(form.initialAmount)
  const reinforcement = parseFloat(form.reinforcement) || 0
  const currentValue = parseFloat(form.currentValue)
  const valid = initialAmount > 0 && Number.isFinite(currentValue) && currentValue >= 0
  const amounts = {
    initialAmount: initialAmount > 0 ? initialAmount : 0,
    reinforcement,
    currentValue: Number.isFinite(currentValue) ? currentValue : 0,
  }
  return {
    valid,
    invested: investedAmount(amounts),
    gain: gainAmount(amounts),
    returnPct: returnPct(amounts),
  }
})

// Sinal e ícone, não só a cor.
const previewIcon = computed(() => {
  if (!preview.value.valid || !preview.value.gain) return Minus
  return preview.value.gain > 0 ? TrendingUp : TrendingDown
})
const previewClass = computed(() => {
  if (!preview.value.valid || !preview.value.gain) return 'bg-surface-700/40 border-white/10 text-white/60'
  return preview.value.gain > 0
    ? 'bg-emerald-500/[0.10] border-emerald-500/25 text-emerald-400'
    : 'bg-rose-500/[0.10] border-rose-500/25 text-rose-400'
})

async function handleSubmit() {
  formError.value = ''

  const name = form.name.trim()
  const initialAmount = parseFloat(form.initialAmount)
  const reinforcement = form.reinforcement === '' ? 0 : parseFloat(form.reinforcement)
  const currentValue = parseFloat(form.currentValue)

  if (!name) { formError.value = t('investment.modal.errorName'); return }
  if (!(initialAmount > 0)) { formError.value = t('investment.modal.errorInitial'); return }
  if (!Number.isFinite(reinforcement) || reinforcement < 0) { formError.value = t('investment.modal.errorReinforcement'); return }
  if (!Number.isFinite(currentValue) || currentValue < 0) { formError.value = t('investment.modal.errorValue'); return }
  if (!form.initialDate) { formError.value = t('investment.modal.errorDate'); return }

  const payload = {
    name,
    assetClass: form.assetClass || null,
    initialAmount,
    initialDate: form.initialDate,
    reinforcement,
    currentValue,
  }

  saving.value = true
  try {
    if (props.investment) await update(props.investment._id, payload)
    else await create(payload)
    emit('saved')
  } catch (e: any) {
    formError.value = e?.data?.message || t('investment.modal.errorGeneric')
  } finally {
    saving.value = false
  }
}
</script>
