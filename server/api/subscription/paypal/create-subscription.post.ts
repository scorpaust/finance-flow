import { requireAuth } from '../../../utils/auth'
import { createSubscription } from '../../../utils/paypal'

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const body = await readBody<{ tier?: 'pro' | 'premium' }>(event)
  const tier = body?.tier

  if (tier !== 'pro' && tier !== 'premium') {
    throw createError({ statusCode: 400, message: 'Plano inválido — tem de ser "pro" ou "premium"' })
  }

  const config = useRuntimeConfig()
  const planId = tier === 'pro' ? config.paypalPlanIdPro : config.paypalPlanIdPremium
  if (!planId) {
    throw createError({ statusCode: 500, message: `Plano PayPal não configurado para "${tier}" (ver PAYPAL_PLAN_ID_${tier.toUpperCase()})` })
  }

  const appUrl = config.public.appUrl
  const subscription = await createSubscription({
    planId,
    customId: userId,
    returnUrl: `${appUrl}/subscription/return?tier=${tier}&method=recurring`,
    cancelUrl: `${appUrl}/subscription?canceled=1`,
  })

  const approvalUrl = subscription.links.find((l) => l.rel === 'approve')?.href
  if (!approvalUrl) {
    throw createError({ statusCode: 502, message: 'PayPal não devolveu um link de aprovação' })
  }

  return { approvalUrl, paypalSubscriptionId: subscription.id }
})
