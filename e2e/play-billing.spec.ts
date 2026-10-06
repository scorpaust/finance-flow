import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'

// Upgrade 01 — Google Play Billing. No site, um plano comprado na app Android
// (Google Play) é gerido pela Google: sem checkout EasyPay por cima, com o
// link para a Google Play. O fluxo de compra em si só existe na app instalada
// pela Play Store e é testado à mão (context/features/upgrades/
// 01-google-play-billing-android.md, secção "Testes").
//
// Helpers inline — ver o comentário equivalente em main-flow.spec.ts.
const CONTROL_URL = `http://127.0.0.1:${process.env.E2E_CONTROL_PORT || '3401'}`
const PASSWORD = randomUUID()

// IP próprio deste spec (equivalente a "outra pessoa"): o registo está
// limitado a 5 contas por IP por hora e os outros specs já usam o localhost.
// Em dev, sem proxy, o servidor lê o último valor de x-forwarded-for
// (server/utils/clientIp.ts) — o mesmo truque dos testes de integração.
test.use({ extraHTTPHeaders: { 'x-forwarded-for': '10.42.0.1' } })

async function registerViaUi(page: import('@playwright/test').Page, email: string) {
  await page.goto('/')
  await page.getByTestId('login-tab-register').click()
  await page.getByTestId('login-name').fill('Teste E2E')
  await page.getByTestId('login-email').fill(email)
  await page.getByTestId('login-password').fill(PASSWORD)
  await page.getByTestId('login-accept-terms').check()
  await page.getByTestId('login-submit').click()
  await page.waitForURL('**/')
}

test('no site, um plano da Google Play mostra "gerida na Google Play" e esconde o checkout EasyPay', async ({ page }) => {
  const email = `e2e-play-${Date.now()}@example.com`
  await registerViaUi(page, email)

  const res = await fetch(`${CONTROL_URL}/__e2e/set-play-subscription`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, tier: 'pro' }),
  })
  expect(res.status).toBe(204)

  await page.goto('/subscription?tier=premium')
  await expect(page.getByTestId('subscription-managed-play')).toBeVisible()
  const manage = page.locator('a[href^="https://play.google.com/store/account/subscriptions"]')
  await expect(manage).toBeVisible()
  await expect(manage).toHaveAttribute('href', /sku=pro&package=com\.dinismcosta\.financeflow/)
  await expect(page.getByTestId('subscription-methods')).toHaveCount(0)
})
