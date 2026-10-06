/**
 * Fase 8, ponto 6 — arranca o servidor Nuxt real usado pelos testes E2E
 * (Playwright, ver playwright.config.ts). Mesma ideia dos testes de
 * integração (tests/integration/globalSetup.ts): MongoDB em memória,
 * isolado do Atlas — nunca toca em dados reais.
 *
 * Os dois specs E2E atuais (main-flow, i18n-flow) nunca chegam a chamar a
 * Anthropic/EasyPay/Twelve Data (a subida de plano usa uma escrita direta à
 * BD, não o checkout real da EasyPay — ver o comentário em
 * e2e/main-flow.spec.ts sobre essa decisão) — por isso, ao contrário dos
 * testes de integração, este script não arranca o servidor simulado
 * tests/integration/stubProviders.ts. As chaves API abaixo são valores
 * inertes só para o `useRuntimeConfig()` do Nuxt não rebentar ao ler
 * variáveis em falta; nunca são usadas de verdade.
 *
 * Um pequeno servidor HTTP de controlo (`/__e2e/*`) corre no MESMO processo,
 * com acesso direto à BD via o driver nativo do `mongodb` — os specs
 * Playwright falam com ele por HTTP simples, nunca importando
 * `mongoose`/os modelos diretamente (importar QUALQUER módulo .ts partilhado
 * a partir de um spec, mesmo um sem dependências, fez o transform do
 * Playwright rebentar com "exports is not defined"/"require is not defined"
 * nesta máquina/versão — Playwright 1.63, sem "type": "module" no
 * package.json; ver o comentário em e2e/main-flow.spec.ts). Porta FIXA (não
 * aleatória): evita ter de partilhar a porta escolhida com os specs por
 * ficheiro/env — outra fonte de imports/leituras de ficheiro que se
 * revelaram frágeis com o transform acima.
 *
 * Este script É o processo que o Playwright arranca e mata
 * (`webServer.command` em playwright.config.ts) — corre o `nuxt dev` como
 * filho com as variáveis de ambiente já resolvidas.
 */
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { randomBytes } from 'node:crypto'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

// O driver nativo exposto pelo próprio mongoose — `mongodb` não é dependência
// direta (antes só existia na raiz de node_modules por arrasto do
// @auth/mongodb-adapter, entretanto removido, e o E2E partiu no CI).
const { MongoClient } = mongoose.mongo

const PORT = process.env.E2E_PORT || '3400'
const CONTROL_PORT = process.env.E2E_CONTROL_PORT || '3401'

function readJsonBody(req) {
  return new Promise((resolve) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'))
      } catch {
        resolve({})
      }
    })
  })
}

