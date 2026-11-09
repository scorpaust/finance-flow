<template>
  <div class="space-y-5 animate-fade-in" data-testid="statement-import">
    <div>
      <NuxtLink to="/transactions" class="btn-secondary text-sm py-2 px-4 mb-4 inline-flex items-center gap-2">
        <ArrowLeft class="w-4 h-4" /> {{ t('statementImport.back') }}
      </NuxtLink>
      <div class="flex items-center gap-2 flex-wrap">
        <h2 class="font-display font-bold text-2xl text-white">{{ t('statementImport.title') }}</h2>
        <span class="text-xs px-2 py-0.5 rounded-full bg-brand-600/30 text-brand-300 font-semibold">{{ t('tiers.premium') }}</span>
      </div>
      <p class="text-white/50 text-sm mt-1 max-w-2xl">{{ t('statementImport.intro') }}</p>
    </div>

    <!-- Sem Premium -->
    <div v-if="!canUse" class="glass-card rounded-3xl p-5">
      <p class="text-white/60 text-sm mb-4 max-w-2xl">{{ t('statementImport.lockedDescription') }}</p>
      <button class="btn-primary text-sm" type="button" data-testid="statement-import-locked" @click="showPaywall = true">
        {{ t('common.viewPlans') }}
      </button>
      <PaywallModal v-if="showPaywall" required-tier="premium" :feature-label="t('statementImport.paywallFeatureLabel')" @close="showPaywall = false" />
    </div>

    <template v-else>
      <!-- 1. Escolher o ficheiro -->
      <div v-if="step === 'pick'" class="glass-card rounded-3xl p-5 space-y-4">
        <p class="text-white/60 text-sm max-w-2xl">{{ t('statementImport.consentBody') }}</p>
        <label class="flex items-start gap-3 text-sm text-white/80 cursor-pointer">
          <input v-model="consent" type="checkbox" class="mt-1" data-testid="statement-import-consent" />
          <span>{{ t('statementImport.consentAccept') }}</span>
        </label>
        <div class="flex flex-wrap items-center gap-3">
          <label
            class="btn-primary text-sm cursor-pointer inline-flex items-center gap-2"
            :class="{ 'opacity-50 pointer-events-none': !consent || (state && state.used >= state.limit) }"
          >
            <FileUp class="w-4 h-4" /> {{ t('statementImport.choose') }}
            <input type="file" accept="application/pdf" class="sr-only" data-testid="statement-import-file" @change="onFile" />
          </label>
          <span v-if="state" class="text-white/30 text-xs">{{ t('statementImport.usage', { used: state.used, limit: state.limit }) }}</span>
        </div>
        <p v-if="error" class="text-rose-300 text-sm" data-testid="statement-import-error">{{ error }}</p>

        <div v-if="state?.last" class="border-t border-white/10 pt-4 flex flex-wrap items-center gap-3">
          <p class="text-white/50 text-sm">
            {{ t('statementImport.lastImport', { n: state.last.created, date: formatDate(state.last.committedAt) }) }}
          </p>
          <button type="button" class="btn-secondary text-sm" :disabled="busy" data-testid="statement-import-undo" @click="undo">
            {{ t('statementImport.undo') }}
          </button>
        </div>
      </div>

      <!-- 2. A ler -->
      <div v-else-if="step === 'reading'" class="glass-card rounded-3xl p-5 space-y-3">
        <p class="text-white/80 text-sm flex items-center gap-2">
          <Loader2 class="w-4 h-4 animate-spin" />
          {{ t('statementImport.reading', { from: progress.from, to: progress.to, total: progress.total }) }}
        </p>
        <div class="h-2 rounded-full bg-white/10 overflow-hidden">
          <div class="h-full bg-brand-500 transition-all" :style="{ width: `${(progress.done / Math.max(1, progress.chunks)) * 100}%` }" />
        </div>
        <p class="text-white/40 text-xs">{{ t('statementImport.readingHint') }}</p>
      </div>

      <!-- 3. Rever -->
      <div v-else-if="step === 'review'" class="space-y-4">
        <div class="glass-card rounded-3xl p-4 flex flex-wrap items-center gap-3 justify-between">
          <p class="text-white/70 text-sm">
            {{ t('statementImport.summary', { rows: rows.length, importing: counts.import, updating: counts.update }) }}
          </p>
          <div class="flex gap-2">
            <button type="button" class="btn-secondary text-sm" :disabled="busy" @click="reset">{{ t('statementImport.cancel') }}</button>
            <button
              type="button"
              class="btn-primary text-sm"
              :disabled="busy || !(counts.import + counts.update)"
              data-testid="statement-import-commit"
              @click="commit"
            >
              {{ t('statementImport.confirm', { n: counts.import + counts.update }) }}
            </button>
          </div>
        </div>
        <p class="text-white/40 text-xs" data-testid="statement-import-currency">{{ t('statementImport.currencyNote', { currency }) }}</p>
        <p v-if="error" class="text-rose-300 text-sm">{{ error }}</p>
        <p v-if="failedChunk !== null" class="text-yellow-300/90 text-sm flex flex-wrap items-center gap-2">
          {{ t('statementImport.partial') }}
          <button type="button" class="btn-secondary text-sm" :disabled="busy" @click="readFrom(failedChunk)">{{ t('statementImport.retry') }}</button>
        </p>

        <ul class="space-y-2">
          <li
            v-for="(row, i) in rows"
            :key="i"
            class="glass-card rounded-2xl p-3 grid grid-cols-1 md:grid-cols-[auto_8.5rem_1fr_7rem_12rem] gap-2 items-center"
            :class="{ 'opacity-50': row.action === 'skip' }"
            data-testid="statement-import-row"
          >
            <select v-model="row.action" class="form-select text-sm" :aria-label="t('statementImport.action')">
              <option value="import">{{ t('statementImport.actionImport') }}</option>
              <option value="skip">{{ t('statementImport.actionSkip') }}</option>
              <option v-if="row.duplicateOf" value="update">{{ t('statementImport.actionUpdate') }}</option>
            </select>
            <input v-model="row.date" type="date" class="form-input text-sm" :aria-label="t('statementImport.date')" />
            <div class="min-w-0">
              <input v-model="row.description" type="text" maxlength="120" class="form-input text-sm w-full" :aria-label="t('statementImport.description')" />
              <p v-if="row.duplicateOf" class="text-yellow-300/80 text-xs mt-1">
                {{ t('statementImport.duplicate', { description: row.duplicateOf.description, date: formatDate(row.duplicateOf.date) }) }}
              </p>
              <p v-else-if="row.internalTransfer" class="text-white/40 text-xs mt-1">{{ t('statementImport.internalTransfer') }}</p>
            </div>
            <p class="text-sm font-semibold text-right" :class="row.type === 'income' ? 'text-emerald-400' : 'text-rose-400'">
              {{ row.type === 'income' ? '+' : '−' }}{{ formatCurrency(row.amount, currency) }}
            </p>
            <select v-model="row.category" class="form-select text-sm" :aria-label="t('statementImport.category')">
              <option v-for="c in categoriesFor(row.type)" :key="c._id" :value="c._id">{{ c.icon }} {{ c.name }}</option>
              <option v-for="name in newCategories" :key="`new:${name}`" :value="`new:${name}`">✨ {{ name }} ({{ t('statementImport.newCategory') }})</option>
            </select>
          </li>
        </ul>
      </div>

      <!-- 4. Feito -->
      <div v-else-if="step === 'done'" class="glass-card rounded-3xl p-5 space-y-3" data-testid="statement-import-done">
        <p class="text-emerald-300 text-sm">{{ t('statementImport.done', { created: result.created, updated: result.updated }) }}</p>
        <div class="flex flex-wrap gap-2">
          <NuxtLink to="/transactions" class="btn-primary text-sm">{{ t('statementImport.seeTransactions') }}</NuxtLink>
          <button type="button" class="btn-secondary text-sm" :disabled="busy" data-testid="statement-import-undo" @click="undo">{{ t('statementImport.undo') }}</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, FileUp, Loader2 } from 'lucide-vue-next'
