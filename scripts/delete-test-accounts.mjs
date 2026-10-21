/**
 * Upgrade 11 — apaga as contas de teste dos testes fechados
 * (`tester-*@example.com`) e todos os seus dados, como a eliminação de conta
 * da app (server/utils/accountDeletion.ts). Só aceita emails desse padrão, e
 * recusa uma conta com subscrição paga real (EasyPay com id de subscrição ou
 * Google Play), que teria de ser cancelada primeiro pela app.
 *
 * Uso:
 *   MONGODB_URI=<uri> MONGODB_DB_NAME=financeflow-prod \
 *     node scripts/delete-test-accounts.mjs [--dry]
 */
import mongoose from 'mongoose'

const DRY = process.argv.includes('--dry')
const URI = (process.env.MONGODB_URI || '').trim().replace(/^MONGODB_URI\s*=\s*/, '').replace(/^["']|["']$/g, '').trim()
const DB_NAME = (process.env.MONGODB_DB_NAME || 'financeflow').trim()
const PATTERN = /^tester-[a-z0-9-]+@example\.com$/

if (!/^mongodb(\+srv)?:\/\//.test(URI)) {
  console.error('MONGODB_URI em falta ou inválido.')
  process.exit(1)
}

await mongoose.connect(URI, { dbName: DB_NAME })
const db = mongoose.connection.db

// Mesmas coleções que deleteUserAccount() limpa.
const BY_USER_ID = ['categories', 'transactiongroups', 'transactions', 'investments', 'aiinsightcaches', 'documentscanusages', 'aibudgetproposals', 'passwordresettokens', 'feedbacks']

try {
  const users = await db.collection('users').find({ email: { $regex: '^tester-.*@example\\.com$' } }, { projection: { email: 1, subscription: 1 } }).toArray()
  console.log(`Base: ${DB_NAME} · contas de teste encontradas: ${users.length}`)
  for (const user of users) {
    if (!PATTERN.test(user.email)) continue
    const sub = user.subscription || {}
    const realPaid =
      ['active', 'past_due'].includes(sub.status) &&
      ((sub.billingMode === 'auto' && sub.easypaySubscriptionId) || (sub.billingMode === 'google_play' && sub.googlePlayPurchaseToken))
    if (realPaid) {
      console.log(`- ${user.email}: tem subscrição paga real (${sub.billingMode}); cancela-a primeiro na app. Não apagada.`)
      continue
    }
    const counts = {}
    for (const c of BY_USER_ID) counts[c] = await db.collection(c).countDocuments({ userId: user._id })
    const summary = Object.entries(counts).filter(([, n]) => n).map(([c, n]) => `${c} ${n}`).join(', ') || 'sem dados'
    console.log(`- ${user.email} (${sub.tier || 'free'}): ${summary}`)
    if (DRY) continue
    for (const c of BY_USER_ID) await db.collection(c).deleteMany({ userId: user._id })
    await db.collection('investmenttipscaches').deleteOne({ _id: String(user._id) })
    await db.collection('users').deleteOne({ _id: user._id })
    console.log('  apagada.')
  }
  if (DRY) console.log('(--dry: nada foi apagado)')
} finally {
  await mongoose.disconnect()
}
