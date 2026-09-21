// Resumo do portfolio para a IA (Fase 6, tarefa 6). Ver
// context/features/06-FASE-6-registo-investimentos.md, decisão 7: o modelo só
// recebe AGREGADOS — nunca o nome de uma posição, valores por posição nem datas.
// Isto mantém a regra de privacidade da Fase 3 e evita que o modelo seja tentado
// a comentar ativos concretos (decisão regulatória 4 da Fase 3).
import { Investment } from '../models'
import { summarizePortfolio, type AssetClass, type InvestmentDto } from '../../shared/portfolio'

export interface PortfolioForAi {
  positions: number
  totalInvested: number
  totalValue: number
  returnPct: number | null
  allocation: { assetClass: AssetClass | 'nao_classificado'; weightPct: number }[]
  largestPositionPct: number | null
  oldestValuationDays: number | null
}

const round = (v: number, decimals: number) => {
  const f = 10 ** decimals
  return Math.round(v * f) / f
}

export async function portfolioSummaryForAi(userId: string): Promise<PortfolioForAi | null> {
  const docs = await Investment.find({ userId })
    .select('assetClass initialAmount reinforcement currentValue valueUpdatedAt')
    .lean<Pick<InvestmentDto, 'assetClass' | 'initialAmount' | 'reinforcement' | 'currentValue' | 'valueUpdatedAt'>[]>()
  if (!docs.length) return null

  const s = summarizePortfolio(docs)
  // Valores arredondados: além de gastarem menos tokens, tornam o inputHash da
  // cache estável (pequenas oscilações de casas decimais não o invalidam).
  return {
    positions: s.positions,
    totalInvested: round(s.totalInvested, 0),
    totalValue: round(s.totalValue, 0),
    returnPct: s.returnPct === null ? null : round(s.returnPct, 1),
    allocation: s.allocation.map((a) => ({
      assetClass: a.assetClass ?? 'nao_classificado',
      weightPct: round(a.weightPct, 0),
    })),
    largestPositionPct: s.largestPositionPct === null ? null : round(s.largestPositionPct, 0),
    oldestValuationDays: s.oldestValuationDays,
  }
}
