import { MarketSnapshot } from '../../models'
import { fetchMarketSnapshot } from '../../utils/marketData'

// Job diário do snapshot de mercado (Fase 3, tarefa 5) — mesmo padrão do cron
// de server/api/subscription/check-expirations.post.ts: sem scheduler no
// projeto, desenhado para ser invocado por um cron externo com o header
// `x-cron-secret` a bater com CRON_SECRET. Um documento por dia
// (`MarketSnapshot.date`), partilhado por todos os utilizadores Premium —
// se já existir um snapshot para hoje, não volta a chamar a Twelve Data
// (protege o limite de 800 pedidos/dia mesmo que o cron externo corra mais
// do que uma vez no mesmo dia).
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const providedSecret = getHeader(event, 'x-cron-secret')

  if (!config.cronSecret || providedSecret !== config.cronSecret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const today = new Date().toISOString().slice(0, 10)

  const existing = await MarketSnapshot.findOne({ date: today }).lean()
  if (existing) {
    return { skipped: true, snapshot: existing }
  }

  const indices = await fetchMarketSnapshot()
  const snapshot = await MarketSnapshot.findOneAndUpdate(
    { date: today },
    { date: today, indices, fetchedAt: new Date() },
    { upsert: true, new: true }
  )

  return { skipped: false, snapshot }
})
