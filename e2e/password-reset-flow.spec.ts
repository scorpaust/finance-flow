import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'

// Upgrade 05 — recuperação de password de ponta a ponta: pedir o link no
// login, abri-lo (lido do servidor de controlo, que faz de Resend), definir a
// nova password e entrar com ela; a antiga deixa de funcionar.
// Helpers inline, sem imports partilhados — ver a nota em e2e/main-flow.spec.ts.
const CONTROL_URL = 'http://127.0.0.1:3401'

// IP próprio (limite de registos por IP), como em play-billing.spec.ts.
test.use({ extraHTTPHeaders: { 'x-forwarded-for': '10.42.0.3' } })

const OLD_PASSWORD = randomUUID()
const NEW_PASSWORD = randomUUID()

test('esqueci-me da password: pedir o link, definir a nova e entrar com ela', async ({ page }) => {
  const email = `e2e-reset-${Date.now()}@example.com`

  // Conta nova, e sair.
  await page.goto('/')
  await page.getByTestId('login-tab-register').click()
  await page.getByTestId('login-name').fill('Recuperação E2E')
  await page.getByTestId('login-email').fill(email)
  await page.getByTestId('login-password').fill(OLD_PASSWORD)
  await page.getByTestId('login-accept-terms').check()
  await page.getByTestId('login-submit').click()
  await page.waitForURL('**/')
  await page.context().clearCookies()

  // Pedir o link.
  await page.goto('/login')
  await page.getByTestId('login-forgot').click()
  await page.waitForURL('**/forgot-password')
  await page.getByTestId('forgot-email').fill(email)
  await page.getByTestId('forgot-submit').click()
  await expect(page.getByTestId('forgot-sent')).toBeVisible()

  // Abrir o link do email.
  const res = await fetch(`${CONTROL_URL}/__e2e/last-email?to=${encodeURIComponent(email)}`)
  expect(res.status).toBe(200)
  const sent = await res.json()
  const link = String(sent.text).match(/https?:\/\/\S+\/reset-password\?token=[A-Za-z0-9_-]+/)?.[0]
  expect(link).toBeTruthy()
  await page.goto(new URL(link!).pathname + new URL(link!).search)

  // Passwords diferentes → erro local, sem pedido.
  await page.getByTestId('reset-password').fill(NEW_PASSWORD)
  await page.getByTestId('reset-confirm').fill(`${NEW_PASSWORD}x`)
  await page.getByTestId('reset-submit').click()
  await expect(page.getByTestId('reset-error')).toBeVisible()

  await page.getByTestId('reset-confirm').fill(NEW_PASSWORD)
  await page.getByTestId('reset-submit').click()
  await page.waitForURL('**/login?reset=1')
  await expect(page.getByTestId('login-reset-done')).toBeVisible()

  // A password antiga já não entra; a nova sim.
  await page.getByTestId('login-email').fill(email)
  await page.getByTestId('login-password').fill(OLD_PASSWORD)
  await page.getByTestId('login-submit').click()
  await expect(page.getByTestId('login-submit')).toBeVisible()
  await expect(page).toHaveURL(/\/login/)

  await page.getByTestId('login-password').fill(NEW_PASSWORD)
  await page.getByTestId('login-submit').click()
  await page.waitForURL((url) => !url.pathname.startsWith('/login'))
  await expect(page.getByTestId('dashboard-greeting')).toBeVisible()
})
