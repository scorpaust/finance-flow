import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

// Fase 8, ponto 6 — só testes de lógica pura (sem Nuxt/Nitro, sem rede, sem
// MongoDB): correm em milissegundos e nunca gastam chamadas pagas (Anthropic,
// EasyPay, Twelve Data).
export default defineConfig({
  resolve: {
    // O código de produção usa o alias `~` do Nuxt (raiz do projeto) — fora
    // do Nuxt, o Vite precisa disto explícito para resolver imports como
    // '~/shared/features' nos ficheiros importados pelos testes.
    alias: { '~': fileURLToPath(new URL('.', import.meta.url)) },
  },
  test: {
    environment: 'node',
    setupFiles: ['tests/setup/nuxtStubs.ts'],
    include: ['tests/**/*.test.ts'],
    // Os de integração têm o seu próprio ficheiro de configuração
    // (vitest.integration.config.ts, `npm run test:integration`) — mais
    // lentos, precisam de MongoDB em memória e de um servidor Nuxt real.
    exclude: ['tests/integration/**', 'node_modules/**'],
  },
})
