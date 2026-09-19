import { User } from '../models'
import { decodeMerchantKey, getSubscriptionResource, getSingle, getCheckoutStatus, type EasyPayResource } from './easypay'

// O `id` que confirmamos nem sempre é claramente "o id da subscrição" vs. "o
// id genérico do pagamento" (o SDK de Checkout devolve `payment.id`, sem
// garantia de que bate certo com o endpoint específico /subscriptions/{id})
// — por isso tenta primeiro o endpoint mais específico e, se falhar, cai
// para /single/{id} (o mesmo endpoint genérico que o guia de Webhooks da
// EasyPay usa para verificar qualquer notificação). Status aceite de forma
// tolerante: endpoints diferentes da EasyPay devolvem o campo em `status` ou
// em `payment_status` consoante o recurso.
const SUCCESS_STATUSES = ['active', 'ok', 'success', 'authorised', 'paid', 'tokenized']

async function fetchResourceLenient(
  specificFetch: (id: string) => Promise<EasyPayResource>,
  resourceId: string
): Promise<EasyPayResource> {
  try {
    return await specificFetch(resourceId)
  } catch (e) {
    console.warn('[EasyPay] endpoint específico falhou, a tentar /single/{id} como fallback:', e)
    return await getSingle(resourceId)
  }
}

function isSuccessResource(resource: EasyPayResource): boolean {
  const status = resource.status || resource.payment_status
  return typeof status === 'string' && SUCCESS_STATUSES.includes(status)
}

// A confirmação de um pagamento MB WAY chega normalmente por webhook
// assíncrono (evento "capture", depois do cliente confirmar a notificação
// push) — não alcançável a partir da EasyPay real quando o servidor corre em
// `localhost`. Em vez de ficar bloqueado à espera desse webhook, faz um
// curto polling ao próprio recurso do pagamento logo a seguir a criá-lo (a
// EasyPay recomenda exatamente isto — consultar a API pelo `id` — como
// mecanismo de verificação, ver server/utils/easypay.ts).
async function pollPaymentResult(paymentId: string, attempts = 6, delayMs = 2000): Promise<string | null> {
  for (let i = 0; i < attempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, delayMs))
    try {
      const resource = await getSingle(paymentId)
      const status = resource.status || resource.payment_status
      if (typeof status === 'string' && status !== 'pending' && status !== 'waiting') {
        return status
      }
    } catch (e) {
      console.warn('[EasyPay] pollPaymentResult: erro a consultar o pagamento:', e)
    }
  }
  return null
}

// Lógica partilhada de sincronização de subscrição a partir de um recurso
// EasyPay confirmado — usada pelo webhook (server/api/subscription/easypay/
// webhook.post.ts) E pelo endpoint chamado diretamente pelo client logo após
// o onSuccess do SDK de Checkout (server/api/subscription/easypay/
// confirm.post.ts). Em desenvolvimento local a EasyPay não consegue entregar
// o webhook a um `localhost` não exposto publicamente — o confirm.post.ts é o
// caminho que garante que a app funciona sem depender de um túnel público;
// em produção o webhook continua a ser a fonte de verdade mais fiável, e
// ambos os caminhos acabam por chamar exatamente a mesma lógica idempotente
// aqui, nunca confiando em nada do corpo recebido sem verificar primeiro
// junto da API EasyPay (ver server/utils/easypay.ts).

function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

export async function syncSubscriptionCreate(resourceId: string): Promise<void> {
  const resource = await fetchResourceLenient(getSubscriptionResource, resourceId)
  console.log('[EasyPay] syncSubscriptionCreate resource:', resource)
  if (!isSuccessResource(resource)) {
    console.warn('[EasyPay] syncSubscriptionCreate: resource não tem estado de sucesso, a ignorar')
    return
  }

  const key = resource.key || resource.customer?.key
  const decoded = key ? decodeMerchantKey(key) : null
  if (!decoded) {
    console.warn('[EasyPay] syncSubscriptionCreate: sem key decodificável no resource (key:', key, ')')
    return
  }

  const paymentMethod = decoded.paymentMethod === 'dd' ? 'dd' : 'cc'

  await User.findByIdAndUpdate(decoded.userId, {
    subscription: {
      tier: decoded.tier,
      status: 'active',
      provider: 'easypay',
      paymentMethod,
      billingMode: 'auto',
      autoRenew: true,
      currentPeriodEnd: addMonths(new Date(), 1),
      easypaySubscriptionId: resourceId,
    },
  })
}

