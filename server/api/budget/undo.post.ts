import { AiBudgetProposal, Category, TransactionGroup } from '../../models'
import { requireFeature } from '../../utils/requireFeature'
import { getServerLocale, serverT } from '../../utils/i18n'
import { proposalId } from '../../utils/aiBudget'
import { currentMonthKey } from '../../../shared/forecast'

// Upgrade 04 — "Desfazer": repõe os limites que estavam antes da 1.ª
// aplicação da proposta do mês (guardados por POST /api/budget/apply). Pode
// voltar a aplicar e a desfazer as vezes que quiser durante o mês.
export default defineEventHandler(async (event) => {
  const { userId } = await requireFeature(event, 'aiBudget')
  const locale = getServerLocale(event)

  const id = proposalId(userId, currentMonthKey())
  const proposal = await AiBudgetProposal.findById(id).lean()
  const snapshot = proposal?.previousLimits
  if (!proposal || proposal.status !== 'ready' || !snapshot) {
    throw createError({ statusCode: 409, message: serverT(locale, 'budget.nothingToUndo') })
  }

  const categoryOps = snapshot.categories.map((c) => ({
    updateOne: { filter: { _id: c.id, userId }, update: { $set: { monthlyLimit: c.monthlyLimit } } },
  }))
  const groupOps = snapshot.groups.map((g) => ({
    updateOne: {
      filter: { _id: g.id, userId },
      update: { $set: { monthlyLimit: g.monthlyLimit, alertThreshold: g.alertThreshold } },
    },
  }))
  await Promise.all([
    categoryOps.length ? Category.bulkWrite(categoryOps as any) : null,
    groupOps.length ? TransactionGroup.bulkWrite(groupOps as any) : null,
  ])
  await AiBudgetProposal.updateOne({ _id: id }, { $set: { previousLimits: null, appliedAt: null } })

  return { restored: { categories: categoryOps.length, groups: groupOps.length }, canUndo: false }
})
