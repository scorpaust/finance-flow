// Feedback visível quando o PWA deteta uma versão nova. `registerType:
// 'autoUpdate'` (nuxt.config.ts) já trata da atualização/reload sozinho —
// isto só avisa o utilizador de que está a acontecer, em vez de a app
// trocar de versão em silêncio (o que pode parecer um bug de rendering).
export default defineNuxtPlugin(async () => {
  if (import.meta.server) return

  const { useRegisterSW } = await import('virtual:pwa-register/vue')
  const toast = useToastStore()

  useRegisterSW({
    immediate: true,
    onNeedRefresh() {
      toast.info('Nova versão disponível — a atualizar...')
    },
    onOfflineReady() {
      toast.success('App pronta para uso offline 📴')
    },
  })
})
