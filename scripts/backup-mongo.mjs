/**
 * Fase 8, ponto 10 — cópia de segurança da base de dados.
 *
 * Não depende de `mongodump` (binário externo, não instalado neste projeto)
 * — usa o mongoose já existente para exportar cada coleção para um ficheiro
 * EJSON (formato "Extended JSON" da própria MongoDB — ao contrário de
 * JSON.stringify simples, preserva ObjectId/Date/etc. para um restauro fiel,
 * ver scripts/restore-mongo.mjs). Pensado para correr:
 *   1. manualmente: MONGODB_URI=<uri> node scripts/backup-mongo.mjs
 *   2. num cron/GitHub Actions agendado (ver .github/workflows/backup.yml) —
 *      guarda o resultado como artefacto do workflow.
 *
 * NÃO substitui os backups geridos da Atlas (Continuous Cloud Backup, com
 * "point-in-time recovery" ao segundo) — só existem a partir do tier M10
 * pago; o tier M0 (gratuito) usado neste projeto não os tem. Isto é o
 * mínimo viável enquanto o projeto estiver no M0 — ver context/OPERATIONS.md.
 */
import mongoose from 'mongoose'
import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const URI = process.env.MONGODB_URI
if (!URI) {
  console.error('MONGODB_URI em falta.')
  process.exit(1)
}

const OUT_DIR = process.env.BACKUP_OUT_DIR || join(process.cwd(), 'backups')

async function main() {
  await mongoose.connect(URI, { dbName: 'financeflow' })
  const db = mongoose.connection.db
  const { EJSON } = mongoose.mongo.BSON

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const dir = join(OUT_DIR, timestamp)
  mkdirSync(dir, { recursive: true })

  const collections = await db.listCollections().toArray()
  let totalDocs = 0

  for (const { name } of collections) {
    const docs = await db.collection(name).find({}).toArray()
    writeFileSync(join(dir, `${name}.json`), EJSON.stringify(docs))
    totalDocs += docs.length
    console.log(`  ${name}: ${docs.length} documentos`)
  }

  console.log(`Backup concluído em ${dir} (${collections.length} coleções, ${totalDocs} documentos)`)
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error('Backup falhou:', err)
  process.exit(1)
})
