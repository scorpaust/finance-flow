/**
 * Fase 8, ponto 10 — restauro de uma cópia de segurança criada por
 * scripts/backup-mongo.mjs. NUNCA corre contra a base de dados de produção
 * sem confirmação explícita — por omissão recusa-se a correr se `MONGODB_URI`
 * não tiver "localhost"/"127.0.0.1" (ver --force abaixo).
 *
 * Uso:
 *   MONGODB_URI=<uri> node scripts/restore-mongo.mjs backups/<timestamp>
 *   MONGODB_URI=<uri> node scripts/restore-mongo.mjs backups/<timestamp> --force   # produção, com cuidado
 *   MONGODB_URI=<uri> node scripts/restore-mongo.mjs backups/<timestamp> --drop    # apaga cada coleção antes de restaurar (default: só insere)
 */
import mongoose from 'mongoose'
import 'dotenv/config'
import { readdirSync, readFileSync } from 'node:fs'
import { join, basename } from 'node:path'

const [, , dir, ...flags] = process.argv
const FORCE = flags.includes('--force')
const DROP = flags.includes('--drop')

if (!dir) {
  console.error('Uso: node scripts/restore-mongo.mjs <pasta-do-backup> [--force] [--drop]')
  process.exit(1)
}

const URI = process.env.MONGODB_URI
if (!URI) {
  console.error('MONGODB_URI em falta.')
  process.exit(1)
}

const looksLocal = /localhost|127\.0\.0\.1/.test(URI)
if (!looksLocal && !FORCE) {
  console.error(
    'MONGODB_URI não parece ser local (localhost/127.0.0.1) — isto sobrescreve dados. ' +
      'Se tens mesmo a certeza (ex. restauro em produção após um incidente), volta a correr com --force.'
  )
  process.exit(1)
}

async function main() {
  await mongoose.connect(URI, { dbName: 'financeflow' })
  const db = mongoose.connection.db
  const { EJSON } = mongoose.mongo.BSON

  const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
  if (files.length === 0) {
    console.error(`Nenhum .json encontrado em ${dir}`)
    process.exit(1)
  }

  for (const file of files) {
    const collectionName = basename(file, '.json')
    const docs = EJSON.parse(readFileSync(join(dir, file), 'utf8'))
    const collection = db.collection(collectionName)

    if (DROP) {
      await collection.deleteMany({})
    }
    if (docs.length > 0) {
      await collection.insertMany(docs, { ordered: false }).catch((err) => {
        // E11000 (duplicados, quando não se usou --drop) não é fatal — o
        // resto da coleção continua restaurado.
        if (err?.code !== 11000) throw err
        console.warn(`  ${collectionName}: alguns documentos já existiam, ignorados`)
      })
    }
    console.log(`  ${collectionName}: ${docs.length} documentos restaurados`)
  }

  console.log(`Restauro concluído a partir de ${dir}`)
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error('Restauro falhou:', err)
  process.exit(1)
})
