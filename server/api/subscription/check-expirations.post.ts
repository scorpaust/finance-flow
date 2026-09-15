import { User } from '../../models'

// Job de expiração de planos pré-pagos (MB WAY/Multibanco) — ver tarefa 5 da
// especificação da Fase 2. Não há scheduler no projeto (sem node-cron nem
// Nitro scheduled tasks configuradas), por isso este endpoint foi desenhado
// para ser invocado por um cron externo (ex. cron-job.org, GitHub Actions
// schedule, ou cron do próprio servidor) com o header `x-cron-secret` a bater
// com CRON_SECRET. Envio real de email/push fica por implementar — não existe
// nenhum serviço de notificações no projeto ainda; a resposta devolve a lista
// de utilizadores a avisar para um processo externo tratar disso por agora.
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const providedSecret = getHeader(event, 'x-cron-secret')

  if (!config.cronSecret || providedSecret !== config.cronSecret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const now = new Date()
  const reminderDays = parseInt(config.subscriptionRenewalReminderDays) || 3
  const reminderThreshold = new Date(now.getTime() + reminderDays * 24 * 60 * 60 * 1000)

  const expired = await User.find({
    'subscription.currentPeriodEnd': { $lt: now },
    $or: [
      // Pré-pago (MB WAY/Multibanco) que passou do período pago.
      { 'subscription.periodType': 'prepaid', 'subscription.status': { $in: ['active', 'pending'] } },
      // Recorrente cancelado (auto-renovação desligada) cujo período já pago
      // terminou — ver handleSubscriptionCancelled/cancel.post.ts, que
      // deliberadamente não fazem downgrade imediato.
      { 'subscription.periodType': 'recurring', 'subscription.status': 'canceled' },
    ],
  })

  for (const user of expired) {
    user.subscription.tier = 'free'
    user.subscription.status = 'expired'
    user.subscription.autoRenew = false
    await user.save()
  }

  const needsReminder = await User.find({
    'subscription.periodType': 'prepaid',
    'subscription.status': 'active',
    'subscription.currentPeriodEnd': { $gte: now, $lte: reminderThreshold },
    'subscription.reminderSentAt': null,
  }).select('_id email name subscription.currentPeriodEnd')

  for (const user of needsReminder) {
    user.subscription.reminderSentAt = now
    await user.save()
  }

  return {
    expiredCount: expired.length,
    remindersDue: needsReminder.map((u) => ({
      userId: u._id,
      email: u.email,
      name: u.name,
      currentPeriodEnd: u.subscription.currentPeriodEnd,
    })),
  }
})
