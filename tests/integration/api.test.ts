import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { setup, fetch } from '@nuxt/test-utils/e2e'
import mongoose from 'mongoose'
import { readTestEnv, stubClient, extractCookies, TEST_PASSWORD, WRONG_PASSWORD } from './testHelpers'
import { encodeMerchantKey } from '../../server/utils/easypay'
import { User, Category, Transaction, TransactionGroup, Investment, GooglePlayTransaction } from '../../server/models/index'
import { DEFAULT_CATEGORY_COUNT } from '../../server/utils/defaultCategories'

function anthropicTextResponse(data: unknown) {
  return { content: [{ type: 'text', text: JSON.stringify(data) }], usage: { input_tokens: 1, output_tokens: 1 } }
}

// Fase 8, ponto 6 — testes de integração: servidor Nuxt/Nitro REAL (via
// @nuxt/test-utils), MongoDB em memória (nunca o Atlas), Anthropic/EasyPay
// simulados (nunca chamadas reais — ver tests/integration/stubProviders.ts).
// Um único `setup()` para todo o ficheiro: arrancar o servidor demora
// dezenas de segundos nesta máquina (visto ao longo desta sessão com o dev
// server real), por isso um servidor por ficheiro de teste, não por caso.
const env = readTestEnv()
const stub = stubClient(env.STUB_PROVIDERS_URL)

await setup({
  server: true,
  // Modo dev: compila as rotas por pedido em vez de empacotar tudo à
  // partida — visto ao longo desta sessão que um build de produção completo
  // (Sentry, TF.js, i18n, PWA) demora vários minutos nesta máquina, mais do
  // que o razoável só para arrancar o servidor de testes.
  dev: true,
  env: { ...env, SENTRY_DSN: '', NODE_ENV: 'test' },
  setupTimeout: 600_000,
  nuxtConfig: { devtools: { enabled: false } },
})

// Ligação direta à MESMA base de dados em memória, só para o teste preparar
// estado (ex. promover um utilizador a Premium) e verificar o resultado —
// nunca para contornar os endpoints que estão a ser testados.
beforeAll(async () => {
  await mongoose.connect(env.MONGODB_URI, { dbName: 'financeflow' })
})
afterAll(async () => {
  await mongoose.disconnect()
})
beforeEach(async () => {
  await stub.reset()
})

let uniqueCounter = 0
function uniqueEmail(label: string) {
  uniqueCounter += 1
  return `${label}-${Date.now()}-${uniqueCounter}@example.com`
}

// Cada "utilizador" de teste usa um X-Forwarded-For diferente — o limitador
// de registo/login é por IP (server/utils/rateLimit.ts), e a suite cria mais
// contas do que o limite permitiria a partir de uma única origem. Isto é o
// equivalente de teste a "cada conta é uma pessoa diferente"; não é preciso
// nem correto abrandar o limitador em si só para os testes passarem.
function fakeIpFor(email: string): string {
  return `10.${[...email].reduce((a, c) => (a + c.charCodeAt(0)) % 250, 1)}.0.1`
}

async function register(email: string, opts: { acceptTerms?: boolean } = { acceptTerms: true }) {
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': fakeIpFor(email) },
    body: JSON.stringify({ action: 'register', email, password: TEST_PASSWORD, name: 'Test User', ...opts }),
  })
  const body = await res.json().catch(() => null)
  return { status: res.status, body, cookie: extractCookies(res.headers.get('set-cookie')) }
}

async function login(email: string, password: string) {
  return fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': fakeIpFor(email) },
    body: JSON.stringify({ action: 'login', email, password }),
  })
}

async function setTier(email: string, tier: 'free' | 'pro' | 'premium') {
  await User.updateOne(
    { email },
    {
      $set: {
        'subscription.tier': tier,
        'subscription.status': 'active',
        'subscription.provider': tier === 'free' ? 'none' : 'easypay',
        'subscription.billingMode': tier === 'free' ? 'none' : 'auto',
        'subscription.currentPeriodEnd': tier === 'free' ? null : new Date(Date.now() + 30 * 864e5),
      },
    }
  )
}

