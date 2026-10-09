import { z } from 'zod'
import { AiBudgetProposal, Category, TransactionGroup } from '../../models'
import { requireFeature } from '../../utils/requireFeature'
import { getServerLocale, serverT } from '../../utils/i18n'
import { validateBody } from '../../utils/validate'
import { proposalId } from '../../utils/aiBudget'
import { currentMonthKey } from '../../../shared/forecast'

// Upgrade 04 — aplica os limites da proposta do mês (já ajustados pelo
// utilizador no cartão) aos limites que a app já tem: `monthlyLimit` das
// categorias e dos grupos e o alerta de percentagem dos grupos. Valores em
// euros. Antes da 1.ª aplicação guarda os limites que estavam, para
// "Desfazer" (POST /api/budget/undo); aplicar de novo mantém esse ponto de
// partida e só lhe junta categorias/grupos que ainda não lá estavam.
const ObjectIdString = z.string().regex(/^[a-f0-9]{24}$/i, 'budget.invalidLimits')
const Limit = z.number().min(0, 'budget.invalidLimits').max(1e9, 'budget.invalidLimits')

const ApplySchema = z.object({
  categories: z.array(z.object({ id: ObjectIdString, monthlyLimit: Limit })).max(500, 'budget.invalidLimits').default([]),
  groups: z
    .array(
      z.object({
        id: ObjectIdString,
        monthlyLimit: Limit,
        alertThreshold: z.number().int('budget.invalidLimits').min(50, 'budget.invalidLimits').max(100, 'budget.invalidLimits'),
      })
    )
    .max(500, 'budget.invalidLimits')
    .default([]),
})

const round2 = (v: number) => Math.round(v * 100) / 100

export default defineEventHandler(async (event) => {
  const { userId } = await requireFeature(event, 'aiBudget')
  const body = await validateBody(event, ApplySchema)
  const locale = getServerLocale(event)

  const id = proposalId(userId, currentMonthKey())
  const proposal = await AiBudgetProposal.findById(id).lean()
  if (!proposal || proposal.status !== 'ready') {
    throw createError({ statusCode: 404, message: serverT(locale, 'budget.noProposal') })
  }

  // Só categorias e grupos do próprio utilizador; ids de outros são ignorados.
  const [categories, groups] = await Promise.all([
    Category.find({ userId, _id: { $in: body.categories.map((c) => c.id) } }).select('monthlyLimit').lean(),
    TransactionGroup.find({ userId, _id: { $in: body.groups.map((g) => g.id) } }).select('monthlyLimit alertThreshold').lean(),
  ])
  const ownCategories = new Map(categories.map((c: any) => [String(c._id), c]))
  const ownGroups = new Map(groups.map((g: any) => [String(g._id), g]))

  const snapshot = proposal.previousLimits || { categories: [], groups: [] }
  const savedCategories = new Set(snapshot.categories.map((c) => c.id))
  const savedGroups = new Set(snapshot.groups.map((g) => g.id))
  for (const [cid, c] of ownCategories) {
    if (!savedCategories.has(cid)) snapshot.categories.push({ id: cid, monthlyLimit: c.monthlyLimit || 0 })
  }
  for (const [gid, g] of ownGroups) {
    if (!savedGroups.has(gid)) snapshot.groups.push({ id: gid, monthlyLimit: g.monthlyLimit || 0, alertThreshold: g.alertThreshold ?? 80 })
  }

  const categoryOps = body.categories
    .filter((c) => ownCategories.has(c.id))
    .map((c) => ({ updateOne: { filter: { _id: c.id, userId }, update: { $set: { monthlyLimit: round2(c.monthlyLimit) } } } }))
  const groupOps = body.groups
    .filter((g) => ownGroups.has(g.id))
    .map((g) => ({
      updateOne: {
        filter: { _id: g.id, userId },
        update: { $set: { monthlyLimit: round2(g.monthlyLimit), alertThreshold: g.alertThreshold } },
      },
    }))

  // O ponto de partida fica guardado antes de mudar os limites.
  await AiBudgetProposal.updateOne({ _id: id }, { $set: { previousLimits: snapshot, appliedAt: new Date() } })
  await Promise.all([
    categoryOps.length ? Category.bulkWrite(categoryOps as any) : null,
    groupOps.length ? TransactionGroup.bulkWrite(groupOps as any) : null,
  ])

  return { applied: { categories: categoryOps.length, groups: groupOps.length }, canUndo: true }
})
