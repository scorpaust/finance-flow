<template>
  <div v-if="items.length" class="glass-card rounded-3xl p-5 border border-emerald-500/20" data-testid="recurring-due">
    <h3 class="font-semibold text-white">{{ t('recurring.title') }}</h3>
    <p class="text-white/50 text-sm mt-1 mb-4">{{ t('recurring.subtitle') }}</p>

    <ul class="space-y-3">
      <li
        v-for="item in items"
        :key="item._id"
        class="flex flex-col lg:flex-row lg:items-center gap-3 border border-white/10 rounded-2xl p-3"
        data-testid="recurring-item"
      >
        <div class="flex-1 min-w-0">
          <p class="text-white font-medium truncate">
            {{ item.category?.icon }} {{ item.description }}
          </p>
          <p class="text-white/40 text-xs">
            {{ t(item.type === 'income' ? 'recurring.income' : 'recurring.expense') }} ·
            {{ t('recurring.expected', { date: formatDate(item.expectedDate) }) }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-2 lg:w-72">
          <label class="sr-only" :for="`rec-amount-${item._id}`">{{ t('recurring.amount') }}</label>
          <input
            :id="`rec-amount-${item._id}`"
            v-model.number="drafts[item._id].amount"
            type="number"
            min="0.01"
            step="0.01"
            class="form-input"
            data-testid="recurring-amount"
          />
          <label class="sr-only" :for="`rec-date-${item._id}`">{{ t('recurring.date') }}</label>
          <input
            :id="`rec-date-${item._id}`"
            v-model="drafts[item._id].date"
            type="date"
            class="form-input"
            data-testid="recurring-date"
          />
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="btn-primary text-sm py-2"
            :disabled="busy === item._id"
            data-testid="recurring-confirm"
            @click="answer(item, 'confirm')"
          >
            {{ t('recurring.confirm') }}
          </button>
          <button
            type="button"
            class="btn-secondary text-sm py-2"
            :disabled="busy === item._id"
            data-testid="recurring-skip"
            @click="answer(item, 'skip')"
          >
            {{ t('recurring.skip') }}
          </button>
          <button
            type="button"
            class="btn-secondary text-sm py-2 text-rose-300"
            :disabled="busy === item._id"
            data-testid="recurring-stop"
            @click="answer(item, 'stop')"
          >
            {{ t('recurring.stop') }}
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { RecurringDue } from '~/types'

// Transações recorrentes por confirmar (shared/recurrence.ts): aparecem a
// partir de 3 dias antes da data prevista e nada é criado sem confirmação.
const { t } = useI18n()
const finance = useFinanceStore()
const toast = useToastStore()
const { formatDate } = useFormatters()

const items = ref<RecurringDue[]>([])
const drafts = reactive<Record<string, { amount: number; date: string }>>({})
const busy = ref<string | null>(null)

async function load() {
  try {
    items.value = await finance.fetchRecurringDue()
  } catch {
    items.value = []
    return
  }
  for (const item of items.value) {
    drafts[item._id] = { amount: item.amount, date: String(item.suggestedDate).slice(0, 10) }
  }
}

async function answer(item: RecurringDue, action: 'confirm' | 'skip' | 'stop') {
  if (action === 'stop' && !confirm(t('recurring.confirmStop'))) return
  const draft = drafts[item._id]
  if (action === 'confirm' && !(draft.amount > 0 && draft.date)) {
    toast.error(t('recurring.invalid'))
    return
  }
  busy.value = item._id
  try {
    await finance.answerRecurring(item._id, action === 'confirm' ? { action, amount: draft.amount, date: draft.date } : { action })
    toast.success(t(`recurring.toast_${action}`))
  } catch (e: any) {
    toast.error(e?.data?.message || t('recurring.error'))
  } finally {
    busy.value = null
  }
}

// Recarrega depois de cada resposta e de qualquer transação nova ou alterada.
watch(() => finance.revision, () => { void load() })
onMounted(load)
</script>
