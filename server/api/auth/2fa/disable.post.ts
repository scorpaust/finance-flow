import { z } from 'zod'
import { User } from '../../../models'
import { requireAuth } from '../../../utils/auth'
import { validateBody } from '../../../utils/validate'
import { enforceRateLimit } from '../../../utils/rateLimit'
import { verifyPassword } from '../../../utils/password'
import { decryptSecret, verifyTotpCode, consumeBackupCode } from '../../../utils/twoFactor'
import { getServerLocale, serverT } from '../../../utils/i18n'

const DisableSchema = z.object({
  password: z.string().min(1, 'auth.passwordTooShort'),
  code: z.string().trim().min(1, 'twoFactor.invalidCode'),
})

// Exige a password atual + um código válido (TOTP ou de recuperação) antes de
// desligar o 2FA — um dispositivo já autenticado sozinho não deve bastar para
// remover a segunda camada de proteção (spec, ponto 3).
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await enforceRateLimit(event, { name: '2fa-disable', limit: 10, windowSeconds: 15 * 60, identity: userId })

  const { password, code } = await validateBody(event, DisableSchema)
  const locale = getServerLocale(event)

  const user = await User.findById(userId).select('+passwordHash +twoFactorSecret +twoFactorBackupCodes twoFactorEnabled')
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })
  if (!user.twoFactorEnabled) {
    throw createError({ statusCode: 409, message: serverT(locale, 'twoFactor.notEnabled') })
  }
  if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    throw createError({ statusCode: 401, message: serverT(locale, 'twoFactor.invalidPassword') })
  }

  const secret = user.twoFactorSecret ? decryptSecret(user.twoFactorSecret) : null
  const validTotp = secret ? verifyTotpCode(secret, code) : false
  const validBackup = !validTotp && !!user.twoFactorBackupCodes && consumeBackupCode(user.twoFactorBackupCodes, code) !== null
  if (!validTotp && !validBackup) {
    throw createError({ statusCode: 401, message: serverT(locale, 'twoFactor.invalidCode') })
  }

  user.twoFactorEnabled = false
  user.twoFactorSecret = undefined
  user.twoFactorBackupCodes = undefined
  await user.save()

  return { success: true }
})
