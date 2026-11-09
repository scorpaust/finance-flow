import { Category, StatementImport, Transaction } from '../../../models'
import { requireFeature } from '../../../utils/requireFeature'
import { getServerLocale, serverT } from '../../../utils/i18n'
import { findImport, statementState } from '../../../utils/statementImport'

// "Desfazer" a última importação: apaga as transações que criou, repõe as que
// atualizou e apaga as categorias que criou, se tiverem ficado vazias.
export default defineEventHandler(async (event) => {
  const { userId } = await requireFeature(event, 'statementImport')
  const locale = getServerLocale(event)

  const doc = await findImport(userId, getRouterParam(event, 'id') || '')
  const last = await StatementImport.findOne({ userId, status: 'committed' }).sort({ committedAt: -1 }).select('_id').lean()
  // Só a mais recente, como na reorganização: desfazer uma anterior podia
  // repor valores por cima de alterações feitas depois.
  if (!doc || doc.status !== 'committed' || String(last?._id) !== String(doc._id)) {
    throw createError({ statusCode: 409, message: serverT(locale, 'statements.nothingToUndo') })
  }

  const removed = await Transaction.deleteMany({ userId, importId: doc._id })
  if (doc.updated.length) {
    await Transaction.bulkWrite(doc.updated.map((u) => ({
      updateOne: { filter: { _id: u.id, userId }, update: { $set: { description: u.description, categoryId: u.categoryId, groupId: u.groupId } } },
    })) as any)
  }
  for (const categoryId of doc.createdCategories) {
    if (!(await Transaction.exists({ userId, categoryId }))) await Category.deleteOne({ _id: categoryId, userId })
  }

  doc.status = 'undone'
  await doc.save()
  return { removed: removed.deletedCount, restored: doc.updated.length, state: await statementState(userId) }
})
