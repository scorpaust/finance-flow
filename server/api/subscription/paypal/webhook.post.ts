import { User, PendingPayPalOrder } from '../../../models'
import { verifyWebhookSignature, getSubscription } from '../../../utils/paypal'

// Webhook único para os dois fluxos da Fase 2:
// - Subscriptions API  (cartão/saldo PayPal, auto-renovação) -> eventos BILLING.SUBSCRIPTION.*
// - Orders API         (MB WAY/Multibanco, pré-pago por período) -> eventos CHECKOUT.ORDER.* / PAYMENT.CAPTURE.*
// Nunca processar sem validar a assinatura primeiro (ver context/00-CODE-SPEC.md, convenções de segurança).

function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

async function handleSubscriptionActivated(resource: any) {
  const userId = resource.custom_id
  const tier: 'pro' | 'premium' | undefined =
    resource.plan_id === useRuntimeConfig().paypalPlanIdPro
      ? 'pro'
      : resource.plan_id === useRuntimeConfig().paypalPlanIdPremium
        ? 'premium'
        : undefined

  if (!userId || !tier) return

  const details = await getSubscription(resource.id)
  const paymentMethod: 'card' | 'paypal_balance' = details?.subscriber?.payment_source?.card ? 'card' : 'paypal_balance'
  const currentPeriodEnd = details?.billing_info?.next_billing_time
    ? new Date(details.billing_info.next_billing_time)
    : null

  await User.findByIdAndUpdate(userId, {
    subscription: {
      tier,
      status: 'active',
      provider: 'paypal',
      paymentMethod,
      periodType: 'recurring',
      autoRenew: true,
      currentPeriodEnd,
      paypalSubscriptionId: resource.id,
    },
  })
}

async function handleSubscriptionRenewed(resource: any) {
  // PAYMENT.SALE.COMPLETED não traz custom_id — a subscrição já associada ao
  // utilizador via paypalSubscriptionId é o que permite encontrar quem renovou.
  const subscriptionId = resource.billing_agreement_id
  if (!subscriptionId) return

  const details = await getSubscription(subscriptionId)
  const currentPeriodEnd = details?.billing_info?.next_billing_time
    ? new Date(details.billing_info.next_billing_time)
    : null

  await User.findOneAndUpdate(
    { 'subscription.paypalSubscriptionId': subscriptionId },
    { 'subscription.status': 'active', 'subscription.autoRenew': true, 'subscription.currentPeriodEnd': currentPeriodEnd }
  )
}

// CANCELLED: o utilizador (ou o handler de cancel.post.ts) pediu para parar
// a auto-renovação — o acesso ao tier pago mantém-se até currentPeriodEnd,
// só a cobrança futura pára. Não mexer em tier/currentPeriodEnd aqui; quem
// faz o downgrade real para 'free' quando o período acabar é o job em
// server/api/subscription/check-expirations.post.ts (o mesmo que trata os
// planos pré-pagos). cancel.post.ts já grava isto otimisticamente — isto é
// o reflexo assíncrono do mesmo evento, por isso é seguro repetir.
async function handleSubscriptionCancelled(resource: any) {
  const subscriptionId = resource.id
  if (!subscriptionId) return

  await User.findOneAndUpdate(
    { 'subscription.paypalSubscriptionId': subscriptionId },
    { 'subscription.status': 'canceled', 'subscription.autoRenew': false }
  )
}

// EXPIRED é diferente de CANCELLED: é um estado terminal da própria PayPal
// (ex. billing agreement encerrado do lado deles) — aí sim faz sentido
// downgrade imediato, não há "período corrente" a preservar.
async function handleSubscriptionExpired(resource: any) {
  const subscriptionId = resource.id
  if (!subscriptionId) return

  await User.findOneAndUpdate(
    { 'subscription.paypalSubscriptionId': subscriptionId },
    {
      subscription: {
        tier: 'free',
        status: 'expired',
        provider: 'none',
        paymentMethod: 'none',
        periodType: 'none',
        autoRenew: false,
        currentPeriodEnd: null,
      },
    }
  )
}

