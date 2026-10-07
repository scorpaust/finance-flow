import { z } from 'zod'
import { requireAuth } from '../../../utils/auth'
import { validateBody } from '../../../utils/validate'
import { enforceRateLimit } from '../../../utils/rateLimit'
import { getServerLocale, serverT } from '../../../utils/i18n'
import { PlayApiError, syncPlayPurchase } from '../../../utils/googlePlay'
import { effectiveTier } from '../../../../shared/features'

// Upgrade 01 — chamado pela app logo depois de uma compra na Google Play (e
// ao abrir a app, para compras cuja confirmação se perdeu). Lê a compra na
// Google, confirma que é desta conta, aplica o plano e confirma-a à Google
// (acknowledge — sem isso a Google reembolsa ao fim de 3 dias).
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await enforceRateLimit(event, { name: 'play-verify', limit: 30, windowSeconds: 60 * 60, identity: userId })
  const locale = getServerLocale(event)
  const { purchaseToken } = await validateBody(event, z.object({ purchaseToken: z.string().trim().min(10).max(4000) }))

  let result
  try {
    result = await syncPlayPurchase(purchaseToken, { source: 'verify', userId })
  } catch (e) {
    // Token desconhecido/expirado na Google.
    if (e instanceof PlayApiError && (e.status === 400 || e.status === 404 || e.status === 410)) {
      throw createError({ statusCode: 400, message: serverT(locale, 'subscriptionApi.playInvalidPurchase'), data: { error: 'play_invalid_purchase' } })
    }
    throw e
  }

  if (result.outcome === 'web_conflict') {
    throw createError({ statusCode: 409, message: serverT(locale, 'subscriptionApi.webSubscriptionActive'), data: { error: 'web_subscription_active' } })
  }
  if (result.outcome === 'token_conflict') {
    throw createError({ statusCode: 409, message: serverT(locale, 'subscriptionApi.playPurchaseOtherAccount'), data: { error: 'play_token_conflict' } })
  }
  if (result.outcome === 'invalid_product') {
    throw createError({ statusCode: 400, message: serverT(locale, 'subscriptionApi.playInvalidPurchase'), data: { error: 'play_invalid_product' } })
  }

  const sub = result.subscription
  return { outcome: result.outcome, tier: sub ? effectiveTier(sub) : null, status: sub?.status || null }
})
