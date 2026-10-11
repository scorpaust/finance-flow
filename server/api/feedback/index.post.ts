import { z } from 'zod'
import { Feedback, User } from '../../models'
import { requireAuth } from '../../utils/auth'
import { getUserTier } from '../../utils/requireFeature'
import { validateBody } from '../../utils/validate'
import { withinIdentityQuota } from '../../utils/rateLimit'
import { getServerLocale, serverT } from '../../utils/i18n'
import { sendEmail } from '../../utils/email'
import { SUPPORT_EMAIL, feedbackReceivedEmail, feedbackToOperatorEmail } from '../../utils/emailTemplates'
import { logEvent } from '../../utils/logger'
import { FEEDBACK_DAILY_LIMIT, FEEDBACK_MAX_LENGTH, FEEDBACK_TYPES } from '../../../shared/feedback'

// Upgrade 09 — "Ajuda e opinião": guarda a mensagem e envia-a ao operador por
// email (Reply-To = utilizador, se aceitou ser contactado), com o contexto
// técnico mínimo; confirma ao utilizador, na língua dele, só se aceitou ser
// contactado. Também recebe a resposta ao pedido de opinião (tipo `rating`).
// Limite: FEEDBACK_DAILY_LIMIT mensagens por conta por dia.
const ShortText = z.string().trim().max(120).optional()
const FeedbackSchema = z
  .object({
    type: z.enum([...FEEDBACK_TYPES, 'rating']),
    message: z.string().trim().max(FEEDBACK_MAX_LENGTH, 'feedback.tooLong').optional().default(''),
    rating: z.number().int().min(1).max(5).optional(),
    contactOk: z.boolean().optional().default(false),
    context: z.object({ platform: z.enum(['web', 'android']), appVersion: ShortText, page: ShortText }).optional(),
  })
  .superRefine((d, ctx) => {
    if (d.type === 'rating' && !d.rating) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'feedback.ratingRequired', path: ['rating'] })
    if (d.type !== 'rating' && d.message.length < 3) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'feedback.messageRequired', path: ['message'] })
  })

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const body = await validateBody(event, FeedbackSchema)
  const locale = getServerLocale(event)

  if (!(await withinIdentityQuota({ name: 'feedback', identity: userId, limit: FEEDBACK_DAILY_LIMIT, windowSeconds: 24 * 60 * 60 }))) {
    throw createError({ statusCode: 429, message: serverT(locale, 'feedback.dailyLimit'), data: { error: 'feedback_daily_limit' } })
  }

  const user = await User.findById(userId).select('email name').lean<{ email: string; name: string }>()
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })
  const context = {
    platform: body.context?.platform || 'web',
    appVersion: body.context?.appVersion,
    page: body.context?.page,
    locale,
    plan: await getUserTier(userId),
  }

  const doc = await Feedback.create({
    userId,
    type: body.type,
    message: body.message,
    rating: body.type === 'rating' ? body.rating : null,
    contactOk: body.contactOk,
    context,
  })

  const sent = await sendEmail(
    feedbackToOperatorEmail({
      to: process.env.SUPPORT_INBOX || SUPPORT_EMAIL,
      userEmail: user.email,
      userName: user.name,
      userId,
      type: body.type,
      message: body.message,
      rating: doc.rating,
      contactOk: body.contactOk,
      context,
    })
  )
  if (body.contactOk && body.type !== 'rating') {
    await sendEmail(feedbackReceivedEmail({ to: user.email, name: user.name, message: body.message, locale }))
  }
  logEvent('info', 'feedback.received', { userId, type: body.type, sent }, event)
  return { success: true }
})
