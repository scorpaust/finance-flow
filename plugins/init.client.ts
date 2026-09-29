// Client-only plugin: carrega a sessão antes da 1.ª navegação. Chamado sempre —
// `fetchSession()` é idempotente (partilha o pedido em voo e não repete depois
// de concluído). Nas rotas públicas (/login) o middleware não o chama, por
// isso é isto que tira `auth.loading` de true e esconde o ecrã de carregamento
// de app.vue; antes havia aqui a condição `!auth.loading`, que nunca era
// verdadeira (o store começa com loading a true). Sem `await`: não atrasa o
// arranque da app; o middleware das rotas protegidas espera pelo mesmo pedido.
export default defineNuxtPlugin(() => {
  void useAuthStore().fetchSession()
})