import { STATEMENT_MAX_CHUNK_BYTES, STATEMENT_MAX_PAGES, pageChunks } from '~/shared/statementImport'

// Importar o extrato bancário em PDF (Premium, shared/statementImport.ts): o
// PDF é dividido aqui em blocos de poucas páginas, cada um lido pela IA no
// servidor; a pessoa revê e acerta cada linha antes de importar, e pode
// desfazer a última importação.
const { t } = useI18n()
const toast = useToastStore()
const finance = useFinanceStore()
const sub = useSubscription()
const { formatCurrency, formatDate } = useFormatters()
const canUse = computed(() => sub.hasFeature('statementImport'))
const showPaywall = ref(false)

type Step = 'pick' | 'reading' | 'review' | 'done'
interface Row {
  action: 'import' | 'skip' | 'update'
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  internalTransfer: boolean
  duplicateOf: { id: string; description: string; date: string } | null
}

const step = ref<Step>('pick')
const state = ref<any>(null)
const consent = ref(false)
const busy = ref(false)
const error = ref('')
const rows = ref<Row[]>([])
const result = ref({ created: 0, updated: 0 })
const progress = reactive({ from: 0, to: 0, total: 0, done: 0, chunks: 0 })
const failedChunk = ref<number | null>(null)
// Moeda das configurações: os valores do extrato contam-se nela.
const currency = ref('EUR')
let importId = ''
let chunks: { pages: number; data: string; first: number }[] = []

const newCategories = computed(() => [...new Set(rows.value.map((r) => r.category).filter((c) => c.startsWith('new:')).map((c) => c.slice(4)))])
const counts = computed(() => ({
  import: rows.value.filter((r) => r.action === 'import').length,
  update: rows.value.filter((r) => r.action === 'update').length,
}))

function categoriesFor(type: 'income' | 'expense') {
  return finance.categories.filter((c) => c.type === type || c.type === 'both')
}

async function loadState() {
  try {
    state.value = await $fetch('/api/statements')
  } catch { /* o cartão funciona sem o contador */ }
}

function toBase64(bytes: Uint8Array) {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(binary)
}

