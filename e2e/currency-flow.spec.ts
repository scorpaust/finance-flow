import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'

// Fase 10 — moeda de apresentação: mudar a moeda em Configurações muda os
// valores da app; voltar ao euro repõe exatamente os valores de antes. O
// câmbio é semeado pelo servidor de controlo (sem acesso ao fornecedor real).
const CONTROL = 'http://localhost:3401'
const PASSWORD = randomUUID()

test('mudar a moeda para dólares e voltar ao euro', async ({ page, request }) => {
  const email = `e2e-fx-${Date.now()}@example.com`
  await page.goto('/')
  await page.getByTestId('login-tab-register').click()
  await page.getByTestId('login-name').fill('Teste Moeda')
  await page.getByTestId('login-email').fill(email)
  await page.getByTestId('login-password').fill(PASSWORD)
  await page.getByTestId('login-accept-terms').check()
  await page.getByTestId('login-submit').click()
  await page.waitForURL('**/')

  // 1 € = 2 $ — números redondos para conferir a conversão.
  await request.post(`${CONTROL}/__e2e/seed-fx`, { data: { currency: 'USD', rate: 2 } })
  await request.post(`${CONTROL}/__e2e/seed-transaction`, { data: { email, amount: 100, monthsAgo: 0 } })

  await page.goto('/settings')
  const select = page.getByTestId('settings-currency-select')
  await expect(select.locator('option[value="USD"]')).toHaveCount(1, { timeout: 60_000 })
  await select.selectOption('USD')
  await expect(page.getByTestId('settings-currency-rate')).toContainText('$')

  await page.goto('/transactions')
  // A despesa de 100 € aparece como 200 $.
  await expect(page.getByText(/200[.,]00/).first()).toBeVisible({ timeout: 60_000 })
  await expect(page.getByText(/\$/).first()).toBeVisible()

  await page.goto('/settings')
  await page.getByTestId('settings-currency-select').selectOption('EUR')
  await page.goto('/transactions')
  // "€100.00" (EN, símbolo antes) ou "100,00 €" (PT, símbolo depois).
  await expect(page.getByText(/€\s?100[.,]00|100[.,]00\s?€/).first()).toBeVisible({ timeout: 60_000 })
})
