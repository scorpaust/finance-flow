import { z } from 'zod'
import { User } from '../../../models'
import { requireAuth } from '../../../utils/auth'
import { validateBody } from '../../../utils/validate'
import { enforceRateLimit } from '../../../utils/rateLimit'
import { getServerLocale, serverT } from '../../../utils/i18n'
import { issueSession } from '../../../utils/session'
import { verifyPassword } from '../../../utils/password'
import { setNewPassword } from '../../../utils/passwordReset'
import { logEvent } from '../../../utils/logger'

// Upgrade 05 — "Alterar password" nas Definições. Pede a password atual;
// termina as sessões nos outros dispositivos e mantém esta (nova sessão com a
// versão nova); envia o aviso por email.
const ChangeSchema = z.object({
  currentPassword: z.string().min(1, 'passwordReset.currentRequired'),
  newPassword: z.string().min(8, 'auth.passwordTooShort'),
})

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const { currentPassword, newPassword } = await validateBody(event, ChangeSchema)
  await enforceRateLimit(event, { name: 'auth-change-password', limit: 8, windowSeconds: 15 * 60, identity: userId })
  const locale = getServerLocale(event)

  const user = await User.findById(userId).select('+passwordHash')
  if (!user?.passwordHash || !verifyPassword(currentPassword, user.passwordHash)) {
    logEvent('warn', 'auth.change_password_failed', { userId }, event)
    throw createError({ statusCode: 400, message: serverT(locale, 'twoFactor.invalidPassword'), data: { error: 'invalid_current_password' } })
  }
  if (verifyPassword(newPassword, user.passwordHash)) {
    throw createError({ statusCode: 400, message: serverT(locale, 'passwordReset.samePassword'), data: { error: 'same_password' } })
  }

  const version = await setNewPassword({ userId, password: newPassword, locale })
  issueSession(event, userId, version)
  logEvent('info', 'auth.password_changed', { userId }, event)
  return { success: true }
})
