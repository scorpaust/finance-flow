// Fase 7, tarefa 1 — deteção e persistência de idioma feitas à mão (o
// mecanismo embutido do @nuxtjs/i18n, `detectBrowserLanguage`, está
// desligado de propósito — ver nuxt.config.ts para a explicação: o
// redireciono embutido entrava em conflito com a navegação da própria app
// logo a seguir ao login).
//
// Corre em SSR e no client (sem sufixo `.server`/`.client`), sempre antes de
// qualquer página renderizar, para a 1.ª resposta já vir no idioma certo
// (evita mismatch de hidratação). Lógica (Upgrade 06, shared/locale.ts):
//   1. Língua escolhida à mão (cookie `financeflow_locale` com origem `user`,
//      ou um cookie antigo sem origem) → usa-a, sempre.
//   2. Caso contrário → deteta a partir do `Accept-Language` (SSR) ou
//      `navigator.languages` (client), primeiro pelo código completo (ex.
//      "pt-PT") e depois só pela língua (ex. "pt" → "pt-PT"); sem
//      correspondência, inglês. Grava o resultado com origem `auto` e volta a
//      detetar na visita seguinte (acompanha a língua do telemóvel).
// Fora de um componente Vue (`setup()`), a composable `useI18n()` do
// vue-i18n rebenta com "Must be called at the top of a `setup` function"
// (verificado em teste real nesta sessão) — plugins usam antes
// `nuxtApp.$i18n`, a mesma instância global (Composer), sem essa restrição.
// A lista de códigos suportados está em shared/locale.ts (em vez de ler
// `nuxtApp.$i18n.locales`, cujo formato exato não vale a pena arriscar):
// manter sincronizada com `nuxt.config.ts` → `i18n.locales`.

// Upgrade 06 — a lógica passou para shared/locale.ts (testada): a deteção
// volta a correr enquanto a língua for "automática" (cookie
// `financeflow_locale_source=auto`), para acompanhar a língua do telemóvel;
// uma escolha manual (ou um cookie antigo, sem origem) fica sempre.
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_SOURCE_COOKIE,
  parseAcceptLanguage,
  resolveLocale,
} from '~/shared/locale'

export default defineNuxtPlugin(async (nuxtApp) => {
  const i18n = nuxtApp.$i18n as { locale: { value: string }; setLocale: (code: string) => Promise<void> }
  const cookieOpts = { maxAge: LOCALE_COOKIE_MAX_AGE, sameSite: 'lax' as const }
  const cookie = useCookie<string | null>(LOCALE_COOKIE, cookieOpts)
  const source = useCookie<string | null>(LOCALE_SOURCE_COOKIE, cookieOpts)

  let candidates: string[] = []
  if (import.meta.server) {
    candidates = parseAcceptLanguage(useRequestHeaders(['accept-language'])['accept-language'])
  } else if (typeof navigator !== 'undefined') {
    candidates = navigator.languages ? [...navigator.languages] : [navigator.language]
  }

  const decision = resolveLocale({ cookie: cookie.value, source: source.value, candidates })
  if (i18n.locale.value !== decision.locale) await i18n.setLocale(decision.locale)
  if (cookie.value !== decision.locale) cookie.value = decision.locale
  // Só se grava a origem quando é uma deteção nova; um cookie antigo sem
  // origem fica como está (conta como escolha do utilizador).
  if (decision.source === 'auto' && source.value !== 'auto') source.value = 'auto'
})
