import { Transaction, Category } from '../../models'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const method = getMethod(event)

  // ──────────── GET: list transactions ────────────
  if (method === 'GET') {
    const query = getQuery(event)
    const {
      type,
      categoryId,
      groupId,
      startDate,
      endDate,
      search,
      page = '1',
      limit = '20',
      sortBy = 'date',
      sortOrder = 'desc',
    } = query as Record<string, string>

    const filter: Record<string, any> = { userId }

    if (type && type !== 'all') filter.type = type
    if (categoryId) filter.categoryId = categoryId
    if (groupId) filter.groupId = groupId === 'none' ? null : groupId

    if (startDate || endDate) {
      filter.date = {}
      if (startDate) filter.date.$gte = new Date(startDate)
      if (endDate) filter.date.$lte = new Date(endDate + 'T23:59:59.999Z')
    }

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ]
    }

    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(100, parseInt(limit))
    const skip = (pageNum - 1) * limitNum
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('categoryId', 'name icon color type')
        .populate('groupId', 'name color')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Transaction.countDocuments(filter),
    ])

    return {
      data: transactions,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    }
  }

  // ──────────── POST: create transaction ────────────
  if (method === 'POST') {
    const body = await readBody(event)
    const { type, amount, description, categoryId, date, tags, recurrence, notes, groupId } = body

    if (!type || !amount || !description || !categoryId || !date) {
      throw createError({ statusCode: 400, message: 'Missing required fields' })
    }

    const category = await Category.findOne({ _id: categoryId, userId }).lean()
    if (!category) throw createError({ statusCode: 400, message: 'Invalid category' })

    const tx = await Transaction.create({
      userId,
      type,
      amount: parseFloat(amount),
      description: description.trim(),
      categoryId,
      date: new Date(date),
      tags: tags || [],
      recurrence: recurrence || 'none',
      notes: notes?.trim(),
      groupId: groupId || (category as any).groupId || null,
    })

    await tx.populate('categoryId', 'name icon color type')
    return tx
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})
