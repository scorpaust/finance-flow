import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { HoloDeliverySchema, verifyHoloSignature } from '../server/utils/holoWebhook'

const SECRET = 'segredo-de-teste'
const sign = (body: Buffer, secret = SECRET) => `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`

describe('verifyHoloSignature', () => {
  const body = Buffer.from('{"event":"article.published","título":"é"}')

  it('aceita a assinatura certa, sobre os bytes exatos', () => {
    expect(verifyHoloSignature(body, sign(body), SECRET)).toBe(true)
  })

  it('recusa um corpo alterado, mesmo que só mude o espaçamento', () => {
    const other = Buffer.from('{"event": "article.published","título":"é"}')
    expect(verifyHoloSignature(other, sign(body), SECRET)).toBe(false)
  })

  it('recusa outro segredo', () => {
    expect(verifyHoloSignature(body, sign(body, 'outro'), SECRET)).toBe(false)
  })

  it('recusa assinaturas em falta ou mal formadas, sem lançar erro', () => {
    for (const header of [undefined, '', 'sha256=', 'sha256=abc', sign(body).slice(7), `sha1=${'a'.repeat(64)}`, `sha256=${'z'.repeat(64)}`]) {
      expect(verifyHoloSignature(body, header, SECRET)).toBe(false)
    }
  })

  it('sem segredo configurado, recusa tudo', () => {
    expect(verifyHoloSignature(body, sign(body, ''), '')).toBe(false)
  })
})

describe('HoloDeliverySchema', () => {
  const delivery = {
    event: 'article.published',
    version: 1,
    deliveryId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
    article: { id: '22222222-2222-4222-8222-222222222222', slug: 'artigo', title: 'Artigo' },
  }

  it('aceita uma entrega só com os campos essenciais', () => {
    expect(HoloDeliverySchema.safeParse(delivery).success).toBe(true)
  })

  it('aceita campos opcionais a null', () => {
    const article = { ...delivery.article, featuredImage: null, excerpt: null, images: null }
    expect(HoloDeliverySchema.safeParse({ ...delivery, article }).success).toBe(true)
  })

  it('recusa outra versão, outro evento ou um artigo sem slug', () => {
    expect(HoloDeliverySchema.safeParse({ ...delivery, version: 2 }).success).toBe(false)
    expect(HoloDeliverySchema.safeParse({ ...delivery, event: 'article.deleted' }).success).toBe(false)
    expect(HoloDeliverySchema.safeParse({ ...delivery, article: { id: 'x', title: 'y' } }).success).toBe(false)
  })
})
