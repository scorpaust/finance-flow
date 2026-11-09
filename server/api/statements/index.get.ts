import { requireAuth } from '../../utils/auth'
import { statementState } from '../../utils/statementImport'

// Importações usadas este mês e a última importada (para "Desfazer").
export default defineEventHandler(async (event) => statementState(await requireAuth(event)))
