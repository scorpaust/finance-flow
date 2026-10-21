import type { AppLocale } from './locale'

// Upgrade 12 — páginas de apresentação por língua (/pt, /en, …): cada língua
// tem endereço próprio para o Google a indexar em separado (com hreflang).
export const LANDING_SLUGS = { pt: 'pt-PT', en: 'en', es: 'es', fr: 'fr', de: 'de', it: 'it' } as const satisfies Record<string, AppLocale>
export type LandingSlug = keyof typeof LANDING_SLUGS

export const SITE_URL = 'https://www.financeflow-webapp.pt'
export const PLAY_PACKAGE = 'com.dinismcosta.financeflow'

export function isLandingSlug(value: unknown): value is LandingSlug {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(LANDING_SLUGS, value)
}

export function landingSlugFor(locale: string): LandingSlug {
  const entry = Object.entries(LANDING_SLUGS).find(([, l]) => l === locale)
  return (entry?.[0] as LandingSlug) || 'en'
}

// Língua de uma página de apresentação a partir do caminho ("/de" → "de"), ou
// null fora delas.
export function landingLocaleFromPath(path: string): AppLocale | null {
  const slug = path.split('?')[0].replace(/\/+$/, '').slice(1)
  return isLandingSlug(slug) ? LANDING_SLUGS[slug] : null
}

export function playStoreUrl(locale: string): string {
  return `https://play.google.com/store/apps/details?id=${PLAY_PACKAGE}&hl=${locale}`
}

// Código hreflang/og:locale de cada língua.
export const HREFLANG: Record<LandingSlug, string> = { pt: 'pt-PT', en: 'en', es: 'es', fr: 'fr', de: 'de', it: 'it' }
export const OG_LOCALE: Record<LandingSlug, string> = { pt: 'pt_PT', en: 'en_US', es: 'es_ES', fr: 'fr_FR', de: 'de_DE', it: 'it_IT' }

// Perguntas da ajuda mostradas na página (e no FAQ dos dados estruturados).
export const LANDING_FAQ_IDS = ['plans', 'payment-methods', 'cancel', 'ai-data', 'two-factor', 'export-delete'] as const
