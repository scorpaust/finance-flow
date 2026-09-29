import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { test, expect, type Browser, type Locator, type Page } from '@playwright/test'

// Capturas de ecrã para a Play Store, em PT-PT, com uma conta Premium e dados
// de exemplo genéricos (criados na hora, nunca dados reais). Os mesmos 4
// ecrãs em cada formato pedido pela Play Console (9:16 ou 16:9):
//   phone      1080×1920  (360×640 a 3×)         telemóvel
//   tablet7    1224×2176  (612×1088 a 2×)        tablet de 7"
//   tablet10   2560×1440  (1280×720 a 2×)        tablet de 10", paisagem
//   chromebook 1920×1080  (1920×1080 a 1×)       Chromebook / ecrã grande
// Resultado em assets/store/screenshots/<formato>-<n>-<ecrã>.png.
const BASE = 'http://localhost:3400'
const CONTROL = 'http://localhost:3401'
const OUT = 'assets/store/screenshots'

const DEVICES = [
  { name: 'phone', viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true },
  { name: 'tablet7', viewport: { width: 612, height: 1088 }, deviceScaleFactor: 2, isMobile: true },
  { name: 'tablet10', viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2, isMobile: true },
  { name: 'chromebook', viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, isMobile: false },
] as const

test.use({ locale: 'pt-PT' })

// Valores típicos de um orçamento pessoal (€); a ordem segue as categorias
// criadas no registo (server/utils/defaultCategories.ts).
const MONTHLY: { category: string; description: string; amount: number; day: number }[] = [
  { category: 'Habitação', description: 'Renda', amount: 650, day: 1 },
  { category: 'Contas da casa', description: 'Eletricidade e água', amount: 78.4, day: 6 },
  { category: 'Contas da casa', description: 'Internet e telemóvel', amount: 39.99, day: 8 },
  { category: 'Transportes', description: 'Passe mensal', amount: 40, day: 2 },
  { category: 'Saúde', description: 'Ginásio', amount: 32.5, day: 4 },
  { category: 'Lazer', description: 'Jantar fora', amount: 46.8, day: 14 },
  { category: 'Lazer', description: 'Cinema', amount: 17, day: 21 },
  { category: 'Compras', description: 'Roupa', amount: 59.9, day: 18 },
  { category: 'Alimentação', description: 'Supermercado', amount: 84.35, day: 3 },
  { category: 'Alimentação', description: 'Supermercado', amount: 67.2, day: 10 },
  { category: 'Alimentação', description: 'Supermercado', amount: 91.1, day: 17 },
  { category: 'Alimentação', description: 'Supermercado', amount: 72.65, day: 24 },
  { category: 'Transportes', description: 'Combustível', amount: 55, day: 12 },
]

function dateFor(monthsAgo: number, day: number): string {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, day, 12)
  // No mês corrente, nada no futuro.
  if (d > now) d.setDate(Math.max(1, now.getDate() - 1))
  return d.toISOString()
}

// Desliza até ao conteúdo que interessa mostrar (o topo de cada página são
// botões e filtros), deixando `offset` px acima dele.
async function scrollTo(page: Page, locator: Locator, offset: number) {
  await locator.evaluate((el, off) => {
    // O layout pode ter o seu próprio contentor com scroll (não a janela).
    el.scrollIntoView({ block: 'start' })
    let parent: HTMLElement | null = el.parentElement
    while (parent) {
      const style = getComputedStyle(parent)
      if (/(auto|scroll)/.test(style.overflowY) && parent.scrollHeight > parent.clientHeight) break
      parent = parent.parentElement
    }
    if (parent) parent.scrollBy(0, -off)
    else window.scrollBy(0, -off)
  }, offset)
}

async function shot(page: Page, name: string) {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500) // animações de entrada e gráficos
  await page.screenshot({ path: `${OUT}/${name}.png` })
}

