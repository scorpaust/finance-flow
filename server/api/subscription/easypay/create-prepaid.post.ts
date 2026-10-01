import { requireAuth } from '../../../utils/auth'
import { createSinglePaymentCheckout, encodeMerchantKey } from '../../../utils/easypay'
import { getRequestCountry } from '../../../utils/geo'
import { TIER_PRICE_EUR } from '../../../../shared/features'
import { User } from '../../../models'
import { getServerLocale, serverT } from '../../../utils/i18n'
import { enforceRateLimit } from '../../../utils/rateLimit'
import { z } from 'zod'
import { validateBody } from '../../../utils/validate'
import { assertNoActiveAutoRenew } from '../../../utils/subscriptionGuard'
import { registerCheckoutToken } from '../../../utils/googlePlayBilling'

const VALID_PERIODS = [1, 3, 6, 12] as const
type Period = (typeof VALID_PERIODS)[number]

// Onboarding dos fluxos 'push_confirm' (MB WAY) e 'manual_reference'
// (Multibanco) — período fixo pré-pago (decisão do utilizador de
// 2026-09-19): nenhum dos dois métodos permite renovação sem ação manual do
// cliente a cada ciclo, por isso substitui o desenho original da
// especificação (cron mensal a disparar cada ciclo). O utilizador paga o
// valor total do período escolhido de uma vez; sem auto-renovação — expira
// no fim do período (ver server/api/subscription/check-expirations.post.ts),
// tendo de voltar a esta página para renovar manualmente.
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await enforceRateLimit(event, { name: 'checkout-create', limit: 10, windowSeconds: 60 * 60, identity: userId })
  const locale = getServerLocale(event)
  const { tier, method, periodMonths, googlePlayToken } = await validateBody(
    event,
    z.object({
      tier: z.enum(['pro', 'premium'], 'subscriptionApi.invalidTier'),
      method: z.enum(['mbway', 'multibanco'], 'subscriptionApi.invalidMethodPrepaid'),
      periodMonths: z
        .number('subscriptionApi.invalidPeriod')
        .refine((v): v is Period => (VALID_PERIODS as readonly number[]).includes(v), 'subscriptionApi.invalidPeriod'),
      // Fase 9 — só nas compras feitas na app Android: token da Play Billing
      // Library (alternative billing only), para reportar a transação à Google.
      googlePlayToken: z.string().trim().min(1).max(4000).optional(),
    })
  )

  await assertNoActiveAutoRenew(event, userId)

  // MB WAY/Multibanco aceites em qualquer país (Fase 9 — ver
  // shared/paymentMethods.ts). O país só serve para o reporte à Google Play.
  const country = await getRequestCountry(event)

  const user = await User.findById(userId).select('name email').lean<{ name: string; email: string }>()
  if (!user) throw createError({ statusCode: 404, message: serverT(locale, 'subscriptionApi.userNotFound') })

  const value = TIER_PRICE_EUR[tier] * periodMonths

  const checkout = await createSinglePaymentCheckout({
    method: method === 'mbway' ? 'MBW' : 'MB',
    value,
    key: encodeMerchantKey(userId, tier, method, periodMonths),
    descriptive: `FinanceFlow ${tier} — ${periodMonths} mês(es)`,
    customerName: user.name,
    customerEmail: user.email,
  })

  if (googlePlayToken) {
    await registerCheckoutToken({
      userId,
      token: googlePlayToken,
      checkoutId: checkout.id,
      tier,
      method,
      periodMonths,
      regionCode: country,
    })
  }

  return { manifest: checkout }
})
