import { requireAuth } from '../../../utils/auth'
import { createSinglePaymentCheckout, encodeMerchantKey } from '../../../utils/easypay'
import { getRequestIp, lookupCountry } from '../../../utils/geo'
import { TIER_PRICE_EUR } from '../../../../shared/features'
import { isPrepaidMethodAvailable } from '../../../../shared/paymentMethods'
import { User } from '../../../models'

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
  const body = await readBody<{ tier?: 'pro' | 'premium'; method?: 'mbway' | 'multibanco'; periodMonths?: Period }>(event)
  const { tier, method, periodMonths } = body

  if (tier !== 'pro' && tier !== 'premium') {
    throw createError({ statusCode: 400, message: 'Plano inválido — tem de ser "pro" ou "premium"' })
  }
  if (method !== 'mbway' && method !== 'multibanco') {
    throw createError({ statusCode: 400, message: 'Método inválido — tem de ser "mbway" ou "multibanco"' })
  }
  if (!periodMonths || !VALID_PERIODS.includes(periodMonths)) {
    throw createError({ statusCode: 400, message: 'Período inválido — tem de ser 1, 3, 6 ou 12 meses' })
  }

  // Fase 7, tarefa 4 — nunca confiar só na UI a esconder o separador
  // MB WAY/Multibanco: o país vem da geolocalização do IP do pedido, não de
  // nenhum campo enviado pelo client (que podia ser adulterado).
  const country = await lookupCountry(getRequestIp(event))
  if (!isPrepaidMethodAvailable(country, method)) {
    throw createError({
      statusCode: 403,
      message: `Método "${method}" não está disponível no teu país${country ? ` (${country})` : ''}`,
    })
  }

  const user = await User.findById(userId).select('name email').lean<{ name: string; email: string }>()
  if (!user) throw createError({ statusCode: 404, message: 'Utilizador não encontrado' })

  const value = TIER_PRICE_EUR[tier] * periodMonths

  const checkout = await createSinglePaymentCheckout({
    method: method === 'mbway' ? 'MBW' : 'MB',
    value,
    key: encodeMerchantKey(userId, tier, method, periodMonths),
    descriptive: `FinanceFlow ${tier} — ${periodMonths} mês(es)`,
    customerName: user.name,
    customerEmail: user.email,
  })

  return { manifest: checkout }
})
