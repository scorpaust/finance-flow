import { User } from '../../models'
import { requireAuth } from '../../utils/auth'
import type { IUserSubscription } from '../../models'

const DEFAULT_SUBSCRIPTION: IUserSubscription = {
  tier: 'free',
  status: 'active',
  provider: 'none',
  paymentMethod: 'none',
  billingMode: 'none',
  autoRenew: false,
  currentPeriodEnd: null,
}

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const method = getMethod(event)

  if (method !== 'GET') {
    throw createError({ statusCode: 405, message: 'Method not allowed' })
  }

  const user = await User.findById(userId).select('subscription').lean<{ subscription?: IUserSubscription }>()
  const subscription = user?.subscription || DEFAULT_SUBSCRIPTION

  const daysUntilExpiry = subscription.currentPeriodEnd
    ? Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return { subscription, daysUntilExpiry }
})