// Divide o PDF em blocos que cabem num pedido; um bloco grande demais passa a uma página por pedido.
async function splitPdf(file: File) {
  const { PDFDocument } = await import('pdf-lib')
  const source = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()))
  const total = source.getPageCount()
  const out: { pages: number; data: string; first: number }[] = []
  const build = async (indices: number[]) => {
    const doc = await PDFDocument.create()
    for (const page of await doc.copyPages(source, indices)) doc.addPage(page)
    return doc.save()
  }
  for (const [first, count] of pageChunks(total)) {
    const indices = Array.from({ length: count }, (_, i) => first + i)
    const bytes = await build(indices)
    if (bytes.length <= STATEMENT_MAX_CHUNK_BYTES) {
      out.push({ pages: count, data: toBase64(bytes), first })
      continue
    }
    for (const index of indices) {
      const single = await build([index])
      if (single.length > STATEMENT_MAX_CHUNK_BYTES) throw new Error('too_large')
      out.push({ pages: 1, data: toBase64(single), first: index })
    }
  }
  return { total, chunks: out }
}

async function onFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  error.value = ''
  busy.value = true
  try {
    const split = await splitPdf(file)
    chunks = split.chunks
    progress.total = Math.min(split.total, STATEMENT_MAX_PAGES)
    if (split.total > STATEMENT_MAX_PAGES) toast.error(t('statementImport.tooManyPages', { max: STATEMENT_MAX_PAGES }))
  } catch (e: any) {
    error.value = e?.message === 'too_large' ? t('statementImport.errorTooLarge') : t('statementImport.errorUnreadable')
    busy.value = false
    return
  }
  try {
    importId = (await $fetch<{ id: string }>('/api/statements', { method: 'POST' })).id
  } catch (e: any) {
    error.value = e?.data?.message || t('statementImport.errorGeneric')
    busy.value = false
    return
  }
  rows.value = []
  await finance.fetchCategories()
  await readFrom(0)
}

async function readFrom(start: number) {
  step.value = 'reading'
  busy.value = true
  failedChunk.value = null
  error.value = ''
  progress.chunks = chunks.length
  for (let i = start; i < chunks.length; i++) {
    const chunk = chunks[i]
    progress.from = chunk.first + 1
    progress.to = chunk.first + chunk.pages
    progress.done = i
    try {
      const res = await $fetch<{ rows: any[]; currency: string }>(`/api/statements/${importId}/extract`, {
        method: 'POST',
        body: { data: chunk.data, pages: chunk.pages },
      })
      currency.value = res.currency
      rows.value.push(...res.rows.map((r) => ({
        action: (r.duplicateOf || r.internalTransfer ? 'skip' : 'import') as Row['action'],
        date: r.date,
        description: r.description,
        amount: r.amount,
        type: r.type,
        category: r.categoryId || `new:${r.newCategory || t('statementImport.otherCategory')}`,
        internalTransfer: r.internalTransfer,
        duplicateOf: r.duplicateOf,
      })))
    } catch (e: any) {
      error.value = e?.data?.message || t('statementImport.errorGeneric')
      // Primeiro bloco falhado e nada lido: volta ao início.
      if (!rows.value.length) {
        step.value = 'pick'
        busy.value = false
        return
      }
      failedChunk.value = i
      break
    }
  }
  progress.done = chunks.length
  step.value = 'review'
  busy.value = false
}

async function commit() {
  const chosen = rows.value.filter((r) => r.action !== 'skip')
  busy.value = true
  error.value = ''
  try {
    const res = await $fetch<any>(`/api/statements/${importId}/commit`, {
      method: 'POST',
      body: {
        rows: chosen.map((r) => ({
          action: r.action,
          date: r.date,
          description: r.description.trim(),
          amount: r.amount,
          type: r.type,
          categoryId: r.category.startsWith('new:') ? null : r.category,
          newCategory: r.category.startsWith('new:') ? r.category.slice(4) : null,
          existingId: r.action === 'update' ? r.duplicateOf?.id ?? null : null,
        })),
      },
    })
    result.value = { created: res.created, updated: res.updated }
    state.value = res.state
    step.value = 'done'
    finance.revision++
    void finance.fetchCategories()
  } catch (e: any) {
    error.value = e?.data?.message || t('statementImport.errorGeneric')
  } finally {
    busy.value = false
  }
}

async function undo() {
  const id = state.value?.last?.id
  if (!id || !confirm(t('statementImport.confirmUndo'))) return
  busy.value = true
  try {
    const res = await $fetch<any>(`/api/statements/${id}/undo`, { method: 'POST' })
    state.value = res.state
    toast.success(t('statementImport.toastUndone', { n: res.removed }))
    finance.revision++
    reset()
  } catch (e: any) {
    toast.error(e?.data?.message || t('statementImport.errorGeneric'))
  } finally {
    busy.value = false
  }
}

function reset() {
  step.value = 'pick'
  rows.value = []
  chunks = []
  importId = ''
  failedChunk.value = null
  error.value = ''
}

watch(canUse, (allowed) => { if (allowed && !state.value) void loadState() }, { immediate: true })
</script>
