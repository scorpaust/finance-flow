import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'

// Recorrência com confirmação: uma transação semanal registada há uma semana
// aparece no painel por confirmar; confirmar regista-a e o cartão desaparece.
// Helpers inline, sem imports partilhados — ver a nota em e2e/main-flow.spec.ts.
test.use({ extraHTTPHeaders: { 'x-forwarded-for': '10.42.0.15' } })

test('confirmar uma transação recorrente no painel', async ({ page }) => {
  await page.goto('/login')
  await page.getByTestId('login-tab-register').click()
  await page.getByTestId('login-name').fill('Recorrência E2E')
  await page.getByTestId('login-email').fill(`e2e-recurring-${Date.now()}@example.com`)
  await page.getByTestId('login-password').fill(randomUUID())
  await page.getByTestId('login-accept-terms').check()
  await page.getByTestId('login-submit').click()
  await page.waitForURL('**/')
  await expect(page.getByTestId('dashboard-greeting')).toBeVisible()
  await expect(page.getByTestId('recurring-due')).toHaveCount(0)

  // Salário semanal com data de há 7 dias: a próxima ocorrência é hoje.
  await page.evaluate(async () => {
    const $fetch = (globalThis as any).$fetch
    const categories: any[] = await $fetch('/api/categories', { params: { type: 'income' } })
    const d = new Date()
    const weekAgo = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - 7)).toISOString().slice(0, 10)
    await $fetch('/api/transactions', {
      method: 'POST',
      body: { type: 'income', amount: 1000, description: 'Salário E2E', categoryId: categories[0]._id, date: weekAgo, recurrence: 'weekly' },
    })
  })
  await page.reload()

  const card = page.getByTestId('recurring-due')
  await expect(card).toBeVisible()
  await expect(card.getByTestId('recurring-item')).toContainText('Salário E2E')
  await card.getByTestId('recurring-amount').fill('1050')
  await card.getByTestId('recurring-confirm').click()
  await expect(card).toHaveCount(0)

  const created = await page.evaluate(() => (globalThis as any).$fetch('/api/transactions', { params: { limit: 10 } }))
  expect(created.total).toBe(2)
  expect(created.data.some((t: any) => t.amount === 1050 && t.description === 'Salário E2E')).toBe(true)
})
