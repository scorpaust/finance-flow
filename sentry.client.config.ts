import * as Sentry from '@sentry/nuxt'

// Fase 8, ponto 8. Só é carregado com o módulo ativo (SENTRY_DSN definido).
// Sem Session Replay de propósito: gravaria ecrãs com valores financeiros.
Sentry.init({
  dsn: useRuntimeConfig().public.sentryDsn as string,
  environment: process.env.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    if (event.request) {
      delete event.request.data
      delete event.request.cookies
    }
    return event
  },
})