describe('auth', () => {
  it('regista uma conta nova e devolve uma sessão', async () => {
    const email = uniqueEmail('register')
    const { status, body, cookie } = await register(email)
    expect(status).toBe(200)
    expect(body.user.email).toBe(email)
    expect(body.user.twoFactorEnabled).toBe(false)
    expect(cookie).toContain('session=')
  })

  it('recusa registo sem aceitar os termos', async () => {
    const email = uniqueEmail('noterms')
    const { status, body } = await register(email, { acceptTerms: false })
    expect(status).toBe(400)
    expect(body.message).toMatch(/terms|termos/i)
  })

  it('recusa um segundo registo com o mesmo email (409)', async () => {
    const email = uniqueEmail('dup')
    await register(email)
    const { status } = await register(email)
    expect(status).toBe(409)
  })

  it('recusa login com password errada (401) e aceita com a certa (200)', async () => {
    const email = uniqueEmail('login')
    await register(email)
    const wrong = await login(email, WRONG_PASSWORD)
    expect(wrong.status).toBe(401)

    const right = await login(email, TEST_PASSWORD)
    expect(right.status).toBe(200)
  })

  it('GET /api/auth/session funciona já no PRIMEIRO pedido ao servidor (00-db.ts não pode dar 500 com a base de dados ainda a ligar)', async () => {
    // Não é uma prova de "arranque a frio" isolada (o servidor de teste já
    // correu outros pedidos antes deste ficheiro), mas cobre o mesmo caminho
    // de código: cada pedido passa por `ensureDb()` antes da rota.
    const res = await fetch('/api/auth/session')
    expect(res.status).toBe(200)
  })
})

describe('transações', () => {
  it('cria uma transação e respeita o teto de 50/mês do plano Gratuito', async () => {
    const email = uniqueEmail('tx')
    const { cookie } = await register(email)
    const user = await User.findOne({ email })

    const catRes = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ name: 'Categoria Teste', type: 'expense' }),
    })
    expect(catRes.status).toBe(200)
    const category = await catRes.json()

    const createTx = () =>
      fetch('/api/transactions', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie },
        body: JSON.stringify({ type: 'expense', amount: 10, description: 'Teste', categoryId: category._id, date: new Date().toISOString() }),
      })

    const first = await createTx()
    expect(first.status).toBe(200)

    // Semeia diretamente as restantes 49 (até ao teto) para não fazer 49
    // pedidos HTTP sequenciais só para chegar ao limite.
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const seeded = Array.from({ length: 49 }, (_, i) => ({
      userId: user!._id,
      type: 'expense',
      amount: 1,
      description: `seed-${i}`,
      categoryId: category._id,
      date: new Date(),
      tags: [],
      recurrence: 'none',
      currency: 'EUR',
      originalAmount: null,
      exchangeRate: null,
      createdAt: new Date(Math.max(startOfMonth.getTime(), Date.now() - 1000)),
      updatedAt: new Date(),
    }))
    await Transaction.insertMany(seeded)

    const count = await Transaction.countDocuments({ userId: user!._id })
    expect(count).toBe(50)

    const blocked = await createTx()
    expect(blocked.status).toBe(403)
    const blockedBody = await blocked.json()
    expect(blockedBody.data?.error).toBe('feature_locked')
  })

  it('filtros inválidos na listagem caem no default em vez de dar 500 ou devolver tudo', async () => {
    const email = uniqueEmail('txlist')
    const { cookie } = await register(email)
    const user = await User.findOne({ email })
    const category = await Category.findOne({ userId: user!._id, type: 'expense' })
    await Transaction.insertMany(
      Array.from({ length: 25 }, (_, i) => ({
        userId: user!._id,
        type: 'expense',
        amount: 1,
        description: i === 0 ? 'Café (manhã)' : `linha-${i}`,
        categoryId: category!._id,
        date: new Date(),
        tags: [],
        recurrence: 'none',
        currency: 'EUR',
      }))
    )

    // `limit=0` era `.limit(0)` no Mongo = sem limite.
    const zero = await fetch('/api/transactions?limit=0', { headers: { cookie } })
    expect(zero.status).toBe(200)
    expect((await zero.json()).data).toHaveLength(20)

    // Pesquisa com caracteres especiais de regex é literal, não uma regex.
    const paren = await fetch(`/api/transactions?search=${encodeURIComponent('(manhã)')}`, { headers: { cookie } })
    expect(paren.status).toBe(200)
    expect((await paren.json()).data.map((t: any) => t.description)).toEqual(['Café (manhã)'])

    const bad = await fetch('/api/transactions?categoryId=nao-e-um-id&sortBy=passwordHash&page=abc', { headers: { cookie } })
    expect(bad.status).toBe(200)
  })
})

