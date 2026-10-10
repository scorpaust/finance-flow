import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync } from 'node:fs'
import { test, expect, type Browser, type Locator, type Page } from '@playwright/test'

// Capturas de ecrã para a Play Store, nas 6 línguas da app (Upgrade 07), com
// uma conta Premium e dados de exemplo genéricos e traduzidos (criados na
// hora, nunca dados reais). Os mesmos 4 ecrãs em cada formato pedido pela
// Play Console (9:16 ou 16:9):
//   phone      1080×1920  (360×640 a 3×)         telemóvel
//   tablet7    1224×2176  (612×1088 a 2×)        tablet de 7"
//   tablet10   2560×1440  (1280×720 a 2×)        tablet de 10", paisagem
//   chromebook 1920×1080  (1920×1080 a 1×)       Chromebook / ecrã grande
// Resultado em assets/store/screenshots/<língua>/<formato>-<n>-<ecrã>.png.
// Só uma língua: STORE_LOCALE=en npm run store:screenshots
const BASE = 'http://localhost:3400'
const CONTROL = 'http://localhost:3401'
const OUT = 'assets/store/screenshots'

const DEVICES = [
  { name: 'phone', viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true },
  { name: 'tablet7', viewport: { width: 612, height: 1088 }, deviceScaleFactor: 2, isMobile: true },
  { name: 'tablet10', viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2, isMobile: true },
  { name: 'chromebook', viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, isMobile: false },
] as const

const ALL_LOCALES = ['pt-PT', 'en', 'fr', 'de', 'it', 'es'] as const
type Locale = (typeof ALL_LOCALES)[number]
const LOCALES: readonly Locale[] = process.env.STORE_LOCALE ? [process.env.STORE_LOCALE as Locale] : ALL_LOCALES

// Categorias criadas no registo, pela ordem (`order`) de server/utils/defaultCategories.ts.
const CATEGORY_ORDER = ['salary', 'otherIncome', 'housing', 'groceries', 'transport', 'health', 'bills', 'leisure', 'shopping', 'otherExpenses'] as const
type CategoryKey = (typeof CATEGORY_ORDER)[number]

// Descrições de exemplo traduzidas.
const TEXT: Record<Locale, Record<string, string>> = {
  'pt-PT': { salary: 'Salário', extra: 'Trabalho extra', rent: 'Renda', utilities: 'Eletricidade e água', internet: 'Internet e telemóvel', pass: 'Passe mensal', gym: 'Ginásio', dinner: 'Jantar fora', cinema: 'Cinema', clothes: 'Roupa', supermarket: 'Supermercado', fuel: 'Combustível' },
  en: { salary: 'Salary', extra: 'Side job', rent: 'Rent', utilities: 'Electricity and water', internet: 'Internet and phone', pass: 'Monthly transit pass', gym: 'Gym', dinner: 'Dinner out', cinema: 'Cinema', clothes: 'Clothes', supermarket: 'Supermarket', fuel: 'Fuel' },
  fr: { salary: 'Salaire', extra: 'Travail en extra', rent: 'Loyer', utilities: 'Électricité et eau', internet: 'Internet et téléphone', pass: 'Abonnement transport', gym: 'Salle de sport', dinner: 'Dîner au restaurant', cinema: 'Cinéma', clothes: 'Vêtements', supermarket: 'Supermarché', fuel: 'Carburant' },
  de: { salary: 'Gehalt', extra: 'Nebenjob', rent: 'Miete', utilities: 'Strom und Wasser', internet: 'Internet und Handy', pass: 'Monatskarte', gym: 'Fitnessstudio', dinner: 'Essen gehen', cinema: 'Kino', clothes: 'Kleidung', supermarket: 'Supermarkt', fuel: 'Tanken' },
  it: { salary: 'Stipendio', extra: 'Lavoro extra', rent: 'Affitto', utilities: 'Luce e acqua', internet: 'Internet e telefono', pass: 'Abbonamento mensile', gym: 'Palestra', dinner: 'Cena fuori', cinema: 'Cinema', clothes: 'Vestiti', supermarket: 'Supermercato', fuel: 'Carburante' },
  es: { salary: 'Salario', extra: 'Trabajo extra', rent: 'Alquiler', utilities: 'Luz y agua', internet: 'Internet y móvil', pass: 'Abono de transporte', gym: 'Gimnasio', dinner: 'Cena fuera', cinema: 'Cine', clothes: 'Ropa', supermarket: 'Supermercado', fuel: 'Gasolina' },
}
const INVESTMENT_NAMES: Record<Locale, [string, string, string, string]> = {
  'pt-PT': ['ETF MSCI World', 'Certificados de Aforro', 'Depósito a prazo', 'PPR'],
  en: ['ETF MSCI World', 'Government bonds', 'Term deposit', 'Pension fund'],
  fr: ['ETF MSCI World', "Obligations d'État", 'Compte à terme', 'Épargne retraite'],
  de: ['ETF MSCI World', 'Staatsanleihen', 'Festgeld', 'Altersvorsorge'],
  it: ['ETF MSCI World', 'Titoli di Stato', 'Conto deposito', 'Fondo pensione'],
  es: ['ETF MSCI World', 'Bonos del Estado', 'Depósito a plazo', 'Plan de pensiones'],
}

