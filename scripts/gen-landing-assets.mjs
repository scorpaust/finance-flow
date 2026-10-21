// Upgrade 12 — imagens da página de apresentação e de partilha, a partir dos
// gráficos e capturas da ficha da loja (assets/store). Uso:
//   node scripts/gen-landing-assets.mjs . public
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const [root, out] = process.argv.slice(2)
const SLUGS = { pt: 'pt-PT', en: 'en', es: 'es', fr: 'fr', de: 'de', it: 'it' }
const BG = { r: 15, g: 15, b: 35, alpha: 1 } // #0f0f23, o theme-color da app

mkdirSync(join(out, 'og'), { recursive: true })
for (const [slug, locale] of Object.entries(SLUGS)) {
  // Imagem de partilha 1200×630 (Facebook, LinkedIn, X, WhatsApp): o gráfico
  // de destaque da loja (1024×500) ampliado até às bordas.
  const graphic = await sharp(join(root, 'assets/store', `feature-graphic-${locale}.png`)).resize({ width: 1200, height: 630, fit: 'cover' }).toBuffer()
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: BG } })
    .composite([{ input: graphic, top: 0, left: 0 }])
    .png({ compressionLevel: 9 })
    .toFile(join(out, 'og', `og-${slug}.png`))

  const dir = join(out, 'landing', slug)
  mkdirSync(dir, { recursive: true })
  for (const name of ['phone-1-painel', 'phone-2-transacoes', 'phone-3-estatisticas', 'phone-4-investimentos']) {
    await sharp(join(root, 'assets/store/screenshots', locale, `${name}.png`)).resize({ width: 360 }).webp({ quality: 78 }).toFile(join(dir, `${name}.webp`))
  }
}

// Ícones em PNG: o iOS ignora o apple-touch-icon em SVG e a maioria das redes
// não aceita SVG.
mkdirSync(join(out, 'icons'), { recursive: true })
await sharp(join(root, 'assets/store/play-icon-512.png')).resize(180).png().toFile(join(out, 'icons', 'apple-touch-icon.png'))
await sharp(join(root, 'assets/store/play-icon-512.png')).resize(48).png().toFile(join(out, 'favicon-48.png'))
console.log('ok')
