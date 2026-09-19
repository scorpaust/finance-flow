import { requireAuth } from '../../../utils/auth'
import { checkPendingPayment } from '../../../utils/subscriptionSync'

// Confirmação manual de um pagamento MB WAY/Multibanco 'pending' — botão
// "Verificar pagamento" na página de subscrição. Em produção, o webhook trata
// isto automaticamente assim que a EasyPay notifica o pagamento; isto serve
// tanto para o utilizador confirmar mais depressa sem esperar, como (em
// desenvolvimento local) para conseguir mesmo testar o fluxo, já que a
// EasyPay não consegue entregar o webhook a um `localhost` não exposto
// publicamente.
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const result = await checkPendingPayment(userId)
  return result
})
