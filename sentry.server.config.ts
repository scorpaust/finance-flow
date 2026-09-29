import * as Sentry from '@sentry/nuxt'

// Fase 8, ponto 8. Só é carregado quando o módulo do Sentry está ativo
// (SENTRY_DSN definido — ver nuxt.config.ts); sem DSN esta app não envia nada.
// App financeira: nenhum corpo de pedido, cookie ou cabeçalho sai do servidor.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    if (event.request) {
      delete event.request.data
      delete event.request.cookies
      delete event.request.headers
    }
    return event
  },
})
