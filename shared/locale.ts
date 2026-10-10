// Upgrade 06 — escolha da língua da app (funções puras, testadas em
// tests/locale.test.ts). Usado por plugins/locale.ts e composables/useAppLocale.ts.
//
// Dois cookies:
//   financeflow_locale         a língua (também lido pelo servidor: emails,
//                              mensagens de erro, categorias do registo)
//   financeflow_locale_source  'auto' (detetada pelo dispositivo) ou 'user'
//                              (escolhida à mão)
// Com 'auto', a deteção volta a correr a cada visita — a app acompanha a
// língua do telemóvel. Com 'user', a escolha fica sempre. Os cookies de antes
// deste upgrade não têm origem: contam como 'user', porque a escolha nas
// Definições gravava o mesmo cookie e não há forma de os distinguir — assim
// ninguém vê a língua mudar sozinha depois do deploy.

// Manter igual a nuxt.config.ts → i18n.locales.
export const SUPPORTED_LOCALES = ['pt-PT', 'en', 'fr', 'de', 'it', 'es'] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]
export type LocaleSource = 'auto' | 'user'

export const LOCALE_COOKIE = 'financeflow_locale'
export const LOCALE_SOURCE_COOKIE = 'financeflow_locale_source'
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function isSupportedLocale(code: unknown): code is AppLocale {
  return typeof code === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(code)
}

// Pela ordem de preferência do dispositivo: para cada língua da lista, o
// código completo ("pt-PT") ou só a língua ("pt-BR" → "pt-PT"). Antes (Fase 7)
// procurava primeiro um código exato em toda a lista, e "de-AT, en" dava
// inglês em vez de alemão.
export function matchLocale(candidates: string[]): AppLocale | null {
  for (const raw of candidates) {
    const c = raw.trim().toLowerCase()
    if (!c) continue
    const exact = SUPPORTED_LOCALES.find((s) => s.toLowerCase() === c)
    if (exact) return exact
    const lang = c.split('-')[0]
    const byLanguage = SUPPORTED_LOCALES.find((s) => s.toLowerCase().split('-')[0] === lang)
    if (byLanguage) return byLanguage
  }
  return null
}

// Lista de línguas de um cabeçalho Accept-Language, pela ordem de preferência
// (o peso `q` é ignorado: os browsers já enviam por ordem).
export function parseAcceptLanguage(header: string | undefined | null): string[] {
  return (header || '')
    .split(',')
    .map((part) => part.split(';')[0].trim())
    .filter(Boolean)
}

export interface LocaleDecision {
  locale: AppLocale
  source: LocaleSource
}

// Que língua usar nesta visita.
export function resolveLocale(opts: {
  cookie: string | null | undefined
  source: string | null | undefined
  candidates: string[]
}): LocaleDecision {
  const cookieOk = isSupportedLocale(opts.cookie)
  // Escolha manual — ou cookie antigo sem origem (ver acima).
  if (cookieOk && opts.source !== 'auto') return { locale: opts.cookie as AppLocale, source: 'user' }
  return { locale: matchLocale(opts.candidates) || 'en', source: 'auto' }
}
