import { requireAuth } from '../../../utils/auth'
import { createSubscriptionCheckout, encodeMerchantKey } from '../../../utils/easypay'
import { TIER_PRICE_EUR } from '../../../../shared/features'
import { User } from '../../../models'
import { getServerLocale, serverT } from '../../../utils/i18n'

// Onboarding do fluxo 'auto' (Cartão/Débito Direto) — ver
// context/features/02-FASE-2-sistema-subscricoes.md tarefa 5. O checkout
// EasyPay cria diretamente a Subscription nativa no fim do formulário
// hospedado (que recolhe também o IBAN/titular/telefone para DD — não
// duplicado no nosso lado, ver server/utils/easypay.ts); o webhook (evento
// subscription_create) é que confirma e atualiza User.subscription — este
// endpoint só inicia o processo.
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const locale = getServerLocale(event)
  const body = await readBody<{ tier?: 'pro' | 'premium'; method?: 'cc' | 'dd' }>(event)
  const { tier, method } = body

  if (tier !== 'pro' && tier !== 'premium') {
    throw createError({ statusCode: 400, message: serverT(locale, 'subscriptionApi.invalidTier') })
  }
  if (method !== 'cc' && method !== 'dd') {
    throw createError({ statusCode: 400, message: serverT(locale, 'subscriptionApi.invalidMethodCcDd') })
  }

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

  return { manifest: checkout }
})
