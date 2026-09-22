# Funcionalidade Atual

<!-- Ver especificação completa em context/features/07-FASE-7-internacionalizacao.md -->

## Estado

Concluída — branch `feature/fase-7-internacionalizacao` criado a partir de
`main` em 2026-09-22, mergeado em `main` e removido na mesma sessão. Ver
histórico para o detalhe do que foi implementado. Pendências que não
bloquearam o merge (por decisão explícita, não por esquecimento): revisão de
qualidade da tradução por um falante nativo, revisão jurídica do disclaimer
de investimento traduzido, e confirmação visual num browser real em todas as
páginas e nos 6 idiomas — ver últimas entradas do histórico.

## Objetivos

FASE 7 — Internacionalização (Idiomas + Métodos de Pagamento por País). Dois
sinais independentes, nunca confundidos: o **idioma da UI** segue a
preferência de idioma do browser/dispositivo (`Accept-Language`), com override
manual persistente nas Configurações — localização física é irrelevante (um
português a viajar continua a querer PT-PT); os **métodos de pagamento
pré-pagos disponíveis** seguem o país detetado por geolocalização de IP — é
uma questão de que rails bancários existem nesse país, não de preferência do
utilizador. 6 idiomas no lançamento (PT-PT, EN, FR, DE, IT, ES), com **EN como
fallback universal** para qualquer idioma de browser não suportado. Biblioteca
`@nuxtjs/i18n`; geolocalização via MaxMind GeoLite2 (base de dados local, sem
chamadas externas por pedido). Âmbito de pagamento deliberadamente limitado:
tabela país → métodos, mas só Portugal (MB WAY/Multibanco, já existente desde
a Fase 2) implementado a fundo; qualquer outro país cai no fallback universal
de cartão com auto-renovação (EasyPay, `billingMode: 'auto'`).

Ler `context/features/07-FASE-7-internacionalizacao.md` para a especificação
completa (5 decisões de arquitetura, 6 tarefas, critérios de aceitação),
`02-FASE-2-sistema-subscricoes.md` (EasyPay/MB WAY/Multibanco),
`05-FASE-5-scan-documentos-ia.md` (digitalização de documentos, ver tarefa 6
abaixo) e `00-CODE-SPEC.md` secções 3 e 4.

Tarefas principais (ver especificação para detalhe completo):
1. Infraestrutura de i18n — instalar `@nuxtjs/i18n`, ficheiros de tradução por
   idioma (`i18n/locales/*.json`, organizados por página/secção), deteção
   `Accept-Language` no primeiro acesso com override manual persistente (nunca
   volta a detetar depois de o utilizador escolher), seletor de idioma em
   `pages/settings/index.vue`
2. Extração de strings (o trabalho mecanicamente maior) — auditoria de todo o
   PT-PT hardcoded em `pages/`, `components/` e erros de servidor
   (`createError({message})`); prioridade: auth/dashboard →
   transações/categorias/grupos → subscrição/checkout/paywall →
   previsões/insights de IA (Fase 3) → registo de investimentos (Fase 6) →
   resto; `useFormatters` adaptado para receber o locale (inclui
   `formatReturnPct`/`formatSignedCurrency` da Fase 6, que hoje fixam pt-PT);
   texto de servidor da Fase 6 (erros de `/api/investments`,
   `ASSET_CLASS_LABEL`, prompt e **disclaimer** das dicas de investimento em
   `server/utils/investmentTips.ts` — disclaimer traduzido a rever
   **juridicamente** por idioma, não só traduzido); tradução das 6 línguas com
   revisão de qualidade (não confiar só em tradução automática, sobretudo
   termos financeiros)
3. Geolocalização por IP (server-side) — MaxMind GeoLite2
   (`server/utils/geo.ts`), lookup do IP do pedido → código de país; documentar
   o processo de atualização periódica (mensal) da base de dados
4. Métodos de pagamento por país — `shared/paymentMethods.ts` (tabela país →
   métodos pré-pagos; hoje só `PT: ['mbway', 'multibanco']`, resto `[]`);
   `create-prepaid.post.ts` valida no servidor que o método pedido está
   disponível para o país detetado (nunca confiar só na UI a esconder
   opções); `pages/subscription/index.vue` só mostra o separador
   MB WAY/Multibanco quando o país detetado tiver métodos disponíveis
