<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content max-w-lg w-full" @click.stop>

        <!-- Header -->
        <div class="flex items-center justify-between mb-5">
          <div>
            <h2 class="font-display font-bold text-xl text-white">
              {{ isEditing ? 'Editar Transação' : 'Nova Transação' }}
            </h2>
            <p class="text-white/40 text-xs mt-0.5">
              {{ isEditing ? 'Actualiza os dados' : 'Regista receita ou despesa' }}
            </p>
          </div>
          <button class="btn-icon" @click="$emit('close')">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Type toggle -->
        <div class="flex gap-2 mb-5 bg-surface-700/50 rounded-2xl p-1">
          <button
            class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            :class="form.type === 'income'
              ? 'bg-emerald-600/80 text-white shadow-glow-emerald'
              : 'text-white/50 hover:text-white'"
            @click="form.type = 'income'"
          >
            <TrendingUp class="w-4 h-4" /> Receita
          </button>
          <button
            class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            :class="form.type === 'expense'
              ? 'bg-rose-600/80 text-white shadow-glow-rose'
              : 'text-white/50 hover:text-white'"
            @click="form.type = 'expense'"
          >
            <TrendingDown class="w-4 h-4" /> Despesa
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

          <!-- Description -->
          <div>
            <label class="form-label">Descrição *</label>
            <input
              v-model="form.description"
              type="text"
              class="form-input"
              placeholder="Ex: Salário de Maio, Renda, Supermercado..."
              required
              autofocus
            />
          </div>

          <!-- Amount + Date -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label">Valor (€) *</label>
              <div class="input-group">
                <span class="input-prefix font-medium">€</span>
                <input
                  v-model="form.amount"
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
              <label class="form-label">Data *</label>
              <input
                v-model="form.date"
                type="date"
                class="form-input"
                required
              />
            </div>
          </div>

          <!-- Category -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="form-label !mb-0">Categoria *</label>
              <button
                type="button"
                class="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                @click="showNewCat = !showNewCat"
              >
                {{ showNewCat ? '✕ Cancelar' : '+ Nova categoria' }}
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
                  placeholder="Nome da nova categoria"
                />
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="ic in ICONS_QUICK"
                    :key="ic"
                    type="button"
                    class="w-8 h-8 rounded-lg text-base hover:bg-white/10 transition-all"
                    :class="newCat.icon === ic ? 'bg-brand-600/40 ring-1 ring-brand-500' : ''"
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
                    @click="newCat.color = c"
                  />
                </div>
                <button
                  type="button"
                  class="btn-primary text-xs py-1.5 px-3 w-full"
                  :disabled="!newCat.name"
                  @click="createCategory"
                >
                  Criar categoria
                </button>
              </div>
            </Transition>

            <!-- Loading indicator for categories -->
            <div v-if="loadingCats" class="form-input flex items-center gap-2 text-white/30 text-sm">
              <div class="w-3 h-3 border border-brand-400 border-t-transparent rounded-full animate-spin" />
              A carregar categorias...
            </div>

            <select v-else v-model="form.categoryId" class="form-select" required>
              <option value="" disabled>— Selecciona uma categoria —</option>
              <optgroup v-if="incomeOptions.length && form.type === 'income'" label="Receitas">
                <option
                  v-for="c in incomeOptions"
                  :key="c._id"
                  :value="c._id"
                >{{ c.icon }} {{ c.name }}</option>
              </optgroup>
              <optgroup v-if="expenseOptions.length && form.type === 'expense'" label="Despesas">
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
            <label class="form-label">Tags <span class="text-white/30 font-normal">(opcional)</span></label>
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
              placeholder="Escrito enter para adicionar (#fixo, #mensal...)"
              @keydown.enter.prevent="addTag"
              @keydown="e => e.key === ',' && (e.preventDefault(), addTag())"
            />
          </div>

          <!-- Recurrence + Group -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label">Recorrência</label>
              <select v-model="form.recurrence" class="form-select">
                <option value="none">Única</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
            <div>
              <label class="form-label">Grupo</label>
              <select v-model="form.groupId" class="form-select">
                <option value="">Sem grupo</option>
                <option v-for="g in groups" :key="g._id" :value="g._id">{{ g.name }}</option>
              </select>
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="form-label">Notas <span class="text-white/30 font-normal">(opcional)</span></label>
            <textarea
              v-model="form.notes"
              class="form-input resize-none"
              rows="2"
              placeholder="Notas adicionais..."
            />
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-1">
            <button type="button" class="btn-secondary flex-1" @click="$emit('close')">
              Cancelar
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
              {{ saving ? 'A guardar...' : isEditing ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { TrendingUp, TrendingDown, X, Loader2, Check, AlertCircle } from 'lucide-vue-next'
import type { Transaction } from '~/types'

const props = defineProps<{ transaction?: Transaction | null }>()
const emit  = defineEmits(['close', 'saved'])

const finance = useFinanceStore()
const toast   = useToastStore()

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

const form = reactive({
  type:        (props.transaction?.type || 'expense') as 'income' | 'expense',
  amount:      props.transaction?.amount?.toString()  || '',
  description: props.transaction?.description        || '',
  categoryId:  (() => {
    const c = props.transaction?.categoryId
    if (!c) return ''
    if (typeof c === 'object' && '_id' in (c as any)) return (c as any)._id.toString()
    return c.toString()
  })(),
  date:        props.transaction?.date
    ? new Date(props.transaction.date).toISOString().split('T')[0]
    : today,
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
    toast.success('Categoria criada!')
  } catch (e: any) {
    toast.error(e?.data?.message || 'Erro ao criar categoria')
  }
}

async function handleSubmit() {
  formError.value = ''

  if (!form.description.trim()) { formError.value = 'A descrição é obrigatória.'; return }
  if (!form.amount || parseFloat(form.amount) <= 0) { formError.value = 'Insere um valor válido.'; return }
  if (!form.categoryId) { formError.value = 'Selecciona uma categoria.'; return }
  if (!form.date) { formError.value = 'A data é obrigatória.'; return }

  saving.value = true
  try {
    const payload = {
      type:        form.type,
      amount:      parseFloat(form.amount),
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
    formError.value = e?.data?.message || 'Erro ao guardar. Tenta novamente.'
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
