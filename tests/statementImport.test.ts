import { describe, expect, it } from 'vitest'
import { markDuplicates, pageChunks, sanitizeStatementRow, type RawStatementRow } from '../shared/statementImport'

const cats = new Map([['supermercado', 'CAT1']])
const row = (o: Partial<RawStatementRow>): RawStatementRow => ({
  date: '2026-10-05', description: 'Continente Lisboa', amount: 42.5, type: 'expense', category: null, newCategory: null, internalTransfer: false, ...o,
})

describe('sanitizeStatementRow', () => {
  it('liga a categoria pelo nome e ignora a nova quando já existe', () => {
    expect(sanitizeStatementRow(row({ category: 'Supermercado', newCategory: 'Compras' }), cats))
      .toMatchObject({ categoryId: 'CAT1', newCategory: null, amount: 42.5, type: 'expense' })
    expect(sanitizeStatementRow(row({ category: 'Inexistente', newCategory: ' Ginásio ' }), cats))
      .toMatchObject({ categoryId: null, newCategory: 'Ginásio' })
  })

  it('valor sempre positivo, arredondado ao cêntimo', () => {
    expect(sanitizeStatementRow(row({ amount: -10.005 }), cats)?.amount).toBe(10.01)
  })

  it('recusa datas, valores, tipos e descrições inválidos', () => {
    expect(sanitizeStatementRow(row({ date: '05/10/2026' }), cats)).toBeNull()
    expect(sanitizeStatementRow(row({ amount: 0 }), cats)).toBeNull()
    expect(sanitizeStatementRow(row({ type: 'transfer' }), cats)).toBeNull()
    expect(sanitizeStatementRow(row({ description: '   ' }), cats)).toBeNull()
  })
})

describe('markDuplicates', () => {
  const existing = [
    { id: 'T1', type: 'expense' as const, amount: 42.5, originalAmount: null, currency: 'EUR', date: new Date('2026-10-06T00:00:00Z'), description: 'Continente' },
    { id: 'T2', type: 'income' as const, amount: 42.5, originalAmount: null, currency: 'EUR', date: new Date('2026-10-05T00:00:00Z'), description: 'Reembolso' },
  ]
  const base = sanitizeStatementRow(row({}), cats)!

  it('mesmo tipo e valor, até 2 dias de diferença', () => {
    expect(markDuplicates([base], existing, 'EUR')[0].duplicateOf).toMatchObject({ id: 'T1', date: '2026-10-06' })
    expect(markDuplicates([{ ...base, date: '2026-10-09' }], existing, 'EUR')[0].duplicateOf).toBeNull()
  })

  it('cada transação existente só serve uma linha', () => {
    const [a, b] = markDuplicates([base, base], existing, 'EUR')
    expect(a.duplicateOf?.id).toBe('T1')
    expect(b.duplicateOf).toBeNull()
  })

  it('noutra moeda compara o valor original, nunca o equivalente em euros', () => {
    const usd = [{ ...existing[0], id: 'U1', amount: 39.1, originalAmount: 42.5, currency: 'USD' }]
    expect(markDuplicates([base], usd, 'USD')[0].duplicateOf?.id).toBe('U1')
    // Uma despesa de 42,50 € não é a mesma que 42,50 $.
    expect(markDuplicates([base], existing, 'USD')[0].duplicateOf).toBeNull()
  })
})

describe('pageChunks', () => {
  it('divide em blocos de 3 páginas, até ao máximo', () => {
    expect(pageChunks(7)).toEqual([[0, 3], [3, 3], [6, 1]])
    expect(pageChunks(200).at(-1)).toEqual([57, 3])
  })
})