// Só escreve em User.subscription quando o pagamento está mesmo confirmado.
// Enquanto está "pending" (referência Multibanco gerada mas ainda por pagar),
// o plano atual do utilizador não muda — o PendingPayPalOrder já criado em
// create-order.post.ts é a única fonte de verdade sobre a compra em curso
// (exposta ao client via GET /api/subscription como `pendingPurchase`).
// Sem isto, uma referência nunca paga (ou cancelada) deixava o utilizador
// preso a ver "Premium — pendente" para sempre em vez do plano real que tinha.
async function activatePrepaidCompleted(paypalOrderId: string) {
  const pending = await PendingPayPalOrder.findOne({ paypalOrderId })
  if (!pending) return

  await User.findByIdAndUpdate(pending.userId, {
    subscription: {
      tier: pending.tier,
      status: 'active',
      provider: 'paypal',
      paymentMethod: pending.paymentMethod,
      periodType: 'prepaid',
      autoRenew: false,
      currentPeriodEnd: addMonths(new Date(), pending.periodMonths),
      paypalOrderId,
    },
  })

  await PendingPayPalOrder.deleteOne({ paypalOrderId })
}

export default defineEventHandler(async (event) => {
  const webhookEvent = await readBody<any>(event)

  const verified = await verifyWebhookSignature(
    {
      transmissionId: getHeader(event, 'paypal-transmission-id') || '',
      transmissionTime: getHeader(event, 'paypal-transmission-time') || '',
      certUrl: getHeader(event, 'paypal-cert-url') || '',
      authAlgo: getHeader(event, 'paypal-auth-algo') || '',
      transmissionSig: getHeader(event, 'paypal-transmission-sig') || '',
    },
    webhookEvent
  )

  if (!verified) {
    throw createError({ statusCode: 400, message: 'Assinatura do webhook PayPal inválida' })
  }

  const { event_type: eventType, resource } = webhookEvent

  switch (eventType) {
    case 'BILLING.SUBSCRIPTION.ACTIVATED':
      await handleSubscriptionActivated(resource)
      break
    case 'PAYMENT.SALE.COMPLETED':
      await handleSubscriptionRenewed(resource)
      break
    case 'BILLING.SUBSCRIPTION.CANCELLED':
      await handleSubscriptionCancelled(resource)
      break
    case 'BILLING.SUBSCRIPTION.EXPIRED':
      await handleSubscriptionExpired(resource)
      break
    // Não há CHECKOUT.ORDER.APPROVED a tratar aqui: ambos os métodos usam
    // processing_instruction=ORDER_COMPLETE_ON_PAYMENT_APPROVAL, que faz a
    // PayPal capturar automaticamente após a aprovação — nunca chamar capture
    // manualmente (dava erro de "já capturado"). MB WAY confirma de imediato;
    // Multibanco fica "pendente" até ao pagamento no ATM (até 7 dias) — os
    // eventos PAYMENT.CAPTURE.* abaixo cobrem os dois casos.
    case 'PAYMENT.CAPTURE.COMPLETED': {
      const orderId = resource.supplementary_data?.related_ids?.order_id
      if (orderId) await activatePrepaidCompleted(orderId)
      break
    }
    // PAYMENT.CAPTURE.PENDING não precisa de fazer nada: criar a referência
    // Multibanco já é "pending" por natureza, e o PendingPayPalOrder já
    // existe desde a criação da order — nada de novo para gravar aqui.
    case 'PAYMENT.CAPTURE.DENIED': {
      const orderId = resource.supplementary_data?.related_ids?.order_id
      if (orderId) await PendingPayPalOrder.deleteOne({ paypalOrderId: orderId })
      break
    }
    default:
      break
  }

  return { received: true }
})
