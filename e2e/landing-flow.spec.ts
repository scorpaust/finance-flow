import { test, expect } from '@playwright/test'

// Upgrade 12 — páginas de apresentação por língua, metadados para pesquisa e
// partilha, sitemap e robots.
test.use({ extraHTTPHeaders: { 'x-forwarded-for': '10.42.0.12' } })

test('a raiz sem sessão abre a apresentação na língua do browser, com metadados', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'de-DE', extraHTTPHeaders: { 'accept-language': 'de-DE,de;q=0.9' } })
  const page = await context.newPage()
  await page.goto('/')
  await page.waitForURL('**/de')
  await expect(page.getByTestId('landing')).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'de')
  await expect(page.getByTestId('landing-cta')).toHaveText(/Kostenlos starten/)

  const head = page.locator('head')
  await expect(head.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.financeflow-webapp.pt/de')
  await expect(head.locator('link[rel="alternate"][hreflang]')).toHaveCount(7)
  await expect(head.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://www.financeflow-webapp.pt/og/og-de.png')
  await expect(head.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'de_DE')
  await expect(head.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image')
  const ld = await head.locator('script[type="application/ld+json"]').allTextContents()
  expect(ld.some((s) => s.includes('"SoftwareApplication"'))).toBe(true)
  expect(ld.some((s) => s.includes('"FAQPage"'))).toBe(true)
  await expect(page.getByTestId('landing-price-pro')).toContainText('€')
  await context.close()
})

test('trocar de língua no rodapé e começar o registo', async ({ page }) => {
  await page.goto('/pt')
  await expect(page.getByTestId('landing-cta')).toHaveText(/Começar grátis/)
  await page.getByTestId('landing-languages').getByRole('link', { name: 'English' }).click()
  await page.waitForURL('**/en')
  await expect(page.getByTestId('landing-cta')).toHaveText(/Start for free/)
  await page.getByTestId('landing-cta').click()
  await page.waitForURL('**/login?mode=register')
  await expect(page.getByTestId('login-name')).toBeVisible()
})

test('na app Android (cookie ff_native) a raiz vai para o login; caminho desconhecido dá 404', async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: 'ff_native', value: '1', url: baseURL! }])
  await page.goto('/')
  await page.waitForURL('**/login')
  const res = await page.goto('/xyz-nao-existe')
  expect(res?.status()).toBe(404)
})

test('sitemap e robots', async ({ request }) => {
  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.status()).toBe(200)
  const xml = await sitemap.text()
  for (const s of ['pt', 'en', 'es', 'fr', 'de', 'it']) expect(xml).toContain(`<loc>https://www.financeflow-webapp.pt/${s}</loc>`)
  expect(xml).toContain('hreflang="x-default"')
  const robots = await (await request.get('/robots.txt')).text()
  expect(robots).toContain('Sitemap: https://www.financeflow-webapp.pt/sitemap.xml')
  expect(robots).toContain('Disallow: /api/')
})