// MB WAY/Multibanco: pagamento único do valor total de um período fixo
// (`decoded.periodMonths`, codificado na `key` no momento da criação do
// checkout — ver encodeMerchantKey() em server/utils/easypay.ts). Sem
// renovação automática: o utilizador tem de voltar à página de subscrição
// para pagar o período seguinte quando este expirar (ver
// server/api/subscription/check-expirations.post.ts).
async function syncSinglePayment(paymentId: string, decoded: { userId: string; tier: 'pro' | 'premium'; paymentMethod: string; periodMonths: number | null }): Promise<void> {
  const periodMonths = decoded.periodMonths || 1
  const paymentMethod = decoded.paymentMethod === 'multibanco' ? 'multibanco' : 'mbway'
  const billingMode = paymentMethod === 'multibanco' ? 'manual_reference' : 'push_confirm'

  let resource: EasyPayResource | null = null
  try {
    resource = await getSingle(paymentId)
  } catch (e) {
    console.warn('[EasyPay] syncSinglePayment: falha ao consultar o pagamento:', e)
  }
  console.log('[EasyPay] syncSinglePayment resource:', resource)

  const method = typeof resource?.method === 'object' ? resource.method : undefined
  let status = resource?.status || resource?.payment_status || method?.status

  // Multibanco é assíncrono por natureza (o cliente paga no ATM/homebanking
  // dias depois) — 'pending' aqui é o resultado normal e esperado, não uma
  // falha. MB WAY, com o número de teste da sandbox, costuma vir logo
  // resolvido; só recorre a polling se não vier.
  if (paymentMethod === 'mbway' && (!status || status === 'pending' || status === 'waiting')) {
    const polled = await pollPaymentResult(paymentId)
    console.log('[EasyPay] syncSinglePayment (mbway): estado final após polling:', polled)
    if (polled) status = polled
  }

  const isPaid = typeof status === 'string' && SUCCESS_STATUSES.includes(status)

  // currentPeriodEnd calculado já a partir de agora (não de quando o
  // pagamento for confirmado) — evita ter de guardar o periodMonths à parte
  // só para o recalcular mais tarde em checkPendingPayment(). Multibanco
  // pode demorar dias a confirmar; esse tempo já conta para o período.
  await User.findByIdAndUpdate(decoded.userId, {
    subscription: {
      tier: decoded.tier,
      status: paymentMethod === 'multibanco' ? 'pending' : isPaid ? 'active' : 'pending',
      provider: 'easypay',
      paymentMethod,
      billingMode,
      autoRenew: false,
      currentPeriodEnd: addMonths(new Date(), periodMonths),
      easypaySubscriptionId: paymentId,
      multibancoEntity: paymentMethod === 'multibanco' ? method?.entity : undefined,
      multibancoReference: paymentMethod === 'multibanco' ? method?.reference : undefined,
      multibancoExpiresAt:
        paymentMethod === 'multibanco' && method?.expiration_date ? new Date(method.expiration_date) : undefined,
    },
  })
}

// Confirmação manual de um pagamento MB WAY/Multibanco ainda 'pending' —
// chamado a pedido do utilizador (botão "Verificar pagamento", ver
// server/api/subscription/easypay/check-payment.post.ts). Em produção, o
// webhook (evento "capture") já trata isto automaticamente; isto é um atalho
// para quando o utilizador sabe que já pagou e não quer esperar, e o único
// caminho possível para confirmar isto em desenvolvimento local (o webhook
// não alcança um `localhost` não exposto publicamente).
export async function checkPendingPayment(userId: string): Promise<{ status: string }> {
  const user = await User.findById(userId).select('subscription')
  const sub = user?.subscription
  if (!sub || !['push_confirm', 'manual_reference'].includes(sub.billingMode) || sub.status !== 'pending' || !sub.easypaySubscriptionId) {
    return { status: sub?.status || 'none' }
  }

  const resource = await getSingle(sub.easypaySubscriptionId)
  const method = typeof resource.method === 'object' ? resource.method : undefined
  const status = resource.status || resource.payment_status || method?.status

  if (typeof status === 'string' && SUCCESS_STATUSES.includes(status)) {
    sub.status = 'active'
    if (sub.billingMode === 'manual_reference') {
      sub.multibancoEntity = undefined
      sub.multibancoReference = undefined
      sub.multibancoExpiresAt = null
    }
    await user!.save()
    return { status: 'active' }
  }

  return { status: 'pending' }
}

