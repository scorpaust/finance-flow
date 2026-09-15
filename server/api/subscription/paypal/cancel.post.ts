import { User } from '../../../models'
import { requireAuth } from '../../../utils/auth'
import { cancelSubscription } from '../../../utils/paypal'

// Cancela a auto-renovação de uma subscrição PayPal ativa. O acesso ao plano
// mantém-se até ao fim do período já pago (currentPeriodEnd) — só deixa de
// cobrar outra vez. O downgrade real para 'free' acontece nessa data, via
// server/api/subscription/check-expirations.post.ts (o mesmo job que trata
// os planos pré-pagos), não aqui nem no momento do cancelamento.
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)

  const user = await User.findById(userId).select('subscription')
  const subscriptionId = user?.subscription?.paypalSubscriptionId
  if (!subscriptionId || user?.subscription?.periodType !== 'recurring') {
    throw createError({ statusCode: 400, message: 'Não tens uma subscrição com auto-renovação ativa' })
  }

  await cancelSubscription(subscriptionId, 'Cancelado pelo utilizador')

  user.subscription.status = 'canceled'
  user.subscription.autoRenew = false
  await user.save()

  return { success: true }
})
