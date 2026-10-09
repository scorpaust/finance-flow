import { describe, expect, it } from 'vitest'
import {
  AI_BUDGET_MIN_MONTHS,
  applyAiAdjustments,
  buildDeterministicBudget,
  buildGroupLimits,
  classifyCategory,
  expectedMonthlyIncome,
  seriesStats,
  type BudgetCategoryInput,
} from '../shared/budget'
import { budgetHintForCategory } from '../server/utils/defaultCategories'

// Upgrade 04, parte B — algoritmo do orçamento sugerido (determinístico) e
// validação da resposta da IA.

function cat(id: string, monthly: number[], extra: Partial<BudgetCategoryInput> = {}): BudgetCategoryInput {
  return { id, name: id, groupId: null, monthly, recurringShare: 0, hint: null, ...extra }
}

const SETTINGS = { workingCapitalPct: 10, savingsPct: 10 }
const sum = (xs: number[]) => xs.reduce((s, v) => s + v, 0)

describe('classificação fixa/variável', () => {
  it('renda recorrente é fixa; lazer é discricionária; supermercado irregular é variável', () => {
    const rent = cat('rent', [700, 700, 700], { recurringShare: 1 })
    const leisure = cat('leisure', [100, 250, 50], { hint: 'discretionary' })
    const groceries = cat('groceries', [300, 420, 360])
    expect(classifyCategory(rent, seriesStats(rent.monthly))).toBe('fixed')
    expect(classifyCategory(leisure, seriesStats(leisure.monthly))).toBe('discretionary')
    expect(classifyCategory(groceries, seriesStats(groceries.monthly))).toBe('variable')
  })

  it('variação < 10% em todos os meses conta como fixa, mesmo sem recorrência', () => {
    const gym = cat('gym', [40, 41, 40])
    expect(classifyCategory(gym, seriesStats(gym.monthly))).toBe('fixed')
  })

  it('Habitação e Contas são fixas pelo nome, em qualquer das 6 línguas', () => {
    expect(budgetHintForCategory('Habitação')).toBe('fixed')
    expect(budgetHintForCategory('Bills & utilities')).toBe('fixed')
    expect(budgetHintForCategory('Nebenkosten')).toBe('fixed')
    expect(budgetHintForCategory('Renda da casa')).toBe('fixed')
    expect(budgetHintForCategory('Lazer')).toBe('discretionary')
    expect(budgetHintForCategory('Restaurantes')).toBe('discretionary')
    expect(budgetHintForCategory('Alimentação')).toBe(null)
  })
})

describe('receita esperada', () => {
  it('é a média dos últimos 3 meses, ou a tendência se estiver a descer', () => {
    expect(expectedMonthlyIncome([2000, 2000, 2000])).toBe(2000)
    expect(expectedMonthlyIncome([2400, 2200, 2000])).toBeLessThan(2200)
    // Um aumento ainda não confirmado não entra.
    expect(expectedMonthlyIncome([1800, 2000, 2200])).toBe(2000)
  })
})

describe('orçamento determinístico', () => {
  it('cabe na receita: fixos com o valor atual, variáveis com a média', () => {
    const b = buildDeterministicBudget({
      incomes: [3000, 3000, 3000],
      categories: [cat('rent', [800, 800, 800], { recurringShare: 1 }), cat('groceries', [300, 400, 350])],
      settings: SETTINGS,
    })
    expect(b.summary.available).toBe(2400)
    expect(b.lines.find((l) => l.id === 'rent')!.limit).toBe(800)
    expect(b.lines.find((l) => l.id === 'groceries')!.limit).toBe(350)
    expect(b.summary.status).toBe('ok')
  })

  it('não cabe: corta primeiro nas discricionárias, nunca nos fixos, e a soma ≤ disponível', () => {
    const b = buildDeterministicBudget({
      incomes: [2000, 2000, 2000],
      categories: [
        cat('rent', [900, 900, 900], { recurringShare: 1 }),
        cat('groceries', [380, 450, 520]),
        cat('leisure', [300, 400, 350], { hint: 'discretionary' }),
      ],
      settings: SETTINGS,
    })
    // disponível = 2000 − 200 − 200 = 1600; fixos 900; variáveis pediam 450 + 350 = 800.
    expect(b.summary.available).toBe(1600)
    const byId = Object.fromEntries(b.lines.map((l) => [l.id, l]))
    expect(byId.rent.limit).toBe(900)
    expect(byId.groceries.limit).toBe(450)
    expect(byId.groceries.reason).toBe('kept')
    expect(byId.leisure.limit).toBe(250)
    expect(byId.leisure.reason).toBe('cutDiscretionary')
    expect(sum(b.lines.map((l) => l.limit))).toBeLessThanOrEqual(b.summary.available)
    expect(b.summary.total).toBe(1600)
  })

  it('cortes nunca descem abaixo de 50% do mínimo histórico enquanto houver margem', () => {
    const b = buildDeterministicBudget({
      incomes: [1500, 1500, 1500],
      categories: [
        cat('rent', [700, 700, 700], { recurringShare: 1 }),
        cat('groceries', [300, 300, 400]),
        cat('leisure', [200, 300, 250], { hint: 'discretionary' }),
      ],
      settings: SETTINGS,
    })
    // disponível 1200, fixos 700, variáveis pediam 333 + 250 = 583 → falta 83.
    for (const l of b.lines.filter((x) => x.kind !== 'fixed')) expect(l.limit).toBeGreaterThanOrEqual(l.floor)
    expect(b.lines.find((l) => l.id === 'leisure')!.limit).toBeLessThan(250)
    expect(sum(b.lines.map((l) => l.limit))).toBeLessThanOrEqual(1200)
  })

  it('sem margem nenhuma desce abaixo do piso, mas a soma continua ≤ disponível', () => {
    const b = buildDeterministicBudget({
      incomes: [1000, 1000, 1000],
      categories: [
        cat('rent', [700, 700, 700], { recurringShare: 1 }),
        cat('groceries', [250, 300, 350]),
        cat('leisure', [150, 200, 250], { hint: 'discretionary' }),
      ],
      settings: SETTINGS,
    })
    expect(b.summary.status).toBe('tight')
    expect(sum(b.lines.map((l) => l.limit))).toBeLessThanOrEqual(b.summary.available)
    expect(b.lines.find((l) => l.id === 'rent')!.limit).toBe(700)
  })

  it('fixos acima da receita disponível: não se cortam, variáveis a 0 e o estado diz-o', () => {
    const b = buildDeterministicBudget({
      incomes: [1000, 1000, 1000],
      categories: [cat('rent', [900, 900, 900], { recurringShare: 1 }), cat('groceries', [200, 250, 300])],
      settings: SETTINGS,
    })
    expect(b.summary.status).toBe('fixedExceedAvailable')
    expect(b.lines.find((l) => l.id === 'rent')!.limit).toBe(900)
    expect(b.lines.find((l) => l.id === 'groceries')!.limit).toBe(0)
  })

  it('meta de poupança 0% deixa mais disponível', () => {
    const b = buildDeterministicBudget({ incomes: [2000, 2000, 2000], categories: [], settings: { workingCapitalPct: 10, savingsPct: 0 } })
    expect(b.summary.available).toBe(1800)
    expect(b.summary.savings).toBe(0)
  })

  it(`o mínimo de meses completos para pedir uma proposta é ${AI_BUDGET_MIN_MONTHS}`, () => {
    expect(AI_BUDGET_MIN_MONTHS).toBe(3)
  })
})

