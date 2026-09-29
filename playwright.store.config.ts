import { defineConfig } from '@playwright/test'
import base from './playwright.config'

// Fase 9 — capturas de ecrã para a ficha da Google Play (não é uma suite de
// testes). Mesmo servidor do E2E (Nuxt + MongoDB em memória, dados de exemplo
// criados na hora, nunca dados reais). Uso: npm run store:screenshots
export default defineConfig({
  ...base,
  testDir: './store-screenshots',
  reporter: [['list']],
  timeout: 600_000,
})
