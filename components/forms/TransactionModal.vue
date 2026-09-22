<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content max-w-lg w-full" @click.stop>

        <!-- Header -->
        <div class="flex items-center justify-between mb-5">
          <div>
            <h2 class="font-display font-bold text-xl text-white">
              {{ isEditing ? t('transactionModal.editTitle') : t('transactionModal.newTitle') }}
            </h2>
            <p class="text-white/40 text-xs mt-0.5">
              {{ isEditing ? t('transactionModal.editSubtitle') : prefill ? t('transactionModal.scannedSubtitle') : t('transactionModal.newSubtitle') }}
            </p>
          </div>
          <button class="btn-icon" :aria-label="t('transactionModal.closeAria')" @click="$emit('close')">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Type toggle -->
        <div class="flex gap-2 mb-5 bg-surface-700/50 rounded-2xl p-1" :class="flagged.type ? 'scan-low' : ''">
          <button
            class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            :class="form.type === 'income'
              ? 'bg-emerald-600/80 text-white shadow-glow-emerald'
              : 'text-white/50 hover:text-white'"
            @click="form.type = 'income'; flagged.type = false"
          >
            <TrendingUp class="w-4 h-4" /> {{ t('transactionModal.income') }}
          </button>
          <button
            class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            :class="form.type === 'expense'
              ? 'bg-rose-600/80 text-white shadow-glow-rose'
              : 'text-white/50 hover:text-white'"
            @click="form.type = 'expense'; flagged.type = false"
          >
            <TrendingDown class="w-4 h-4" /> {{ t('transactionModal.expense') }}
          </button>
        </div>

        <!-- Aviso de dados extraídos por IA (Fase 5) -->
        <div
          v-if="prefill && !isEditing"
          class="mb-4 flex items-start gap-2 bg-amber-500/[0.10] border border-amber-500/30 rounded-2xl px-4 py-3 text-amber-300 text-sm"
        >
          <Sparkles class="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p>{{ t('transactionModal.aiNotice') }}</p>
            <p v-if="hasFlagged" class="text-amber-300/80 text-xs mt-1">{{ t('transactionModal.aiFlaggedNotice') }}</p>
            <p v-if="foreignCurrency" class="text-amber-300/80 text-xs mt-1">
              {{ t('transactionModal.foreignCurrencyNotice', { currency: prefill.currency }) }}
            </p>
            <p v-if="isPayslip" class="text-amber-300/80 text-xs mt-1">
              {{ payslipNoticeText }}
            </p>
          </div>
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

          <!-- Description -->
          <div>
            <label class="form-label">{{ t('transactionModal.descriptionLabel') }}</label>
            <input
              v-model="form.description"
              type="text"
              class="form-input"
              :class="flagged.description ? 'scan-low' : ''"
              @input="flagged.description = false"
              :placeholder="t('transactionModal.descriptionPlaceholder')"
              required
              autofocus
            />
          </div>

          <!-- Amount + Date -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label">{{ t('transactionModal.amountLabel') }}{{ form.currency === 'EUR' ? ' (€)' : '' }} *</label>
              <div class="input-group">
                <span class="input-prefix font-medium">{{ form.currency === 'EUR' ? '€' : form.currency }}</span>
                <input
                  v-model="form.amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  class="form-input pl-8"
                  :class="flagged.amount ? 'scan-low' : ''"
                  placeholder="0,00"
                  @input="flagged.amount = false"
                  required
                />
              </div>
            </div>
            <div>
              <label class="form-label">{{ t('transactionModal.dateLabel') }}</label>
              <input
                v-model="form.date"
                type="date"
                class="form-input"
                :class="flagged.date ? 'scan-low' : ''"
                @input="flagged.date = false"
                required
              />
            </div>
          </div>

          <!-- Moeda (Fase 7, tarefa 6) — escondida por omissão para não
               complicar o fluxo normal em €; aparece quando o documento
               digitalizado não é € ou quando se edita uma transação já
               guardada nessa situação. -->
          <div v-if="foreignCurrency || form.currency !== 'EUR'">
            <label class="form-label">{{ t('transactionModal.currencyLabel') }}</label>
            <select v-model="form.currency" class="form-select">
              <option v-for="c in CURRENCY_OPTIONS" :key="c" :value="c">{{ c }}</option>
            </select>
            <p v-if="resolvedRate" class="text-white/30 text-xs mt-1">
              {{ t('transactionModal.rateUsed', { currency: form.currency, rate: resolvedRate }) }}
            </p>
          </div>

          <!-- Category -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="form-label !mb-0">{{ t('transactionModal.categoryLabel') }}</label>
              <button
                type="button"
                class="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                @click="showNewCat = !showNewCat"
              >
                {{ showNewCat ? t('transactionModal.cancelCategoryToggle') : t('transactionModal.addCategoryToggle') }}
              </button>
            </div>

            <!-- Inline new category form -->
            <Transition name="slide-up">
              <div
                v-if="showNewCat"
                class="mb-3 p-3 bg-surface-700/40 rounded-xl border border-white/10 space-y-3"
              >
                <input
                  v-model="newCat.name"
                  type="text"
                  class="form-input text-sm py-2"
                  :placeholder="t('transactionModal.newCategoryNamePlaceholder')"
                />
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="ic in ICONS_QUICK"
                    :key="ic"
                    type="button"
                    class="w-8 h-8 rounded-lg text-base hover:bg-white/10 transition-all"
                    :class="newCat.icon === ic ? 'bg-brand-600/40 ring-1 ring-brand-500' : ''"
                    :aria-label="t('transactionModal.iconAria', { icon: ic })"
                    @click="newCat.icon = ic"
                  >{{ ic }}</button>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="c in COLORS_QUICK"
                    :key="c"
                    type="button"
                    class="w-6 h-6 rounded-lg transition-all hover:scale-110"
                    :class="newCat.color === c ? 'ring-2 ring-white scale-110' : ''"
                    :style="{ background: c }"
                    :aria-label="t('transactionModal.colorAria', { color: c })"
                    @click="newCat.color = c"
                  />
                </div>
                <button
                  type="button"
                  class="btn-primary text-xs py-1.5 px-3 w-full"
                  :disabled="!newCat.name"
                  @click="createCategory"
                >
                  {{ t('transactionModal.createCategoryButton') }}
                </button>
              </div>
            </Transition>

            <!-- Loading indicator for categories -->
            <div v-if="loadingCats" class="form-input flex items-center gap-2 text-white/30 text-sm">
              <div class="w-3 h-3 border border-brand-400 border-t-transparent rounded-full animate-spin" />
              {{ t('transactionModal.loadingCategories') }}
            </div>

            <select v-else v-model="form.categoryId" class="form-select" required>
              <option value="" disabled>{{ t('transactionModal.categoryPlaceholder') }}</option>
              <optgroup v-if="incomeOptions.length && form.type === 'income'" :label="t('transactionModal.incomeGroupLabel')">
                <option
                  v-for="c in incomeOptions"
                  :key="c._id"
                  :value="c._id"
                >{{ c.icon }} {{ c.name }}</option>
              </optgroup>
              <optgroup v-if="expenseOptions.length && form.type === 'expense'" :label="t('transactionModal.expenseGroupLabel')">
                <option
                  v-for="c in expenseOptions"
                  :key="c._id"
                  :value="c._id"
                >{{ c.icon }} {{ c.name }}</option>
              </optgroup>
            </select>
          </div>

          <!-- Tags -->
          <div>
            <label class="form-label">{{ t('transactionModal.tagsLabel') }} <span class="text-white/30 font-normal">{{ t('transactionModal.optional') }}</span></label>
            <div v-if="form.tags.length" class="flex flex-wrap gap-1.5 mb-2">
              <span
                v-for="tag in form.tags"
                :key="tag"
                class="category-pill bg-brand-600/20 text-brand-300 border border-brand-500/30 cursor-pointer hover:bg-rose-600/20 hover:text-rose-300"
                @click="removeTag(tag)"
              >
                #{{ tag }} ×
              </span>
            </div>
            <input
              v-model="tagInput"
              type="text"
              class="form-input text-sm"
              :placeholder="t('transactionModal.tagsPlaceholder')"
              @keydown.enter.prevent="addTag"
              @keydown="e => e.key === ',' && (e.preventDefault(), addTag())"
            />
          </div>

          <!-- Recurrence + Group -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label">{{ t('transactionModal.recurrenceLabel') }}</label>
              <select v-model="form.recurrence" class="form-select">
                <option value="none">{{ t('transactionModal.recurrenceNone') }}</option>
                <option value="weekly">{{ t('transactionModal.recurrenceWeekly') }}</option>
                <option value="monthly">{{ t('transactionModal.recurrenceMonthly') }}</option>
                <option value="yearly">{{ t('transactionModal.recurrenceYearly') }}</option>
              </select>
            </div>
            <div>
              <label class="form-label">{{ t('transactionModal.groupLabel') }}</label>
              <select v-model="form.groupId" class="form-select">
                <option value="">{{ t('transactionModal.noGroup') }}</option>
                <option v-for="g in groups" :key="g._id" :value="g._id">{{ g.name }}</option>
              </select>
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="form-label">{{ t('transactionModal.notesLabel') }} <span class="text-white/30 font-normal">{{ t('transactionModal.optional') }}</span></label>
            <textarea
              v-model="form.notes"
              class="form-input resize-none"
              rows="2"
              :placeholder="t('transactionModal.notesPlaceholder')"
            />
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-1">
            <button type="button" class="btn-secondary flex-1" @click="$emit('close')">
              {{ t('common.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="saving || loadingCats"
              class="flex-1 py-3 rounded-2xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              :class="form.type === 'income'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:shadow-glow-emerald hover:scale-105'
                : 'bg-gradient-to-r from-rose-600 to-rose-500 hover:shadow-glow-rose hover:scale-105'"
            >
              <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
              <Check v-else class="w-4 h-4" />
              {{ saving ? t('transactionModal.saving') : isEditing ? t('common.update') : t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { TrendingUp, TrendingDown, X, Loader2, Check, AlertCircle, Sparkles } from 'lucide-vue-next'
import type { Transaction, DocumentScanResult } from '~/types'

// `prefill` (Fase 5): campos extraídos de um recibo/fatura por IA. Só pré-preenche
// o formulário — a transação só é criada quando o utilizador confirma.
const props = defineProps<{ transaction?: Transaction | null; prefill?: DocumentScanResult | null }>()
const emit  = defineEmits(['close', 'saved'])

const finance = useFinanceStore()
const toast   = useToastStore()
const { t }   = useI18n()

const saving     = ref(false)
const loadingCats = ref(false)
const formError  = ref('')
const tagInput   = ref('')
const showNewCat = ref(false)
const groups     = ref<any[]>([])

const ICONS_QUICK  = ['💰','💼','🏠','🛒','🚗','🍕','💊','📱','🎵','✈️','💡','🛡️','📈','💳','🏦','🛠️','💪','☕','🎭','📚','⛽','🚌','🪙','🔒','📋','🥩']
const COLORS_QUICK = ['#10b981','#6366f1','#f43f5e','#f97316','#eab308','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#0ea5e9','#22c55e','#dc2626','#7c3aed','#a855f7']

const newCat = reactive({ name: '', icon: '💰', color: '#6366f1' })

const today = new Date().toISOString().split('T')[0]

// Fase 7, tarefa 6 — moeda original (decisão do utilizador, 2026-09-22: a
// transação guarda o valor e a moeda tal como no documento; o servidor
// calcula o equivalente em € à taxa do dia ao guardar — ver
// server/utils/transactionCurrency.ts).
const CURRENCY_OPTIONS = ['EUR', 'USD', 'GBP', 'CHF', 'BRL', 'JPY', 'CAD', 'AUD']
const foreignCurrency = !props.transaction && !!props.prefill && props.prefill.currency !== 'EUR'
const resolvedRate = props.transaction?.exchangeRate ? props.transaction.exchangeRate.toFixed(4) : null
const isPayslip = !props.transaction && props.prefill?.documentType === 'payslip'
const { formatCurrency } = useFormatters()

const payslipNoticeText = computed(() => {
  const gross = props.prefill?.grossAmount
  const deductions = props.prefill?.deductions
  if (gross && deductions) {
    return t('transactionModal.payslipNoticeWithGross', {
      gross: formatCurrency(gross, props.prefill!.currency),
      deductions: formatCurrency(deductions, props.prefill!.currency),
    })
  }
  if (gross) {
    return t('transactionModal.payslipNoticeWithGrossOnly', { gross: formatCurrency(gross, props.prefill!.currency) })
  }
  return t('transactionModal.payslipNoticeSimple')
})

// Campos a realçar a âmbar (confiança 'low'); o realce some assim que o
// utilizador mexe no campo.
const flagged = reactive({
  description: !props.transaction && props.prefill?.confidence.merchant === 'low',
  amount:      !props.transaction && (props.prefill?.confidence.amount === 'low' || foreignCurrency),
  date:        !props.transaction && props.prefill?.confidence.date === 'low',
  type:        !props.transaction && props.prefill?.confidence.type === 'low',
})
const hasFlagged = computed(() => Object.values(flagged).some(Boolean))

const form = reactive({
  type:        (props.transaction?.type || props.prefill?.type || 'expense') as 'income' | 'expense',
  amount:      (props.transaction?.originalAmount ?? props.transaction?.amount)?.toString() || props.prefill?.amount?.toString() || '',
  currency:    props.transaction?.currency || props.prefill?.currency || 'EUR',
  description: props.transaction?.description        || props.prefill?.merchant || '',
  categoryId:  (() => {
    const c = props.transaction?.categoryId
    if (!c) return props.prefill?.categoryId || ''
    if (typeof c === 'object' && '_id' in (c as any)) return (c as any)._id.toString()
    return c.toString()
  })(),
  date:        props.transaction?.date
    ? new Date(props.transaction.date).toISOString().split('T')[0]
    : props.prefill?.date || today,
  tags:        [...(props.transaction?.tags || [])],
  recurrence:  props.transaction?.recurrence || 'none',
  notes:       props.transaction?.notes      || '',
  groupId:     (() => {
    const g = props.transaction?.groupId
    if (!g) return ''
    if (typeof g === 'object' && '_id' in (g as any)) return (g as any)._id.toString()
    return g?.toString() || ''
  })(),
})

const isEditing = computed(() => !!props.transaction)

// Categories filtered by current type
const incomeOptions  = computed(() => finance.categories.filter(c => c.type === 'income'  || c.type === 'both'))
const expenseOptions = computed(() => finance.categories.filter(c => c.type === 'expense' || c.type === 'both'))

// Reset category when switching type (avoid invalid selection)
watch(() => form.type, () => { form.categoryId = '' })

function addTag() {
  const t = tagInput.value.trim().toLowerCase().replace(/[^a-z0-9À-ú\-]/g, '')
  if (t && !form.tags.includes(t)) form.tags.push(t)
  tagInput.value = ''
}
function removeTag(tag: string) { form.tags = form.tags.filter(t => t !== tag) }

async function createCategory() {
  if (!newCat.name) return
  try {
    const cat = await finance.createCategory({
      name: newCat.name,
      type: form.type,
      icon: newCat.icon,
      color: newCat.color,
    })
    form.categoryId = cat._id
    showNewCat.value = false
    newCat.name = ''
    toast.success(t('transactionModal.toastCategoryCreated'))
  } catch (e: any) {
    toast.error(e?.data?.message || t('transactionModal.toastCategoryCreateError'))
  }
}

async function handleSubmit() {
  formError.value = ''

  if (!form.description.trim()) { formError.value = t('transactionModal.errorDescriptionRequired'); return }
  if (!form.amount || parseFloat(form.amount) <= 0) { formError.value = t('transactionModal.errorAmountRequired'); return }
  if (!form.categoryId) { formError.value = t('transactionModal.errorCategoryRequired'); return }
  if (!form.date) { formError.value = t('transactionModal.errorDateRequired'); return }

  saving.value = true
  try {
    const payload = {
      type:        form.type,
      amount:      parseFloat(form.amount),
      currency:    form.currency,
      description: form.description.trim(),
      categoryId:  form.categoryId,
      date:        form.date,
      tags:        form.tags,
      recurrence:  form.recurrence,
      notes:       form.notes?.trim() || undefined,
      groupId:     form.groupId       || undefined,
    }
    if (isEditing.value && props.transaction?._id) {
      await finance.updateTransaction(props.transaction._id, payload)
    } else {
      await finance.createTransaction(payload)
    }
    emit('saved')
  } catch (e: any) {
    formError.value = e?.data?.message || t('transactionModal.errorGeneric')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  loadingCats.value = true
  try {
    await finance.fetchCategories()
  } finally {
    loadingCats.value = false
  }
  try { groups.value = await $fetch<any[]>('/api/groups') } catch { groups.value = [] }
})
</script>