test('capturas de ecrã da Play Store (PT-PT)', async ({ page, context, browser }) => {
  mkdirSync(OUT, { recursive: true })
  await context.addCookies([{ name: 'financeflow_locale', value: 'pt-PT', url: BASE }])

  // Aparece na barra lateral dos ecrãs largos; a BD é nova a cada execução.
  const email = 'ana@exemplo.pt'
  const register = await page.request.post(`${BASE}/api/auth/session`, {
    data: { action: 'register', email, password: randomUUID(), name: 'Ana', acceptTerms: true },
  })
  expect(register.ok()).toBeTruthy()
  await page.request.post(`${CONTROL}/__e2e/set-tier`, { data: { email, tier: 'premium' } })

  const categories = (await (await page.request.get(`${BASE}/api/categories`)).json()) as { _id: string; name: string }[]
  const idOf = (name: string) => categories.find((c) => c.name === name)!._id

  const txs: Record<string, unknown>[] = []
  for (let m = 5; m >= 0; m--) {
    txs.push({ type: 'income', amount: 1850, description: 'Salário', categoryId: idOf('Salário'), date: dateFor(m, 25) })
    if (m % 2 === 0) {
      txs.push({ type: 'income', amount: 180 + m * 15, description: 'Trabalho extra', categoryId: idOf('Outros rendimentos'), date: dateFor(m, 15) })
    }
    for (const t of MONTHLY) {
      // Pequena variação mês a mês para os gráficos não ficarem planos.
      const amount = Math.round(t.amount * (0.9 + ((m * 7 + t.day) % 5) * 0.05) * 100) / 100
      txs.push({ type: 'expense', amount, description: t.description, categoryId: idOf(t.category), date: dateFor(m, t.day) })
    }
  }
  for (const tx of txs) {
    const res = await page.request.post(`${BASE}/api/transactions`, { data: tx })
    expect(res.ok()).toBeTruthy()
  }

  const profile = await page.request.post(`${BASE}/api/investor-profile`, {
    data: { riskTolerance: 'moderado', horizonYears: 10, hasExistingInvestments: true, knowledgeLevel: 'intermedio', goals: [] },
  })
  expect(profile.ok()).toBeTruthy()

  const investments = [
    { name: 'ETF MSCI World', assetClass: 'etf', initialAmount: 3000, reinforcement: 1200, currentValue: 4710 },
    { name: 'Certificados de Aforro', assetClass: 'obrigacoes', initialAmount: 2000, reinforcement: 0, currentValue: 2086 },
    { name: 'Depósito a prazo', assetClass: 'deposito', initialAmount: 1500, reinforcement: 0, currentValue: 1531 },
    { name: 'PPR', assetClass: 'fundo', initialAmount: 1000, reinforcement: 600, currentValue: 1742 },
  ]
  for (const inv of investments) {
    const res = await page.request.post(`${BASE}/api/investments`, { data: { ...inv, initialDate: dateFor(11, 10) } })
    expect(res.ok()).toBeTruthy()
  }

  const storageState = await context.storageState()
  for (const device of DEVICES) {
    await captureDevice(browser, storageState, device)
  }
})

async function captureDevice(
  browser: Browser,
  storageState: Awaited<ReturnType<import('@playwright/test').BrowserContext['storageState']>>,
  device: (typeof DEVICES)[number]
) {
  const context = await browser.newContext({
    storageState,
    locale: 'pt-PT',
    viewport: device.viewport,
    deviceScaleFactor: device.deviceScaleFactor,
    isMobile: device.isMobile,
    hasTouch: device.isMobile,
  })
  const page = await context.newPage()
  const prefix = device.name

  await page.goto(`${BASE}/`)
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 120_000 })
  // exact + visible: a barra lateral (escondida no telemóvel) também diz "Saldo total".
  // Nos ecrãs largos o topo já mostra os KPIs; deslizar cortava a saudação.
  if (device.isMobile && device.viewport.height > device.viewport.width) {
    await scrollTo(page, page.getByText('Saldo Total', { exact: true }).filter({ visible: true }).first(), 200)
  }
  await shot(page, `${prefix}-1-painel`)

  await page.goto(`${BASE}/transactions`)
  const firstRow = page.getByText(/^(Salário|Renda|Supermercado|Combustível|Cinema|Roupa|Jantar fora)$/).filter({ visible: true }).first()
  await expect(firstRow).toBeVisible({ timeout: 120_000 })
  await scrollTo(page, firstRow, 190)
  await shot(page, `${prefix}-2-transacoes`)

  await page.goto(`${BASE}/stats`)
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 120_000 })
  await scrollTo(page, page.getByText('Receitas vs Despesas', { exact: true }).filter({ visible: true }).first(), 150)
  await shot(page, `${prefix}-3-estatisticas`)

  await page.goto(`${BASE}/investimento`)
  // O nome das posições aparece também numa tabela escondida no telemóvel —
  // espera pelos totais, que são o topo da captura.
  await expect(page.getByText('Rentabilidade').first()).toBeVisible({ timeout: 120_000 })
  await shot(page, `${prefix}-4-investimentos`)
  await context.close()
}
