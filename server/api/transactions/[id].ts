import { z } from 'zod'
import { Category, Transaction } from '../../models'
import { requireAuth, sanitizeId } from '../../utils/auth'
import { resolveTransactionAmount } from '../../utils/transactionCurrency'
import { getServerLocale, serverT } from '../../utils/i18n'
import { validateBody } from '../../utils/validate'

// Fase 8, ponto 1 — PUT é uma edição parcial (só os campos enviados mudam),
// por isso todos os campos são opcionais; ainda assim o formato de cada um é
// validado (antes, um `categoryId`/`groupId` que não fosse um ObjectId válido
// rebentava com um CastError do Mongoose em vez de um 400 limpo).
const OBJECT_ID = /^[0-9a-fA-F]{24}$/
const TransactionUpdateSchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  amount: z.union([z.number(), z.string()]).optional(),
  currency: z.string().trim().optional(),
  description: z.string().trim().min(1).optional(),
  categoryId: z.string().regex(OBJECT_ID).optional(),
  date: z.union([z.string(), z.number()]).optional(),
  tags: z.array(z.string()).optional(),
  recurrence: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']).optional(),
  notes: z.string().trim().optional(),
  groupId: z.string().regex(OBJECT_ID).nullable().optional().or(z.literal('')),
})

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const method = getMethod(event)
  const locale = getServerLocale(event)
  const id = sanitizeId(getRouterParam(event, 'id') || '')

  const tx = await Transaction.findOne({ _id: id, userId })
  if (!tx) throw createError({ statusCode: 404, message: serverT(locale, 'transactions.notFound') })

  // ──────────── PUT: update ────────────
  if (method === 'PUT') {
    const { type, amount, currency, description, categoryId, date, tags, recurrence, notes, groupId } =
      await validateBody(event, TransactionUpdateSchema)

    if (type !== undefined) tx.type = type
    // Fase 7, tarefa 6 — reavalia o equivalente em EUR sempre que o valor
    // e/ou a moeda mudam (currency pode chegar sozinha, ex. corrigir uma
    // transação já criada em EUR para a moeda certa do documento).
    if (amount !== undefined || currency !== undefined) {
      const resolved = await resolveTransactionAmount(
        locale,
        amount !== undefined ? Number(amount) : (tx.originalAmount ?? tx.amount),
        currency !== undefined ? currency : tx.currency,
        date !== undefined ? new Date(date) : tx.date
      )
      tx.amount = resolved.amount
      tx.currency = resolved.currency
      tx.originalAmount = resolved.originalAmount
      tx.exchangeRate = resolved.exchangeRate
    }
    if (description !== undefined) tx.description = description.trim()
    if (categoryId !== undefined) {
      const category = await Category.findOne({ _id: categoryId, userId }).lean()
      if (!category) throw createError({ statusCode: 400, message: serverT(locale, 'transactions.invalidCategory') })
      // `set` deixa o Mongoose converter a string num ObjectId.
      tx.set('categoryId', categoryId)
      if (groupId === undefined) tx.groupId = (category as any).groupId || null
    }
    if (date !== undefined) tx.date = new Date(date)
    if (tags !== undefined) tx.tags = tags
    if (recurrence !== undefined) tx.recurrence = recurrence
    if (notes !== undefined) tx.notes = notes?.trim()
    if (groupId !== undefined) tx.set('groupId', groupId || null)

    await tx.save()
    await tx.populate('categoryId', 'name icon color type')
    return tx
  }

  // ──────────── DELETE ────────────
  if (method === 'DELETE') {
    await tx.deleteOne()
    return { success: true }
  }

  // ──────────── GET single ────────────
  if (method === 'GET') {
    await tx.populate('categoryId', 'name icon color type')
    await tx.populate('groupId', 'name color')
    return tx
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})
