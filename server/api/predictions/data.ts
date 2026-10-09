import mongoose from 'mongoose'
import { readMonthsQuery } from '../../utils/queryFilters'
import { Transaction } from '../../models'
import { requireFeature } from '../../utils/requireFeature'
import { currentMonthKey, splitCompleteMonths, PREDICTION_MIN_MONTHS } from '../../../shared/forecast'

export default defineEventHandler(async (event) => {
  const { userId } = await requireFeature(event, 'predictions')
  const historyMonths = await readMonthsQuery(event, 12)
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

  const allMonths = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, val]) => ({ month, ...val, balance: val.income - val.expense }))

  // Upgrade 04 — o mês em curso está incompleto (a 8 de outubro só tem o
  // salário e a renda): puxava as médias para baixo e ensinava ao modelo uma
  // "queda" no fim da série. `monthlySeries` leva só meses completos; o mês
  // atual vai à parte, para o gráfico o mostrar como "em curso".
  const thisMonth = currentMonthKey(now)
  const { complete, current } = splitCompleteMonths(allMonths, thisMonth)

  return {
    dailySeries,
    monthlySeries: complete,
    currentMonth: current || { month: thisMonth, income: 0, expense: 0, balance: 0 },
    meta: {
      start: rangeStart.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0],
      totalDays: dailySeries.length,
      totalMonths: complete.length,
      minMonths: PREDICTION_MIN_MONTHS,
    },
  }
})
