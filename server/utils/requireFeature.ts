import type { H3Event } from 'h3'
import { User } from '../models'
import { requireAuth } from './auth'
import { hasFeature, requiredTierFor, type FeatureKey, type SubscriptionTier } from '../../shared/features'

export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  const user = await User.findById(userId).select('subscription').lean<{ subscription?: { tier?: SubscriptionTier } }>()
  return user?.subscription?.tier || 'free'
}

// Enforcement obrigatório no servidor — ver context/00-CODE-SPEC.md secção 4.
// Esconder uma feature no client é UX; isto aqui é a camada de segurança real.
export async function requireFeature(
  event: H3Event,
  feature: FeatureKey
): Promise<{ userId: string; tier: SubscriptionTier }> {
  const userId = await requireAuth(event)
  const tier = await getUserTier(userId)

  if (!hasFeature(tier, feature)) {
    throw createError({
      statusCode: 403,
      message: 'Funcionalidade bloqueada para o teu plano atual',
      data: { error: 'feature_locked', requiredTier: requiredTierFor(feature) },
    })
  }

  return { userId, tier }
}
