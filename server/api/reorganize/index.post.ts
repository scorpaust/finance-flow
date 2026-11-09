import { AiReorgProposal } from '../../models'
import { requireFeature } from '../../utils/requireFeature'
import { getServerLocale, serverT } from '../../utils/i18n'
import { enforceRateLimit } from '../../utils/rateLimit'
import { generateReorgProposal, reorgEligibility, reorgState, reorgUsedThisMonth } from '../../utils/aiReorganize'
import { REORG_MONTHLY_LIMIT } from '../../../shared/reorganize'

// Pede uma proposta de reorganização à IA (Premium). Nada muda na conta: a
// proposta fica guardada até o utilizador escolher o que aplicar.
export default defineEventHandler(async (event) => {
  const { userId } = await requireFeature(event, 'aiReorganize')
  const locale = getServerLocale(event)
  // Contra cliques repetidos: o limite do mês conta só as propostas criadas.
  await enforceRateLimit(event, { name: 'reorganize', limit: 3, windowSeconds: 60, identity: userId })

  const eligibility = await reorgEligibility(userId)
  if (!eligibility.ok) {
    throw createError({
      statusCode: 400,
      message: serverT(locale, 'reorganize.notEnoughData', {
        minTransactions: eligibility.minTransactions,
        minDays: eligibility.minDays,
        transactions: eligibility.transactions,
        days: eligibility.days,
      }),
      data: { error: 'reorganize_not_enough_data' },
    })
  }
  if ((await reorgUsedThisMonth(userId)) >= REORG_MONTHLY_LIMIT) {
    throw createError({
      statusCode: 429,
      message: serverT(locale, 'reorganize.monthlyLimit', { limit: REORG_MONTHLY_LIMIT }),
      data: { error: 'reorganize_monthly_limit' },
    })
  }

  const { summary, operations } = await generateReorgProposal(userId, locale)
  await AiReorgProposal.create({ userId, summary, operations, locale })
  return reorgState(userId)
})
