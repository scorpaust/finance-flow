# Funcionalidade Atual

<!-- Ver especificação completa em context/features/04-FASE-4-design-system-ui.md -->

## Estado

Em progresso (branch `feature/fase-4-design-system-ui`)

## Objetivos

FASE 4 — Design System, Safe Areas e Responsividade. Modernizar o layout
mantendo a identidade "glass morphism" dark já existente, sem tocar em
regras de negócio (subscrições da Fase 2 e features de IA da Fase 3 já
fechadas — esta fase é puramente visual/estrutural).

Pré-requisito: Fases 1, 2 e 3 concluídas (para poder aplicar o novo visual
também ao paywall, secções gated e às secções de IA da Fase 3). Ler
`00-CODE-SPEC.md` secção 5.

Tarefas principais (ver especificação para detalhe completo):
1. Tokens de design centralizados — rever `tailwind.config`, consolidar
   cores/tipografia/spacing como tokens nomeados (manter base: `surface-900
   #0f0f23`, brand indigo `#6366f1`, income emerald `#34d399`, expense rose
   `#fb7185`; expandir paleta com tons intermédios para hierarquia e
   contraste AA); eliminar cores hardcoded fora do `tailwind.config`
2. Safe areas (Android + iOS + web) — `viewport-fit=cover`, `env(safe-area-
   inset-*)` em `MobileNav.vue`, topbar e overlays fullscreen; testar em
   emulador Android com barra de gestos e dispositivo com notch
3. Moldura/contentor visível — envolver conteúdo principal numa moldura
   consistente em desktop/tablet/ultra-wide (`max-width` central + padding
   lateral crescente); mobile pode ficar edge-to-edge, respeitando sempre
   safe areas
4. Breakpoints — rever grelha responsiva (mobile `<640px`, tablet
   `640–1024px`, desktop `1024–1536px`, ultra-wide `>1536px`); testar
   sidebar colapsável vs. bottom nav nestes pontos, incluindo o ecrã de
   subscrição/paywall; zero overflow horizontal em qualquer breakpoint
   (incluindo tabelas de transações e `/stats`)
5. Animações — transições de navegação suaves (150–250ms), micro-interações
   em botões/cards/itens de lista, skeleton loaders consistentes
   (generalizar o padrão de `ChartSkeleton`), respeitar
   `prefers-reduced-motion: reduce`
6. Ícones e splash — confirmar consistência entre ícone adaptativo Android,
   splash screen e favicon/manifest PWA web (alinhar com Fase 1)
7. Acessibilidade básica — contraste AA em todos os estados, foco visível
   em elementos interativos, `aria-label` em botões só com ícone

Fora de âmbito nesta fase: alterações a regras de negócio de subscrição
(Fase 2 já fechada), alterações às features de IA (Fase 3 já fechada),
internacionalização/idiomas (Fase 5), otimizações de performance profundas
(Fase 6).

## Notas

- Fase puramente visual/estrutural — qualquer necessidade de tocar em
  lógica de negócio (gating, preços, prompts de IA) durante esta fase deve
  ser assinalada, não assumida como âmbito extra.
- Testar sempre em pelo menos mobile (emulador/dispositivo Android) e
  desktop (janela larga); a partir desta fase, testar também tablet/
  ultra-wide — ver `AGENT-RULES.md` ("Testes manuais mínimos").
- ⚠️ **BLOQUEADOR antes de produção (herdado da Fase 3, ainda por resolver)**:
  `android/app/src/main/AndroidManifest.xml` tem
  `android:usesCleartextTraffic="true"`, ligado para testar a app Android
  via `adb reverse` num telemóvel físico por cabo USB. Tem de voltar a
  `"false"` antes de qualquer build de produção/release — decisão explícita
  do utilizador de deixar para a fase de publicação. Não é âmbito desta
  fase, mas fica o lembrete enquanto não for revertido.

## Critérios de aceitação

- Sem overflow horizontal em nenhum breakpoint testado
- Bottom nav e overlays respeitam safe areas em emulador/dispositivo
  Android real
- Moldura visível e proporcional em desktop/ultra-wide sem quebrar em
  janelas redimensionadas
- Animações funcionam e desaparecem corretamente com
  `prefers-reduced-motion`
- Auditoria de contraste (ex. Lighthouse/axe) sem falhas críticas

## Histórico

<!-- Manter atualizado. Da mais antiga para a mais recente -->

- 2026-09-15: FASE 1 (Fundação Multiplataforma Web + Android) concluída e
  validada num dispositivo real (ver histórico completo em
  `context/features/01-FASE-1-fundacao-multiplataforma.md`); branch
  `feature/fase-1-fundacao-multiplataforma` ainda não commitada nesta data
  — decisão de commit pendente com o utilizador.
- 2026-09-15: Definida como funcionalidade atual — FASE 2 (Sistema de
  Subscrições: PayPal + MB WAY + Multibanco), especificação em
  `context/features/02-FASE-2-sistema-subscricoes.md`. Estado inicial: não
  iniciada.
