// Upgrade 01 — o plano pode mudar fora da app: uma subscrição da Google Play
// cancelada ou expirada (nos testes de licença, um mês dura minutos), uma
// referência Multibanco paga, outro dispositivo. O store da subscrição só era
// lido uma vez por sessão, e a app mostrava funcionalidades que o servidor já
// recusava (ex. 403 em /api/groups depois de o Premium expirar). Duas regras:
//   1. ao voltar ao primeiro plano (app ou separador), lê o plano de novo —
//      no máximo uma vez por minuto;
//   2. qualquer 403 "feature_locked" do servidor (requireFeature) quer dizer
//      que o plano aqui está desatualizado: lê-o de novo, e a página mostra o
//      ecrã de plano bloqueado em vez de dados.
export default defineNuxtPlugin(() => {
  const store = useSubscriptionStore()
  const auth = useAuthStore()
  let last = 0

  function refresh(force = false) {
    if (!auth.user) return
    if (!force && Date.now() - last < 60_000) return
    last = Date.now()
    void store.refresh()
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refresh()
  })

  globalThis.$fetch = $fetch.create({
    onResponseError({ response }) {
      if (response.status === 403 && (response._data as any)?.data?.error === 'feature_locked') refresh(true)
    },
  }) as typeof $fetch
})
