import { z } from 'zod'
import { AiReorgProposal } from '../../models'
import { requireFeature } from '../../utils/requireFeature'
import { getServerLocale, serverT } from '../../utils/i18n'
import { validateBody } from '../../utils/validate'
import { ReorgUndoBlockedError, reorgState, undoReorg } from '../../utils/aiReorganize'

// "Desfazer": repõe as categorias, os grupos e as transações como estavam
// antes da última reorganização aplicada.
const UndoSchema = z.object({ id: z.string().regex(/^[a-f0-9]{24}$/i, 'reorganize.nothingToUndo') })

export default defineEventHandler(async (event) => {
  const { userId } = await requireFeature(event, 'aiReorganize')
  const locale = getServerLocale(event)
  const { id } = await validateBody(event, UndoSchema)

  const nothingToUndo = () => createError({ statusCode: 409, message: serverT(locale, 'reorganize.nothingToUndo') })
  const [proposal, lastApplied] = await Promise.all([
    AiReorgProposal.findOne({ _id: id, userId, status: 'applied' }).lean(),
    AiReorgProposal.findOne({ userId, status: 'applied' }).sort({ appliedAt: -1 }).select('_id').lean(),
  ])
  // Só a mais recente: desfazer uma anterior apagaria o que veio depois.
  if (!proposal?.snapshot || String(lastApplied?._id) !== id) throw nothingToUndo()

  try {
    await undoReorg(userId, id, proposal.snapshot)
  } catch (e) {
    if (e instanceof ReorgUndoBlockedError) {
      throw createError({ statusCode: 409, message: serverT(locale, 'reorganize.undoBlocked'), data: { error: 'reorganize_undo_blocked' } })
    }
    throw e
  }
  return reorgState(userId)
})
