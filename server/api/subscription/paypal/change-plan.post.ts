import { User } from '../../../models'
import { requireAuth } from '../../../utils/auth'
import { reviseSubscription } from '../../../utils/paypal'

// Upgrade/downgrade in-place de uma subscrição recorrente já ativa (cartão/
// saldo PayPal) — sem passar por cancelar + assinar de novo. Acesso à nova
// tier é imediato; a cobrança só reflete o novo preço no ciclo seguinte (a
// PayPal não proraciona automaticamente — decisão de negócio registada em
// context/current-feature.md).
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const body = await readBody<{ tier?: 'pro' | 'premium' }>(event)
  const newTier = body?.tier

  if (newTier !== 'pro' && newTier !== 'premium') {
    throw createError({ statusCode: 400, message: 'Plano inválido — tem de ser "pro" ou "premium"' })
  }

  const user = await User.findById(userId).select('subscription')
  if (!user) throw createError({ statusCode: 404, message: 'Utilizador não encontrado' })

  const { subscription } = user
  if (subscription.periodType !== 'recurring' || subscription.status !== 'active' || !subscription.paypalSubscriptionId) {
    throw createError({
      statusCode: 400,
      message: 'Só é possível mudar de plano com uma subscrição de auto-renovação ativa',
    })
  }
  if (subscription.tier === newTier) {
    throw createError({ statusCode: 400, message: 'Já estás nesse plano' })
  }

  const config = useRuntimeConfig()
  const newPlanId = newTier === 'pro' ? config.paypalPlanIdPro : config.paypalPlanIdPremium
  if (!newPlanId) {
    throw createError({ statusCode: 500, message: `Plano PayPal não configurado para "${newTier}"` })
  }

  await reviseSubscription(subscription.paypalSubscriptionId, newPlanId)

  subscription.tier = newTier
  await user.save()

  return { success: true, tier: newTier }
})
