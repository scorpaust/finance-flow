import { defineStore } from 'pinia'
import type { Transaction, Category, FilterOptions, PaginatedResponse } from '~/types'

export const useFinanceStore = defineStore('finance', () => {
  const transactions = ref<Transaction[]>([])
  const categories   = ref<Category[]>([])
  const total        = ref(0)
  const currentPage  = ref(1)
  const totalPages   = ref(1)
  const loading      = ref(false)
  const filters      = ref<FilterOptions>({
    type: 'all', page: 1, limit: 20, sortBy: 'date', sortOrder: 'desc',
  })

  async function fetchTransactions(opts?: Partial<FilterOptions>) {
    loading.value = true
    if (opts) filters.value = { ...filters.value, ...opts }
    try {
      // Strip undefined / empty values before sending
      const params: Record<string, any> = {}
      for (const [k, v] of Object.entries(filters.value)) {
        if (v !== undefined && v !== null && v !== '' && v !== 'all') {
          params[k] = v
        }
      }
      const res = await $fetch<PaginatedResponse<Transaction>>('/api/transactions', { params })
      transactions.value = res.data
      total.value        = res.total
      currentPage.value  = res.page
      totalPages.value   = res.totalPages
    } finally {
      loading.value = false
    }
  }

  async function createTransaction(data: Partial<Transaction>) {
    const tx = await $fetch<Transaction>('/api/transactions', { method: 'POST', body: data })
    await fetchTransactions()
    return tx
  }

  async function updateTransaction(id: string, data: Partial<Transaction>) {
    const tx = await $fetch<Transaction>(`/api/transactions/${id}`, { method: 'PUT', body: data })
    const idx = transactions.value.findIndex(t => t._id === id)
    if (idx >= 0) transactions.value[idx] = tx
    return tx
  }

  async function deleteTransaction(id: string) {
    await $fetch(`/api/transactions/${id}`, { method: 'DELETE' })
    transactions.value = transactions.value.filter(t => t._id !== id)
    total.value        = Math.max(0, total.value - 1)
  }

  async function fetchCategories(type?: string) {
    const params: Record<string, any> = {}
    if (type && type !== 'all') params.type = type
    categories.value = await $fetch<Category[]>('/api/categories', { params })
  }

  async function createCategory(data: Partial<Category>) {
    const cat = await $fetch<Category>('/api/categories', { method: 'POST', body: data })
    categories.value.push(cat)
    categories.value.sort((a, b) => a.name.localeCompare(b.name))
    return cat
  }

  async function deleteCategory(id: string) {
    await $fetch(`/api/categories/${id}`, { method: 'DELETE' })
    categories.value = categories.value.filter(c => c._id !== id)
  }

  const incomeCategories  = computed(() => categories.value.filter(c => c.type === 'income'  || c.type === 'both'))
  const expenseCategories = computed(() => categories.value.filter(c => c.type === 'expense' || c.type === 'both'))

  return {
    transactions, categories, total, currentPage, totalPages, loading, filters,
    incomeCategories, expenseCategories,
    fetchTransactions, createTransaction, updateTransaction, deleteTransaction,
    fetchCategories, createCategory, deleteCategory,
  }
})