// Valores típicos de um orçamento pessoal (€).
const MONTHLY: { category: CategoryKey; text: string; amount: number; day: number }[] = [
  { category: 'housing', text: 'rent', amount: 650, day: 1 },
  { category: 'bills', text: 'utilities', amount: 78.4, day: 6 },
  { category: 'bills', text: 'internet', amount: 39.99, day: 8 },
  { category: 'transport', text: 'pass', amount: 40, day: 2 },
  { category: 'health', text: 'gym', amount: 32.5, day: 4 },
  { category: 'leisure', text: 'dinner', amount: 46.8, day: 14 },
  { category: 'leisure', text: 'cinema', amount: 17, day: 21 },
  { category: 'shopping', text: 'clothes', amount: 59.9, day: 18 },
  { category: 'groceries', text: 'supermarket', amount: 84.35, day: 3 },
  { category: 'groceries', text: 'supermarket', amount: 67.2, day: 10 },
  { category: 'groceries', text: 'supermarket', amount: 91.1, day: 17 },
  { category: 'groceries', text: 'supermarket', amount: 72.65, day: 24 },
  { category: 'transport', text: 'fuel', amount: 55, day: 12 },
]

// Textos da interface usados para encontrar o que mostrar em cada ecrã.
function uiText(locale: Locale) {
  const j = JSON.parse(readFileSync(`i18n/locales/${locale}.json`, 'utf8'))
  return { balance: j.dashboard.kpiBalance as string, monthly: j.stats.chartMonthlyTitle as string, returnPct: j.investment.summary.returnPct as string }
}

