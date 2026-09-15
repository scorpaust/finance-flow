/**
 * Migração Fase 2 — dá a utilizadores existentes (sem campo `subscription`)
 * um plano 'free' explícito. Idempotente: só toca em quem ainda não tem o campo.
 * Uso: MONGODB_URI=<uri> node scripts/migrate-subscriptions.mjs
 */
import mongoose from 'mongoose'

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/financeflow'

const UserSchema = new mongoose.Schema({}, { strict: false })
const User = mongoose.model('User', UserSchema)

async function main() {
  await mongoose.connect(URI, { dbName: 'financeflow' })

  const result = await User.updateMany(
    { subscription: { $exists: false } },
    {
      $set: {
        subscription: {
          tier: 'free',
          status: 'active',
          provider: 'none',
          paymentMethod: 'none',
          periodType: 'none',
          autoRenew: false,
          currentPeriodEnd: null,
        },
      },
    }
  )

  console.log(`Utilizadores atualizados: ${result.modifiedCount}`)
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
