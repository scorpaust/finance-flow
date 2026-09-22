import { Category, Transaction } from '../../models'
import { requireAuth, sanitizeId } from '../../utils/auth'
import { resolveTransactionAmount } from '../../utils/transactionCurrency'

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const method = getMethod(event)
  const id = sanitizeId(getRouterParam(event, 'id') || '')

  const tx = await Transaction.findOne({ _id: id, userId })
  if (!tx) throw createError({ statusCode: 404, message: 'Transaction not found' })

  // ──────────── PUT: update ────────────
  if (method === 'PUT') {
    const body = await readBody(event)
    const { type, amount, currency, description, categoryId, date, tags, recurrence, notes, groupId } = body

    if (type !== undefined) tx.type = type
    // Fase 7, tarefa 6 — reavalia o equivalente em EUR sempre que o valor
    // e/ou a moeda mudam (currency pode chegar sozinha, ex. corrigir uma
    // transação já criada em EUR para a moeda certa do documento).
    if (amount !== undefined || currency !== undefined) {
      const resolved = await resolveTransactionAmount(
        amount !== undefined ? parseFloat(amount) : (tx.originalAmount ?? tx.amount),
        currency !== undefined ? currency : tx.currency,
        date !== undefined ? date : tx.date
      )
      tx.amount = resolved.amount
      tx.currency = resolved.currency
      tx.originalAmount = resolved.originalAmount
      tx.exchangeRate = resolved.exchangeRate
    }
    if (description !== undefined) tx.description = description.trim()
    if (categoryId !== undefined) {
      const category = await Category.findOne({ _id: categoryId, userId }).lean()
      if (!category) throw createError({ statusCode: 400, message: 'Invalid category' })
      tx.categoryId = categoryId
      if (groupId === undefined) tx.groupId = (category as any).groupId || null
    }
    if (date !== undefined) tx.date = new Date(date)
    if (tags !== undefined) tx.tags = tags
    if (recurrence !== undefined) tx.recurrence = recurrence
    if (notes !== undefined) tx.notes = notes?.trim()
    if (groupId !== undefined) tx.groupId = groupId || null

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
