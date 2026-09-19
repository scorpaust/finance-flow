import { User } from '../../models'

// Job de expiração/downgrade — ver tarefa 7 da especificação da Fase 2. Sem
// scheduler no projeto (sem node-cron nem Nitro scheduled tasks configuradas),
// por isso este endpoint foi desenhado para ser invocado por um cron externo
// (ex. cron-job.org, GitHub Actions schedule) com o header `x-cron-secret` a
// bater com CRON_SECRET. Envio real de email/push fica por implementar — não
// existe nenhum serviço de notificações no projeto ainda; a resposta devolve
// a lista de utilizadores a avisar para um processo externo tratar disso.
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const providedSecret = getHeader(event, 'x-cron-secret')

  if (!config.cronSecret || providedSecret !== config.cronSecret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const now = new Date()
  const reminderDays = parseInt(config.subscriptionRenewalReminderDays) || 5
  const reminderThreshold = new Date(now.getTime() + reminderDays * 24 * 60 * 60 * 1000)

  const expired = await User.find({
    'subscription.currentPeriodEnd': { $lt: now },
    $or: [
      // MB WAY/Multibanco: pagamento único por período fixo (sem renovação
      // automática, ver easypay/create-prepaid.post.ts) — expira sempre no
      // fim do período, seja qual for o status.
      { 'subscription.billingMode': { $in: ['manual_reference', 'push_confirm'] }, 'subscription.status': { $in: ['active', 'pending', 'past_due'] } },
      // CC/DD: auto-renovação cancelada (ver easypay/cancel.post.ts) cujo período já pago terminou.
      { 'subscription.billingMode': 'auto', 'subscription.status': 'canceled' },
    ],
  })

  for (const user of expired) {
    user.subscription.tier = 'free'
    user.subscription.status = 'expired'
    user.subscription.provider = 'none'
    user.subscription.paymentMethod = 'none'
    user.subscription.billingMode = 'none'
    user.subscription.autoRenew = false
    user.subscription.currentPeriodEnd = null
    user.subscription.easypaySubscriptionId = undefined
    user.subscription.multibancoEntity = undefined
    user.subscription.multibancoReference = undefined
    user.subscription.multibancoExpiresAt = null
    await user.save()
  }

  const needsReminder = await User.find({
    'subscription.billingMode': { $in: ['manual_reference', 'push_confirm'] },
    'subscription.status': 'active',
    'subscription.currentPeriodEnd': { $gte: now, $lte: reminderThreshold },
    'subscription.reminderSentAt': null,
  }).select('_id email name subscription.currentPeriodEnd subscription.billingMode')

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
      billingMode: u.subscription.billingMode,
      currentPeriodEnd: u.subscription.currentPeriodEnd,
    })),
  }
})