function escapeRegex(v: string) {
  return v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

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

for (const locale of LOCALES) {
test.describe(`capturas ${locale}`, () => {
test.use({ locale })
test(`capturas de ecrã da Play Store (${locale})`, async ({ page, context, browser }) => {
  mkdirSync(`${OUT}/${locale}`, { recursive: true })
  await context.addCookies([
    { name: 'financeflow_locale', value: locale, url: BASE },
    { name: 'financeflow_locale_source', value: 'user', url: BASE },
  ])
  const text = TEXT[locale]

  // Aparece na barra lateral dos ecrãs largos; a BD é nova a cada execução.
  const email = `ana-${locale.toLowerCase()}@exemplo.pt`
  const register = await page.request.post(`${BASE}/api/auth/session`, {
    data: { action: 'register', email, password: randomUUID(), name: 'Ana', acceptTerms: true },
  })
  expect(register.ok()).toBeTruthy()
  await page.request.post(`${CONTROL}/__e2e/set-tier`, { data: { email, tier: 'premium' } })

  // Categorias criadas no registo, na língua da conta; encontradas pela ordem.
  const categories = (await (await page.request.get(`${BASE}/api/categories`)).json()) as { _id: string; name: string; order: number }[]
  const idOf = (key: CategoryKey) => categories.find((c) => c.order === CATEGORY_ORDER.indexOf(key) + 1)!._id

  const txs: Record<string, unknown>[] = []
  for (let m = 5; m >= 0; m--) {
    txs.push({ type: 'income', amount: 1850, description: text.salary, categoryId: idOf('salary'), date: dateFor(m, 25) })
    if (m % 2 === 0) {
      txs.push({ type: 'income', amount: 180 + m * 15, description: text.extra, categoryId: idOf('otherIncome'), date: dateFor(m, 15) })
    }
    for (const t of MONTHLY) {
      // Pequena variação mês a mês para os gráficos não ficarem planos.
      const amount = Math.round(t.amount * (0.9 + ((m * 7 + t.day) % 5) * 0.05) * 100) / 100
      txs.push({ type: 'expense', amount, description: text[t.text], categoryId: idOf(t.category), date: dateFor(m, t.day) })
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

  const names = INVESTMENT_NAMES[locale]
  const investments = [
    { name: names[0], assetClass: 'etf', initialAmount: 3000, reinforcement: 1200, currentValue: 4710 },
    { name: names[1], assetClass: 'obrigacoes', initialAmount: 2000, reinforcement: 0, currentValue: 2086 },
    { name: names[2], assetClass: 'deposito', initialAmount: 1500, reinforcement: 0, currentValue: 1531 },
    { name: names[3], assetClass: 'fundo', initialAmount: 1000, reinforcement: 600, currentValue: 1742 },
  ]
  for (const inv of investments) {
    const res = await page.request.post(`${BASE}/api/investments`, { data: { ...inv, initialDate: dateFor(11, 10) } })
    expect(res.ok()).toBeTruthy()
  }

  const storageState = await context.storageState()
  for (const device of DEVICES) {
    await captureDevice(browser, storageState, device, locale)
  }
})
})
}

async function captureDevice(
  browser: Browser,
  storageState: Awaited<ReturnType<import('@playwright/test').BrowserContext['storageState']>>,
  device: (typeof DEVICES)[number],
  locale: Locale
) {
  const ui = uiText(locale)
  const text = TEXT[locale]
  const context = await browser.newContext({
    storageState,
    locale,
    viewport: device.viewport,
    deviceScaleFactor: device.deviceScaleFactor,
    isMobile: device.isMobile,
    hasTouch: device.isMobile,
  })
  const page = await context.newPage()
  const prefix = `${locale}/${device.name}`

  await page.goto(`${BASE}/`)
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 120_000 })
  // exact + visible: a barra lateral (escondida no telemóvel) também diz "Saldo total".
  // Nos ecrãs largos o topo já mostra os KPIs; deslizar cortava a saudação.
  if (device.isMobile && device.viewport.height > device.viewport.width) {
    await scrollTo(page, page.getByText(ui.balance, { exact: true }).filter({ visible: true }).first(), 200)
  }
  await shot(page, `${prefix}-1-painel`)

  await page.goto(`${BASE}/transactions`)
  const rowNames = ['salary', 'rent', 'supermarket', 'fuel', 'cinema', 'clothes', 'dinner'].map((k) => escapeRegex(text[k]))
  const firstRow = page.getByText(new RegExp(`^(${rowNames.join('|')})$`)).filter({ visible: true }).first()
  await expect(firstRow).toBeVisible({ timeout: 120_000 })
  await scrollTo(page, firstRow, 190)
  await shot(page, `${prefix}-2-transacoes`)

  await page.goto(`${BASE}/stats`)
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 120_000 })
  await scrollTo(page, page.getByText(ui.monthly, { exact: true }).filter({ visible: true }).first(), 150)
  await shot(page, `${prefix}-3-estatisticas`)

  await page.goto(`${BASE}/investimento`)
  // O nome das posições aparece também numa tabela escondida no telemóvel —
  // espera pelos totais, que são o topo da captura.
  await expect(page.getByText(ui.returnPct).first()).toBeVisible({ timeout: 120_000 })
  await shot(page, `${prefix}-4-investimentos`)
  await context.close()
}
