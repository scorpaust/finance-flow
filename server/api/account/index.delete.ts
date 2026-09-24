import { z } from 'zod'
import {
  User,
  Category,
  TransactionGroup,
  Transaction,
  Investment,
  InvestmentTipsCache,
  AiInsightCache,
  DocumentScanUsage,
} from '../../models'
import { requireAuth } from '../../utils/auth'
import { validateBody } from '../../utils/validate'
import { enforceRateLimit } from '../../utils/rateLimit'
import { verifyPassword } from '../../utils/password'
import { decryptSecret, verifyTotpCode, consumeBackupCode } from '../../utils/twoFactor'
import { cancelSubscription } from '../../utils/easypay'
import { clearAppSession } from '../../utils/session'
import { getServerLocale, serverT } from '../../utils/i18n'

const DeleteSchema = z.object({
  password: z.string().min(1, 'twoFactor.invalidPassword'),
  code: z.string().trim().optional(),
})

// RGPD (Fase 8, ponto 9) — direito ao apagamento. Operação destrutiva e
// irreversível: exige a password atual (e um código 2FA/de recuperação se o
// 2FA estiver ativo), como a desativação do 2FA — uma sessão roubada sozinha
// não deve bastar para apagar tudo.
// Se houver uma subscrição com auto-renovação (CC/DD) a cobrar, é cancelada na
// EasyPay ANTES de apagar; se o cancelamento falhar, a conta NÃO é apagada —
// senão o cliente ficava a ser cobrado por uma conta que já não existe.
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  enforceRateLimit(event, { name: 'account-delete', limit: 5, windowSeconds: 60 * 60, identity: userId })

  const { password, code } = await validateBody(event, DeleteSchema)
  const locale = getServerLocale(event)

  const user = await User.findById(userId).select('+passwordHash +twoFactorSecret +twoFactorBackupCodes')
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    throw createError({ statusCode: 401, message: serverT(locale, 'twoFactor.invalidPassword') })
  }

  if (user.twoFactorEnabled) {
    const secret = user.twoFactorSecret ? decryptSecret(user.twoFactorSecret) : null
    const validTotp = !!code && !!secret && verifyTotpCode(secret, code)
    const validBackup = !validTotp && !!code && !!user.twoFactorBackupCodes && consumeBackupCode(user.twoFactorBackupCodes, code) !== null
    if (!validTotp && !validBackup) {
      throw createError({ statusCode: 401, message: serverT(locale, 'twoFactor.invalidCode') })
    }
  }

  const sub = user.subscription
  if (sub?.billingMode === 'auto' && sub.easypaySubscriptionId && ['active', 'past_due'].includes(sub.status)) {
    try {
      await cancelSubscription(sub.easypaySubscriptionId)
    } catch (e) {
      console.error('[account] falha a cancelar a subscrição EasyPay antes de apagar a conta:', e)
      throw createError({ statusCode: 502, message: serverT(locale, 'account.cancelSubscriptionFailed') })
    }
  }

  await Promise.all([
    Category.deleteMany({ userId }),
    TransactionGroup.deleteMany({ userId }),
    Transaction.deleteMany({ userId }),
    Investment.deleteMany({ userId }),
    AiInsightCache.deleteMany({ userId }),
    DocumentScanUsage.deleteMany({ userId }),
    InvestmentTipsCache.deleteOne({ _id: String(userId) }),
  ])
  await User.deleteOne({ _id: userId })

  clearAppSession(event)
  return { success: true }
})
