import { PendingPayPalOrder } from '../../../models'
import { requireAuth } from '../../../utils/auth'

// Permite ao utilizador limpar uma referência MB WAY/Multibanco por pagar
// (ex. desistiu, ou a PayPal nunca mandou PAYMENT.CAPTURE.DENIED) sem ter de
// esperar pelo TTL de 14 dias — não cancela nada do lado da PayPal (essas
// referências não são canceláveis via API), só deixa de aparecer nesta app.
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await PendingPayPalOrder.deleteMany({ userId })
  return { success: true }
})
