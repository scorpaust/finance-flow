import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'

// Upgrade 08 — primeiros passos no painel de uma conta nova e página de ajuda
// pública (pesquisa e ligação direta a uma pergunta).
// Helpers inline, sem imports partilhados — ver a nota em e2e/main-flow.spec.ts.
test.use({ extraHTTPHeaders: { 'x-forwarded-for': '10.42.0.8' } })

test('conta nova vê os primeiros passos e registar uma despesa marca o passo', async ({ page }) => {
  await page.goto('/login')
  await page.getByTestId('login-tab-register').click()
  await page.getByTestId('login-name').fill('Primeiros Passos E2E')
  await page.getByTestId('login-email').fill(`e2e-onboarding-${Date.now()}@example.com`)
  await page.getByTestId('login-password').fill(randomUUID())
  await page.getByTestId('login-accept-terms').check()
  await page.getByTestId('login-submit').click()
  await page.waitForURL('**/')

  await expect(page.getByTestId('onboarding')).toBeVisible()
  await expect(page.getByTestId('onboarding-go-expense')).toBeVisible()
  await page.getByTestId('onboarding-go-expense').click()
  await page.getByTestId('tx-description').fill('Café')
  await page.getByTestId('tx-amount').fill('1.20')
  await page.getByTestId('tx-category').selectOption({ index: 1 })
  await page.getByTestId('tx-submit').click()
  await expect(page.getByTestId('tx-submit')).toHaveCount(0)
  await expect(page.getByTestId('onboarding-go-expense')).toHaveCount(0)

  await page.getByTestId('onboarding-dismiss').click()
  await expect(page.getByTestId('onboarding')).toHaveCount(0)
  await page.reload()
  await expect(page.getByTestId('dashboard-greeting')).toBeVisible()
  await expect(page.getByTestId('onboarding')).toHaveCount(0)
})

test('ajuda sem sessão: entrada a partir do login, pesquisa e ligação direta', async ({ page }) => {
  await page.goto('/login')
  await page.getByTestId('login-help').click()
  await page.waitForURL('**/help')
  await expect(page.getByTestId('help-item').first()).toBeVisible()

  await page.getByTestId('help-search').fill('xyzzy-nada')
  await expect(page.getByTestId('help-no-results')).toBeVisible()
  await page.getByTestId('help-search').fill('QR')
  await expect(page.locator('details#two-factor')).toBeVisible()

  // Como um ícone "?": chega-se de outra página, já com a pergunta no endereço.
  await page.goto('/login')
  await page.goto('/help#groups')
  await expect(page.locator('details#groups')).toHaveAttribute('open', '')
})
