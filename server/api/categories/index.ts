import { Category } from '../../models'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const method = getMethod(event)

  if (method === 'GET') {
    const query = getQuery(event) as { type?: string }
    const filter: Record<string, any> = { userId }
    if (query.type && query.type !== 'all') {
      filter.type = { $in: [query.type, 'both'] }
    }
    // Sort by order (groups categories logically) then by name
    const categories = await Category.find(filter).sort({ order: 1, name: 1 }).lean()
    return categories
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const { name, type, icon, color } = body
    if (!name || !type) throw createError({ statusCode: 400, message: 'Nome e tipo obrigatórios' })

    const existing = await Category.findOne({
      userId,
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    })
    if (existing) throw createError({ statusCode: 409, message: 'Categoria já existe' })

    const cat = await Category.create({
      userId,
      name:  name.trim(),
      type,
      icon:  icon  || '💰',
      color: color || '#6366f1',
      order: 99,
    })
    return cat
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})
