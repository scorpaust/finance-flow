# Upgrade 13 — Blog

Artigos públicos em `/<língua>/blog/<slug>` para atrair visitas das pesquisas
do Google e levar ao registo.

## Como funciona

- Conteúdo em `shared/blog/`: um ficheiro por artigo, registado em
  `BLOG_POSTS` (`shared/blog/index.ts`). Blocos simples (`h2`, `p`, `ul`,
  `ol`, `tip`), sem HTML.
- Cada artigo existe numa só língua. Uma língua sem artigos não tem blog:
  `/<língua>/blog` dá 404, não aparece no rodapé da apresentação nem no
  sitemap.
- Páginas: `pages/[lang]/blog/index.vue` (lista) e
  `pages/[lang]/blog/[post].vue` (artigo, com canónico, Open Graph de artigo
  e dados estruturados `BlogPosting`). Moldura e chamada para a app em
  `components/blog/BlogShell.vue`.
- Públicas sem sessão (`isBlogPath` no middleware e no ecrã de carregamento).
  A apresentação passou de `pages/[lang].vue` para `pages/[lang]/index.vue`;
  a lógica da língua do endereço está em `composables/useSlugLocale.ts`.
- Sitemap: a lista de cada língua com artigos e cada artigo, com a data do
  próprio artigo (`updated` ou `published`).

## Publicar um artigo novo

1. Criar `shared/blog/<lingua>-<slug>.ts` (ver `pt-como-poupar-dinheiro.ts`).
2. Acrescentá-lo a `BLOG_POSTS`.
3. `npx vitest run tests/blog.test.ts` (título até 70 caracteres, descrição de
   50 a 170, pelo menos um `h2`, slug único).
4. Deploy. Depois, no Google Search Console, pedir a indexação do endereço.

Ao rever um artigo, preencher `updated` com a data.

## Testes

`tests/blog.test.ts` (conteúdo, caminhos, sitemap) e `e2e/blog-flow.spec.ts`
(apresentação → lista → artigo → registo, metadados, 404, sitemap).
