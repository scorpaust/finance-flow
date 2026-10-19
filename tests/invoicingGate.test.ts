import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

// Upgrade 11 — pagamentos da sandbox da EasyPay nunca geram fatura.
beforeAll(() => {
  ;(globalThis as any).useRuntimeConfig = () => ({ easypayEnv: 'test' })
})
const { invoicingEnabled } = await import('../server/utils/invoicing')

afterEach(() => vi.unstubAllEnvs())

describe('faturação só com a EasyPay em produção', () => {
  it('sandbox: desligada', () => {
    vi.stubEnv('EASYPAY_ENV', 'test')
    vi.stubEnv('INVOICING_ALLOW_SANDBOX', '')
    expect(invoicingEnabled()).toBe(false)
  })
  it('produção: ligada', () => {
    vi.stubEnv('EASYPAY_ENV', 'production')
    expect(invoicingEnabled()).toBe(true)
  })
})
