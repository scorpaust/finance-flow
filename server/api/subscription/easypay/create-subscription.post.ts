import { requireAuth } from '../../../utils/auth'
import { createSubscriptionCheckout, encodeMerchantKey } from '../../../utils/easypay'
import { TIER_PRICE_EUR } from '../../../../shared/features'
import { User } from '../../../models'
import { getServerLocale, serverT } from '../../../utils/i18n'
import { enforceRateLimit } from '../../../utils/rateLimit'
import { z } from 'zod'
import { validateBody } from '../../../utils/validate'
import { assertNoActiveAutoRenew } from '../../../utils/subscriptionGuard'
import { getRequestCountry } from '../../../utils/geo'
import { registerCheckoutToken } from '../../../utils/googlePlayBilling'

// Onboarding do fluxo 'auto' (Cartão/Débito Direto) — ver
// context/features/02-FASE-2-sistema-subscricoes.md tarefa 5. O checkout
// EasyPay cria diretamente a Subscription nativa no fim do formulário
// hospedado (que recolhe também o IBAN/titular/telefone para DD — não
// duplicado no nosso lado, ver server/utils/easypay.ts); o webhook (evento
// subscription_create) é que confirma e atualiza User.subscription — este
// endpoint só inicia o processo.
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  // Fase 8, ponto 1 — criação de checkout é um endpoint sensível (gera custos
  // do lado da EasyPay e pode ser usado para enumerar/abusar o fluxo).
  await enforceRateLimit(event, { name: 'checkout-create', limit: 10, windowSeconds: 60 * 60, identity: userId })
  const locale = getServerLocale(event)
  const { tier, method, googlePlayToken } = await validateBody(
    event,
    z.object({
      tier: z.enum(['pro', 'premium'], 'subscriptionApi.invalidTier'),
      method: z.enum(['cc', 'dd'], 'subscriptionApi.invalidMethodCcDd'),
      // Fase 9 — só nas compras feitas na app Android: token da Play Billing
      // Library (alternative billing only), para reportar a transação à Google.
      googlePlayToken: z.string().trim().min(1).max(4000).optional(),
    })
  )

  await assertNoActiveAutoRenew(event, userId)

  const user = await User.findById(userId).select('name email').lean<{ name: string; email: string }>()
  if (!user) throw createError({ statusCode: 404, message: serverT(locale, 'subscriptionApi.userNotFound') })

  const checkout = await createSubscriptionCheckout({
    method: method === 'cc' ? 'CC' : 'DD',
    value: TIER_PRICE_EUR[tier],
    key: encodeMerchantKey(userId, tier, method),
    descriptive: `FinanceFlow ${tier}`,
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
      periodMonths: 1,
      regionCode: await getRequestCountry(event),
    })
  }

  return { manifest: checkout }
})
