import { createHmac, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'

// Webhook de publicação da Holo (https://docs.tryholo.ai/seo/seo-webhooks).
// Modo HMAC: `X-Holo-Signature: sha256=<hex>` sobre os bytes exatos do corpo,
// por isso a verificação acontece sempre antes de interpretar o JSON.
export function verifyHoloSignature(rawBody: Buffer, header: string | undefined, secret: string): boolean {
  if (!secret || !header) return false
  const match = /^sha256=([a-f0-9]{64})$/i.exec(header.trim())
  if (!match) return false
  const provided = Buffer.from(match[1], 'hex')
  const expected = createHmac('sha256', secret).update(rawBody).digest()
  return timingSafeEqual(provided, expected)
}

// Só o essencial é obrigatório: um 4xx é definitivo para a Holo (não volta a
// tentar), por isso um campo opcional em falta não deve fazer perder um artigo.
export const HoloDeliverySchema = z.object({
  event: z.enum(['article.published', 'article.updated']),
  version: z.literal(1),
  deliveryId: z.string().min(1),
  article: z.object({
    id: z.string().min(1),
    slug: z.string().min(1),
    title: z.string().min(1),
    excerpt: z.string().nullish(),
    contentHtml: z.string().nullish(),
    contentMarkdown: z.string().nullish(),
    metaTitle: z.string().nullish(),
    metaDescription: z.string().nullish(),
    featuredImage: z.string().nullish(),
    images: z.array(z.object({ url: z.string(), alt: z.string().nullish() })).nullish(),
    publishedAt: z.string().nullish(),
  }),
})
