// Upgrade 04, parte B — orçamento sugerido por IA: o cálculo determinístico
// (fonte de verdade dos números) e a validação da resposta da IA. Funções
// puras, sem base de dados nem rede — testadas em tests/budget.test.ts. Ver
// context/features/upgrades/04-orcamento-ia-e-previsoes.md.
//
// Todos os valores em euros (a moeda base; a apresentação converte).
import { forecastSeries } from './forecast'

// Meses COMPLETOS de despesas precisos para pedir uma proposta.
export const AI_BUDGET_MIN_MONTHS = 3
// Janela de histórico usada no cálculo (os meses completos mais recentes).
export const AI_BUDGET_HISTORY_MONTHS = 6

// Decisões do utilizador (2026-10-08): fundo de maneio 10% da receita e meta
// de poupança 10% por omissão, ambos editáveis (a poupança pode ser 0%).
export const BUDGET_DEFAULT_PCT = { workingCapital: 10, savings: 10 } as const
export const BUDGET_MAX_PCT = 50

// Nenhum limite proposto (pela app ou pela IA) abaixo desta fração do mínimo
// mensal histórico da categoria — exceto quando não há outra forma de caber
// na receita disponível (ver buildDeterministicBudget).
export const BUDGET_FLOOR_RATIO = 0.5

// Variação mensal (coeficiente de variação) abaixo da qual uma categoria
// presente em todos os meses é tratada como fixa.
export const FIXED_CV_THRESHOLD = 0.1
// Fração do gasto vinda de transações recorrentes a partir da qual a
// categoria é fixa.
export const FIXED_RECURRING_SHARE = 0.5

export type BudgetCategoryKind = 'fixed' | 'variable' | 'discretionary'
// Pista vinda do nome da categoria: Habitação e Contas são tipicamente fixas;
// Lazer, Compras e restaurantes são as primeiras a cortar.
export type BudgetCategoryHint = 'fixed' | 'discretionary' | null

export interface BudgetCategoryInput {
  id: string
  name: string
  groupId: string | null
  // Gasto por mês completo, do mais antigo para o mais recente (zeros
  // incluídos); o mesmo comprimento para todas as categorias.
  monthly: number[]
  // 0..1 — parte do gasto vinda de transações com `recurrence` ≠ 'none'.
  recurringShare: number
  hint: BudgetCategoryHint
}

export interface SeriesStats {
  mean: number
  median: number
  sd: number
  min: number
  max: number
  cv: number
  monthsWithSpend: number
}

export function seriesStats(values: number[]): SeriesStats {
  const n = values.length
  if (!n) return { mean: 0, median: 0, sd: 0, min: 0, max: 0, cv: 0, monthsWithSpend: 0 }
  const mean = values.reduce((s, v) => s + v, 0) / n
  const sorted = [...values].sort((a, b) => a - b)
  const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2
  const sd = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / n)
  return {
    mean,
    median,
    sd,
    min: sorted[0],
    max: sorted[n - 1],
    cv: mean > 0 ? sd / mean : 0,
    monthsWithSpend: values.filter((v) => v > 0).length,
  }
}

export function classifyCategory(input: BudgetCategoryInput, stats: SeriesStats): BudgetCategoryKind {
  if (input.hint === 'fixed') return 'fixed'
  if (input.recurringShare >= FIXED_RECURRING_SHARE) return 'fixed'
  if (stats.monthsWithSpend === input.monthly.length && stats.cv < FIXED_CV_THRESHOLD) return 'fixed'
  if (input.hint === 'discretionary') return 'discretionary'
  return 'variable'
}

export interface BudgetSettings {
  workingCapitalPct: number
  savingsPct: number
}

// Porque é que a linha tem aquele limite — traduzido no client
// (`aiBudget.reason.*`) quando a IA não deixou uma explicação.
export type BudgetReason = 'fixed' | 'kept' | 'cut' | 'cutDiscretionary' | 'belowFloor'

export interface BudgetLine {
  id: string
  name: string
  groupId: string | null
  kind: BudgetCategoryKind
  mean: number
  median: number
  min: number
  max: number
  floor: number
  limit: number
  reason: BudgetReason
  note?: string
}

export type BudgetStatus = 'ok' | 'tight' | 'fixedExceedAvailable'

export interface BudgetSummary {
  months: number
  expectedIncome: number
  workingCapital: number
  savings: number
  available: number
  fixedTotal: number
  total: number
  status: BudgetStatus
}

export interface BudgetProposal {
  summary: BudgetSummary
  lines: BudgetLine[]
}

