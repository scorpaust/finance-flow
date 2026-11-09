// Reorganização de categorias e grupos com IA (Premium). A IA só propõe; cada
// operação é validada aqui, mostrada ao utilizador com o motivo e aplicada só
// se ele a escolher (server/utils/aiReorganize.ts). Funções puras: o servidor
// usa-as com os dados da conta, os testes com dados de exemplo.

export const REORG_MIN_TRANSACTIONS = 20
// Um mês de registos: a transação mais antiga tem pelo menos isto.
export const REORG_MIN_DAYS = 30
export const REORG_MONTHLY_LIMIT = 5
export const REORG_MAX_OPERATIONS = 30
const MAX_NAME = 40

export const REORG_KINDS = [
  'createGroup', 'renameGroup', 'deleteGroup',
  'createCategory', 'renameCategory', 'setCategoryGroup',
  'moveTransactions', 'mergeCategory', 'deleteCategory',
] as const
export type ReorgKind = (typeof REORG_KINDS)[number]

// Ordem de aplicação: criar antes de usar, mover antes de apagar.
export const REORG_PHASE: Record<ReorgKind, number> = {
  createGroup: 0, createCategory: 1, renameGroup: 2, renameCategory: 2,
  setCategoryGroup: 3, moveTransactions: 4, mergeCategory: 5, deleteCategory: 6, deleteGroup: 7,
}

export type CategoryType = 'income' | 'expense' | 'both'

// Operação tal como vem da IA. As categorias e grupos existentes chegam-lhe
// como "c1", "g1"…; o que propõe criar leva "n1", "n2"….
export interface RawReorgOp {
  kind: string
  target: string | null
  into: string | null
  newRef: string | null
  name: string | null
  type: string | null
  icon: string | null
  color: string | null
  descriptions: string[] | null
  reason: string
}

export interface ReorgContext {
  categories: { ref: string; id: string; name: string; type: CategoryType; groupId: string | null; txCount: number }[]
  groups: { ref: string; id: string; name: string }[]
  // Por categoria (id): descrição em minúsculas → [descrição original, n.º de transações].
  descriptions: Record<string, Record<string, [string, number]>>
}

// Destino: um id existente ou "new:<ref>" de algo criado na mesma proposta.
export interface ReorgOp {
  kind: ReorgKind
  reason: string
  categoryId?: string
  groupId?: string
  into?: string
  group?: string | null
  key?: string
  name?: string
  type?: CategoryType
  icon?: string
  color?: string
  descriptions?: string[]
  // Transações que mudam de categoria.
  affected?: number
  // Índices das operações de que esta depende (criações e mudanças anteriores).
  dependsOn: number[]
  // Nomes para mostrar ao utilizador.
  label: { target?: string; into?: string; group?: string | null }
}

const cleanName = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim()
const validName = (s: string) => s.length > 0 && s.length <= MAX_NAME
const HEX = /^#[0-9a-f]{6}$/i

