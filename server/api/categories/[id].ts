import { Category, Transaction } from '../../models'
import { requireAuth, sanitizeId } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const method = getMethod(event)
  const id = sanitizeId(getRouterParam(event, 'id') || '')

  const cat = await Category.findOne({ _id: id, userId })
  if (!cat) throw createError({ statusCode: 404, message: 'Category not found' })

  if (method === 'PUT') {
    const body = await readBody(event)
    const { name, type, icon, color } = body
    if (name !== undefined) cat.name = name.trim()
    if (type !== undefined) cat.type = type
    if (icon !== undefined) cat.icon = icon
    if (color !== undefined) cat.color = color
    await cat.save()
    return cat
  }

  if (method === 'DELETE') {
    const txCount = await Transaction.countDocuments({ userId, categoryId: id })
    if (txCount > 0) {
      throw createError({ statusCode: 409, message: `Cannot delete: category used in ${txCount} transaction(s)` })
    }
    await cat.deleteOne()
    return { success: true }
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})
