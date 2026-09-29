import QRCode from 'qrcode'
import { User } from '../../../models'
import { requireAuth } from '../../../utils/auth'
import { enforceRateLimit } from '../../../utils/rateLimit'
import { encryptSecret, generateTotpSecret } from '../../../utils/twoFactor'
import { getServerLocale, serverT } from '../../../utils/i18n'

// Gera um novo segredo TOTP e o QR code para a app autenticadora — Fase 8,
// ponto 3. NÃO ativa o 2FA: só server/api/auth/2fa/enable.post.ts, depois de
// confirmar um código válido, marca `twoFactorEnabled`. Chamar isto outra vez
// antes de ativar substitui o segredo anterior (recomeça o setup do zero).
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await enforceRateLimit(event, { name: '2fa-setup', limit: 10, windowSeconds: 15 * 60, identity: userId })

  const locale = getServerLocale(event)
  const user = await User.findById(userId).select('email twoFactorEnabled')
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })
  if (user.twoFactorEnabled) {
    throw createError({ statusCode: 409, message: serverT(locale, 'twoFactor.alreadyEnabled') })
  }

  const { secretBase32, otpauthUrl } = generateTotpSecret(user.email)
  await User.updateOne({ _id: userId }, { $set: { twoFactorSecret: encryptSecret(secretBase32) } })

  const qrCode = await QRCode.toDataURL(otpauthUrl)
  return { secret: secretBase32, qrCode }
})
