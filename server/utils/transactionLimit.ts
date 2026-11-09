import { Transaction } from '../models'
import { getUserTier } from './requireFeature'
import { TIER_LIMITS } from '../../shared/features'
import { serverT, type ServerLocale } from './i18n'

// Limite de transações por mês do plano gratuito, igual para todas as formas
// de criar uma (formulário, recorrência confirmada).
export async function assertCanCreateTransaction(userId: string, locale: ServerLocale): Promise<void> {
  const tier = await getUserTier(userId)
  const monthlyLimit = TIER_LIMITS[tier].transactionsPerMonth
  if (monthlyLimit === null) return
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
