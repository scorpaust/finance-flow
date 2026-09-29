import { z } from 'zod'
import { User } from '../../models'
import { requireAuth } from '../../utils/auth'
import { validateBody } from '../../utils/validate'
import { enforceRateLimit } from '../../utils/rateLimit'
import { verifyPassword } from '../../utils/password'
import { decryptSecret, verifyTotpCode, consumeBackupCode } from '../../utils/twoFactor'
import { deleteUserAccount } from '../../utils/accountDeletion'
import { clearAppSession } from '../../utils/session'
import { getServerLocale, serverT } from '../../utils/i18n'
import { logEvent } from '../../utils/logger'

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
  await enforceRateLimit(event, { name: 'account-delete', limit: 5, windowSeconds: 60 * 60, identity: userId })

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

  try {
    await deleteUserAccount(userId)
  } catch (e) {
    logEvent('error', 'account.delete_cancel_subscription_failed', { userId, message: String((e as Error)?.message || e).slice(0, 300) })
    throw createError({ statusCode: 502, message: serverT(locale, 'account.cancelSubscriptionFailed') })
  }

  clearAppSession(event)
  return { success: true }
})
