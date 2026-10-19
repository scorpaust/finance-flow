/**
 * Upgrade 11 — dá (ou retira) um plano oferecido a uma conta existente, sem
 * pagamento: plano ativo, sem fornecedor e sem data de fim. O cron de
 * expirações só olha para contas com data de fim, por isso não o retira.
 * Não toca numa conta com subscrição paga ativa (EasyPay ou Google Play).
 *
 * Uso:
 *   MONGODB_URI=<uri> MONGODB_DB_NAME=financeflow-prod \
 *     node scripts/grant-plan.mjs [--dry] <premium|pro|free> email
 *
 *   --dry   mostra o que faria, sem escrever nada
 *   free    retira o plano oferecido (volta ao Gratuito)
 */
import mongoose from 'mongoose'

const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const [tier, email] = args.filter((a) => !a.startsWith('--'))

const URI = (process.env.MONGODB_URI || '').trim().replace(/^MONGODB_URI\s*=\s*/, '').replace(/^["']|["']$/g, '').trim()
const DB_NAME = (process.env.MONGODB_DB_NAME || 'financeflow').trim()

if (!/^mongodb(\+srv)?:\/\//.test(URI)) {
  console.error('MONGODB_URI em falta ou inválido.')
  process.exit(1)
}
if (!['premium', 'pro', 'free'].includes(tier) || !email) {
  console.error('Uso: node scripts/grant-plan.mjs [--dry] <premium|pro|free> email')
  process.exit(1)
}

await mongoose.connect(URI, { dbName: DB_NAME })
const users = mongoose.connection.db.collection('users')

try {
  const user = await users.findOne({ email: email.toLowerCase().trim() }, { projection: { email: 1, subscription: 1 } })
  if (!user) {
    console.error(`Conta ${email} não existe em ${DB_NAME}. Cria-a primeiro na app (registo) e corre outra vez.`)
    process.exitCode = 1
  } else {
    const sub = user.subscription || {}
    const paid = (sub.provider === 'easypay' || sub.provider === 'google_play') && ['active', 'pending', 'past_due'].includes(sub.status)
    console.log(`Base: ${DB_NAME} · conta: ${user.email}`)
    console.log(`Agora: ${sub.tier || 'free'} (${sub.provider || 'none'}, ${sub.status || 'active'}${sub.currentPeriodEnd ? `, até ${new Date(sub.currentPeriodEnd).toISOString().slice(0, 10)}` : ''})`)
    if (paid) {
      console.error('Esta conta tem uma subscrição paga em curso; não mexo. Cancela-a primeiro ou espera que termine.')
      process.exitCode = 1
    } else {
      const next = {
        tier,
        status: 'active',
        provider: 'none',
        paymentMethod: 'none',
        billingMode: 'none',
        autoRenew: false,
        currentPeriodEnd: null,
        appliedPaymentIds: sub.appliedPaymentIds || [],
      }
      console.log(`Depois: ${tier} oferecido, sem data de fim`)
      if (DRY) {
        console.log('(--dry: nada foi escrito)')
      } else {
        await users.updateOne({ _id: user._id }, { $set: { subscription: next } })
        console.log('Feito.')
      }
    }
  }
} finally {
  await mongoose.disconnect()
}
