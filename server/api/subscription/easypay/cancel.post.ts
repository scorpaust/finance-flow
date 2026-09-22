import { User } from '../../../models'
import { requireAuth } from '../../../utils/auth'
import { cancelSubscription } from '../../../utils/easypay'
import { getServerLocale, serverT } from '../../../utils/i18n'

// Cancela a auto-renovação de uma subscrição EasyPay 'auto' (CC/DD) ativa. O
// acesso ao plano mantém-se até ao fim do período já pago (currentPeriodEnd)
// — só deixa de cobrar outra vez. O downgrade real para 'free' acontece nessa
// data, via server/api/subscription/check-expirations.post.ts.
// MB WAY/Multibanco não têm nada a cancelar aqui: são pagamentos únicos por
// período fixo (decisão do utilizador de 2026-09-19), sem renovação
// automática — simplesmente expiram no fim do período pago.
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const locale = getServerLocale(event)

  const user = await User.findById(userId).select('subscription')
  const subscriptionId = user?.subscription?.easypaySubscriptionId
  if (!subscriptionId || user?.subscription?.billingMode !== 'auto') {
    throw createError({ statusCode: 400, message: serverT(locale, 'subscriptionApi.noActiveAutoRenewSubscription') })
  }

  await cancelSubscription(subscriptionId)

  user!.subscription.status = 'canceled'
  user!.subscription.autoRenew = false
  await user!.save()

  return { success: true }
})
