import mongoose from 'mongoose'
import { TransactionGroup, Transaction } from '../../models'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const method = getMethod(event)
  const uid = new mongoose.Types.ObjectId(userId)

  if (method === 'GET') {
    const groups = await TransactionGroup.find({ userId }).sort({ createdAt: -1 }).lean()
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const counts = await Transaction.aggregate([
      { $match: { userId: uid, type: 'expense', date: { $gte: startOfMonth } } },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $addFields: { budgetGroupId: { $ifNull: ['$groupId', '$category.groupId'] } } },
      { $match: { budgetGroupId: { $ne: null } } },
      { $group: { _id: '$budgetGroupId', count: { $sum: 1 }, total: { $sum: '$amount' } } },
    ])
    const countMap: Record<string, { count: number; total: number }> = {}
    counts.forEach((c: any) => {
      countMap[c._id.toString()] = { count: c.count, total: c.total }
    })

    return groups.map((g: any) => ({
      ...g,
      transactionCount: countMap[g._id.toString()]?.count || 0,
      monthlySpent: countMap[g._id.toString()]?.total || 0,
      total: countMap[g._id.toString()]?.total || 0,
    }))
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const { name, description, color, monthlyLimit, weeklyLimit, alertThreshold } = body
    if (!name) throw createError({ statusCode: 400, message: 'Name required' })

    const group = await TransactionGroup.create({
      userId,
      name: name.trim(),
      description: description?.trim(),
      color: color || '#6366f1',
      monthlyLimit: Number(monthlyLimit || 0),
      weeklyLimit: Number(weeklyLimit || 0),
      alertThreshold: Number(alertThreshold || 80),
    })
    return group
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})
