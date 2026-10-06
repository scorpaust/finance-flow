import { z } from 'zod'
import { User, RefundedAccount } from '../../models'
import { requireAdminSecret } from '../../utils/cron'
import { validateBody } from '../../utils/validate'
import { deleteUserAccount } from '../../utils/accountDeletion'
import { logEvent, hashIdentifier } from '../../utils/logger'
import { revokePlaySubscription } from '../../utils/googlePlay'

const RefundDeleteSchema = z.object({ email: z.string().email() })

// Fase 8, ponto 9 — direito de livre resolução (Termos, ponto 4): reembolso
// total sem perguntas nos primeiros 14 dias, mas a conta é eliminada e o
// mesmo email fica impedido de criar uma nova conta durante 6 meses (senão o
// reembolso total seria trivial de repetir indefinidamente com a mesma
// conta). Acionado manualmente pelo OPERADOR (protegido por `x-admin-secret`,
// nunca pelo próprio utilizador) depois de processar o reembolso na EasyPay
// à mão — não há integração de reembolso automático. O pedido do cliente
// chega por email (dinismiguelcosta@gmail.com, ver Termos ponto 1); isto é
// só o passo de "apagar + bloquear" depois de o reembolso já estar feito.
export default defineEventHandler(async (event) => {
  requireAdminSecret(event)
  const { email } = await validateBody(event, RefundDeleteSchema)

  const user = await User.findOne({ email })
  if (!user) throw createError({ statusCode: 404, message: 'User not found' })

  const userId = String(user._id)
  // Upgrade 01 — compra feita na Google Play: o reembolso é da Google, pedido
  // pela API (revoke com reembolso total da última cobrança, fim imediato do
  // acesso). Se falhar, reembolsar à mão na Play Console (Encomendas).
  let googlePlayRefundFailed = false
  const sub = user.subscription
  if (sub?.billingMode === 'google_play' && sub.googlePlayPurchaseToken) {
    try {
      await revokePlaySubscription(sub.googlePlayPurchaseToken)
      sub.status = 'expired'
      sub.autoRenew = false
      await user.save()
    } catch (e) {
      googlePlayRefundFailed = true
      logEvent('error', 'admin.play_refund_failed', { account: hashIdentifier(email), message: String((e as any)?.message || e).slice(0, 200) }, event)
    }
  }
  try {
    await deleteUserAccount(userId)
  } catch (e) {
    logEvent('error', 'admin.refund_delete_failed', { account: hashIdentifier(email), message: String((e as any)?.message || e).slice(0, 200) }, event)
    throw createError({ statusCode: 502, message: 'Failed to cancel EasyPay subscription — account not deleted' })
  }

  await RefundedAccount.create({ email, refundedAt: new Date() })
  logEvent('warn', 'admin.refund_delete', { account: hashIdentifier(email) }, event)

  // true: reembolsar à mão na Play Console.
  return { success: true, googlePlayRefundFailed }
})
