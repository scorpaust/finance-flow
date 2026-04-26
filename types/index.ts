export interface User {
  _id: string
  name: string
  email: string
  image?: string
  createdAt: Date
}

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

export interface TransactionGroup {
  _id: string
  userId: string
  name: string
  description?: string
  color: string
  monthlyLimit?: number
  weeklyLimit?: number
  alertThreshold?: number
  transactions?: Transaction[]
  createdAt: Date
}

export interface MonthlyStats {
  month: string
  year: number
  totalIncome: number
  totalExpense: number
  balance: number
  topCategories: { category: string; amount: number; count: number }[]
}

export interface OverviewStats {
  currentBalance: number
  totalIncome: number
  totalExpense: number
  savingsRate: number
  monthlyAvgIncome: number
  monthlyAvgExpense: number
  transactionCount: number
  balanceChange: number
  incomeChange: number
  expenseChange: number
}

export interface ForecastData {
  date: string
  predicted: number
  lower: number
  upper: number
  type: 'income' | 'expense'
}

export interface PredictionResult {
  forecasts: ForecastData[]
  confidence: number
  trend: 'up' | 'down' | 'stable'
  insights: string[]
  nextMonthEstimate: {
    income: number
    expense: number
    balance: number
  }
}

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
  fill?: boolean
  tension?: number
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

export const DEFAULT_CATEGORIES: Partial<Category>[] = [
  { name: 'Salário', type: 'income', icon: '💰', color: '#10b981' },
  { name: 'Freelance', type: 'income', icon: '💼', color: '#6366f1' },
  { name: 'Investimentos', type: 'income', icon: '📈', color: '#22c55e' },
  { name: 'Outros Rendimentos', type: 'income', icon: '🏦', color: '#14b8a6' },
  { name: 'Habitação', type: 'expense', icon: '🏠', color: '#f43f5e' },
  { name: 'Alimentação', type: 'expense', icon: '🍕', color: '#f97316' },
  { name: 'Transporte', type: 'expense', icon: '🚗', color: '#eab308' },
  { name: 'Saúde', type: 'expense', icon: '💊', color: '#ec4899' },
  { name: 'Educação', type: 'expense', icon: '📚', color: '#8b5cf6' },
  { name: 'Lazer', type: 'expense', icon: '🎮', color: '#06b6d4' },
  { name: 'Vestuário', type: 'expense', icon: '👔', color: '#a855f7' },
  { name: 'Tecnologia', type: 'expense', icon: '📱', color: '#3b82f6' },
  { name: 'Utilities', type: 'expense', icon: '💡', color: '#d946ef' },
  { name: 'Viagens', type: 'expense', icon: '✈️', color: '#ef4444' },
]

export interface BudgetGroupTemplate {
  key: string
  name: string
  description: string
  color: string
  monthlyLimit: number
  weeklyLimit?: number
  alertThreshold: number
}

export interface CategoryTemplate extends Partial<Category> {
  groupKey?: string
  monthlyLimit?: number
}

export const DEFAULT_BUDGET_GROUPS: BudgetGroupTemplate[] = [
  { key: 'casa', name: 'Casa', description: 'Renda e contas da casa', color: '#f43f5e', monthlyLimit: 640, alertThreshold: 80 },
  { key: 'deslocacao', name: 'Deslocacao', description: 'Passe e gasolina', color: '#eab308', monthlyLimit: 80, alertThreshold: 80 },
  { key: 'estabilidade', name: 'Estabilidade pessoal', description: 'PPR, ginasio e seguros', color: '#14b8a6', monthlyLimit: 327, alertThreshold: 80 },
  { key: 'credito', name: 'Credito', description: 'CGD e restantes prestacoes', color: '#7c3aed', monthlyLimit: 250, alertThreshold: 80 },
  { key: 'trabalho', name: 'Trabalho', description: 'Ferramentas profissionais essenciais', color: '#0ea5e9', monthlyLimit: 110, alertThreshold: 80 },
  { key: 'alimentacao', name: 'Alimentacao', description: 'Supermercado e talho', color: '#16a34a', monthlyLimit: 160, weeklyLimit: 40, alertThreshold: 80 },
  { key: 'vida-diaria', name: 'Vida diaria', description: 'Pequenas despesas, lazer e cultura', color: '#a855f7', monthlyLimit: 30, weeklyLimit: 8, alertThreshold: 80 },
  { key: 'criativo', name: 'Investimento criativo', description: 'Edicao dos dois livros', color: '#2563eb', monthlyLimit: 1185, alertThreshold: 80 },
  { key: 'reserva', name: 'Reserva defensiva', description: 'Almofada de seguranca intocavel', color: '#6366f1', monthlyLimit: 600, alertThreshold: 100 },
]

