import mongoose from 'mongoose'
import { Transaction, MarketSnapshot, User } from '../../models'
import type { IInvestorProfile } from '../../models'
import { requireFeature } from '../../utils/requireFeature'
import { generateStructuredJson } from '../../utils/anthropic'
import { isProfileValid } from '../../utils/investorProfile'

// Dicas de investimento educativas (Premium) — Fase 3, tarefa 5. Nunca
// recomendações de investimento específicas (risco regulatório CMVM) — o
// prompt proíbe nomear tickers/ativos, e o disclaimer é hardcoded aqui (não
// gerado pelo LLM) para garantir que nunca falta.
const DISCLAIMER =
  'Isto não é aconselhamento financeiro. As dicas seguintes são educativas e ' +
  'genéricas, adaptadas ao teu perfil de risco — não constituem recomendação ' +
  'de compra ou venda de nenhum ativo específico. Antes de investir, considera ' +
  'falar com um consultor financeiro certificado.'

// Prompt fixo, versionado no código — ver context/features/03-FASE-3-insights-ia.md
// tarefa 5. Regra não negociável sem validação legal: nunca nomear
// tickers/ativos específicos.
const SYSTEM_PROMPT = `És um assistente educativo de literacia financeira para um utilizador
português. Recebes o perfil de investidor dele (tolerância ao risco,
horizonte temporal, conhecimento, objetivos), um resumo agregado das
finanças pessoais dele e um snapshot do contexto geral de mercado.
Gera 3 a 5 dicas educativas em PT-PT, adaptadas ao perfil de risco.

Regras obrigatórias, sem exceção:
- Nunca nomeies um ticker ou ativo específico para comprar ou vender
  (ex. nunca "compra ações da X" ou "investe em Y").
- Fala apenas de classes de ativos e conceitos gerais (ex. "ETFs
  diversificados", "obrigações do tesouro", "fundos de índice", "fundo de
  emergência antes de investir").
- Adapta a linguagem ao knowledgeLevel do utilizador (mais simples para
  iniciante).
- Nunca prometas retornos ou uses linguagem de certeza sobre o mercado.`

interface InvestmentTipsResult {
  tips: string[]
}

export default defineEventHandler(async (event) => {
  const { userId } = await requireFeature(event, 'aiInvestmentTips')

  const user = await User.findById(userId)
    .select('investorProfile')
    .lean<{ investorProfile?: IInvestorProfile }>()
  const profile = user?.investorProfile

  if (!isProfileValid(profile)) {
    return { needsProfile: true }
  }

  const snapshot = await MarketSnapshot.findOne().sort({ date: -1 }).lean()

  const uid = new mongoose.Types.ObjectId(userId)
  const rangeStart = new Date()
  rangeStart.setMonth(rangeStart.getMonth() - 5)
  rangeStart.setDate(1)

  const totalsRaw = await Transaction.aggregate([
    { $match: { userId: uid, date: { $gte: rangeStart } } },
    { $group: { _id: '$type', total: { $sum: '$amount' } } },
  ])
  let income = 0
  let expense = 0
  for (const r of totalsRaw as any[]) {
    if (r._id === 'income') income = r.total
    else expense = r.total
  }
  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0
  const avgMonthlyBalance = (income - expense) / 6

  const payload = {
    profile: {
      riskTolerance: profile!.riskTolerance,
      horizonYears: profile!.horizonYears,
      hasExistingInvestments: profile!.hasExistingInvestments,
      knowledgeLevel: profile!.knowledgeLevel,
      goals: profile!.goals,
    },
    financeSummary: { savingsRate, avgMonthlyBalance },
    marketSnapshot: snapshot ? { date: snapshot.date, indices: snapshot.indices } : null,
  }

  const result = await generateStructuredJson<InvestmentTipsResult>({
    system: SYSTEM_PROMPT,
    prompt: `Contexto do utilizador (JSON):\n${JSON.stringify(payload)}`,
    schema: {
      type: 'object',
      properties: { tips: { type: 'array', items: { type: 'string' } } },
      required: ['tips'],
    },
    maxTokens: 700,
  })

  return {
    needsProfile: false,
    disclaimer: DISCLAIMER,
    tips: result.tips,
    marketSnapshotDate: snapshot?.date || null,
  }
})
