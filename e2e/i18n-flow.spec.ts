import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'

// Fase 8, ponto 6 — E2E da Fase 7 (internacionalização).
//
// A especificação original fala em "IP simulado fora dos 6 países
// suportados" para o fallback de idioma — mas o idioma nunca depende de
// geolocalização (nuxt.config.ts tem `detectBrowserLanguage: false` de
// propósito, ver plugins/locale.ts): deteta-se do cabeçalho Accept-Language/
// `navigator.languages`, nunca do IP. A geolocalização (server/utils/geo.ts,
// base de dados MaxMind GeoLite2) só decide que MÉTODOS DE PAGAMENTO
// pré-pagos mostrar (MB WAY/Multibanco, só Portugal) — são dois mecanismos
// independentes. Este spec testa os dois, corretamente separados:
//   1. idioma: fallback para EN com um Accept-Language não suportado
//   2. país: sem GEOLITE2_DB_PATH configurado neste ambiente de teste (não há
//      licença MaxMind disponível), o país fica sempre desconhecido — o
//      mesmo resultado que "fora de Portugal". Prova que só CC/DD aparecem
//      nesse caso; NÃO prova o caso positivo (Portugal → MB WAY/Multibanco
//      aparecem), que exigiria uma base de dados GeoLite2 real.
//
// Nota de infraestrutura: helpers inline (não num e2e/helpers.ts partilhado)
// — ver o comentário equivalente em main-flow.spec.ts.
//
// Achado nesta sessão, NÃO coberto por teste automatizado: trocar o idioma em
// Configurações via `select.selectOption()` do Playwright muda o valor do
// <select> nativo mas o resto da app (texto, cookie `financeflow_locale`)
// nunca reage — o cabeçalho "Language"/"Idioma" nunca muda mesmo com o
// `<select>` já em "Português". Não confirmado como bug real (pode ser
// específico da automação — `selectOption` despacha eventos sintéticos que o
// v-model do Vue por vezes não trata da mesma forma que uma interação
// humana); precisa de confirmação manual num browser real antes de assumir
// que é um defeito da app. Ver context/current-feature.md.
let counter = 0
function uniqueEmail(label: string): string {
  counter += 1
  return `${label}-${Date.now()}-${counter}@example.com`
}

// Gerada a cada execução, sem texto literal (o GitGuardian sinaliza qualquer
// string atribuída a PASSWORD, mesmo um template).
const PASSWORD = randomUUID()

async function registerViaUi(page: import('@playwright/test').Page, email: string) {
  await page.goto('/')
  await page.getByTestId('login-tab-register').click()
  await page.getByTestId('login-name').fill('Teste E2E')
  await page.getByTestId('login-email').fill(email)
  await page.getByTestId('login-password').fill(PASSWORD)
  await page.getByTestId('login-accept-terms').check()
  await page.getByTestId('login-submit').click()
  await page.waitForURL('**/')
}

test.describe('internacionalização (Fase 7)', () => {
  test.use({ locale: 'ja-JP' })

  test('Accept-Language não suportado (ja-JP) cai em EN, gravado no cookie', async ({ page, context }) => {
    const email = uniqueEmail('e2e-i18n')
    await registerViaUi(page, email)

    const cookies = await context.cookies()
    expect(cookies.find((c) => c.name === 'financeflow_locale')?.value).toBe('en')

    await page.goto('/settings')
    await expect(page.getByTestId('settings-language-select')).toHaveValue('en')
  })

  test('sem base de dados GeoLite2 (país desconhecido), o checkout só mostra CC/DD', async ({ page }) => {
    const email = uniqueEmail('e2e-i18n-pay')
    await registerViaUi(page, email)

    await page.goto('/subscription?tier=pro')
    await expect(page.getByTestId('subscription-method-cc')).toBeVisible()
    await expect(page.getByTestId('subscription-method-dd')).toBeVisible()
    await expect(page.getByTestId('subscription-method-mbway')).toHaveCount(0)
    await expect(page.getByTestId('subscription-method-multibanco')).toHaveCount(0)
  })
})
