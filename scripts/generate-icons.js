#!/usr/bin/env node
/**
 * Generates placeholder SVG-based PNG icons for the PWA manifest.
 * Run: node scripts/generate-icons.js
 * Requires: npm install canvas (optional) or just use a real icon generator
 */

const fs = require('fs')
const path = require('path')

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const outputDir = path.join(__dirname, '../public/icons')

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Generate SVG icon
function svgIcon(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>
    <clipPath id="clip">
      <rect width="${size}" height="${size}" rx="${size * 0.22}" ry="${size * 0.22}"/>
    </clipPath>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#g)"/>
  <text x="50%" y="57%" font-size="${size * 0.52}" text-anchor="middle" dominant-baseline="middle">💹</text>
</svg>`
}

// Save as SVG (rename to .png for real use — use sharp or canvas for actual PNG)
sizes.forEach((size) => {
  const svg = svgIcon(size)
  const filepath = path.join(outputDir, `icon-${size}x${size}.svg`)
  fs.writeFileSync(filepath, svg)
  console.log(`✅ Generated ${size}x${size} icon`)
})

console.log('\n📁 Icons saved to public/icons/')
console.log('⚠️  For production: convert SVGs to PNGs using sharp or an online tool')
console.log('   e.g.: npx sharp-cli --input public/icons/*.svg --output public/icons/ --format png')
