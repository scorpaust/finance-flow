import mongoose from 'mongoose'
import { Transaction } from '../../models'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const query = getQuery(event) as {
    type?: string
    startDate?: string
    endDate?: string
    months?: string
  }

  const uid = new mongoose.Types.ObjectId(userId)
  const filter: Record<string, any> = { userId: uid }

  if (query.type && query.type !== 'all') filter.type = query.type

  if (query.startDate || query.endDate) {
    filter.date = {}
    if (query.startDate) filter.date.$gte = new Date(query.startDate)
    if (query.endDate) filter.date.$lte = new Date(query.endDate + 'T23:59:59.999Z')
  } else if (query.months) {
    const start = new Date()
    start.setMonth(start.getMonth() - parseInt(query.months))
    start.setDate(1)
    filter.date = { $gte: start }
  }

  const [byCategory, byTag, byRecurrence] = await Promise.all([
    Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { categoryId: '$categoryId', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avg: { $avg: '$amount' },
          min: { $min: '$amount' },
          max: { $max: '$amount' },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id.categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $sort: { total: -1 } },
    ]),
    Transaction.aggregate([
      { $match: filter },
      { $unwind: { path: '$tags', preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: { tag: '$tags', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 20 },
    ]),
    Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$recurrence',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
  ])

  return {
    byCategory: byCategory.map((r: any) => ({
      categoryId: r._id.categoryId,
      type: r._id.type,
      name: r.category?.name || 'Unknown',
      icon: r.category?.icon || '💰',
      color: r.category?.color || '#6366f1',
      total: r.total,
      count: r.count,
      avg: r.avg,
      min: r.min,
      max: r.max,
    })),
    byTag: byTag.map((r: any) => ({
      tag: r._id.tag,
      type: r._id.type,
      total: r.total,
      count: r.count,
    })),
    byRecurrence: byRecurrence.map((r: any) => ({
      recurrence: r._id,
      total: r.total,
      count: r.count,
    })),
  }
})
