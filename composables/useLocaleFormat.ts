import { pt, enUS, fr, de, it, es } from 'date-fns/locale'
import type { Locale } from 'date-fns'

// Fase 7 — mapeia o locale ativo do @nuxtjs/i18n para o objeto de locale do
// date-fns (formatação de datas) e para a string BCP-47 usada pelo `Intl`
// (moeda/percentagem/números). Um único sítio para os dois, partilhado entre
// useFormatters e qualquer componente que formate datas diretamente
// (ex. layouts/default.vue).
const DATE_FNS_LOCALES: Record<string, Locale> = { 'pt-PT': pt, en: enUS, fr, de, it, es }
const INTL_LOCALES: Record<string, string> = { 'pt-PT': 'pt-PT', en: 'en-GB', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', es: 'es-ES' }

export function useLocaleFormat() {
  const { locale } = useI18n()

  const dateFnsLocale = computed(() => DATE_FNS_LOCALES[locale.value] || enUS)
  const intlLocale    = computed(() => INTL_LOCALES[locale.value] || 'en-GB')

  return { dateFnsLocale, intlLocale }
}
