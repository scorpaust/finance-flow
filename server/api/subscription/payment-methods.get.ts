import { requireAuth } from '../../utils/auth'
import { getRequestIp, lookupCountry } from '../../utils/geo'
import { prepaidMethodsForCountry } from '../../../shared/paymentMethods'

// Fase 7, tarefa 4 — o client usa isto só para decidir que separador de
// pagamento mostrar (esconder MB WAY/Multibanco fora de Portugal); a
// validação que importa de facto está em create-prepaid.post.ts, que nunca
// confia neste resultado vindo do client.
export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const country = await lookupCountry(getRequestIp(event))
  return { country, prepaidMethods: prepaidMethodsForCountry(country) }
})