async function startControlServer(mongoUri) {
  const client = new MongoClient(mongoUri)
  await client.connect()
  const db = client.db('financeflow')

  const server = createServer(async (req, res) => {
    const path = (req.url || '').split('?')[0]
    const body = await readJsonBody(req)

    if (path === '/__e2e/set-tier' && req.method === 'POST') {
      await db.collection('users').updateOne(
        { email: body.email },
        {
          $set: {
            'subscription.tier': body.tier,
            'subscription.status': 'active',
            'subscription.provider': body.tier === 'free' ? 'none' : 'easypay',
            'subscription.billingMode': body.tier === 'free' ? 'none' : 'auto',
            'subscription.currentPeriodEnd': body.tier === 'free' ? null : new Date(Date.now() + 30 * 864e5),
          },
        }
      )
      res.writeHead(204).end()
      return
    }

    // Upgrade 01 — plano comprado na Google Play (app Android), como
    // server/utils/googlePlay.ts o grava.
    if (path === '/__e2e/set-play-subscription' && req.method === 'POST') {
      await db.collection('users').updateOne(
        { email: body.email },
        {
          $set: {
            'subscription.tier': body.tier,
            'subscription.status': 'active',
            'subscription.provider': 'google_play',
            'subscription.paymentMethod': 'google_play',
            'subscription.billingMode': 'google_play',
            'subscription.autoRenew': true,
            'subscription.currentPeriodEnd': new Date(Date.now() + 30 * 864e5),
            'subscription.googlePlayPurchaseToken': `e2e-${Date.now()}`,
            'subscription.googlePlayProductId': body.tier,
            'subscription.googlePlayBasePlanId': 'mensal',
          },
        }
      )
      res.writeHead(204).end()
      return
    }

    // Fase 10 — câmbio de teste (sem acesso ao fornecedor real): lista de
    // moedas e taxa EUR→moeda do dia, como server/utils/displayCurrency.ts as guarda.
    if (path === '/__e2e/seed-fx' && req.method === 'POST') {
      const day = new Date().toISOString().slice(0, 10)
      const fx = db.collection('fxcaches')
      await fx.updateOne({ _id: 'currencies' }, { $set: { value: ['EUR', body.currency], day } }, { upsert: true })
      await fx.updateOne({ _id: `rate:${body.currency}` }, { $set: { value: body.rate, day } }, { upsert: true })
      res.writeHead(204).end()
      return
    }

    if (path === '/__e2e/seed-transaction' && req.method === 'POST') {
      const user = await db.collection('users').findOne({ email: body.email })
      if (!user) {
        res.writeHead(404).end()
        return
      }
      let category = await db.collection('categories').findOne({ userId: user._id, type: 'expense' })
      if (!category) {
        const insert = await db
          .collection('categories')
          .insertOne({ userId: user._id, name: 'E2E', type: 'expense', icon: '💰', color: '#6366f1', isDefault: false, order: 99 })
        category = { _id: insert.insertedId }
      }
      const date = new Date()
      date.setMonth(date.getMonth() - (body.monthsAgo || 0))
      await db.collection('transactions').insertOne({
        userId: user._id,
        type: 'expense',
        amount: body.amount,
        description: 'E2E seed',
        categoryId: category._id,
        date,
        tags: [],
        recurrence: 'none',
        currency: 'EUR',
        originalAmount: null,
        exchangeRate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      res.writeHead(204).end()
      return
    }

    res.writeHead(404).end()
  })

  await new Promise((resolve) => server.listen(Number(CONTROL_PORT), '127.0.0.1', resolve))
  return {
    close: async () => {
      await new Promise((resolve) => server.close(resolve))
      await client.close()
    },
  }
}

async function main() {
  // launchTimeout generoso: o valor por omissão (10s) já falhou algumas
  // vezes nesta sessão numa máquina ocupada (várias compilações e testes a
  // correr ao mesmo tempo) — não é o mongod a estar avariado, só lento a
  // arrancar sob carga.
  const mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60_000 } })
  const control = await startControlServer(mongo.getUri())

  const env = {
    ...process.env,
    MONGODB_URI: mongo.getUri(),
    // Gerados a cada execução — sem valores com ar de segredo no repositório.
    SESSION_SECRET: randomBytes(32).toString('hex'),
    TWO_FACTOR_ENCRYPTION_KEY: randomBytes(32).toString('hex'),
    CRON_SECRET: randomBytes(16).toString('hex'),
    EASYPAY_ACCOUNT_ID: 'e2e-account',
    EASYPAY_API_KEY: 'e2e-key',
    ANTHROPIC_API_KEY: 'e2e-key',
    TWELVE_DATA_API_KEY: 'e2e-key',
    // Sem GEOLITE2_DB_PATH: país fica sempre desconhecido, nunca Portugal —
    // ver server/utils/geo.ts e a nota em e2e/i18n-flow.spec.ts sobre o que
    // isto impede de testar (MB WAY/Multibanco só aparecem com país = PT).
    GEOLITE2_DB_PATH: '',
    SENTRY_DSN: '',
    NODE_ENV: 'development',
    APP_URL: `http://localhost:${PORT}`,
    PORT,
  }

  let cleaningUp = false
  async function cleanup(exitCode) {
    if (cleaningUp) return
    cleaningUp = true
    await control.close().catch(() => {})
    await mongo.stop().catch(() => {})
    process.exit(exitCode)
  }

  const child = spawn('npx', ['nuxt', 'dev', '--port', PORT], {
    env,
    stdio: 'inherit',
    shell: true,
  })

  child.on('exit', (code) => cleanup(code ?? 0))
  process.on('SIGTERM', () => {
    child.kill('SIGTERM')
  })
  process.on('SIGINT', () => {
    child.kill('SIGINT')
  })
}

main().catch((err) => {
  console.error('e2e-server: falha ao arrancar', err)
  process.exit(1)
})
