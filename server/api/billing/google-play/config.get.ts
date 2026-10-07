import { User, type IUserSubscription } from '../../../models'
import { requireAuth } from '../../../utils/auth'
import { ensurePlayAccountId, hasLiveWebSubscription, playPackageName } from '../../../utils/googlePlay'
import { effectiveTier } from '../../../../shared/features'

// Upgrade 01 — o que a app Android precisa antes de abrir a compra na Google
// Play: o identificador da conta a enviar à Google (`obfuscatedAccountId`),
// se há uma subscrição da web ativa (a compra fica escondida — decisão 7) e a
// compra Play atual (para mudanças de plano e carregamentos de pré-pagos).
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const accountId = await ensurePlayAccountId(userId)
  const user = await User.findById(userId).select('subscription').lean<{ subscription?: IUserSubscription }>()
  const sub = user?.subscription

  const playLive = sub?.billingMode === 'google_play' && effectiveTier(sub) !== 'free'
  return {
    accountId,
    packageName: playPackageName(),
    webSubscriptionActive: hasLiveWebSubscription(sub),
    current: playLive
      ? {
          tier: sub!.tier,
          productId: sub!.googlePlayProductId || null,
          basePlanId: sub!.googlePlayBasePlanId || null,
          purchaseToken: sub!.googlePlayPurchaseToken || null,
          autoRenew: !!sub!.autoRenew,
          allowExtendAfter: sub!.googlePlayAllowExtendAfter || null,
        }
      : null,
  }
})