5. Android — confirmar que o idioma detetado/escolhido no WebView do
   Capacitor coincide com o da app web (mesma conta, mesmo idioma)
6. Digitalização de documentos (Fase 5) em contexto internacional — levantado
   ao concluir a Fase 5; **cada decisão abaixo exige confirmação do
   utilizador antes de implementar**: moeda (converter para € à taxa do dia
   vs. guardar a moeda por transação — lean inicial: converter, fonte de
   câmbios por confirmar), formato de datas ambíguas (`DOCUMENT_SYSTEM_PROMPT`
   assume dia/mês/ano; passar país/idioma ao modelo e marcar `confidence.date:
   'low'` quando ambíguo), idioma do prompt de extração (hoje fixo em PT-PT,
   passa a seguir o idioma ativo), recibos de vencimento (fora de âmbito da
   Fase 5 — valor líquido vs. bruto, por decidir se entram), privacidade/RGPD
   de dados pessoais (NIF, morada, salário) enviados à Anthropic

Fora de âmbito nesta fase: métodos de pagamento locais de outros países além
de Portugal (Bancontact, iDEAL, etc. — trabalho futuro incremental, país a
país), tradução de conteúdo gerado por IA (Fase 3) para outro idioma além do
ativo no momento do pedido, mais do que as 6 línguas confirmadas.

## Notas

- Decisões de arquitetura da especificação (dois sinais independentes
  idioma/país, 6 idiomas com EN como fallback universal, `@nuxtjs/i18n`,
  MaxMind GeoLite2, âmbito de pagamento limitado a Portugal) não devem ser
  reabertas sem motivo forte — ver secção dedicada no ficheiro da fase.
- Deliberadamente depois do Design System (Fase 4), da Digitalização de
  Documentos (Fase 5) e do Registo de Investimentos (Fase 6) — traduzir só
  depois de todo o UI estar estruturalmente estável evita retrabalho (extrair
  strings de um template que ainda vai ser reescrito é desperdício).
- A tarefa 6 (documentos estrangeiros) tem várias decisões por confirmar com o
  utilizador antes de implementar — não assumir nenhuma sem essa confirmação.
- Confirmar a cobertura da EasyPay fora de Portugal (cartões emitidos noutros
  países; Débito Direto SEPA só faz sentido em países SEPA) antes de a
  prometer no checkout.
- Pendências transversais herdadas de fases anteriores, ainda por resolver
  (não são âmbito desta fase, mas ficam o lembrete): ⚠️ **BLOQUEADOR antes de
  produção** — `android/app/src/main/AndroidManifest.xml` tem
  `android:usesCleartextTraffic="true"` (ligado para testar via USB, reverter
  para `"false"` antes de qualquer build de release, tarefa da Fase 9); índices
  `unique` do Mongoose nunca criados (`server/plugins/mongoose.ts` liga com
  `bufferCommands: false`); `requireAuth` autentica por cookie `userId` **ou**
  header `x-user-id` em claro, sem assinatura (a resolver na Fase 8).
- Testar sempre em pelo menos mobile (emulador/dispositivo Android) e desktop
  (janela larga), incluindo tablet/ultra-wide — ver `AGENT-RULES.md` ("Testes
  manuais mínimos").

## Critérios de aceitação

- App abre automaticamente no idioma do browser quando é um dos 6 suportados,
  e em EN quando não é
- Escolha manual de idioma nas Configurações persiste e nunca é substituída
  por deteção automática depois de escolhida
- Nenhuma string visível fica por traduzir em nenhuma das 6 línguas (auditoria
  completa, não amostragem)
- Checkout de subscrição só mostra MB WAY/Multibanco para utilizadores com
  país detetado = Portugal; todos os outros só veem a opção recorrente
- `POST /api/subscription/easypay/create-prepaid` rejeita (403/400) um pedido
  de `paymentMethod` não disponível no país do utilizador, mesmo que a UI
  tenha sido adulterada
- Datas/moeda mostradas corretamente formatadas para cada um dos 6 idiomas
- Um recibo/fatura numa moeda diferente de € é tratado segundo a decisão
  confirmada (convertido ou guardado com a moeda) — nunca gravado como € sem
  aviso
- Um recibo com data ambígua (ex. `03/04`) não é gravado com o mês trocado em
  silêncio: fica com a data realçada como baixa confiança

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
