import mongoose from 'mongoose'
import { Transaction, AiInsightCache } from '../../models'
import { requireFeature } from '../../utils/requireFeature'
import { generateStructuredJson } from '../../utils/anthropic'
import { getServerLocale, type ServerLocale } from '../../utils/i18n'

// Interpretação de estatísticas com IA (Pro + Premium) — Fase 3, tarefa 4.
// Só agregados já calculados vão para o LLM (nunca descrições de transações
// em bruto — podem conter texto sensível). Cache de 24h por utilizador via
// AiInsightCache para controlar o custo de chamadas à Anthropic.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

const RESPONSE_LANGUAGE_NAME: Record<ServerLocale, string> = {
  'pt-PT': 'português europeu (PT-PT)',
  en: 'English',
  fr: 'français',
  de: 'Deutsch',
  it: 'italiano',
  es: 'español',
}

// Prompt fixo, versionado no código (não editável em runtime) — ver
// context/features/03-FASE-3-insights-ia.md tarefa 4. Fase 7 — segue o
// idioma ativo da UI.
function buildSystemPrompt(locale: ServerLocale): string {
  return `És um assistente financeiro que interpreta agregados financeiros já
calculados de um utilizador e devolve JSON estruturado em ${RESPONSE_LANGUAGE_NAME[locale]}.
Recebes apenas números e nomes de categoria — nunca descrições de transações
individuais. Gera entre 2 e 3 insights (observações concretas sobre padrões
nos dados, ex. tendências de poupança, categorias com maior peso) e entre 1 e
2 sugestões de melhoria (ações práticas e específicas aos dados recebidos).
Não inventes números que não estejam nos dados. Tom direto e não genérico.`
}

interface StatsInsightResult {
  insights: string[]
  suggestions: string[]
}

export default defineEventHandler(async (event) => {
  const { userId } = await requireFeature(event, 'aiStatsInsights')
  const body = await readBody<{ months?: number }>(event).catch(() => ({}))
  const months = Math.max(1, Math.min(24, body?.months || 6))
  const locale = getServerLocale(event)

  const cached = await AiInsightCache.findOne({ userId }).lean()
  if (
    cached &&
    (cached.locale || 'pt-PT') === locale &&
    Date.now() - new Date(cached.generatedAt).getTime() < CACHE_TTL_MS
  ) {
    return { insights: cached.insights, suggestions: cached.suggestions, generatedAt: cached.generatedAt, cached: true }
  }

  const uid = new mongoose.Types.ObjectId(userId)
  const now = new Date()
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)

  const [monthlyRaw, categoryRaw] = await Promise.all([
    Transaction.aggregate([
      { $match: { userId: uid, date: { $gte: rangeStart } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Transaction.aggregate([
      { $match: { userId: uid, type: 'expense', date: { $gte: rangeStart } } },
      { $group: { _id: '$categoryId', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $sort: { total: -1 } },
      { $limit: 8 },
    ]),
  ])

  const monthlyMap: Record<string, { income: number; expense: number }> = {}
  for (const r of monthlyRaw as any[]) {
    const key = `${r._id.year}-${String(r._id.month).padStart(2, '0')}`
    monthlyMap[key] = monthlyMap[key] || { income: 0, expense: 0 }
    monthlyMap[key][r._id.type as 'income' | 'expense'] = r.total
  }
  const monthly = Object.entries(monthlyMap).map(([month, v]) => ({
    month,
    income: v.income,
    expense: v.expense,
    balance: v.income - v.expense,
  }))

  const totalIncome = monthly.reduce((s, m) => s + m.income, 0)
  const totalExpense = monthly.reduce((s, m) => s + m.expense, 0)
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0

  const topExpenseCategories = (categoryRaw as any[]).map((r) => ({
    name: r.category?.name || 'Sem categoria',
    total: r.total,
    count: r.count,
  }))

  const aggregates = { months, totalIncome, totalExpense, savingsRate, monthly, topExpenseCategories }

  const result = await generateStructuredJson<StatsInsightResult>({
    system: buildSystemPrompt(locale),
    prompt: `Agregados financeiros do utilizador (JSON):\n${JSON.stringify(aggregates)}`,
    schema: {
      type: 'object',
      properties: {
        insights: { type: 'array', items: { type: 'string' } },
        suggestions: { type: 'array', items: { type: 'string' } },
      },
      required: ['insights', 'suggestions'],
    },
    maxTokens: 700,
  })

  const generatedAt = new Date()
  await AiInsightCache.findOneAndUpdate(
    { userId },
    { userId, months, insights: result.insights, suggestions: result.suggestions, generatedAt, locale },
    { upsert: true }
  )

  return { insights: result.insights, suggestions: result.suggestions, generatedAt, cached: false }
})
