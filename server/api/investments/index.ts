import { Investment } from '../../models'
import { requireFeature } from '../../utils/requireFeature'
import { parseInvestmentCreate, toInvestmentDto } from '../../utils/investments'
import { MAX_INVESTMENTS_PER_USER, summarizePortfolio } from '../../../shared/portfolio'
import { getServerLocale, serverT } from '../../utils/i18n'

// Registo de investimentos (Fase 6) — lista + resumo, e criação. Ver
// context/features/06-FASE-6-registo-investimentos.md. Gated no servidor com
// requireFeature('investmentTracker'); o perfil de investidor é uma ordem de UX
// (feita no client), não um controlo de segurança, por isso não é exigido aqui.
export default defineEventHandler(async (event) => {
  const { userId } = await requireFeature(event, 'investmentTracker')
  const method = getMethod(event)
  const locale = getServerLocale(event)

  if (method === 'GET') {
    const docs = await Investment.find({ userId }).sort({ initialDate: -1, _id: -1 }).lean()
    const items = docs.map(toInvestmentDto)
    return { items, summary: summarizePortfolio(items) }
  }

  if (method === 'POST') {
    const fields = parseInvestmentCreate(locale, await readBody(event))

    // Teto fixo de segurança (não é um limite de plano).
    const count = await Investment.countDocuments({ userId })
    if (count >= MAX_INVESTMENTS_PER_USER) {
      throw createError({
        statusCode: 400,
        message: serverT(locale, 'investments.limitReached', { limit: MAX_INVESTMENTS_PER_USER }),
        data: { error: 'investment_limit' },
      })
    }

    const doc = await Investment.create({ ...fields, userId })
    return toInvestmentDto(doc)
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})
