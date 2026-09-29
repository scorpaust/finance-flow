import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'

// Fase 8, ponto 6 — E2E do fluxo principal: registo → login → criar
// transação → ver dashboard → tentar aceder a previsões sem Premium (deve
// mostrar paywall) → upgrade → aceder a previsões.
//
// "Upgrade" aqui é uma escrita direta na BD (via o servidor de controlo em
// scripts/e2e-server.mjs, porta fixa CONTROL_URL abaixo), não o checkout
// real da EasyPay pelo browser — automatizar um checkout externo via UI
// seria lento e frágil, e a ativação de plano via checkout/webhook já tem
// cobertura própria e mais precisa em tests/integration/api.test.ts
// (idempotência, verificação contra a API, etc.). O que este teste verifica
// é a reação da PRÓPRIA UI ao tier mudar — a fonte da mudança é secundária.
//
// Nota de infraestrutura: helpers INLINE neste ficheiro (não num
// e2e/helpers.ts partilhado) e SEM nenhum import de `node:*` — nesta
// máquina/versão (Playwright 1.63, sem "type": "module" no package.json),
// tanto importar um módulo .ts partilhado (mesmo trivial, sem dependências)
// como importar `node:fs`/`node:url` num spec fez o transform do Playwright
// rebentar ("exports is not defined" / "require is not defined"). A porta
// fixa do servidor de controlo (scripts/e2e-server.mjs) evita ter de ler um
// ficheiro/env para a descobrir.
const CONTROL_URL = 'http://127.0.0.1:3401'

async function controlFetch(path: string, body: unknown) {
  const res = await fetch(`${CONTROL_URL}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${path} devolveu ${res.status}`)
}

async function setTier(email: string, tier: 'free' | 'pro' | 'premium') {
  await controlFetch('/__e2e/set-tier', { email, tier })
}

async function seedPastTransaction(email: string, monthsAgo: number, amount: number) {
  await controlFetch('/__e2e/seed-transaction', { email, monthsAgo, amount })
}

let counter = 0
function uniqueEmail(label: string): string {
  counter += 1
  return `${label}-${Date.now()}-${counter}@example.com`
}

// Gerada a cada execução — sem passwords literais no repositório.
const PASSWORD = `E2e-${randomUUID()}`

async function registerViaUi(page: import('@playwright/test').Page, opts: { email: string; name?: string }) {
  await page.goto('/')
  await page.getByTestId('login-tab-register').click()
  if (opts.name) await page.getByTestId('login-name').fill(opts.name)
  await page.getByTestId('login-email').fill(opts.email)
  await page.getByTestId('login-password').fill(PASSWORD)
  await page.getByTestId('login-accept-terms').check()
  await page.getByTestId('login-submit').click()
  await page.waitForURL('**/')
}

test('registo, criar transação, paywall sem Premium, acesso após upgrade', async ({ page }) => {
  const email = uniqueEmail('e2e-main')

  await registerViaUi(page, { email, name: 'Teste E2E' })
  await expect(page.getByTestId('dashboard-greeting')).toBeVisible()

  // Cria uma transação pela UI.
  await page.getByTestId('dashboard-new-transaction').click()
  await page.getByTestId('tx-description').fill('Compras E2E')
  await page.getByTestId('tx-amount').fill('42.50')
  // A 1.ª opção real do select é sempre uma categoria (a categoria placeholder
  // vem desativada, ver components/forms/TransactionModal.vue) — as
  // categorias por omissão já vêm semeadas no registo (seedDefaultCategories).
  await page.getByTestId('tx-category').selectOption({ index: 1 })
  await page.getByTestId('tx-submit').click()
  await expect(page.getByTestId('tx-submit')).toHaveCount(0) // modal fechou

  // Previsões exigem 2 meses distintos de dados (pages/predictions.vue) — a
  // transação criada agora só dá 1; semeia um 2.º mês diretamente na BD.
  await seedPastTransaction(email, 1, 30)

  await page.goto('/predictions')
  await page.waitForLoadState('networkidle')
  await page.getByTestId('predictions-run').click()
  await expect(page.getByTestId('paywall-modal')).toBeVisible()
  await page.getByTestId('paywall-modal').getByRole('button').first().click() // "Agora não"
  await expect(page.getByTestId('paywall-modal')).toHaveCount(0)

  await setTier(email, 'premium')
  await page.reload()
  // `page.reload()` só espera pelo evento `load` — a store de subscrição
  // (useSubscription -> ensureFetched) só popula `tier` depois de um pedido
  // assíncrono a /api/subscription que continua em curso nesse momento;
  // clicar demasiado cedo lia-se sempre o tier por omissão ('free') e
  // mostrava o paywall outra vez.
  await page.waitForLoadState('networkidle')

  await page.getByTestId('predictions-run').click()
  await expect(page.getByTestId('paywall-modal')).toHaveCount(0)
  await expect(page.getByTestId('predictions-result')).toBeVisible({ timeout: 30_000 })
})
