/**
 * Cria o produto + os dois planos de subscrição (Pro, Premium) na PayPal
 * Subscriptions API e imprime os IDs a colar em PAYPAL_PLAN_ID_PRO /
 * PAYPAL_PLAN_ID_PREMIUM. Correr uma vez por ambiente (sandbox e, mais
 * tarde, live) — cada ambiente PayPal tem os seus próprios produtos/planos.
 * Uso: node scripts/create-paypal-plans.mjs
 * (lê PAYPAL_ENV/PAYPAL_CLIENT_ID/PAYPAL_CLIENT_SECRET do .env na raiz)
 */
import { readFileSync } from 'node:fs'

function loadEnvFile() {
  try {
    const content = readFileSync(new URL('../.env', import.meta.url), 'utf-8')
    for (const line of content.split('\n')) {
      const match = line.match(/^([A-Z_]+)=(.*)$/)
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim()
    }
  } catch {
    // sem .env — assume-se que as vars já estão no ambiente
  }
}

loadEnvFile()

const API_BASE = process.env.PAYPAL_ENV === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

async function getAccessToken() {
  const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET em falta no .env')
  }
  const res = await fetch(`${API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!res.ok) throw new Error(`Falha na autenticação PayPal: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return data.access_token
}

async function paypalFetch(token, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Erro PayPal em ${path}: ${res.status} ${await res.text()}`)
  return res.json()
}

async function createPlan(token, productId, { name, description, price }) {
  return paypalFetch(token, '/v1/billing/plans', {
    product_id: productId,
    name,
    description,
    billing_cycles: [
      {
        frequency: { interval_unit: 'MONTH', interval_count: 1 },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0, // 0 = sem fim, renova até cancelar
        pricing_scheme: { fixed_price: { value: price, currency_code: 'EUR' } },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee_failure_action: 'CONTINUE',
      payment_failure_threshold: 3,
    },
  })
}

async function main() {
  console.log(`Ambiente PayPal: ${process.env.PAYPAL_ENV || 'sandbox'}`)
  const token = await getAccessToken()

  const product = await paypalFetch(token, '/v1/catalogs/products', {
    name: 'FinanceFlow Subscription',
    description: 'Subscrição FinanceFlow — Pro e Premium',
    type: 'SERVICE',
    category: 'SOFTWARE',
  })
  console.log(`Produto criado: ${product.id}`)

  const pro = await createPlan(token, product.id, {
    name: 'plan_pro_monthly',
    description: 'FinanceFlow Pro — 5,00€/mês',
    price: '5.00',
  })
  console.log(`\nPAYPAL_PLAN_ID_PRO=${pro.id}`)

  const premium = await createPlan(token, product.id, {
    name: 'plan_premium_monthly',
    description: 'FinanceFlow Premium — 12,99€/mês',
    price: '12.99',
  })
  console.log(`PAYPAL_PLAN_ID_PREMIUM=${premium.id}`)

  console.log('\nCola as duas linhas acima no .env (e onde mais tiveres as env vars configuradas).')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
