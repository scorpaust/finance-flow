import { requireCronSecret } from '../../../utils/cron'
import { processGooglePlayQueue } from '../../../utils/googlePlayBilling'

// Fase 9 — fila de reportes à Google Play (alternative billing only), chamada
// de hora a hora por .github/workflows/cron.yml com o header `x-cron-secret`.
// Repete os reportes que falharam e recupera compras da app cuja confirmação
// não passou por confirm.post.ts (ver server/utils/googlePlayBilling.ts). A
// Google exige cada transação reportada em até 24 h.
export default defineEventHandler(async (event) => {
  requireCronSecret(event)
  return processGooglePlayQueue()
})
