import { z } from 'zod'
import { Category } from '../../models'
import { requireAuth } from '../../utils/auth'
import { validateBody } from '../../utils/validate'
import { defaultCategoryKeyForName, defaultCategoryName } from '../../utils/defaultCategories'
import { logEvent } from '../../utils/logger'
import type { ServerLocale } from '../../utils/i18n'

// Upgrade 06 — traduz para a nova língua da app as categorias por omissão que
// o utilizador nunca renomeou (as categorias são dados dele: nomes mudados à
// mão ficam como estão). Com `dryRun`, só conta quantas mudariam — a app usa
// isso para perguntar antes de mudar. Se o nome traduzido já existir noutra
// categoria da conta, essa fica como está (índice único {userId, name}).
const TranslateSchema = z.object({
  locale: z.enum(['pt-PT', 'en', 'fr', 'de', 'it', 'es']),
  dryRun: z.boolean().optional().default(false),
})

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const { locale, dryRun } = await validateBody(event, TranslateSchema)

  const categories = await Category.find({ userId }).select('name isDefault').lean()
  const taken = new Set(categories.map((c: any) => String(c.name).toLocaleLowerCase()))

  const changes: { id: string; from: string; to: string }[] = []
  for (const c of categories as any[]) {
    if (!c.isDefault) continue
    const key = defaultCategoryKeyForName(c.name)
    if (!key) continue
    const to = defaultCategoryName(key, locale as ServerLocale)
    if (to === c.name || taken.has(to.toLocaleLowerCase())) continue
    changes.push({ id: String(c._id), from: c.name, to })
    taken.add(to.toLocaleLowerCase())
  }

  if (!dryRun && changes.length) {
    await Category.bulkWrite(
      changes.map((ch) => ({ updateOne: { filter: { _id: ch.id, userId }, update: { $set: { name: ch.to } } } })) as any
    )
    logEvent('info', 'categories.defaults_translated', { userId, count: changes.length, locale })
  }

  return { count: changes.length, changes: changes.map(({ from, to }) => ({ from, to })) }
})
