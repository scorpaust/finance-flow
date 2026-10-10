import { z } from 'zod'
import { User } from '../../../models'
import { validateBody } from '../../../utils/validate'
import { enforceRateLimit } from '../../../utils/rateLimit'
import { readPending2fa, issueSession, clearAppSession } from '../../../utils/session'
import { decryptSecret, verifyTotpCode, consumeBackupCode } from '../../../utils/twoFactor'
import { getServerLocale, serverT } from '../../../utils/i18n'
import { logEvent } from '../../../utils/logger'

function toPublicUser(user: any) {
  return { _id: user._id, name: user.name, email: user.email, image: user.image, twoFactorEnabled: true }
}

const VerifySchema = z.object({
  code: z.string().trim().min(1, 'twoFactor.invalidCode'),
})

// Segundo passo do login quando o utilizador tem 2FA ativo (ver
// server/api/auth/session.ts — devolve `{ twoFactorRequired: true }` em vez
// de sessão completa). Sem requireAuth: neste ponto o utilizador ainda não
// está autenticado, só provou a password (cookie `pending_2fa`, 10 min).
// Aceita tanto o código TOTP de 6 dígitos como um código de recuperação de
// uso único. Rate limit dedicado e agressivo por ser alvo natural de força
// bruta — chaveado pelo próprio userId pendente, não só pelo IP.
export default defineEventHandler(async (event) => {
  const locale = getServerLocale(event)
  const userId = readPending2fa(event)
  if (!userId) {
    throw createError({ statusCode: 401, message: serverT(locale, 'twoFactor.pendingExpired') })
  }

  await enforceRateLimit(event, { name: '2fa-verify', limit: 5, windowSeconds: 10 * 60, identity: userId })

  const { code } = await validateBody(event, VerifySchema)

  const user = await User.findById(userId).select('+twoFactorSecret +twoFactorBackupCodes twoFactorEnabled name email image sessionVersion')
  if (!user?.twoFactorEnabled) {
    clearAppSession(event)
    throw createError({ statusCode: 401, message: serverT(locale, 'twoFactor.pendingExpired') })
  }

  const secret = user.twoFactorSecret ? decryptSecret(user.twoFactorSecret) : null
  let valid = secret ? verifyTotpCode(secret, code) : false
  let usedBackup = false

  if (!valid && user.twoFactorBackupCodes?.length) {
    const remaining = consumeBackupCode(user.twoFactorBackupCodes, code)
    if (remaining) {
      valid = true
      usedBackup = true
      user.twoFactorBackupCodes = remaining
    }
  }

  if (!valid) {
    logEvent('warn', 'auth.2fa_failed', { userId: String(user._id) }, event)
    throw createError({ statusCode: 401, message: serverT(locale, 'twoFactor.invalidCode') })
  }

  if (usedBackup) await user.save()

  issueSession(event, user._id.toString(), user.sessionVersion ?? 0)
  return { user: toPublicUser(user) }
})