const round2 = (v: number) => Math.round(v * 100) / 100

// Receita mensal esperada: a média dos últimos 3 meses completos, ou a
// tendência para o próximo mês se for mais baixa — um orçamento não deve
// contar com um aumento que ainda não chegou.
export function expectedMonthlyIncome(incomes: number[]): number {
  if (!incomes.length) return 0
  const recent = incomes.slice(-3)
  const average = recent.reduce((s, v) => s + v, 0) / recent.length
  const next = forecastSeries(incomes, 1).values[0]
  return round2(Math.max(0, Math.min(average, next)))
}

export function budgetAmounts(expectedIncome: number, settings: BudgetSettings) {
  const workingCapital = round2((expectedIncome * settings.workingCapitalPct) / 100)
  const savings = round2((expectedIncome * settings.savingsPct) / 100)
  return { workingCapital, savings, available: round2(Math.max(0, expectedIncome - workingCapital - savings)) }
}

// Cálculo determinístico:
//  - fixas: ficam com o valor atual (o maior entre o último mês e a média —
//    as contas variam um pouco), arredondado para cima; nunca se cortam;
//  - variáveis: a média do histórico. Se o total não couber na receita
//    disponível, corta-se primeiro nas discricionárias, depois nas outras,
//    proporcionalmente ao que cada uma pode descer até ao piso (50% do mínimo
//    histórico); se nem assim couber, desce-se abaixo do piso — a soma nunca
//    passa a receita disponível.
//  - Se só os fixos já passam a receita disponível, as variáveis ficam a 0 e
//    o estado diz-o (não há proposta que caiba sem cortar fixos).
export function buildDeterministicBudget(input: {
  incomes: number[]
  categories: BudgetCategoryInput[]
  settings: BudgetSettings
}): BudgetProposal {
  const expectedIncome = expectedMonthlyIncome(input.incomes)
  const { workingCapital, savings, available } = budgetAmounts(expectedIncome, input.settings)

  const lines: BudgetLine[] = input.categories
    .map((c) => {
      const stats = seriesStats(c.monthly)
      const kind = classifyCategory(c, stats)
      const last = c.monthly[c.monthly.length - 1] || 0
      const limit = kind === 'fixed' ? Math.ceil(Math.max(last, stats.mean)) : Math.round(stats.mean)
      return {
        id: c.id,
        name: c.name,
        groupId: c.groupId,
        kind,
        mean: round2(stats.mean),
        median: round2(stats.median),
        min: round2(stats.min),
        max: round2(stats.max),
        floor: Math.floor(stats.min * BUDGET_FLOOR_RATIO),
        limit,
        reason: (kind === 'fixed' ? 'fixed' : 'kept') as BudgetReason,
      }
    })
    .filter((l) => l.mean > 0)
    // Maiores gastos primeiro (no cartão e nas referências c1, c2… da IA).
    .sort((a, b) => b.mean - a.mean || a.name.localeCompare(b.name))

  const fixedTotal = lines.filter((l) => l.kind === 'fixed').reduce((s, l) => s + l.limit, 0)
  const variables = lines.filter((l) => l.kind !== 'fixed')
  const pool = available - fixedTotal
  let status: BudgetStatus = 'ok'

  if (pool <= 0) {
    for (const l of variables) {
      l.limit = 0
      l.reason = 'belowFloor'
    }
    status = fixedTotal > available ? 'fixedExceedAvailable' : 'tight'
  } else {
    let deficit = variables.reduce((s, l) => s + l.limit, 0) - pool
    for (const tier of [
      variables.filter((l) => l.kind === 'discretionary'),
      variables.filter((l) => l.kind === 'variable'),
    ]) {
      if (deficit <= 0) break
      const room = tier.reduce((s, l) => s + Math.max(0, l.limit - l.floor), 0)
      if (room <= 0) continue
      const share = Math.min(1, deficit / room)
      for (const l of tier) {
        const cut = Math.max(0, l.limit - l.floor) * share
        if (cut > 0) {
          l.limit -= cut
          l.reason = l.kind === 'discretionary' ? 'cutDiscretionary' : 'cut'
        }
      }
      deficit -= room * share
    }
    if (deficit > 1e-9) {
      const current = variables.reduce((s, l) => s + l.limit, 0)
      const factor = current > 0 ? Math.max(0, (current - deficit) / current) : 0
      for (const l of variables) {
        l.limit *= factor
        l.reason = 'belowFloor'
      }
      status = 'tight'
    }
    // Para baixo, para a soma nunca passar a receita disponível.
    for (const l of variables) l.limit = Math.floor(l.limit + 1e-9)
  }

  const total = lines.reduce((s, l) => s + l.limit, 0)
  return {
    summary: {
      months: input.incomes.length,
      expectedIncome,
      workingCapital,
      savings,
      available,
      fixedTotal,
      total,
      status,
    },
    lines,
  }
}

