import { requireCronSecret } from '../../../utils/cron'
import { isPlayConfigured, reconcilePlaySubscriptions } from '../../../utils/googlePlay'

// Upgrade 01 — rede de segurança para as notificações da Google Play (RTDN):
// volta a ler na Google as subscrições Play a expirar ou com a confirmação em
// falta. Chamado uma vez por dia por .github/workflows/cron.yml com o header
// `x-cron-secret`.
export default defineEventHandler(async (event) => {
  requireCronSecret(event)
  if (!isPlayConfigured()) return { checked: 0, failed: 0, configured: false }
  return { ...(await reconcilePlaySubscriptions()), configured: true }
})
