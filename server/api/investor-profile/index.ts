import { User } from '../../models'
import type { IInvestorProfile } from '../../models'
import { requireAuth } from '../../utils/auth'
import { isProfileValid } from '../../utils/investorProfile'
import { getServerLocale, serverT } from '../../utils/i18n'

const VALID_RISK = ['conservador', 'moderado', 'arrojado']
const VALID_KNOWLEDGE = ['iniciante', 'intermedio', 'avancado']

// Questionário de perfil de investidor (Fase 3, tarefa 5) — grava
// IInvestorProfile em User.investorProfile. Sem enforcement de feature aqui
// (responder ao questionário não é a feature paga); o gate real está em
// server/api/insights/investment.post.ts via requireFeature.
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const method = getMethod(event)
  const locale = getServerLocale(event)

  if (method === 'GET') {
    const user = await User.findById(userId)
      .select('investorProfile')
      .lean<{ investorProfile?: IInvestorProfile }>()
    const profile = user?.investorProfile || null
    return { profile, valid: isProfileValid(profile) }
  }

  if (method === 'POST') {
    const body = await readBody<Partial<IInvestorProfile>>(event)

    if (!body.riskTolerance || !VALID_RISK.includes(body.riskTolerance)) {
      throw createError({ statusCode: 400, message: serverT(locale, 'investorProfile.invalidRiskTolerance') })
    }
    if (!body.knowledgeLevel || !VALID_KNOWLEDGE.includes(body.knowledgeLevel)) {
      throw createError({ statusCode: 400, message: serverT(locale, 'investorProfile.invalidKnowledgeLevel') })
    }
    if (typeof body.horizonYears !== 'number' || body.horizonYears < 0) {
      throw createError({ statusCode: 400, message: serverT(locale, 'investorProfile.invalidHorizonYears') })
    }
    if (typeof body.hasExistingInvestments !== 'boolean') {
      throw createError({ statusCode: 400, message: serverT(locale, 'investorProfile.invalidHasExistingInvestments') })
    }

    const investorProfile: IInvestorProfile = {
      riskTolerance: body.riskTolerance,
      horizonYears: body.horizonYears,
      hasExistingInvestments: body.hasExistingInvestments,
      knowledgeLevel: body.knowledgeLevel,
      goals: Array.isArray(body.goals) ? body.goals.filter((g) => typeof g === 'string') : [],
      updatedAt: new Date(),
    }

    await User.findByIdAndUpdate(userId, { investorProfile })
    return { profile: investorProfile, valid: true }
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})
