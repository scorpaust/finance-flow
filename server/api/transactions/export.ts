import { Transaction } from '../../models'
import { requireFeature } from '../../utils/requireFeature'
import { readTransactionFilter } from '../../utils/queryFilters'

// Exportar CSV é Pro+ — ver context/00-CODE-SPEC.md secção 3 (matriz de features).
// Endpoint dedicado (em vez de gerar o CSV a partir dos dados já carregados no
// client) para que o bloqueio seja real e não apenas escondido na UI.
export default defineEventHandler(async (event) => {
  const { userId } = await requireFeature(event, 'csvExport')

  const filter = await readTransactionFilter(event, userId)

  const transactions = await Transaction.find(filter)
    .populate('categoryId', 'name')
    .sort({ date: -1 })
    .lean()

  return transactions.map((t: any) => ({
    date: t.date,
    type: t.type,
    description: t.description,
    category: t.categoryId?.name || '',
    amount: t.amount, // sempre em € (ver server/utils/transactionCurrency.ts)
    currency: t.currency || 'EUR',
    originalAmount: t.originalAmount ?? '',
    tags: t.tags || [],
  }))
})
