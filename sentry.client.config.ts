import * as Sentry from '@sentry/nuxt'

// Fase 8, ponto 8. Só é carregado com o módulo ativo (SENTRY_DSN definido).
// Sem Session Replay de propósito: gravaria ecrãs com valores financeiros.
Sentry.init({
  dsn: useRuntimeConfig().public.sentryDsn as string,
  environment: process.env.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate: 0.1,
  // 404 de rotas inexistentes (URLs escritos à mão, bots): já mostram o error.vue, não são bugs.
  // 401 da API: sessão expirada com a página aberta, já leva ao login (stores/auth.ts).
  ignoreErrors: [/^Page Not Found: /, /^(FetchError: )?\[[A-Z]+\] "\/api\/[^"]*": 401/],
  beforeSend(event) {
    if (event.request) {
      delete event.request.data
      delete event.request.cookies
    }
    return event
  },
})
