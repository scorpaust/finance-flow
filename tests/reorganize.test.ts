import { describe, expect, it } from 'vitest'
import { normalizeReorgOperations, withDependencies, type RawReorgOp, type ReorgContext } from '../shared/reorganize'

const ctx: ReorgContext = {
  categories: [
    { ref: 'c1', id: 'A', name: 'Supermercado', type: 'expense', groupId: null, txCount: 10 },
    { ref: 'c2', id: 'B', name: 'Outros', type: 'expense', groupId: 'G1', txCount: 4 },
    { ref: 'c3', id: 'C', name: 'Salário', type: 'income', groupId: null, txCount: 2 },
    { ref: 'c4', id: 'D', name: 'Vazia', type: 'expense', groupId: null, txCount: 0 },
  ],
  groups: [{ ref: 'g1', id: 'G1', name: 'Casa' }],
  descriptions: { B: { continente: ['Continente', 3], cinema: ['Cinema', 1] } },
}
const op = (o: Partial<RawReorgOp>): RawReorgOp => ({
  kind: '', target: null, into: null, newRef: null, name: null, type: null, icon: null, color: null, descriptions: null, reason: 'porque sim', ...o,
})

describe('normalizeReorgOperations', () => {
  it('liga as operações às criações de que dependem', () => {
    const ops = normalizeReorgOperations([
      op({ kind: 'createGroup', newRef: 'n1', name: 'Lazer' }),
      op({ kind: 'createCategory', newRef: 'n2', name: 'Cultura', type: 'expense', into: 'n1' }),
      op({ kind: 'moveTransactions', target: 'c2', into: 'n2', descriptions: ['cinema'] }),
    ], ctx)
    expect(ops.map((o) => o.kind)).toEqual(['createGroup', 'createCategory', 'moveTransactions'])
    expect(ops[1]).toMatchObject({ group: 'new:n1', dependsOn: [0] })
    expect(ops[2]).toMatchObject({ into: 'new:n2', descriptions: ['Cinema'], affected: 1, dependsOn: [1] })
  })

  it('só move descrições que existem na categoria', () => {
    const ops = normalizeReorgOperations([op({ kind: 'moveTransactions', target: 'c2', into: 'c1', descriptions: ['Continente', 'Inventada'] })], ctx)
    expect(ops[0]).toMatchObject({ descriptions: ['Continente'], affected: 3 })
    expect(normalizeReorgOperations([op({ kind: 'moveTransactions', target: 'c2', into: 'c1', descriptions: ['Inventada'] })], ctx)).toEqual([])
  })

  it('recusa juntar receitas com despesas, refs desconhecidas e nomes repetidos', () => {
    expect(normalizeReorgOperations([
      op({ kind: 'mergeCategory', target: 'c3', into: 'c1' }),
      op({ kind: 'mergeCategory', target: 'c9', into: 'c1' }),
      op({ kind: 'renameCategory', target: 'c2', name: 'supermercado' }),
      op({ kind: 'createGroup', newRef: 'n1', name: 'casa' }),
      op({ kind: 'createCategory', newRef: 'x', name: 'Nova', type: 'expense' }),
    ], ctx)).toEqual([])
  })

  it('só apaga categorias vazias, ou esvaziadas antes na mesma proposta', () => {
    expect(normalizeReorgOperations([op({ kind: 'deleteCategory', target: 'c2' })], ctx)).toEqual([])
    const ops = normalizeReorgOperations([
      op({ kind: 'deleteCategory', target: 'c4' }),
      op({ kind: 'moveTransactions', target: 'c2', into: 'c1', descriptions: ['Continente', 'Cinema'] }),
      op({ kind: 'deleteCategory', target: 'c2' }),
    ], ctx)
    expect(ops.map((o) => o.kind)).toEqual(['deleteCategory', 'moveTransactions', 'deleteCategory'])
    expect(ops[2].dependsOn).toEqual([1])
  })

  it('não mexe numa categoria depois de juntada', () => {
    const ops = normalizeReorgOperations([
      op({ kind: 'mergeCategory', target: 'c2', into: 'c1' }),
      op({ kind: 'renameCategory', target: 'c2', name: 'Diversos' }),
    ], ctx)
    expect(ops).toHaveLength(1)
    expect(ops[0]).toMatchObject({ kind: 'mergeCategory', affected: 4, label: { target: 'Outros', into: 'Supermercado' } })
  })
})

describe('withDependencies', () => {
  it('junta as dependências e ordena pela fase de aplicação', () => {
    const ops = normalizeReorgOperations([
      op({ kind: 'deleteCategory', target: 'c4' }),
      op({ kind: 'createGroup', newRef: 'n1', name: 'Lazer' }),
      op({ kind: 'createCategory', newRef: 'n2', name: 'Cultura', type: 'expense', into: 'n1' }),
      op({ kind: 'moveTransactions', target: 'c2', into: 'n2', descriptions: ['cinema'] }),
    ], ctx)
    expect(withDependencies(ops, [3, 0])).toEqual([1, 2, 3, 0])
  })
})