describe('categorias e orçamento inicial', () => {
  it('uma conta nova recebe só categorias genéricas, no idioma do registo, sem grupos nem limites', async () => {
    const email = uniqueEmail('seed-pt')
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': fakeIpFor(email), cookie: 'financeflow_locale=pt-PT' },
      // `tier` forjado no corpo tem de ser ignorado — a conta nasce sempre no Gratuito.
      body: JSON.stringify({ action: 'register', email, password: TEST_PASSWORD, name: 'Teste', acceptTerms: true, tier: 'premium' }),
    })
    expect(res.status).toBe(200)
    const user = await User.findOne({ email })
    expect(user!.subscription.tier).toBe('free')
    expect(user!.subscription.provider).toBe('none')
    const sub = await fetch('/api/subscription', { headers: { cookie: extractCookies(res.headers.get('set-cookie')) } })
    expect((await sub.json()).subscription.tier).toBe('free')
    const cats = await Category.find({ userId: user!._id }).lean()
    expect(cats).toHaveLength(DEFAULT_CATEGORY_COUNT)
    expect(cats.every((c: any) => c.isDefault && !c.groupId && !c.monthlyLimit)).toBe(true)
    expect(cats.map((c: any) => c.name)).toContain('Salário')
    expect(await TransactionGroup.countDocuments({ userId: user!._id })).toBe(0)
  })

  it('o registo cria as categorias por omissão, e um login não recria as que o utilizador apagou', async () => {
    const email = uniqueEmail('seed')
    const { cookie } = await register(email)
    const user = await User.findOne({ email })
    const initial = await Category.countDocuments({ userId: user!._id })
    expect(initial).toBe(DEFAULT_CATEGORY_COUNT)
    expect(await Category.exists({ userId: user!._id, name: 'Salary' })).toBeTruthy()

    const one = await Category.findOne({ userId: user!._id, isDefault: true })
    await Category.deleteOne({ _id: one!._id })
    await login(email, TEST_PASSWORD)
    await fetch('/api/auth/session', { headers: { cookie } })
    expect(await Category.countDocuments({ userId: user!._id })).toBe(initial - 1)
  })

  it('nomes com caracteres de regex não rebentam nem colidem por engano', async () => {
    const email = uniqueEmail('catregex')
    const { cookie } = await register(email)
    // Pro: o Gratuito só permite 2 categorias próprias e este teste cria 3.
    await setTier(email, 'pro')
    const create = (name: string) =>
      fetch('/api/categories', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie },
        body: JSON.stringify({ name, type: 'expense' }),
      })
    expect((await create('Casa (2)')).status).toBe(200)
    // Antes `A.c` virava a regex /^A.c$/ e dava "já existe" para `Abc`.
    expect((await create('A.c')).status).toBe(200)
    expect((await create('Abc')).status).toBe(200)
  })
})

describe('rate limiting', () => {
  it('um X-Forwarded-For forjado pelo cliente não contorna o limite de login', async () => {
    const email = uniqueEmail('ratelimit')
    await register(email)
    const attempt = (spoof: string) =>
      fetch('/api/auth/session', {
        method: 'POST',
        // O cliente põe o que quiser à esquerda; o proxy acrescenta o IP real à direita.
        headers: { 'content-type': 'application/json', 'x-forwarded-for': `${spoof}, ${fakeIpFor(email)}` },
        body: JSON.stringify({ action: 'login', email, password: WRONG_PASSWORD }),
      })

    const statuses: number[] = []
    for (let i = 0; i < 9; i++) statuses.push((await attempt(`203.0.113.${i}`)).status)
    expect(statuses.slice(0, 8).every((s) => s === 401)).toBe(true)
    expect(statuses[8]).toBe(429)
  })
})

