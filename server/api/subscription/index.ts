import { User, PendingPayPalOrder } from '../../models'
import { requireAuth } from '../../utils/auth'
import type { IUserSubscription } from '../../models'

const DEFAULT_SUBSCRIPTION: IUserSubscription = {
  tier: 'free',
  status: 'active',
  provider: 'none',
  paymentMethod: 'none',
  periodType: 'none',
  autoRenew: false,
  currentPeriodEnd: null,
}

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const method = getMethod(event)

  if (method !== 'GET') {
    throw createError({ statusCode: 405, message: 'Method not allowed' })
  }

  const [user, pending] = await Promise.all([
    User.findById(userId).select('subscription').lean<{ subscription?: IUserSubscription }>(),
    // Referência MB WAY/Multibanco gerada mas ainda não paga — não altera o
    // plano atual (ver server/api/subscription/paypal/webhook.post.ts),
    // exposta à parte para a UI mostrar um aviso sem mentir sobre o tier ativo.
    PendingPayPalOrder.findOne({ userId }).sort({ createdAt: -1 }).lean(),
  ])

  const subscription = user?.subscription || DEFAULT_SUBSCRIPTION

  const daysUntilExpiry = subscription.currentPeriodEnd
    ? Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const pendingPurchase = pending
    ? {
        tier: pending.tier,
        periodMonths: pending.periodMonths,
        paymentMethod: pending.paymentMethod,
        createdAt: pending.createdAt,
      }
    : null

  return { subscription, daysUntilExpiry, pendingPurchase }
})
