import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'

// Upgrade 06 — língua: escolher no ecrã de entrada antes de criar conta, e a
// língua "automática" acompanha a do telemóvel; uma escolha manual fica.
// Helpers inline, sem imports partilhados — ver a nota em e2e/main-flow.spec.ts.
const BASE = 'http://localhost:3400'

test.describe('língua (Upgrade 06)', () => {
  // IP próprio (limite de registos por IP), como em play-billing.spec.ts.
  test.use({ extraHTTPHeaders: { 'x-forwarded-for': '10.42.0.4' }, locale: 'hi-IN' })

  test('escolher a língua no login antes de criar conta; a conta nasce nessa língua', async ({ page, context }) => {
    await page.goto('/login')
    // hi-IN não é suportado: começa em inglês.
    await expect(page.getByTestId('login-tab-register')).toHaveText(/Create account/)

    await page.getByTestId('language-switcher').selectOption('pt-PT')
    await expect(page.getByTestId('login-tab-register')).toHaveText(/Criar conta/)
    const cookies = await context.cookies()
    expect(cookies.find((c) => c.name === 'financeflow_locale')?.value).toBe('pt-PT')
    expect(cookies.find((c) => c.name === 'financeflow_locale_source')?.value).toBe('user')

    await page.getByTestId('login-tab-register').click()
    await page.getByTestId('login-name').fill('Língua E2E')
    await page.getByTestId('login-email').fill(`e2e-lang-${Date.now()}@example.com`)
    await page.getByTestId('login-password').fill(randomUUID())
    await page.getByTestId('login-accept-terms').check()
    await page.getByTestId('login-submit').click()
    await page.waitForURL('**/')

    const categories = await (await page.request.get('/api/categories')).json()
    expect(categories.map((c: any) => c.name)).toContain('Habitação')
  })
})

test.describe('língua automática acompanha o telemóvel', () => {
  test.use({ locale: 'es-ES' })

  test('detetada antes noutra língua → segue a nova; escolhida à mão → fica', async ({ page, context }) => {
    await context.addCookies([
      { name: 'financeflow_locale', value: 'de', url: BASE },
      { name: 'financeflow_locale_source', value: 'auto', url: BASE },
    ])
    await page.goto('/login')
    await expect(page.getByTestId('login-tab-register')).toHaveText(/Crear cuenta/)

    await context.clearCookies()
    await context.addCookies([
      { name: 'financeflow_locale', value: 'de', url: BASE },
      { name: 'financeflow_locale_source', value: 'user', url: BASE },
    ])
    await page.goto('/login')
    await expect(page.getByTestId('login-tab-register')).toHaveText(/Konto erstellen/)
  })
})
