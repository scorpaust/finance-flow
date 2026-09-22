import { requireFeature } from '../../utils/requireFeature'
import { generateTips } from '../../utils/investmentTips'
import { getServerLocale } from '../../utils/i18n'

// Dicas de investimento educativas (Premium) — Fase 3, tarefa 5, com cache e
// integração opcional com o portfolio na Fase 6 (tarefa 6). A lógica vive em
// server/utils/investmentTips.ts, partilhada com investment.get.ts.
export default defineEventHandler(async (event) => {
  const { userId } = await requireFeature(event, 'aiInvestmentTips')
  return generateTips(userId, getServerLocale(event))
})
