// Upgrade 08 — lista de primeiros passos: regras puras (testadas em
// tests/onboarding.test.ts). O progresso deduz-se dos dados da conta; não há
// coleção própria.
import type { SubscriptionTier } from './features'

export type OnboardingStepId = 'expense' | 'income' | 'budget' | 'security'

export interface OnboardingFacts {
  tier: SubscriptionTier
  hasExpense: boolean
  hasIncome: boolean
  hasGroupLimit: boolean
  hasBudgetProposal: boolean
  twoFactorEnabled: boolean
  accountAgeDays: number
  dismissed: boolean
}

export interface OnboardingStep {
  id: OnboardingStepId
  done: boolean
  // Fora do plano: aparece com o selo do plano, sem contar para o total.
  locked: boolean
}

// Só contas recentes veem a lista (e só até a completarem ou a fecharem).
export const ONBOARDING_MAX_ACCOUNT_DAYS = 60

export function onboardingState(f: OnboardingFacts) {
  const steps: OnboardingStep[] = [
    { id: 'expense', done: f.hasExpense, locked: false },
    { id: 'income', done: f.hasIncome, locked: false },
    {
      id: 'budget',
      // Pro: um grupo com teto. Premium: isso ou o orçamento sugerido por IA.
      done: f.hasGroupLimit || (f.tier === 'premium' && f.hasBudgetProposal),
      locked: f.tier === 'free',
    },
    { id: 'security', done: f.twoFactorEnabled, locked: false },
  ]
  const counted = steps.filter((s) => !s.locked)
  const done = counted.filter((s) => s.done).length
  const complete = done === counted.length
  return {
    steps,
    done,
    total: counted.length,
    show: !f.dismissed && !complete && f.accountAgeDays < ONBOARDING_MAX_ACCOUNT_DAYS,
  }
}
