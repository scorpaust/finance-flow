/**
 * Escreve em blog/posts/<ano>/<slug>.md os artigos recebidos pelo webhook da
 * Holo que ainda estão por rever (server/api/webhooks/holo.post.ts), no mesmo
 * formato do download manual. Depois marca-os como exportados.
 *
 * Uso:
 *   MONGODB_URI=<uri> MONGODB_DB_NAME=financeflow-prod \
 *     node scripts/export-holo-drafts.mjs [--dry]
 *
 *   --dry   só lista os artigos, sem escrever nada
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import mongoose from 'mongoose'

const DRY = process.argv.includes('--dry')
const URI = (process.env.MONGODB_URI || '').trim().replace(/^MONGODB_URI\s*=\s*/, '').replace(/^["']|["']$/g, '')
const DB_NAME = (process.env.MONGODB_DB_NAME || 'financeflow').trim()

if (!/^mongodb(\+srv)?:\/\//.test(URI)) {
  console.error('MONGODB_URI em falta ou inválido.')
  process.exit(1)
}

await mongoose.connect(URI, { dbName: DB_NAME })
const articles = mongoose.connection.db.collection('holoarticles')

try {
  const pending = await articles.find({ status: 'pending' }).sort({ publishedAt: 1 }).toArray()
  console.log(`Base: ${DB_NAME} · por rever: ${pending.length}`)

  for (const a of pending) {
    // O slug vem de fora: nunca pode sair da pasta de destino.
    const slug = String(a.slug).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || String(a._id)
    const year = String(new Date(a.publishedAt || Date.now()).getFullYear())
    const file = join('blog', 'posts', year, `${slug}.md`)
    console.log(`${a.lastEvent} · ${file} · ${a.title}`)
    if (DRY) continue

    mkdirSync(join('blog', 'posts', year), { recursive: true })
    writeFileSync(file, [
      `# ${a.title}`,
      `**Meta title:** ${a.metaTitle ?? ''}`,
      `**Meta description:** ${a.metaDescription ?? ''}`,
      `**Slug:** ${a.slug}`,
      a.contentMarkdown ?? a.contentHtml ?? '',
      '',
    ].join('\n\n'))
    await articles.updateOne({ _id: a._id }, { $set: { status: 'exported' } })
  }
} finally {
  await mongoose.disconnect()
}
