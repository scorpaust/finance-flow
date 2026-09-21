// Dicas de investimento educativas (Fase 3, tarefa 5) + integração opcional com
// o portfolio do utilizador (Fase 6, tarefa 6). Partilhado por
// server/api/insights/investment.post.ts (gera) e investment.get.ts (só lê a
// cache, sem chamar a Anthropic).
//
// Nunca recomendações de investimento específicas (risco regulatório CMVM) — o
// prompt proíbe nomear tickers/ativos, e o disclaimer é hardcoded aqui (não
// gerado pelo LLM) para garantir que nunca falta.
import { createHash } from 'node:crypto'
import mongoose from 'mongoose'
import { Transaction, MarketSnapshot, User, InvestmentTipsCache } from '../models'
import type { IInvestorProfile } from '../models'
import { generateStructuredJson } from './anthropic'
import { isProfileValid } from './investorProfile'
import { portfolioSummaryForAi, type PortfolioForAi } from './portfolio'

export const DISCLAIMER =
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

// Só é acrescentado com INVESTMENT_TIPS_INCLUDE_PORTFOLIO ligada — com a flag
// desligada o prompt é exatamente o da Fase 3. Ver Fase 6, tarefa 6.
const PORTFOLIO_PROMPT_ADDENDUM = `

O contexto inclui também "portfolio": um resumo AGREGADO dos investimentos que o
utilizador tem registados (número de posições, totais em euros, rentabilidade
simples, peso por classe de ativo, peso da maior posição, e há quantos dias a
valorização mais antiga foi atualizada). Não tens nomes nem valores por posição.
Regras adicionais, sem exceção:
- Usa o portfolio apenas para comentar diversificação, concentração e
  regularidade em termos gerais, relativamente ao riskTolerance do utilizador.
- Nunca sugiras vender, comprar ou reequilibrar posições concretas, nem classes
  de ativos com percentagens-alvo (nunca "deves ter 60% em X").
- Nunca prevejas nem extrapoles a rentabilidade mostrada.
- Se oldestValuationDays for alto (mais de 30), diz que os números podem estar
  desatualizados.
- "nao_classificado" significa que o utilizador não indicou a classe de ativo.`

const CACHE_TTL_MS = 24 * 60 * 60 * 1000

interface InvestmentTipsResult {
  tips: string[]
}

type TipsContext =
  | { needsProfile: true }
  | {
      needsProfile: false
      profile: {
        riskTolerance: IInvestorProfile['riskTolerance']
        horizonYears: number
        hasExistingInvestments: boolean
        knowledgeLevel: IInvestorProfile['knowledgeLevel']
        goals: string[]
      }
      snapshot: { date: string; indices: unknown } | null
      portfolio: PortfolioForAi | null
      portfolioIncluded: boolean
      inputHash: string
    }

// Tudo o que entra no prompt exceto o resumo das finanças (que muda a cada
// transação e invalidaria a cache sem necessidade). O inputHash cobre perfil,
// agregados do portfolio e data do snapshot de mercado.
async function getTipsContext(userId: string): Promise<TipsContext> {
  const user = await User.findById(userId)
    .select('investorProfile')
    .lean<{ investorProfile?: IInvestorProfile }>()
  const p = user?.investorProfile
  if (!p || !isProfileValid(p)) return { needsProfile: true }

  const snapshotDoc = await MarketSnapshot.findOne().sort({ date: -1 }).lean()
  const snapshot = snapshotDoc ? { date: snapshotDoc.date as string, indices: snapshotDoc.indices } : null

  const includePortfolio = !!useRuntimeConfig().investmentTipsIncludePortfolio
  const portfolio = includePortfolio ? await portfolioSummaryForAi(userId) : null

  const profile = {
    riskTolerance: p.riskTolerance,
    horizonYears: p.horizonYears,
    // O perfil foi respondido há meses; se já há posições registadas, é um facto.
    hasExistingInvestments: portfolio ? true : p.hasExistingInvestments,
    knowledgeLevel: p.knowledgeLevel,
    goals: p.goals,
  }

  const inputHash = createHash('sha256')
    .update(JSON.stringify({ profile, portfolio, snapshotDate: snapshot?.date ?? null }))
    .digest('hex')

  return { needsProfile: false, profile, snapshot, portfolio, portfolioIncluded: includePortfolio, inputHash }
}

