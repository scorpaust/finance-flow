import { AiBudgetProposal } from '../../models'
import { requireFeature } from '../../utils/requireFeature'
import { budgetState, countCompleteMonths, proposalId } from '../../utils/aiBudget'
import { currentMonthKey } from '../../../shared/forecast'

// Upgrade 04 — estado do cartão "Orçamento sugerido por IA" (/groups): a
// proposta do mês, se já foi pedida, e se pode pedir. Nunca chama a Anthropic.
export default defineEventHandler(async (event) => {
  const { userId } = await requireFeature(event, 'aiBudget')
  const month = currentMonthKey()
  const [doc, completeMonths] = await Promise.all([
    AiBudgetProposal.findById(proposalId(userId, month)).lean(),
    countCompleteMonths(userId),
  ])
  return budgetState({ month, completeMonths, doc: doc as any })
})
