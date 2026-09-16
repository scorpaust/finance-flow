# Funcionalidade Atual

<!-- Ver especificação completa em context/features/03-FASE-3-insights-ia.md -->

## Estado

Concluída (mergeada em `main`; ver histórico para o bloqueador pendente do
`usesCleartextTraffic` no Android antes de produção)

## Objetivos

FASE 3 — Insights com IA (Estatísticas Pro+ e Investimento Premium). Duas
secções novas, geradas por IA a partir dos dados financeiros do utilizador:
interpretação de estatísticas + sugestões de melhoria (Pro e Premium) em
`/stats`, e dicas de investimento educativas por perfil de risco (exclusivo
Premium), combinando as finanças do utilizador com contexto geral de
mercado.

Pré-requisito: Fase 2 concluída — o sistema de subscrições e
`requireFeature`/`hasFeature` já existem, esta fase só acrescenta features
gated aos planos já criados.

Decisões de arquitetura já tomadas (não reabrir sem motivo forte — ver
especificação secção correspondente):
1. LLM: Anthropic, modelo `claude-haiku-4-5` — mais barato, suficiente para
   gerar JSON estruturado a partir de agregados já calculados. Chamado
   sempre a partir do servidor (`server/utils/anthropic.ts`) — a chave da
   API nunca chega ao client.
2. Dados de mercado: Twelve Data, plano gratuito (800 pedidos/dia, atraso
   de 4h) — irrelevante aqui porque não é preciso preço em tempo real.
3. Split de acesso por tier (decisão explícita do dono do produto):
   interpretação de estatísticas com IA → Pro e Premium; dicas de
   investimento com IA (perfil de investidor + contexto de mercado) →
   exclusivo Premium.
4. Nunca recomendações de investimento específicas — risco regulatório real
   (CMVM em Portugal). Secção de investimento estritamente educativa e
   genérica por perfil de risco (nunca "compra X"), com disclaimer "não é
   aconselhamento financeiro" sempre visível. Molda o prompt e não é
   negociável sem validação legal.
5. Sem proração/cobrança nova aqui — esta fase não toca no sistema de
   subscrições da Fase 2, só consome `hasFeature()`/`requireFeature()` já
   existentes.

Tarefas principais (ver especificação para detalhe completo):
1. Configuração base — chaves Anthropic e Twelve Data,
   `server/utils/anthropic.ts` (Messages API, JSON estruturado),
   `server/utils/marketData.ts` (índices/mercados globais principais)
2. Modelo de dados — `IInvestorProfile` em `User` (sem default automático,
   só existe após o questionário) + collection `MarketSnapshot` (cache
   diário partilhado, nunca chamar a Twelve Data por utilizador/pedido)
3. Fonte única de features — `aiStatsInsights` (Pro) e `aiInvestmentTips`
   (Premium) em `shared/features.ts`
4. Interpretação de estatísticas — `server/api/insights/stats.post.ts`
   (gated `requireFeature('aiStatsInsights')`), só agregados já existentes
   ao LLM (nunca descrições de transações em bruto), prompt fixo PT-PT,
   cache de 24h por utilizador, `StatsInsightCard.vue`, secção gated em
   `pages/stats/index.vue`
5. Dicas de investimento — questionário de perfil de investidor (renovado
   anualmente, `pages/investimento/perfil.vue`), job diário de
   `MarketSnapshot` (padrão do cron `check-expirations` da Fase 2),
   `server/api/insights/investment.post.ts` (gated
   `requireFeature('aiInvestmentTips')`, devolve `needsProfile` se perfil
   ausente/expirado), prompt fixo proibido de nomear ativos/tickers
   específicos com disclaimer hardcoded, `pages/investimento/index.vue`,
   link "Investimento" na navegação com paywall Premium

Fora de âmbito nesta fase: redesign visual final destas secções (Fase 4 —
design system), qualquer recomendação de compra/venda de ativos específicos
(nunca, em nenhuma fase, sem validação legal explícita), testes
automatizados com chamadas reais à Anthropic/Twelve Data (mocks
obrigatórios — ver Fase 5).

## Notas

- Privacidade: nunca enviar descrições de transações em bruto ao LLM (podem
  conter texto sensível, ex. "consulta psiquiatra") — só números/nomes de
  categoria já agregados. Confirmar nos payloads de request antes de dar a
  tarefa 4/5 como concluída.
- Risco regulatório (CMVM) na secção de investimento é o ponto mais
  sensível da fase — em caso de dúvida sobre o teor do prompt, assinalar
  explicitamente no PR em vez de assumir.
- Ler `00-CODE-SPEC.md` (secções 3 e 4) antes de implementar o modelo de
  dados e a matriz de features.
- `MarketSnapshot` é singleton/diário e partilhado por todos os
  utilizadores Premium — nunca por utilizador/pedido.
- ⚠️ **BLOQUEADOR antes de produção**: `android/app/src/main/AndroidManifest.xml`
  tem `android:usesCleartextTraffic="true"` (alterado nesta sessão para
  testar a app Android via `adb reverse` + `http://localhost:3000` num
  telemóvel físico por cabo USB — sem isto a WebView recusava carregar
  tráfego HTTP simples). Isto **tem de voltar a `"false"`** antes de qualquer
  build de produção/release — decisão explícita do utilizador de deixar
  assim por agora e reverter só na fase de publicação (ver
  `context/features/` fase de publicação/Play Store). `capacitor.config.ts`
  já está seguro (cleartext só liga com `CAPACITOR_SERVER_URL` definido,
  nunca no URL de produção por default), o risco está só no manifest.

## Critérios de aceitação

- Free não vê nada destas secções (paywall visível); Pro/Premium veem
  interpretação de estatísticas; só Premium vê dicas de investimento
- `requireFeature('aiStatsInsights')` e `requireFeature('aiInvestmentTips')`
  bloqueiam no servidor mesmo que o client seja adulterado (403)
- Interpretação de estatísticas não repete chamada à Anthropic dentro de
  24h para o mesmo utilizador (cache confirmado)
- Questionário de perfil de investidor grava corretamente e é pedido de
  novo passados 365 dias (testável adiantando `updatedAt` manualmente)
- Dicas de investimento nunca mencionam um ativo/ticker específico (revisão
  manual de amostras geradas) e mostram sempre o disclaimer
- `MarketSnapshot` só é atualizado 1x/dia (confirmar não há chamadas
  repetidas à Twelve Data por utilizador)
- Nenhuma descrição de transação em bruto é enviada à Anthropic (confirmar
  nos payloads de request)

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
