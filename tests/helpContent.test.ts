import { describe, expect, it } from 'vitest'
import { HELP_CONTENT, HELP_TOPICS } from '../utils/helpContent'

// Upgrade 08 — as perguntas frequentes existem nas 6 línguas com a mesma
// estrutura (os ícones "?" da app apontam para os `id`), sem textos vazios.
const LOCALES = ['pt-PT', 'en', 'fr', 'de', 'it', 'es'] as const
const shape = (locale: (typeof LOCALES)[number]) => HELP_CONTENT[locale].map((s) => `${s.id}:${s.items.map((i) => i.id).join(',')}`)

describe('ajuda nas 6 línguas', () => {
  it('mesmas secções e perguntas, pela mesma ordem, em todas as línguas', () => {
    const reference = shape('pt-PT')
    for (const locale of LOCALES) expect(shape(locale), locale).toEqual(reference)
  })

  it('nenhuma pergunta ou resposta vazia, e ids únicos', () => {
    for (const locale of LOCALES) {
      const ids = HELP_CONTENT[locale].flatMap((s) => s.items.map((i) => i.id))
      expect(new Set(ids).size, locale).toBe(ids.length)
      for (const s of HELP_CONTENT[locale]) {
        expect(s.title.trim().length, `${locale} ${s.id}`).toBeGreaterThan(0)
        for (const i of s.items) {
          expect(i.q.trim().length, `${locale} ${i.id}`).toBeGreaterThan(5)
          expect(i.a.trim().length, `${locale} ${i.id}`).toBeGreaterThan(20)
        }
      }
    }
  })

  it('cada ícone "?" da app aponta para uma pergunta que existe', () => {
    const ids = HELP_CONTENT['pt-PT'].flatMap((s) => s.items.map((i) => i.id))
    for (const topic of HELP_TOPICS) expect(ids, topic).toContain(topic)
  })
})
