import type { H3Event } from 'h3'
import { z } from 'zod'
import { validateQuery } from './validate'

// Filtros de query partilhados. Antes cada endpoint lia `getQuery` em bruto:
// `limit=0` fazia `.limit(0)` (= sem limite), `sortBy` aceitava qualquer campo,
// um id mal formado dava 500 (CastError), `months=abc` gerava datas inválidas e
// a pesquisa era usada como regex sem escape (500 com `(`, ou regex
// catastrófica). Valores inválidos caem no default em vez de rebentar — são
// filtros de UI, não dados a gravar.
const OBJECT_ID = /^[0-9a-fA-F]{24}$/
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const TransactionFilterShape = {
  type: z.enum(['all', 'income', 'expense']).catch('all'),
  categoryId: z.string().regex(OBJECT_ID).optional().catch(undefined),
  groupId: z.union([z.literal('none'), z.string().regex(OBJECT_ID)]).optional().catch(undefined),
  startDate: z.string().regex(DATE_ONLY).optional().catch(undefined),
  endDate: z.string().regex(DATE_ONLY).optional().catch(undefined),
  search: z.string().trim().max(100).optional().catch(undefined),
}

const TransactionListQuerySchema = z.object({
  ...TransactionFilterShape,
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
  limit: z.coerce.number().int().min(1).max(100).catch(20),
  sortBy: z.enum(['date', 'amount', 'description', 'createdAt']).catch('date'),
  sortOrder: z.enum(['asc', 'desc']).catch('desc'),
})

type TransactionFilterQuery = z.infer<z.ZodObject<typeof TransactionFilterShape>>

function buildTransactionFilter(userId: string, q: TransactionFilterQuery): Record<string, any> {
  const filter: Record<string, any> = { userId }
  if (q.type !== 'all') filter.type = q.type
  if (q.categoryId) filter.categoryId = q.categoryId
  if (q.groupId) filter.groupId = q.groupId === 'none' ? null : q.groupId
  if (q.startDate || q.endDate) {
    filter.date = {}
    if (q.startDate) filter.date.$gte = new Date(q.startDate)
    if (q.endDate) filter.date.$lte = new Date(q.endDate + 'T23:59:59.999Z')
  }
  if (q.search) {
    const pattern = new RegExp(escapeRegex(q.search), 'i')
    filter.$or = [{ description: pattern }, { notes: pattern }, { tags: pattern }]
  }
  return filter
}

export async function readTransactionListQuery(event: H3Event, userId: string) {
  const q = await validateQuery(event, TransactionListQuerySchema)
  return {
    filter: buildTransactionFilter(userId, q),
    page: q.page,
    limit: q.limit,
    // `_id` como desempate: sem ele, várias transações no mesmo dia podiam
    // repetir-se ou saltar entre páginas.
    sort: { [q.sortBy]: q.sortOrder === 'asc' ? 1 : -1, _id: -1 } as Record<string, 1 | -1>,
  }
}

export async function readTransactionFilter(event: H3Event, userId: string): Promise<Record<string, any>> {
  return buildTransactionFilter(userId, await validateQuery(event, z.object(TransactionFilterShape)))
}

// `?months=N` das estatísticas/previsões, limitado a um intervalo razoável.
export async function readMonthsQuery(event: H3Event, fallback: number, max = 60): Promise<number> {
  const { months } = await validateQuery(
    event,
    z.object({ months: z.coerce.number().int().min(1).max(max).catch(fallback) })
  )
  return months
}
