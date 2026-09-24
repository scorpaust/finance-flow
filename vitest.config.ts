import { defineConfig } from 'vitest/config'

// Fase 8, ponto 6 — só testes de lógica pura (sem Nuxt/Nitro, sem rede, sem
// MongoDB): correm em milissegundos e nunca gastam chamadas pagas (Anthropic,
// EasyPay, Twelve Data).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Os de integração têm o seu próprio ficheiro de configuração
    // (vitest.integration.config.ts, `npm run test:integration`) — mais
    // lentos, precisam de MongoDB em memória e de um servidor Nuxt real.
    exclude: ['tests/integration/**', 'node_modules/**'],
  },
})
