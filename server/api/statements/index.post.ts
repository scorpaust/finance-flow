import { StatementImport } from '../../models'
import { requireFeature } from '../../utils/requireFeature'
import { getServerLocale, serverT } from '../../utils/i18n'
import { statementImportsThisMonth } from '../../utils/statementImport'
import { STATEMENT_MONTHLY_LIMIT } from '../../../shared/statementImport'

// Começa uma importação de extrato (Premium): conta para o limite do mês e dá
// o id a que se enviam os blocos de páginas.
export default defineEventHandler(async (event) => {
  const { userId } = await requireFeature(event, 'statementImport')
  const locale = getServerLocale(event)
  if ((await statementImportsThisMonth(userId)) >= STATEMENT_MONTHLY_LIMIT) {
    throw createError({
      statusCode: 429,
      message: serverT(locale, 'statements.monthlyLimit', { limit: STATEMENT_MONTHLY_LIMIT }),
      data: { error: 'statements_monthly_limit' },
    })
  }
  const doc = await StatementImport.create({ userId })
  return { id: String(doc._id) }
})
