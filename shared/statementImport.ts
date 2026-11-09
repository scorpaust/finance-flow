// Importar o extrato bancário em PDF (Premium). O browser divide o PDF em
// blocos de poucas páginas (cada pedido tem de caber nos 60 s e ~6 MB de uma
// função da Netlify); a IA lê cada bloco; o utilizador revê tudo antes de
// importar; e cada importação pode ser desfeita. Funções puras, partilhadas
// pelo servidor e pelos testes.

export const STATEMENT_MONTHLY_LIMIT = 10
export const STATEMENT_PAGES_PER_CHUNK = 3
export const STATEMENT_MAX_PAGES = 60
// Tamanho máximo de um bloco, em bytes do PDF (o pedido leva-o em base64, +33 %).
export const STATEMENT_MAX_CHUNK_BYTES = 3_500_000
export const STATEMENT_MAX_ROWS = 1000
// Uma transação já registada conta como a mesma se tiver o mesmo tipo e valor
// e uma data até este número de dias de diferença.
export const DUPLICATE_WINDOW_DAYS = 2

const DAY_MS = 86_400_000
const DATE = /^\d{4}-\d{2}-\d{2}$/

export interface RawStatementRow {
  date: string
  description: string
  amount: number
  type: string
  category: string | null
  newCategory: string | null
  internalTransfer: boolean
}

export interface StatementRow {
  date: string // AAAA-MM-DD
  description: string
  amount: number
  type: 'income' | 'expense'
  categoryId: string | null
  newCategory: string | null
  internalTransfer: boolean
  duplicateOf: { id: string; description: string; date: string } | null
}

export interface ExistingTx {
  id: string
  type: 'income' | 'expense'
  // Sempre em euros; `originalAmount` é o valor na moeda `currency`.
  amount: number
  originalAmount: number | null
  currency: string
  date: Date
  description: string
}

// O valor de uma transação existente na moeda do extrato (a das
// configurações), ou null se não houver forma de o comparar.
function valueIn(tx: ExistingTx, currency: string): number | null {
  if (tx.currency === currency) return tx.originalAmount ?? tx.amount
  return currency === 'EUR' ? tx.amount : null
}

const clean = (s: unknown, max: number) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, max)

// Valida e limpa uma linha devolvida pela IA; null se não servir.
export function sanitizeStatementRow(
  raw: RawStatementRow,
  categoryIdByName: Map<string, string>,
): Omit<StatementRow, 'duplicateOf'> | null {
  if (!DATE.test(raw.date) || Number.isNaN(new Date(`${raw.date}T00:00:00Z`).getTime())) return null
  const amount = Math.round(Math.abs(Number(raw.amount)) * 100) / 100
  if (!Number.isFinite(amount) || amount <= 0) return null
  if (raw.type !== 'income' && raw.type !== 'expense') return null
  const description = clean(raw.description, 120)
  if (!description) return null
  const categoryId = raw.category ? categoryIdByName.get(raw.category.toLocaleLowerCase()) ?? null : null
  const newCategory = categoryId ? null : clean(raw.newCategory, 40) || null
  return { date: raw.date, description, amount, type: raw.type, categoryId, newCategory, internalTransfer: !!raw.internalTransfer }
}

// Liga cada linha à transação já registada que parece ser a mesma (mesmo tipo
// e valor na moeda do extrato, data próxima). Cada transação existente só
// serve uma linha.
export function markDuplicates(rows: Omit<StatementRow, 'duplicateOf'>[], existing: ExistingTx[], currency: string): StatementRow[] {
  const used = new Set<string>()
  return rows.map((row) => {
    const day = new Date(`${row.date}T00:00:00Z`).getTime()
    const match = existing.find((tx) => {
      const value = valueIn(tx, currency)
      return !used.has(tx.id) &&
        tx.type === row.type &&
        value !== null && Math.abs(value - row.amount) < 0.005 &&
        Math.abs(new Date(tx.date).getTime() - day) <= DUPLICATE_WINDOW_DAYS * DAY_MS
    })
    if (match) used.add(match.id)
    return {
      ...row,
      duplicateOf: match ? { id: match.id, description: match.description, date: new Date(match.date).toISOString().slice(0, 10) } : null,
    }
  })
}

// Os blocos de páginas a enviar: [primeira, quantas], a começar em 0.
export function pageChunks(pageCount: number, perChunk = STATEMENT_PAGES_PER_CHUNK): [number, number][] {
  const chunks: [number, number][] = []
  for (let first = 0; first < Math.min(pageCount, STATEMENT_MAX_PAGES); first += perChunk) {
    chunks.push([first, Math.min(perChunk, pageCount - first)])
  }
  return chunks
}
