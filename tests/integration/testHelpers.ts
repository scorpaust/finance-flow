import { readFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { TEST_ENV_FILE } from './globalSetup'

// Passwords das contas descartáveis dos testes, geradas a cada execução — sem
// literais no repositório (scanners de segredos, ex. GitGuardian, sinalizam
// `password: '...'` mesmo quando é só um valor de teste — incluindo templates
// como `x-${...}`, por isso sem texto literal nenhum).
export const TEST_PASSWORD = randomBytes(12).toString('base64url')
export const WRONG_PASSWORD = randomBytes(12).toString('base64url')

export function readTestEnv(): Record<string, string> {
  return JSON.parse(readFileSync(TEST_ENV_FILE, 'utf8'))
}

// Fala com o servidor simulado (tests/integration/stubProviders.ts) por HTTP
// — nunca por referência direta ao objeto, porque o servidor Nuxt em teste
// (e por vezes este próprio ficheiro de teste) corre num processo à parte.
export function stubClient(baseUrl: string) {
  return {
    reset: () => fetch(`${baseUrl}/__control/reset`, { method: 'POST' }),
    setAnthropicResponse: (body: unknown, status = 200) =>
      fetch(`${baseUrl}/__control/anthropic`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ body, status }),
      }),
    setEasyPayResponse: (method: string, path: string, body: unknown, status = 200) =>
      fetch(`${baseUrl}/__control/easypay`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ method, path, body, status }),
      }),
    requests: async (): Promise<{ path: string; method: string; body: unknown }[]> =>
      (await fetch(`${baseUrl}/__control/requests`)).json(),
  }
}

// Extrai o valor de um cookie de um cabeçalho Set-Cookie (ou vários, já
// juntos) — usado para propagar a sessão entre pedidos em `$fetch`, que não
// mantém cookies sozinho como um browser.
export function extractCookies(setCookieHeader: string | string[] | null | undefined): string {
  const headers = Array.isArray(setCookieHeader) ? setCookieHeader : setCookieHeader ? [setCookieHeader] : []
  return headers.map((h) => h.split(';')[0]).join('; ')
}
