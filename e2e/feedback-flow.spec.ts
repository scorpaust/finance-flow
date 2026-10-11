import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'

// Upgrade 09 — "Ajuda e opinião": a partir das Definições, escrever e enviar
// uma mensagem; o operador recebe-a por email (a "Resend" do E2E é o servidor
// de controlo).
// Helpers inline, sem imports partilhados — ver a nota em e2e/main-flow.spec.ts.
const CONTROL_URL = 'http://127.0.0.1:3401'

test.use({ extraHTTPHeaders: { 'x-forwarded-for': '10.42.0.5' } })

test('enviar uma mensagem de ajuda a partir das Definições', async ({ page }) => {
  const email = `e2e-feedback-${Date.now()}@example.com`
  await page.goto('/')
  await page.getByTestId('login-tab-register').click()
  await page.getByTestId('login-name').fill('Opinião E2E')
  await page.getByTestId('login-email').fill(email)
  await page.getByTestId('login-password').fill(randomUUID())
  await page.getByTestId('login-accept-terms').check()
  await page.getByTestId('login-submit').click()
  await page.waitForURL('**/')

  await page.goto('/settings')
  await page.getByTestId('settings-feedback-link').click()
  await page.waitForURL('**/feedback?from=/settings')
  await page.getByTestId('feedback-type-problem').click()
  await page.getByTestId('feedback-message').fill('O botão de exportar CSV não responde.')
  await page.getByTestId('feedback-submit').click()
  await expect(page.getByTestId('feedback-sent')).toBeVisible()

  // Confirmação para o utilizador (aceitou ser contactado, por omissão).
  const res = await fetch(`${CONTROL_URL}/__e2e/last-email?to=${encodeURIComponent(email)}`)
  expect(res.status).toBe(200)
})
