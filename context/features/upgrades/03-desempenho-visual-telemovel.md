# UPGRADE 03 — Desempenho visual em telemóvel

> Pedido do utilizador (2026-10-08), depois do Lighthouse: "quanto à mudança
> visual tudo ok por mim... fica noutra feature".

## Contexto (Lighthouse de 2026-10-08)

**Já corrigido** (commit `5ce176e`):
- `html lang` e descrição da página por idioma;
- `robots.txt`;
- fontes servidas pelo próprio site (`@nuxt/fonts`);
- Netlify Drawer desligado pelo utilizador.

Acessibilidade, boas práticas e SEO ficaram em **100** nas páginas públicas.

**Desempenho em telemóvel**, com o CPU calibrado: login 69, privacidade 87.
- Calibração: o índice de CPU da máquina de teste era ~390; o Lighthouse
  correu com `cpuSlowdownMultiplier=1`. Com o 4× por omissão, os valores
  saíam irrealistas (29–42).
- **No login:** 4,1 s até ao conteúdo principal (LCP) e 330 ms de bloqueio
  (TBT).
- O peso é pequeno (~300 KB). O custo é de **desenho**:
  - `styleLayout` ~2,3 s e `scriptEvaluation` ~3,7 s, com o CPU 4×;
  - `backdrop-blur-xl` (24 px) em 64 componentes `glass-card`, mais modais,
    toasts e botões;
  - no login: partículas animadas (`animate-float`), um halo com `blur-2xl`
    e um ícone com `animate-bounce`.

## Objetivo

Login com desempenho **≥ 85** e LCP **≤ 2,5 s** em telemóvel (Lighthouse,
CPU calibrado), sem mudar o aspeto em computador.

## Decisão (utilizador, 2026-10-08)

Pode mudar o aspeto em telemóvel ("tudo ok por mim").

## Tarefas

- [x] **Desfoque de fundo só em ecrãs grandes:**
  - em `max-width: 1023px`, os `glass-card`, modais, toasts, botões de vidro
    e a barra de navegação trocam `backdrop-filter` por um fundo mais
    opaco, com a mesma cor (ex. `surface-800/90`);
  - em computador fica igual;
  - em `prefers-reduced-motion` sem desfoque em todos os tamanhos.
- [x] **Login:**
  - menos partículas em ecrã pequeno, e nenhuma com
    `prefers-reduced-motion`;
  - halo `blur-2xl` substituído por um gradiente radial (sem filtro);
  - animações de entrada mais curtas.
- [x] **Ecrã de carregamento global** (`app.vue`): só um elemento animado.
- [x] Confirmar que o desfoque desligado não reduz o contraste do texto (a11y
      a 100).
- [ ] Lighthouse antes/depois: login, privacidade e, se der, uma página com
      sessão. Registar os números aqui. — login e privacidade medidos em
      local e na Netlify (ver "Resultados"); página com sessão por medir.
- [x] E2E sem regressões (5/5). Apanharam uma, entretanto corrigida — ver
      abaixo "Login interativo só depois da hidratação".

### Encontrado durante a implementação (fora da lista inicial)

- **Login interativo só depois da hidratação:** com o ecrã de carregamento
  fora do caminho, o login passou a aparecer antes de o Vue hidratar, e um
  toque em "Criar conta" (ou texto escrito) nesse intervalo perdia-se — o
  E2E `i18n-flow` apanhou-o. Os separadores e um `<fieldset>` à volta do
  formulário de credenciais ficam `disabled` até ao `onMounted` (o aspeto
  não muda: nenhum destes controlos tem estilo de `disabled`).

- **Ecrã de carregamento a tapar o login:** o store `auth` começa com
  `loading = true` e, em `/login`, só o plugin cliente o põe a `false`
  (depois de o JS carregar e `/api/auth/session` responder). O ecrã z-200
  tapava o login até lá — o LCP esperava pela hidratação e por um pedido à
  API. Agora, numa rota pública **sem** cookie `session` no pedido, o SSR já
  o manda escondido (`useState('had-session-cookie')` em `app.vue`); com
  cookie fica como antes.
- **Fontes:** `@nuxt/fonts` 0.14 com `preload: true` pré-carregava a 1.ª face
  de cada família — o Inter **itálico** latin-ext (91 KB, a app não usa
  itálico) e o latin-ext do Space Grotesk. Removido o itálico e o preload:
  −114 KB por página, 68 → 52 `@font-face`.

## Resultados (2026-10-08, medição local)

A/B no mesmo ambiente: build `node-server` do `main` vs. do branch, cada um
atrás de um proxy com brotli (a Netlify comprime; sem isso a rede dominava),
Lighthouse telemóvel com `cpuSlowdownMultiplier=1`, 5 corridas alternadas,
mediana. **Os números absolutos não comparam com os de produção** (69/87): a
rede simulada pesa muito mais em local, e a máquina esteve a 100% de CPU
(OneDrive, Zoom) em parte das medições.

