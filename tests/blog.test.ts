import { describe, expect, it, vi } from 'vitest'

// O sitemap é uma rota do Nitro: os auxiliares globais não existem nos testes.
vi.hoisted(() => {
  Object.assign(globalThis, { defineEventHandler: (h: unknown) => h, setHeader: () => {} })
})
import { BLOG_POSTS, blogPostsFor, findBlogPost, isBlogPath, readingMinutes, translationsOf } from '../shared/blog'
import { isLandingSlug } from '../shared/landing'
import { buildSitemap } from '../server/routes/sitemap.xml'

// Upgrade 13 — artigos do blog: endereços válidos e únicos, metadados para as
// pesquisas, conteúdo não vazio e presença no sitemap.
describe('blog', () => {
  it('cada artigo tem língua válida, endereço único e metadados completos', () => {
    const keys = BLOG_POSTS.map((p) => `${p.lang}/${p.slug}`)
    expect(new Set(keys).size).toBe(keys.length)
    for (const p of BLOG_POSTS) {
      expect(isLandingSlug(p.lang), p.slug).toBe(true)
      expect(p.slug, p.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      expect(p.published, p.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(p.title.length, p.slug).toBeLessThanOrEqual(70)
      expect(p.description.length, p.slug).toBeGreaterThan(50)
      expect(p.description.length, p.slug).toBeLessThanOrEqual(170)
      expect(p.blocks.some((b) => b.type === 'h2'), p.slug).toBe(true)
      for (const b of p.blocks) {
        const texts = 'items' in b ? b.items : [b.text]
        expect(texts.length, p.slug).toBeGreaterThan(0)
        for (const s of texts) expect(s.trim().length, p.slug).toBeGreaterThan(0)
      }
      expect(readingMinutes(p)).toBeGreaterThanOrEqual(1)
    }
  })

  it('cada artigo existe nas 6 línguas, com um endereço por língua', () => {
    const keys = [...new Set(BLOG_POSTS.map((p) => p.key))]
    for (const key of keys) {
      const langs = BLOG_POSTS.filter((p) => p.key === key).map((p) => p.lang).sort()
      expect(langs, key).toEqual(['de', 'en', 'es', 'fr', 'it', 'pt'])
    }
    const first = BLOG_POSTS[0]
    expect(translationsOf(first).map((p) => p.lang)).toEqual(['pt', 'en', 'es', 'fr', 'de', 'it'])
  })

  it('encontra os artigos por língua e reconhece os caminhos do blog', () => {
    expect(blogPostsFor('pt').length).toBeGreaterThan(0)
    expect(findBlogPost('pt', 'como-poupar-dinheiro')?.title).toContain('poupar')
    expect(findBlogPost('en', 'como-poupar-dinheiro')).toBeUndefined()
    expect(isBlogPath('/pt/blog')).toBe(true)
    expect(isBlogPath('/pt/blog/como-poupar-dinheiro')).toBe(true)
    expect(isBlogPath('/pt/blog/como-poupar-dinheiro?utm_source=linkedin')).toBe(true)
    expect(isBlogPath('/transactions')).toBe(false)
    expect(isBlogPath('/pt/blog/a/b')).toBe(false)
  })

  it('o sitemap inclui a lista e cada artigo', () => {
    const xml = buildSitemap('2026-10-24')
    expect(xml).toContain('<loc>https://www.financeflow-webapp.pt/pt/blog</loc>')
    for (const p of BLOG_POSTS) expect(xml).toContain(`<loc>https://www.financeflow-webapp.pt/${p.lang}/blog/${p.slug}</loc>`)
    expect(xml).toContain('hreflang="en" href="https://www.financeflow-webapp.pt/en/blog/how-to-save-money"')
  })
})
