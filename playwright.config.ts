import { defineConfig, devices } from '@playwright/test'

// Fase 8, ponto 6 — E2E contra um servidor Nuxt real (modo dev, mesma razão
// dos testes de integração: um build de produção completo demora vários
// minutos nesta máquina) com MongoDB em memória, isolado do Atlas — nunca
// toca em dados reais. Ver scripts/e2e-server.mjs para o arranque.
const PORT = 3400
const CONTROL_PORT = 3401
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  // Visita cada rota uma vez com uma conta descartável antes dos specs reais
  // correrem — evita que a 1.ª descoberta de uma dependência client-side
  // pelo Vite (e o reload automático que isso dispara em modo dev) aconteça
  // a meio de um teste já em curso. Ver e2e/global-setup.ts.
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: false,
  // Cada teste regista as suas próprias contas — não há estado partilhado
  // entre specs que exija correr em série por essa razão, mas um único
  // servidor Nuxt em modo dev não aguenta bem pedidos verdadeiramente
  // concorrentes de vários workers (visto com os testes de integração).
  workers: 1,
  retries: 0,
  reporter: [['list']],
  // Generoso: em modo `dev` cada rota nova visitada (dashboard, previsões,
  // definições...) compila só quando é pedida pela 1.ª vez — visto nesta
  // sessão que isso pode custar dezenas de segundos por rota numa máquina
  // carregada, e um teste passa por várias rotas diferentes.
  timeout: 180_000,
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: `node scripts/e2e-server.mjs`,
    url: BASE_URL,
    reuseExistingServer: false,
    // Generoso de propósito: um servidor Nuxt em modo `dev` compila a 1.ª
    // rota pedida (`/`) só quando é pedida — visto nesta sessão que isso
    // pode demorar vários minutos numa máquina carregada (a mesma razão que
    // levou tests/integration/api.test.ts a usar um setupTimeout de 600s).
    timeout: 600_000,
    env: { E2E_PORT: String(PORT), E2E_CONTROL_PORT: String(CONTROL_PORT) },
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
