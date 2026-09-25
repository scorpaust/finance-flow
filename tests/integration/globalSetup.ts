import { writeFileSync, unlinkSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { startStubProviders } from './stubProviders'

// Fase 8, ponto 6 — MongoDB em memória (isolado, nunca toca no Atlas real) +
// o servidor simulado dos fornecedores externos (ver stubProviders.ts).
// Escreve as variáveis num ficheiro em vez de as pôr em `process.env`: o
// servidor Nuxt de teste corre num SUBPROCESSO à parte (o @nuxt/test-utils
// spawna `nuxt build`/`nuxt preview`), por isso cada ficheiro de teste lê
// este ficheiro e passa os valores explicitamente a `setup({ env })` — mais
// robusto do que confiar em como o Vitest propaga `process.env` entre o
// globalSetup e os workers dos testes.
export const TEST_ENV_FILE = fileURLToPath(new URL('./.testenv.json', import.meta.url))

export default async function setup() {
  // launchTimeout generoso: o valor por omissão (10s) já falhou algumas
  // vezes nesta sessão numa máquina ocupada — não é o mongod a estar
  // avariado, só lento a arrancar sob carga (ver scripts/e2e-server.mjs).
  const mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60_000 } })
  const stub = await startStubProviders()

  const env = {
    MONGODB_URI: mongo.getUri(),
    SESSION_SECRET: 'test-session-secret-not-for-production-0000000000000000',
    TWO_FACTOR_ENCRYPTION_KEY: 'test-2fa-key-not-for-production-000000000000000000',
    CRON_SECRET: 'test-cron-secret',
    EASYPAY_ACCOUNT_ID: 'test-account',
    EASYPAY_API_KEY: 'test-key',
    EASYPAY_API_BASE_URL: stub.baseUrl,
    ANTHROPIC_API_KEY: 'test-key',
    ANTHROPIC_API_BASE_URL: stub.baseUrl,
    TWELVE_DATA_API_KEY: 'test-key',
    TWELVE_DATA_API_BASE_URL: stub.baseUrl,
    NODE_ENV: 'test',
    STUB_PROVIDERS_URL: stub.baseUrl,
  }
  writeFileSync(TEST_ENV_FILE, JSON.stringify(env, null, 2))

  return async () => {
    await stub.close()
    await mongo.stop()
    try {
      unlinkSync(TEST_ENV_FILE)
    } catch {
      /* já não existe — sem problema */
    }
  }
}
