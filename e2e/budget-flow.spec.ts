import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'

// Upgrade 04 — orçamento sugerido por IA: pedir a proposta em /groups,
// aplicá-la e ver os limites nos grupos e nas categorias; desfazer volta atrás.
// A "Anthropic" do E2E responde sempre com erro (scripts/e2e-server.mjs), por
// isso a proposta é a determinística da app — a validação da resposta da IA
// tem testes próprios em tests/integration/api.test.ts.
//
// Helpers inline, sem imports partilhados — ver a nota em e2e/main-flow.spec.ts.
const CONTROL_URL = 'http://127.0.0.1:3401'

async function controlFetch(path: string, body: unknown) {
  const res = await fetch(`${CONTROL_URL}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${path} devolveu ${res.status}`)
}

const PASSWORD = randomUUID()

// IP próprio deste spec, como em play-billing.spec.ts: o registo está
// limitado a 5 contas por IP por hora e os outros specs já usam o localhost.
test.use({ extraHTTPHeaders: { 'x-forwarded-for': '10.42.0.2' } })

test('pedir a proposta, aplicar e ver os limites nos grupos; desfazer', async ({ page }) => {
  const email = `e2e-budget-${Date.now()}@example.com`

  await page.goto('/')
  await page.getByTestId('login-tab-register').click()
  await page.getByTestId('login-name').fill('Orçamento E2E')
  await page.getByTestId('login-email').fill(email)
  await page.getByTestId('login-password').fill(PASSWORD)
  await page.getByTestId('login-accept-terms').check()
  await page.getByTestId('login-submit').click()
  await page.waitForURL('**/')

  await controlFetch('/__e2e/set-tier', { email, tier: 'premium' })
  await controlFetch('/__e2e/seed-budget-history', { email })

  await page.goto('/groups')
  await page.waitForLoadState('networkidle')

  const card = page.getByTestId('ai-budget-card')
  await expect(card).toBeVisible()
  await page.getByTestId('ai-budget-request').click()
  await expect(page.getByTestId('ai-budget-proposal')).toBeVisible({ timeout: 30_000 })
  await expect(page.getByTestId('ai-budget-category-row')).toHaveCount(3)
  await expect(page.getByTestId('ai-budget-group-row')).toHaveCount(1)

  // Ainda sem limites aplicados.
  await expect(page.getByTestId('group-limit')).toHaveCount(0)
  await expect(page.getByTestId('category-limits')).toHaveCount(0)

  await page.getByTestId('ai-budget-apply').click()
  // Disponível 1600 €: lazer cortado de 350 para 250 (o grupo segue a categoria).
  await expect(page.getByTestId('group-limit')).toContainText('250')
  await expect(page.getByTestId('category-limit-row')).toHaveCount(3)

  // Um segundo pedido no mesmo mês já não é possível: o botão desapareceu.
  await expect(page.getByTestId('ai-budget-request')).toHaveCount(0)

  await page.getByTestId('ai-budget-undo').click()
  await expect(page.getByTestId('group-limit')).toHaveCount(0)
  await expect(page.getByTestId('category-limits')).toHaveCount(0)
})
