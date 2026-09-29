import { logEvent } from '../utils/logger'

// Fase 8, ponto 8 — todo o erro 5xx não tratado fica registado em JSON, com o
// caminho e o método mas SEM corpo, cabeçalhos nem cookies (dados financeiros
// e sessão). Erros 4xx são esperados (validação, sessão em falta) e não entram
// aqui para não afogar o log.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error: any, { event }) => {
    const status = error?.statusCode || 500
    if (status < 500) return
    logEvent('error', 'server.unhandled_error', {
      status,
      method: event?.method,
      path: event ? getRequestURL(event).pathname : undefined,
      message: String(error?.message || error).slice(0, 300),
    })
  })
})