async function loadFinanceSummary(userId: string) {
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
  return {
    savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0,
    avgMonthlyBalance: (income - expense) / 6,
  }
}

function tipsResponse(
  cache: { tips: string[]; marketSnapshotDate: string | null; portfolioIncluded: boolean; generatedAt: Date },
  extra: { cached: boolean; outdated: boolean }
) {
  return {
    needsProfile: false as const,
    disclaimer: DISCLAIMER,
    tips: cache.tips,
    marketSnapshotDate: cache.marketSnapshotDate,
    portfolioIncluded: cache.portfolioIncluded,
    generatedAt: cache.generatedAt,
    ...extra,
  }
}

// GET — devolve as últimas dicas geradas SEM chamar a Anthropic, para a página
// as mostrar ao abrir. `outdated` diz se um POST geraria dicas novas (perfil,
// portfolio ou mercado mudaram, ou a cache passou as 24 h) — é o que decide se
// o botão "Atualizar dicas" faz sentido.
export async function getCachedTips(userId: string) {
  const ctx = await getTipsContext(userId)
  if (ctx.needsProfile) return { needsProfile: true as const }

  const cached = await InvestmentTipsCache.findById(userId).lean()
  if (!cached) {
    return { needsProfile: false as const, disclaimer: DISCLAIMER, tips: null, portfolioIncluded: ctx.portfolioIncluded }
  }
  const expired = Date.now() - new Date(cached.generatedAt).getTime() >= CACHE_TTL_MS
  return tipsResponse(cached, { cached: true, outdated: cached.inputHash !== ctx.inputHash || expired })
}

// POST — gera dicas novas, ou devolve a cache se nada mudou nas últimas 24 h.
// Só regenera cedo quando o inputHash mudou (perfil, portfolio ou mercado): controla
// o custo e impede regeneração em loop com os mesmos dados.
export async function generateTips(userId: string) {
  const ctx = await getTipsContext(userId)
  if (ctx.needsProfile) return { needsProfile: true as const }

  const cached = await InvestmentTipsCache.findById(userId).lean()
  if (
    cached &&
    cached.inputHash === ctx.inputHash &&
    Date.now() - new Date(cached.generatedAt).getTime() < CACHE_TTL_MS
  ) {
    return tipsResponse(cached, { cached: true, outdated: false })
  }

  const financeSummary = await loadFinanceSummary(userId)
  const payload = {
    profile: ctx.profile,
    financeSummary,
    marketSnapshot: ctx.snapshot,
    ...(ctx.portfolio ? { portfolio: ctx.portfolio } : {}),
  }

  const result = await generateStructuredJson<InvestmentTipsResult>({
    system: ctx.portfolio ? SYSTEM_PROMPT + PORTFOLIO_PROMPT_ADDENDUM : SYSTEM_PROMPT,
    prompt: `Contexto do utilizador (JSON):\n${JSON.stringify(payload)}`,
    schema: {
      type: 'object',
      properties: { tips: { type: 'array', items: { type: 'string' } } },
      required: ['tips'],
    },
    maxTokens: 700,
  })

  const generatedAt = new Date()
  const marketSnapshotDate = ctx.snapshot?.date ?? null
  const portfolioIncluded = !!ctx.portfolio
  await InvestmentTipsCache.findOneAndUpdate(
    { _id: userId },
    { tips: result.tips, inputHash: ctx.inputHash, marketSnapshotDate, portfolioIncluded, generatedAt },
    { upsert: true }
  )

  return tipsResponse(
    { tips: result.tips, marketSnapshotDate, portfolioIncluded, generatedAt },
    { cached: false, outdated: false }
  )
}