// Caminho usado por server/api/subscription/easypay/confirm.post.ts (chamado
// pelo client logo após o onSuccess do Checkout) — verifica pelo id do
// **checkout** em si (`manifest.id`, devolvido pelo nosso próprio servidor
// ao criar o checkout), não pelo `payment.id` que o SDK devolve no
// onSuccess (esse não bateu certo com /subscriptions nem /single em sandbox,
// ver getCheckoutStatus() em server/utils/easypay.ts). Cobre os três
// billingModes: deteta cc/dd (auto, recorrente) vs. mbway/multibanco
// (pagamento único por período fixo) a partir do paymentMethod que nós
// próprios codificámos na `key`.
export async function syncFromCheckout(checkoutId: string): Promise<void> {
  const checkout = await getCheckoutStatus(checkoutId)
  console.log('[EasyPay] syncFromCheckout resposta:', checkout)

  const key = checkout.payment?.key
  const decoded = key ? decodeMerchantKey(key) : null
  if (!decoded) {
    console.warn('[EasyPay] syncFromCheckout: sem key decodificável (payment.key:', key, ')')
    return
  }

  const paymentId = checkout.payment?.id || checkoutId

  if (decoded.paymentMethod === 'cc' || decoded.paymentMethod === 'dd') {
    // DD (Débito Direto) é pull assíncrono — a confirmação do mandato SEPA
    // pode demorar (até 14 dias em produção); 'pending' aqui é o resultado
    // normal logo após o checkout, não uma falha. CC é síncrono (capture_now)
    // e deve vir sempre com um status de sucesso.
    const paymentStatus = checkout.payment?.status
    const statusOk =
      typeof paymentStatus === 'string' &&
      (SUCCESS_STATUSES.includes(paymentStatus) || (decoded.paymentMethod === 'dd' && paymentStatus === 'pending'))
    if (!statusOk) {
      console.warn('[EasyPay] syncFromCheckout: payment.status não é aceitável:', paymentStatus)
      return
    }
    await User.findByIdAndUpdate(decoded.userId, {
      subscription: {
        tier: decoded.tier,
        status: 'active',
        provider: 'easypay',
        paymentMethod: decoded.paymentMethod,
        billingMode: 'auto',
        autoRenew: true,
        currentPeriodEnd: addMonths(new Date(), 1),
        easypaySubscriptionId: paymentId,
      },
    })
    return
  }

  await syncSinglePayment(paymentId, decoded)
}

// Confirmação (ou falha) de um pagamento MB WAY/Multibanco via webhook
// (evento "capture") — caminho de produção, complementar ao confirm.post.ts.
export async function syncCapture(resourceId: string, status: string): Promise<void> {
  const resource = await getSingle(resourceId)
  const key = resource.key || resource.customer?.key
  const decoded = key ? decodeMerchantKey(key) : null
  if (!decoded) return

  if (status !== 'success') {
    await User.findOneAndUpdate({ _id: decoded.userId }, { 'subscription.status': 'past_due' })
    return
  }

  const paymentMethod = decoded.paymentMethod === 'multibanco' ? 'multibanco' : 'mbway'

  await User.findByIdAndUpdate(decoded.userId, {
    'subscription.tier': decoded.tier,
    'subscription.status': 'active',
    'subscription.paymentMethod': paymentMethod,
    'subscription.currentPeriodEnd': addMonths(new Date(), decoded.periodMonths || 1),
  })
}
