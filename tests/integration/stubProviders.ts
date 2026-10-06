import { createServer, type Server } from 'node:http'

// Fase 8, ponto 6 — servidor HTTP local que finge ser a Anthropic, a EasyPay
// e (Upgrade 01) o OAuth + a Google Play Developer API + as chaves OIDC da Google
// nos testes de integração (nunca chamadas reais a fornecedores externos —
// custam dinheiro e tornariam os testes instáveis). Corre no processo
// principal do Vitest (arrancado no `globalSetup`); o servidor Nuxt de teste
// corre num subprocesso à parte (é assim que o @nuxt/test-utils funciona),
// por isso os ficheiros de teste não conseguem aceder a este objeto
// diretamente — falam com ele por HTTP, através dos endpoints `/__control/*`
// abaixo (ver testHelpers.ts).
interface StoredResponse {
  status: number
  body: unknown
}

export interface StubProviders {
  server: Server
  baseUrl: string
  close: () => Promise<void>
}

function readJsonBody(req: import('node:http').IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      try {
        resolve(raw ? JSON.parse(raw) : undefined)
      } catch {
        resolve(raw)
      }
    })
  })
}

export async function startStubProviders(opts: { jwks?: object[] } = {}): Promise<StubProviders> {
  let anthropicResponse: StoredResponse = {
    status: 200,
    body: { content: [{ type: 'text', text: '{}' }], usage: { input_tokens: 1, output_tokens: 1 } },
  }
  const easypayResponses = new Map<string, StoredResponse>()
  const requests: { path: string; query: string; method: string; body: unknown; authorization?: string }[] = []
  // Upgrade 01 — Google Play Developer API: estado das compras por token
  // (purchases.subscriptionsv2.get) e o código de resposta das ações
  // (acknowledge/cancel/revoke).
  let googleStatus = 200
  const googleSubscriptions = new Map<string, StoredResponse>()

  function resetAll() {
    anthropicResponse = {
      status: 200,
      body: { content: [{ type: 'text', text: '{}' }], usage: { input_tokens: 1, output_tokens: 1 } },
    }
    easypayResponses.clear()
    requests.length = 0
    googleStatus = 200
    googleSubscriptions.clear()
  }

  const server = createServer(async (req, res) => {
    const [path, query = ''] = (req.url || '').split('?')
    const method = req.method || 'GET'
    const body = await readJsonBody(req)

    // ── Painel de controlo, chamado pelos próprios testes via HTTP ──────────
    if (path === '/__control/reset' && method === 'POST') {
      resetAll()
      res.writeHead(204).end()
      return
    }
    if (path === '/__control/anthropic' && method === 'POST') {
      anthropicResponse = { status: body.status ?? 200, body: body.body }
      res.writeHead(204).end()
      return
    }
    if (path === '/__control/easypay' && method === 'POST') {
      easypayResponses.set(`${body.method || 'GET'} ${body.path}`, { status: body.status ?? 200, body: body.body })
      res.writeHead(204).end()
      return
    }
    if (path === '/__control/google' && method === 'POST') {
      googleStatus = body.status ?? 200
      res.writeHead(204).end()
      return
    }
    if (path === '/__control/google-subscription' && method === 'POST') {
      googleSubscriptions.set(body.token, { status: body.status ?? 200, body: body.body })
      res.writeHead(204).end()
      return
    }
    if (path === '/__control/requests' && method === 'GET') {
      res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(requests))
      return
    }

    // ── Respostas simuladas dos fornecedores ────────────────────────────────
    requests.push({ path, query, method, body, authorization: req.headers.authorization })

    if (path === '/v1/messages') {
      res.writeHead(anthropicResponse.status, { 'content-type': 'application/json' })
      res.end(JSON.stringify(anthropicResponse.body))
      return
    }

    // OAuth 2.0 da conta de serviço (token_uri da conta de teste).
    if (path === '/oauth/token' && method === 'POST') {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ access_token: 'stub-google-token', expires_in: 3600, token_type: 'Bearer' }))
      return
    }
    // Chaves públicas OIDC da Google (verificação dos pushes do Pub/Sub).
    if (path === '/oauth2/v3/certs') {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ keys: opts.jwks || [] }))
      return
    }
    const subGet = path.match(/^\/androidpublisher\/v3\/applications\/[^/]+\/purchases\/subscriptionsv2\/tokens\/([^/:]+)$/)
    if (subGet && method === 'GET') {
      const stored = googleSubscriptions.get(decodeURIComponent(subGet[1]))
      res.writeHead(stored?.status ?? 404, { 'content-type': 'application/json' })
      res.end(JSON.stringify(stored?.body ?? { error: { code: 404, message: 'not found' } }))
      return
    }
    if (path.startsWith('/androidpublisher/')) {
      res.writeHead(googleStatus, { 'content-type': 'application/json' })
      res.end(JSON.stringify(googleStatus < 300 ? {} : { error: { code: googleStatus } }))
      return
    }

    const match = easypayResponses.get(`${method} ${path}`) || easypayResponses.get(`GET ${path}`)
    if (match) {
      res.writeHead(match.status, { 'content-type': 'application/json' })
      res.end(match.status === 204 ? undefined : JSON.stringify(match.body))
      return
    }

    res.writeHead(404, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ status: 'error', message: [`stub: sem resposta configurada para ${method} ${path}`] }))
  })

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  const port = typeof address === 'object' && address ? address.port : 0

  return {
    server,
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  }
}
