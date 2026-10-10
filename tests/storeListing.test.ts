import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Upgrade 07 — fichas da Play Store nas 6 línguas (assets/store/listing/*.md,
// prontas a colar). A Play Console recusa textos acima dos limites; e cada
// ficha tem de ter o aviso de que não é aconselhamento financeiro e não pode
// ter testemunhos (proibidos pela Google na ficha).
const LOCALES = ['pt-PT', 'en', 'fr', 'de', 'it', 'es']
const LIMITS = { title: 30, short: 80, full: 4000 }

function blocks(locale: string): string[] {
  const md = readFileSync(join(__dirname, '..', 'assets', 'store', 'listing', `${locale}.md`), 'utf8')
    // O Git no Windows pode extrair os ficheiros com CRLF.
    .replace(/\r\n/g, '\n')
  return [...md.matchAll(/```\n([\s\S]*?)\n```/g)].map((m) => m[1])
}

describe('fichas da Play Store', () => {
  for (const locale of LOCALES) {
    it(`${locale}: título, descrição curta e completa dentro dos limites`, () => {
      const [title, short, full] = blocks(locale)
      expect(title.length, `título (${title})`).toBeLessThanOrEqual(LIMITS.title)
      expect(title.startsWith('FinanceFlow')).toBe(true)
      expect(short.length, `descrição curta (${short})`).toBeLessThanOrEqual(LIMITS.short)
      expect(full.length).toBeLessThanOrEqual(LIMITS.full)
      expect(full.length).toBeGreaterThan(1500)
      // Os 3 planos e as funcionalidades atuais aparecem.
      expect(full).toMatch(/Pro/)
      expect(full).toMatch(/Premium/)
      expect(full).toMatch(/50/)
      // Sem testemunhos nem promessas de "n.º 1".
      expect(full).not.toMatch(/["“”«»].{10,}["“”«»]\s*[—–-]\s*\w/)
      expect(full.toLowerCase()).not.toMatch(/#1|n\.º 1|number one|nummer 1/)
    })
  }
})
