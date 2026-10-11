import mongoose from 'mongoose'
import { Transaction, User } from '../../models'
import { requireAuth } from '../../utils/auth'
import { RATING_MIN_ACCOUNT_DAYS, RATING_MIN_TRANSACTIONS } from '../../../shared/feedback'

// Upgrade 09 — mostrar já o pedido de opinião (1 a 5) na web? Mesmas condições
// do pedido de avaliação da loja na app Android (Upgrade 07: conta com 30+
// dias e 10+ transações), só a quem nunca recebeu nenhum dos dois, e uma única
// vez — o registo é atómico, como em account/review-prompt.post.ts.
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const user = await User.findById(userId)
    .select('createdAt reviewPromptedAt ratingPromptedAt')
    .lean<{ createdAt: Date; reviewPromptedAt?: Date | null; ratingPromptedAt?: Date | null }>()
  if (!user || user.reviewPromptedAt || user.ratingPromptedAt) return { show: false }
  if ((Date.now() - new Date(user.createdAt).getTime()) / 86_400_000 < RATING_MIN_ACCOUNT_DAYS) return { show: false }

  const count = await Transaction.countDocuments({ userId: new mongoose.Types.ObjectId(userId) }).limit(RATING_MIN_TRANSACTIONS)
  if (count < RATING_MIN_TRANSACTIONS) return { show: false }

  const res = await User.updateOne(
    { _id: userId, $or: [{ ratingPromptedAt: null }, { ratingPromptedAt: { $exists: false } }] },
    { $set: { ratingPromptedAt: new Date() } }
  )
  return { show: res.modifiedCount === 1 }
})
