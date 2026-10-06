# Funcionalidade Atual

<!-- Ver especificação completa em context/features/10-FASE-10-moeda-de-apresentacao.md -->

## Estado

**Concluída** (2026-10-01) — os 5 critérios de aceitação abaixo cumpridos e
cobertos por testes (unitários 51/51, integração 32/32, E2E 4/4, type-check
0 erros). Branch `feature/fase-10-moeda-apresentacao` mergeado em `main` e
apagado. Chega à web e à app Android com o próximo deploy (a escolha da
moeda é um ecrã do site, não precisa de `.aab` novo).

**Em curso: Upgrade 01 — Google Play Billing na app Android**
(`context/features/upgrades/01-google-play-billing-android.md`, branch
`feature/upgrade-01-google-play-billing`). A conta de programador é pessoal e
não é elegível para pagamentos externos: na app Android paga-se só pela
Google Play; a web mantém a EasyPay. Preços iguais nos dois: Pro 7 €,
Premium 18 €. Implementado e testado (unit 58/58, integração 39/39, E2E 5/5),
app 1.1.0 (versionCode 4). Falta do lado do utilizador: perfil de pagamentos,
produtos, conta de serviço, RTDN e testadores de licenças na Play Console
(`context/PLAY-STORE.md`, secção 5), e o teste num dispositivo.

