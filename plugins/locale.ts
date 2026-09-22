// Fase 7, tarefa 1 — deteção e persistência de idioma feitas à mão (o
// mecanismo embutido do @nuxtjs/i18n, `detectBrowserLanguage`, está
// desligado de propósito — ver nuxt.config.ts para a explicação: o
// redireciono embutido entrava em conflito com a navegação da própria app
// logo a seguir ao login).
//
// Corre em SSR e no client (sem sufixo `.server`/`.client`), sempre antes de
// qualquer página renderizar, para a 1.ª resposta já vir no idioma certo
// (evita mismatch de hidratação). Lógica:
//   1. Cookie `financeflow_locale` já existe e é um dos 6 suportados → usa-o
//      (cobre tanto deteção anterior como escolha manual nas Configurações).
//   2. Sem cookie → deteta a partir do `Accept-Language` (SSR) ou
//      `navigator.languages` (client), por correspondência exata do código
//      completo (ex. "pt-PT") e depois só pela língua (ex. "pt" → "pt-PT");
//      sem correspondência, cai em EN. Grava o resultado no cookie — nunca
//      mais volta a detetar depois disso.
// Fora de um componente Vue (`setup()`), a composable `useI18n()` do
// vue-i18n rebenta com "Must be called at the top of a `setup` function"
// (verificado em teste real nesta sessão) — plugins usam antes
// `nuxtApp.$i18n`, a mesma instância global (Composer), sem essa restrição.
// A lista de códigos suportados está duplicada aqui de propósito (em vez de
// ler `nuxtApp.$i18n.locales`, cujo formato exato não vale a pena arriscar):
// manter sincronizada com `nuxt.config.ts` → `i18n.locales`.
const SUPPORTED_LOCALES = ['pt-PT', 'en', 'fr', 'de', 'it', 'es']

export default defineNuxtPlugin(async (nuxtApp) => {
  const i18n = nuxtApp.$i18n as { locale: { value: string }; setLocale: (code: string) => Promise<void> }
  const supported = SUPPORTED_LOCALES

  const cookie = useCookie<string | null>('financeflow_locale', {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  if (cookie.value && supported.includes(cookie.value)) {
    if (i18n.locale.value !== cookie.value) await i18n.setLocale(cookie.value)
    return
  }

  let candidates: string[] = []
  if (import.meta.server) {
    const headers = useRequestHeaders(['accept-language'])
    candidates = (headers['accept-language'] || '')
      .split(',')
      .map((part) => part.split(';')[0].trim())
      .filter(Boolean)
  } else if (typeof navigator !== 'undefined') {
    candidates = navigator.languages ? [...navigator.languages] : [navigator.language]
  }

  const detected = matchLocale(candidates, supported) || 'en'
  if (i18n.locale.value !== detected) await i18n.setLocale(detected)
  cookie.value = detected
})

function matchLocale(candidates: string[], supported: string[]): string | null {
  const lower = candidates.map((c) => c.toLowerCase())

  for (const c of lower) {
    const exact = supported.find((s) => s.toLowerCase() === c)
    if (exact) return exact
  }

  for (const c of lower) {
    const lang = c.split('-')[0]
    const byLanguage = supported.find((s) => s.toLowerCase().split('-')[0] === lang)
    if (byLanguage) return byLanguage
  }

  return null
}
