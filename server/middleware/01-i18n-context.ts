// O plugin de servidor do @nuxtjs/i18n (10.6) é assíncrono: limpa uma cache
// antes de registar os hooks `request` (que prepara o contexto de traduções
// do pedido) e `render:before` (que o usa). O Nitro não espera por plugins
// assíncronos, por isso um pedido que chega no arranque a frio de uma função
// da Netlify pode passar pelos hooks `request` antes do registo e chegar ao
// render já com o `render:before` registado: 500 "Nuxt I18n server context
// has not been set up yet" (visto em produção a 2026-10-15 e 2026-10-20).
// Este middleware corre sempre antes do render e prepara o contexto se faltar.
// Import por caminho de ficheiro: o pacote não exporta este módulo.
import { initializeI18nContext } from '../../node_modules/@nuxtjs/i18n/dist/runtime/server/context.js'

export default defineEventHandler(async (event) => {
  if (!event.context.nuxtI18n) await initializeI18nContext(event)
})
