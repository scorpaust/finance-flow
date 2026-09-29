// Feedback visível quando o PWA deteta uma versão nova. `registerType:
// 'autoUpdate'` (nuxt.config.ts) já trata da atualização/reload sozinho —
// isto só avisa o utilizador de que está a acontecer, em vez de a app
// trocar de versão em silêncio (o que pode parecer um bug de rendering).
export default defineNuxtPlugin(async (nuxtApp) => {
  if (import.meta.server) return

  const { useRegisterSW } = await import('virtual:pwa-register/vue')
  const toast = useToastStore()
  const t = (nuxtApp.$i18n as { t: (key: string) => string }).t

  useRegisterSW({
    immediate: true,
    onNeedRefresh() {
      toast.info(t('common.updateAvailable'))
    },
    onOfflineReady() {
      toast.success(t('common.offlineReady'))
    },
  })
})