// ─── Grupos ──────────────────────────────────────────────────────────────────
// Um grupo junta despesas de várias categorias (pela categoria ou pela própria
// transação). O limite do grupo segue os limites propostos para essas
// categorias: cada parte do gasto do grupo escala como a categoria de onde vem.
// Como cada transação pertence no máximo a um grupo, a soma dos grupos nunca
// passa a soma das categorias.
export interface BudgetGroupInput {
  id: string
  name: string
  // Gasto médio mensal do grupo em cada categoria (categoryId → média).
  meanByCategory: Record<string, number>
}

export interface BudgetGroupLine {
  id: string
  name: string
  mean: number
  limit: number
  alertThreshold: number
}

export function buildGroupLimits(groups: BudgetGroupInput[], lines: BudgetLine[]): BudgetGroupLine[] {
  const byId = new Map(lines.map((l) => [l.id, l]))
  return groups
    .map((g) => {
      let mean = 0
      let limit = 0
      let fixedMean = 0
      for (const [categoryId, part] of Object.entries(g.meanByCategory)) {
        const line = byId.get(categoryId)
        mean += part
        if (!line || line.mean <= 0) continue
        limit += part * (line.limit / line.mean)
        if (line.kind === 'fixed') fixedMean += part
      }
      return {
        id: g.id,
        name: g.name,
        mean: round2(mean),
        limit: Math.floor(limit + 1e-9),
        // Grupos sobretudo de gastos fixos só avisam mais perto do limite.
        alertThreshold: mean > 0 && fixedMean / mean >= 0.5 ? 90 : 80,
      }
    })
    .filter((g) => g.mean > 0)
}

// ─── Resposta da IA ──────────────────────────────────────────────────────────
// A IA recebe só agregados e devolve, por categoria, um limite e uma
// explicação curta. Regras (o servidor verifica tudo — a IA não é fonte de
// verdade dos números):
//  - fixas: o limite da IA é ignorado (os fixos nunca se cortam), só a nota fica;
//  - variáveis: limite ≥ piso (50% do mínimo histórico);
//  - referência desconhecida, valor inválido, ou soma acima da receita
//    disponível → a resposta inteira é rejeitada e fica a proposta determinística.
export interface AiBudgetAdjustment {
  ref: string
  limit: number
  note: string
}

export type AiValidation =
  | { ok: true; proposal: BudgetProposal }
  | { ok: false; reason: 'unknownRef' | 'invalidValue' | 'belowFloor' | 'overAvailable' }

export function applyAiAdjustments(
  base: BudgetProposal,
  adjustments: AiBudgetAdjustment[],
  // A IA trabalha com referências curtas (c1, c2…) em vez dos ids da BD.
  refToId: Record<string, string>
): AiValidation {
  const lines = base.lines.map((l) => ({ ...l }))
  const byId = new Map(lines.map((l) => [l.id, l]))

  for (const adj of adjustments) {
    const line = byId.get(refToId[adj.ref])
    if (!line) return { ok: false, reason: 'unknownRef' }
    const note = typeof adj.note === 'string' ? adj.note.trim().slice(0, 240) : ''
    if (note) line.note = note
    if (line.kind === 'fixed') continue
    if (typeof adj.limit !== 'number' || !Number.isFinite(adj.limit) || adj.limit < 0) {
      return { ok: false, reason: 'invalidValue' }
    }
    const limit = Math.floor(adj.limit)
    if (limit < line.floor) return { ok: false, reason: 'belowFloor' }
    line.limit = limit
  }

  const total = lines.reduce((s, l) => s + l.limit, 0)
  // Com fixos acima da receita disponível não há proposta que caiba: a IA só
  // não pode piorar o que a app já propôs.
  const ceiling = Math.max(base.summary.available, base.summary.total)
  if (total > ceiling + 1e-9) return { ok: false, reason: 'overAvailable' }

  return { ok: true, proposal: { summary: { ...base.summary, total }, lines } }
}

// Soma dos limites que o utilizador editou, para o aviso no cartão.
export function totalOfLimits(limits: Array<{ limit: number | null | undefined }>): number {
  return limits.reduce((s, l) => s + (Number(l.limit) || 0), 0)
}
