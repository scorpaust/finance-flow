import { randomUUID } from 'node:crypto'
import { chromium } from '@playwright/test'

// Fase 8, ponto 6 — "aquece" o servidor Nuxt (modo `dev`) antes dos testes
// reais correrem. Em dev, o Vite só descobre/pré-empacota uma dependência
// client-side (ex. `@easypaypt/checkout-sdk`, `@tensorflow/tfjs`) na 1.ª vez
// que uma página que a usa é visitada — e reage a isso recarregando a
// página a meio, o que dentro de um teste já em curso (ex. um formulário
// aberto) faz perder esse estado e o teste falha por timeout à espera de um
// elemento que desapareceu no reload (visto várias vezes nesta sessão,
// mesmo depois de várias dependências terem sido adicionadas a
// `vite.optimizeDeps.include` em nuxt.config.ts — o crawler do Vite ainda
// assim só as encontra a sério ao visitar a rota real). Visitar cada rota
// uma vez aqui, fora de qualquer teste, deixa esse ciclo de
// descoberta+reload já resolvido quando os specs começam.
export default async function globalSetup() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const base = 'http://localhost:3400'

  try {
    // As rotas protegidas (middleware/auth.global.ts) redirecionam para
    // /login sem sessão — sem uma conta, o Vite nunca chegaria a descobrir
    // as dependências dessas páginas.
    await page.goto(`${base}/`, { timeout: 120_000 })
    await page.getByTestId('login-tab-register').click()
    await page.getByTestId('login-name').fill('Warmup')
    await page.getByTestId('login-email').fill(`e2e-warmup-${Date.now()}@example.com`)
    await page.getByTestId('login-password').fill(randomUUID())
    await page.getByTestId('login-accept-terms').check()
    await page.getByTestId('login-submit').click()
    await page.waitForURL('**/', { timeout: 120_000 })

    await page.goto(`${base}/predictions`, { timeout: 120_000 })
    await page.goto(`${base}/subscription`, { timeout: 120_000 })
    await page.goto(`${base}/settings`, { timeout: 120_000 })
  } catch {
    // Falhar o aquecimento não deve impedir os testes de tentar correr — na
    // pior das hipóteses voltam a pagar o custo do reload lá dentro.
  } finally {
    await browser.close()
  }
}
