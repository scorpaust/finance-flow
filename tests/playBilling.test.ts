import { describe, expect, it } from 'vitest'
import {
  PLAY_PREPAID_PERIODS,
  playManageUrl,
  playReplacementMode,
  prepaidBasePlanId,
  tierForPlayProduct,
} from '../shared/playBilling'

// Upgrade 01 — Google Play Billing (context/features/upgrades/01-google-play-billing-android.md).
describe('produtos e base plans da Google Play', () => {
  it('os ids dos produtos dão o plano; o resto é desconhecido', () => {
    expect(tierForPlayProduct('pro')).toBe('pro')
    expect(tierForPlayProduct('premium')).toBe('premium')
    expect(tierForPlayProduct('gold')).toBeNull()
    expect(tierForPlayProduct(undefined)).toBeNull()
  })

  it('pré-pagos com os mesmos períodos da web (MB WAY/Multibanco)', () => {
    expect([...PLAY_PREPAID_PERIODS]).toEqual([1, 3, 6, 12])
    expect(PLAY_PREPAID_PERIODS.map(prepaidBasePlanId)).toEqual(['prepago-1m', 'prepago-3m', 'prepago-6m', 'prepago-12m'])
  })

  it('link para gerir a subscrição na Play Store', () => {
    expect(playManageUrl('com.dinismcosta.financeflow', 'pro')).toBe(
      'https://play.google.com/store/account/subscriptions?sku=pro&package=com.dinismcosta.financeflow'
    )
    expect(playManageUrl('com.dinismcosta.financeflow')).toBe('https://play.google.com/store/account/subscriptions?package=com.dinismcosta.financeflow')
  })
})

describe('mudança de plano (decisão 6)', () => {
  const auto = (tier: 'pro' | 'premium') => ({ tier, autoRenew: true })
  const prepaid = (tier: 'pro' | 'premium') => ({ tier, autoRenew: false })

  it('Pro → Premium com renovação: imediato, cobra a diferença', () => {
    expect(playReplacementMode(auto('pro'), auto('premium'))).toBe('CHARGE_PRORATED_PRICE')
  })

  it('Premium → Pro com renovação: só na renovação', () => {
    expect(playReplacementMode(auto('premium'), auto('pro'))).toBe('DEFERRED')
  })

  it('qualquer mudança que envolva um pré-pago: preço completo (regra da Google)', () => {
    expect(playReplacementMode(prepaid('pro'), prepaid('premium'))).toBe('CHARGE_FULL_PRICE')
    expect(playReplacementMode(auto('premium'), prepaid('pro'))).toBe('CHARGE_FULL_PRICE')
    expect(playReplacementMode(prepaid('premium'), auto('pro'))).toBe('CHARGE_FULL_PRICE')
  })
})
