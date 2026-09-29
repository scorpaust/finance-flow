/**
 * Fase 9 — imagens da ficha da Google Play, geradas a partir do logótipo
 * (assets/icon-only.svg, Fase 4):
 *   assets/store/play-icon-512.png              ícone 512×512 (PNG 32 bits)
 *   assets/store/feature-graphic-pt-PT.png      gráfico de funcionalidades 1024×500
 *   assets/store/feature-graphic-en.png         (PNG 24 bits, sem transparência)
 *
 * Uso: node scripts/store-assets.mjs
 *
 * O ícone é quadrado e sem cantos arredondados de propósito: a Play Store
 * aplica a sua própria máscara. O gráfico não pode ter canal alfa.
 */
import { mkdirSync } from 'node:fs'
import sharp from 'sharp'

const OUT = 'assets/store'
mkdirSync(OUT, { recursive: true })

// Mesmo desenho de assets/icon-only.svg (gradiente + barras + seta), sem o `rx`.
const GLYPH = `
  <rect x="300" y="570" width="110" height="130" rx="18" fill="#ffffff"/>
  <rect x="460" y="480" width="110" height="220" rx="18" fill="#ffffff"/>
  <rect x="620" y="390" width="110" height="310" rx="18" fill="#ffffff"/>
  <polyline points="330,560 515,470 675,380 750,320" fill="none" stroke="#ffffff" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
  <polyline points="672,300 758,308 750,392" fill="#ffffff"/>`

const GRADIENT = `
  <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#6366f1"/>
    <stop offset="100%" stop-color="#8b5cf6"/>
  </linearGradient>`

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>${GRADIENT}</defs>
  <rect width="1024" height="1024" fill="url(#brand)"/>
  ${GLYPH}
</svg>`

const COPY = {
  'pt-PT': {
    tagline: 'Finanças pessoais, orçamentos e previsões com IA',
    bullets: ['Gastos e orçamentos', 'Previsões com IA', 'Carteira de investimentos'],
  },
  en: {
    tagline: 'Personal finance, budgets and AI forecasts',
    bullets: ['Spending & budgets', 'AI forecasts', 'Investment portfolio'],
  },
}

const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function featureSvg({ tagline, bullets }) {
  const FONT = "Segoe UI, 'Helvetica Neue', Arial, sans-serif"
  const pills = bullets
    .map((b, i) => {
      const y = 318 + i * 52
      return `<circle cx="452" cy="${y - 7}" r="6" fill="#a5b4fc"/>
      <text x="470" y="${y}" font-family="${FONT}" font-size="26" fill="#e0e7ff">${escapeXml(b)}</text>`
    })
    .join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs>
    ${GRADIENT}
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f0f23"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <circle cx="215" cy="250" r="230" fill="url(#glow)"/>
  <!-- linha de tendência decorativa, no canto inferior direito (fora do texto) -->
  <polyline points="790,470 860,440 920,452 980,400 1024,378" fill="none" stroke="#6366f1" stroke-opacity="0.4" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>

  <g transform="translate(95 130) scale(0.234)">
    <rect width="1024" height="1024" rx="225" fill="url(#brand)"/>
    ${GLYPH}
  </g>

  <text x="430" y="190" font-family="${FONT}" font-size="76" font-weight="700" fill="#ffffff">FinanceFlow</text>
  <text x="432" y="238" font-family="${FONT}" font-size="23" fill="#c7d2fe">${escapeXml(tagline)}</text>
  ${pills}
</svg>`
}

await sharp(Buffer.from(iconSvg)).resize(512, 512).png().toFile(`${OUT}/play-icon-512.png`)
console.log(`✓ ${OUT}/play-icon-512.png`)

for (const [locale, copy] of Object.entries(COPY)) {
  const file = `${OUT}/feature-graphic-${locale}.png`
  await sharp(Buffer.from(featureSvg(copy)))
    .resize(1024, 500)
    .flatten({ background: '#0f0f23' })
    .removeAlpha()
    .png()
    .toFile(file)
  console.log(`✓ ${file}`)
}
