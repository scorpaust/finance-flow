import { z } from 'zod'
import { Transaction, Category } from '../../models'
import { requireAuth } from '../../utils/auth'
import { getUserTier } from '../../utils/requireFeature'
import { resolveTransactionAmount } from '../../utils/transactionCurrency'
import { TIER_LIMITS } from '../../../shared/features'
import { getServerLocale, serverT } from '../../utils/i18n'
import { validateBody } from '../../utils/validate'
import { readTransactionListQuery } from '../../utils/queryFilters'

// Fase 8, ponto 1 — shape validado por Zod (antes: `if (!type || !amount || ...)`,
// mensagem fixa em inglês, nunca traduzida).
const OBJECT_ID = /^[0-9a-fA-F]{24}$/
const TransactionCreateSchema = z.object({
  type: z.enum(['income', 'expense'], 'transactions.missingRequiredFields'),
  amount: z
    .union([z.number(), z.string()])
    .refine((v) => Number.isFinite(typeof v === 'string' ? parseFloat(v) : v) && (typeof v === 'string' ? parseFloat(v) : v) > 0, 'transactions.missingRequiredFields'),
  currency: z.string().trim().optional(),
  description: z.string().trim().min(1, 'transactions.missingRequiredFields'),
  categoryId: z.string().regex(OBJECT_ID, 'transactions.missingRequiredFields'),
  date: z
    .union([z.string(), z.number()])
    .refine((v) => !Number.isNaN(new Date(v).getTime()), 'transactions.missingRequiredFields'),
  tags: z.array(z.string()).optional(),
  recurrence: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']).optional(),
  notes: z.string().trim().optional(),
  groupId: z.string().regex(OBJECT_ID).nullable().optional(),
})

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const method = getMethod(event)
  const locale = getServerLocale(event)

  // ──────────── GET: list transactions ────────────
  if (method === 'GET') {
    const { filter, page: pageNum, limit: limitNum, sort } = await readTransactionListQuery(event, userId)
    const skip = (pageNum - 1) * limitNum

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('categoryId', 'name icon color type')
        .populate('groupId', 'name color')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Transaction.countDocuments(filter),
    ])

    return {
      data: transactions,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    }
  }

  // ──────────── POST: create transaction ────────────
  if (method === 'POST') {
    const { type, amount, currency, description, categoryId, date, tags, recurrence, notes, groupId } =
      await validateBody(event, TransactionCreateSchema)

    const tier = await getUserTier(userId)
    const monthlyLimit = TIER_LIMITS[tier].transactionsPerMonth
    if (monthlyLimit !== null) {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      const countThisMonth = await Transaction.countDocuments({ userId, createdAt: { $gte: startOfMonth } })
      if (countThisMonth >= monthlyLimit) {
        throw createError({
          statusCode: 403,
          message: serverT(locale, 'transactions.monthlyLimitReached', { limit: monthlyLimit }),
          data: { error: 'feature_locked', requiredTier: 'pro' },
        })
      }
    }

    const category = await Category.findOne({ _id: categoryId, userId }).lean()
    if (!category) throw createError({ statusCode: 400, message: serverT(locale, 'transactions.invalidCategory') })

    const resolved = await resolveTransactionAmount(locale, Number(amount), currency, new Date(date))

    const tx = await Transaction.create({
      userId,
      type,
      amount: resolved.amount,
      currency: resolved.currency,
      originalAmount: resolved.originalAmount,
      exchangeRate: resolved.exchangeRate,
      description: description.trim(),
      categoryId,
      date: new Date(date),
      tags: tags || [],
      recurrence: recurrence || 'none',
      notes: notes?.trim(),
      groupId: groupId || (category as any).groupId || null,
    })

    await tx.populate('categoryId', 'name icon color type')
    return tx
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})