export const PERSONAL_FINANCE_CATEGORIES: CategoryTemplate[] = [
  { name: 'Salario', type: 'income', icon: '💰', color: '#10b981', monthlyLimit: 1600 },
  { name: 'Freelance / Extra', type: 'income', icon: '💼', color: '#6366f1' },
  { name: 'Outros Rendimentos', type: 'income', icon: '📈', color: '#22c55e' },
  { name: 'Renda', type: 'expense', icon: '🏠', color: '#f43f5e', groupKey: 'casa', monthlyLimit: 490 },
  { name: 'Agua + luz + NOS + casa', type: 'expense', icon: '💡', color: '#f97316', groupKey: 'casa', monthlyLimit: 150 },
  { name: 'Passe', type: 'expense', icon: '🚌', color: '#eab308', groupKey: 'deslocacao', monthlyLimit: 40 },
  { name: 'Gasolina', type: 'expense', icon: '⛽', color: '#f59e0b', groupKey: 'deslocacao', monthlyLimit: 40 },
  { name: 'Ginasio', type: 'expense', icon: '💪', color: '#14b8a6', groupKey: 'estabilidade', monthlyLimit: 106.92 },
  { name: 'PPR', type: 'expense', icon: '📈', color: '#8b5cf6', groupKey: 'estabilidade', monthlyLimit: 80 },
  { name: 'Seguros + Securitas', type: 'expense', icon: '🛡️', color: '#3b82f6', groupKey: 'estabilidade', monthlyLimit: 140 },
  { name: 'Credito novo CGD', type: 'expense', icon: '🏦', color: '#7c3aed', groupKey: 'credito', monthlyLimit: 70 },
  { name: 'Outros creditos remanescentes', type: 'expense', icon: '💳', color: '#dc2626', groupKey: 'credito', monthlyLimit: 180 },
  { name: 'WiZink amortizacao', type: 'expense', icon: '💳', color: '#ef4444', groupKey: 'credito', monthlyLimit: 1500 },
  { name: 'Ferramentas profissionais', type: 'expense', icon: '🛠️', color: '#0ea5e9', groupKey: 'trabalho', monthlyLimit: 110 },
  { name: 'Replit', type: 'expense', icon: '💻', color: '#0891b2', groupKey: 'trabalho' },
  { name: 'OpenAI / Claude', type: 'expense', icon: '🤖', color: '#059669', groupKey: 'trabalho' },
  { name: 'Suno / Waves', type: 'expense', icon: '🎵', color: '#7c3aed', groupKey: 'trabalho' },
  { name: 'Supermercado', type: 'expense', icon: '🛒', color: '#16a34a', groupKey: 'alimentacao', monthlyLimit: 120 },
  { name: 'Talho / Frescos', type: 'expense', icon: '🥩', color: '#b45309', groupKey: 'alimentacao', monthlyLimit: 40 },
  { name: 'Dia a dia', type: 'expense', icon: '🪙', color: '#78716c', groupKey: 'vida-diaria', monthlyLimit: 20 },
  { name: 'Lazer / Cultura', type: 'expense', icon: '🎭', color: '#a855f7', groupKey: 'vida-diaria', monthlyLimit: 10 },
  { name: 'Edicao livros', type: 'expense', icon: '📚', color: '#2563eb', groupKey: 'criativo', monthlyLimit: 1185 },
  { name: 'Reserva de emergencia', type: 'expense', icon: '🔒', color: '#6366f1', groupKey: 'reserva', monthlyLimit: 600 },
]
