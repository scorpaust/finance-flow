import { describe, expect, it } from 'vitest'
import { LEGAL_CONTENT, LEGAL_UPDATED } from '../utils/legalContent'

// Os textos legais existem nas 6 línguas da app. Mudar um parágrafo numa
// língua sem o mudar nas outras deixa-as com estruturas diferentes — este
// teste apanha isso (mesmas secções e o mesmo número de parágrafos).
const LOCALES = ['pt-PT', 'en', 'fr', 'de', 'it', 'es'] as const

describe('textos legais nas 6 línguas', () => {
  for (const doc of ['privacy', 'terms'] as const) {
    it(`${doc}: mesmas secções e parágrafos em todas as línguas, com a data atual`, () => {
      const en = LEGAL_CONTENT[doc].en
      for (const locale of LOCALES) {
        const d = LEGAL_CONTENT[doc][locale]
        expect(d.title.length, `${doc} ${locale}`).toBeGreaterThan(0)
        expect(d.sections.length, `${doc} ${locale}`).toBe(en.sections.length)
        d.sections.forEach((s, i) => expect(s.p.length, `${doc} ${locale} §${i + 1}`).toBe(en.sections[i].p.length))
        expect(JSON.stringify(d), `${doc} ${locale}`).toContain(LEGAL_UPDATED)
      }
    })
  }

  it('o orçamento sugerido está na Política de Privacidade e nos Termos (ponto 5) em todas as línguas', () => {
    const words: Record<(typeof LOCALES)[number], string> = {
      'pt-PT': 'Orçamento sugerido',
      en: 'Suggested budget',
      fr: 'Budget suggéré',
      de: 'Budgetvorschlag',
      it: 'Budget suggerito',
      es: 'Presupuesto sugerido',
    }
    for (const locale of LOCALES) {
      for (const doc of ['privacy', 'terms'] as const) {
        expect(LEGAL_CONTENT[doc][locale].sections[4].p.join(' ').toLowerCase(), `${doc} ${locale}`).toContain(words[locale].toLowerCase())
      }
    }
  })
})
