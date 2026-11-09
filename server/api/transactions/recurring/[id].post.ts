import { z } from 'zod'
import { Transaction } from '../../../models'
import { requireAuth, sanitizeId } from '../../../utils/auth'
import { resolveTransactionAmount } from '../../../utils/transactionCurrency'
import { assertCanCreateTransaction } from '../../../utils/transactionLimit'
import { getServerLocale, serverT } from '../../../utils/i18n'
import { validateBody } from '../../../utils/validate'
import { dueOccurrence, nextOccurrence, suggestedDate, utcDay, type Recurrence } from '../../../../shared/recurrence'

// Resposta a uma transação recorrente por confirmar:
//   confirm — cria a transação (valor e data podem ser acertados) e a série passa para ela;
//   skip    — salta esta ocorrência;
//   stop    — termina a série (as transações já registadas ficam).
const ActionSchema = z.object({
  action: z.enum(['confirm', 'skip', 'stop']),
  amount: z.number().positive().optional(),
  date: z.string().refine((v) => !Number.isNaN(new Date(v).getTime())).optional(),
})

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const locale = getServerLocale(event)
  const id = sanitizeId(getRouterParam(event, 'id') || '')
  const { action, amount, date } = await validateBody(event, ActionSchema)

  const head = await Transaction.findOne({ _id: id, userId, recurrence: { $ne: 'none' }, nextDueAt: { $ne: null } })
  if (!head) throw createError({ statusCode: 404, message: serverT(locale, 'transactions.notFound') })

  if (action === 'stop') {
    head.recurrence = 'none'
    head.nextDueAt = null
    head.recurrenceAnchorDay = null
    await head.save()
    return { stopped: true }
  }

  const today = new Date()
  const recurrence = head.recurrence as Recurrence
  const anchor = head.recurrenceAnchorDay || utcDay(head.date).getUTCDate()
  const expected = dueOccurrence(head.nextDueAt!, recurrence, anchor, today)
  if (!expected) throw createError({ statusCode: 409, message: serverT(locale, 'transactions.recurringNotDue') })

  // A série continua a contar da data prevista, não da data real: um salário
  // pago na sexta antes do dia 23 volta a ser previsto para 23.
  const following = nextOccurrence(expected, recurrence, anchor)

  if (action === 'skip') {
    head.nextDueAt = following
    await head.save()
    return { skipped: true }
  }

  await assertCanCreateTransaction(userId, locale)
  const when = date ? new Date(date) : suggestedDate(expected, today)
  const resolved = await resolveTransactionAmount(locale, amount ?? (head.originalAmount ?? head.amount), head.currency, when)

  const created = await Transaction.create({
    userId,
    type: head.type,
    amount: resolved.amount,
    currency: resolved.currency,
    originalAmount: resolved.originalAmount,
    exchangeRate: resolved.exchangeRate,
    description: head.description,
    categoryId: head.categoryId,
    groupId: head.groupId || null,
    date: when,
    tags: head.tags || [],
    recurrence,
    recurrenceAnchorDay: anchor,
    nextDueAt: following,
  })
  head.nextDueAt = null
  await head.save()

  await created.populate('categoryId', 'name icon color type')
  return created
})
