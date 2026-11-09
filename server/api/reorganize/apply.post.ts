import { z } from 'zod'
import { AiReorgProposal } from '../../models'
import { requireFeature } from '../../utils/requireFeature'
import { getServerLocale, serverT } from '../../utils/i18n'
import { validateBody } from '../../utils/validate'
import { ReorgConflictError, applyReorg, reorgState } from '../../utils/aiReorganize'
import { REORG_MAX_OPERATIONS } from '../../../shared/reorganize'

// Aplica as alterações escolhidas pelo utilizador (e as de que dependem).
// Antes de mexer guarda o estado anterior; se alguma falhar, repõe tudo.
const ApplySchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/i, 'reorganize.noProposal'),
  operations: z
    .array(z.number().int().min(0).max(REORG_MAX_OPERATIONS - 1), 'reorganize.invalidSelection')
    .min(1, 'reorganize.invalidSelection')
    .max(REORG_MAX_OPERATIONS, 'reorganize.invalidSelection'),
})

export default defineEventHandler(async (event) => {
  const { userId } = await requireFeature(event, 'aiReorganize')
  const locale = getServerLocale(event)
  const { id, operations } = await validateBody(event, ApplySchema)

  const proposal = await AiReorgProposal.findOne({ _id: id, userId, status: 'ready' }).lean()
  if (!proposal) throw createError({ statusCode: 404, message: serverT(locale, 'reorganize.noProposal') })
  const selected = [...new Set(operations)].filter((i) => i < proposal.operations.length)
  if (!selected.length) throw createError({ statusCode: 400, message: serverT(locale, 'reorganize.invalidSelection') })

  try {
    await applyReorg(userId, id, proposal.operations, selected)
  } catch (e) {
    if (e instanceof ReorgConflictError) {
      throw createError({ statusCode: 409, message: serverT(locale, 'reorganize.conflict'), data: { error: 'reorganize_conflict' } })
    }
    throw e
  }
  return reorgState(userId)
})
