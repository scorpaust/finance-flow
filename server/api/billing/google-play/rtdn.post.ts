import { handleRtdn, verifyPubSubToken, type RtdnNotification } from '../../../utils/googlePlay'
import { logEvent } from '../../../utils/logger'

// Upgrade 01 — notificações em tempo real da Google Play (RTDN), entregues
// por uma subscrição push do Google Cloud Pub/Sub com autenticação OIDC.
// Corpo: { message: { data: base64(JSON da notificação), messageId }, subscription }.
// Resposta 2xx = mensagem entregue; qualquer outra coisa faz o Pub/Sub repetir.
export default defineEventHandler(async (event) => {
  if (!(await verifyPubSubToken(getHeader(event, 'authorization')))) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody<{ message?: { data?: string; messageId?: string } }>(event).catch(() => null)
  let notification: RtdnNotification
  try {
    notification = JSON.parse(Buffer.from(body?.message?.data || '', 'base64').toString('utf8'))
  } catch {
    // Repetir não muda nada numa mensagem mal formada: aceita e regista.
    logEvent('error', 'google_play.rtdn_malformed', { messageId: body?.message?.messageId })
    return { handled: 'malformed' }
  }

  // Um erro aqui (ex. a Google em baixo ao ler a compra) devolve 5xx: o
  // Pub/Sub volta a entregar mais tarde.
  const handled = await handleRtdn(notification)
  return { handled }
})
