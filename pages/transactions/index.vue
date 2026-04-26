<template>
  <div class="space-y-5 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <button
          class="btn-secondary text-sm py-2 px-4 mb-4 flex items-center gap-2"
          type="button"
          @click="navigateTo('/')"
        >
          <ArrowLeft class="w-4 h-4" />
          Voltar ao dashboard
        </button>
        <h2 class="font-display font-bold text-2xl text-white">Transações</h2>
        <p class="text-white/40 text-xs mt-0.5">{{ finance.total }} registos encontrados</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn-icon" title="Exportar CSV" @click="exportCSV">
          <Download class="w-4 h-4" />
        </button>
        <button class="btn-primary text-sm py-2 flex items-center gap-2" @click="showModal = true">
          <Plus class="w-4 h-4" />
          Nova Transação
        </button>
      </div>
    </div>

    <!-- Filters bar -->
    <div class="glass-card rounded-3xl p-4">
      <div class="flex flex-wrap gap-3">
        <!-- Search -->
        <div class="relative flex-1 min-w-48">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            v-model="filters.search"
            type="text"
            placeholder="Pesquisar transações..."
            class="form-input pl-9 py-2.5 text-sm"
            @input="debouncedFetch"
          />
        </div>

        <!-- Type filter -->
        <div class="flex items-center gap-1 bg-surface-700/50 rounded-xl p-1">
          <button
            v-for="t in typeOptions"
            :key="t.value"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
            :class="filters.type === t.value
              ? 'bg-brand-600 text-white shadow-glow-sm'
              : 'text-white/50 hover:text-white'"
            @click="setType(t.value)"
          >
            {{ t.label }}
          </button>
        </div>

        <!-- Category -->
        <select v-model="filters.categoryId" class="form-select text-sm py-2.5 min-w-32" @change="fetchNow">
          <option value="">Todas as categorias</option>
          <option v-for="c in finance.categories" :key="c._id" :value="c._id">
            {{ c.icon }} {{ c.name }}
          </option>
        </select>

        <!-- Date range -->
        <input
          v-model="filters.startDate"
          type="date"
          class="form-input text-sm py-2.5 w-36"
          @change="fetchNow"
        />
        <input
          v-model="filters.endDate"
          type="date"
          class="form-input text-sm py-2.5 w-36"
          @change="fetchNow"
        />

        <!-- Sort -->
        <select v-model="sortKey" class="form-select text-sm py-2.5 min-w-32" @change="fetchNow">
          <option value="date:desc">Mais recente</option>
          <option value="date:asc">Mais antigo</option>
          <option value="amount:desc">Maior valor</option>
          <option value="amount:asc">Menor valor</option>
        </select>

        <!-- Clear -->
        <button
          v-if="hasActiveFilters"
          class="btn-icon text-rose-400 border-rose-500/30 hover:border-rose-400"
          title="Limpar filtros"
          @click="clearFilters"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Transactions table -->
    <div class="glass-card rounded-3xl overflow-hidden">
      <!-- Loading skeleton -->
      <div v-if="finance.loading" class="divide-y divide-white/5">
        <div v-for="i in 8" :key="i" class="flex items-center gap-4 px-6 py-4">
          <div class="skeleton w-10 h-10 rounded-xl shrink-0" />
          <div class="flex-1 space-y-2">
            <div class="skeleton h-4 w-48 rounded" />
            <div class="skeleton h-3 w-32 rounded" />
          </div>
          <div class="skeleton h-5 w-20 rounded" />
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!finance.transactions.length" class="py-16 text-center">
        <div class="text-5xl mb-4">🔍</div>
        <p class="text-white/50 font-medium mb-2">Nenhuma transação encontrada</p>
        <p class="text-white/30 text-sm mb-6">Tenta ajustar os filtros ou adiciona uma nova transação</p>
        <button class="btn-primary text-sm" @click="showModal = true">
          <Plus class="w-4 h-4 inline mr-1" /> Adicionar Transação
        </button>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr class="bg-surface-800/50">
              <th>Descrição</th>
              <th class="hidden sm:table-cell">Categoria</th>
              <th>Data</th>
              <th class="text-right">Valor</th>
              <th class="hidden md:table-cell">Recorrência</th>
              <th class="text-center w-20">Ações</th>
            </tr>
          </thead>
          <tbody>
            <TransactionRow
              v-for="tx in finance.transactions"
              :key="tx._id"
              :transaction="tx"
              :show-table-cells="true"
              @edit="editTx = tx; showModal = true"
              @delete="handleDelete(tx._id)"
            />
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="finance.totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-white/[0.08]">
        <p class="text-white/40 text-sm">
          Página {{ finance.currentPage }} de {{ finance.totalPages }}
        </p>
        <div class="flex items-center gap-2">
          <button
            :disabled="finance.currentPage <= 1"
            class="btn-icon disabled:opacity-30"
            @click="changePage(finance.currentPage - 1)"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button
            v-for="p in visiblePages"
            :key="p"
            class="w-8 h-8 rounded-xl text-sm font-semibold transition-all duration-200"
            :class="p === finance.currentPage
              ? 'bg-brand-600 text-white'
              : 'text-white/50 hover:bg-white/10'"
            @click="changePage(p)"
          >
            {{ p }}
          </button>
          <button
            :disabled="finance.currentPage >= finance.totalPages"
            class="btn-icon disabled:opacity-30"
            @click="changePage(finance.currentPage + 1)"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
        <select v-model="pageSize" class="form-select text-xs py-1.5 w-20" @change="fetchNow">
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
    </div>

    <!-- Transaction Modal -->
    <TransactionModal
      v-if="showModal"
      :transaction="editTx"
      @close="showModal = false; editTx = null"
      @saved="onSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { Plus, Search, X, Download, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-vue-next'
