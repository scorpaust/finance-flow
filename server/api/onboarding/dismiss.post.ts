import { User } from '../../models'
import { requireAuth } from '../../utils/auth'

// Upgrade 08 — "Não mostrar mais" na lista de primeiros passos.
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  await User.updateOne({ _id: userId }, { $set: { onboardingDismissedAt: new Date() } })
  return { success: true }
})
