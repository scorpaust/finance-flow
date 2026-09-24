import { createServer, type Server } from 'node:http'

// Fase 8, ponto 6 — servidor HTTP local que finge ser a Anthropic e a EasyPay
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

export async function startStubProviders(): Promise<StubProviders> {
  let anthropicResponse: StoredResponse = {
    status: 200,
    body: { content: [{ type: 'text', text: '{}' }], usage: { input_tokens: 1, output_tokens: 1 } },
  }
  const easypayResponses = new Map<string, StoredResponse>()
  const requests: { path: string; method: string; body: unknown }[] = []

  function resetAll() {
    anthropicResponse = {
      status: 200,
      body: { content: [{ type: 'text', text: '{}' }], usage: { input_tokens: 1, output_tokens: 1 } },
    }
    easypayResponses.clear()
    requests.length = 0
  }

  const server = createServer(async (req, res) => {
    const path = (req.url || '').split('?')[0]
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
    if (path === '/__control/requests' && method === 'GET') {
      res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(requests))
      return
    }

    // ── Respostas simuladas dos fornecedores ────────────────────────────────
    requests.push({ path, method, body })

    if (path === '/v1/messages') {
      res.writeHead(anthropicResponse.status, { 'content-type': 'application/json' })
      res.end(JSON.stringify(anthropicResponse.body))
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
