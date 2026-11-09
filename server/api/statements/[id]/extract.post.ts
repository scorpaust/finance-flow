import { z } from 'zod'
import { Category, Transaction } from '../../../models'
import { requireFeature } from '../../../utils/requireFeature'
import { getServerLocale, serverT } from '../../../utils/i18n'
import { validateBody } from '../../../utils/validate'
import { enforceRateLimit } from '../../../utils/rateLimit'
import { extractStatementRows } from '../../../utils/anthropic'
import { findImport } from '../../../utils/statementImport'
import { logEvent } from '../../../utils/logger'
import { getUserDisplayCurrency } from '../../../utils/displayCurrency'
import {
  DUPLICATE_WINDOW_DAYS, STATEMENT_MAX_CHUNK_BYTES, STATEMENT_MAX_PAGES, STATEMENT_MAX_ROWS,
  markDuplicates, sanitizeStatementRow,
} from '../../../../shared/statementImport'

// Lê um bloco de páginas do extrato com a IA e devolve as linhas para rever.
// O PDF só passa por aqui em memória: não é guardado nem registado.
const MAX_BASE64 = Math.ceil((STATEMENT_MAX_CHUNK_BYTES * 4) / 3) + 4
const ExtractSchema = z.object({
  data: z.string().min(8, 'statements.invalidFile').max(MAX_BASE64, 'statements.tooLarge').regex(/^[A-Za-z0-9+/]+=*$/, 'statements.invalidFile'),
  pages: z.number().int().min(1).max(10),
})

export default defineEventHandler(async (event) => {
  const { userId } = await requireFeature(event, 'statementImport')
  const locale = getServerLocale(event)
  await enforceRateLimit(event, { name: 'statements-extract', limit: 30, windowSeconds: 60, identity: userId })
  const { data, pages } = await validateBody(event, ExtractSchema)

  const doc = await findImport(userId, getRouterParam(event, 'id') || '')
  if (!doc || doc.status !== 'extracting') throw createError({ statusCode: 404, message: serverT(locale, 'statements.notFound') })
  // "%PDF" em base64.
  if (!data.startsWith('JVBER')) throw createError({ statusCode: 400, message: serverT(locale, 'statements.invalidFile') })
  if (doc.pages + pages > STATEMENT_MAX_PAGES) {
    throw createError({ statusCode: 400, message: serverT(locale, 'statements.tooManyPages', { max: STATEMENT_MAX_PAGES }) })
  }

  const categories = await Category.find({ userId }).select('name type').lean()
  const { extraction, usage } = await extractStatementRows({
    base64: data,
    categories: categories.map((c: any) => ({ name: c.name, type: c.type })),
    locale,
  })
  doc.pages += pages
  logEvent('info', 'statements.extracted', { pages, rows: extraction.rows?.length || 0, inputTokens: usage.input_tokens, outputTokens: usage.output_tokens })

  if (!extraction.isStatement) {
    await doc.save()
    throw createError({ statusCode: 422, message: serverT(locale, 'statements.notAStatement'), data: { error: 'statements_not_a_statement' } })
  }

  const byName = new Map(categories.map((c: any) => [String(c.name).toLocaleLowerCase(), String(c._id)]))
  const clean = (extraction.rows || [])
    .map((r) => sanitizeStatementRow(r, byName))
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .slice(0, Math.max(0, STATEMENT_MAX_ROWS - doc.rowsExtracted))
  doc.rowsExtracted += clean.length
  await doc.save()
  // Os valores do extrato contam-se na moeda das configurações.
  const currency = await getUserDisplayCurrency(userId)
  if (!clean.length) return { rows: [], currency }

  // Transações já registadas perto destas datas, para assinalar duplicados.
  const times = clean.map((r) => new Date(`${r.date}T00:00:00Z`).getTime())
  const margin = DUPLICATE_WINDOW_DAYS * 86_400_000
  const existing = await Transaction.find({
    userId,
    date: { $gte: new Date(Math.min(...times) - margin), $lte: new Date(Math.max(...times) + margin) },
  }).select('type amount originalAmount currency date description').lean()

  return {
    currency,
    rows: markDuplicates(clean, existing.map((t: any) => ({
      id: String(t._id), type: t.type, amount: t.amount, originalAmount: t.originalAmount ?? null,
      currency: t.currency || 'EUR', date: t.date, description: t.description,
    })), currency),
  }
})
