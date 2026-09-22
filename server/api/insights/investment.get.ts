import { requireFeature } from '../../utils/requireFeature'
import { getCachedTips } from '../../utils/investmentTips'
import { getServerLocale } from '../../utils/i18n'

// Devolve as últimas dicas geradas SEM chamar a Anthropic — a página
// /investimento usa-o ao abrir, em vez de gerar dicas (e pagar um pedido) a cada
// visita. Mesmo gate de investment.post.ts.
export default defineEventHandler(async (event) => {
  const { userId } = await requireFeature(event, 'aiInvestmentTips')
  return getCachedTips(userId, getServerLocale(event))
})