**A seguir: retomar a Fase 9 (Publicação)**, que ficou em pausa e não está
concluída. Próximo passo combinado: testes fechados (12+ testadores durante
14 dias), com 2–3 atualizações da app Android ao longo do teste (ecrã sem
internet, splash/barra de estado, otimização R8, correções do feedback). Feito: web em produção
(https://financeflow-webapp.netlify.app), backups R2, app nos testes
internos (`.aab` 1.0.0 e 1.0.1 assinados, pacote `com.dinismcosta.financeflow`;
1.0.2 / versionCode 3 gerada a 2026-10-01 com o ecrã sem internet —
`android-web/offline.html` via `server.errorPath`),
ficha da loja e declarações da Play Console. Por fazer: testes fechados,
configuração da Google Play Billing (Upgrade 01), Lighthouse
(a CSP já é obrigatória desde 2026-10-03, validada sem violações), produção com rollout faseado. Histórico
completo abaixo.

## Objetivos

FASE 10 — Moeda de apresentação: o utilizador escolhe em Configurações a
moeda em que vê todos os valores da app (121 moedas suportadas pela Twelve
Data), convertidos ao câmbio do dia. Os dados continuam em euros.

Decisões já tomadas (ver especificação): euro como moeda base (nunca se
reescrevem os dados), câmbio do dia para tudo, preços das subscrições em € com
o aproximado, fornecedor Twelve Data.

## Critérios de aceitação

- Mudar a moeda altera todos os valores sem recarregar dados; a escolha
  mantém-se entre web e Android
- Voltar ao euro mostra exatamente os mesmos valores
- Transação criada noutra moeda fica em euros com o valor/moeda originais
- Fornecedor de câmbio em baixo não parte a app
- Testes unitários, de integração e E2E

## Histórico

<!-- Manter atualizado. Da mais antiga para a mais recente -->

- 2026-09-15: FASE 1 (Fundação Multiplataforma Web + Android) concluída e
  validada num dispositivo real (ver histórico completo em
  `context/features/01-FASE-1-fundacao-multiplataforma.md`); branch
  `feature/fase-1-fundacao-multiplataforma` ainda não commitada nesta data
  — decisão de commit pendente com o utilizador.
- 2026-09-15: Definida como funcionalidade atual — FASE 2 (Sistema de
  Subscrições: recorrente + MB WAY + Multibanco), especificação em
  `context/features/02-FASE-2-sistema-subscricoes.md`. Estado inicial: não
  iniciada. (O processador de pagamentos foi redefinido em 2026-09-18 — ver
  as entradas dessa data.)
- 2026-09-15: Branch `feature/fase-2-sistema-subscricoes` criado a partir de
  `main` (nota: `git log` confirma que a Fase 1 já estava mergeada em `main`
  nesta altura, ao contrário do registado na entrada anterior). Estado passa
  a "Em progresso". Primeira implementação das tarefas 1-7 e parte da 8-9 da
  especificação — o código específico do processador de pagamentos foi
  entretanto substituído (ver 2026-09-18); ficou o que é independente dele:
  - **Modelo de dados**: `User.subscription` (`server/models/index.ts`,
    `IUserSubscription`) e uma coleção temporária de compras pendentes para o
    webhook reconstituir compras pré-pagas (removida na redefinição de
    2026-09-18). Script `scripts/migrate-subscriptions.mjs` para utilizadores
    existentes.
  - **`shared/features.ts`**: `SubscriptionTier`, `FEATURE_MATRIX`,
    `hasFeature()`, `TIER_LIMITS` (transações/mês e categorias custom Free).
  - **Endpoints** `server/api/subscription/**`: estado atual (GET), criação de
    subscrição recorrente, criação de compra pré-paga, webhook, cancel,
    check-expirations (sem scheduler no projeto — desenhado para ser chamado
    por cron externo com header `x-cron-secret`; envio real de email/push por
    implementar, não existe serviço de notificações ainda).
  - **Enforcement no servidor**: `requireFeature()` aplicado a
    `predictions/data`, `groups/**`; limite Free (50 transações/mês, 2
    categorias custom) em `transactions`/`categories` POST; novo endpoint
    `transactions/export.ts` (Pro+) substitui a geração de CSV a partir de
    dados já carregados no client.
  - **Client**: `useSubscription()` (composable fino sobre
    `stores/subscription.ts`, Pinia por-request para não vazar estado entre
    utilizadores em SSR), `PaywallModal`/`UpsellBanner`, página
    `/subscription` (planos, escolha recorrente vs. pré-pago com seletor de
    período, disclosure obrigatório + `@capacitor/browser` no Android antes
    de sair para o checkout externo), `/subscription/return` (polling curto
    até o webhook confirmar). Gating aplicado em Previsões, Grupos e
    exportação CSV.
  - `npm run build` validado sem erros (todas as rotas novas compilam).
  - **Por fazer / fora do alcance de código**: inscrição no programa de
    pagamentos externos da Google (tarefa 8) e reporte `ExternalTransactionId`
    (não implementado — API ainda em evolução em 2026, por confirmar na Play
    Console); configurar um cron externo real para `check-expirations`.
    `.env.example` tinha uma connection string MongoDB Atlas real (ficheiro é
    gitignored, nunca esteve no histórico do git, mas ainda assim redigida
    para placeholder nesta sessão) — vars da Fase 2 adicionadas.
- 2026-09-15: Testes de sandbox da primeira implementação: fluxo recorrente
  (cartão) e Multibanco confirmados de ponta a ponta (compra criada,
  redirecionamento, referência gerada, webhook processado, tier atualizado);
  vários payloads reais corrigidos face à documentação consultada. MB WAY
  implementado mas bloqueado — a conta sandbox não tinha a capacidade
  aprovada pelo processador (pedido pendente do lado dele, fora do controlo
  do código).
  Corrigidos dois bugs de design encontrados nos testes: (1) uma referência
  Multibanco pendente deixava de refletir o plano real do utilizador
  (sobrescrevia `tier`/`status` para a compra em curso, mesmo sem
  pagamento confirmado) — agora só se escreve em `User.subscription` com o
  pagamento confirmado; uma compra pendente vive só na coleção temporária de
  compras pendentes, exposta ao client como `pendingPurchase` à parte do
  plano atual, com endpoint para o utilizador limpar uma referência
  abandonada; (2) cancelamento de auto-renovação fazia downgrade imediato
  para `free` — corrigido para manter o acesso até `currentPeriodEnd` e só
  descer no job de expiração.
  Adicionado, a pedido do utilizador: upgrade/downgrade in-place de planos
  recorrentes (`change-plan.post.ts` — acesso imediato à nova tier, cobrança
  ao novo preço só no ciclo seguinte porque o processador não proraciona
  automaticamente, decisão aceite explicitamente; removido na redefinição de
  2026-09-18); duas estatísticas avançadas novas (histograma de distribuição
  de despesas, box-plot de quartis por categoria via
  `@sgratzl/chartjs-chart-boxplot`), gated Pro+ (`statsAdvanced`), a fechar
  o gap entre a matriz de features documentada e o que estava realmente
  implementado.
  Testado num deploy de teste separado (Netlify) e depois num túnel
  Cloudflare para um build `node-server` local — o preset serverless do
  Nitro para Netlify tem um bug de empacotamento (perde ficheiros JS do
  bundle do cliente) nesta configuração; sem impacto porque a produção real
  usa `node-server` em Docker (decisão da Fase 1), não Netlify.
  Branch `feature/fase-2-sistema-subscricoes` commitado (`accd41b`),
  mergeado em `main` (merge commit) e removido. Estado passa a "Concluída".
  Nesta sessão, `context/features/` foi também reorganizado para abrir
  espaço a duas fases novas acordadas com o utilizador — Fase 3 (Insights
  com IA, Pro+/Premium) e Fase 5 (Internacionalização) — com as fases de
  design system/segurança/publicação renumeradas em conformidade; ver
  `00-CODE-SPEC.md` e os respetivos ficheiros de fase para o detalhe.
- 2026-09-16: Definida como funcionalidade atual — FASE 3 (Insights com IA:
  interpretação de estatísticas Pro+Premium, dicas de investimento
  educativas Premium), especificação em
  `context/features/03-FASE-3-insights-ia.md`. Estado inicial: não
  iniciada.
- 2026-09-16: Branch `feature/fase-3-insights-ia` criado a partir de `main`.
  Estado passa a "Em progresso". Implementado o código-base completo das
  tarefas 1-5 da especificação:
  - **`shared/features.ts`**: `aiStatsInsights` (Pro) e `aiInvestmentTips`
    (Premium) adicionados à `FEATURE_MATRIX`.
  - **Modelo de dados** (`server/models/index.ts`): `IInvestorProfile`
    embutido em `User.investorProfile` (sem default — só existe após o
    questionário); novas collections `MarketSnapshot` (singleton diário,
    `date` único) e `AiInsightCache` (1 documento por utilizador,
    sobrescrito a cada análise, cache de 24h).
  - **`server/utils/anthropic.ts`**: wrapper fino sobre a Messages API
    (fetch nativo, sem SDK — consistente com o wrapper de pagamentos da Fase 2), modelo
    `claude-haiku-4-5`, structured outputs via `output_config.format`
    (`type: 'json_schema'`) e header `anthropic-beta:
structured-outputs-2025-12-15`; parâmetros confirmados via Context7
    (`@anthropic-ai/sdk-typescript`, `helpers.md`) por não serem do
    conhecimento de treino do modelo.
  - **`server/utils/marketData.ts`**: wrapper sobre a Quote API da Twelve
    Data, símbolos separados por vírgula num único pedido; parâmetros
    confirmados via Context7 (OpenAPI spec da Twelve Data). Símbolos de
    índice "puro" (SPX, IXIC, STOXX50E, PSI20) testados em sandbox real e
    devolvem 403/404 no plano gratuito (exigem plano pago) — corrigido para
    usar os ETFs mais líquidos que replicam cada índice (SPY, QQQ, DIA,
    VGK; PSI-20 abandonado por não ter proxy líquido disponível no plano
    gratuito), exibidos ao utilizador pelo nome do índice subjacente.
  - **Endpoints**: `server/api/insights/stats.post.ts`
    (`requireFeature('aiStatsInsights')`, agregados calculados no próprio
    endpoint a partir de `Transaction` — nunca descrições em bruto — cache
    de 24h em `AiInsightCache`); `server/api/insights/investment.post.ts`
    (`requireFeature('aiInvestmentTips')`, devolve `{ needsProfile: true }`
    se perfil ausente/>365 dias via `server/utils/investorProfile.ts`,
    disclaimer hardcoded nunca gerado pelo LLM); `server/api/insights/
market-snapshot.post.ts` (cron `x-cron-secret`, mesmo padrão de
    `check-expirations`, no-op se já existir snapshot do dia — protege o
    limite de 800 pedidos/dia da Twelve Data); `server/api/investor-profile/
index.ts` (GET/POST, validação de enums no servidor).
  - **Client**: `components/insights/StatsInsightCard.vue` (botão "Analisar
    com IA", cache visível, gated Pro+) inserido em `pages/stats/index.vue`;
    `pages/investimento/perfil.vue` (questionário curto) e `pages/
investimento/index.vue` (mostra questionário/dicas/disclaimer/data do
    snapshot, `PaywallModal` Premium); link "Investimento" adicionado à nav
    desktop (`layouts/default.vue`), sempre visível.
  - **Config**: `ANTHROPIC_API_KEY`/`TWELVE_DATA_API_KEY` adicionados a
    `nuxt.config.ts` (privados, nunca em `public`) e `.env.example`.
  - `npm run build` validado sem erros (todas as rotas novas compilam).
- 2026-09-16: Testado o backend de ponta a ponta em dev local, ligado ao
  MongoDB Atlas real e às APIs reais da Anthropic e da Twelve Data (chaves já
  estavam em `.env`), via curl com o header `x-user-id` (aceite por
  `requireAuth`) sobre a conta `dinismiguelcosta@hotmail.com` (já `tier:
premium` de testes da Fase 2 — não foi necessário alterar nada):
  - `POST /api/insights/stats` sem plano suficiente → `403 feature_locked`
    confirmado (enforcement real no servidor, não só no client).
  - `POST /api/insights/stats` com Premium → `200`, chamada real à Anthropic
    com `output_config.format`/`anthropic-beta: structured-outputs-2025-12-15`
    funcionou exatamente como documentado (JSON estruturado válido devolvido
    e parseado); sem transações nos últimos 6 meses nesta conta, o modelo
    devolveu sugestões genéricas em vez de alucinar dados — comportamento
    correto. Segunda chamada imediata devolveu `cached: true` com o mesmo
    `generatedAt` — cache de 24h confirmada.
  - `POST /api/insights/market-snapshot` (cron, `x-cron-secret`): primeira
    tentativa com os símbolos de índice originais (SPX/IXIC/STOXX50E/PSI20)
    falhou com `CastError` (Twelve Data devolveu 403/404 para esses símbolos
    no plano gratuito) — bug real apanhado em teste, corrigido trocando para
    ETFs proxy (ver acima). Depois da correção: `200`, snapshot do dia
    guardado corretamente; segunda chamada no mesmo dia devolveu
    `skipped: true` sem voltar a chamar a Twelve Data — confirma o critério
    de aceitação "só 1x/dia".
  - Fluxo de investimento completo: `GET /api/investor-profile` sem perfil →
    `{ profile: null, valid: false }`; `POST /api/insights/investment` sem
    perfil → `{ needsProfile: true }`; `POST /api/investor-profile` grava o
    questionário; `POST /api/insights/investment` com perfil válido → `200`
    com disclaimer hardcoded, `marketSnapshotDate` correto e 5 dicas
    educativas geradas pela IA, nenhuma a nomear ativo/ticker específico
    (revisão manual desta amostra passou o critério de aceitação).
  - **Nota**: este teste escreveu dados reais na conta
    `dinismiguelcosta@hotmail.com` (perfil de investidor de teste, cache de
    insights vazia, `MarketSnapshot` do dia) — o `MarketSnapshot` e a cache
    são dados de produção legítimos, mas o `investorProfile` gravado é
    fictício (dados de teste) e deve ser substituído ou limpo antes de o
    utilizador real preencher o questionário a sério.
  - **Por fazer / fora do alcance de código**: configurar o cron externo
    real para `market-snapshot`; testar a renovação do perfil aos 365 dias
    (não testado nesta sessão — precisa de adiantar `updatedAt`
    manualmente).
- 2026-09-16: Teste manual no browser pelo utilizador revelou um gap: o link
  "Investimento" só tinha sido adicionado à sidebar (`layouts/default.vue`),
  mas o dashboard (`pages/index.vue`) tem a sua própria fila de atalhos
  rápidos ("Transações/Grupos/Estatísticas/Configurações"), independente da
  sidebar — e é essa fila que o utilizador vê primeiro. Corrigido:
  adicionados "Previsões IA" (também em falta, gap pré-existente à Fase 3) e
  "Investimento" a essa fila. `npm run build` validado sem erros.
  Confirmado pelo utilizador em browser: ambos os links aparecem agora no
  dashboard. Também identificado durante o diagnóstico: o PWA
  (`@vite-pwa/nuxt`) regista service worker mesmo em dev
  (`devOptions.enabled: true` no `nuxt.config.ts`), o que pode mostrar UI em
  cache mesmo depois de reiniciar o dev server — útil ter presente em testes
  futuros de UI (precisa de "Unregister" do service worker + "Clear site
  data" para garantir que se está a ver a versão atual).
- 2026-09-16: Testada a app Android nativa (Capacitor, Fase 1) num telemóvel
  físico real ligado por cabo USB, a apontar para o dev server local via
  `adb reverse tcp:3000 tcp:3000` (`CAPACITOR_SERVER_URL=http://localhost:3000`
  no sync/build). Confirmado pelo utilizador: app abre e funciona bem no
  telemóvel. Vários problemas de ambiente encontrados e corrigidos pelo
  caminho (nenhum é bug de código da Fase 3, mas ficam registados por serem
  reutilizáveis em testes Android futuros):
  - `npx cap run android` tem um bug/inconsistência a validar o target ID de
    um dispositivo físico real (funciona em `--list`, falha em `run` com
    "Invalid target ID") — contornado fazendo build manual
    (`gradlew assembleDebug`) + `adb install` + `adb shell am start`
    diretamente, em vez de depender do `cap run`.
  - A partir do Git Bash, o `gradlew`/`gradlew.bat` não é resolvido pelo
    Capacitor CLI nem pelo Node child_process no Windows ("gradlew is not
    recognized") — resolvido correndo os comandos Gradle a partir do
    PowerShell nativo em vez do Git Bash.
  - `JAVA_HOME` do sistema apontava para JDK 17, mas
    `capacitor-cordova-android-plugins` exige Java 21 (`invalid source
release: 21`) — resolvido definindo `JAVA_HOME` para o JDK 21 já
    instalado (`C:\Program Files\Eclipse Adoptium\jdk-21...`) só para o
    comando do Gradle.
  - A ligação USB caiu várias vezes durante o processo ("unauthorized"/
    "offline") — instabilidade de cabo/porta, não da app; resolvido com
    `adb kill-server && adb start-server` + reautorização no telemóvel.
  - A app ficava em branco / "Página web não disponível": duas causas
    reais, ambas corrigidas:
    1. `android:usesCleartextTraffic="false"` no `AndroidManifest.xml` +
       `cleartext: false` no `capacitor.config.ts` bloqueavam o
       `http://localhost:3000` (tráfego HTTP simples, sem TLS) — corrigido
       tornando `cleartext`/`allowMixedContent` condicionais a
       `CAPACITOR_SERVER_URL` estar definido em `capacitor.config.ts` (nunca
       liga no URL de produção por default) e ativando manualmente
       `usesCleartextTraffic="true"` no manifest **só para este teste** (ver
       nota em "Notas" acima — bloqueador a reverter antes de produção).
    2. O dev server só escutava em IPv6 (`::1`); o `adb reverse` no Windows
       liga-se sempre a `127.0.0.1` (IPv4) — corrigido correndo
       `nuxt dev --host 0.0.0.0` para escutar em todas as interfaces.
- 2026-09-16: Branch `feature/fase-3-insights-ia` mergeado em `main` (merge
  commit) e removido. Estado passa a "Concluída". Bloqueador pendente antes
  de produção (não esquecer, ver também "Notas" acima):
  `android/app/src/main/AndroidManifest.xml` tem
  `android:usesCleartextTraffic="true"`, ligado só para testar a app Android
  via USB nesta sessão — reverter para `"false"` antes de qualquer build de
  release/Play Store (decisão explícita do utilizador de deixar para a fase
  de publicação em vez de reverter agora).
- 2026-09-16: Definida como funcionalidade atual — FASE 4 (Design System,
  Safe Areas e Responsividade), especificação em
  `context/features/04-FASE-4-design-system-ui.md`. Estado inicial: não
  iniciada.
- 2026-09-16: Branch `feature/fase-4-design-system-ui` criado a partir de
  `main`. Estado passa a "Em progresso". Implementadas as tarefas 1-3 e 5-7
  da especificação (tarefa 4 — breakpoints — já estava maioritariamente
  coberta antes desta fase, ver nota):
  - **Tarefa 1 (tokens)**: `tailwind.config.js` — breakpoints nomeados
    `tablet`/`desktop`/`ultrawide` (aliases dos defaults `sm`/`lg`/`2xl`, já
    usados em toda a app, sem quebrar nada existente); tons intermédios
    `surface.950/400/300` adicionados para hierarquia.
  - **Tarefa 2 (safe areas)**: `env(safe-area-inset-*)` já existia
    parcialmente (`app.vue`, `MobileNav.vue`) mas sem fallback e sem cobrir
    modais — adicionados fallbacks `,_0px` em `app.vue`, safe-area real em
    `.modal-overlay` (`assets/css/main.css`), e o padding inferior de
    `<main>` em `layouts/default.vue` deixou de ser um valor mágico
    (`pb-24`) e passa a `calc(4.5rem + 1rem + safe-area-inset-bottom)`,
    refletindo a altura real da `MobileNav`.
  - **Tarefa 3 (moldura)**: nova classe utilitária `.page-frame`
    (`max-w-[1680px] mx-auto`) aplicada ao conteúdo de `<NuxtPage />` em
    `layouts/default.vue` — evita o layout esticado em ultra-wide sem
    afetar mobile/tablet/desktop normal.
  - **Tarefa 4 (breakpoints)**: auditoria confirmou que as duas tabelas
    existentes (`/transactions`, `/stats`) já estavam corretamente
    envolvidas em `overflow-x-auto` com colunas progressivamente escondidas
    (`hidden sm:table-cell`/`md:table-cell`) — nenhuma mudança necessária
    aqui além dos breakpoints nomeados da tarefa 1.
  - **Tarefa 5 (animações)**: transição de página global ligada
    (`nuxt.config.ts` → `app.pageTransition`, classes `.page-*` já
    existiam mas estavam órfãs — nunca tinham sido associadas ao router);
    duração apertada de 300ms para 200ms (dentro do intervalo 150-250ms
    pedido); `@media (prefers-reduced-motion: reduce)` global adicionado
    (não existia nenhuma implementação antes); padrão de skeleton
    generalizado num componente novo `components/ui/SkeletonBlock.vue`,
    adotado em `KpiCard.vue`, `pages/stats/index.vue`,
    `pages/transactions/index.vue`, `pages/groups/index.vue`
    (`ChartSkeleton.vue` mantido como está — já é um componente dedicado
    para barras de gráfico, não um bloco simples).
  - **Tarefa 6 (ícones/splash)**: verificação visual encontrou uma
    inconsistência real — os 8 ícones do manifest PWA
    (`public/icons/icon-*.svg`) usavam um emoji 💹 genérico, enquanto o
    ícone Android nativo e o splash screen (`assets/icon-*.svg`,
    `assets/splash.svg`) usam um logótipo próprio (barras + linha de
    tendência). Corrigido: os 8 SVGs do manifest foram regenerados com o
    mesmo logótipo (mesmo viewBox 1024×1024 do `assets/icon-only.svg`,
    só o `width`/`height` exterior muda por tamanho — garante consistência
    pixel-a-pixel). Adicionado também um `<link rel="icon">`/
    `apple-touch-icon` explícito a `nuxt.config.ts` (não existia nenhum
    favicon declarado antes, dependia inteiramente do módulo PWA).
  - **Tarefa 7 (acessibilidade)**: removido `maximum-scale=1,
user-scalable=no` do viewport meta (bloqueava pinch-zoom, falha WCAG
    1.4.4/1.4.10); `:focus-visible` global com outline visível adicionado
    (não existia nenhum estilo de foco customizado); `aria-label`
    adicionado a todos os botões/links só-com-ícone identificados numa
    auditoria (25 ocorrências no total — sidebar, topbar, paginação de
    transações, editar/eliminar em grupos/categorias/transações, fechar
    modais, seletor de ícone/cor no formulário de transação, fechar toast).
  - `npm run build` validado sem erros; dev server testado com curl em
    `/`, `/stats`, `/transactions`, `/groups`, `/settings` (200 em todos,
    sem crash SSR); confirmado por grep no código-fonte (não em runtime,
    dado que a app hidrata a maior parte do conteúdo protegido só no
    client) que os `aria-label`, a classe `.page-frame` e os usos de
    `SkeletonBlock` estão todos presentes.
  - **Por fazer / não verificável a partir daqui**: teste visual real em
    mobile/tablet/desktop/ultra-wide num browser; teste de safe areas num
    emulador ou dispositivo Android real com barra de gestos/notch (o
    bloqueador `usesCleartextTraffic="true"` herdado da Fase 3 continua
    pendente, ver "Notas"); confirmar `prefers-reduced-motion` visualmente
    (DevTools → Rendering → Emulate CSS); auditoria de contraste formal
    (Lighthouse/axe) — não corrida nesta sessão.
- 2026-09-16: Teste real num telemóvel Android físico (via USB + dev server
  local, mesmo fluxo documentado no README) revelou um **bug estrutural
  pré-existente e grave, não introduzido nesta fase**: `app.vue` tinha
  `<NuxtPage />` sozinho, sem `<NuxtLayout>` a envolvê-lo. Sem isso, o Nuxt
  **nunca aplicou o sistema de layouts** — `layouts/default.vue` (sidebar,
  topbar, `MobileNav`) era código morto desde sempre, confirmado por
  inspeção direta do HTML devolvido pelo servidor (zero vestígios de
  `nav-item`/sidebar) e pela documentação oficial do Nuxt via Context7. Isto
  explica retroativamente a confusão de sessões anteriores sobre a nav do
  dashboard "sem sidebar visível" — nunca foi um problema de viewport/
  colapso, a sidebar nunca renderizou. Todas as páginas exceto o dashboard
  (que tem a sua própria fila de atalhos) estavam efetivamente sem
  navegação persistente. Corrigido, com confirmação explícita do
  utilizador antes de avançar (mudança com impacto visual em toda a app):
  - `layouts/default.vue`: `<NuxtPage />` interno trocado por `<slot />`
    (estava a causar recursão — um layout usa `<slot/>` para o conteúdo da
    página, nunca `<NuxtPage/>`, que já está no `app.vue`).
  - `app.vue`: `<NuxtPage />` agora envolvido em `<NuxtLayout>`.
  - Confirmado por inspeção do HTML (antes/depois) e por `npm run build`
    sem erros; sidebar/topbar/MobileNav agora renderizam de facto em todas
    as páginas.
    Testes subsequentes no mesmo dispositivo expuseram mais 3 problemas
    reais, todos corrigidos:
  - **Dashboard a aparecer por instantes antes do login** (bug de
    autenticação, não desta fase, mas só ficou visível/testável depois da
    sidebar começar a renderizar): `middleware/auth.global.ts` ignorava
    completamente o SSR (`if (import.meta.server) return`), pelo que a
    página protegida era sempre renderizada no servidor com dados vazios/
    placeholder ("Olá, Utilizador"), corrigindo-se só depois no client.
    Corrigido com um atalho seguro: em SSR, o middleware lê a presença do
    cookie `userId` diretamente (`useCookie`) e redireciona já para
    `/login` se não existir — sem round-trip a `/api/auth/session`. Este
    atalho **só é seguro em SSR**: o cookie é `httpOnly` (invisível a
    `document.cookie` no client), por isso o client continua a usar o
    fluxo antigo (`fetchSession()` real) para o caso raro de cookie
    presente mas inválido.
  - **App "desformatada" ao reabrir depois de fechada / cliques por vezes
    sem reação**: o service worker da PWA estava a registar-se mesmo em
    dev (`devOptions.enabled: true`), servindo versões em cache
    desatualizadas contra um dev server que muda a cada gravação —
    confirmado o mesmo padrão que já tinha aparecido no browser desktop
    mais cedo nesta sessão. Corrigido desativando `devOptions.enabled` da
    PWA (só em dev — produção mantém o SW normal via `registerType`/
    `workbox`).
  - **Itens de menu deixam de ser clicáveis / conteúdo de páginas novas
    esconde-se** (regressão introduzida e revertida na própria sessão): ao
    tentar tornar a transição de página mais rápida, removi `mode: 'out-in'`
    de `pageTransition`/`layoutTransition` — sem esse modo, a página que
    sai e a que entra ficam **ambas no DOM ao mesmo tempo**, o que bloqueou
    cliques e escondeu conteúdo (reproduzido no dispositivo real:
    "Investimento" voltou a aparecer sem o cartão do formulário). Revertido
    para `mode: 'out-in'` — correção > velocidade percebida.
    `npm run build` validado sem erros depois de todas as correções.
    Confirmado pelo utilizador no dispositivo real, depois das correções:
    sidebar visível, login direto sem flash, formatação estável ao reabrir a
    app, itens de menu clicáveis, página de Investimento a mostrar o cartão
    do questionário corretamente. Nota à parte (não é bug de código): a app
    desinstalou-se sozinha várias vezes durante os testes — sugerido ao
    utilizador verificar se tem alguma app de limpeza/otimização de memória
    ativa no telemóvel.
- 2026-09-16: Branch `feature/fase-4-design-system-ui` mergeado em `main`
  (merge commit) e removido. Estado passa a "Concluída". Bloqueador
  pendente antes de produção (herdado da Fase 3, ainda por resolver, ver
  também "Notas" acima): `android/app/src/main/AndroidManifest.xml` tem
  `android:usesCleartextTraffic="true"`, ligado só para testar a app
  Android via USB — reverter para `"false"` antes de qualquer build de
  release/Play Store.
- 2026-09-18: FASE 2 redefinida a pedido do utilizador — o processador de
  pagamentos passa a ser a **EasyPay** (Cartão/Débito Direto, MB WAY,
  Multibanco com um único contrato/API). Especificação em
  `context/features/02-FASE-2-sistema-subscricoes.md` reescrita de raiz
  (decisões de arquitetura, distinção `auto`/`push_confirm`/
  `manual_reference` por método, 11 tarefas, critérios de aceitação);
  `00-CODE-SPEC.md` e `CONFIG-REFERENCE.md` também atualizados nesta sessão.
  Definida novamente como funcionalidade atual. Estado: não iniciada — a
  implementação anterior (concluída e mergeada em `accd41b`) fica como
  referência histórica nas entradas acima, mas o código/endpoints/variáveis
  de ambiente específicos do processador anterior terão de ser
  removidos/substituídos ao longo desta nova implementação.
- 2026-09-18: Branch `feature/fase-2-easypay-subscricoes` criado a partir de
  `main`. Estado passa a "Em progresso". Documentação EasyPay consultada via
  Context7 (`/websites/easypay_pt`) para autenticação, Subscription API,
  Checkout, Frequent Payments e o guia de Webhooks — confirmado que a EasyPay
  **não assina** os webhooks: a validação de
  autenticidade é sempre um `GET` de volta à API pelo `id` do recurso antes de
  confiar em qualquer campo do corpo recebido. A pedido explícito do
  utilizador, todo o código do processador anterior foi **removido por
  completo** (não deixado como código morto), não só substituído:
  - Removidos: o wrapper da API anterior (`server/utils`), os seus 6
    endpoints em `server/api/subscription/`, o script de criação de planos
    (sem equivalente EasyPay — não há conceito de "planos" pré-criados, o
    valor vai em cada pedido) e a coleção temporária de compras pendentes
    (`server/models/index.ts`).
  - **Modelo de dados**: `IUserSubscription` reescrita —
    `provider: 'easypay'|'none'`, `paymentMethod: 'cc'|'dd'|'mbway'|
'multibanco'|'none'`, `billingMode: 'auto'|'push_confirm'|
'manual_reference'|'none'` (substitui `periodType`), `easypaySubscriptionId`,
    `easypayFrequentPaymentId`, `multibancoEntity`/`multibancoReference`/
    `multibancoExpiresAt` (referência do ciclo em curso). Sem tabela de
    "pending orders": a EasyPay devolve o `key` que enviámos em qualquer
    consulta/webhook, por isso o próprio checkout é criado com
    `key: "<userId>:<tier>:<paymentMethod>"` (`encodeMerchantKey` em
    `server/utils/easypay.ts`) — simplifica bastante em relação ao mapa
    temporário que a implementação anterior precisava.
  - **`server/utils/easypay.ts`**: wrapper fetch nativo (headers
    `AccountId`/`ApiKey`), `createSubscriptionCheckout()` (CC/DD, tipo
    `subscription`, `sdd_mandate` inline para DD), `createFrequentCheckout()`
    (MB WAY/Multibanco, tipo `frequent`, só tokeniza), `captureFrequentPayment()`
    (dispara um ciclo — MB WAY é assíncrono via push, Multibanco devolve
    entidade/referência já na resposta), `getSubscriptionResource()`/
    `getFrequentResource()`/`getSingle()` (verificação de webhook),
    `cancelSubscription()`. Nome exato do campo do URL de redirecionamento do
    Checkout (`checkout_url` vs `url`) não veio 100% consistente entre as
    páginas de documentação indexadas — código aceita as duas variantes, por
    confirmar contra a resposta real em sandbox.
  - **Endpoints** `server/api/subscription/easypay/**`: `create-subscription`
    (onboarding CC/DD), `create-frequent` (onboarding MB WAY/Multibanco,
    sem cobrança imediata), `webhook` (eventos `subscription_create`,
    `frequent_create`, `capture`/`subscription_capture` — dispara o primeiro
    ciclo logo após `frequent_create` confirmado, em vez de esperar pelo cron
    mensal seguinte), `cancel` (só `billingMode: 'auto'`), `cron/mbway.post.ts`
    e `cron/multibanco.post.ts` (mesmo padrão `x-cron-secret` de
    `check-expirations.post.ts`, sem scheduler no projeto). `check-expirations.post.ts`
    e `server/api/subscription/index.ts` (GET) atualizados para o novo modelo.
  - **Simplificação deliberada face à versão anterior**: não recriado o
    upgrade/downgrade in-place (`change-plan`) — não faz parte das 11 tarefas
    da especificação reescrita (era um extra pedido à parte na versão
    anterior); a mudar de plano por agora é cancelar + subscrever de novo. Fica
    assinalado caso o utilizador queira voltar a pedir isto.
  - **Client**: `stores/subscription.ts`/`composables/useSubscription.ts`
    atualizados para os novos campos (`billingMode`, `paymentMethod`,
    campos Multibanco); `components/subscription/UpsellBanner.vue` passa a
    mostrar a referência Multibanco pendente em vez do antigo aviso genérico
    de "pré-pago"; `pages/subscription/index.vue` reescrita com seleção de
    método (Cartão/DD/MB WAY/Multibanco), formulário IBAN+titular para DD, e
    o mesmo padrão de disclosure + `@capacitor/browser` no Android antes de
    sair para o checkout (agora `easypay.pt`);
    `pages/subscription/return.vue` ajustada ao novo `status`/`billingMode`.
  - `nuxt.config.ts`, `.env.example` e `context/CONFIG-REFERENCE.md`
    atualizados: `EASYPAY_ENV`/`EASYPAY_ACCOUNT_ID`/`EASYPAY_API_KEY`
    substituem as variáveis do processador anterior; `CRON_SECRET` mantido (partilhado
    pelos três crons desta fase + o de `market-snapshot` da Fase 3).
    `scripts/migrate-subscriptions.mjs` atualizado para o novo esquema.
  - `npm run build` validado sem erros (todas as rotas novas — incluindo os
    dois crons e o webhook — compilam); confirmado por grep que não sobrou
    nenhuma referência ao processador anterior.
  - **Por fazer / fora do alcance de código**: criar conta EasyPay real
    (sandbox `api.test.easypay.pt` e produção); testar os quatro métodos em
    sandbox real (tarefa 11 — incluindo confirmar o campo exato do URL de
    redirecionamento do Checkout, o formato da resposta de
    `createFrequentCheckout` para MB WAY, e se `captureFrequentPayment`
    funciona da mesma forma para Multibanco como está assumido no código);
    configurar os crons externos reais para `easypay/cron/mbway`,
    `easypay/cron/multibanco` e `check-expirations`; tarefa 10 (inscrição no
    programa de pagamentos externos da Google, `ExternalTransactionId`,
    teste do fluxo completo em Android) — nada disto foi feito nesta sessão.
- 2026-09-19: Testado o fluxo completo em sandbox EasyPay real (conta de
  teste já disponível), os quatro métodos (Cartão, Débito Direto, MB WAY,
  Multibanco), com várias correções a bugs reais encontrados durante o
  teste — a maioria por a documentação EasyPay indexada no Context7 ter
  informação inconsistente entre si (páginas diferentes descreviam o mesmo
  endpoint de formas diferentes), só resolvida por tentativa/erro direto
  contra a sandbox:
  - **Checkout não é redirecionamento por URL**: descoberta central desta
    sessão — a EasyPay Checkout usa o pacote client-side
    `@easypaypt/checkout-sdk` (instalado), que recebe o manifest devolvido
    por `POST /checkout` (`{ id, session, config }`) e embebe o formulário
    diretamente na página (`display: 'inline'`; `'popup'` só abre com um
    clique no próprio elemento, não programaticamente — usado
    incorretamente na 1ª tentativa). Sem redirecionamento nenhum, a app
    Android deixa de precisar do `@capacitor/browser` que a versão anterior
    usava.
  - **Verificação do pagamento**: nem `payment.id` (devolvido pelo SDK no
    `onSuccess`) nem os endpoints específicos (`/subscriptions/{id}`,
    `/frequent/{id}`) bateram certo de forma fiável em sandbox — a solução
    que funcionou é verificar pelo `id` do **checkout** em si
    (`GET /checkout/{id}`, devolvido pelo nosso próprio servidor ao criar o
    checkout), com fallback para `/single/{id}` quando necessário.
  - **Webhook não alcança `localhost`**: confirmado na prática — a EasyPay
    real não consegue entregar nenhum webhook a um servidor de
    desenvolvimento local. Criado `server/api/subscription/easypay/
confirm.post.ts`, chamado pelo client logo após o `onSuccess`, partilhando
    a mesma lógica idempotente do webhook (extraída para
    `server/utils/subscriptionSync.ts`) — necessário para conseguir testar
    minimamente sem expor a máquina local publicamente (túnel), e mantém-se
    útil como confirmação mais rápida mesmo depois de haver infraestrutura
    pública.
  - **Decisão de arquitetura importante (a pedido do utilizador, revê a
    especificação original desta fase)**: MB WAY e Multibanco passam a
    **pagamento único de um período fixo** (1/3/6/12 meses, sem renovação
    automática) em vez do desenho original de "cron mensal a disparar cada
    ciclo" — o utilizador identificou corretamente que nenhum dos dois
    métodos permite cobrança recorrente sem ação manual do cliente a cada
    ciclo, tornando o cron mensal desnecessariamente complexo. Removidos
    `server/api/subscription/easypay/cron/mbway.post.ts` e
    `.../cron/multibanco.post.ts` (sem deixar código morto), a função
    `captureFrequentPayment`/`getFrequentResource`/`createFrequentCheckout`
    (tokenização deixou de fazer sentido sem reutilização futura) e o campo
    `easypayFrequentPaymentId` do modelo. Novo endpoint
    `easypay/create-prepaid.post.ts` usa `type: ['single']` (não
    `'frequent'`) — mais simples e melhor documentado que o fluxo anterior.
  - **Botão "Verificar pagamento"** adicionado (`easypay/
check-payment.post.ts` + `checkPendingPayment()` em `subscriptionSync.ts`)
    para o utilizador confirmar manualmente um MB WAY/Multibanco `pending` —
    necessário para testar em dev local (sem webhook alcançável) e também
    útil em produção como atalho ("já paguei, confirma agora") sem esperar
    pelo webhook.
  - Bugs concretos corrigidos ao longo dos testes: schema do `POST /checkout`
    (faltava o `type` de nível superior como array — 412 "type: value is
    required"; valor tem de ir em `order`, não solto); `payment.sdd_mandate.
phone` obrigatório para DD (não documentado inicialmente); formulário
    próprio de DD (IBAN/titular/telefone) removido por duplicar o que o
    próprio checkout hospedado da EasyPay já pede — causava o utilizador
    preencher os dados duas vezes; `payment.status: 'pending'` é o resultado
    normal (não uma falha) tanto para Multibanco (sempre assíncrono) como
    para DD (mandato SEPA pode demorar dias) — a validação inicial rejeitava
    isto incorretamente; painel do checkout fechava-se antes do utilizador
    conseguir ler a entidade/referência Multibanco mostrada pela própria
    EasyPay — corrigido para só fechar depois de a confirmação terminar.
  - Números de teste da sandbox EasyPay (cartão, MB WAY, IBAN) documentados
    em `context/CONFIG-REFERENCE.md`.
  - Confirmado pelo utilizador: os quatro métodos testados e a funcionar
    (Cartão, DD, MB WAY, Multibanco, incluindo o botão "Verificar
    pagamento"). `npm run build` validado sem erros ao longo de toda a
    sessão (uma dezena de builds incrementais). Tarefa 10 (Android —
    inscrição no programa de pagamentos externos da Google) explicitamente
    deixada para mais tarde, por decisão do utilizador — a app já não
    precisa de sair do WebView para pagar (Checkout é inline), o que
    simplifica essa tarefa quando for feita, mas o pedido de inscrição em
    si continua por submeter.
- 2026-09-19: Branch `feature/fase-2-easypay-subscricoes` mergeado em `main`
  (merge commit) e removido. Estado passa a "Concluída". Por fazer antes de
  produção (não é bloqueador de código, ver "Notas"/critérios de aceitação
  acima): tarefa 10 (inscrição no programa de pagamentos externos da Google
  para a app Android) e configuração de um cron externo real para
  `check-expirations`. Bloqueador herdado da Fase 3 sobre
  `usesCleartextTraffic` continua pendente, sem relação com esta fase.
- 2026-09-19: A pedido do utilizador, desenhada uma nova fase — FASE 5
  (Digitalização de Documentos com IA: recibos/faturas via foto/PDF,
  pré-preenchimento automático de transações). Pedido inicial era
  "regista automaticamente"; após alertar para o risco de erros de IA em
  dados financeiros sem revisão humana, o utilizador confirmou o modelo
  pré-preencher + confirmar manualmente, e definiu a funcionalidade como
  exclusiva dos planos Pro e Premium. Viabilidade técnica (Claude Haiku 4.5
  com vision + PDF nativos + structured outputs, custo residual por
  documento) confirmada via a skill `claude-api` contra a documentação
  atual da Anthropic antes de escrever a especificação
  (`context/features/05-FASE-5-scan-documentos-ia.md`).
  Inserida antes da Internacionalização por pedido do utilizador — exigiu
  renumerar as três fases seguintes: Internacionalização 5→6, Segurança/
  Qualidade 6→7, Publicação 7→8 (ficheiros renomeados com `git mv`,
  referências cruzadas corrigidas em `00-CODE-SPEC.md`, `CONFIG-REFERENCE.md`
  e nos specs das Fases 1-4; aproveitado para corrigir também uma menção a
  "Stripe" desatualizada em `CONFIG-REFERENCE.md`, resíduo de antes da
  escolha do processador de pagamentos). Removidas as duas únicas menções a
  iOS no repositório (`README.md`, spec da Fase 4) — a pedido do utilizador,
  já que a app é só Android + Web. Definida como funcionalidade atual.
  Estado: não iniciada — nada disto foi commitado ainda (a pedido do
  utilizador, para commitar tudo junto no fim desta sessão).
- 2026-09-19: Branch `feature/fase-5-scan-documentos-ia` criado a partir de
  `main` (as alterações de documentação ainda por commitar da sessão anterior
  viajam no working tree, tal como pedido — commitar tudo junto). Estado passa
  a "Em progresso". Implementadas as tarefas 1-4 da especificação:
  - **Tarefa 1**: `documentScan: 'pro'` em `shared/features.ts`;
    `requireFeature(event, 'documentScan')` no endpoint. Novo limite
    `TIER_LIMITS.documentScansPerMonth` (Free 0, **Pro 30, Premium 100**) — a
    especificação pedia para confirmar o valor antes de implementar; usei
    estes como default razoável, ficam num só sítio para ajustar.
  - **Tarefa 2**: `server/utils/anthropic.ts` refatorado — o pedido HTTP
    passou a aceitar content blocks (texto/`image`/`document`) e devolve
    `usage`; `generateStructuredJson()` (Fase 3) mantém a mesma assinatura.
    Nova `extractDocumentData()`: schema fixo com `isReceipt`, campos
    nulláveis, `confidence` por campo e `suggestedCategory` como enum
    fechado das categorias do utilizador; prompt fixo PT-PT que trata o
    texto do documento como dados (não instruções). Schema usa só features
    documentadas como suportadas (`anyOf`, `enum`, `null`,
    `additionalProperties:false`).
  - **Tarefa 3**: `server/api/transactions/scan.post.ts` +
    `server/utils/documentScan.ts`. Multipart, tipo detetado por **magic
    bytes** (nunca pelo `Content-Type` do client), limites 5 MB imagem /
    8 MB PDF. **Desvio da especificação**: HEIC não é aceite — a API da
    Anthropic só suporta JPEG/PNG/GIF/WebP/PDF; o endpoint rejeita HEIC com
    mensagem clara (a câmara Android e o downscale do client já produzem
    JPEG). Nunca cria a transação. Datas inválidas → `null`; categoria só
    aceite se existir e for compatível com o tipo; moeda ≠ EUR sinalizada ao
    client. Rate limiting: contador mensal atómico (`DocumentScanUsage`),
    ficheiros inválidos não consomem quota, falha da Anthropic devolve-a.
    Regista `usage` e custo estimado por documento no log do servidor
    (`[scan] ... ≈ $`).
  - **Tarefa 4**: `@capacitor/camera@8.2.4` instalado e sincronizado
    (`cap sync android`); `composables/useDocumentScan.ts` (câmara nativa
    via import dinâmico, downscale client-side a 2000px/JPEG para respeitar
    o limite de 5 MB); `components/forms/DocumentScanButton.vue` (botão
    "Digitalizar documento" sempre visível, escolha câmara/ficheiro no
    Android, estado de carregamento, diálogo de erro com "Preencher
    manualmente", `PaywallModal` para Free) inserido no dashboard e em
    `/transactions`; `TransactionModal` ganhou a prop `prefill` — banner
    "lido por IA, confirma antes de guardar", campos `low` a âmbar (o realce
    some quando o utilizador edita o campo), aviso se a moeda não for EUR.
  - **Validado** (dev server contra a BD e a API reais): Free → `403
feature_locked` no endpoint; ficheiro em falta 400; ficheiro de texto
    disfarçado de `.jpg` 415; HEIC 415; imagem >5 MB 413; sem sessão 401;
    teto mensal → `429 scan_limit_reached` sem ultrapassar o teto; falha
    da Anthropic → 502 e quota reembolsada. `npm run build` sem erros;
    `gradlew assembleDebug` Android com o plugin da câmara →
    `BUILD SUCCESSFUL`; `/` e `/transactions` renderizam 200 sem erros no
    log. Dados de teste na BD limpos no fim.
  - **NÃO validado / bloqueado**: a conta Anthropic da chave em `.env`
    respondeu `Your credit balance is too low` — **a extração real nunca
    correu**. Ficam por verificar, depois de carregar créditos: o schema
    aceite pela API ao vivo, a qualidade da extração, o caminho
    `isReceipt:false` → 422, o mapeamento de categoria, e a medição do
    custo real por documento (critério de aceitação). Também por fazer: teste
    com recibos/faturas portugueses reais (só havia documentos sintéticos
    gerados para testes — `receipt.png`/`invoice.pdf`/imagem não-recibo no
    scratchpad da sessão, não versionados); teste da câmara num telemóvel
    Android real; teste visual do fluxo completo num browser (não havia
    ferramenta de browser nesta sessão — só smoke test de SSR).
  - **Problema pré-existente descoberto** (não corrigido, fora de âmbito):
    a criação automática de índices do Mongoose **não funciona** neste
    projeto (`server/plugins/mongoose.ts` liga com `bufferCommands: false`
    depois de os modelos estarem compilados). As coleções `marketsnapshots` e
    `aiinsightcaches` da Fase 3 só têm o índice `_id` — os índices
    `unique` declarados nos schemas (`MarketSnapshot.date`,
    `AiInsightCache.userId`) não existem, logo a unicidade que o código
    assume não é garantida (risco de duplicados em pedidos concorrentes).
    Esta fase contornou-o com `_id` determinístico (`userId:YYYY-MM`) em
    `DocumentScanUsage`. Recomendo tratar à parte (ex. `Model.syncIndexes()`
    depois de ligar, ou um script de migração).
  - Lembrete herdado (continua pendente): `usesCleartextTraffic="true"` no
    `AndroidManifest.xml` tem de voltar a `"false"` antes de produção.
- 2026-09-20: Relato do utilizador — "arranque da app muito lento" + avisos de
  hidratação no browser. Diagnóstico e correções:
  - **Causa da lentidão**: o watcher do Nuxt regenera a app a cada ficheiro
    criado/apagado no projeto; `gradlew assembleDebug` e `cap sync` (corridos
    para validar o plugin da câmara) mexem em milhares de ficheiros em
    `android/` e deixaram o dev server em ciclo de recompilações. Corrigido
    com `ignore: ['android/**']` em `nuxt.config.ts` — vale para qualquer
    build Android futuro. (O arranque a frio do dev server continua a ser
    lento por natureza: ~2 min no 1.º pedido após reiniciar, Vite a
    transformar tfjs/chart.js — não é regressão desta fase.)
  - **Regressão minha (hidratação)**: `DocumentScanButton` tinha um
    `<Teleport to="body">` sempre presente; renderizado no SSR, o Vue tentava
    hidratá-lo contra os filhos do `<body>` ("Hydration node mismatch").
    Agora o Teleport só existe quando há modal a mostrar (`v-if`).
  - **Erro de fornecedor exposto ao utilizador**: um 502 da Anthropic
    (ex. saldo insuficiente) chegava ao diálogo do client com o JSON cru.
    `scan.post.ts` regista o detalhe no log e devolve uma mensagem genérica
    (`upstream_error`).
  - **Avisos de hidratação anteriores a esta fase, não corrigidos**:
    `ToastContainer` (também tem `<Teleport to="body">` sempre presente) e o
    nome do utilizador/avatar ("Utilizador"/vazio no SSR vs. "Dinis"/"D" no
    client — o middleware só verifica o cookie em SSR, a sessão só é lida no
    client). Inofensivos mas geram ruído; candidatos a Fase 7 (Qualidade).
  - **Teste no telemóvel Android real** (APK debug → dev server local via
    `adb reverse tcp:3100`): o utilizador confirmou que funciona bem. Sem
    créditos na conta Anthropic, o que ficou exercitado foi o fluxo até à
    chamada à IA (botão, câmara/ficheiro, carregamento, mensagem de erro); a
    extração real e o pré-preenchimento com dados lidos continuam por validar.
- 2026-09-20: README atualizado com a funcionalidade (tabela de funcionalidades,
  variáveis de ambiente, estrutura de pastas, secção "Digitalizar documentos
  com IA" e nota sobre permissões Android — o manifesto final só pede
  `INTERNET`, a câmara usa a app do sistema). Branch
  `feature/fase-5-scan-documentos-ia` mergeado em `main` (merge commit) e
  removido. Estado passa a "Concluída", a pedido do utilizador.
  **Fechada com validações em aberto** (não foram feitas, não assumir que
  estão): (1) a extração real nunca correu — a conta Anthropic não tinha
  créditos; (2) nenhum recibo/fatura português real foi testado; (3) o custo
  por documento não foi medido (o servidor regista-o em `[scan] ... ≈ $`);
  (4) os tetos mensais Pro 30 / Premium 100 são um default meu, por
  confirmar. Os critérios de aceitação correspondentes ficam por marcar em
  `context/features/05-FASE-5-scan-documentos-ia.md`. Pendências
  transversais: `usesCleartextTraffic="true"` no `AndroidManifest.xml` (voltar
  a `"false"` antes de produção), índices `unique` do Mongoose que não são
  criados (`marketsnapshots`, `aiinsightcaches`), e a Fase 6 tem uma secção
  nova sobre documentos estrangeiros (moeda, formato de datas, recibos de
  vencimento, privacidade). Próxima fase: 6 — Internacionalização.
- 2026-09-20: Validação com créditos Anthropic já carregados. O utilizador testou
  recibos reais e validou o formulário pré-preenchido, **sem guardar** (é o
  fluxo pretendido: a IA só pré-preenche). Evidência: contador mensal com 2
  documentos processados e **0 transações criadas** na conta — confirma o
  critério "nenhuma transação sem confirmação". Custo medido no log do
  servidor: JPEG de 369 KB → 3311 tokens de entrada + 85 de saída ≈
  $0,0037 (~0,35 € por 100 documentos), residual como previsto. Critérios
  da especificação marcados: custo e não-gravação. **Continuam por marcar**:
  correção dos campos com uma amostra variada (só 2 documentos, variedade
  não registada — papel térmico, PDF, fatura eletrónica), documento que não é
  recibo → erro claro sem formulário, e realce âmbar dos campos de baixa
  confiança (o utilizador não reportou nenhum destes). O log de custo só tem
  1 dos 2 documentos (o outro foi processado noutro servidor).
- 2026-09-21: A pedido do utilizador, desenhada uma nova fase — FASE 6
  (Registo de Investimentos: portfolio pessoal dentro de `/investimento`, com o
  modelo de uma folha de Excel que o utilizador já usa — Portfolio, Inicial,
  Data, Reforço, Situação e % calculada), especificação em
  `context/features/06-FASE-6-registo-investimentos.md`. O utilizador pediu que
  ficasse na zona de investimentos, depois do preenchimento do perfil de
  investidor, e organizada de forma a encaixar com a IA. A fórmula da `%` foi
  deduzida e verificada contra as duas linhas da folha. Decisões de desenho: a
  `%` é sempre derivada (nunca guardada), `Reforço` fica como total acumulado,
  o registo é separado das transações, e a IA só recebe agregados (nunca nomes
  de posições) — a parte da IA fica atrás de uma flag até haver validação
  jurídica, por se aproximar de aconselhamento personalizado. Também se
  observou que a página `/investimento` chama hoje a Anthropic em cada visita;
  passa a ser só por botão, com cache. Ficaram pontos por confirmar com o
  utilizador (plano — Premium por omissão com chave própria
  `investmentTracker`, significado da coluna "Data", campo opcional de classe
  de ativo, vender/encerrar, downgrade, validação jurídica).
  Inserida antes da Internacionalização — exigiu renumerar as três fases
  seguintes: Internacionalização 6→7, Segurança/Qualidade 7→8, Publicação 8→9
  (ficheiros renomeados com `git mv`, referências cruzadas corrigidas em
  `00-CODE-SPEC.md`, `CONFIG-REFERENCE.md`, `AGENT-RULES.md`, `README.md`, num
  comentário de `server/utils/anthropic.ts` e nos specs das Fases 1 a 5;
  aproveitado para corrigir números de fase que já estavam desatualizados de
  renumerações anteriores no `AGENT-RULES.md` e na tabela de tecnologias do
  `00-CODE-SPEC.md`). Definida como funcionalidade atual. Estado: não iniciada
  — nada disto foi commitado ainda.
- 2026-09-21: Branch `feature/fase-6-registo-investimentos` criado a partir de
  `main` (as alterações de documentação da sessão anterior viajam no working
  tree, por commitar). Estado passa a "Em progresso". Implementadas as 6
  tarefas da especificação, com os valores por omissão da secção "A confirmar"
  (o utilizador pediu para implementar sem essas confirmações):
  - **Tarefa 1**: `investmentTracker: 'premium'` em `shared/features.ts` (chave
    própria, separada de `aiInvestmentTips`); `requireFeature('investmentTracker')`
    em todos os endpoints novos.
  - **Tarefa 2**: modelo `Investment` e `InvestmentTipsCache`
    (`server/models/index.ts`); `shared/portfolio.ts` com o cálculo puro
    (`returnPct`, `summarizePortfolio` sobre totais). `valueUpdatedAt` só muda
    quando a `Situação` muda de facto.
  - **Tarefa 3**: `server/api/investments/index.ts` (GET lista+resumo, POST) e
    `[id].ts` (PUT parcial, DELETE), com validação manual em
    `server/utils/investments.ts`; teto fixo de 100 posições; id de outro
    utilizador → 404.
  - **Tarefa 4**: `useInvestments`, `InvestmentModal` (pré-visualização da
    rentabilidade ao vivo, situação pré-preenchida com inicial+reforço) e
    `InvestmentQuickModal` ("Reforçar" soma ao total, "Atualizar situação");
    `formatReturnPct` e `formatSignedCurrency` em `useFormatters`.
  - **Tarefa 5**: `pages/investimento/index.vue` reestruturada como hub por
    estado (loading / paywall / sem perfil / hub, com aviso se o perfil expirou),
    `PortfolioTable` (colunas da folha em ecrãs largos, cartões em mobile),
    `InvestmentSummary`, estado vazio, indicador de situação desatualizada
    (> 30 dias). A página deixou de chamar a Anthropic ao abrir.
  - **Tarefa 6**: `server/utils/portfolio.ts` (`portfolioSummaryForAi`, só
    agregados), `server/utils/investmentTips.ts` (contexto, cache por
    `inputHash` + 24 h, prompt com adenda só quando o portfolio entra),
    `investment.post.ts` reduzido a uma chamada, novo `investment.get.ts` (lê a
    cache sem chamar a Anthropic), `InvestmentTipsCard`, flag
    `INVESTMENT_TIPS_INCLUDE_PORTFOLIO` (desligada por omissão; documentada em
    `CONFIG-REFERENCE.md`, `README.md` e `.env.example`).
  - **Desvios da especificação** (registados na secção "Notas de implementação"
    do ficheiro da fase): `KpiCard` não reutilizado (mostra valores compactos),
    endpoint `GET /api/insights/investment` acrescentado, regra da cache
    interpretada como hash igual **e** < 24 h, e as dicas da Fase 3 passam a ter
    cache mesmo com a flag desligada.
  - **Validado** (dev server contra a BD real, com 3 utilizadores temporários
    criados e apagados no fim — nada foi escrito na conta real): 403 a Free em
    todos os endpoints; 401 sem sessão; CRUD e validação (nome, valores,
    datas, classe, arredondamento a 2 casas); reprodução exata da folha
    (1,94% / −2,00%; resumo 1 080 € → 1 099 €, 1,76%); a BD crua só guarda
    inicial/reforço/situação (sem `%`); isolamento entre utilizadores (404);
    teto de 100 posições; regras de `valueUpdatedAt`. UI num Edge headless
    (`puppeteer-core` fora do projeto) a 1440 px e 390 px: tabela vs. cartões,
    sem scroll horizontal, modal com pré-visualização, criar/reforçar/atualizar
    situação/editar/eliminar pela UI (com acentos), sem perfil → pede o perfil,
    Free → paywall, perfil expirado → portfolio visível e dicas bloqueadas,
    badge "Desatualizada". Payloads à Anthropic capturados: sem flag = Fase 3;
    com flag só agregados (sem nomes, valores por posição nem datas).
    `npm run build` sem erros.
  - **NÃO validado / bloqueado**: a conta Anthropic voltou a estar **sem
    créditos** (`credit balance is too low`), por isso a geração real nunca
    correu — a lógica de cache e os payloads foram testados com uma resposta da
    Anthropic **simulada** (hook de `fetch` só no scratchpad, fora do repo).
    Ficam por verificar: a qualidade das dicas com portfolio (nunca nomear
    ativos, nunca comprar/vender/reequilibrar — revisão manual de amostras
    reais), a medição do custo por geração, o regresso ao hub depois de guardar
    o questionário de perfil, tablet/ultra-wide e um dispositivo Android real.
  - **Pendências de decisão** (secção "A confirmar" da especificação): plano
    do registo (Premium por omissão), significado da coluna "Data", campo
    `assetClass`, vender/encerrar, comportamento no downgrade, e validação
    jurídica antes de ligar a flag em produção.
  - **Achados pré-existentes** (ambos corrigidos na entrada seguinte): o aviso "Hydration
    completed but contains mismatches" aparece igual em `/transactions` e
    `/groups`; e, quando o Nitro recarrega a quente no dev server, os primeiros
    pedidos podem dar 500 `Cannot call users.findOne() before initial connection
is complete if bufferCommands = false` (`server/plugins/mongoose.ts` liga
    sem esperar). Candidatos a Fase 8 (Qualidade).
- 2026-09-21: Correções e verificações pedidas a seguir à implementação
  ("corrige o que for necessário"):
  - **Corrigido — 500 a frio do MongoDB** (achado pré-existente, que rebentou
    duas vezes durante os testes): o Nitro chama os plugins **sem `await`**
    (`nitropack/.../app.mjs`), por isso o `await mongoose.connect()` de
    `server/plugins/mongoose.ts` nunca bloqueou pedidos; com `bufferCommands:
false`, um pedido `/api` que chegasse antes da ligação dava 500 (`Cannot call
users.findOne() before initial connection is complete`) — também em produção,
    logo após um deploy. Nova ligação partilhada e memorizada
    `server/utils/db.ts` (`ensureDb()`, volta a ligar se a ligação caiu) e novo
    `server/middleware/00-db.ts` que a espera antes de cada rota `/api`; o plugin
    passou a só iniciar a ligação ao arrancar (e já não deixa uma rejeição por
    tratar). Verificado: 45 pedidos durante um reload a quente do Nitro, todos
    200, nenhum com erro de ligação.
  - **Corrigido — aviso de hidratação** (`Hydration completed but contains
mismatches`, pré-existente, em todas as páginas): a causa era o
    `<Teleport to="body">` do `ToastContainer` renderizado no SSR (o
    "nome do utilizador" apontado antes como 2.ª causa não contribuía — o
    `auth.user` é nulo nos dois lados à hidratação). Envolvido em `<ClientOnly>`.
    Verificado: 0 avisos em `/transactions`, `/groups` e `/investimento` (antes
    1 em cada).
  - **Verificado, sem alterações de código**: guardar o questionário de perfil
    volta ao hub; tablet (820 px) e ultra-wide (2560 px) sem scroll horizontal;
    gating das Fases 2 e 3 sem regressões (Free 403, Premium 200). Critérios
    correspondentes marcados em `06-FASE-6-registo-investimentos.md`.
  - Continua por fazer, e não depende de código: créditos na conta Anthropic para
    medir o custo e rever amostras reais de dicas com portfolio; confirmação dos
    pontos "A confirmar"; validação jurídica antes de ligar
    `INVESTMENT_TIPS_INCLUDE_PORTFOLIO`; teste num Android real.
  - **Continua por corrigir, fora desta fase**: `requireAuth`
    (`server/utils/auth.ts`) autentica pelo cookie `userId` **ou pelo header
    `x-user-id`**, ambos com o `_id` em claro e sem assinatura — qualquer pessoa
    que conheça (ou adivinhe) um `_id` pode agir como esse utilizador. Foi útil
    para testar, mas tem de ser resolvido antes de produção (a tarefa 2 da Fase 8
    fala de cookies de sessão seguros; convém lá incluir explicitamente a
    assinatura da sessão e a remoção do header).
- 2026-09-22: A pedido do utilizador, decidida a opção de deixar as dicas com
  portfolio desligadas por agora (`INVESTMENT_TIPS_INCLUDE_PORTFOLIO=false`, o
  valor por omissão) — o registo de investimentos e as dicas genéricas da Fase 3
  ficam como estão; a leitura da carteira pela IA só se liga depois de validação
  jurídica (explicada ao utilizador: é uma precaução herdada da decisão
  regulatória 4 da Fase 3, não uma conclusão legal). App Android instalada e
  aberta num telemóvel físico (USB + `adb reverse tcp:3100`, APK de debug
  existente, sem recompilar) a apontar para o dev server local; carregou sem
  erros de ligação. Nesse log apareceu um aviso de hidratação num `<span>` de
  texto que não aparece no browser de desktop — origem por identificar
  (suspeita: texto dependente da hora/fuso, como a data do topo), inofensivo e
  fora desta feature. O utilizador não reportou problemas antes de pedir o merge.
  Ficaram 3 commits no branch: renumeração das fases (`15622ca`), correções da
  corrida de ligação ao MongoDB e da hidratação do `ToastContainer` (`e09bed4`) e
  a feature (`21842bd`). Branch mergeado em `main` (merge commit) e removido.
  Estado passa a "Concluída", a pedido do utilizador.
  **Fechada com validações em aberto** (não foram feitas, não assumir que
  estão): (1) a geração real de dicas com portfolio nunca correu — a conta
  Anthropic estava sem créditos, a lógica de cache e os payloads só foram
  testados com uma resposta simulada; (2) por isso, as dicas geradas com
  portfolio nunca foram revistas quanto a nomear ativos ou dizer
  comprar/vender/reequilibrar, e o custo por geração não foi medido; (3) o teste
  num telemóvel Android foi só abrir e carregar — sem resultados detalhados do
  fluxo (criar, reforçar, eliminar, teclado, toque nos botões pequenos); (4) os
  pontos "A confirmar" da especificação seguem por confirmar (plano — Premium por
  omissão, significado da coluna "Data", campo `assetClass`, vender/encerrar,
  comportamento no downgrade); (5) validação jurídica antes de ligar a flag em
  produção. Os critérios correspondentes ficam por marcar em
  `context/features/06-FASE-6-registo-investimentos.md`. Pendências
  transversais: `usesCleartextTraffic="true"` no `AndroidManifest.xml` (voltar a
  `"false"` antes de produção); índices `unique` do Mongoose que não são
  criados (`marketsnapshots`, `aiinsightcaches`); e `requireAuth` autentica pelo
  cookie `userId` ou pelo header `x-user-id` em claro, sem assinatura (a resolver
  na Fase 8). Próxima fase: 7 — Internacionalização (a secção 6 dessa fase trata
  ainda os documentos estrangeiros da Fase 5; as strings novas de
  `/investimento` entram na auditoria de extração).
- 2026-09-22: Documentação atualizada a pedido do utilizador, depois do merge da
  Fase 6 (sem alterações de código):
  - `README.md`: estrutura de pastas (API `investments/`, `investment.get`, modelos
    `Investment`/`InvestmentTipsCache`, `middleware/00-db.ts`, `utils/db.ts`,
    `investments.ts`, `portfolio.ts`, `investmentTips.ts`, `shared/portfolio.ts`),
    secção "Insights com IA" (dicas por botão, com cache), nota sobre o `GET` que
    lê a cache, uma limitação conhecida de autenticação (cookie/header `x-user-id`
    sem assinatura) e notas práticas do teste por USB (`adb -s` com vários
    dispositivos, porta do `adb reverse`, quando não é preciso recompilar).
  - `context/00-CODE-SPEC.md`: a matriz de features passa a incluir as
    funcionalidades das Fases 3, 5 e 6 (que só existiam em `shared/features.ts`),
    com a indicação de que o código prevalece em caso de divergência.
  - `03-FASE-3-insights-ia.md`: nota a explicar o que a Fase 6 mudou na tarefa 5
    (página como hub, dicas por botão, cache, lógica em `investmentTips.ts`).
  - `07-FASE-7-internacionalizacao.md`: passam a estar na auditoria de extração o
    registo de investimentos, os formatadores novos (`formatReturnPct`,
    `formatSignedCurrency`, que fixam `pt-PT`) e o texto de servidor da Fase 6, com
    o disclaimer legal a exigir revisão jurídica por idioma.
  - `08-FASE-8-seguranca-qualidade.md`: acrescentados os achados desta fase que
    ainda estavam só no histórico — sessão sem assinatura e autenticação por header
    `x-user-id` (crítico), detalhe de erros da Anthropic exposto ao client, índices
    do Mongoose nunca criados, aviso de hidratação no Android, e os testes
    pedidos para `shared/portfolio.ts`, `/api/investments`, cache das dicas e o
    middleware da BD; mais dois critérios de aceitação.
  - `09-FASE-9-publicacao.md`: o bloqueador `usesCleartextTraffic="true"` (que só
    estava no README e neste ficheiro) passa a ser uma tarefa da fase; corrigida a
    referência à política de privacidade (é da Fase 8, não da 4); nova secção de
    pré-condições (flag `INVESTMENT_TIPS_INCLUDE_PORTFOLIO` desligada sem validação
    jurídica, conta Anthropic com créditos e limite de gasto).
  - `context/CONFIG-REFERENCE.md` e `.claude/agents/AGENT-RULES.md`: checklist de
    deploy com a flag e o cleartext; regra de nunca enviar nomes/valores por
    posição do portfolio à Anthropic e de nunca devolver ao client o corpo de
    erros de fornecedores externos.
- 2026-09-22: Definida como funcionalidade atual — FASE 7 (Internacionalização:
  idiomas + métodos de pagamento por país), especificação em
  `context/features/07-FASE-7-internacionalizacao.md`. Estado inicial: não
  iniciada.
- 2026-09-22: Branch `feature/fase-7-internacionalizacao` criado a partir de
  `main`. Estado passa a "Em progresso". Antes de implementar, confirmadas com
  o utilizador as 3 decisões em aberto da tarefa 6 (documentos internacionais,
  ver `05-FASE-5-scan-documentos-ia.md`): moeda estrangeira → guardar a moeda
  original (não converter só internamente); recibos de vencimento → entram no
  âmbito desta fase; privacidade → pedir consentimento explícito antes do
  envio à Anthropic. Implementadas as tarefas 1, 3 e 4 por completo, a tarefa
  2 só na prioridade 1, e a tarefa 6 com as 3 decisões acima — ver checklist
  detalhado marcado em `07-FASE-7-internacionalizacao.md`.
  - **Tarefa 1 (infraestrutura i18n)**: `@nuxtjs/i18n` instalado
    (`strategy: 'no_prefix'` — a app não tem nem precisa de rotas
    `/en/...`, é só uma preferência de interface); `detectBrowserLanguage`
    com cookie `financeflow_locale` deteta o `Accept-Language` uma vez e
    nunca mais volta a detetar depois de uma escolha manual (mesmo cookie
    escrito por `setLocale()`). `i18n/locales/{pt-PT,en,fr,de,it,es}.json`
    com namespaces `common`/`nav`/`auth`/`dashboard`/`settings`. Novo
    `composables/useLocaleFormat.ts` mapeia o locale ativo para o locale do
    date-fns e para a string `Intl` — `useFormatters` inteiro passa a segui-
    lo (datas, `formatReturnPct`, `formatSignedCurrency` da Fase 6 incluídos,
    já não fixam `pt-PT`). Seletor de idioma novo em
    `pages/settings/index.vue`.
  - **Tarefa 2 (extração de strings)**: só a prioridade 1 da especificação —
    autenticação (`pages/login.vue`) e dashboard (`pages/index.vue`,
    `layouts/default.vue`, `components/layout/MobileNav.vue`). O resto do
    código (transações, grupos, estatísticas, previsões, subscrição,
    investimento, texto de servidor) continua com strings PT-PT hardcoded —
    funciona, mas não muda de idioma. Fica para sessões seguintes, com a
    estrutura de namespaces já pronta para continuar.
  - **Tarefa 3 (geolocalização)**: `server/utils/geo.ts` com
    `@maxmind/geoip2-node` sobre um ficheiro `GeoLite2-Country.mmdb` local
    (licenciado, fora do repositório, caminho em `GEOLITE2_DB_PATH`); sem o
    ficheiro configurado devolve sempre país desconhecido, nunca assume
    Portugal. Processo de obtenção/atualização documentado no topo do
    ficheiro e em `CONFIG-REFERENCE.md`.
  - **Tarefa 4 (pagamento por país)**: `shared/paymentMethods.ts` (tabela
    país → métodos, só `PT: ['mbway', 'multibanco']`);
    `create-prepaid.post.ts` valida o país no servidor (nunca confia na UI);
    novo `GET /api/subscription/payment-methods` para o client saber que
    separador mostrar; `pages/subscription/index.vue` esconde MB
    WAY/Multibanco quando o país não os tem. **Efeito colateral
    importante**: sem `GEOLITE2_DB_PATH` configurado (nunca configurado
    ainda), o país fica sempre desconhecido e o servidor passa a rejeitar
    (403) qualquer pedido MB WAY/Multibanco — mesmo a partir de Portugal.
    Confirmado neste teste (ver abaixo): antes de voltar a testar/usar
    MB WAY/Multibanco (herdados da Fase 2, já validados em sandbox), é
    preciso configurar a geolocalização.
  - **Tarefa 6 (documentos internacionais)**: modelo `Transaction` ganhou
    `currency`/`originalAmount`/`exchangeRate` — desvio deliberado face à
    opção B escolhida pelo utilizador, explicado para não voltar a ser visto
    como erro: `amount` continua a ser **sempre** o equivalente em €
    (capturado no momento da transação via `server/utils/exchangeRates.ts`,
    Twelve Data `/exchange_rate`), para que todas as agregações existentes
    (KPIs, estatísticas, orçamentos, previsões, CSV) continuem a somar um
    único valor em € sem nenhuma alteração; `currency`/`originalAmount`
    preservam o valor tal como no documento, mostrado ao lado nas listagens
    e no formulário. Sem taxa disponível, a transação falha com `422` em vez
    de gravar um valor não convertido. Prompt de extração
    (`server/utils/anthropic.ts`) passou a: seguir o idioma ativo da UI (lido
    do cookie `financeflow_locale` em `scan.post.ts`), marcar
    `confidence.date: 'low'` em datas ambíguas (dia/mês ambos ≤ 12 sem
    indicação clara) em vez de assumir uma ordem, e reconhecer recibos de
    vencimento (`documentType: 'payslip'`, `grossAmount`/`deductions`,
    `amount` = líquido) — resumo mostrado no `TransactionModal`.
    Consentimento explícito antes do 1.º envio adicionado a
    `DocumentScanButton.vue` (guardado em `localStorage`, pede menção a NIF/
    morada/salário num recibo de vencimento).
  - **Não feito**: tarefa 5 (Android) — precisa de um dispositivo real, não
    disponível nesta sessão.
  - **Validado** nesta sessão (dev server local, sem dispositivo Android):
    `npm run build` e `npm run type-check` ficaram muito lentos neste
    ambiente (o típecheck aponta várias dezenas de erros, mas são quase
    todos pré-existentes — `typescript.typeCheck: false` no `nuxt.config.ts`
    significa que o build real nunca os verifica; só um era meu, corrigido).
    O `npm run build` de produção nunca chegou a terminar num tempo
    razoável (ficou preso ~11 min a "transforming" com CPU ativa, possível
    interação lenta disco/antivírus deste ambiente com o preset detetado
    automaticamente `netlify-legacy`, não o `node-server` real de produção)
    — abortado e substituído por `npm run dev` + `curl`, que é como as fases
    anteriores já validavam. Nesse processo, uma limpeza de
    `node_modules/.cache`/`.nuxt` foi necessária depois de um erro `EPERM`
    do Windows a renomear a cache do Vite (ficheiro preso por um processo
    anterior) — depois disso o dev server arrancou normalmente (~1min de
    arranque a frio, mais lento que o habitual por ser a 1.ª vez com os 2
    pacotes novos, depois rápido). Com o dev server a correr: `/`,
    `/settings`, `/subscription`, `/transactions`, `/groups`, `/stats`,
    `/predictions`, `/investimento` devolvem `302` para `/login` sem sessão
    (sem erro 500); `/login` devolve `200`. Idioma confirmado
    ponta-a-ponta: `Accept-Language: pt-PT` → página em português
    ("Entra na tua conta"), cookie `financeflow_locale=pt-PT` escrito;
    `Accept-Language: ja` (não suportado) → cai em inglês ("Sign in"); sem
    header → inglês (fallback). `GET /api/subscription/payment-methods` com
    sessão → `200 { country: null, prepaidMethods: [] }`; sem sessão →
    `401`. `POST /api/subscription/easypay/create-prepaid` com `mbway` e
    sem geolocalização configurada → `403` (confirma o efeito colateral
    acima). Nenhum erro 500 nem aviso novo no log do servidor durante os
    testes.
  - **NÃO validado / por fazer**: extração de strings além da prioridade 1
    (tarefa 2, a maior parte do trabalho mecanicamente grande); tradução
    revista por um humano/falante nativo (feita só pelo modelo nesta
    sessão); base de dados GeoLite2 real (`.mmdb`) nunca obtida nem testada;
    câmbio real via Twelve Data nunca chamado (não confirmado se o plano
    gratuito cobre pares forex); recibos de vencimento e datas ambíguas
    nunca testados com documentos reais; teste em dispositivo Android real
    (tarefa 5); texto de servidor da Fase 6 (`shared/portfolio.ts`,
    `investmentTips.ts`, incluindo o disclaimer que precisa de revisão
    jurídica por idioma) continua por extrair.
- 2026-09-22: Bug real reportado pelo utilizador logo a seguir (config do
  `GEOLITE2_DB_PATH` real, ver "Notas" abaixo): depois de entrar
  (`pages/login.vue`), a app ficava presa no login, sem navegar para o
  dashboard. Causa: `detectBrowserLanguage.redirectOn: 'root'` do
  `@nuxtjs/i18n` corre sempre que a app chega a `/` — mas um utilizador não
  autenticado nunca chega lá (`middleware/auth.global.ts` intercepta e
  manda logo para `/login`), por isso a 1.ª vez que `/` era mesmo visitado
  era já do lado do client, logo a seguir ao login (`navigateTo('/')`), e o
  redireciono embutido do módulo entrava em conflito com essa navegação —
  mesmo sem nenhum URL diferente para onde ir (`strategy: 'no_prefix'` não
  tem rotas por idioma). Corrigido: `detectBrowserLanguage` desligado por
  completo em `nuxt.config.ts`; deteção e persistência do idioma passam a
  ser feitas à mão num novo `plugins/locale.ts` (lê o cookie
  `financeflow_locale`, ou deteta o `Accept-Language`/`navigator.languages`
  na ausência dele, sem nunca chamar nenhum mecanismo de navegação — só
  `setLocale()`); `pages/settings/index.vue` passa a escrever o mesmo
  cookie explicitamente em vez de depender do módulo. Na primeira tentativa
  do plugin, `useI18n()` dentro de um plugin (fora de um `setup()` de
  componente) rebentava com "Must be called at the top of a `setup`
  function" — corrigido usando `nuxtApp.$i18n` (a mesma instância global,
  sem essa restrição) em vez da composable. Validado com o dev server:
  `/login` volta a `200` (tinha ficado `500` a meio da correção, por causa
  do erro do `useI18n()` acima); com uma conta de teste registada e
  apagada no fim, `GET /` com o cookie de sessão devolve `200` com o
  dashboard completo (antes só validado o lado do servidor até ao login,
  nunca o `/` autenticado); deteção de idioma continua a funcionar
  (`Accept-Language: pt-PT` → página em português, cookie escrito). **Não
  foi possível confirmar visualmente no browser real** (sem ferramenta de
  browser disponível nesta sessão) que o clique em "Entrar" navega mesmo
  para o dashboard — só o lado do servidor foi validado com `curl`; pedir
  ao utilizador para confirmar no browser antes de dar como fechado.
- 2026-09-22: O utilizador reparou que a página de Configurações continuava
  em PT-PT depois de mudar o idioma — confirmado: só a prioridade 1
  (autenticação/dashboard) tinha sido extraída, exatamente como já estava
  documentado. A pedido do utilizador ("avança"), extraída a prioridade 2 da
  tarefa 2 (transações/categorias/grupos):
  `pages/transactions/index.vue`, `pages/groups/index.vue`,
  `pages/settings/index.vue` inteira (Perfil, Idioma, Subscrição,
  Categorias), `components/forms/TransactionModal.vue` e
  `components/ui/TransactionRow.vue` — cerca de 160 novas chaves em
  `common`/`settings`/`transactionModal`/`transactions`/`groups`, traduzidas
  para as 6 línguas (qualidade não revista por um humano/falante nativo,
  como já assinalado para a prioridade 1). Cuidado tomado com variáveis de
  loop chamadas `t` em vários sítios (`v-for="t in ..."`, parâmetros de
  função `t`) que sombreavam o `t()` do i18n — renomeadas onde precisavam de
  chamar `t()` dentro do mesmo âmbito.
  **Validado** com o dev server local (registo e eliminação de uma conta de
  teste no fim): `/transactions`, `/groups` e `/settings` autenticadas
  devolvem `200` em inglês (por omissão) e em português
  (`Accept-Language: pt-PT`), com o texto esperado em cada idioma e sem
  nenhuma chave em bruto (`transactions.xxx` etc.) a aparecer no HTML —
  script de verificação automática confirmou que as 6 línguas têm
  exatamente o mesmo conjunto de 284 chaves (sem chaves em falta nem a
  mais). **Não testado no browser real** (sem essa ferramenta disponível).
  Continuam por fazer as prioridades 3 a 6 da tarefa 2 (subscrição/checkout,
  previsões/insights de IA, investimento, resto — incluindo texto de
  servidor).
- 2026-09-22: O utilizador reparou que a zona de Investimento (Fase 6)
  continuava em PT-PT. Confirmado que era esperado — é a prioridade 5, ainda
  por fazer — e extraída de imediato, fora da ordem original (3 e 4 ainda
  não feitas), a pedido implícito do utilizador ao testar exatamente essa
  área: `pages/investimento/index.vue`, `pages/investimento/perfil.vue`,
  `components/investment/PortfolioTable.vue`,
  `components/investment/InvestmentSummary.vue`,
  `components/investment/InvestmentQuickModal.vue`,
  `components/forms/InvestmentModal.vue` e
  `components/insights/InvestmentTipsCard.vue` — 125 novas chaves no
  namespace `investment` (`assetClass`/`hub`/`profile`/`table`/`summary`/
  `modal`/`quickModal`/`tips`), traduzidas para as 6 línguas.
  **Desvios registados**:
  - Os rótulos de classe de ativo (ETF, Ação, Obrigações...) deixaram de vir
    de `ASSET_CLASS_LABEL` (`shared/portfolio.ts`) nos dois componentes
    cliente que os mostravam — esse ficheiro é partilhado com o
    servidor/prompt da IA e não foi tocado, continua fixo em PT-PT aí (é
    português mesmo estando "correto" porque as dicas da Fase 3/6 ainda são
    sempre geradas em PT-PT, independentemente do idioma da UI — trabalho
    ainda não feito, texto de servidor da Fase 6/tarefa 6 da Fase 7).
  - `perfil.vue`: os "Objetivos" do perfil de investidor (`form.goals`)
    passaram de guardar o texto visível em PT-PT (ex. `"Reforma"`) para um
    identificador estável (`"retirement"`) — o servidor nunca validou isto
    contra uma lista fixa (só aceita qualquer array de strings), por isso
    não quebra nada; perfis já gravados com o texto antigo só deixam de
    aparecer pré-selecionados ao reabrir o formulário, até o utilizador
    voltar a guardar.
  - Uma frase com "Reforço: X → Y" (`InvestmentQuickModal.vue`) foi
    reestruturada — separada em rótulo + valor em vez de uma frase única com
    dois placeholders, mais simples de traduzir corretamente nas 6 línguas.
    **Validado** com o dev server local (conta de teste registada e apagada no
    fim): `/investimento` e `/investimento/perfil` autenticadas devolvem `200`
    em inglês e em português, com o texto esperado ("Investments"/
    "Investimento", "Investor Profile"/"Perfil de Investidor") e sem nenhuma
    chave em bruto (`investment.xxx`) a aparecer no HTML; script automático
    confirmou as 6 línguas com exatamente o mesmo conjunto de 409 chaves no
    total (as 284 anteriores + as 125 novas). **Não validado**: o estado de
    paywall/bloqueado (`PaywallModal`, ainda em PT-PT — é da prioridade 6,
    "resto") só resolve do lado do client depois do fetch da subscrição, por
    isso não apareceu no HTML de `curl` (mesma limitação já registada para a
    página de Grupos); confirmação visual num browser real continua por
    fazer, sem essa ferramenta disponível nesta sessão.
    Continuam por fazer as prioridades 3, 4 e 6 da tarefa 2.
- 2026-09-22: O utilizador pediu explicitamente para traduzir "mesmo tudo" o
  que restava, apontando dois casos concretos ainda em falta — o botão
  "Digitalizar documento" do dashboard (Fase 5) e o aviso "isto não é
  aconselhamento financeiro" das dicas de investimento (Fase 3/6), que
  ficava sempre em PT-PT independentemente do idioma da UI. Interpretado
  como autorização para completar as prioridades 3, 4 e 6 da tarefa 2 de
  uma vez, não só os dois itens apontados:
  - **`documentScan` (Fase 5)**: `components/forms/DocumentScanButton.vue` e
    `composables/useDocumentScan.ts` totalmente traduzidos (botão, modal de
    escolha câmara/ficheiro, estados de digitalização/erro, modal de
    consentimento, rótulo no `PaywallModal`).
  - **Texto de servidor**: novo `server/utils/i18n.ts` — utilitário leve
    (`getServerLocale(event)` lê o cookie `financeflow_locale` já gerido
    pelo `plugins/locale.ts`; `serverT(locale, key, params)` faz lookup num
    dicionário próprio, com interpolação de `{param}`) para mensagens de
    erro do servidor não passarem pelo bundle de traduções do client.
    `server/api/transactions/scan.post.ts` migrado para `serverT()`.
  - **Disclaimer de investimento e prompt da IA (Fase 3/6)**:
    `server/utils/investmentTips.ts` — `DISCLAIMER` (uma string) passou a
    `DISCLAIMERS` (uma por idioma) e `SYSTEM_PROMPT` (fixo) passou a
    `buildSystemPrompt(locale)`, a pedir a resposta no idioma ativo da UI;
    `getTipsContext`/`getCachedTips`/`generateTips` passam a receber
    `locale` e a incluí-lo no `inputHash` da cache, para nunca devolver
    dicas em cache no idioma errado. Mesmo padrão aplicado a
    `server/api/insights/stats.post.ts` (interpretação de estatísticas) —
    `IAiInsightCache` (`server/models/index.ts`) ganhou um campo `locale`
    persistido, comparado antes de servir da cache. **O disclaimer
    traduzido não foi revisto juridicamente em nenhuma das 6 línguas** —
    continua a mesma ressalva já registada para a prioridade 5, agora
    aplicável a texto de aviso legal em vez de só UI.
  - **Subscrição/checkout/paywall (prioridade 3)**:
    `pages/subscription/index.vue` (a página maior desta fase, ~90 chaves
    novas), `pages/subscription/return.vue`,
    `components/subscription/PaywallModal.vue`,
    `components/subscription/UpsellBanner.vue`. O checkout-sdk da EasyPay só
    suporta 3 idiomas (confirmado via Context7) — adicionado
    `EASYPAY_LANGUAGE: Record<string, 'en'|'pt_PT'|'es_ES'>`, com fr/de/it a
    cair em `en` só para o formulário de pagamento embutido (o resto da
    página continua nos 6 idiomas normalmente).
  - **Previsões/insights de IA (prioridade 4)**: `pages/predictions.vue`,
    `composables/useMLPrediction.ts` (10 strings de insight geradas
    client-side, com o prefixo emoji preservado — o template extrai o
    emoji separadamente do texto), `pages/stats/index.vue` (títulos de
    gráfico, secção de Estatísticas Avançadas incluindo o estado
    bloqueado/paywall, tabela de detalhe mensal, `periodOptions`/
    `summaryCards` convertidos para `computed()`, e a formatação do mês
    (`date-fns` `format(..., { locale: pt })`) passou a usar
    `useLocaleFormat().dateFnsLocale` em vez do import fixo `pt`),
    `components/insights/StatsInsightCard.vue`.
  - Corrigidos mais dois casos do bug recorrente de sombra de `t` (parâmetro
    `trendLabel(t: string)` em `predictions.vue`, `v-for="t in
SUBSCRIPTION_TIERS"` em `subscription/index.vue`) — mesmo padrão já
    visto nas prioridades anteriores.
  - Script de paridade de chaves confirmou as 6 línguas com exatamente o
    mesmo conjunto de 606 chaves no total (as 409 anteriores + ~197 novas
    entre `documentScan`, `paywall`, `upsellBanner`, `subscriptionReturn`,
    `subscription`, `predictions`, `statsInsights` e `stats`). Tradução das
    5 línguas além de PT-PT/EN feita nesta sessão, com a mesma ressalva de
    sempre: primeira versão, não revista por um falante nativo.
    Ainda por confirmar antes de fechar a prioridade 6 por completo: uma
    varredura final a componentes de gráficos (`components/charts/`) e aos
    endpoints de servidor fora de scan/investment-tips/stats
    (`transactions/index.ts`, `[id].ts`, `export.ts`), e validação no browser
    real (só validado por inspeção de código e paridade de chaves nesta
    sessão, sem dev server/curl desta vez).
- 2026-09-22: Varredura final da prioridade 6, delegada a um subagente de
  investigação (só leitura) para encontrar tudo o que ainda faltava depois
  do lote anterior — confirmou 15 ficheiros com texto PT-PT hardcoded,
  todos corrigidos nesta entrada:
  - **`components/charts/`** (8 ficheiros): `ChartEmpty.vue` ("Sem dados
    para exibir"), `CategoryDonut.vue` ("Total"), `BalanceChart.vue`/
    `BarChart.vue` (labels de dataset "Receitas"/"Despesas", mostrados
    diretamente nas tooltips do Chart.js via `ctx.dataset.label`),
    `AreaChart.vue` ("Saldo Acumulado" + prefixo "Saldo:" da tooltip),
    `ForecastChart.vue` (4 labels "Receitas/Despesas (real/prev.)"),
    `DistributionHistogram.vue` (título "Entre X" + pluralização manual
    "transação/transações" nas tooltips), `CategoryBoxplot.vue` (labels
    "Mediana"/"Q1–Q3"/"Min–Max" nas tooltips). Novo namespace `charts` (18
    chaves) — nota técnica: os labels de dataset são lidos com `t()` dentro
    de `computed()` (reativos ao idioma), mas os textos dentro de callbacks
    de tooltip do Chart.js (`opts` também `computed()`, mas a função
    callback só corre no render da tooltip) resolvem o idioma atual em
    cada chamada, por já usarem o `t` vindo de `useI18n()` — não precisam
    de estar dentro do corpo do `computed` para reagirem à mudança de
    idioma.
  - **`components/ui/KpiCard.vue`** ("vs mês anterior" → `common.vsLastMonth`)
    e **`components/ui/ToastContainer.vue`** (`aria-label="Fechar
notificação"` → `common.closeNotification`).
  - **Texto de servidor fora de scan/investment-tips/stats**:
    `server/api/transactions/index.ts` (limite mensal de transações),
    `server/api/categories/index.ts` (nome/tipo obrigatórios, limite de
    categorias, categoria já existe), `server/api/investor-profile/index.ts`
    (4 mensagens de validação de enum), `server/api/investments/index.ts` +
    `[id].ts` (limite de investimentos, "não encontrado") — todos migrados
    para `serverT()`. **`server/utils/investments.ts`** teve de ser
    refatorado mais a fundo: as suas funções de validação (`parseAmount`/
    `parseDate`/`parseAssetClass`/`parseName`, chamadas por
    `parseInvestmentCreate`/`parseInvestmentUpdate`) construíam mensagens
    como `` `${field}: valor inválido` `` com o nome do campo em PT-PT
    embutido — passaram a receber `locale` como primeiro parâmetro e a
    montar a mensagem via `serverT()`, com os próprios nomes de campo
    ("Valor inicial"/"Reforço"/"Situação") também traduzidos
    (`investments.fieldInitialAmount` etc.), interpolados na chave de erro
    (`investments.errorInvalidValue` = `"{field}: valor inválido"`).
  - Confirmado por inspeção de código que `server/utils/documentScan.ts` e
    os endpoints de `groups`/`categories/[id]`/`transactions/[id]`/
    `transactions/export.ts` não tinham nenhum texto PT-PT hardcoded (só
    mensagens já em inglês, fora do âmbito desta fase).
  - Script de paridade de chaves confirmou as 6 línguas com exatamente o
    mesmo conjunto de 626 chaves de UI (as 606 anteriores + 20 novas em
    `common`/`charts`) e 30 chaves de servidor por idioma em
    `server/utils/i18n.ts` (as 10 de `scan.*` + 20 novas entre
    `transactions`/`categories`/`investorProfile`/`investments`).
  - **Validado com o dev server local** (`nuxt typecheck` sem novos erros
    além de um padrão pré-existente e já conhecido de falsos positivos do
    `vue-tsc` — `navigateTo` "não existe" em páginas que também usam
    `useI18n()`, presente desde as prioridades anteriores desta fase, sem
    impacto em runtime): conta de teste registada e apagada no fim,
    `/stats` confirmado a devolver `200` nas 6 línguas sem nenhuma chave em
    bruto no HTML, título traduzido corretamente em cada uma
    ("Statistics"/"Estatísticas"/"Statistiques"/"Statistiken"/
    "Statistiche"/"Estadísticas"); botão "Digitalizar documento" do
    dashboard confirmado em EN ("Scan document") e PT-PT ("Digitalizar
    documento") — o item concreto apontado pelo utilizador no pedido
    original; mensagens de erro do servidor testadas com o cookie
    `financeflow_locale` definido diretamente (a primeira tentativa via só
    `Accept-Language` não localizou nada, como esperado — `getServerLocale`
    só lê o cookie por desenho, nunca o header, para ficar sempre
    consistente com o idioma que o `plugins/locale.ts` já persistiu no
    client) — `POST /api/categories` sem nome/tipo devolveu a mensagem
    certa em pt-PT/fr/de, `POST /api/investor-profile` com `riskTolerance`
    inválido em es.
  - **Não validado**: o disclaimer de investimento em runtime real (exige
    tier Premium + perfil de investidor + uma chamada real à Anthropic —
    não repetido nesta sessão para não gastar API real só para confirmar
    texto já verificado por inspeção direta do código); o estado
    bloqueado/paywall de páginas geridas só no client (mesma limitação já
    registada nas entradas anteriores); confirmação visual num browser
    real continua por fazer.
    Com esta entrada, a prioridade 6 ("resto") e a tarefa 2 da especificação
    ficam **completas na medida do que é detetável por auditoria de código**
    — não fica nenhuma string PT-PT hardcoded conhecida por traduzir. Falta
    só: revisão de qualidade da tradução por um falante nativo (ressalva
    repetida em todas as entradas desta fase), revisão jurídica do
    disclaimer de investimento, e confirmação visual num browser real em
    todas as páginas.
- 2026-09-22: O utilizador reportou "português não tem MB WAY nem
  Multibanco" ao testar o checkout localmente. Investigado — **não é bug**:
  o ficheiro `GeoLite2-Country.mmdb` está corretamente configurado
  (`GEOLITE2_DB_PATH` aponta para um ficheiro real, confirmado a existir),
  mas em `localhost` o IP do pedido é sempre loopback/privado, que o
  GeoLite2 não consegue mapear a nenhum país — `lookupCountry()` devolve
  `null`, e por desenho ("país desconhecido nunca é assumido como
  Portugal") isso esconde o separador MB WAY/Multibanco, exatamente como
  para qualquer país não reconhecido. Confirmado com um teste direto ao
  endpoint `GET /api/subscription/payment-methods`: sem cabeçalho, devolve
  `{ country: null, prepaidMethods: [] }`; com
  `X-Forwarded-For: 213.13.4.1` (gama portuguesa), devolve
  `{ country: "PT", prepaidMethods: ["mbway", "multibanco"] }` —
  confirma que a base de dados e a lógica funcionam. Em produção, atrás de
  um proxy real, o `x-forwarded-for` traz o IP real do utilizador e isto
  resolve-se sozinho. Utilizador confirmou que não quer nenhuma alteração
  de código (rejeitou a opção de um override de dev tipo
  `DEV_FORCE_COUNTRY=PT`) — sem alterações nesta entrada.
- 2026-09-22: Antes de fechar a fase, uma segunda varredura ao texto de
  servidor (pedida no âmbito de preparar a documentação para o merge)
  encontrou mais 8 mensagens de erro PT-PT hardcoded fora do que a
  varredura anterior tinha coberto — todas em fluxos que um utilizador
  real pode mesmo atingir (não erros de configuração interna):
  `server/api/subscription/easypay/create-subscription.post.ts` (plano/
  método inválido, utilizador não encontrado),
  `server/api/subscription/easypay/create-prepaid.post.ts` (plano/método/
  período inválido, método não disponível no país — esta mensagem tem
  interpolação condicional do país, ex. `(PT)`, tratada com um
  `countrySuffix` já formatado pelo chamador), `.../cancel.post.ts` ("não
  tens subscrição com auto-renovação ativa"), e
  `server/utils/transactionCurrency.ts` (taxa de câmbio indisponível —
  esta teve de passar a receber `locale` como novo primeiro parâmetro,
  com os dois chamadores em `transactions/index.ts` e `[id].ts`
  atualizados). Novos namespaces `subscriptionApi` (7 chaves) e
  `transactionCurrency` (1 chave) em `server/utils/i18n.ts`, traduzidos
  para as 6 línguas — confirmado por script que todas têm exatamente 38
  chaves de servidor (as 30 anteriores + 8 novas).
  Deixadas deliberadamente por traduzir (decisão, não esquecimento): 5
  mensagens de erro de configuração interna/falha a montante
  (`ANTHROPIC_API_KEY em falta`, `EASYPAY_ACCOUNT_ID/API_KEY em falta`,
  `TWELVE_DATA_API_KEY em falta`, resposta da Anthropic sem texto/JSON
  inválido) — só podem acontecer com o servidor mal configurado ou uma
  API externa a falhar, nunca num fluxo normal de utilizador numa
  implantação correta; tratadas como diagnóstico de operação, não como
  texto de UI.
  `npm run type-check` corrido depois destas alterações sem nenhum erro
  novo (só o padrão pré-existente e já conhecido de falsos positivos do
  `vue-tsc` em `navigateTo`, presente desde prioridades anteriores desta
  fase).
  Com esta entrada, considera-se fechada a auditoria de string
  hardcoded do lado do servidor — os critérios de aceitação da fase
  ficam cumpridos na medida do que é verificável nesta sessão (ver
  ressalvas nas entradas anteriores sobre revisão por falante nativo,
  revisão jurídica do disclaimer, e confirmação visual em browser real,
  que continuam por fazer e não bloqueiam o merge). Branch mergeada em
  `main` (merge commit) e removida nesta sessão. Estado passa a
  "Concluída".
- 2026-09-22: Definida como funcionalidade atual — FASE 8 (Segurança,
  Qualidade e Preparação para Produção), especificação em
  `context/features/08-FASE-8-seguranca-qualidade.md`. Antes de iniciar a
  implementação, o utilizador pediu para acrescentar a esta especificação a
  possibilidade de autenticação de dois fatores (2FA); depois de considerar
  as três opções (app autenticadora/TOTP, email, SMS) e confirmar por
  pesquisa no código que o projeto não tem hoje nenhuma infraestrutura de
  envio de email nem SMS, o utilizador decidiu manter só a app autenticadora
  (TOTP) — passou a ser o novo ponto 3 da especificação, com os pontos
  seguintes renumerados (4-10). Estado inicial: não iniciada.
- 2026-09-22: Branch `feature/fase-8-seguranca-qualidade` criado a partir de
  `main`. Estado passa a "Em progresso". A pedido do utilizador, o âmbito
  desta sessão ficou limitado aos pontos 1-3 da especificação (segurança
  crítica) — confirmado antes de começar, dado o tamanho da fase completa.
  - **Ponto 2 (sessão assinada, crítico)**: `server/utils/session.ts` (novo)
    — cookie `session` assinado por HMAC-SHA256 (`SESSION_SECRET`), com
    `userId` + expiração + um `purpose` ('session' vs '2fa-pending') dentro do
    valor assinado, para um cookie de um tipo nunca poder ser reaproveitado
    como o outro. `requireAuth` (`server/utils/auth.ts`) deixa de aceitar o
    header `x-user-id` **por completo** — confirmado por grep que nada mais
    no código dependia dele. `middleware/auth.global.ts` atualizado para o
    novo nome de cookie (só verificação de presença em SSR, a validação real
    da assinatura continua a acontecer sempre a seguir). Cookies mantêm
    `secure`/`sameSite`/expiração já existentes, agora centralizados.
    `server/middleware/00-cors.ts` (novo) — restringe CORS a
    `CORS_ALLOWED_ORIGINS`/`APP_URL`, nunca `*` (cookies de sessão viajam nos
    pedidos). **Auditoria de segredos**: `.env.example` tinha a chave real da
    Anthropic, da Twelve Data, e o caminho local do GeoLite2 do utilizador —
    estava no `.gitignore` (nunca chegou a ser commitado), mas ainda assim
    substituído por placeholders; `.env.example` deixa de estar no
    `.gitignore` para poder ser rastreado como template. `SESSION_SECRET` e
    `TWO_FACTOR_ENCRYPTION_KEY` gerados e adicionados ao `.env` local (nunca
    commitado) para o dev server continuar a funcionar.
  - **Ponto 3 (2FA por TOTP)**: `server/utils/twoFactor.ts` (novo) — `otpauth`
    para gerar/validar o código de 6 dígitos, `qrcode` para o QR do setup,
    segredo encriptado em repouso (AES-256-GCM, `TWO_FACTOR_ENCRYPTION_KEY`,
    nunca em texto simples), 10 códigos de recuperação por ativação (hash
    SHA-256, uso único, comparação em tempo constante). Novos campos em
    `User` (`twoFactorEnabled`, `twoFactorSecret`, `twoFactorBackupCodes`,
    todos `select: false` exceto o primeiro). Quatro endpoints novos em
    `server/api/auth/2fa/`: `setup` (gera segredo+QR, não ativa),
    `enable` (confirma um código real antes de ativar, devolve os códigos de
    recuperação em texto simples uma única vez), `verify` (2.º passo do
    login — sem `requireAuth`, lê o cookie `pending_2fa` de 10 min emitido
    por `session.ts` quando a password está certa mas falta o 2FA; aceita
    TOTP ou código de recuperação), `disable` (exige password atual + um
    código válido). Client: `stores/auth.ts` (`signInWithPassword` devolve
    `{ twoFactorRequired: true }` em vez de user quando aplicável;
    `verifyTwoFactor`/`setTwoFactorEnabled` novos), `pages/login.vue` (passo
    extra de UI para o código), `components/settings/TwoFactorCard.vue`
    (novo — ativar/desativar, mostrado em `pages/settings/index.vue`).
    Chaves i18n novas (`auth.twoFactor*`, `settings.twoFactor.*`) traduzidas
    nas 6 línguas (qualidade não revista por falante nativo, mesma ressalva
    de sempre nas strings novas desta sessão).
  - **Ponto 1 (parcial — ver spec para o detalhe exato do que ficou por
    fazer)**: `server/utils/rateLimit.ts` (novo, em memória — assume-se
    single-process, decisão da Fase 1; documentado no próprio ficheiro)
    aplicado a login/registo (duas camadas: por IP e por IP+email),
    `2fa/verify` (5/10min, chaveado pelo userId pendente — pedido explícito
    da especificação por ser alvo natural de força bruta), criação de
    checkout EasyPay, webhook EasyPay, `insights/stats`, `insights/investment`
    e `transactions/scan` (custo direto de chamadas à Anthropic).
    `server/utils/anthropic.ts` uniformizado: o detalhe cru de qualquer falha
    (HTTP, resposta sem texto, JSON inválido) fica só no `console.error`, o
    client recebe sempre a mesma mensagem genérica — antes disto só
    `transactions/scan.post.ts` escondia o detalhe, `insights/stats` e
    `insights/investment` deixavam passar o erro cru da Anthropic. Zod
    (`server/utils/validate.ts`, novo helper com mensagens localizáveis via
    `serverT`) introduzido em `auth/session.ts`, `auth/2fa/**`,
    `transactions/index.ts` + `[id].ts`, `categories/index.ts`,
    `groups/index.ts`, e `server/utils/investments.ts` migrado por completo
    da validação manual (era o pedido explícito da especificação). Por
    migrar ainda: `categories/[id].ts`, `groups/[id].ts`,
    `subscription/easypay/create-*.ts`, `insights/stats.post.ts` e
    `insights/investment.post.ts` — continuam com a validação manual que já
    tinham (funcional, só não passou a usar Zod).
  - **Testado em dev local** contra o MongoDB Atlas real (contas de teste
    `@example.com`, apagadas no fim desta sessão): fluxo completo de
    registo → 2FA setup → enable (código TOTP real gerado por `otpauth`) →
    logout → login → `twoFactorRequired` → verify com TOTP e com código de
    recuperação → reutilização do mesmo código de recuperação rejeitada
    (401) → rate limit do `2fa/verify` a bloquear corretamente ao fim de 5
    tentativas (429, inclusive bloqueando uma tentativa válida a seguir,
    como esperado de um rate limit) → `GET /api/auth/session` com o header
    `x-user-id` de uma conta real, sem cookie nenhum, devolve `{ user: null }`
    (o critério de aceitação exato da especificação). `npm run type-check`
    corrido antes e depois das alterações — nenhum erro novo introduzido além
    de um (`resolveTransactionAmount` a receber `string|number` em vez de
    `string|Date`, corrigido); os restantes erros reportados são todos
    pré-existentes (padrão sistémico de `$fetch<T>()`/`.lean()` em todo o
    projeto, já presente antes desta sessão, consistente com
    `typescript.typeCheck: false` estar desligado no `nuxt.config.ts`).
- 2026-09-22: O utilizador reportou que o login estava a demorar muito.
  Investigado com medições diretas (curl + script isolado a medir cada
  operação): **bug real, pré-existente, não introduzido por esta fase** —
  `seedDefaultBudget()` (`server/api/auth/session.ts`) corre 32 escritas no
  MongoDB (9 grupos + 23 categorias) em **série** (um `await` a seguir ao
  outro dentro de um `for`), e é chamada em **todo** login e em **todo**
  `GET /api/auth/session` (ou seja, no arranque de qualquer página). Corrigido
  para correr cada fase (grupos, depois categorias — a 2.ª depende do
  `groupMap` da 1.ª, por isso as duas fases continuam sequenciais entre si)
  em paralelo com `Promise.all`, mantendo exatamente o mesmo resultado (os
  upserts já eram idempotentes). Medido antes/depois em dev local contra o
  Atlas real: ~2,0-2,5s por pedido de login antes, ~1,2s depois (a
  latência de rede do próprio Atlas para este cluster ronda os 100-160ms por
  operação simples, por isso paralelizar ~32 operações em 2 lotes em vez de
  32 pedidos sequenciais faz uma diferença real).
  **Dois fatores adicionais identificados, não corrigidos** (fora do âmbito
  desta correção pontual, por serem sensíveis ou de infraestrutura):
  1. `scryptSync` (hash da password, `server/utils/password.ts`) demora
     ~500-700ms nesta máquina com os parâmetros por omissão do Node
     (`N=16384`) — bem mais lento do que o típico (50-100ms), mas **pré-
     existente e não alterado**: o parâmetro de custo nunca fica guardado no
     hash (`salt:hash` em hex), por isso baixá-lo invalidaria a verificação
     de **todas** as passwords já criadas — mudança que precisa de decisão
     explícita do utilizador antes de ser feita, nunca unilateral.
  2. Latência do próprio cluster MongoDB Atlas (~100-160ms por operação
     simples, medido diretamente) — parece alta para uma ligação normal;
     pode ser a região do cluster, rede local, ou o plano gratuito (M0);
     não é algo que se resolva no código.
     Testado o fluxo de login de ponta a ponta depois da correção (conta de
     teste `@example.com`, apagada no fim, incluindo os grupos/categorias que
     criou). Ficheiro afetado: só `server/api/auth/session.ts` (função
     `seedDefaultBudget`) — sem mudanças de comportamento, só de concorrência.
  - **Por fazer**: completar a migração Zod dos endpoints listados acima;
    pontos 4-11 da especificação (bloqueio por biometria no Android,
    webhooks, testes automatizados, performance, observabilidade, legal,
    estratégia de dados, dívida técnica) — nada disto foi iniciado nesta
    sessão; confirmar visualmente em browser o novo passo de 2FA no login e
    o cartão de Configurações
    (só testado via API nesta sessão, não na UI real).
- 2026-09-22: A propósito do 2FA, o utilizador notou que apps financeiros no
  telemóvel costumam desbloquear por biometria em vez de pedir sempre
  password/código. Esclarecido que isto seria uma camada de conveniência
  sobre a sessão já existente (o cookie de 30 dias já persiste na WebView
  Android, não é login novo) — um ecrã de bloqueio que pede impressão
  digital/Face ID sempre que a app volta do fundo, via plugin Capacitor (ex.
  `capacitor-native-biometric`), nunca substituindo a autenticação real
  contra o servidor. A pedido do utilizador, acrescentada à especificação da
  Fase 8 como novo ponto 4 (`context/features/08-FASE-8-seguranca-qualidade.md`),
  com os pontos seguintes renumerados (5-11). Só Android (sem iOS, decisão já
  tomada em fases anteriores). Não implementado nesta sessão.
- 2026-09-24: 2FA e login testados pelo utilizador no telemóvel Android real
  (app instalada aponta para `localhost:3100` via `adb reverse`; um pedido de
  autorização USB tinha desaparecido e foi preciso reiniciar o servidor ADB).
  Seguiram-se as tarefas que não dependem de decisões do utilizador nem de
  contas externas:
  - **Ponto 5 (webhooks) — 4 falhas reais de integridade de pagamentos**,
    todas em `server/utils/subscriptionSync.ts`/`requireFeature.ts`:
    (1) uma referência Multibanco/MB WAY **por pagar** (`status: 'pending'`)
    dava acesso Pro/Premium completo — o servidor lia só `subscription.tier`;
    (2) `syncCapture` confiava no `status` do corpo do webhook (não assinado),
    por isso um POST forjado com o id de uma referência por pagar ativava o
    plano, ou `status: 'failure'` punha a conta de outra pessoa em
    `past_due`; (3) nada era idempotente: repetir um webhook, ou chamar
    `/easypay/confirm` (endpoint de utilizador) com um checkout antigo,
    reescrevia `currentPeriodEnd = agora + período` — período grátis
    infinito, ou reativação de um plano expirado; (4) `/easypay/confirm`
    aceitava o checkout de outra conta. Correções: `effectiveTier()` puro em
    `shared/features.ts` (só `active`, ou `canceled`/`past_due` dentro do
    período pago, dão acesso; pré-pagos fora do período voltam a gratuito em
    tempo real — o cron de expiração não corre em lado nenhum), aplicado
    também a `GET /api/subscription` para o client ver o mesmo que o servidor
    aplica; resultado do pagamento lido da API EasyPay, nunca do corpo do
    webhook; `User.subscription.appliedPaymentIds` (últimos 20 ids, nunca
    limpo pela expiração) torna cada pagamento aplicável uma só vez;
    `confirm` exige que o checkout pertença à sessão. **Não testado contra a
    EasyPay sandbox real** (só por leitura de código + testes unitários do
    `effectiveTier`) — convém repetir um checkout de cada método em sandbox
    antes de confiar nisto. Segredo dos crons passou a comparação em tempo
    constante (`server/utils/cron.ts`).
  - **Ponto 1 concluído**: migração Zod dos endpoints que faltavam
    (`groups/[id]`, `categories/[id]`, `create-subscription`,
    `create-prepaid`, `confirm`, corpo opcional de `insights/stats`).
  - **Ponto 10 (parcial)**: `scripts/sync-indexes.mjs` (`npm run
db:sync-indexes`, com `--dry`). O `--dry` no Atlas de desenvolvimento não
    encontrou duplicados; **não aplicado** — fica à espera de decisão do
    utilizador (é aditivo, mas mexe na base de dados partilhada).
  - **Ponto 6 (parcial)**: Vitest 3.x (a 5.x exige `@types/node` ≥22 e o
    projeto está no 20) com 24 testes a passar em `tests/`
    (`effectiveTier`/`hasFeature`, `shared/portfolio.ts`, TOTP e códigos de
    recuperação do 2FA). Por fazer: integração, E2E, `useSubscription`,
    `useFormatters`.
  - **Não iniciados por precisarem de decisão/conta do utilizador**:
    biometria (quando bloquear: sempre que volta do fundo ou após X minutos),
    Sentry (conta/DSN), textos legais (revisão jurídica), performance/
    Lighthouse.
- 2026-09-24 (tarde): decididas as três pendências acima (índices: sim;
  biometria: "o mais usual"; Sentry e legal: agora) e implementadas:

  - **Índices Mongoose aplicados** no Atlas (14, 3 unique). Efeito
    secundário tratado: com o unique `{userId,name}` de `categories` a existir
    de verdade, o seed de `auth/session.ts` (agora em paralelo) ignora
    `E11000` quando dois pedidos correm em simultâneo, senão partia o login.
  - **Ponto 4 (biometria Android)**, `@capgo/capacitor-native-biometric` 8.x
    (única das 3 candidatas que declara Capacitor ≥8). Bloqueia ao abrir e ao
    voltar do fundo após 60 s — a tolerância evita pedir biometria a meio do
    login ao ir buscar o código à app autenticadora. `stores/appLock.ts`,
    `components/AppLockOverlay.vue`, `components/settings/BiometricLockCard.vue`.
    **Armadilha do Capacitor que custou várias iterações**: o objeto do plugin
    é um Proxy; devolvê-lo de uma função `async`/Promise faz o JS chamar
    `.then` nele, o Capacitor trata-o como método nativo `then` que nunca
    responde e a Promise fica pendurada para sempre, sem erro. O sintoma era
    "sem resposta" logo ao ligar ao plugin, e foi atribuído primeiro (mal) ao
    `import()` dinâmico. O acesso ao plugin é agora síncrono. Ativação
    confirmada pelo utilizador no telemóvel real (Honor); o utilizador
    reportou depois ter feito os testes de bloqueio ao reabrir/cancelar/
    tolerância de 1 min, sem detalhar resultados — **não registei falhas, mas
    também não vi os resultados um a um**.
  - **Dúvida "desativar a biometria desativa o 2FA"**: o botão da biometria
    só escreve `localStorage` e não há acoplamento no código. Experiência
    controlada: 2FA reativado, biometria desligada, leitura da base de dados
    antes/depois — `twoFactorEnabled` e `updatedAt` inalterados. **Não provou
    o que aconteceu da primeira vez** (hipótese mais provável, não confirmada:
    tocou-se no botão "Desativar" do cartão do 2FA, que era quase idêntico ao
    da biometria). Cartão da biometria passou a ter ícone e textos próprios.
  - **Ponto 8 (observabilidade)**: `@sentry/nuxt` 10.x (a 11.x exige um Vite
    que o Nuxt 3.21 não usa; instalado com `--legacy-peer-deps` por causa do
    peer opcional `nitro@3`) — só carrega com `SENTRY_DSN`, sem corpos/
    cookies/cabeçalhos/Session Replay. **Servidor validado com um DSN real**
    (erro 500 de teste chegou ao painel; o utilizador confirmou com uma
    captura); browser/telemóvel e produção por validar.
    Logging estruturado em JSON (`server/utils/logger.ts`,
    `server/plugins/errorLog.ts`): login falhado, 2FA falhado, rate limit,
    falha de captura de pagamento, falha de webhook (que agora responde 500
    para a EasyPay reentregar), e todo o 5xx.
  - **Ponto 9 (legal/RGPD)**: `GET /api/account/export` e `DELETE
/api/account` (password + código 2FA; cancela a subscrição com renovação
    automática **antes** de apagar e recusa apagar se o cancelamento falhar);
    UI em Configurações → Privacidade e dados. Textos legais escritos como
    **rascunho** (`utils/legalContent.ts`, PT-PT e EN), páginas públicas
    `/privacy` e `/terms` — as ligações no login foram confirmadas pelo
    utilizador no telemóvel. Campos `[...]` por preencher e revisão jurídica
    por fazer; `LEGAL_IS_DRAFT` continua `true`. **Exportação e eliminação
    de conta nunca testadas.**
  - **Ambiente de teste no telemóvel**: o `adb reverse` (túnel USB) perdeu-se
    ~6 vezes numa tarde porque o cabo "piscava", gerando sintomas enganadores
    (ecrã em branco, "página não disponível", login que não avança) que
    pareciam bugs da app. Passou-se a testar por Wi-Fi: APK recompilado com
    `CAPACITOR_SERVER_URL=http://192.168.11.224:3100` (IP do PC na LAN,
    muda com o DHCP) e uma regra de firewall temporária, restrita à porta
    3100/TCP e a `LocalSubnet`, **já removida pelo utilizador**. Consequência:
    o APK instalado aponta agora a esse IP — sem regra de firewall a app
    deixa de carregar. Para voltar ao USB: `adb reverse tcp:3100 tcp:3100`
    e recompilar com `CAPACITOR_SERVER_URL=http://localhost:3100`.
  - **Sandbox EasyPay, cartão validado** (2026-09-24): leitura direta da base
    de dados depois de o utilizador pagar — `tier: pro`, `status: active`,
    `billingMode: auto`, `currentPeriodEnd` ≈ +1 mês, `appliedPaymentIds`
    preenchido. Prova o caso positivo do cartão. **MB WAY interrompido**: o
    Vite recarregou a página a meio ("new dependencies optimized:
    @easypaypt/checkout-sdk", comportamento só de modo dev, à 1.ª vez que o
    SDK é importado). Débito direto e Multibanco por testar.
  - **Teste de MB WAY/Multibanco em dev**: em `localhost` o país é `null`
    (IP de loopback) e o servidor recusa os métodos pré-pagos, como deve.
    Para testar sem tocar no código da app usa-se um proxy local **fora do
    repositório** que acrescenta `X-Forwarded-For` com um IP português
    (213.13.4.1) — `localhost:3200` → `localhost:3100`. Provado: direto dá
    `country: null` + 403; via proxy dá `PT` + `["mbway","multibanco"]` + 200.
  - **`fetchSession` deixou de tratar erros de rede como "sem sessão"**:
    `GET /api/auth/session` responde sempre 200, por isso um erro é rede/
    servidor indisponível, nunca ausência de sessão; tenta 6 vezes (1,5 s)
    antes de desistir. **Ainda não testado no browser.**
  - **Bug antigo da Fase 2 descoberto e corrigido — cancelar renovação
    automática falhava sempre (502)**: `server/utils/easypay.ts` usava
    `/subscriptions/{id}` (plural); o caminho certo é `/subscription/{id}`
    (singular), confirmado na documentação oficial via Context7 e contra a
    sandbox: `GET /subscriptions/<id>` → 404 "page not found",
    `GET /subscription/<id>` → 200 com a subscrição do utilizador. O 404 de
    rota (texto simples) distingue-se de um 404 de recurso (JSON). Isto
    explica também a nota do histórico de 2026-09-19 de que o `payment.id`
    "não batia certo" com `/subscriptions/{id}`: o id estava certo, o caminho
    é que não. Corrigidos `cancelSubscription` e `getSubscriptionResource`.
    Segundo problema latente encontrado ao rever: `easypayFetch` fazia
    `res.json()` numa resposta vazia, e o `DELETE` bem-sucedido devolve 204
    sem corpo — rebentava DEPOIS de a EasyPay já ter cancelado, deixando o
    estado local dessincronizado. Agora respostas sem corpo são sucesso.
    **Ainda por confirmar em runtime**: o utilizador tem de voltar a cancelar
    na UI (só li a subscrição com GET; não apaguei nada da sandbox).
  - **Testes de integração** (`npm run test:integration`, 12/12 a passar,
    contra um servidor Nuxt/Nitro REAL, não simulações soltas):
    `@nuxt/test-utils` 3.23 (a 4.x exige vitest ^4/^5; ficou-se pela 3.x, a
    mesma limitação já encontrada com o Vitest em si), `mongodb-memory-server`
    (isolado do Atlas), e um servidor HTTP local a fingir a Anthropic/EasyPay
    (nunca chamadas reais — `tests/integration/stubProviders.ts`).
    `easypayFetch`/`fetchMarketSnapshot` passaram a aceitar um URL base por
    variável de ambiente só para isto. Arrancar o servidor em modo `dev`
    (não um build de produção completo — Sentry+TF.js+i18n+PWA demoraram
    > 4 min e o `setupTimeout` esgotou na 1.ª tentativa, medido nesta sessão).
    > Cobre: registo/login, limite de transações do plano Gratuito,
    > `/api/investments` completo (403/404/teto/validação/`valueUpdatedAt`),
    > checkout+webhook `subscription_create` idempotente, e um webhook forjado
    > confirmado a não alterar nada. **Achado a meio do caminho, não um bug**:
    > a suite criava mais contas do que o limite de registo (5/15min por IP)
    > permitia a partir de uma única origem — corrigido simulando um
    > `X-Forwarded-For` diferente por "utilizador" de teste, sem tocar no
    > limite em si (estava a funcionar corretamente). **Por fazer**: insights/
    > IA e o webhook `capture` (MB WAY/Multibanco) — só `subscription_create`
    > (CC/DD) tem teste automatizado.
  - **Erros de EasyPay/Twelve Data uniformizados** (mesmo padrão já aplicado
    à Anthropic): `easypayFetch`/`fetchMarketSnapshot` deixam de devolver o
    texto cru do fornecedor ao cliente — log estruturado com o detalhe,
    mensagem genérica na resposta. Testado no servidor real (id inexistente
    → cliente vê a mensagem genérica; o log tem "Subscription Not Found").
    Fecha o critério de aceitação correspondente.
  - **Sandbox EasyPay, resultados finais** (2026-09-24, confirmados na base
    de dados E diretamente na EasyPay): **cartão** (subscrição ativada,
    depois cancelada com sucesso pela UI — `GET /subscription/<id>` passou
    a 404 "Subscription Not Found", ou seja, a EasyPay deixou de cobrar),
    **MB WAY** (`paid`, 12,99 €) e **Multibanco** (`paid`, 15 €, 3 meses,
    ativo até 24/12) — os três ids ficaram em `appliedPaymentIds`. **Débito
    direto testado depois** (2026-09-24, tarde): `paymentMethod: dd`,
    `billingMode: auto`, id novo em `appliedPaymentIds`, cancelado a seguir
    (confirmado idêntico ao cartão). **Os 4 métodos de pagamento estão agora
    validados na sandbox.**
  - **Expiração testada em runtime** (conta descartável): cancelada e dentro
    do período mantém o plano (200); cancelada com o período terminado volta
    a gratuito (403, `tier: free`) em tempo real; o job
    `check-expirations` recusa segredo errado (401), e com o certo passou a
    conta a `expired`/`free` com os campos limpos e não tocou na conta real.
    **Defeito encontrado**: após expirar, `daysUntilExpiry` é negativo e a
    faixa de aviso (`isExpiringSoon`, `<= 7`) mostraria "expira em -1 dias"
    num plano já gratuito — corrigido (`>= 0`), **não testado no browser**.
    **Nada agenda o job `check-expirations` em lado nenhum** — só o acesso
    em tempo real está garantido; os campos de subscrição de quem expirou
    só são limpos quando um cron externo o chamar (CRON_SECRET existe no
    `.env`, o cron real não está configurado).
  - **Achado e corrigido**: `create-prepaid` (e `create-subscription`) não
    verificavam se já existia uma subscrição com renovação automática ativa.
    Um utilizador com cartão ativo que comprasse um plano pré-pago tinha o
    registo local sobreposto mas **a subscrição recorrente continuava ativa
    na EasyPay** (cobrança dupla em produção). Agora
    `server/utils/subscriptionGuard.ts` recusa com 409 (mensagem traduzida)
    enquanto houver uma subscrição `auto` em `active` ou `past_due`; depois de
    cancelada (`canceled`) ou sem subscrição, permite. Testado 6/6 no servidor
    real. **Consequência para o utilizador**: mudar de plano passa a exigir
    cancelar primeiro (já era o fluxo documentado).
  - **Testes de integração completados — insights/IA e webhook `capture`**
    (2026-09-24): a suite tinha ficado em 12/12 com dois testes por fazer
    (ver entrada acima); agora **17/17 a passar**. Novo: webhook `capture`
    (MB WAY/Multibanco) — arranca de um estado `pending` com
    `billingMode: push_confirm` (o mesmo em que fica logo após o
    `confirm.post.ts`/`onSuccess` do Checkout, antes da confirmação
    assíncrona), o `GET /single/<id>` simulado devolve `status: success`
    com a `key` codificada, e o webhook ativa o plano (`status: active`,
    `paymentMethod: mbway`) de forma idempotente ao reenviar o mesmo
    evento. Segundo teste, dirigido à proteção da Fase 8 ponto 5 no ramo de
    falha: uma conta já ativa por um pagamento MAIS RECENTE recebe uma
    notificação de falha para um pagamento ANTIGO já substituído — a conta
    fica inalterada (`sub.easypaySubscriptionId === resourceId` em
    `server/utils/subscriptionSync.ts` só rebaixa quem está mesmo a pagar
    esse pedido). `POST /api/insights/stats`: Anthropic simulada devolve
    `{insights, suggestions}` via `content[0].text` (JSON-stringificado,
    tal como o formato real da resposta), confirma `cached: false` na 1.ª
    chamada e `cached: true` na 2.ª sem um novo pedido a `/v1/messages`
    (contado via `stub.requests()`). `POST /api/insights/investment`:
    `needsProfile: true` sem `investorProfile` válido, e depois de escrever
    um perfil válido diretamente na BD, `needsProfile: false` com as dicas
    e o disclaimer. Ambos os endpoints também confirmados a devolver 403
    para o plano Gratuito. Todos os 5 novos testes passaram à primeira
    (sem iteração de depuração — os stubs e o formato da resposta da
    Anthropic já estavam bem entendidos das entradas anteriores).
  - **Por fazer nessa altura**: confirmar visualmente as restantes traduções
    novas; preencher e rever o texto legal com um jurista; E2E (Playwright),
    performance/Lighthouse (ponto 7), aviso de hidratação no Android (ponto 11) e a limpeza de dívida técnica restante. (Sentry já estava com
    projeto criado — essa frase estava desatualizada; ver a entrada
    seguinte, 2026-09-25, para a correção real do Sentry em produção.)

  - **Sessão de 2026-09-25 — "conclui os restantes"**: o utilizador pediu
    para fechar praticamente tudo o que faltava na Fase 8. Trabalho, por
    ponto da especificação:

    - **Ponto 6 (testes)**: `tests/formatters.test.ts` (13 testes,
      `useFormatters`), `tests/mlPrediction.test.ts` (4 testes, o caminho
      `simpleForecast()` de `useMLPrediction` — nunca importa TF.js) e
      `tests/subscriptionStore.test.ts` (5 testes, `isExpiringSoon` da store
      de subscrição, incluindo a regressão dos dias negativos). Estes
      composables usam auto-imports do Nuxt (`ref`/`computed`/`useI18n`/
      `useLocaleFormat`) inexistentes fora do Nuxt — resolvido com
      `tests/setup/nuxtStubs.ts` (stubs mínimos, mas usando o
      `useLocaleFormat` REAL) e um alias `~` em `vitest.config.ts`, evitando
      arrancar um Nuxt inteiro só para testes de lógica pura. Total: 46/46
      testes unitários. E2E com Playwright (`playwright.config.ts`,
      `e2e/`): `main-flow.spec.ts` (registo → transação → paywall sem
      Premium → upgrade via escrita direta na BD → previsões) e
      `i18n-flow.spec.ts` (fallback de Accept-Language para EN; checkout só
      mostra CC/DD sem GeoLite2). Infraestrutura própria
      (`scripts/e2e-server.mjs`): MongoDB em memória + um pequeno servidor
      de controlo HTTP no mesmo processo (evita importar `mongoose`/módulos
      `.ts` partilhados a partir de um spec — isso rebentava o transform do
      Playwright com "exports/require is not defined" nesta versão/máquina).
      `e2e/global-setup.ts` visita cada rota uma vz com uma conta descartável
      antes dos testes reais, para o Vite já ter descoberto e pré-empacotado
      tudo (`@easypaypt/checkout-sdk` incluído — o mesmo bug de reload a
      meio já visto com o Capacitor/TF.js) — sem isto, o reload automático
      do Vite a meio de um teste em modo `dev` fazia-o falhar por timeout.
      **Achado, não confirmado como bug**: trocar o idioma em Configurações
      via `selectOption()` do Playwright não propaga ao resto da app (texto/
      cookie) apesar do `<select>` mudar de valor — removido do teste
      automatizado, precisa de confirmação manual num browser real.
    - **Ponto 7 (Performance)**: TF.js já estava lazy-loaded corretamente
      (Fase 1) — só confirmado, não é trabalho novo. Lighthouse e revisão de
      bundle ficaram por fazer: um `npm run build` de produção falhou com
      `ENOENT .nuxt/dist/server/styles.mjs`, não investigado a fundo.
    - **Ponto 8 (Observabilidade)**: **achado importante** — a nota anterior
      sobre o Sentry presumia, sem confirmar, que a produção usa um
      `node-server` em Docker. Falso: `.netlify/` (estado de deploy já
      ligado neste projeto, site `financeflow-fase2-subs`) confirma que o
      alvo real é o **Netlify** (funções serverless). Corrigido
      `nuxt.config.ts` com `sentry: { autoInjectServerSentry:
'top-level-import' }` (consultado via Context7 — documentação oficial
      do SDK Nuxt da Sentry para ambientes serverless), que também faz a
      Sentry exportar o handler serverless embrulhado (necessário para
      `flush()` antes da função terminar). Não testado contra o Netlify real
      (o projeto não tem deploy ativo).
    - **Ponto 9 (Legal)**: revista a questão de encriptação de dados
      financeiros sensíveis — decisão documentada em `context/OPERATIONS.md`
      (a Atlas já encripta o disco por omissão em todos os tiers; não vale a
      pena encriptação ao nível de campo, que impediria agregações no
      servidor). O texto legal em si continua por rever por um jurista —
      fora do alcance de código.
    - **Ponto 10 (Dados)**: `context/OPERATIONS.md` (novo) documenta
      backups e o plano de rollback de migrações. **Achado**: o tier M0
      (gratuito) da Atlas não tem NENHUM backup gerido — só a partir do M10
      pago. `scripts/backup-mongo.mjs`/`restore-mongo.mjs` (novos, testados
      com um ciclo completo contra MongoDB em memória) dão um mínimo viável
      via EJSON, sem depender do binário `mongodump` (não instalado). Nem
      agendado nem a Atlas foi mudada de tier — decisão do utilizador, fora
      do alcance de código.
    - **Ponto 11 (dívida técnica)**: o aviso de hidratação Android tinha
      origem real e confirmada: `new Date()` dentro de `computed` em
      `pages/index.vue` (saudação, depende da hora) e `layouts/default.vue`
      (data no cabeçalho, depende do dia) — corrido uma vez no servidor
      (SSR) e outra no cliente (hidratação), discordando sempre que a hora/
      dia muda de escalão entre os dois. Corrigido com `useState()` a fixar
      o valor do servidor. Não testado no Android real.
    - **Critérios de aceitação**: `.github/workflows/ci.yml` (novo) — 3
      jobs (`unit`, `integration`, `e2e`), nenhum precisa de segredos reais.
      `nuxt typecheck` corre só a informar (`|| true`): tem uma dívida de
      erros de tipos pré-existente confirmada com `git stash` (os mesmos
      erros já existiam antes desta sessão), maior do que o âmbito de
      "concluir a Fase 8". **Corrigidos pelo caminho** (bugs reais, não só
      do typecheck): `ofetch@2.0.0-alpha.3` duplicado e nested em
      `@nuxt/telemetry` (conflituava com o `ofetch@1.5.1` do resto do
      projeto — `overrides` no `package.json`); os 9 modelos Mongoose
      exportados sem `Model<T>` explícito perdiam o tipo de `.lean()`/
      `.findById()` sem genérico no chamador (`server/models/index.ts`,
      todos anotados; `IInvestmentTipsCache`/`IDocumentScanUsage` corrigidos
      para `extends Document<string>`); uma chave computada inválida em
      `server/utils/marketData.ts`. Webhooks idempotentes já estavam
      confirmados pelos testes de integração — só marcado.
    - **Não tocado nesta sessão** (fora do alcance de código, ou já
      corretamente adiado): revisão jurídica do texto legal, agendamento
      real de backups/decisão de subir a Atlas de tier, Lighthouse/bundle
      (bloqueado pelo erro de build), teste em Android de gama baixa
      (precisa do telemóvel físico).

  - **Sessão de 2026-09-27 — fechar o texto legal**: o utilizador respondeu,
    por partes, às questões deixadas em aberto na sessão anterior.

    - **Backups (ponto 10)**: pediu para "fazer o setup que falta para reter
      por 3 anos". GitHub Actions sozinho não chega para 3 anos de retenção
      (o limite de artefactos é muito menor) — escolhida a alternativa
      Cloudflare R2 (nível gratuito). Implementado:
      `scripts/backup-mongo.mjs` agora também envia cada ficheiro EJSON para
      um bucket R2 via `@aws-sdk/client-s3` (API compatível com S3) quando as
      variáveis `R2_*` existem, sem quebrar o caminho só-local que já
      funcionava; `.github/workflows/backup.yml` (novo, cron diário
      03:17 UTC). A retenção de 3 anos em si fica a cargo de uma regra de
      lifecycle no próprio bucket R2 (o script não apaga nada — mais simples
      e mais seguro do que reimplementar essa lógica). **Por fazer, fora do
      código**: o utilizador ainda tem de criar a conta Cloudflare, o bucket,
      a regra de lifecycle, e os 5 secrets no GitHub — passos exatos em
      `context/OPERATIONS.md`. Upload real para R2 não testado (sem
      credenciais nesta sessão).
    - **Transferências fora do EEE (ponto 9)**: pediu a "descrição genérica"
      — trocado o `[CONFIRMAR COM CADA FORNECEDOR]` por uma frase genérica
      sobre cláusulas contratuais-tipo da Comissão Europeia, sem confirmar
      fornecedor a fornecedor.
    - **Livro de Reclamações Eletrónico (ponto 9)**: obrigatório em Portugal
      — o utilizador confirmou que vai configurar, pediu só um placeholder.
      Acrescentado ao rodapé de `pages/login.vue` (link genérico para
      livroreclamacoes.pt, comentário a marcar para trocar pelo link
      específico do comerciante) e uma frase nos Termos a referenciá-lo.
    - **RAL (ponto 9)**: o CNIACC genérico do rascunho foi substituído pelo
      Centro de Arbitragem de Conflitos de Consumo de Lisboa (CACCL), com
      morada/email/telefone reais que o utilizador forneceu.
    - **Valor proporcional em livre resolução (ponto 9)**: decisão de
      negócio do utilizador — devolução total sem perguntas nos 14 dias,
      mas a conta é eliminada e fica bloqueada 6 meses para um novo registo
      com o mesmo email. Isto não ficou só no texto: implementado a sério
      (`RefundedAccount` — novo modelo Mongoose; `POST
/api/admin/refund-delete` — protegido por um `ADMIN_SECRET` próprio,
      separado do `CRON_SECRET`, para privilégio mínimo; acionado
      manualmente pelo operador depois de processar o reembolso na EasyPay à
      mão, já que não há reembolso automático integrado; o registo em
      `auth/session.ts` passou a recusar um email com um `RefundedAccount`
      dos últimos 6 meses). A lógica de eliminação de conta (cancelar
      auto-renovação na EasyPay antes de apagar, apagar todos os dados
      associados) foi extraída para `server/utils/accountDeletion.ts`,
      partilhada entre o endpoint de auto-serviço (`DELETE /api/account`) e
      este novo endpoint de admin — a mesma garantia "não apaga se a
      cancelação na EasyPay falhar" vale para os dois. Testado em integração
      (18/18 no total): 401 sem segredo/com segredo errado, elimina com o
      certo, e confirma que um novo registo com o mesmo email é recusado.
    - **Continua por fazer nessa altura**: limites de responsabilidade e
      direitos imperativos do consumidor (Termos, ponto 7).

  - **Mesmo dia, mais tarde — limitação de responsabilidade fechada**: o
    utilizador forneceu o texto da cláusula (5 pontos: isenção "tal como
    está", exclusão de aconselhamento financeiro, remissão para o DL 446/85
    e Código Civil, exclusão de danos indiretos, teto de responsabilidade em
    12 meses de subscrição paga ou 50 € no Gratuito). Inserido em
    `utils/legalContent.ts` (PT-PT e EN), com uma frase de salvaguarda
    acrescentada por iniciativa própria a dizer que nada na cláusula limita
    direitos imperativos (nomeadamente o de livre resolução do ponto 4).
    **Preocupação levantada, não resolvida**: o DL 446/85 (cláusulas
    contratuais gerais) é mais conhecido por proibir este tipo de cláusula
    de limitação de responsabilidade em contratos de consumo do que por a
    autorizar — citá-lo como fundamento pode estar invertido. Não é algo que
    desse para confirmar sozinho nesta sessão; fica marcado para a revisão
    jurídica. Já não há nenhum marcador `[ENTRE PARÊNTESIS]` por preencher em
    todo o texto legal, mas isto não substitui essa revisão — `LEGAL_IS_DRAFT`
    continua `true`.

  - **Mesmo dia, ainda mais tarde — `LEGAL_IS_DRAFT` posto a `false`**: o
    utilizador pediu explicitamente para publicar, depois de ter sido
    avisado sobre a preocupação com o DL 446/85 na resposta anterior. Feito
    — `LEGAL_IS_DRAFT = false`, aviso de rascunho deixa de aparecer em
    `/privacy` e `/terms`. **Sem revisão por um jurista** — decisão de risco
    do próprio utilizador, não uma recomendação desta sessão; reverter é uma
    linha (`LEGAL_IS_DRAFT = true`) se vier a fazer sentido depois de falar
    com alguém.

  - **Sessão de 2026-09-27 (continuação) — como o cliente pede o reembolso,
    na prática**: o utilizador perguntou, com razão, onde é que o cliente
    pede o reembolso na app e como se sabe depois que ele quis mesmo
    avançar sabendo do bloqueio de 6 meses — a resposta honesta era "em lado
    nenhum, e não se sabe": o `POST /api/admin/refund-delete` construído
    antes só executa a eliminação, não captura consentimento nenhum; o
    pedido chega por email, fora do sistema, sem qualquer prova de que o
    cliente foi avisado da consequência antes de a aceitar.
    Apresentadas duas opções: (A) continuar manual por email, mas com um
    modelo de confirmação explícita a enviar e a exigir resposta por escrito
    antes de processar; (B) um ecrã self-service na app com pedido +
    confirmação, guardando o consentimento na BD. O utilizador escolheu A.
    Feito: `context/OPERATIONS.md` ganhou um modelo de email (PT-PT e EN)
    que o operador tem de enviar ("recebi o teu pedido... antes de avançar,
    confirmo os termos exatos... responde com a frase exata...") e só depois
    de receber a confirmação por escrito é que processa o reembolso e chama
    o endpoint — os dois emails (o modelo enviado + a resposta do cliente)
    ficam como o único registo do consentimento. Sem alteração de código —
    é inteiramente processo/documentação. A opção B (ecrã próprio,
    consentimento guardado na BD) fica registada como não escolhida, para
    reconsiderar se o volume de pedidos algum dia justificar automatizar.

  - **Sessão de 2026-09-28/29 — limpeza e desempenho antes da Fase 9**: o
    utilizador pediu remoção de logs/código obsoleto e melhorias de
    desempenho, segurança e fiabilidade.

    - **Logs**: `console.*` de debug removidos do checkout (cliente); no
      servidor tudo passa por `logEvent` e sem dados pessoais (antes: recurso
      EasyPay inteiro com nome/email/telefone, texto extraído de recibos, IP
      no geo). Scripts CLI mantêm a consola.
    - **Removido**: `next-auth`, `@auth/mongodb-adapter`, `@nuxt/image` (sem
      uso), tipos mortos em `types/index.ts`, `scripts/generate-icons.js`
      (reescrevia o logótipo real com placeholders), registo duplicado do
      plugin mongoose, tabelas de aliases do seed. `dotenv` declarado (os
      scripts de backup dependiam dele só por via transitiva); `vue-tsc`
      instalado — o `type-check` do CI nunca tinha corrido de facto (54 erros
      pré-existentes, nenhum nos ficheiros desta sessão).
    - **Desempenho**: o seed do orçamento (~32 upserts) corria em cada
      `GET /api/auth/session` e login — agora só no registo
      (`server/utils/defaultCategories.ts`), e deixou de repor limites editados
      e recriar categorias apagadas. Chart.js fora do bundle inicial
      (`utils/chartjs.ts`, importado só pelos gráficos; boxplot só nas
      estatísticas). Pesos de fonte não usados removidos; fontes em cache PWA.
    - **Segurança**: queries validadas por Zod (`server/utils/queryFilters.ts`)
      — `limit=0` devolvia tudo, pesquisa/nomes de categoria eram regex sem
      escape, `sortBy` livre, ids inválidos davam 500. Rate limiting passou de
      memória para MongoDB (`RateLimitBucket`, TTL) — em serverless cada
      instância tinha o seu contador. IP do cliente em
      `server/utils/clientIp.ts` (`x-nf-client-connection-ip`, senão o ÚLTIMO
      salto de `X-Forwarded-For`; o 1.º é forjável). Cabeçalhos de segurança
      e `Cache-Control: no-store` na API (`routeRules`). `npm audit fix`:
      produção com 0 vulnerabilidades.
    - **Fiabilidade/acessibilidade**: `fetchSession` partilha o pedido em voo
      (uma 2.ª chamada concorrente via `user = null`); polling do pagamento
      pára ao sair da página; textos fixos em PT (loading, avisos PWA)
      traduzidos nas 6 línguas.
    - **Build de produção** (`nuxt build`, preset netlify-legacy) passou —
      o ENOENT anterior não se repetiu (demorou ~43 min nesta máquina).
      Chart.js (183 KB) e boxplot (36 KB) confirmados em chunks próprios,
      fora do chunk de entrada.
    - **Testes**: unitários 46/46; integração **23/23** (5 novos: categorias genéricas no idioma do registo sem grupos, filtros
      inválidos da listagem, regex em nomes de categoria, seed só no registo,
      `X-Forwarded-For` forjado não contorna o limite de login). **Armadilha
      de ambiente**: uma corrida de integração interrompida deixa um
      `nuxi _dev` órfão que bloqueia a seguinte ("Another Nuxt dev is already
      running" / porta 24678 em uso) — terminar o processo antes de repetir.
      Não testado em browser/Android nesta sessão.
    - **Testes**: unitários 46/46; integração **23/23** (5 novos: categorias genéricas no idioma do registo sem grupos, filtros
      inválidos da listagem, regex em nomes de categoria, seed só no registo,
      `X-Forwarded-For` forjado não contorna o limite de login). **Armadilha
      de ambiente**: uma corrida de integração interrompida deixa um
      `nuxi _dev` órfão que bloqueia a seguinte ("Another Nuxt dev is already
      running" / porta 24678 em uso) — terminar o processo antes de repetir.
      Não testado em browser/Android nesta sessão.
    - **Decisão pendente do utilizador**: as categorias/grupos por omissão
      de todas as contas novas são o orçamento pessoal do programador
      (WiZink, CGD, Edição de livros…) — devem passar a genéricas e
      traduzidas antes da publicação.
    - **Contas novas com dados genéricos** (decisão do utilizador, 2026-09-29:
      "reset para todas as novas... dados genéricos e limitados ao plano
      gratuito"): o orçamento pessoal do programador (9 grupos com limites +
      23 categorias como WiZink, CGD, Edição de livros) deixou de ser semeado.
      Cada conta nova recebe 10 categorias genéricas (Salário, Outros
      rendimentos, Habitação, Alimentação, Transportes, Saúde, Contas da casa,
      Lazer, Compras, Outras despesas), gravadas no idioma do registo (6
      línguas), sem limites mensais e **sem grupos** (funcionalidade Pro). Não
      contam para o teto de 2 categorias próprias do Gratuito. Contas
      existentes não foram tocadas. `scripts/seed.mjs` (conta demo de
      desenvolvimento) mantém os dados antigos — não corre para utilizadores.
    - **Depois do push (2026-09-29)** — dois incidentes reportados pelo
      utilizador:
      - **E2E partiu no CI** (`Cannot find package 'mongodb'`): causado pela
        remoção do `@auth/mongodb-adapter` nesta sessão — era ele que punha o
        `mongodb` na raiz de `node_modules`, e `scripts/e2e-server.mjs`
        importava-o diretamente. Agora usa `mongoose.mongo.MongoClient`.
        Correr o E2E localmente revelou uma **regressão real** desta sessão: ao
        tirar a chamada `fetchSession()` de `app.vue`, o `/login` ficava com o
        ecrã de carregamento por cima para sempre (o plugin `init.client.ts`
        tinha a condição `!auth.loading`, nunca verdadeira, e o middleware não
        corre em rotas públicas). O plugin passa a chamar sempre
        `fetchSession()` (idempotente, sem `await`).
      - **GitGuardian** sinalizou `'ErradaErrada1'` (password falsa de um
        teste de login falhado) — falso positivo, nada a rodar. Para não
        repetir: passwords dos testes (integração e E2E) e `SESSION_SECRET`/
        `TWO_FACTOR_ENCRYPTION_KEY` dos ambientes de teste passam a ser
        gerados a cada execução, sem literais no repositório.
      - Resultado: unitários 46/46, integração 23/23, E2E 3/3 (localmente).
      - **2.º alerta do GitGuardian** no commit seguinte: o detetor genérico
        sinaliza QUALQUER string atribuída a `PASSWORD`, mesmo um template
        gerado (`` `E2e-${randomUUID()}` ``). As passwords de teste passam a
        ser o valor da função, sem texto literal; `CRON_SECRET`/`ADMIN_SECRET`
        dos testes também gerados. **Achado pelo caminho**: `scripts/seed.mjs`
        tinha a password fixa `password123` da conta demo — perigoso se o seed
        correr contra uma base de dados real; agora vem de `DEMO_PASSWORD` ou é
        gerada e mostrada no fim (documentado em `CONFIG-REFERENCE.md`).
- 2026-09-29: FASE 8 (Segurança, Qualidade e Preparação para Produção)
  concluída — branch `feature/fase-8-seguranca-qualidade` mergeado em `main`
  (merge `ded5b43`), seguido de duas correções diretas em `main` (`520c2ba`,
  `12c27fe`: E2E no CI, ecrã de carregamento no login, segredos de teste).
  O utilizador fez o push e respondeu "tudo ok" (não vi o resultado do CI
  diretamente). Ficaram por fazer, fora do código ou
  adiados de propósito: CSP, Lighthouse, teste em Android de gama baixa,
  agendamento real de backups e crons, revisão jurídica do texto legal.
- 2026-09-29: Definida como funcionalidade atual — FASE 9 (Publicação: Google
  Play + Deploy Web de Produção), especificação em
  `context/features/09-FASE-9-publicacao.md`. Estado inicial: não iniciada.
- 2026-09-29: Branch `feature/fase-9-publicacao` criado a partir de `main`.
  O utilizador pediu para "responder a todas as pendências". Decisões pedidas
  e obtidas: Netlify, subdomínio do Netlify, EasyPay em sandbox nos testes
  internos, inscrição na Google ainda não submetida. Trabalho:

  - **Android (tarefa 1)**: `usesCleartextTraffic="false"` no manifest
    principal, com `tools:replace` — **achado**: o módulo gerado
    `capacitor-cordova-android-plugins` declara `true` e, sem isto, o merge
    falhava ou herdava o `true`. HTTP simples só nos builds debug
    (`android/app/src/debug/AndroidManifest.xml`, para testar contra o dev
    server). `allowBackup="false"` + `data_extraction_rules.xml` (a WebView
    guarda o cookie de sessão; um backup restaurado noutro dispositivo
    levava a sessão). Assinatura de release em `build.gradle`, lida de
    `android/keystore.properties` ou `ANDROID_KEYSTORE_*`; sem keystore o
    `bundleRelease` recusa-se a correr. **Achado**: `android/.gitignore` tinha
    as regras de keystore comentadas — um `.jks` podia ir para o git;
    corrigido também no `.gitignore` da raiz. `versionName` 1.0.0 +
    política de versões. `capacitor.config.ts`: URL de produção real e
    cleartext só com um `http://` explícito. **Validado com Gradle** (JDK 21
    — o `JAVA_HOME` desta máquina aponta para o 17, que o Capacitor 8 já não
    aceita): debug compila; release sem keystore é recusado; release com uma
    keystore descartável sai assinado; manifest final com cleartext `false`
    no release e `true` no debug. O `.aab` de teste foi apagado.
  - **Web (tarefa 5)**: `netlify.toml`; `.github/workflows/cron.yml` agenda
    `check-expirations` (diário) e `market-snapshot` (dias úteis) — antes
    nada os chamava. **Achado importante**: o país para os métodos de
    pagamento vinha só do GeoLite2 local (`GEOLITE2_DB_PATH`), que não existe
    nas funções do Netlify — em produção ninguém veria MB WAY/Multibanco.
    `getRequestCountry()` (`server/utils/geo.ts`) usa `x-country`/`x-nf-geo`
    do Netlify, só dentro de uma função Lambda (fora dela um cliente podia
    forjá-los). O cabeçalho vem de um fórum do Netlify, não da documentação
    oficial — **confirmar no 1.º deploy**. CSP em modo Report-Only
    (`nuxt.config.ts`), com os domínios reais do SDK da EasyPay.
  - **Documentação**: `context/OPERATIONS.md` ganhou keystore (criação,
    Play App Signing, backup), versões, deploy no Netlify, rollout faseado e
    rollback (web, Android, pagamentos, contacto) — critério de aceitação
    "plano de rollout e rollback documentado". `CONFIG-REFERENCE.md`:
    alojamento e variáveis novas. `context/PLAY-STORE.md` (novo): ficha
    PT-PT/EN, classificação de conteúdo, segurança dos dados, declarações.
    Política de Privacidade: acrescentado como pedir a eliminação sem a app
    (exigido pela Google), `LEGAL_UPDATED` → 2026-09-29.
  - **Faturação Android — correção à especificação**: verificado nas páginas
    da Google que o "programa de pagamentos externos" é hoje só para o
    Japão. No EEE, cobrar com a EasyPay dentro da app exige "alternative
    billing only": Play Billing Library 8+ nativa (obrigatória desde
    31/08/2026), ecrã informativo da Google e reporte de cada transação à
    API da Google em 24 h. Detalhe em `context/PLAY-STORE.md`, secção 5.
    **Decisão pedida ao utilizador.**
  - **Dívida de tipos (54 → 0)**: causas reais — o `tsconfig.json` da raiz
    redefinia `paths` e apagava todos os aliases do Nuxt; o type-check lia
    `android/` (bundles JS dos builds do Gradle declaram um `$fetch`
    minificado, daí os "Expected 0 type arguments"); casts
    `(await $fetch(...)) as T` esgotavam a profundidade das rotas tipadas do
    Nitro (trocados por `$fetch<T>`); `navigateTo`/`clearError` usados nos
    templates sem import. Corrigidos também 5 erros reais (tipos de grupos,
    ordenação de transações, ObjectId). `error.vue` traduzido (tinha texto
    fixo em PT). O CI passa a falhar com erros de tipos. `vue-tsc` 3.
  - Testes antes do commit desta parte: unitários 46/46, integração 23/23,
    E2E 3/3.

- 2026-09-29 (continuação): **faturação Android — alternative billing only**
  (decisão do utilizador, entre 4 opções apresentadas: Android sem compras,
  alternative billing, Google Play Billing, decidir mais tarde). IVA: o
  operador está isento (art. 53.º CIVA) → imposto reportado 0, configurável
  em `BILLING_VAT_RATE`. APIs confirmadas nas páginas oficiais da Google
  (Play Billing Library 9.1.0 — as funções de alternative billing only
  continuam na 9.x; `externalTransactions.create`/`:refund`, `priceMicros`,
  `userTaxAddress.regionCode`, scope `androidpublisher`) e do Capacitor
  (plugin local registado em `MainActivity`).

  - **Nativo**: `AlternativeBillingPlugin.java` — `prepare()` liga à Google,
    confirma a disponibilidade, mostra o ecrã informativo e devolve o token.
    Compila (Gradle, JDK 21). **Não testado num dispositivo** — só funciona
    com a app instalada pela Play Store e a inscrição aprovada.
  - **Web**: `useAlternativeBilling()`; `pages/subscription/index.vue` envia
    `googlePlayToken` na criação do checkout; sem o programa disponível a
    app Android não deixa comprar (mensagem nas 6 línguas).
  - **Servidor**: `server/utils/googlePlayBilling.ts` + modelo
    `GooglePlayTransaction` (fila: awaiting_payment → pending → reported /
    failed / expired / refunded). Ligado a `subscriptionSync.ts` em todos os
    caminhos de confirmação (confirm, webhooks subscription_create/capture,
    verificação manual), sempre num `try/catch` — uma falha da Google nunca
    trava a ativação do plano. Renovações de cartão/débito direto reportadas
    como `recurringTransaction` com `initialExternalTransactionId`; a 1.ª
    cobrança do débito direto completa a transação inicial; salvaguarda de
    20 dias contra uma 1.ª cobrança por cartão contada como renovação.
    MB WAY/Multibanco como `PREPAID`. OAuth da conta de serviço com JWT
    RS256 via `node:crypto` (sem dependências novas). Cron de hora a hora
    (`/api/billing/google-play/process-queue`) repete falhas e recupera
    checkouts sem confirmação via estado do checkout na EasyPay. Reembolso
    de livre resolução reportado à Google em `admin/refund-delete`; os
    registos de faturação não são apagados com a conta.
  - **Política de Privacidade**: Google (só compras na app: valor, data,
    país, id da transação) e **Netlify** (alojamento — faltava) acrescentados
    aos destinatários.
  - **Testes**: integração 28/28 (5 novos, com a Google simulada: token e
    renovação, PREPAID, compra no site sem reporte, falha + cron, reembolso).

- 2026-09-29/30: **imagens da ficha da Play Store**, pedidas pelo utilizador
  com os requisitos exatos da Play Console. `scripts/store-assets.mjs`: ícone
  512×512 (quadrado, sem cantos arredondados — a loja aplica a máscara) e
  gráfico de funcionalidades 1024×500 PT-PT/EN (PNG sem transparência).
  `npm run store:screenshots` (`store-screenshots/store.spec.ts`): 4 ecrãs
  (painel, transações, estatísticas, investimentos) em telemóvel 1080×1920,
  tablet 7" 1224×2176, tablet 10" 2560×1440 e Chromebook 1920×1080, com uma
  conta Premium e dados de exemplo genéricos num servidor de testes. O
  terceiro pedido do utilizador ("4 a 8, 1080–7680 px") foi interpretado
  como a secção do Chromebook — **não confirmado**. As devtools do Nuxt
  passam a estar desligadas com `E2E_PORT` (apareciam nas capturas).
- 2026-09-30: branch `feature/fase-9-publicacao` mergeado em `main` e
  apagado, a pedido do utilizador. A fase **não** foi marcada como concluída:
  os critérios "app em testes internos", "web em produção" e "subscrição
  partilhada entre plataformas" dependem do deploy e da Play Console, ainda
  por fazer. Próximo passo acordado: deploy no Netlify (o utilizador tem
  sessão iniciada no Netlify CLI).
- 2026-09-30: **primeiro deploy de produção no Netlify**. Decisões do
  utilizador: base de dados separada no mesmo cluster Atlas (a produção
  apontava para a mesma base do desenvolvimento — novo `MONGODB_DB_NAME`,
  produção em `financeflow-prod`, índices criados), copiar as chaves de
  fornecedores do `.env` (EasyPay sandbox, Anthropic, Twelve Data, Sentry),
  remover as variáveis antigas do PayPal, deploy pelo CLI. Segredos da app
  (sessão, 2FA, cron, admin) gerados de novo e enviados ao Netlify sem
  passarem pela conversa. Removidas também as `NUXT_*` antigas
  (sobrepunham-se às novas em runtime — `NUXT_CRON_SECRET` partiria o cron).
  **Dois problemas no caminho**: (1) 502 em tudo — `Cannot find package
  'vue-router'`: o Nitro liga as duas versões do vue-router (4 do Nuxt, 5 do
  @nuxtjs/i18n) com junctions do Windows (caminhos C:\…), partidas no Linux do
  Netlify; (2) esta versão do CLI refaz o build mesmo sem `--build`, com o
  `.env` presente — interrompido antes de publicar. Resolvido com
  `npm run deploy:netlify` (`scripts/deploy-netlify.mjs`). **Verificado em
  produção**: páginas e API 200; cabeçalhos de segurança e CSP Report-Only;
  conta de teste descartável → 10 categorias genéricas PT-PT, plano
  Gratuito, **país `PT` com MB WAY/Multibanco (geolocalização do Netlify
  confirmada)**, gravada em `financeflow-prod` (não em `financeflow`), e
  apagada no fim. **Por fazer**: secrets `APP_URL`/`CRON_SECRET` no GitHub
  (sem `gh` nesta máquina — utilizador), validar a CSP num browser durante
  um checkout, Lighthouse, webhook EasyPay a apontar para produção.
- 2026-10-01: endereço de produção mudado a pedido do utilizador ("não vai
  ficar esse nome em produção"): site do Netlify renomeado de
  `financeflow-fase2-subs` para **`financeflow-webapp`** →
  https://financeflow-webapp.netlify.app (o endereço antigo deixa de
  funcionar). Atualizados `APP_URL` no Netlify, `capacitor.config.ts` e a
  documentação; novo deploy. Por fazer pelo utilizador: secret `APP_URL` no
  GitHub e webhook da EasyPay com o endereço novo.
- 2026-10-01: **backups a funcionar** (pendência da Fase 8, ponto 10). O
  utilizador criou a conta Cloudflare, o bucket R2 com a regra de 3 anos e os
  secrets do GitHub; o workflow corrido à mão gravou `backups/` no R2,
  confirmado pelo utilizador. Pelo caminho: (1) o workflow falhava com
  "exit code 1" sem explicação — passa a listar os secrets em falta e, no CI,
  a recusar um backup só local (perdia-se com o runner); (2) o secret
  `MONGODB_URI` tinha o endereço do Netlify em vez da ligação MongoDB — o
  script passa a tolerar aspas/espaços/o prefixo `MONGODB_URI=` e a explicar
  o erro sem mostrar o valor; (3) actions v5 (aviso de Node 20). E o CI
  falhava no type-check sem `SENTRY_DSN` (opções do Sentry passaram para o
  módulo — 0 erros com e sem DSN).
- 2026-10-01: **pacote Android definitivo `com.dinismcosta.financeflow`**
  (pedido do utilizador; antes `com.financeflow.app` — fica fixo no 1.º
  upload). Mudado em applicationId/namespace, pacote Java, capacitor.config,
  strings.xml, pacote reportado à Google e testes. Keystore de upload criada
  pelo utilizador fora do repositório (`C:/Users/dinis/chaves/`, alias
  `upload`, válida até 2054) e `android/keystore.properties` (ignorado pelo
  git) — verificados sem expor a password. **Primeiro `.aab` assinado**
  (`versionCode 1`, `versionName 1.0.0`, 7,2 MB): `jarsigner` confirma a
  assinatura com o certificado do utilizador; manifest de release com
  `usesCleartextTraffic=false`, `allowBackup=false`, sem `debuggable`;
  `server.url` = `https://financeflow-webapp.netlify.app`. Conta de revisão
  da Google criada em produção (Premium de cortesia, `billingMode: none`,
  sem 2FA; credenciais só na conversa, não no repositório). Política de
  Privacidade: eliminação de dados sem apagar a conta (pedido pela
  declaração de segurança dos dados). Por fazer: carregar o `.aab` na faixa
  de testes internos.
- 2026-10-01: **MB WAY/Multibanco em todos os países** (decisão do
  utilizador). Origem: ao ver os requisitos por país da Play Console, o
  Regulamento (UE) 2018/302 (bloqueio geográfico), art. 5.º — recusar um meio
  de pagamento aceite por causa da localização do cliente — e, sobretudo, os
  emigrantes portugueses (Suíça, França, Reino Unido, EUA, Brasil…), que
  pagam com a conta portuguesa onde quer que vivam. `shared/paymentMethods.ts`
  deixa de depender do país; removidos a recusa 403 em `create-prepaid` e a
  mensagem `methodNotAvailableInCountry`. O idioma continua a seguir a língua
  do telemóvel/browser (não o IP — um emigrante com o telemóvel em PT vê PT),
  confirmado com o utilizador. O E2E passa a provar o caso positivo (os 4
  métodos com país desconhecido) e o teste de integração do MB WAY pela app
  passa pelo endpoint real. Distribuição na Play Store: recomendado só o EEE
  (30 países) — alternative billing só lá; EUA ficam para uma fase própria
  (programa de faturação americano separado, regras ainda em mudança).
- 2026-10-01: Definida como funcionalidade atual — FASE 10 (Moeda de
  apresentação), especificação em
  `context/features/10-FASE-10-moeda-de-apresentacao.md`. Decisões do
  utilizador: câmbio do dia; preços das subscrições em € com o aproximado.
  Fornecedor confirmado com a chave do projeto: Twelve Data cobre 121 moedas
  a partir do euro no plano gratuito (incluindo BRL, AOA, CVE, MZN). Fase 9
  em pausa (ver Estado).
- 2026-10-01: **FASE 10 implementada** no branch
  `feature/fase-10-moeda-apresentacao`.
  - **Servidor**: `User.displayCurrency` (omissão `EUR`); coleção `FxCache`
    (lista de moedas e taxa EUR→X do dia, partilhadas, um pedido por moeda
    por dia); `server/utils/displayCurrency.ts` (fornecedor em baixo → última
    taxa conhecida, ou euros); `GET/PUT /api/account/currency`;
    interpretação de estatísticas por IA com os agregados convertidos e a
    moeda no prompt, cache por moeda.
  - **Cliente**: `stores/currency.ts` (carregada quando há sessão, euros ao
    sair); `useFormatters` converte qualquer valor em euros sem moeda
    explícita (valores com moeda explícita — o original de um recibo — ficam
    como estão); `CurrencyCard` em Configurações (pesquisa, nomes via
    `Intl.DisplayNames`, taxa em uso). Campos de valor na moeda escolhida,
    gravados em euros: transação nova com a moeda escolhida como moeda
    original (o servidor converte, como os recibos estrangeiros); tetos dos
    grupos e investimentos convertidos ao abrir e ao gravar — um campo não
    alterado grava o valor original em euros (evita perder um cêntimo na ida
    e volta). Preços das subscrições "5,00 € (≈ X)". Rótulos "(€)" → símbolo
    da moeda nas 6 línguas.
  - **Testes**: unitários 51/51 (4 novos de conversão), integração 32/32
    (4 novos), E2E 4/4 (novo: mudar para dólares — 100 € aparecem como 200 $
    — e voltar ao euro). Type-check 0 erros.
  - **Limitação conhecida**: um gráfico já aberto só reflete a nova moeda nos
    eixos/tooltips ao voltar a montar (mudar de página); a moeda muda-se em
    Configurações, por isso na prática é sempre assim.
- 2026-10-01: **FASE 10 concluída**, a pedido do utilizador. Branch
  `feature/fase-10-moeda-apresentacao` mergeado em `main` e apagado. Plano
  para os testes fechados da Fase 9 (a Google valoriza 2–3 atualizações
  durante o teste, e só um `.aab` novo conta como atualização — um deploy do
  site não): ecrã próprio sem internet, splash/barra de estado no tema
  escuro, otimização R8, atalhos no ícone, correções do feedback.
- 2026-10-01: **deploy da Fase 10 em produção — com uma correção**. No
  primeiro deploy a lista de moedas ficava só com o euro: a Twelve Data
  devolve em `currency_quote` o NOME da moeda ("US Dollar"), o código vem em
  `symbol` ("EUR/USD"); o código usava o nome e descartava tudo, sem registar
  nada. O teste de integração não apanhou porque a simulação usava um formato
  inventado. Corrigido (código lido de `symbol`, aviso
  `fx.currencies_empty`, simulação com o formato real). **Verificado em
  produção** com uma conta descartável, apagada no fim: 122 moedas (121 + €),
  USD a 1,1245 e BRL a 5,86883 com o câmbio do dia, moeda inválida recusada,
  escolha guardada na conta.

