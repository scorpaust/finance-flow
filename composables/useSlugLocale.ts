import { Capacitor } from '@capacitor/core'
import { LANDING_SLUGS, type LandingSlug } from '~/shared/landing'

// Upgrade 12/13 — páginas públicas com a língua no endereço (/pt, /pt/blog/…):
// mostram-se nessa língua sem mexer na preferência gravada (cookies de
// língua), só a língua em memória desta visita. Na app Android a entrada é o
// login.
export async function useSlugLocale() {
  const route = useRoute()
  const slug = computed(() => route.params.lang as LandingSlug)
  const { locale, setLocale } = useI18n()

  // Antes do `await`: depois dele o Vue já não sabe a que componente ligar
  // estes registos.
  watch(slug, async (s) => {
    if (s && locale.value !== LANDING_SLUGS[s]) await setLocale(LANDING_SLUGS[s])
  })
  onMounted(() => {
    if (Capacitor.isNativePlatform()) navigateTo('/login', { replace: true })
  })

  if (locale.value !== LANDING_SLUGS[slug.value]) await setLocale(LANDING_SLUGS[slug.value])
  return slug
}
