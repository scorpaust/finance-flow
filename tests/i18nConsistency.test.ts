import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

// Upgrade 06 — duas regras para a app nunca mostrar texto noutra língua:
//  1. as 6 línguas têm exatamente as mesmas chaves;
//  2. nenhum texto visível escrito diretamente no código do cliente (com
//     acentos — português, francês, espanhol…): tudo passa pelo i18n.
// (Comentários, emojis e os ficheiros de tradução/legais não contam.)

const ROOT = join(__dirname, '..')
const LOCALES = ['pt-PT', 'en', 'fr', 'de', 'it', 'es']

function flatKeys(obj: Record<string, any>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flatKeys(v, `${prefix}${k}.`) : [`${prefix}${k}`]
  )
}

describe('as 6 línguas têm as mesmas chaves', () => {
  const reference = new Set(flatKeys(JSON.parse(readFileSync(join(ROOT, 'i18n/locales/en.json'), 'utf8'))))
  for (const locale of LOCALES) {
    it(locale, () => {
      const keys = new Set(flatKeys(JSON.parse(readFileSync(join(ROOT, `i18n/locales/${locale}.json`), 'utf8'))))
      expect([...reference].filter((k) => !keys.has(k)), `em falta em ${locale}`).toEqual([])
      expect([...keys].filter((k) => !reference.has(k)), `a mais em ${locale}`).toEqual([])
    })
  }
})

const CLIENT_DIRS = ['components', 'pages', 'composables', 'stores', 'layouts', 'plugins', 'middleware']

function sourceFiles(dir: string): string[] {
  const abs = join(ROOT, dir)
  let entries: string[] = []
  try {
    entries = readdirSync(abs)
  } catch {
    return []
  }
  return entries.flatMap((name) => {
    const p = join(abs, name)
    if (statSync(p).isDirectory()) return sourceFiles(relative(ROOT, p))
    return /\.(vue|ts)$/.test(name) ? [p] : []
  })
}

function stripComments(src: string): string {
  return src
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // `//` de comentário (não o de `https://`)
    .replace(/(^|[^:'"`\w])\/\/.*$/gm, '$1')
}

// Letras acentuadas usadas nas línguas da app (o inglês não as tem).
const ACCENTED = /[ãõçáéíóúâêôàèìòùäöüßñœ]/i

describe('nenhum texto visível escrito diretamente no código do cliente', () => {
  it('sem textos acentuados fora do i18n', () => {
    const offenders: string[] = []
    for (const file of CLIENT_DIRS.flatMap(sourceFiles)) {
      const code = stripComments(readFileSync(file, 'utf8'))
      code.split('\n').forEach((line, i) => {
        // Strings JS/TS e texto entre etiquetas no template.
        const literals = [...line.matchAll(/'([^'\n]*)'|"([^"\n]*)"|`([^`\n]*)`|>([^<>{}\n]+)</g)].map((m) => m[1] ?? m[2] ?? m[3] ?? m[4] ?? '')
        if (literals.some((s) => ACCENTED.test(s))) offenders.push(`${relative(ROOT, file)}:${i + 1}: ${line.trim().slice(0, 100)}`)
      })
    }
    expect(offenders).toEqual([])
  })
})
