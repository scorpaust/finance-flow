import { z } from 'zod'
import { User } from '../../../models'
import { requireAuth } from '../../../utils/auth'
import { validateBody } from '../../../utils/validate'
import { enforceRateLimit } from '../../../utils/rateLimit'
import { decryptSecret, verifyTotpCode, generateBackupCodes } from '../../../utils/twoFactor'
import { getServerLocale, serverT } from '../../../utils/i18n'

const EnableSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, 'twoFactor.invalidCode'),
})

// Confirma o setup (server/api/auth/2fa/setup.post.ts) com um código real da
// app autenticadora antes de ativar o 2FA — nunca fica ativo só por o
// utilizador ter digitalizado o QR code, tem de provar que o consegue usar.
// Gera os códigos de recuperação só aqui, devolvidos em texto simples UMA
// única vez (só o hash fica guardado, ver server/utils/twoFactor.ts).
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await enforceRateLimit(event, { name: '2fa-enable', limit: 10, windowSeconds: 15 * 60, identity: userId })

  const { code } = await validateBody(event, EnableSchema)
  const locale = getServerLocale(event)

  const user = await User.findById(userId).select('+twoFactorSecret twoFactorEnabled')
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })
  if (user.twoFactorEnabled) {
    throw createError({ statusCode: 409, message: serverT(locale, 'twoFactor.alreadyEnabled') })
  }
  if (!user.twoFactorSecret) {
    throw createError({ statusCode: 400, message: serverT(locale, 'twoFactor.setupNotFound') })
  }

  const secret = decryptSecret(user.twoFactorSecret)
  if (!verifyTotpCode(secret, code)) {
    throw createError({ statusCode: 401, message: serverT(locale, 'twoFactor.invalidCode') })
  }

  const { plain, hashed } = generateBackupCodes()
  user.twoFactorEnabled = true
  user.twoFactorBackupCodes = hashed
  await user.save()

  return { backupCodes: plain }
})
