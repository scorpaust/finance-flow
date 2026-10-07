import { User } from '../../models'
import { requireAuth } from '../../utils/auth'
import type { IUserSubscription } from '../../models'
import { effectiveTier } from '../../../shared/features'
import { refreshPlayIfStale } from '../../utils/googlePlay'

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

  let user = await User.findById(userId).select('subscription').lean<{ subscription?: IUserSubscription }>()
  // Upgrade 01 — plano da Google Play com o período já passado: a renovação
  // pode ter acontecido sem a notificação da Google ter chegado. Lê de novo.
  if (await refreshPlayIfStale(user?.subscription)) {
    user = await User.findById(userId).select('subscription').lean<{ subscription?: IUserSubscription }>()
  }
  const subscription = user?.subscription || DEFAULT_SUBSCRIPTION

  const daysUntilExpiry = subscription.currentPeriodEnd
    ? Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  // O client decide a UI a partir de `subscription.tier` — tem de bater com o que
  // o servidor realmente aplica (ver effectiveTier em shared/features.ts).
  return { subscription: { ...subscription, tier: effectiveTier(subscription) }, daysUntilExpiry }
})
