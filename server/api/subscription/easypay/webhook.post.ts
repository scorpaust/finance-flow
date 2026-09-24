import { syncSubscriptionCreate, syncCapture } from '../../../utils/subscriptionSync'
import { enforceRateLimit } from '../../../utils/rateLimit'
import { logEvent } from '../../../utils/logger'

// Webhook para a Fase 2 (EasyPay). Nunca processar sem confirmar a
// autenticidade primeiro: a EasyPay não assina os webhooks, por isso a
// verificação é sempre um GET de volta à API pelo `id` do recurso antes de
// confiar em qualquer campo do corpo recebido (ver server/utils/easypay.ts e
// o guia de Webhooks consultado via Context7). A lógica de sincronização em
// si vive em server/utils/subscriptionSync.ts, partilhada com
// server/api/subscription/easypay/confirm.post.ts (chamado pelo client logo
// após o onSuccess do Checkout — necessário porque em desenvolvimento local
// a EasyPay não consegue entregar este webhook a um `localhost` não exposto
// publicamente).
export default defineEventHandler(async (event) => {
  // Fase 8, ponto 1 — generoso o suficiente para tráfego real da EasyPay,
  // mas trava uma tentativa de inundar o endpoint (cada evento aceite ainda
  // dispara um GET de verificação de volta à API, não é grátis).
  enforceRateLimit(event, { name: 'easypay-webhook', limit: 120, windowSeconds: 60 })
  const body = await readBody<{ id?: string; type?: string; status?: string }>(event)

  // Acknowledge imediato — a verificação (GET à API) e o processamento
  // acontecem depois, de forma resiliente a reentrega (idempotente, já que
  // cada handler só escreve o estado final, nunca incrementa).
  if (!body?.id || !body?.type) return { received: true }

  try {
    switch (body.type) {
      case 'subscription_create':
        await syncSubscriptionCreate(body.id)
        break
      case 'capture':
      case 'subscription_capture':
        await syncCapture(body.id)
        break
      default:
        break
    }
  } catch (e: any) {
    // Falha de processamento (ex. a API EasyPay não respondeu): fica no log
    // estruturado. Responde 500 para a EasyPay voltar a tentar entregar — os
    // handlers são idempotentes, por isso reentregas são seguras.
    logEvent('error', 'webhook.easypay_failed', { type: body.type, resourceId: body.id, message: String(e?.message || e).slice(0, 200) }, event)
    throw createError({ statusCode: 500, message: 'Webhook processing failed' })
  }

  return { received: true }
})
