import mongoose from 'mongoose'
import { Transaction, User } from '../../models'
import { requireAuth } from '../../utils/auth'

// Upgrade 07 — pode a app pedir já a avaliação na Google Play (In-App Review)?
// Regras (políticas da Google: um momento positivo, nunca depois de um erro,
// nunca a partir de um botão): conta com pelo menos 30 dias e 10 transações,
// e no máximo uma vez por conta. A app chama isto logo depois de guardar uma
// transação; se a resposta for `prompt: true`, mostra o pedido da Google (que
// decide sozinha se aparece). O registo é atómico: dois pedidos ao mesmo tempo
// não pedem duas vezes.
const REVIEW_MIN_ACCOUNT_DAYS = 30
const REVIEW_MIN_TRANSACTIONS = 10

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const user = await User.findById(userId).select('createdAt reviewPromptedAt').lean<{ createdAt: Date; reviewPromptedAt?: Date | null }>()
  if (!user || user.reviewPromptedAt) return { prompt: false }

  const ageDays = (Date.now() - new Date(user.createdAt).getTime()) / 86_400_000
  if (ageDays < REVIEW_MIN_ACCOUNT_DAYS) return { prompt: false }

  const count = await Transaction.countDocuments({ userId: new mongoose.Types.ObjectId(userId) }).limit(REVIEW_MIN_TRANSACTIONS)
  if (count < REVIEW_MIN_TRANSACTIONS) return { prompt: false }

  const res = await User.updateOne(
    { _id: userId, $or: [{ reviewPromptedAt: null }, { reviewPromptedAt: { $exists: false } }] },
    { $set: { reviewPromptedAt: new Date() } }
  )
  return { prompt: res.modifiedCount === 1 }
})
