import { StatementImport } from '../models'
import { STATEMENT_MONTHLY_LIMIT } from '../../shared/statementImport'

// Importação de extratos (shared/statementImport.ts): o que é comum aos endpoints.

function monthStart(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

export function statementImportsThisMonth(userId: string) {
  return StatementImport.countDocuments({ userId, createdAt: { $gte: monthStart() } })
}

// Quantas importações restam este mês e a última importada (para "Desfazer").
export async function statementState(userId: string) {
  const [used, last] = await Promise.all([
    statementImportsThisMonth(userId),
    StatementImport.findOne({ userId, status: 'committed' }).sort({ committedAt: -1 }).lean(),
  ])
  return {
    used,
    limit: STATEMENT_MONTHLY_LIMIT,
    last: last && { id: String(last._id), created: last.created, updated: last.updated.length, committedAt: last.committedAt },
  }
}

export async function findImport(userId: string, id: string) {
  return /^[a-f0-9]{24}$/i.test(id) ? StatementImport.findOne({ _id: id, userId }) : null
}
