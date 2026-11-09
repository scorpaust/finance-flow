import { requireAuth } from '../../utils/auth'
import { reorgState } from '../../utils/aiReorganize'

// Estado da reorganização com IA: elegibilidade, pedidos usados no mês e a
// última proposta. Sem verificar o plano: a app mostra o paywall a quem não
// for Premium, e os pedidos (POST) exigem-no.
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  return reorgState(userId)
})
