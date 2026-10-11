import mongoose from 'mongoose'
import { AiBudgetProposal, Transaction, TransactionGroup, User } from '../../models'
import { requireAuth } from '../../utils/auth'
import { getUserTier } from '../../utils/requireFeature'
import { onboardingState } from '../../../shared/onboarding'

// Upgrade 08 — progresso da lista de primeiros passos, deduzido dos dados.
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const uid = new mongoose.Types.ObjectId(userId)
  const [user, tier, expense, income, group, proposal] = await Promise.all([
    User.findById(userId).select('createdAt twoFactorEnabled onboardingDismissedAt').lean<{ createdAt: Date; twoFactorEnabled?: boolean; onboardingDismissedAt?: Date | null }>(),
    getUserTier(userId),
    Transaction.exists({ userId: uid, type: 'expense' }),
    Transaction.exists({ userId: uid, type: 'income' }),
    TransactionGroup.exists({ userId: uid, monthlyLimit: { $gt: 0 } }),
    AiBudgetProposal.exists({ userId: uid, status: 'ready' }),
  ])
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })
  return onboardingState({
    tier,
    hasExpense: !!expense,
    hasIncome: !!income,
    hasGroupLimit: !!group,
    hasBudgetProposal: !!proposal,
    twoFactorEnabled: !!user.twoFactorEnabled,
    accountAgeDays: (Date.now() - new Date(user.createdAt).getTime()) / 86_400_000,
    dismissed: !!user.onboardingDismissedAt,
  })
})
