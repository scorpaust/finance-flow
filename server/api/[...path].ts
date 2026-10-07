// Qualquer /api/... que não exista responde 404 em JSON. Sem isto, o pedido
// caía no renderizador das páginas, que rebentava com "Nuxt I18n server
// context has not been set up yet" (500 no Sentry, visto a 2026-10-07 ao
// chamar /api/billing/prices antes de essa rota estar em produção).
export default defineEventHandler(() => {
  throw createError({ statusCode: 404, message: 'Not found' })
})
