import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, LOCALE_SOURCE_COOKIE, isSupportedLocale, type AppLocale } from '~/shared/locale'

// Upgrade 06 — mudar a língua da app à mão (seletor do login e das páginas
// públicas, e Definições). Grava a língua e a origem `user`: a partir daí a
// deteção automática deixa de a substituir (ver shared/locale.ts).
export function useAppLocale() {
  const { locale, locales, setLocale } = useI18n()
  const cookieOpts = { maxAge: LOCALE_COOKIE_MAX_AGE, sameSite: 'lax' as const }
  const cookie = useCookie<string | null>(LOCALE_COOKIE, cookieOpts)
  const source = useCookie<string | null>(LOCALE_SOURCE_COOKIE, cookieOpts)

  const available = computed(() => locales.value as { code: AppLocale; name: string }[])

  async function chooseLocale(code: string): Promise<boolean> {
    if (!isSupportedLocale(code)) return false
    const changed = code !== locale.value
    await setLocale(code)
    cookie.value = code
    source.value = 'user'
    return changed
  }

  return { locale, available, chooseLocale }
}
