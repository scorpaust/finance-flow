export type TransactionType = 'income' | 'expense'
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface Category {
  _id: string
  name: string
  type: TransactionType | 'both'
  icon: string
  color: string
  monthlyLimit?: number
  userId: string
  groupId?: string
  isDefault: boolean
  createdAt: Date
}

export interface Transaction {
  _id: string
  userId: string
  type: TransactionType
  amount: number
  // Fase 7, tarefa 6 — `amount` é sempre o equivalente em €; quando a
  // transação nasce numa moeda estrangeira, estes três campos preservam o
  // valor e a taxa originais (null/'EUR' numa transação normal em €).
  currency: string
  originalAmount: number | null
  exchangeRate: number | null
  description: string
  categoryId: string
  category?: Category
  date: string
  tags: string[]
  recurrence: RecurrenceType
  notes?: string
  attachmentUrl?: string
  groupId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

export interface FilterOptions {
  type?: TransactionType | 'all'
  categoryId?: string
  groupId?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  search?: string
  tags?: string[]
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const CATEGORY_ICONS = [
  '🏠', '🚗', '🍕', '🛒', '💊', '📚', '🎮', '✈️', '💪', '👔',
  '💡', '📱', '🎵', '🍺', '☕', '🎁', '🐾', '🏥', '💰', '📈',
  '💼', '🏦', '🎨', '🌱', '🔧', '🎓', '🏋️', '🛡️', '⚡', '🍎',
]

export const CATEGORY_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#3b82f6', '#a855f7', '#d946ef', '#ef4444', '#f59e0b',
]

// Fase 5 — resultado da digitalização de um recibo/fatura (POST /api/transactions/scan).
// Serve só para pré-preencher o TransactionModal; nunca é uma transação gravada.
export type ScanConfidence = 'low' | 'medium' | 'high'

export interface DocumentScanResult {
  merchant: string | null
  date: string | null // YYYY-MM-DD
  amount: number
  currency: string
  type: TransactionType
  categoryId: string | null
  categoryName: string | null
  // Fase 7, tarefa 6 — só relevantes quando documentType='payslip'.
  documentType: 'receipt' | 'payslip'
  grossAmount: number | null
  deductions: number | null
  confidence: { merchant: ScanConfidence; date: ScanConfidence; amount: ScanConfidence; type: ScanConfidence }
}
