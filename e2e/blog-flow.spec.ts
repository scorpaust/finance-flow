import { test, expect } from '@playwright/test'

// Upgrade 13 — blog público: lista, artigo com metadados, chamada para o
// registo, ligação na apresentação e 404 em línguas/artigos sem conteúdo.
test.use({ extraHTTPHeaders: { 'x-forwarded-for': '10.42.0.13' } })

test('da apresentação ao artigo, sem sessão, e depois ao registo', async ({ page }) => {
  await page.goto('/pt')
  await page.getByTestId('landing-blog').click()
  await page.waitForURL('**/pt/blog')
  await expect(page.getByTestId('blog')).toBeVisible()
  await page.getByTestId('blog-post-link').first().click()
  await page.waitForURL('**/pt/blog/como-poupar-dinheiro')
  await expect(page.getByTestId('blog-article').locator('h1')).toContainText('Como poupar dinheiro')
  await page.getByTestId('blog-cta').getByRole('link', { name: /Começar grátis/ }).click()
  await page.waitForURL('**/login?mode=register')
})

test('o artigo tem canónico, Open Graph de artigo e dados estruturados', async ({ page }) => {
  await page.goto('/pt/blog/como-poupar-dinheiro')
  const head = page.locator('head')
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-PT')
  await expect(head.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.financeflow-webapp.pt/pt/blog/como-poupar-dinheiro')
  await expect(head.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article')
  const ld = await head.locator('script[type="application/ld+json"]').allTextContents()
  expect(ld.some((s) => s.includes('"BlogPosting"'))).toBe(true)
})

test('línguas sem artigos e artigos inexistentes dão 404', async ({ page }) => {
  expect((await page.goto('/en/blog'))?.status()).toBe(404)
  expect((await page.goto('/pt/blog/nao-existe'))?.status()).toBe(404)
  await page.goto('/en')
  await expect(page.getByTestId('landing-blog')).toHaveCount(0)
})

test('o sitemap inclui o blog', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text()
  expect(xml).toContain('<loc>https://www.financeflow-webapp.pt/pt/blog/como-poupar-dinheiro</loc>')
})