| Página | Antes | Depois | LCP antes → depois | TBT antes → depois | styleLayout |
|---|---|---|---|---|---|
| login (só desfoque/animações) | 63 | 68 | 5,56 → 5,33 s | 292 → 198 ms | 705 → 622 ms |
| login (+ ecrã de carregamento) | 69 | 70 | 5,31 → 5,04 s | 159 → 118 ms | 629 → 524 ms |
| privacidade (idem) | 72 | 80 | 4,67 → 4,36 s | 122 → 73 ms | 638 → 457 ms |
| privacidade (+ fontes, máquina saturada) | 57 | 72 | 5,24 → 3,65 s | 280 → 279 ms | 1178 → 680 ms |

Acessibilidade, boas práticas e SEO: **100** em todas as corridas, antes e
depois.

## Resultados na Netlify (2026-10-08)

Rascunho `https://upgrade-03--financeflow-webapp.netlify.app` (deploy com
`--alias`, produção intacta) contra a produção, Lighthouse telemóvel com
`cpuSlowdownMultiplier=1`, 5 corridas alternadas, mediana. Atenção: o
índice de CPU da máquina estava em **~220–285** (a calibração original era
~390), por isso os valores absolutos ficam abaixo dos da medição original.

| Página | Antes | Depois | LCP antes → depois | Peso |
|---|---|---|---|---|
| login (1.ª ronda) | 68 | 73 | 4,04 → 3,93 s | 429 → 321 KB |
| login (+ sem animação de entrada em telemóvel) | 62 | 69 | 4,14 → 3,15 s | — |
| privacidade | 74 | 82 | 3,43 → 2,81 s | 430 → 322 KB |

Speed Index do login: 8,5 → 5,5 s. Acessibilidade, boas práticas e SEO:
100 em todas as corridas.

- **Animação de entrada do login:** começava em `opacity: 0` e o 1.º frame
  só era pintado depois da hidratação — na Netlify o 1.º desenho do login
  vinha 1,3 s depois do `DOMContentLoaded` (na privacidade, logo a seguir).
  Retirada em telemóvel (`max-lg:animate-none`); em computador igual.
- **Critério ≥ 85 / LCP ≤ 2,5 s: não demonstrado.** Com esta máquina não dá
  para o provar: o que resta no login é sobretudo JS (TBT ~400–500 ms com o
  CPU lento; entrada de 146 KB), fora do âmbito "desenho" deste upgrade. Para
  um número independente da máquina: PageSpeed Insights com chave de API (a
  quota sem chave estava esgotada a 2026-10-08).

## PageSpeed Insights (utilizador, 2026-10-08 22:24)

Corrido pelo utilizador no site do PSI sobre a **produção** — que ainda tem
a versão **antiga** (sem este upgrade; confirmado pelo HTML: 2 fontes
pré-carregadas, 16 faces itálicas, ecrã de carregamento visível no SSR):

- Login em telemóvel (Moto G Power emulado, 4G lento, Lighthouse 13.5):
  **98** de desempenho; FCP 1,4 s, **LCP 2,0 s**, TBT 30 ms, CLS 0, SI 3,1 s;
  acessibilidade, boas práticas e SEO 100.

**Conclusão:** num dispositivo-padrão o login já cumpria o objetivo
(≥ 85, LCP ≤ 2,5 s) antes do upgrade. O 69 do contexto acima vinha
sobretudo do CPU da máquina de teste (índice ~390, e ~220–285 nas medições
de hoje). O upgrade mantém o seu valor relativo (medido antes/depois nas
mesmas condições, ver acima), mas o critério de aceitação "≥ 85" fica
cumprido pela medição de referência da Google. Falta, para fechar: o
mesmo PSI sobre o URL do rascunho, para confirmar que não piora.

## Fora de âmbito

- Mudar o design system em computador.
- Medir as páginas com sessão de forma automática. O Lighthouse com sessão
  ficou pendurado no browser autenticado: tentar o PageSpeed Insights com
  uma chave de API, ou o Lighthouse do Chrome DevTools à mão.

## Critérios de aceitação

- [x] Login ≥ 85 de desempenho em telemóvel — PSI (Moto G Power, 4G lento): **100**, LCP 0,9 s.
- [x] Acessibilidade, boas práticas e SEO continuam em 100 (PSI do rascunho, depois do `<main>`).
- [x] Em computador, o aspeto é o mesmo — todas as mudanças visuais estão limitadas a `max-width: 1023px`, `max-lg:`/`lg:` ou `prefers-reduced-motion`.

### PSI sobre o rascunho (utilizador, 2026-10-08 22:30)

Login em telemóvel no rascunho: **100** de desempenho (produção 98); FCP
0,9 s (1,4), **LCP 0,9 s** (2,0), SI 1,6 s (3,1), TBT 30 ms, CLS 0. Boas
práticas e SEO 100. **Acessibilidade 97:** "O documento não tem um ponto de
referência principal" — o login e as páginas legais (`LegalDocument`, usado
por /privacy e /terms) não tinham `<main>`; em produção passava porque o
ecrã de carregamento tapava a página na altura da análise. Corrigido: o
contentor de topo dessas páginas passou a `<main>` (mesmas classes, mesmo
aspeto).

PSI do rascunho depois do `<main>` (utilizador, 2026-10-09): acessibilidade
**100**. Todos os critérios de aceitação cumpridos.
