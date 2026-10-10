import { defineConfig } from '@playwright/test'
import base from './playwright.config'

// Fase 9 — capturas de ecrã para a ficha da Google Play (não é uma suite de
// testes). Mesmo servidor do E2E (Nuxt + MongoDB em memória, dados de exemplo
// criados na hora, nunca dados reais). Uso: npm run store:screenshots
export default defineConfig({
  ...base,
  testDir: './store-screenshots',
  reporter: [['list']],
  // Por língua (Upgrade 07): a 1.ª língua da corrida paga a compilação das
  // páginas pelo servidor de dev, e 10 min não chegaram numa máquina carregada.
  timeout: 1_200_000,
})
