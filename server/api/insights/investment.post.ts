import { requireFeature } from '../../utils/requireFeature'
import { generateTips } from '../../utils/investmentTips'
import { getServerLocale } from '../../utils/i18n'
import { enforceRateLimit } from '../../utils/rateLimit'

// Dicas de investimento educativas (Premium) — Fase 3, tarefa 5, com cache e
// integração opcional com o portfolio na Fase 6 (tarefa 6). A lógica vive em
// server/utils/investmentTips.ts, partilhada com investment.get.ts.
export default defineEventHandler(async (event) => {
  const { userId } = await requireFeature(event, 'aiInvestmentTips')
  // Fase 8, ponto 1 — mesmo balde que insights/stats.post.ts: protege o custo
  // combinado das duas funcionalidades de IA por utilizador, mesmo que aqui
  // ainda conte também os pedidos servidos pela cache de 24h (mais simples
  // que separar cache-hit de cache-miss antes de chamar generateTips).
  enforceRateLimit(event, { name: 'ai-generate', limit: 20, windowSeconds: 60 * 60, identity: userId })
  return generateTips(userId, getServerLocale(event))
})