describe('limites dos grupos', () => {
  it('seguem os limites das categorias de onde vem o gasto do grupo', () => {
    const b = buildDeterministicBudget({
      incomes: [2000, 2000, 2000],
      categories: [
        cat('rent', [900, 900, 900], { recurringShare: 1 }),
        cat('groceries', [380, 450, 520]),
        cat('leisure', [300, 400, 350], { hint: 'discretionary' }),
      ],
      settings: SETTINGS,
    })
    const groups = buildGroupLimits(
      [
        { id: 'house', name: 'Casa', meanByCategory: { rent: 900 } },
        { id: 'fun', name: 'Diversão', meanByCategory: { leisure: 350 } },
        { id: 'empty', name: 'Vazio', meanByCategory: {} },
      ],
      b.lines
    )
    const byId = Object.fromEntries(groups.map((g) => [g.id, g]))
    expect(byId.house.limit).toBe(900)
    expect(byId.house.alertThreshold).toBe(90)
    expect(byId.fun.limit).toBe(250)
    expect(byId.fun.alertThreshold).toBe(80)
    expect(byId.empty).toBeUndefined()
  })
})

describe('resposta da IA (validação no servidor)', () => {
  const base = buildDeterministicBudget({
    incomes: [2000, 2000, 2000],
    categories: [
      cat('rent', [900, 900, 900], { recurringShare: 1 }),
      cat('groceries', [380, 450, 520]),
      cat('leisure', [300, 400, 350], { hint: 'discretionary' }),
    ],
    settings: SETTINGS,
  })
  const refs = { c1: 'rent', c2: 'groceries', c3: 'leisure' }

  it('ajustes dentro dos limites são aceites, com as notas', () => {
    const r = applyAiAdjustments(base, [
      { ref: 'c1', limit: 900, note: 'Renda fixa.' },
      { ref: 'c2', limit: 430, note: 'Ligeiro corte.' },
      { ref: 'c3', limit: 270, note: 'Menos saídas.' },
    ], refs)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const byId = Object.fromEntries(r.proposal.lines.map((l) => [l.id, l]))
    expect(byId.groceries.limit).toBe(430)
    expect(byId.leisure.note).toBe('Menos saídas.')
    expect(r.proposal.summary.total).toBe(1600)
  })

  it('a IA nunca corta um fixo: o limite que devolver para a renda é ignorado', () => {
    const r = applyAiAdjustments(base, [{ ref: 'c1', limit: 500, note: 'x' }], refs)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.proposal.lines.find((l) => l.id === 'rent')!.limit).toBe(900)
  })

  it('soma acima da receita disponível → rejeitada (fica a proposta determinística)', () => {
    expect(applyAiAdjustments(base, [{ ref: 'c2', limit: 900, note: '' }], refs)).toEqual({ ok: false, reason: 'overAvailable' })
  })

  it('abaixo de 50% do mínimo histórico → rejeitada', () => {
    // mínimo das compras 380 → piso 190.
    expect(applyAiAdjustments(base, [{ ref: 'c2', limit: 150, note: '' }], refs)).toEqual({ ok: false, reason: 'belowFloor' })
  })

  it('categoria inventada ou valor inválido → rejeitada', () => {
    expect(applyAiAdjustments(base, [{ ref: 'c9', limit: 10, note: '' }], refs)).toEqual({ ok: false, reason: 'unknownRef' })
    expect(applyAiAdjustments(base, [{ ref: 'c2', limit: Number.NaN, note: '' }], refs)).toEqual({ ok: false, reason: 'invalidValue' })
    expect(applyAiAdjustments(base, [{ ref: 'c2', limit: -5, note: '' }], refs)).toEqual({ ok: false, reason: 'invalidValue' })
  })
})
