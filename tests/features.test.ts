import { describe, expect, it } from 'vitest'
import { effectiveTier, hasFeature, requiredTierFor } from '../shared/features'

const NOW = new Date('2026-09-24T12:00:00Z')
const future = new Date('2026-10-24T12:00:00Z')
const past = new Date('2026-08-24T12:00:00Z')

describe('effectiveTier — plano que o utilizador realmente pode usar', () => {
  it('sem subscrição ou free é gratuito', () => {
    expect(effectiveTier(null, NOW)).toBe('free')
    expect(effectiveTier(undefined, NOW)).toBe('free')
    expect(effectiveTier({ tier: 'free', status: 'active' }, NOW)).toBe('free')
  })

  it('REGRESSÃO: referência Multibanco por pagar (status pending) NÃO dá acesso', () => {
    expect(
      effectiveTier({ tier: 'premium', status: 'pending', billingMode: 'manual_reference', currentPeriodEnd: future }, NOW)
    ).toBe('free')
  })

  it('subscrição ativa dá o tier', () => {
    expect(effectiveTier({ tier: 'pro', status: 'active', billingMode: 'auto', currentPeriodEnd: future }, NOW)).toBe('pro')
  })

  it('auto-renovação ativa confia no status (não corta por data de período)', () => {
    expect(effectiveTier({ tier: 'pro', status: 'active', billingMode: 'auto', currentPeriodEnd: past }, NOW)).toBe('pro')
  })

  it('pré-pago (MB WAY/Multibanco) ativo mas fora do período pago volta a gratuito', () => {
    expect(effectiveTier({ tier: 'premium', status: 'active', billingMode: 'push_confirm', currentPeriodEnd: past }, NOW)).toBe('free')
    expect(effectiveTier({ tier: 'premium', status: 'active', billingMode: 'manual_reference', currentPeriodEnd: future }, NOW)).toBe('premium')
  })

  it('cancelada mantém o acesso só até ao fim do período pago', () => {
    expect(effectiveTier({ tier: 'pro', status: 'canceled', billingMode: 'auto', currentPeriodEnd: future }, NOW)).toBe('pro')
    expect(effectiveTier({ tier: 'pro', status: 'canceled', billingMode: 'auto', currentPeriodEnd: past }, NOW)).toBe('free')
    expect(effectiveTier({ tier: 'pro', status: 'canceled', billingMode: 'auto', currentPeriodEnd: null }, NOW)).toBe('free')
  })

  it('Google Play (Upgrade 01): a data da Google manda sempre, como nos pré-pagos', () => {
    // Renovação automática ou pré-pago: ativa só até ao expiryTime.
    expect(effectiveTier({ tier: 'premium', status: 'active', billingMode: 'google_play', currentPeriodEnd: future }, NOW)).toBe('premium')
    expect(effectiveTier({ tier: 'premium', status: 'active', billingMode: 'google_play', currentPeriodEnd: past }, NOW)).toBe('free')
    // Renovação desligada na Play: acesso até ao fim do período.
    expect(effectiveTier({ tier: 'pro', status: 'canceled', billingMode: 'google_play', currentPeriodEnd: future }, NOW)).toBe('pro')
    // Pagamento pendente, suspensa (on hold, período já passado), expirada.
    expect(effectiveTier({ tier: 'pro', status: 'pending', billingMode: 'google_play', currentPeriodEnd: future }, NOW)).toBe('free')
    expect(effectiveTier({ tier: 'pro', status: 'past_due', billingMode: 'google_play', currentPeriodEnd: past }, NOW)).toBe('free')
    expect(effectiveTier({ tier: 'pro', status: 'expired', billingMode: 'google_play', currentPeriodEnd: future }, NOW)).toBe('free')
  })

  it('past_due e expired', () => {
    expect(effectiveTier({ tier: 'pro', status: 'past_due', currentPeriodEnd: future }, NOW)).toBe('pro')
    expect(effectiveTier({ tier: 'pro', status: 'past_due', currentPeriodEnd: past }, NOW)).toBe('free')
    expect(effectiveTier({ tier: 'pro', status: 'expired', currentPeriodEnd: future }, NOW)).toBe('free')
  })
})

describe('hasFeature / matriz de features', () => {
  it('a hierarquia free < pro < premium é respeitada', () => {
    expect(hasFeature('free', 'groups')).toBe(false)
    expect(hasFeature('premium', 'groups')).toBe(hasFeature('pro', 'groups') || requiredTierFor('groups') === 'premium')
  })

  it('cada feature é acessível ao seu tier mínimo e acima, nunca abaixo', () => {
    const order = ['free', 'pro', 'premium'] as const
    for (const feature of ['groups', 'aiStatsInsights', 'aiInvestmentTips', 'investmentTracker', 'documentScan'] as const) {
      const min = requiredTierFor(feature)
      for (const tier of order) {
        expect(hasFeature(tier, feature)).toBe(order.indexOf(tier) >= order.indexOf(min))
      }
    }
  })
})
