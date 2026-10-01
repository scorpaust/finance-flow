/**
 * Fase 8, ponto 10 — cópia de segurança da base de dados.
 *
 * Não depende de `mongodump` (binário externo, não instalado neste projeto)
 * — usa o mongoose já existente para exportar cada coleção para um ficheiro
 * EJSON (formato "Extended JSON" da própria MongoDB — ao contrário de
 * JSON.stringify simples, preserva ObjectId/Date/etc. para um restauro fiel,
 * ver scripts/restore-mongo.mjs). Pensado para correr:
 *   1. manualmente: MONGODB_URI=<uri> node scripts/backup-mongo.mjs
 *   2. num cron agendado (ver .github/workflows/backup.yml)
 *
 * Com as variáveis R2_* definidas, cada ficheiro é também enviado para um
 * bucket Cloudflare R2 (API compatível com S3) — sem elas, o backup fica só
 * local (`backups/<timestamp>/`, ver BACKUP_OUT_DIR). Retenção de 3 anos
 * (ver utils/legalContent.ts, Política de Privacidade ponto 6): configurada
 * como regra de lifecycle no próprio bucket R2 (consola Cloudflare →
 * bucket → Settings → Object lifecycle rules → expirar objetos com mais de
 * 1095 dias), não neste script — o R2 apaga sozinho, não depende de este
 * script continuar a correr para sempre.
 *
 * NÃO substitui os backups geridos da Atlas (Continuous Cloud Backup, com
 * "point-in-time recovery" ao segundo) — só existem a partir do tier M10
 * pago; o tier M0 (gratuito) usado neste projeto não os tem. Isto é o
 * mínimo viável enquanto o projeto estiver no M0 — ver context/OPERATIONS.md.
 */
import mongoose from 'mongoose'
import 'dotenv/config'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const URI = process.env.MONGODB_URI
if (!URI) {
  console.error('MONGODB_URI em falta.')
  process.exit(1)
}

const OUT_DIR = process.env.BACKUP_OUT_DIR || join(process.cwd(), 'backups')

function r2Client() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) return null

  return {
    bucket: R2_BUCKET,
    client: new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
    }),
  }
}

async function main() {
  await mongoose.connect(URI, { dbName: process.env.MONGODB_DB_NAME || 'financeflow' })
  const db = mongoose.connection.db
  const { EJSON } = mongoose.mongo.BSON
  const r2 = r2Client()
  if (!r2) {
    // No CI o disco do runner é apagado no fim: um backup "só local" ali não
    // guarda nada e parecia bem-sucedido. Falha em vez de fingir.
    if (process.env.CI) {
      console.error('R2_* em falta — no CI um backup só local perde-se com o runner. Ver context/OPERATIONS.md.')
      await mongoose.disconnect()
      process.exit(1)
    }
    console.warn('R2_* em falta — backup só local, sem envio para a cloud. Ver context/OPERATIONS.md.')
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const dir = join(OUT_DIR, timestamp)
  mkdirSync(dir, { recursive: true })

  const collections = await db.listCollections().toArray()
  let totalDocs = 0

  for (const { name } of collections) {
    const docs = await db.collection(name).find({}).toArray()
    const filePath = join(dir, `${name}.json`)
    writeFileSync(filePath, EJSON.stringify(docs))
    totalDocs += docs.length
    console.log(`  ${name}: ${docs.length} documentos`)

    if (r2) {
      await r2.client.send(
        new PutObjectCommand({
          Bucket: r2.bucket,
          Key: `backups/${timestamp}/${name}.json`,
          Body: readFileSync(filePath),
          ContentType: 'application/json',
        })
      )
    }
  }

  console.log(
    `Backup concluído em ${dir} (${collections.length} coleções, ${totalDocs} documentos)` +
      (r2 ? ` — também enviado para r2://${r2.bucket}/backups/${timestamp}/` : '')
  )
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error('Backup falhou:', err)
  process.exit(1)
})
