import { LANDING_SLUGS, type LandingSlug } from '../landing'
import { budgetStepsPosts } from './budget-steps'
import { budgetingMethodsPosts } from './budgeting-methods'
import { cashFlowPosts } from './cash-flow'
import { financialRatiosPosts } from './financial-ratios'
import { netWorthPosts } from './net-worth'
import { geldSparen } from './de-geld-sparen'
import { howToSaveMoney } from './en-how-to-save-money'
import { comoAhorrarDinero } from './es-como-ahorrar-dinero'
import { commentEconomiserDeLArgent } from './fr-comment-economiser-de-l-argent'
import { comeRisparmiareSoldi } from './it-come-risparmiare-soldi'
import { comoPouparDinheiro } from './pt-como-poupar-dinheiro'

// Upgrade 13 — artigos do blog (/pt/blog/<slug>), para atrair visitas das
// pesquisas do Google. Cada artigo existe nas 6 línguas, com endereço na
// própria língua; as traduções partilham a mesma `key` (ligadas entre si por
// hreflang). Regras do conteúdo em tests/blog.test.ts.
export type BlogBlock =
  | { type: 'h2'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }
  // Caixa de destaque (exemplo com números, resumo de um passo).
  | { type: 'tip'; text: string }

export interface BlogPost {
  // Igual em todas as traduções do mesmo artigo.
  key: string
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

// O primeiro artigo tem um ficheiro por língua; os seguintes, um ficheiro por
// artigo com as 6 traduções (mais fácil de as manter iguais).
export const BLOG_POSTS: BlogPost[] = [
  comoPouparDinheiro, howToSaveMoney, comoAhorrarDinero, commentEconomiserDeLArgent, geldSparen, comeRisparmiareSoldi,
  ...cashFlowPosts,
  ...budgetStepsPosts,
  ...netWorthPosts,
  ...financialRatiosPosts,
  ...budgetingMethodsPosts,
]

// Caminho do artigo nesta língua.
export function blogPostPath(post: BlogPost): string {
  return `/${post.lang}/blog/${post.slug}`
}

// O mesmo artigo em cada língua (incluindo a do próprio), pela ordem das
// línguas do site.
export function translationsOf(post: BlogPost): BlogPost[] {
  return (Object.keys(LANDING_SLUGS) as LandingSlug[])
    .map((lang) => BLOG_POSTS.find((p) => p.key === post.key && p.lang === lang))
    .filter((p): p is BlogPost => !!p)
}

// Mais recentes primeiro.
export function blogPostsFor(lang: LandingSlug): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.lang === lang).sort((a, b) => b.published.localeCompare(a.published))
}

export function findBlogPost(lang: LandingSlug, slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.lang === lang && p.slug === slug)
}

// Línguas com blog, pela ordem das línguas do site.
export function blogLangs(): LandingSlug[] {
  return (Object.keys(LANDING_SLUGS) as LandingSlug[]).filter((lang) => BLOG_POSTS.some((p) => p.lang === lang))
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
