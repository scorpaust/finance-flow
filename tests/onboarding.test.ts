import { describe, expect, it } from 'vitest'
import { onboardingState, type OnboardingFacts } from '../shared/onboarding'

// Upgrade 08 — lista de primeiros passos: progresso deduzido dos dados.
const base: OnboardingFacts = {
  tier: 'free',
  hasExpense: false,
  hasIncome: false,
  hasGroupLimit: false,
  hasBudgetProposal: false,
  twoFactorEnabled: false,
  accountAgeDays: 1,
  dismissed: false,
}

describe('primeiros passos', () => {
  it('conta nova Gratuita: 3 passos a contar (o de orçamento aparece bloqueado)', () => {
    const s = onboardingState(base)
    expect(s.show).toBe(true)
    expect(s.total).toBe(3)
    expect(s.done).toBe(0)
    expect(s.steps.find((x) => x.id === 'budget')).toMatchObject({ locked: true, done: false })
  })

  it('Pro conta o grupo com teto; Premium aceita também o orçamento sugerido', () => {
    expect(onboardingState({ ...base, tier: 'pro', hasBudgetProposal: true }).steps.find((x) => x.id === 'budget')!.done).toBe(false)
    expect(onboardingState({ ...base, tier: 'pro', hasGroupLimit: true }).steps.find((x) => x.id === 'budget')!.done).toBe(true)
    expect(onboardingState({ ...base, tier: 'premium', hasBudgetProposal: true }).steps.find((x) => x.id === 'budget')!.done).toBe(true)
  })

  it('desaparece quando está completa, quando é fechada, ou em contas com 60+ dias', () => {
    const complete = { ...base, hasExpense: true, hasIncome: true, twoFactorEnabled: true }
    expect(onboardingState(complete)).toMatchObject({ show: false, done: 3, total: 3 })
    expect(onboardingState({ ...base, dismissed: true }).show).toBe(false)
    expect(onboardingState({ ...base, accountAgeDays: 61 }).show).toBe(false)
  })
})