describe('/api/investments', () => {
  it('devolve 403 para um utilizador do plano Gratuito', async () => {
    const email = uniqueEmail('inv-free')
    const { cookie } = await register(email)
    const res = await fetch('/api/investments', { headers: { cookie } })
    expect(res.status).toBe(403)
  })

  it('CRUD completo para Premium; um _id de outro utilizador dá 404, nunca 403', async () => {
    const emailA = uniqueEmail('inv-a')
    const emailB = uniqueEmail('inv-b')
    const a = await register(emailA)
    const b = await register(emailB)
    await setTier(emailA, 'premium')
    await setTier(emailB, 'premium')

    const create = await fetch('/api/investments', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: a.cookie },
      body: JSON.stringify({ name: 'ETF Teste', assetClass: 'etf', initialAmount: 1000, initialDate: '2026-01-01', reinforcement: 0, currentValue: 1050 }),
    })
    expect(create.status).toBe(200)
    const investment = await create.json()
    const initialValueUpdatedAt = investment.valueUpdatedAt

    // B tenta aceder ao investimento de A pelo _id — 404, nunca 403 (não
    // confirma sequer que o registo existe para outra conta).
    const getAsB = await fetch(`/api/investments/${investment._id}`, { headers: { cookie: b.cookie } })
    expect(getAsB.status).toBe(404)
    const putAsB = await fetch(`/api/investments/${investment._id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie: b.cookie },
      body: JSON.stringify({ name: 'Roubado' }),
    })
    expect(putAsB.status).toBe(404)

    // A edita só o nome — valueUpdatedAt NÃO muda (regra: só muda quando a
    // Situação/currentValue muda).
    const renamed = await fetch(`/api/investments/${investment._id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie: a.cookie },
      body: JSON.stringify({ name: 'ETF Renomeado' }),
    })
    expect(renamed.status).toBe(200)
    const renamedBody = await renamed.json()
    expect(renamedBody.valueUpdatedAt).toBe(initialValueUpdatedAt)

    // A atualiza a Situação — valueUpdatedAt MUDA.
    const revalued = await fetch(`/api/investments/${investment._id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie: a.cookie },
      body: JSON.stringify({ currentValue: 1200 }),
    })
    expect(revalued.status).toBe(200)
    const revaluedBody = await revalued.json()
    expect(revaluedBody.valueUpdatedAt).not.toBe(initialValueUpdatedAt)

    const del = await fetch(`/api/investments/${investment._id}`, { method: 'DELETE', headers: { cookie: a.cookie } })
    expect(del.status).toBe(200)
  })

  it('valida os campos (valor negativo é rejeitado)', async () => {
    const email = uniqueEmail('inv-invalid')
    const { cookie } = await register(email)
    await setTier(email, 'premium')

    const res = await fetch('/api/investments', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ name: 'Inválido', initialAmount: -10, initialDate: '2026-01-01', currentValue: 100 }),
    })
    expect(res.status).toBe(400)
  })

  it('teto de 100 posições por utilizador', async () => {
    const email = uniqueEmail('inv-cap')
    const { cookie } = await register(email)
    await setTier(email, 'premium')
    const user = await User.findOne({ email })

    const seeded = Array.from({ length: 100 }, (_, i) => ({
      userId: user!._id,
      name: `Posição ${i}`,
      initialAmount: 100,
      initialDate: new Date('2026-01-01'),
      reinforcement: 0,
      currentValue: 100,
      valueUpdatedAt: new Date(),
    }))
    await Investment.insertMany(seeded)

    const res = await fetch('/api/investments', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ name: 'Posição 101', initialAmount: 100, initialDate: '2026-01-01', reinforcement: 0, currentValue: 100 }),
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.data?.error).toBe('investment_limit')
  })
})

describe('subscrição — checkout e webhook EasyPay (simulados)', () => {
  it('cria o checkout e o webhook subscription_create ativa o plano de forma idempotente', async () => {
    const email = uniqueEmail('sub')
    const { cookie } = await register(email)
    const user = await User.findOne({ email })

    await stub.setEasyPayResponse('POST', '/checkout', { id: 'checkout-teste-1', session: 'sess-1', config: {} })

    const checkoutRes = await fetch('/api/subscription/easypay/create-subscription', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ tier: 'pro', method: 'cc' }),
    })
    expect(checkoutRes.status).toBe(200)

    const key = encodeMerchantKey(String(user!._id), 'pro', 'cc')
    await stub.setEasyPayResponse('GET', '/subscription/sub-webhook-teste-1', { id: 'sub-webhook-teste-1', status: 'active', key })

    const webhook1 = await fetch('/api/subscription/easypay/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: 'sub-webhook-teste-1', type: 'subscription_create' }),
    })
    expect(webhook1.status).toBe(200)

    const afterFirst = await User.findOne({ email })
    expect(afterFirst!.subscription.tier).toBe('pro')
    expect(afterFirst!.subscription.status).toBe('active')
    const periodEndAfterFirst = afterFirst!.subscription.currentPeriodEnd?.getTime()

    // Reenvio do mesmo evento (a EasyPay pode reentregar) — idempotente: o
    // período pago não deve avançar uma segunda vez.
    const webhook2 = await fetch('/api/subscription/easypay/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: 'sub-webhook-teste-1', type: 'subscription_create' }),
    })
    expect(webhook2.status).toBe(200)

    const afterSecond = await User.findOne({ email })
    expect(afterSecond!.subscription.currentPeriodEnd?.getTime()).toBe(periodEndAfterFirst)
  })

  it('um webhook forjado com "status: success" no corpo mas um id que a EasyPay não reconhece nunca ativa nada', async () => {
    const email = uniqueEmail('sub-forged')
    await register(email)
    // Sem configurar resposta para este id no stub — a verificação (GET de
    // volta à API) falha, como aconteceria com a EasyPay real perante um id
    // inventado; o `status: 'success'` no corpo do pedido é ignorado de
    // propósito (nunca é fonte de verdade). O handler responde 500 (para a
    // EasyPay reentregar, ver server/utils/logger.ts) — o que importa aqui é
    // que a conta nunca fica com um plano pago sem uma verificação real.
    const res = await fetch('/api/subscription/easypay/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: 'id-forjado-inventado', type: 'subscription_create', status: 'success' }),
    })
    expect(res.status).toBe(500)
    const user = await User.findOne({ email })
    expect(user!.subscription.tier).toBe('free')
  })

  it('webhook "capture" (MB WAY/Multibanco) ativa o plano pré-pago de forma idempotente', async () => {
    const email = uniqueEmail('capture')
    await register(email)
    const user = await User.findOne({ email })

    // Estado imediatamente a seguir ao onSuccess do Checkout SDK
    // (syncFromCheckout → syncSinglePayment em server/utils/subscriptionSync.ts)
    // para um MB WAY ainda não confirmado pelo push assíncrono: já tem
    // billingMode/paymentMethod definidos, mas status ainda 'pending'.
    const paymentId = 'mbway-payment-teste-1'
    await User.updateOne(
      { email },
      {
        $set: {
          'subscription.tier': 'pro',
          'subscription.status': 'pending',
          'subscription.provider': 'easypay',
          'subscription.paymentMethod': 'mbway',
          'subscription.billingMode': 'push_confirm',
          'subscription.autoRenew': false,
          'subscription.easypaySubscriptionId': paymentId,
          'subscription.currentPeriodEnd': new Date(Date.now() + 30 * 864e5),
        },
      }
    )

    const key = encodeMerchantKey(String(user!._id), 'pro', 'mbway', 1)
    await stub.setEasyPayResponse('GET', `/single/${paymentId}`, {
      id: paymentId,
      status: 'success',
      key,
      method: { type: 'MBW', status: 'success' },
    })

    const webhook1 = await fetch('/api/subscription/easypay/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: paymentId, type: 'capture' }),
    })
    expect(webhook1.status).toBe(200)

    const afterFirst = await User.findOne({ email })
    expect(afterFirst!.subscription.status).toBe('active')
    expect(afterFirst!.subscription.tier).toBe('pro')
    expect(afterFirst!.subscription.paymentMethod).toBe('mbway')
    const periodEndAfterFirst = afterFirst!.subscription.currentPeriodEnd?.getTime()

    // Reenvio do mesmo evento — idempotente, tal como o subscription_create.
    const webhook2 = await fetch('/api/subscription/easypay/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: paymentId, type: 'capture' }),
    })
    expect(webhook2.status).toBe(200)
    const afterSecond = await User.findOne({ email })
    expect(afterSecond!.subscription.currentPeriodEnd?.getTime()).toBe(periodEndAfterFirst)
  })

  it('webhook "capture" com falha só rebaixa a conta se o id bater com o pagamento em curso (não uma notificação tardia de um pagamento antigo)', async () => {
    const email = uniqueEmail('capture-fail')
    await register(email)
    const user = await User.findOne({ email })

    const oldPaymentId = 'multibanco-antigo-1'
    const currentPaymentId = 'multibanco-atual-1'
    // A conta já está ativa através de um pagamento MAIS RECENTE que o que
    // vai falhar agora — simula uma notificação de falha tardia e obsoleta.
    await User.updateOne(
      { email },
      {
        $set: {
          'subscription.tier': 'premium',
          'subscription.status': 'active',
          'subscription.provider': 'easypay',
          'subscription.paymentMethod': 'multibanco',
          'subscription.billingMode': 'manual_reference',
          'subscription.autoRenew': false,
          'subscription.easypaySubscriptionId': currentPaymentId,
          'subscription.currentPeriodEnd': new Date(Date.now() + 30 * 864e5),
          'subscription.appliedPaymentIds': [oldPaymentId, currentPaymentId],
        },
      }
    )

    const key = encodeMerchantKey(String(user!._id), 'premium', 'multibanco', 1)
    await stub.setEasyPayResponse('GET', `/single/${oldPaymentId}`, {
      id: oldPaymentId,
      status: 'failed',
      key,
    })

    const res = await fetch('/api/subscription/easypay/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: oldPaymentId, type: 'capture' }),
    })
    expect(res.status).toBe(200)

    const after = await User.findOne({ email })
    expect(after!.subscription.status).toBe('active')
    expect(after!.subscription.easypaySubscriptionId).toBe(currentPaymentId)
  })
})

describe('insights de IA (Anthropic simulada)', () => {
  it('POST /api/insights/stats gera com a IA e depois serve da cache de 24h sem chamar a Anthropic outra vez', async () => {
    const email = uniqueEmail('ai-stats')
    const { cookie } = await register(email)
    await setTier(email, 'pro')

    await stub.setAnthropicResponse(
      anthropicTextResponse({ insights: ['Gastas mais em restauração ao fim de semana.'], suggestions: ['Define um orçamento mensal para restauração.'] })
    )

    const first = await fetch('/api/insights/stats', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ months: 3 }),
    })
    expect(first.status).toBe(200)
    const firstBody = await first.json()
    expect(firstBody.cached).toBe(false)
    expect(firstBody.insights).toEqual(['Gastas mais em restauração ao fim de semana.'])
    expect(firstBody.suggestions).toEqual(['Define um orçamento mensal para restauração.'])

    const requestsAfterFirst = await stub.requests()
    const anthropicCallsAfterFirst = requestsAfterFirst.filter((r) => r.path === '/v1/messages').length
    expect(anthropicCallsAfterFirst).toBe(1)

    const second = await fetch('/api/insights/stats', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ months: 3 }),
    })
    expect(second.status).toBe(200)
    const secondBody = await second.json()
    expect(secondBody.cached).toBe(true)
    expect(secondBody.insights).toEqual(firstBody.insights)

    const requestsAfterSecond = await stub.requests()
    const anthropicCallsAfterSecond = requestsAfterSecond.filter((r) => r.path === '/v1/messages').length
    expect(anthropicCallsAfterSecond).toBe(1)
  })

  it('POST /api/insights/investment devolve needsProfile sem perfil, e as dicas depois de o perfil existir', async () => {
    const email = uniqueEmail('ai-invest')
    const { cookie } = await register(email)
    await setTier(email, 'premium')

    const withoutProfile = await fetch('/api/insights/investment', { method: 'POST', headers: { cookie } })
    expect(withoutProfile.status).toBe(200)
    const withoutProfileBody = await withoutProfile.json()
    expect(withoutProfileBody.needsProfile).toBe(true)

    await User.updateOne(
      { email },
      {
        $set: {
          investorProfile: {
            riskTolerance: 'moderado',
            horizonYears: 10,
            hasExistingInvestments: false,
            knowledgeLevel: 'intermedio',
            goals: ['reforma'],
            updatedAt: new Date(),
          },
        },
      }
    )

    await stub.setAnthropicResponse(anthropicTextResponse({ tips: ['Considera um fundo de emergência antes de investir mais.'] }))

    const withProfile = await fetch('/api/insights/investment', { method: 'POST', headers: { cookie } })
    expect(withProfile.status).toBe(200)
    const withProfileBody = await withProfile.json()
    expect(withProfileBody.needsProfile).toBe(false)
    expect(withProfileBody.tips).toEqual(['Considera um fundo de emergência antes de investir mais.'])
    expect(typeof withProfileBody.disclaimer).toBe('string')
    expect(withProfileBody.disclaimer.length).toBeGreaterThan(0)
  })

  it('POST /api/insights/stats e /api/insights/investment devolvem 403 para o plano Gratuito', async () => {
    const email = uniqueEmail('ai-free')
    const { cookie } = await register(email)

    const stats = await fetch('/api/insights/stats', { method: 'POST', headers: { cookie } })
    expect(stats.status).toBe(403)

    const investment = await fetch('/api/insights/investment', { method: 'POST', headers: { cookie } })
    expect(investment.status).toBe(403)
  })
})

describe('reembolso por livre resolução — eliminação + bloqueio de 6 meses', () => {
  it('recusa sem o segredo de admin, apaga a conta com o segredo certo, e bloqueia um novo registo com o mesmo email', async () => {
    const email = uniqueEmail('refund')
    await register(email)

    const noSecret = await fetch('/api/admin/refund-delete', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    expect(noSecret.status).toBe(401)

    const wrongSecret = await fetch('/api/admin/refund-delete', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-admin-secret': 'not-the-real-secret' },
      body: JSON.stringify({ email }),
    })
    expect(wrongSecret.status).toBe(401)

    const userBefore = await User.findOne({ email })
    expect(userBefore).not.toBeNull()

    const ok = await fetch('/api/admin/refund-delete', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-admin-secret': env.ADMIN_SECRET },
      body: JSON.stringify({ email }),
    })
    expect(ok.status).toBe(200)

    const userAfter = await User.findOne({ email })
    expect(userAfter).toBeNull()

    // Tentar registar de novo com o mesmo email, dentro dos 6 meses — recusado.
    const { status, body } = await register(email)
    expect(status).toBe(403)
    expect(body.message).toMatch(/reembols|refund/i)
  })
})

describe('Google Play — alternative billing only (compras na app Android)', () => {
  const TOKEN = 'token-da-play-billing-library'

  async function startAndroidCheckout(cookie: string, checkoutId: string, body: Record<string, unknown>, path = 'create-subscription') {
    await stub.setEasyPayResponse('POST', '/checkout', { id: checkoutId, session: 'sess', config: {} })
    const res = await fetch(`/api/subscription/easypay/${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ ...body, googlePlayToken: TOKEN }),
    })
    expect(res.status).toBe(200)
  }

  const googleReports = async () =>
    (await stub.requests()).filter((r) => r.path.startsWith('/androidpublisher/') && r.method === 'POST')

  it('uma subscrição por cartão feita na app é reportada à Google com o token, e a renovação na mesma série', async () => {
    const email = uniqueEmail('gp-cc')
    const { cookie } = await register(email)
    const user = await User.findOne({ email })
    const key = encodeMerchantKey(String(user!._id), 'pro', 'cc')

    await startAndroidCheckout(cookie, 'chk-gp-cc', { tier: 'pro', method: 'cc' })
    const awaiting = await GooglePlayTransaction.findOne({ checkoutId: 'chk-gp-cc' })
    expect(awaiting?.status).toBe('awaiting_payment')

    await stub.setEasyPayResponse('GET', '/checkout/chk-gp-cc', { id: 'chk-gp-cc', payment: { id: 'pay-gp-cc', status: 'success', key } })
    const confirm = await fetch('/api/subscription/easypay/confirm', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ checkoutId: 'chk-gp-cc' }),
    })
    expect(confirm.status).toBe(200)

    const [initial] = await googleReports()
    expect(initial.path).toBe('/androidpublisher/v3/applications/com.financeflow.app/externalTransactions')
    expect(initial.query).toBe('externalTransactionId=ff-pay-gp-cc')
    expect(initial.authorization).toBe('Bearer stub-google-token')
    expect(initial.body.recurringTransaction).toEqual({
      externalTransactionToken: TOKEN,
      externalSubscription: { subscriptionType: 'RECURRING' },
    })
    // 5,00 € (Pro), IVA 0 (isenção, BILLING_VAT_RATE por omissão), país desconhecido em teste → PT.
    expect(initial.body.originalPreTaxAmount).toEqual({ currency: 'EUR', priceMicros: '5000000' })
    expect(initial.body.originalTaxAmount).toEqual({ currency: 'EUR', priceMicros: '0' })
    expect(initial.body.userTaxAddress).toEqual({ regionCode: 'PT' })
    expect((await GooglePlayTransaction.findOne({ paymentId: 'pay-gp-cc' }))?.status).toBe('reported')

    // Renovação um mês depois, pelo webhook da EasyPay.
    await GooglePlayTransaction.updateOne({ paymentId: 'pay-gp-cc' }, { transactionTime: new Date(Date.now() - 31 * 864e5) })
    await stub.setEasyPayResponse('GET', '/single/renov-gp-cc', { id: 'renov-gp-cc', status: 'success', key })
    const webhook = await fetch('/api/subscription/easypay/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: 'renov-gp-cc', type: 'subscription_capture' }),
    })
    expect(webhook.status).toBe(200)

    const reports = await googleReports()
    expect(reports).toHaveLength(2)
    expect(reports[1].query).toBe('externalTransactionId=ff-renov-gp-cc')
    expect(reports[1].body.recurringTransaction).toEqual({
      initialExternalTransactionId: 'ff-pay-gp-cc',
      externalSubscription: { subscriptionType: 'RECURRING' },
    })
  })

  it('MB WAY pré-pago feito na app é reportado como PREPAID pelo valor do período', async () => {
    const email = uniqueEmail('gp-mbway')
    const { cookie } = await register(email)
    const user = await User.findOne({ email })
    const key = encodeMerchantKey(String(user!._id), 'premium', 'mbway', 3)

    // Sem GeoLite2 nem Netlify em teste o país é desconhecido e o servidor
    // recusa métodos pré-pagos — o documento de espera cria-se diretamente,
    // como faria o create-prepaid para um utilizador em Portugal.
    await GooglePlayTransaction.create({
      userId: user!._id, kind: 'initial', status: 'awaiting_payment', token: TOKEN, checkoutId: 'chk-gp-mbw',
      tier: 'premium', method: 'mbway', periodMonths: 3, amountCents: 3897, regionCode: 'PT',
    })
    await stub.setEasyPayResponse('GET', '/checkout/chk-gp-mbw', { id: 'chk-gp-mbw', payment: { id: 'pay-gp-mbw', status: 'success', key } })
    await stub.setEasyPayResponse('GET', '/single/pay-gp-mbw', { id: 'pay-gp-mbw', status: 'paid', key })
    const confirm = await fetch('/api/subscription/easypay/confirm', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ checkoutId: 'chk-gp-mbw' }),
    })
    expect(confirm.status).toBe(200)

    const [report] = await googleReports()
    expect(report.body.recurringTransaction.externalSubscription).toEqual({ subscriptionType: 'PREPAID' })
    expect(report.body.originalPreTaxAmount.priceMicros).toBe('38970000')
  })

  it('uma compra feita no site (sem token) não é reportada à Google', async () => {
    const email = uniqueEmail('gp-web')
    const { cookie } = await register(email)
    const user = await User.findOne({ email })
    const key = encodeMerchantKey(String(user!._id), 'pro', 'cc')

    await stub.setEasyPayResponse('POST', '/checkout', { id: 'chk-gp-web', session: 'sess', config: {} })
    await fetch('/api/subscription/easypay/create-subscription', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ tier: 'pro', method: 'cc' }),
    })
    await stub.setEasyPayResponse('GET', '/checkout/chk-gp-web', { id: 'chk-gp-web', payment: { id: 'pay-gp-web', status: 'success', key } })
    await fetch('/api/subscription/easypay/confirm', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ checkoutId: 'chk-gp-web' }),
    })

    expect((await User.findOne({ email }))!.subscription.tier).toBe('pro')
    expect(await googleReports()).toHaveLength(0)
    expect(await GooglePlayTransaction.countDocuments({ userId: user!._id })).toBe(0)
  })

  it('o reembolso por livre resolução é reportado à Google para as compras feitas na app', async () => {
    const email = uniqueEmail('gp-refund')
    await register(email)
    const user = await User.findOne({ email })
    await GooglePlayTransaction.create({
      userId: user!._id, kind: 'initial', status: 'reported', token: TOKEN, paymentId: 'pay-gp-refund',
      externalTransactionId: 'ff-pay-gp-refund', tier: 'pro', method: 'cc', periodMonths: 1, amountCents: 500,
      regionCode: 'PT', transactionTime: new Date(Date.now() - 3 * 864e5),
    })

    const res = await fetch('/api/admin/refund-delete', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-admin-secret': env.ADMIN_SECRET },
      body: JSON.stringify({ email }),
    })
    expect(res.status).toBe(200)
    expect((await res.json()).googlePlayRefundsPending).toBe(0)

    const [refund] = await googleReports()
    expect(refund.path).toBe('/androidpublisher/v3/applications/com.financeflow.app/externalTransactions/ff-pay-gp-refund:refund')
    expect(refund.body.fullRefund).toEqual({})
    // O registo de faturação fica, mesmo com a conta apagada.
    expect((await GooglePlayTransaction.findOne({ paymentId: 'pay-gp-refund' }))?.status).toBe('refunded')
  })

  it('se a Google falhar, a transação fica na fila e o cron volta a reportar', async () => {
    const email = uniqueEmail('gp-retry')
    const { cookie } = await register(email)
    const user = await User.findOne({ email })
    const key = encodeMerchantKey(String(user!._id), 'pro', 'cc')

    await startAndroidCheckout(cookie, 'chk-gp-retry', { tier: 'pro', method: 'cc' })
    await stub.setGoogleStatus(503)
    await stub.setEasyPayResponse('GET', '/checkout/chk-gp-retry', { id: 'chk-gp-retry', payment: { id: 'pay-gp-retry', status: 'success', key } })
    const confirm = await fetch('/api/subscription/easypay/confirm', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ checkoutId: 'chk-gp-retry' }),
    })
    // O pagamento é aplicado na mesma — a falha da Google nunca o trava.
    expect(confirm.status).toBe(200)
    expect((await User.findOne({ email }))!.subscription.tier).toBe('pro')
    expect((await GooglePlayTransaction.findOne({ paymentId: 'pay-gp-retry' }))?.status).toBe('pending')

    await stub.setGoogleStatus(200)
    const denied = await fetch('/api/billing/google-play/process-queue', { method: 'POST' })
    expect(denied.status).toBe(401)
    const queue = await fetch('/api/billing/google-play/process-queue', { method: 'POST', headers: { 'x-cron-secret': env.CRON_SECRET } })
    expect(queue.status).toBe(200)
    expect((await GooglePlayTransaction.findOne({ paymentId: 'pay-gp-retry' }))?.status).toBe('reported')
  })
})

