/**
 * Fase 8, ponto 10 — cria os índices que os schemas Mongoose declaram mas que
 * NUNCA chegam à base de dados: com `bufferCommands: false` (server/utils/db.ts)
 * o Mongoose não cria índices automaticamente ao arrancar.
 *
 * Uso:
 *   node scripts/sync-indexes.mjs --dry   # só procura duplicados que bloqueariam índices unique
 *   node scripts/sync-indexes.mjs         # cria os índices em falta
 *
 * Idempotente (createIndex não faz nada se o índice já existe). Nunca apaga
 * dados: se houver duplicados, o índice unique correspondente falha e o
 * script diz-te o quê — limpa os duplicados à mão e volta a correr.
 * Os specs abaixo têm de espelhar server/models/index.ts.
 */
import mongoose from 'mongoose'
import 'dotenv/config'

const DRY = process.argv.includes('--dry')
const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/financeflow'

const INDEXES = [
  { collection: 'users', keys: { email: 1 }, unique: true },
  { collection: 'categories', keys: { userId: 1 } },
  { collection: 'categories', keys: { groupId: 1 } },
  { collection: 'categories', keys: { userId: 1, name: 1 }, unique: true },
  { collection: 'transactiongroups', keys: { userId: 1 } },
  { collection: 'transactions', keys: { userId: 1 } },
  { collection: 'transactions', keys: { date: 1 } },
  { collection: 'transactions', keys: { userId: 1, date: -1 } },
  { collection: 'transactions', keys: { userId: 1, type: 1 } },
  { collection: 'transactions', keys: { userId: 1, categoryId: 1 } },
  { collection: 'marketsnapshots', keys: { date: 1 }, unique: true },
  { collection: 'aiinsightcaches', keys: { userId: 1 }, unique: true },
  { collection: 'investments', keys: { userId: 1 } },
  { collection: 'investments', keys: { userId: 1, initialDate: -1 } },
  { collection: 'refundedaccounts', keys: { email: 1 } },
  { collection: 'ratelimitbuckets', keys: { expiresAt: 1 }, expireAfterSeconds: 0 },
  // Upgrade 01 — Google Play Billing: uma compra pertence a uma só conta, e
  // as notificações da Google encontram a conta pelo identificador enviado.
  { collection: 'users', keys: { 'subscription.googlePlayPurchaseToken': 1 }, unique: true, sparse: true },
  { collection: 'users', keys: { playAccountId: 1 }, unique: true, sparse: true },
]

async function findDuplicates(col, keys, sparse) {
  // Os nomes no `_id` do $group não podem ter '.' (campos dentro de
  // subdocumentos, ex. subscription.googlePlayPurchaseToken) — só o valor.
  const group = Object.fromEntries(Object.keys(keys).map((k) => [k.replace(/\./g, '_'), `$${k}`]))
  // Num índice sparse, documentos sem o campo não entram no índice — não são duplicados.
  const onlyPresent = sparse ? [{ $match: Object.fromEntries(Object.keys(keys).map((k) => [k, { $exists: true }])) }] : []
  return col
    .aggregate([...onlyPresent, { $group: { _id: group, n: { $sum: 1 } } }, { $match: { n: { $gt: 1 } } }, { $limit: 5 }])
    .toArray()
}

await mongoose.connect(URI, { dbName: process.env.MONGODB_DB_NAME || 'financeflow' })
const db = mongoose.connection.db
let problems = 0

for (const { collection, keys, unique, sparse, expireAfterSeconds } of INDEXES) {
  const label = `${collection} ${JSON.stringify(keys)}${unique ? ' unique' : ''}`
  const col = db.collection(collection)

  if (unique) {
    const dups = await findDuplicates(col, keys, sparse)
    if (dups.length) {
      problems++
      console.log(`✗ ${label} — duplicados (exemplos): ${JSON.stringify(dups.map((d) => d._id))}`)
      continue
    }
  }
  if (DRY) {
    console.log(`· ${label} — sem duplicados, pronto a criar`)
    continue
  }
  try {
    const options = {}
    if (unique) options.unique = true
    if (sparse) options.sparse = true
    if (expireAfterSeconds !== undefined) options.expireAfterSeconds = expireAfterSeconds
    await col.createIndex(keys, options)
    console.log(`✓ ${label}`)
  } catch (e) {
    problems++
    console.log(`✗ ${label} — ${e.message}`)
  }
}

await mongoose.disconnect()
console.log(problems ? `\n${problems} índice(s) por resolver.` : '\nTudo em ordem.')
process.exit(problems ? 1 : 0)
