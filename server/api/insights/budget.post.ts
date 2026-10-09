import { z } from 'zod'
import { AiBudgetProposal } from '../../models'
import { requireFeature } from '../../utils/requireFeature'
import { getServerLocale, serverT } from '../../utils/i18n'
import { validateBody } from '../../utils/validate'
import { getEurRate, getUserDisplayCurrency } from '../../utils/displayCurrency'
import { budgetState, generateBudget, loadBudgetHistory, nextRequestDate, proposalId } from '../../utils/aiBudget'
import { currentMonthKey } from '../../../shared/forecast'
import { AI_BUDGET_MIN_MONTHS, BUDGET_DEFAULT_PCT, BUDGET_MAX_PCT } from '../../../shared/budget'

// Upgrade 04 — pede a proposta de orçamento do mês (Premium). Só a pedido do
// utilizador e UMA vez por mês civil (fuso de Lisboa): o pedido fica registado
// antes de gerar (o `_id` do mês é único), e um segundo pedido no mesmo mês é
// recusado com a data a partir da qual pode voltar a pedir. A proposta fica
// visível o resto do mês (GET).

// Um pedido registado mas sem proposta há mais do que isto (o servidor caiu a
// meio) não bloqueia o mês.
const PENDING_STALE_MS = 2 * 60 * 1000

const Pct = z.number().min(0, 'budget.invalidPct').max(BUDGET_MAX_PCT, 'budget.invalidPct')
const BudgetRequestSchema = z
  .object({ workingCapitalPct: Pct.optional(), savingsPct: Pct.optional() })
  .nullish()

export default defineEventHandler(async (event) => {
  const { userId } = await requireFeature(event, 'aiBudget')
  const body = await validateBody(event, BudgetRequestSchema)
  const settings = {
    workingCapitalPct: body?.workingCapitalPct ?? BUDGET_DEFAULT_PCT.workingCapital,
    savingsPct: body?.savingsPct ?? BUDGET_DEFAULT_PCT.savings,
  }
  const locale = getServerLocale(event)
  const month = currentMonthKey()
  const id = proposalId(userId, month)

  const alreadyRequested = () =>
    createError({
      statusCode: 429,
      message: serverT(locale, 'budget.alreadyRequested', { date: nextRequestDate(month, locale) }),
      data: { error: 'budget_monthly_limit' },
    })

  const existing = await AiBudgetProposal.findById(id).lean()
  if (existing && (existing.status === 'ready' || Date.now() - new Date(existing.createdAt).getTime() < PENDING_STALE_MS)) {
    throw alreadyRequested()
  }

  // Sem meses suficientes o pedido não conta.
  const history = await loadBudgetHistory(userId)
  if (history.completeMonths < AI_BUDGET_MIN_MONTHS) {
    throw createError({
      statusCode: 400,
      message: serverT(locale, 'budget.notEnoughMonths', { min: AI_BUDGET_MIN_MONTHS, have: history.completeMonths }),
      data: { error: 'budget_not_enough_months' },
    })
  }

  if (existing) await AiBudgetProposal.deleteOne({ _id: id, status: 'pending' })
  try {
    await AiBudgetProposal.create({ _id: id, userId, month, status: 'pending', settings, createdAt: new Date() })
  } catch (e: any) {
    // Dois pedidos ao mesmo tempo: só um passa.
    if (e?.code === 11000) throw alreadyRequested()
    throw e
  }

  try {
    const fx = await getEurRate(await getUserDisplayCurrency(userId))
    const result = await generateBudget({ history, settings, locale, fx })
    const doc = await AiBudgetProposal.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'ready',
          summary: result.summary,
          categories: result.categories,
          groups: result.groups,
          source: result.source,
          overview: result.overview,
          locale,
          generatedAt: new Date(),
        },
      },
      { new: true }
    ).lean()
    return budgetState({ month, completeMonths: history.completeMonths, doc: doc as any })
  } catch (e) {
    // Falha inesperada (não a da IA, que já cai na proposta da app): o pedido
    // não conta e o utilizador pode tentar outra vez.
    await AiBudgetProposal.deleteOne({ _id: id, status: 'pending' })
    throw e
  }
})
