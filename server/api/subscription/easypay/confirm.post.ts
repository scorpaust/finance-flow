import { requireAuth } from '../../../utils/auth'
import { syncFromCheckout } from '../../../utils/subscriptionSync'
import { User } from '../../../models'

// Chamado pelo client logo depois do onSuccess do @easypaypt/checkout-sdk
// (ver pages/subscription/index.vue), com o `id` do checkout devolvido pelo
// nosso próprio servidor ao criá-lo (manifest.id) — não o `payment.id` que o
// SDK devolve no onSuccess, que em sandbox não bateu certo com nenhum dos
// endpoints de leitura diretos (ver nota em server/utils/subscriptionSync.ts).
// Existe porque o webhook (server/api/subscription/easypay/webhook.post.ts)
// não é fiável em desenvolvimento local — a EasyPay não consegue entregar um
// POST a um `localhost` não exposto publicamente. Em produção, o webhook
// continua a ser o caminho principal; isto é só um atalho para o mesmo
// resultado, idempotente. Segurança: nunca confia no corpo do pedido para
// decidir QUEM atualizar — a mesma lógica só escreve no utilizador cujo `key`
// (codificado no momento da criação do checkout) vem de volta confirmado
// pela própria API EasyPay. `requireAuth` só exige sessão válida.
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const body = await readBody<{ checkoutId?: string }>(event)

  if (!body?.checkoutId) {
    throw createError({ statusCode: 400, message: '"checkoutId" é obrigatório' })
  }

  await syncFromCheckout(body.checkoutId)

  const user = await User.findById(userId).select('subscription').lean()
  return { subscription: user?.subscription }
})
