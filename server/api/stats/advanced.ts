import mongoose from 'mongoose'
import { Transaction } from '../../models'
import { requireFeature } from '../../utils/requireFeature'

const HISTOGRAM_BINS = 10
const MIN_TRANSACTIONS_FOR_BOXPLOT = 3

function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base
  return sorted[base + 1] !== undefined
    ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
    : sorted[base]
}

function boxplotStats(amounts: number[]) {
  const sorted = [...amounts].sort((a, b) => a - b)
  const q1 = quantile(sorted, 0.25)
  const median = quantile(sorted, 0.5)
  const q3 = quantile(sorted, 0.75)
  const iqr = q3 - q1
  const lowerFence = q1 - 1.5 * iqr
  const upperFence = q3 + 1.5 * iqr

  const inRange = sorted.filter((v) => v >= lowerFence && v <= upperFence)
  const outliers = sorted.filter((v) => v < lowerFence || v > upperFence)

  return {
    min: inRange[0] ?? sorted[0],
    q1,
    median,
    q3,
    max: inRange[inRange.length - 1] ?? sorted[sorted.length - 1],
    outliers,
  }
}

function histogram(amounts: number[]) {
  if (!amounts.length) return []
  const min = Math.min(...amounts)
  const max = Math.max(...amounts)
  if (min === max) return [{ rangeStart: min, rangeEnd: max, count: amounts.length }]

  const binSize = (max - min) / HISTOGRAM_BINS
  const bins = Array.from({ length: HISTOGRAM_BINS }, (_, i) => ({
    rangeStart: min + i * binSize,
    rangeEnd: min + (i + 1) * binSize,
    count: 0,
  }))
  for (const amount of amounts) {
    const idx = Math.min(HISTOGRAM_BINS - 1, Math.floor((amount - min) / binSize))
    bins[idx].count++
  }
  return bins
}

export default defineEventHandler(async (event) => {
  const { userId } = await requireFeature(event, 'statsAdvanced')
  const query = getQuery(event) as { months?: string }
  const months = parseInt(query.months || '6')

  const uid = new mongoose.Types.ObjectId(userId)
  const start = new Date()
  start.setMonth(start.getMonth() - months)
  start.setDate(1)

  const byCategory = await Transaction.aggregate([
    { $match: { userId: uid, type: 'expense', date: { $gte: start } } },
    { $group: { _id: '$categoryId', amounts: { $push: '$amount' } } },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
  ])

  const boxplot = byCategory
    .filter((c: any) => c.amounts.length >= MIN_TRANSACTIONS_FOR_BOXPLOT)
    .map((c: any) => ({
      categoryId: c._id,
      name: c.category?.name || 'Sem categoria',
      icon: c.category?.icon || '💰',
      color: c.category?.color || '#6366f1',
      count: c.amounts.length,
      ...boxplotStats(c.amounts),
    }))
    .sort((a: any, b: any) => b.median - a.median)

  const allAmounts = byCategory.flatMap((c: any) => c.amounts)

  return {
    distribution: histogram(allAmounts),
    boxplot,
    meta: { totalTransactions: allAmounts.length, months },
  }
})