export function normalizeReorgOperations(raw: RawReorgOp[], ctx: ReorgContext): ReorgOp[] {
  const ops: ReorgOp[] = []
  const catByRef = new Map(ctx.categories.map((c) => [c.ref, { ...c }]))
  const groupByRef = new Map(ctx.groups.map((g) => [g.ref, { ...g }]))
  const catNames = new Set(ctx.categories.map((c) => c.name.toLocaleLowerCase()))
  const groupNames = new Set(ctx.groups.map((g) => g.name.toLocaleLowerCase()))
  const removed = new Set<string>() // categorias apagadas ou juntadas
  const removedGroups = new Set<string>()
  // Criações desta proposta: ref → índice da operação.
  const newCats = new Map<string, { index: number; name: string; type: CategoryType }>()
  const newGroups = new Map<string, { index: number; name: string }>()
  // Quem já mexeu em cada categoria (para "apagar depois de esvaziar").
  const touchedBy = new Map<string, number[]>()
  const remaining = new Map(ctx.categories.map((c) => [c.id, c.txCount]))

  const existingCat = (ref: string | null) => {
    const c = ref ? catByRef.get(ref) : undefined
    return c && !removed.has(c.id) ? c : undefined
  }
  const existingGroup = (ref: string | null) => {
    const g = ref ? groupByRef.get(ref) : undefined
    return g && !removedGroups.has(g.id) ? g : undefined
  }
  // Destino de categoria: existente ou criada antes nesta proposta.
  const categoryTarget = (ref: string | null) => {
    const c = existingCat(ref)
    if (c) return { into: c.id, name: c.name, type: c.type, deps: [] as number[] }
    const n = ref ? newCats.get(ref) : undefined
    return n ? { into: `new:${ref}`, name: n.name, type: n.type, deps: [n.index] } : undefined
  }
  // Destino de grupo: existente, criado nesta proposta, ou nenhum (null).
  const groupTarget = (ref: string | null) => {
    if (ref === null) return { group: null, name: null, deps: [] as number[] }
    const g = existingGroup(ref)
    if (g) return { group: g.id, name: g.name, deps: [] as number[] }
    const n = newGroups.get(ref)
    return n ? { group: `new:${ref}`, name: n.name, deps: [n.index] } : undefined
  }
  const typesFit = (from: CategoryType, into: CategoryType) => into === from || into === 'both'
  const push = (op: Omit<ReorgOp, 'reason'>, r: RawReorgOp) => {
    ops.push({ ...op, reason: cleanName(r.reason).slice(0, 300) })
    return ops.length - 1
  }

  for (const r of raw) {
    if (ops.length >= REORG_MAX_OPERATIONS) break
    const name = cleanName(r.name)
    switch (r.kind) {
      case 'createGroup': {
        if (!r.newRef || !/^n\d+$/.test(r.newRef) || newGroups.has(r.newRef) || newCats.has(r.newRef)) break
        if (!validName(name) || groupNames.has(name.toLocaleLowerCase())) break
        const index = push({ kind: 'createGroup', key: r.newRef, name, color: HEX.test(r.color ?? '') ? r.color! : '#6366f1', dependsOn: [], label: {} }, r)
        newGroups.set(r.newRef, { index, name })
        groupNames.add(name.toLocaleLowerCase())
        break
      }
      case 'renameGroup': {
        const g = existingGroup(r.target)
        if (!g || !validName(name) || groupNames.has(name.toLocaleLowerCase())) break
        push({ kind: 'renameGroup', groupId: g.id, name, dependsOn: [], label: { target: g.name } }, r)
        groupNames.delete(g.name.toLocaleLowerCase())
        groupNames.add(name.toLocaleLowerCase())
        g.name = name
        break
      }
      case 'deleteGroup': {
        const g = existingGroup(r.target)
        if (!g) break
        push({ kind: 'deleteGroup', groupId: g.id, dependsOn: [], label: { target: g.name } }, r)
        removedGroups.add(g.id)
        break
      }
      case 'createCategory': {
        if (!r.newRef || !/^n\d+$/.test(r.newRef) || newCats.has(r.newRef) || newGroups.has(r.newRef)) break
        const type = r.type as CategoryType
        if (!['income', 'expense', 'both'].includes(type)) break
        if (!validName(name) || catNames.has(name.toLocaleLowerCase())) break
        const g = groupTarget(r.into)
        if (!g) break
        const index = push({
          kind: 'createCategory', key: r.newRef, name, type, group: g.group,
          icon: cleanName(r.icon).slice(0, 8) || '📁', color: HEX.test(r.color ?? '') ? r.color! : '#6366f1',
          dependsOn: g.deps, label: { group: g.name },
        }, r)
        newCats.set(r.newRef, { index, name, type })
        catNames.add(name.toLocaleLowerCase())
        break
      }
      case 'renameCategory': {
        const c = existingCat(r.target)
        if (!c || !validName(name) || catNames.has(name.toLocaleLowerCase())) break
        push({ kind: 'renameCategory', categoryId: c.id, name, dependsOn: [], label: { target: c.name } }, r)
        catNames.delete(c.name.toLocaleLowerCase())
        catNames.add(name.toLocaleLowerCase())
        c.name = name
        break
      }
      case 'setCategoryGroup': {
        const c = existingCat(r.target)
        const g = groupTarget(r.into)
        if (!c || !g || g.group === c.groupId) break
        push({ kind: 'setCategoryGroup', categoryId: c.id, group: g.group, dependsOn: g.deps, label: { target: c.name, group: g.name } }, r)
        break
      }
      case 'moveTransactions': {
        const c = existingCat(r.target)
        const t = categoryTarget(r.into)
        if (!c || !t || t.into === c.id || !typesFit(c.type, t.type)) break
        const known = ctx.descriptions[c.id] || {}
        const picked = new Map<string, [string, number]>()
        for (const d of r.descriptions || []) {
          const hit = known[cleanName(d).toLocaleLowerCase()]
          if (hit) picked.set(hit[0].toLocaleLowerCase(), hit)
        }
        const affected = [...picked.values()].reduce((s, [, n]) => s + n, 0)
        if (!affected) break
        const index = push({
          kind: 'moveTransactions', categoryId: c.id, into: t.into, descriptions: [...picked.values()].map(([d]) => d),
          affected, dependsOn: t.deps, label: { target: c.name, into: t.name },
        }, r)
        remaining.set(c.id, Math.max(0, (remaining.get(c.id) || 0) - affected))
        touchedBy.set(c.id, [...(touchedBy.get(c.id) || []), index])
        break
      }
      case 'mergeCategory': {
        const c = existingCat(r.target)
        const t = categoryTarget(r.into)
        if (!c || !t || t.into === c.id || !typesFit(c.type, t.type)) break
        push({
          kind: 'mergeCategory', categoryId: c.id, into: t.into, affected: remaining.get(c.id) || 0,
          dependsOn: [...t.deps, ...(touchedBy.get(c.id) || [])], label: { target: c.name, into: t.name },
        }, r)
        removed.add(c.id)
        catNames.delete(c.name.toLocaleLowerCase())
        break
      }
      case 'deleteCategory': {
        const c = existingCat(r.target)
        // Só vazias: com transações, o caminho é juntar noutra.
        if (!c || (remaining.get(c.id) || 0) > 0) break
        push({ kind: 'deleteCategory', categoryId: c.id, dependsOn: touchedBy.get(c.id) || [], label: { target: c.name } }, r)
        removed.add(c.id)
        catNames.delete(c.name.toLocaleLowerCase())
        break
      }
    }
  }
  return ops
}

// As operações escolhidas, mais as de que dependem, pela ordem de aplicação.
export function withDependencies(ops: ReorgOp[], selected: number[]): number[] {
  const all = new Set<number>()
  const add = (i: number) => {
    if (all.has(i) || !ops[i]) return
    all.add(i)
    ops[i].dependsOn.forEach(add)
  }
  selected.forEach(add)
  return [...all].sort((a, b) => REORG_PHASE[ops[a].kind] - REORG_PHASE[ops[b].kind] || a - b)
}
