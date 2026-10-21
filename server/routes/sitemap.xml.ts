import { HREFLANG, LANDING_SLUGS, SITE_URL, type LandingSlug } from '../../shared/landing'

// Upgrade 12 — mapa do site para os motores de pesquisa (referido no
// robots.txt): as páginas de apresentação das 6 línguas, ligadas entre si
// (hreflang), e as páginas públicas (ajuda, textos legais, entrada).
const slugs = Object.keys(LANDING_SLUGS) as LandingSlug[]

function alternates(): string {
  return [
    ...slugs.map((s) => `    <xhtml:link rel="alternate" hreflang="${HREFLANG[s]}" href="${SITE_URL}/${s}"/>`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/en"/>`,
  ].join('\n')
}

export function buildSitemap(lastmod: string): string {
  const landing = slugs.map(
    (s) => `  <url>\n    <loc>${SITE_URL}/${s}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n${alternates()}\n  </url>`
  )
  const pages = [
    { path: '/help', priority: '0.7' },
    { path: '/login', priority: '0.5' },
    { path: '/privacy', priority: '0.3' },
    { path: '/terms', priority: '0.3' },
  ].map((p) => `  <url>\n    <loc>${SITE_URL}${p.path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${p.priority}</priority>\n  </url>`)
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...landing,
    ...pages,
    '</urlset>',
    '',
  ].join('\n')
}

// Data do build: muda a cada deploy (o conteúdo das páginas só muda aí).
const BUILT_AT = new Date().toISOString().slice(0, 10)

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600')
  return buildSitemap(BUILT_AT)
})
