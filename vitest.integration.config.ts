import { defineConfig } from 'vitest/config'

// Fase 8, ponto 6 — testes de integração: um servidor Nuxt/Nitro real (via
// @nuxt/test-utils), MongoDB em memória (isolado do Atlas) e um servidor
// simulado para Anthropic/EasyPay/Twelve Data (nunca chamadas reais — ver
// tests/integration/{globalSetup,stubProviders,testHelpers}.ts). Muito mais
// lentos que os testes unitários (tests/*.test.ts, vitest.config.ts) — por
// isso ficam num comando à parte (`npm run test:integration`), não em `npm test`.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    globalSetup: ['tests/integration/globalSetup.ts'],
    // Um único servidor Nuxt real por ficheiro de teste demora dezenas de
    // segundos a arrancar (build) — visto nesta sessão com o dev server
    // desta mesma máquina. Timeouts generosos para não falhar por lentidão
    // do arranque, não por um teste realmente preso.
    testTimeout: 90_000,
    hookTimeout: 600_000,
    teardownTimeout: 60_000,
    // Um teste de cada vez: partilham o mesmo MongoDB em memória e o mesmo
    // servidor simulado (stub) — correr em paralelo misturaria o estado de
    // um teste com o de outro (e o stub não isolaria pedidos concorrentes).
    fileParallelism: false,
  },
})
