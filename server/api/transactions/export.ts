import { Transaction } from '../../models'
import { requireFeature } from '../../utils/requireFeature'

// Exportar CSV é Pro+ — ver context/00-CODE-SPEC.md secção 3 (matriz de features).
// Endpoint dedicado (em vez de gerar o CSV a partir dos dados já carregados no
// client) para que o bloqueio seja real e não apenas escondido na UI.
export default defineEventHandler(async (event) => {
  const { userId } = await requireFeature(event, 'csvExport')

  const query = getQuery(event) as Record<string, string>
  const { type, categoryId, groupId, startDate, endDate, search } = query

  const filter: Record<string, any> = { userId }
  if (type && type !== 'all') filter.type = type
  if (categoryId) filter.categoryId = categoryId
  if (groupId) filter.groupId = groupId === 'none' ? null : groupId
  if (startDate || endDate) {
    filter.date = {}
    if (startDate) filter.date.$gte = new Date(startDate)
    if (endDate) filter.date.$lte = new Date(endDate + 'T23:59:59.999Z')
  }
  if (search) {
    filter.$or = [
      { description: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ]
  }

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