- 2026-09-15: Branch `feature/fase-2-sistema-subscricoes` criado a partir de
  `main` (nota: `git log` confirma que a Fase 1 já estava mergeada em `main`
  nesta altura, ao contrário do registado na entrada anterior). Estado passa
  a "Em progresso". Implementado o código-base completo das tarefas 1-7 e
  parte da 8-9 da especificação:
  - **Modelo de dados**: `User.subscription` (`server/models/index.ts`,
    `IUserSubscription`) e `PendingPayPalOrder` (mapa temporário order→
    tier/período/método para o webhook reconstituir compras pré-pagas).
    Script `scripts/migrate-subscriptions.mjs` para utilizadores existentes.
  - **`shared/features.ts`**: `SubscriptionTier`, `FEATURE_MATRIX`,
    `hasFeature()`, `TIER_LIMITS` (transações/mês e categorias custom Free).
  - **`server/utils/paypal.ts`**: wrapper OAuth2 + Orders API (com
    `payment_source.mb_way`/`multibanco` — payload a confirmar em sandbox,
    ver nota no código) + Subscriptions API + verificação de assinatura de
    webhook. Consultada documentação PayPal via Context7 para os payloads
    confirmados (Orders v2, verify-webhook-signature); Subscriptions v1
    (`application_context`) e local payment methods mb_way/multibanco
    seguem o padrão documentado dos restantes métodos mas não têm exemplo
    direto nas docs indexadas — por confirmar em sandbox real (tarefa 9).
  - **Endpoints** `server/api/subscription/**`: estado atual (GET),
    create-subscription (recorrente), create-order (pré-pago), webhook
    (trata os eventos `BILLING.SUBSCRIPTION.*`, `PAYMENT.SALE.COMPLETED`,
    `CHECKOUT.ORDER.APPROVED` com capture explícito, `PAYMENT.CAPTURE.*`),
    cancel, check-expirations (sem scheduler no projeto — desenhado para
    ser chamado por cron externo com header `x-cron-secret`; envio real de
    email/push por implementar, não existe serviço de notificações ainda).
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
    de sair para o checkout PayPal), `/subscription/return` (polling curto
    até o webhook confirmar). Gating aplicado em Previsões, Grupos e
    exportação CSV.
  - `npm run build` validado sem erros (todas as rotas novas compilam).
  - **Por fazer / fora do alcance de código**: criar conta PayPal Business
    real e pedir aprovação Multibanco/MB WAY; preencher credenciais
    sandbox/live e `PAYPAL_PLAN_ID_*` (criar os planos na PayPal); registar
    o webhook e obter `PAYPAL_WEBHOOK_ID`; testar os três métodos em
    sandbox (tarefa 9, incluindo confirmar o payload exato de MB WAY/
    Multibanco); inscrição no programa de pagamentos externos da Google
    (tarefa 8) e reporte `ExternalTransactionId` (não implementado — API
    ainda em evolução em 2026, por confirmar na Play Console); configurar
    um cron externo real para `check-expirations`. `.env.example` tinha uma
    connection string MongoDB Atlas real (ficheiro é gitignored, nunca
    esteve no histórico do git, mas ainda assim redigida para placeholder
    nesta sessão) — vars da Fase 2 adicionadas.
- 2026-09-15: Testes de sandbox validados: corrigido o payload real da
  Orders API (chave `mbway`, não `mb_way`; header `PayPal-Request-Id`
  obrigatório quando a order já inclui `payment_source`; Multibanco é
  redirect-based com capture automático via
  `processing_instruction: ORDER_COMPLETE_ON_PAYMENT_APPROVAL`, ao contrário
  do que a doc consultada sugeria). Fluxo recorrente (cartão/saldo PayPal) e
  Multibanco confirmados de ponta a ponta em sandbox real (order criada,
  redirect, referência gerada, webhook `PAYMENT.CAPTURE.COMPLETED`
  processado, tier atualizado). MB WAY implementado e com payload correto,
  mas bloqueado por `NOT_ENABLED_FOR_PAYMENT_SOURCE` — a conta sandbox
  ainda não tem a capacidade beta aprovada pela PayPal (pedido feito via
  `bizsignup`, aprovação pendente do lado da PayPal, fora do controlo do
  código).
  Corrigidos dois bugs de design encontrados nos testes: (1) uma referência
  Multibanco pendente deixava de refletir o plano real do utilizador
  (sobrescrevia `tier`/`status` para a compra em curso, mesmo sem
  pagamento confirmado) — agora só se escreve em `User.subscription` com o
  pagamento confirmado; uma compra pendente vive só em `PendingPayPalOrder`,
  exposta ao client como `pendingPurchase` à parte do plano atual, com
  endpoint para o utilizador limpar uma referência abandonada; (2)
  cancelamento de auto-renovação fazia downgrade imediato para `free` — API
  ainda referida no plano — corrigido para manter o acesso até
  `currentPeriodEnd` e só descer no job de expiração.
  Adicionado, a pedido do utilizador: upgrade/downgrade in-place de planos
  recorrentes (`change-plan.post.ts`, via revise da Subscriptions API —
  acesso imediato à nova tier, cobrança ao novo preço só no ciclo seguinte
  porque a PayPal não proraciona automaticamente, decisão aceite
  explicitamente); duas estatísticas avançadas novas (histograma de
  distribuição de despesas, box-plot de quartis por categoria via
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
    (fetch nativo, sem SDK — consistente com `paypal.ts`), modelo
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
