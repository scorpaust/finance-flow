import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'

// Sessão que deixa de valer com a página aberta: a app só a lê uma vez, por isso
// o 401 da API é o primeiro sinal. Leva ao login, mas só se a sessão tiver mesmo
// acabado: uma password errada também dá 401 e não pode tirar ninguém da conta.
// Helpers inline, sem imports partilhados — ver a nota em e2e/main-flow.spec.ts.
test.use({ extraHTTPHeaders: { 'x-forwarded-for': '10.42.0.14' } })

async function register(page: import('@playwright/test').Page, label: string) {
  await page.goto('/login')
  await page.getByTestId('login-tab-register').click()
  await page.getByTestId('login-name').fill('Sessão E2E')
  await page.getByTestId('login-email').fill(`e2e-${label}-${Date.now()}@example.com`)
  await page.getByTestId('login-password').fill(randomUUID())
  await page.getByTestId('login-accept-terms').check()
  await page.getByTestId('login-submit').click()
  await page.waitForURL('**/')
  await expect(page.getByTestId('dashboard-greeting')).toBeVisible()
}

test('sessão expirada com a página aberta: um pedido à API leva ao login', async ({ page }) => {
  await register(page, 'expired')
  await page.context().clearCookies()

  // Dentro da página, como uma navegação na app: a verificação de sessão guardada ainda diz que há sessão.
  const status = await page.evaluate(() => (globalThis as any).$fetch('/api/transactions').then(() => 200, (e: any) => e.status))
  expect(status).toBe(401)
  await page.waitForURL('**/login')
  await expect(page.getByTestId('login-submit')).toBeVisible()
})

test('um 401 com a sessão válida não tira ninguém da conta', async ({ page }) => {
  await register(page, 'wrong-password')

  // Apagar a conta com a password errada dá 401, mas a sessão continua boa.
  const status = await page.evaluate(() => (globalThis as any).$fetch('/api/account', { method: 'DELETE', body: { password: 'password-errada' } }).then(() => 200, (e: any) => e.status))
  expect(status).toBe(401)
  await page.waitForLoadState('networkidle')
  await expect(page).not.toHaveURL(/\/login/)
  await expect(page.getByTestId('dashboard-greeting')).toBeVisible()
})
