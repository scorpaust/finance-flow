import { Investment } from '../../models'
import { requireFeature } from '../../utils/requireFeature'
import { sanitizeId } from '../../utils/auth'
import { parseInvestmentUpdate, toInvestmentDto } from '../../utils/investments'

// Edição parcial e eliminação de uma posição (Fase 6). Todas as queries filtram
// pelo userId do pedido; um _id de outro utilizador devolve 404, nunca 403 —
// não se confirma que o registo existe.
export default defineEventHandler(async (event) => {
  const { userId } = await requireFeature(event, 'investmentTracker')
  const method = getMethod(event)
  const id = sanitizeId(getRouterParam(event, 'id') || '')

  const doc = await Investment.findOne({ _id: id, userId })
  if (!doc) throw createError({ statusCode: 404, message: 'Investimento não encontrado' })

  if (method === 'PUT') {
    const changes = parseInvestmentUpdate(await readBody(event))

    // valueUpdatedAt só muda quando a Situação muda (editar só o nome não conta).
    const valueChanged = changes.currentValue !== undefined && changes.currentValue !== doc.currentValue

    if (changes.name !== undefined) doc.name = changes.name
    if (changes.assetClass !== undefined) doc.assetClass = changes.assetClass ?? undefined
    if (changes.initialAmount !== undefined) doc.initialAmount = changes.initialAmount
    if (changes.initialDate !== undefined) doc.initialDate = changes.initialDate
    if (changes.reinforcement !== undefined) doc.reinforcement = changes.reinforcement
    if (changes.currentValue !== undefined) doc.currentValue = changes.currentValue
    if (valueChanged) doc.valueUpdatedAt = new Date()

    await doc.save()
    return toInvestmentDto(doc)
  }

  if (method === 'DELETE') {
    await doc.deleteOne()
    return { success: true }
  }

  if (method === 'GET') return toInvestmentDto(doc)

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})
