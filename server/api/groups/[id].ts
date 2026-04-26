import mongoose from 'mongoose'
import { Category, TransactionGroup, Transaction } from '../../models'
import { requireAuth, sanitizeId } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const method = getMethod(event)
  const id = sanitizeId(getRouterParam(event, 'id') || '')
  const uid = new mongoose.Types.ObjectId(userId)

  const group = await TransactionGroup.findOne({ _id: id, userId })
  if (!group) throw createError({ statusCode: 404, message: 'Group not found' })

  if (method === 'GET') {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const categoryIds = await Category.find({ userId, groupId: group._id }).distinct('_id')
    const groupFilter = { userId, $or: [{ groupId: id }, { categoryId: { $in: categoryIds } }] }
    const [transactions, stats] = await Promise.all([
      Transaction.find(groupFilter)
        .populate('categoryId', 'name icon color')
        .sort({ date: -1 })
        .lean(),
      Transaction.aggregate([
        { $match: { userId: uid, date: { $gte: startOfMonth }, $or: [{ groupId: group._id }, { categoryId: { $in: categoryIds } }] } },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
    ])

    const inc = stats.find((s: any) => s._id === 'income') || { total: 0, count: 0 }
    const exp = stats.find((s: any) => s._id === 'expense') || { total: 0, count: 0 }

    return {
      group,
      transactions,
      stats: {
        income: inc.total,
        expense: exp.total,
        balance: inc.total - exp.total,
        count: inc.count + exp.count,
        monthlyLimit: group.monthlyLimit || 0,
        percentUsed: group.monthlyLimit ? (exp.total / group.monthlyLimit) * 100 : 0,
      },
    }
  }

  if (method === 'PUT') {
    const body = await readBody(event)
    const { name, description, color, monthlyLimit, weeklyLimit, alertThreshold } = body
    if (name !== undefined) group.name = name.trim()
    if (description !== undefined) group.description = description?.trim()
    if (color !== undefined) group.color = color
    if (monthlyLimit !== undefined) group.monthlyLimit = Number(monthlyLimit || 0)
    if (weeklyLimit !== undefined) group.weeklyLimit = Number(weeklyLimit || 0)
    if (alertThreshold !== undefined) group.alertThreshold = Number(alertThreshold || 80)
    await group.save()
    return group
  }

  if (method === 'DELETE') {
    await Transaction.updateMany({ userId, groupId: id }, { $set: { groupId: null } })
    await group.deleteOne()
    return { success: true }
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})