import type { Transaction } from '~/types'

definePageMeta({ layout: 'default' })

const finance = useFinanceStore()
const toast = useToastStore()

const showModal = ref(false)
const editTx = ref<Transaction | null>(null)
const pageSize = ref('20')
const sortKey = ref('date:desc')

const filters = reactive({
  type: 'all' as string,
  categoryId: '',
  search: '',
  startDate: '',
  endDate: '',
})

const typeOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'income', label: 'Receitas' },
  { value: 'expense', label: 'Despesas' },
]

const hasActiveFilters = computed(
  () => filters.type !== 'all' || filters.categoryId || filters.search || filters.startDate || filters.endDate
)

const visiblePages = computed(() => {
  const total = finance.totalPages
  const current = finance.currentPage
  const pages: number[] = []
  const range = 2
  for (let i = Math.max(1, current - range); i <= Math.min(total, current + range); i++) {
    pages.push(i)
  }
  return pages
})

function buildFetchParams() {
  const [sortBy, sortOrder] = sortKey.value.split(':')
  return {
    type: filters.type === 'all' ? undefined : filters.type,
    categoryId: filters.categoryId || undefined,
    search: filters.search || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    sortBy,
    sortOrder,
    limit: parseInt(pageSize.value),
    page: 1,
  }
}

async function fetchNow() {
  await finance.fetchTransactions(buildFetchParams())
}

const debouncedFetch = useDebounceFn(fetchNow, 400)

function setType(val: string) {
  filters.type = val
  fetchNow()
}

function clearFilters() {
  filters.type = 'all'
  filters.categoryId = ''
  filters.search = ''
  filters.startDate = ''
  filters.endDate = ''
  sortKey.value = 'date:desc'
  fetchNow()
}

async function changePage(page: number) {
  const [sortBy, sortOrder] = sortKey.value.split(':')
  await finance.fetchTransactions({ page, sortBy, sortOrder, limit: parseInt(pageSize.value) })
}

async function handleDelete(id: string) {
  if (!confirm('Eliminar esta transação?')) return
  try {
    await finance.deleteTransaction(id)
    toast.success('Transação eliminada')
  } catch {
    toast.error('Erro ao eliminar')
  }
}

async function onSaved() {
  showModal.value = false
  editTx.value = null
  toast.success('Guardado com sucesso! ✅')
  await fetchNow()
}

function exportCSV() {
  const headers = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor', 'Tags']
  const rows = finance.transactions.map((t) => [
    t.date,
    t.type === 'income' ? 'Receita' : 'Despesa',
    t.description,
    (t as any).categoryId?.name || '',
    t.type === 'income' ? t.amount : -t.amount,
    t.tags?.join(';') || '',
  ])
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `transacoes-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('CSV exportado!')
}

onMounted(async () => {
  await Promise.all([fetchNow(), finance.fetchCategories()])
})
</script>
