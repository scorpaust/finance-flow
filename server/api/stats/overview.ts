import mongoose from 'mongoose'
import { Transaction, TransactionGroup } from '../../models'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const query = getQuery(event) as { months?: string }
  const months = parseInt(query.months || '12')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)
  const uid = new mongoose.Types.ObjectId(userId)

  const [currentMonth, prevMonth, totals, monthly, byCategoryRaw, groups, byGroupRaw] = await Promise.all([
    Transaction.aggregate([
      { $match: { userId: uid, date: { $gte: startOfMonth } } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Transaction.aggregate([
      { $match: { userId: uid, date: { $gte: prevMonthStart, $lte: prevMonthEnd } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      { $match: { userId: uid } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Transaction.aggregate([
      { $match: { userId: uid, date: { $gte: rangeStart } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Transaction.aggregate([
      { $match: { userId: uid, date: { $gte: rangeStart } } },
      {
        $group: {
          _id: { categoryId: '$categoryId', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
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
      { $limit: 10 },
    ]),
    TransactionGroup.find({ userId }).lean(),
    Transaction.aggregate([
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
      { $group: { _id: '$budgetGroupId', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
  ])

  // Process current month
  const cm = { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 }
  for (const r of currentMonth) {
    if (r._id === 'income') { cm.income = r.total; cm.incomeCount = r.count }
    else { cm.expense = r.total; cm.expenseCount = r.count }
  }

  const pm = { income: 0, expense: 0 }
  for (const r of prevMonth) {
    if (r._id === 'income') pm.income = r.total
    else pm.expense = r.total
  }

  const tt = { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 }
  for (const r of totals) {
    if (r._id === 'income') { tt.income = r.total; tt.incomeCount = r.count }
    else { tt.expense = r.total; tt.expenseCount = r.count }
  }

  // Build monthly time series
  const monthlyMap: Record<string, { income: number; expense: number; count: number }> = {}
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyMap[key] = { income: 0, expense: 0, count: 0 }
  }
  for (const r of monthly) {
    const key = `${r._id.year}-${String(r._id.month).padStart(2, '0')}`
    if (monthlyMap[key]) {
      monthlyMap[key][r._id.type as 'income' | 'expense'] = r.total
      monthlyMap[key].count += r.count
    }
  }

  const monthlyArray = Object.entries(monthlyMap).map(([key, val]) => ({
    month: key,
    ...val,
    balance: val.income - val.expense,
  }))

  const avgIncome = monthlyArray.reduce((s, m) => s + m.income, 0) / (monthlyArray.length || 1)
  const avgExpense = monthlyArray.reduce((s, m) => s + m.expense, 0) / (monthlyArray.length || 1)

  const groupSpendMap = new Map(byGroupRaw.map((r: any) => [r._id.toString(), r]))
  const budgetGroups = groups
    .filter((g: any) => (g.monthlyLimit || 0) > 0)
    .map((g: any) => {
      const spend = groupSpendMap.get(g._id.toString()) as any
      const spent = spend?.total || 0
      const limit = g.monthlyLimit || 0
      const percent = limit > 0 ? (spent / limit) * 100 : 0
      const threshold = g.alertThreshold || 80
      return {
        _id: g._id,
        name: g.name,
        color: g.color,
        monthlyLimit: limit,
        weeklyLimit: g.weeklyLimit || 0,
        alertThreshold: threshold,
        spent,
        remaining: limit - spent,
        percent,
        status: percent >= 100 ? 'danger' : percent >= threshold ? 'warning' : 'ok',
      }
    })
    .sort((a: any, b: any) => b.percent - a.percent)

  return {
    overview: {
      currentBalance: tt.income - tt.expense,
      currentMonthIncome: cm.income,
      currentMonthExpense: cm.expense,
      currentMonthBalance: cm.income - cm.expense,
      currentMonthTransactions: cm.incomeCount + cm.expenseCount,
      savingsRate: cm.income > 0 ? ((cm.income - cm.expense) / cm.income) * 100 : 0,
      incomeChange: pm.income > 0 ? ((cm.income - pm.income) / pm.income) * 100 : 0,
      expenseChange: pm.expense > 0 ? ((cm.expense - pm.expense) / pm.expense) * 100 : 0,
      avgMonthlyIncome: avgIncome,
      avgMonthlyExpense: avgExpense,
      totalTransactions: tt.incomeCount + tt.expenseCount,
    },
    monthly: monthlyArray,
    topCategories: byCategoryRaw.map((r: any) => ({
      _id: r._id.categoryId,
      type: r._id.type,
      name: r.category?.name || 'Unknown',
      icon: r.category?.icon || '💰',
      color: r.category?.color || '#6366f1',
      total: r.total,
      count: r.count,
    })),
    budgetGroups,
    budgetAlerts: budgetGroups.filter((g: any) => g.status !== 'ok'),
  }
})
