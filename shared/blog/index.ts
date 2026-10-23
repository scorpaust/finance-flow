import type { LandingSlug } from '../landing'
import { comoPouparDinheiro } from './pt-como-poupar-dinheiro'

// Upgrade 13 — artigos do blog (/pt/blog/<slug>), para atrair visitas das
// pesquisas do Google. Cada artigo existe numa só língua; uma língua sem
// artigos não tem blog (a página dá 404 e não entra no sitemap). Regras do
// conteúdo em tests/blog.test.ts.
export type BlogBlock =
  | { type: 'h2'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }
  // Caixa de destaque (exemplo com números, resumo de um passo).
  | { type: 'tip'; text: string }

export interface BlogPost {
  slug: string
  lang: LandingSlug
  title: string
  // Descrição para as pesquisas e para a partilha (até ~160 caracteres).
  description: string
  // AAAA-MM-DD
  published: string
  updated?: string
  blocks: BlogBlock[]
}

export const BLOG_POSTS: BlogPost[] = [comoPouparDinheiro]

// Mais recentes primeiro.
export function blogPostsFor(lang: LandingSlug): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.lang === lang).sort((a, b) => b.published.localeCompare(a.published))
}

export function findBlogPost(lang: LandingSlug, slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.lang === lang && p.slug === slug)
}

export function blogLangs(): LandingSlug[] {
  return [...new Set(BLOG_POSTS.map((p) => p.lang))]
}

// Caminho dentro de um blog ("/pt/blog", "/pt/blog/x")? Para o middleware de
// autenticação deixar passar sem sessão.
export function isBlogPath(path: string): boolean {
  return /^\/[a-z]{2}\/blog(\/[a-z0-9-]+)?\/?$/.test(path.split('?')[0])
}

// Minutos de leitura, a ~200 palavras por minuto.
export function readingMinutes(post: BlogPost): number {
  const words = post.blocks
    .flatMap((b) => ('items' in b ? b.items : [b.text]))
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
