import { HoloArticle } from '../../models'
import { enforceRateLimit } from '../../utils/rateLimit'
import { logEvent } from '../../utils/logger'
import { HoloDeliverySchema, verifyHoloSignature } from '../../utils/holoWebhook'
import { blogPostPath, findBlogPostBySlug } from '../../../shared/blog'
import { SITE_URL } from '../../../shared/landing'

// Recebe os artigos publicados na Holo e guarda-os como rascunho: nada vai para
// o site sem revisão. O blog vive no código (shared/blog/), com as 6 línguas, e
// os rascunhos costumam prometer funcionalidades que a app não tem. Para os ler:
// scripts/export-holo-drafts.mjs. A resposta só leva `url` se esse slug já estiver no ar.
export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, { name: 'holo-webhook', limit: 60, windowSeconds: 60 })

  const fail = (status: number, error: string) => {
    setResponseStatus(event, status)
    return { error }
  }

  const rawBody = (await readRawBody(event, false)) ?? Buffer.alloc(0)
  const secret = useRuntimeConfig().holoWebhookSecret
  const deliveryHeader = getRequestHeader(event, 'x-holo-delivery')

  if (!verifyHoloSignature(rawBody, getRequestHeader(event, 'x-holo-signature'), secret)) {
    logEvent('warn', 'holo_webhook.auth_failed', {
      secretConfigured: !!secret,
      delivery: deliveryHeader,
      userAgent: getRequestHeader(event, 'user-agent'),
    }, event)
    return fail(401, 'Unauthorized')
  }

  if (!getRequestHeader(event, 'content-type')?.toLowerCase().startsWith('application/json')) {
    return fail(415, 'Expected application/json')
  }

  let body: any
  try {
    body = JSON.parse(rawBody.toString('utf8'))
  } catch {
    return fail(400, 'Invalid JSON')
  }

  // O Send Test usa sempre o mesmo deliveryId e dados de exemplo: nunca é guardado.
  if (body?.test === true) {
    logEvent('info', 'holo_webhook.test_received', { delivery: deliveryHeader, event: getRequestHeader(event, 'x-holo-event') })
    return { received: true, test: true, stored: false }
  }

  const parsed = HoloDeliverySchema.safeParse(body)
  if (!parsed.success) {
    logEvent('warn', 'holo_webhook.invalid_payload', { delivery: deliveryHeader, issues: parsed.error.issues.map((i) => i.path.join('.')) })
    return fail(400, 'Invalid payload')
  }

  const { event: holoEvent, deliveryId, article } = parsed.data
  const { id, ...fields } = article

  try {
    // Por id do artigo: uma nova tentativa da mesma entrega reescreve os mesmos
    // valores, e uma atualização na Holo volta a ficar por rever.
    await HoloArticle.updateOne(
      { _id: id },
      { $set: { ...fields, lastEvent: holoEvent, lastDeliveryId: deliveryId, status: 'pending' } },
      { upsert: true },
    )
  } catch (e: any) {
    // 5xx: a Holo volta a tentar.
    logEvent('error', 'holo_webhook.store_failed', { delivery: deliveryId, articleId: id, message: String(e?.message || e) })
    return fail(500, 'Could not store article')
  }

  logEvent('info', 'holo_webhook.stored', { delivery: deliveryId, articleId: id, event: holoEvent })
  const live = findBlogPostBySlug(article.slug)
  return { received: true, stored: true, status: 'pending_review', deliveryId, ...(live ? { url: `${SITE_URL}${blogPostPath(live)}` } : {}) }
})
