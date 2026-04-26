import mongoose from 'mongoose'
import { Transaction } from '../../models'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const query = getQuery(event) as { months?: string }
  const historyMonths = parseInt(query.months || '12')
  const uid = new mongoose.Types.ObjectId(userId)

  const now = new Date()
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - historyMonths, 1)

  // Aggregate daily totals
  const [daily, monthly] = await Promise.all([
    Transaction.aggregate([
      { $match: { userId: uid, date: { $gte: rangeStart } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            type: '$type',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]),
    Transaction.aggregate([
      { $match: { userId: uid, date: { $gte: rangeStart } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ])

  // Build ordered date series
  const dateMap: Record<string, { income: number; expense: number }> = {}
  for (let i = 0; i <= historyMonths * 31; i++) {
    const d = new Date(rangeStart)
    d.setDate(d.getDate() + i)
    if (d > now) break
    const key = d.toISOString().split('T')[0]
    dateMap[key] = { income: 0, expense: 0 }
  }
  for (const r of daily) {
    const key = r._id.date
    if (dateMap[key]) {
      dateMap[key][r._id.type as 'income' | 'expense'] = r.total
    }
  }

  const dailySeries = Object.entries(dateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, val]) => ({ date, ...val }))

  // Monthly aggregates
  const monthlyMap: Record<string, { income: number; expense: number }> = {}
  for (const r of monthly) {
    const key = `${r._id.year}-${String(r._id.month).padStart(2, '0')}`
    if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expense: 0 }
    monthlyMap[key][r._id.type as 'income' | 'expense'] = r.total
  }

  const monthlySeries = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, val]) => ({ month, ...val, balance: val.income - val.expense }))

  return {
    dailySeries,
    monthlySeries,
    meta: {
      start: rangeStart.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0],
      totalDays: dailySeries.length,
      totalMonths: monthlySeries.length,
    },
  }
})
