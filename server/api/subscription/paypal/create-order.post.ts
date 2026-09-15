import { requireAuth } from '../../../utils/auth'
import { createMbWayOrder, createMultibancoOrder } from '../../../utils/paypal'
import { TIER_PRICE_EUR } from '../../../../shared/features'
import { User, PendingPayPalOrder } from '../../../models'

const VALID_PERIODS = [1, 3, 6, 12] as const
type Period = (typeof VALID_PERIODS)[number]

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const body = await readBody<{
    tier?: 'pro' | 'premium'
    periodMonths?: Period
    paymentMethod?: 'mbway' | 'multibanco'
    phoneNationalNumber?: string
  }>(event)

  const { tier, paymentMethod, phoneNationalNumber } = body
  const periodMonths = body.periodMonths

  if (tier !== 'pro' && tier !== 'premium') {
    throw createError({ statusCode: 400, message: 'Plano inválido — tem de ser "pro" ou "premium"' })
  }
  if (!periodMonths || !VALID_PERIODS.includes(periodMonths)) {
    throw createError({ statusCode: 400, message: 'Período inválido — tem de ser 1, 3, 6 ou 12 meses' })
  }
  if (paymentMethod !== 'mbway' && paymentMethod !== 'multibanco') {
    throw createError({ statusCode: 400, message: 'Método de pagamento inválido — tem de ser "mbway" ou "multibanco"' })
  }
  if (paymentMethod === 'mbway' && !phoneNationalNumber) {
    throw createError({ statusCode: 400, message: 'Número de telefone obrigatório para MB WAY' })
  }

  const user = await User.findById(userId).select('name').lean<{ name: string }>()
  if (!user) throw createError({ statusCode: 404, message: 'Utilizador não encontrado' })

  const amountValue = (TIER_PRICE_EUR[tier] * periodMonths).toFixed(2)
  const description = `FinanceFlow ${tier} — ${periodMonths} mês(es) (pré-pago, sem auto-renovação)`
  const config = useRuntimeConfig()
  const appUrl = config.public.appUrl

  // MB WAY confirma no telemóvel, sem redirect. Multibanco é redirect-based —
  // a página da PayPal (link payer-action) é que mostra entidade/referência
  // ao buyer (ver notas em server/utils/paypal.ts).
  if (paymentMethod === 'mbway') {
    const order = await createMbWayOrder({
      amountValue,
      customId: userId,
      description,
      payerName: user.name,
      phoneNationalNumber: phoneNationalNumber!,
    })

    await PendingPayPalOrder.create({ paypalOrderId: order.id, userId, tier, periodMonths, paymentMethod })

    return { paypalOrderId: order.id, status: order.status, amountValue, periodMonths }
  }

  const order = await createMultibancoOrder({
    amountValue,
    customId: userId,
    description,
    payerName: user.name,
    returnUrl: `${appUrl}/subscription/return?tier=${tier}&method=multibanco&period=${periodMonths}`,
    cancelUrl: `${appUrl}/subscription?canceled=1`,
  })

  await PendingPayPalOrder.create({ paypalOrderId: order.id, userId, tier, periodMonths, paymentMethod })

  const approvalUrl = order.links.find((l) => l.rel === 'payer-action' || l.rel === 'approve')?.href

  return { approvalUrl, paypalOrderId: order.id, status: order.status, amountValue, periodMonths }
})
