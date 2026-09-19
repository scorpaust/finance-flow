import { syncSubscriptionCreate, syncCapture } from '../../../utils/subscriptionSync'

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
  const body = await readBody<{ id?: string; type?: string; status?: string }>(event)

  // Acknowledge imediato — a verificação (GET à API) e o processamento
  // acontecem depois, de forma resiliente a reentrega (idempotente, já que
  // cada handler só escreve o estado final, nunca incrementa).
  if (!body?.id || !body?.type) return { received: true }

  switch (body.type) {
    case 'subscription_create':
      await syncSubscriptionCreate(body.id)
      break
    case 'capture':
    case 'subscription_capture':
      await syncCapture(body.id, body.status || '')
      break
    default:
      break
  }

  return { received: true }
})
