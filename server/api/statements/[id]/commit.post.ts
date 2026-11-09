import { z } from 'zod'
import { Category, Transaction } from '../../../models'
import { requireFeature } from '../../../utils/requireFeature'
import { getServerLocale, serverT } from '../../../utils/i18n'
import { validateBody } from '../../../utils/validate'
import { findImport, statementState } from '../../../utils/statementImport'
import { getEurRate, getUserDisplayCurrency } from '../../../utils/displayCurrency'
import { STATEMENT_MAX_ROWS } from '../../../../shared/statementImport'

// Importa as linhas que o utilizador aprovou: cria as transações (ligadas a
// esta importação), as categorias novas, e atualiza as transações existentes
// que escolheu atualizar, guardando os valores de antes para "Desfazer".
const OBJECT_ID = /^[a-f0-9]{24}$/i
const Row = z.object({
  action: z.enum(['import', 'update']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'statements.invalidRows'),
  description: z.string().trim().min(1, 'statements.invalidRows').max(120, 'statements.invalidRows'),
  amount: z.number().positive('statements.invalidRows').max(1e9, 'statements.invalidRows'),
  type: z.enum(['income', 'expense']),
  categoryId: z.string().regex(OBJECT_ID).nullable(),
  newCategory: z.string().trim().min(1).max(40).nullable(),
  existingId: z.string().regex(OBJECT_ID).nullable().optional(),
})
const CommitSchema = z.object({
  rows: z.array(Row).min(1, 'statements.invalidRows').max(STATEMENT_MAX_ROWS, 'statements.invalidRows'),
})

export default defineEventHandler(async (event) => {
  const { userId } = await requireFeature(event, 'statementImport')
  const locale = getServerLocale(event)
  const { rows } = await validateBody(event, CommitSchema)

  const doc = await findImport(userId, getRouterParam(event, 'id') || '')
  if (!doc || doc.status !== 'extracting') throw createError({ statusCode: 404, message: serverT(locale, 'statements.notFound') })
  const invalid = () => createError({ statusCode: 400, message: serverT(locale, 'statements.invalidRows') })
  if (rows.some((r) => !r.categoryId && !r.newCategory)) throw invalid()
  if (rows.some((r) => r.action === 'update' && !r.existingId)) throw invalid()

  // Categorias: as indicadas têm de ser da conta; as novas reaproveitam uma
  // com o mesmo nome, se já existir.
  const categories = await Category.find({ userId }).select('name type groupId').lean()
  const byId = new Map(categories.map((c: any) => [String(c._id), c]))
  const byName = new Map(categories.map((c: any) => [String(c.name).toLocaleLowerCase(), c]))
  if (rows.some((r) => r.categoryId && !byId.has(r.categoryId))) throw invalid()

  const newNames = new Map<string, { name: string; types: Set<string> }>()
  for (const r of rows) {
    if (r.categoryId || !r.newCategory || byName.has(r.newCategory.toLocaleLowerCase())) continue
    const key = r.newCategory.toLocaleLowerCase()
    const entry = newNames.get(key) || { name: r.newCategory, types: new Set<string>() }
    entry.types.add(r.type)
    newNames.set(key, entry)
  }
  for (const [key, { name, types }] of newNames) {
    const created = await Category.create({ userId, name, type: types.size > 1 ? 'both' : [...types][0], icon: '📁', isDefault: false })
    byName.set(key, created.toObject())
    byId.set(String(created._id), created.toObject())
    doc.createdCategories.push(created._id as any)
  }
  const categoryFor = (r: z.infer<typeof Row>) => (r.categoryId ? byId.get(r.categoryId) : byName.get(r.newCategory!.toLocaleLowerCase()))

  // Atualizações: só transações da própria conta.
  const updates = rows.filter((r) => r.action === 'update')
  const existing = await Transaction.find({ userId, _id: { $in: updates.map((r) => r.existingId) } }).lean()
  const existingById = new Map(existing.map((t: any) => [String(t._id), t]))
  if (existingById.size !== new Set(updates.map((r) => r.existingId)).size) throw invalid()
  for (const r of updates) {
    const tx: any = existingById.get(r.existingId!)
    const category: any = categoryFor(r)
    doc.updated.push({ id: String(tx._id), description: tx.description, categoryId: String(tx.categoryId), groupId: tx.groupId ? String(tx.groupId) : null })
    await Transaction.updateOne(
      { _id: tx._id, userId },
      { $set: { description: r.description, categoryId: category._id, groupId: category.groupId || null } },
    )
  }

  // Valores na moeda das configurações: guardados em euros, com o valor e a
  // moeda originais ao lado, como no resto da app. Com a taxa do dia já usada
  // para mostrar a app nessa moeda: um só pedido por importação (uma taxa por
  // data seriam dezenas de pedidos ao fornecedor), e o que a app mostra depois
  // coincide com o extrato.
  const currency = await getUserDisplayCurrency(userId)
  const fx = await getEurRate(currency)
  if (fx.currency !== currency) {
    throw createError({
      statusCode: 422,
      message: serverT(locale, 'transactionCurrency.exchangeRateUnavailable', { currency }),
      data: { error: 'exchange_rate_unavailable', currency },
    })
  }
  const toEur = (value: number) => currency === 'EUR'
    ? { amount: value, currency: 'EUR', originalAmount: null, exchangeRate: null }
    : { amount: Math.round((value / fx.rate) * 100) / 100, currency, originalAmount: value, exchangeRate: 1 / fx.rate }
  const imports = rows.filter((r) => r.action === 'import')
  if (imports.length) {
    await Transaction.insertMany(imports.map((r) => {
      const category: any = categoryFor(r)
      const value = toEur(r.amount)
      return {
        userId,
        type: r.type,
        amount: value.amount,
        currency: value.currency,
        originalAmount: value.originalAmount,
        exchangeRate: value.exchangeRate,
        description: r.description,
        categoryId: category._id,
        groupId: category.groupId || null,
        date: new Date(`${r.date}T00:00:00Z`),
        tags: [],
        recurrence: 'none',
        importId: doc._id,
      }
    }))
  }

  doc.status = 'committed'
  doc.created = imports.length
  doc.committedAt = new Date()
  doc.markModified('updated')
  await doc.save()
  return { created: imports.length, updated: updates.length, categoriesCreated: newNames.size, state: await statementState(userId) }
})
