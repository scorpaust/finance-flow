// Fonte única do cálculo do portfolio (Fase 6 — ver
// context/features/06-FASE-6-registo-investimentos.md, decisão 2). Usado pelo
// servidor (API e resumo enviado à IA), pelo formulário (pré-visualização) e
// pela página — nunca reimplementar a fórmula noutro sítio. Funções puras, sem
// dependências de Vue nem de Mongo.
//
// Fórmula, verificada contra a folha de Excel do utilizador:
//   investido = Inicial + Reforço
//   %         = (Situação − investido) / investido
// É uma rentabilidade simples sobre o capital investido — não anualizada, e não
// pondera o momento em que cada reforço entrou.

export const ASSET_CLASSES = ['etf', 'acao', 'obrigacoes', 'fundo', 'deposito', 'outro'] as const
export type AssetClass = (typeof ASSET_CLASSES)[number]

export const ASSET_CLASS_LABEL: Record<AssetClass, string> = {
  etf: 'ETF',
  acao: 'Ação',
  obrigacoes: 'Obrigações',
  fundo: 'Fundo',
  deposito: 'Depósito',
  outro: 'Outro',
}

// Teto fixo de segurança por utilizador — limita o tamanho da lista e do que a
// IA vê. Não é um limite de plano (não vai para TIER_LIMITS).
export const MAX_INVESTMENTS_PER_USER = 100

// Valor máximo aceite por campo em euros — só para rejeitar lixo/erros de escrita.
export const MAX_INVESTMENT_AMOUNT = 1e9

// A partir de quantos dias a `Situação` se considera desatualizada.
export const STALE_VALUATION_DAYS = 30

const DAY_MS = 86_400_000

export interface PositionAmounts {
  initialAmount: number
  reinforcement: number
  currentValue: number
}

export interface InvestmentDto extends PositionAmounts {
  _id: string
  name: string
  assetClass: AssetClass | null
  initialDate: string
  valueUpdatedAt: string
  // Derivados — calculados no servidor com as funções abaixo, nunca guardados.
  invested: number
  gain: number
  returnPct: number | null
  createdAt: string
  updatedAt: string
}

export interface AllocationSlice {
  assetClass: AssetClass | null // null = posições sem classe indicada
  weightPct: number
}

export interface PortfolioSummary {
  positions: number
  totalInvested: number
  totalValue: number
  gain: number
  returnPct: number | null
  allocation: AllocationSlice[]
  largestPositionPct: number | null
  oldestValuationDays: number | null
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function investedAmount(p: Pick<PositionAmounts, 'initialAmount' | 'reinforcement'>): number {
  return roundMoney(p.initialAmount + p.reinforcement)
}

export function gainAmount(p: PositionAmounts): number {
  return roundMoney(p.currentValue - investedAmount(p))
}

// Percentagem (1.94 = 1,94%). Devolve `null` sem capital investido — a UI mostra "—".
export function returnPct(p: PositionAmounts): number | null {
  const invested = investedAmount(p)
  if (invested <= 0) return null
  return ((p.currentValue - invested) / invested) * 100
}

export function daysSince(date: string | Date, now: Date = new Date()): number {
  const t = new Date(date).getTime()
  if (Number.isNaN(t)) return 0
  return Math.max(0, Math.floor((now.getTime() - t) / DAY_MS))
}

export function isValuationStale(valueUpdatedAt: string | Date, now: Date = new Date()): boolean {
  return daysSince(valueUpdatedAt, now) > STALE_VALUATION_DAYS
}

type SummaryInput = PositionAmounts & { assetClass?: AssetClass | null; valueUpdatedAt: string | Date }

// Resumo do portfolio. O retorno agregado calcula-se sobre os TOTAIS
// (Σ situação vs. Σ investido), não como média das percentagens de cada linha.
// O peso de cada classe e da maior posição é sobre o valor atual.
export function summarizePortfolio(positions: SummaryInput[], now: Date = new Date()): PortfolioSummary {
  const totalInvested = roundMoney(positions.reduce((s, p) => s + investedAmount(p), 0))
  const totalValue = roundMoney(positions.reduce((s, p) => s + p.currentValue, 0))

  const byClass = new Map<AssetClass | null, number>()
  let largest = 0
  for (const p of positions) {
    const key = p.assetClass ?? null
    byClass.set(key, (byClass.get(key) ?? 0) + p.currentValue)
    largest = Math.max(largest, p.currentValue)
  }

  const allocation: AllocationSlice[] =
    totalValue > 0
      ? [...byClass.entries()]
          .map(([assetClass, value]) => ({ assetClass, weightPct: (value / totalValue) * 100 }))
          .sort((a, b) => b.weightPct - a.weightPct)
      : []

  return {
    positions: positions.length,
    totalInvested,
    totalValue,
    gain: roundMoney(totalValue - totalInvested),
    returnPct: totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : null,
    allocation,
    largestPositionPct: totalValue > 0 ? (largest / totalValue) * 100 : null,
    oldestValuationDays: positions.length
      ? Math.max(...positions.map((p) => daysSince(p.valueUpdatedAt, now)))
      : null,
  }
}
