import type { IInvestorProfile } from '../models'

// Perfil de investidor "renovado anualmente" — ver
// context/features/03-FASE-3-insights-ia.md tarefa 5. Partilhado entre
// server/api/investor-profile/index.ts e server/api/insights/investment.post.ts.
export const PROFILE_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000

export function isProfileValid(profile?: IInvestorProfile | null): boolean {
  if (!profile) return false
  return Date.now() - new Date(profile.updatedAt).getTime() < PROFILE_MAX_AGE_MS
}
