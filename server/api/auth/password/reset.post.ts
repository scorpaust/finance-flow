import { z } from 'zod'
import { PasswordResetToken } from '../../../models'
import { validateBody } from '../../../utils/validate'
import { enforceRateLimit } from '../../../utils/rateLimit'
import { getServerLocale, serverT } from '../../../utils/i18n'
import { clearAppSession } from '../../../utils/session'
import { hashResetToken, isWellFormedToken, setNewPassword } from '../../../utils/passwordReset'
import { logEvent } from '../../../utils/logger'

// Upgrade 05 — define a nova password a partir do link do email. O token tem
// de existir, não pode ter expirado nem sido usado; é marcado como usado de
// forma atómica (dois pedidos com o mesmo link: só um passa). Todas as
// sessões do utilizador terminam; o utilizador volta a entrar (com o 2FA, se
// o tiver ativo — a recuperação não o desliga).
const ResetSchema = z.object({
  token: z.string().min(1, 'passwordReset.invalidLink'),
  password: z.string().min(8, 'auth.passwordTooShort'),
})

export default defineEventHandler(async (event) => {
  const { token, password } = await validateBody(event, ResetSchema)
  await enforceRateLimit(event, { name: 'auth-reset-ip', limit: 20, windowSeconds: 15 * 60 })
  const locale = getServerLocale(event)

  const invalid = () => createError({ statusCode: 400, message: serverT(locale, 'passwordReset.invalidLink'), data: { error: 'invalid_reset_link' } })
  if (!isWellFormedToken(token)) throw invalid()

  const used = await PasswordResetToken.findOneAndUpdate(
    { _id: hashResetToken(token), usedAt: null, expiresAt: { $gt: new Date() } },
    { $set: { usedAt: new Date() } },
    { new: true }
  ).lean()
  if (!used) throw invalid()

  await setNewPassword({ userId: String(used.userId), password, locale })
  await PasswordResetToken.deleteMany({ userId: used.userId, _id: { $ne: used._id } })
  // Este browser também começa sem sessão (pode ser o de outra pessoa).
  clearAppSession(event)
  logEvent('info', 'auth.password_reset_completed', { userId: String(used.userId) }, event)

  return { success: true }
})
