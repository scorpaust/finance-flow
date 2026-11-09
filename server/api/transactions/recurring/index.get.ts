import { Transaction } from '../../../models'
import { requireAuth } from '../../../utils/auth'
import { RECURRENCE_LEAD_DAYS, dueOccurrence, nextOccurrence, suggestedDate, utcDay, type Recurrence } from '../../../../shared/recurrence'

// Transações recorrentes por confirmar (shared/recurrence.ts): a mais recente
// de cada série, quando a data prevista está a RECURRENCE_LEAD_DAYS dias ou já
// passou. Nada é criado aqui, só proposto.
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const today = new Date()

  await adoptLegacySeries(userId)

  const limit = new Date(utcDay(today).getTime() + RECURRENCE_LEAD_DAYS * 86_400_000)
  const heads = await Transaction.find({ userId, recurrence: { $ne: 'none' }, nextDueAt: { $ne: null, $lte: limit } })
    .populate('categoryId', 'name icon color type')
    .sort({ nextDueAt: 1 })
    .lean()

  return heads.flatMap((tx: any) => {
    const anchor = tx.recurrenceAnchorDay || utcDay(tx.date).getUTCDate()
    const expected = dueOccurrence(tx.nextDueAt, tx.recurrence as Recurrence, anchor, today)
    if (!expected) return []
    return [{
      _id: tx._id,
      type: tx.type,
      description: tx.description,
      recurrence: tx.recurrence,
      category: tx.categoryId,
      // O valor como foi registado (na moeda original, se não for euros).
      amount: tx.originalAmount ?? tx.amount,
      currency: tx.currency || 'EUR',
      expectedDate: expected,
      suggestedDate: suggestedDate(expected, today),
    }]
  })
})

// Transações recorrentes de antes desta funcionalidade não têm `nextDueAt`.
// Quem as repetiu à mão tem várias da mesma série: só a mais recente fica a
// propor a seguinte, para não aparecerem repetidas.
async function adoptLegacySeries(userId: string) {
  const legacy = await Transaction.find({ userId, recurrence: { $ne: 'none' }, nextDueAt: { $exists: false } })
    .select('type description categoryId recurrence date')
    .sort({ date: -1 })
    .lean()
  if (!legacy.length) return

  const seen = new Set<string>()
  const ops = legacy.map((tx: any) => {
    const key = [tx.type, String(tx.description).trim().toLowerCase(), String(tx.categoryId), tx.recurrence].join('|')
    const isHead = !seen.has(key)
    seen.add(key)
    const anchor = utcDay(tx.date).getUTCDate()
    return {
      updateOne: {
        filter: { _id: tx._id, nextDueAt: { $exists: false } },
        update: { $set: {
          recurrenceAnchorDay: anchor,
          nextDueAt: isHead ? nextOccurrence(tx.date, tx.recurrence as Recurrence, anchor) : null,
        } },
      },
    }
  })
  await Transaction.bulkWrite(ops)
}
