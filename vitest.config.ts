import { defineConfig } from 'vitest/config'

// Fase 8, ponto 6 — só testes de lógica pura (sem Nuxt/Nitro, sem rede, sem
// MongoDB): correm em milissegundos e nunca gastam chamadas pagas (Anthropic,
// EasyPay, Twelve Data).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
