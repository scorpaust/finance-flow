# UPGRADE 12 — Páginas de apresentação por língua, SEO e partilha social

> Origem: pedido do utilizador (2026-10-21), depois da aprovação para
> produção na Google Play. Faltavam metadados para pesquisa, robots e sitemap,
> e metadados para partilha nas redes sociais. Opção escolhida: páginas de
> apresentação por língua.

## O que existia

- **Raiz:** `/` sem sessão ia direto para o login, por isso o Google só via o
  login, a ajuda e os textos legais.
- **Língua:** as línguas partilhavam o mesmo endereço, e o Google, sem
  preferência de língua, via o site em inglês.
- **Metadados:** só `description`; nenhum Open Graph nem cartões do X, e os
  ícones eram só SVG.
- **Indexação:** `robots.txt` incompleto e nenhum sitemap.

## O que mudou

1. **Páginas `/pt`, `/en`, `/es`, `/fr`, `/de`, `/it`** (`pages/[lang].vue` e
   `components/landing/LandingPage.vue`), em secções:
   - destaque, com "Começar grátis" (abre o registo) e "Disponível no Google
     Play";
   - 6 funcionalidades;
   - capturas da ficha da loja, traduzidas;
   - planos com os preços reais (os mesmos da subscrição, já no HTML do
     servidor);
   - 6 perguntas da ajuda;
   - chamada final;
   - rodapé com ajuda, textos legais, Livro de Reclamações e as 6 línguas.

   Textos em i18n (`landing.*`). A página usa a língua do endereço só na
   visita, sem mexer na língua gravada da app.
2. **Raiz sem sessão:** vai para a página da língua detetada. Na app Android
   (cookie `ff_native`, gravado por `plugins/native-flag.client.ts`) continua
   a ir para o login, e a própria página manda a app para o login. Com sessão,
   nada muda (painel).
3. **Pesquisa:**
   - em cada página de apresentação:
     - título e descrição próprios;
     - endereço canónico;
     - `hreflang` entre as 6 línguas, com `x-default` em `/en`;
     - dados estruturados `SoftwareApplication` (com os preços) e `FAQPage`;
   - nas páginas públicas (login, ajuda, textos legais): título, descrição e
     canónico (`composables/usePublicSeo.ts`);
   - fora das pesquisas (`noindex`): recuperar e definir password, contacto.
4. **Partilha social:**
   - Open Graph e cartões do X (`summary_large_image`) em todas as páginas;
   - imagem 1200×630 por língua (`public/og/og-<língua>.png`, gerada dos
     gráficos da loja com `scripts/gen-landing-assets.mjs`);
   - ícones PNG (`apple-touch-icon` 180 e favicon 48).
5. **`robots.txt`:** permite tudo menos `/api/` e as páginas de password;
   aponta para o sitemap.
6. **`/sitemap.xml`** (`server/routes/sitemap.xml.ts`): as 6 páginas com
   `hreflang`, mais ajuda, login e textos legais.
7. **`/login?mode=register`** abre já o separador de registo.

## Fora de âmbito

- Instagram não usa metadados em publicações. Só as pré-visualizações de
  links em mensagens os usam, e já funcionam.
- Blogue ou conteúdo editorial.
- Avaliações nos dados estruturados: não há avaliações reais para mostrar, e
  inventá-las viola as regras do Google.

## Testes

- **E2E** `e2e/landing-flow.spec.ts`:
  - raiz em alemão → `/de` com canónico, 7 `hreflang`, `og:image`,
    `og:locale`, cartão do X, dados estruturados e preços;
  - troca de língua e registo;
  - app Android → login;
  - caminho desconhecido → 404;
  - sitemap e robots.
- **E2E existentes:** os testes de registo passaram a abrir `/login`.

## Passos do operador

Ver `context/OPERATIONS.md`, "Google Search Console (Upgrade 12)".
