import { User, Category, TransactionGroup, Transaction, Investment } from '../../models'
import { requireAuth } from '../../utils/auth'
import { enforceRateLimit } from '../../utils/rateLimit'

// RGPD (Fase 8, ponto 9) — direito de acesso/portabilidade: devolve TODOS os
// dados pessoais e financeiros do utilizador num JSON descarregável. Nunca
// inclui segredos de autenticação (hash da password, segredo TOTP, códigos de
// recuperação) — são credenciais, não "dados do utilizador" no sentido do
// pedido, e exportá-los só ampliava o estrago de uma sessão roubada.
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await enforceRateLimit(event, { name: 'account-export', limit: 5, windowSeconds: 60 * 60, identity: userId })

  const user = await User.findById(userId).select('-passwordHash -twoFactorSecret -twoFactorBackupCodes').lean()
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const [categories, groups, transactions, investments] = await Promise.all([
    Category.find({ userId }).lean(),
    TransactionGroup.find({ userId }).lean(),
    Transaction.find({ userId }).sort({ date: -1 }).lean(),
    Investment.find({ userId }).lean(),
  ])

  setResponseHeader(event, 'Content-Type', 'application/json; charset=utf-8')
  setResponseHeader(event, 'Content-Disposition', 'attachment; filename="financeflow-export.json"')
  setResponseHeader(event, 'Cache-Control', 'no-store')

  return {
    exportedAt: new Date().toISOString(),
    account: user,
    categories,
    groups,
    transactions,
    investments,
  }
})
