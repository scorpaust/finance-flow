import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

// Chave da Anthropic expirada/desativada: evento próprio nos logs, e o
// cliente continua a receber só a mensagem genérica.
beforeAll(() => {
  ;(globalThis as any).useRuntimeConfig = () => ({ anthropicApiKey: 'chave-de-teste' })
  ;(globalThis as any).createError = (e: Record<string, unknown>) => Object.assign(new Error(String(e.message)), e)
})

const { generateStructuredJson } = await import('../server/utils/anthropic')
const call = () => generateStructuredJson({ system: 's', prompt: 'p', schema: { type: 'object', properties: {}, required: [] } })
const loggedEvents = (spy: ReturnType<typeof vi.spyOn>) => spy.mock.calls.map((c) => JSON.parse(String(c[0])).event)

afterEach(() => vi.restoreAllMocks())

describe('erros da Anthropic', () => {
  it('401 regista anthropic.auth_failed e devolve o erro genérico', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"type":"error","error":{"type":"authentication_error"}}', { status: 401 }))
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    await expect(call()).rejects.toMatchObject({ statusCode: 502, data: { error: 'ai_upstream_error' } })
    expect(loggedEvents(log)).toEqual(['anthropic.auth_failed'])
  })

  it('outros erros continuam como anthropic.http_error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('overloaded', { status: 529 }))
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    await expect(call()).rejects.toMatchObject({ statusCode: 502 })
    expect(loggedEvents(log)).toEqual(['anthropic.http_error'])
  })
})
