import { z } from 'zod'
import { PasswordResetToken, User } from '../../../models'
import { validateBody } from '../../../utils/validate'
import { enforceRateLimit, withinIdentityQuota } from '../../../utils/rateLimit'
import { getServerLocale } from '../../../utils/i18n'
import { sendEmail } from '../../../utils/email'
import { passwordResetEmail } from '../../../utils/emailTemplates'
import { RESET_TOKEN_TTL_MINUTES, atLeast, newResetToken } from '../../../utils/passwordReset'
import { logEvent, hashIdentifier } from '../../../utils/logger'

// Upgrade 05 — "Esqueci-me da password". A resposta é SEMPRE a mesma, quer o
// email tenha conta quer não (e com o mesmo tempo de resposta), para não
// revelar quem tem conta. Limites: por IP (429, contra abuso em massa) e por
// conta, independentemente do IP (sem email a mais, mas a mesma resposta).
const ForgotSchema = z.object({
  email: z
    .string()
    .min(1, 'auth.emailRequired')
    .transform((v) => v.trim().toLowerCase())
    .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'auth.emailInvalid'),
})

const MIN_RESPONSE_MS = 1200

function appUrl(): string {
  return (process.env.APP_URL || useRuntimeConfig().public.appUrl || '').replace(/\/+$/, '')
}

export default defineEventHandler(async (event) => {
  const { email } = await validateBody(event, ForgotSchema)
  await enforceRateLimit(event, { name: 'auth-forgot-ip', limit: 10, windowSeconds: 60 * 60 })
  const locale = getServerLocale(event)

  await atLeast(
    MIN_RESPONSE_MS,
    (async () => {
      const user = await User.findOne({ email }).select('email name').lean<{ _id: any; email: string; name: string }>()
      if (!user) return
      if (!(await withinIdentityQuota({ name: 'auth-forgot-account', identity: email, limit: 3, windowSeconds: 60 * 60 }))) return

      // Um só link ativo por conta: pedir outro invalida os anteriores.
      await PasswordResetToken.deleteMany({ userId: user._id })
      const { token, tokenHash } = newResetToken()
      const now = new Date()
      await PasswordResetToken.create({
        _id: tokenHash,
        userId: user._id,
        expiresAt: new Date(now.getTime() + RESET_TOKEN_TTL_MINUTES * 60 * 1000),
        usedAt: null,
        createdAt: now,
      })

      const link = `${appUrl()}/reset-password?token=${encodeURIComponent(token)}`
      const sent = await sendEmail(passwordResetEmail({ to: user.email, name: user.name, link, minutes: RESET_TOKEN_TTL_MINUTES, locale }))
      logEvent('info', 'auth.password_reset_requested', { account: hashIdentifier(email), sent }, event)
    })()
  )

  return { success: true }
})
