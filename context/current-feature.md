# Funcionalidade Atual

<!-- Ver especificação completa em context/features/06-FASE-6-registo-investimentos.md -->

## Estado

Concluída — branch `feature/fase-6-registo-investimentos` mergeado em `main` e
removido (2026-09-22). Implementada com os valores por omissão da secção "A
confirmar com o utilizador" da especificação (Premium com chave própria
`investmentTracker`, "Data" = data do investimento inicial, `assetClass`
opcional, vender = eliminar, flag da IA desligada). **Fechada com validações em
aberto** (não foram feitas, não assumir que estão): a geração real de dicas com
portfolio nunca correu (conta Anthropic sem créditos), o custo por geração não
foi medido, e a validação jurídica das dicas com portfolio está por fazer — por
isso `INVESTMENT_TIPS_INCLUDE_PORTFOLIO` fica desligada — ver histórico.
A Fase 5 (digitalização de documentos) está concluída e mergeada.

## Objetivos

FASE 6 — Registo de Investimentos (Portfolio pessoal + integração com a IA). O
utilizador regista os investimentos que tem, com o modelo da folha de Excel que
já usa: **Portfolio** (nome), **Inicial**, **Data**, **Reforço**, **Situação**
(valor atual) e **%** (calculada, nunca guardada:
`(Situação − (Inicial + Reforço)) / (Inicial + Reforço)`). Vive dentro de
`/investimento`, depois de o utilizador preencher o perfil de investidor da Fase
3; a página passa a ser um hub com o portfolio primeiro e as dicas de IA por
baixo. Duas ações rápidas por linha (Reforçar e Atualizar situação) cobrem o uso
mensal real da folha. As dicas de IA passam a poder ter em conta a composição da
carteira, mas só em agregado (nunca nomes nem valores por posição), atrás de uma
flag desligada até haver validação jurídica.

Ler `context/features/06-FASE-6-registo-investimentos.md` para a especificação
completa (9 decisões de arquitetura, modelo de dados, fluxo por estado do
utilizador, 6 tarefas, critérios de aceitação), `03-FASE-3-insights-ia.md`
(perfil de investidor, dicas e a decisão regulatória 4) e `00-CODE-SPEC.md`
secções 3 e 4 (feature gating).

Tarefas principais (ver especificação para detalhe completo):
1. `shared/features.ts` — nova chave `investmentTracker` (Premium por omissão,
   a confirmar); `requireFeature()` em todos os endpoints novos
2. Modelo `Investment` (`server/models/index.ts`) e `shared/portfolio.ts` com o
   cálculo (`returnPct`, resumo do portfolio sobre totais, não média das %)
   partilhado por servidor, formulário e IA
3. API `server/api/investments/` (`index.ts` GET/POST, `[id].ts` PUT parcial/
   DELETE), sempre filtrada por `userId` (id alheio → 404)
4. Client — `useInvestments`, `InvestmentModal` com pré-visualização da
   rentabilidade, ações "Reforçar" e "Atualizar situação"
5. `pages/investimento/index.vue` reestruturada como hub por estado (paywall /
   sem perfil / perfil válido / perfil expirado), `PortfolioTable` (colunas da
   folha em desktop, cartões em mobile), estado vazio; deixa de chamar a
   Anthropic ao abrir a página
6. Integração com a IA — resumo só com agregados, flag
   `INVESTMENT_TIPS_INCLUDE_PORTFOLIO` (default `false`), regras novas no
   prompt, cache `InvestmentTipsCache`, `InvestmentTipsCard`

Fora de âmbito nesta fase: preços de mercado automáticos por posição,
histórico de valorizações/gráfico de evolução, reforços com data e
rentabilidade anualizada (TWR/IRR), vendas/ganho realizado, várias moedas,
ligar reforços a `Transaction`, importar a folha de Excel/CSV, digitalizar
extratos de corretora, investimentos nas estatísticas/previsões e qualquer
recomendação específica de compra/venda.

## Notas

- Decisões de arquitetura da especificação (modelo = a folha, `%` sempre
  derivada, `Reforço` como total acumulado, `Situação` manual, registo separado
  das transações, IA só com agregados, dicas com portfolio atrás de flag) não
  devem ser reabertas sem motivo forte — ver secção dedicada no ficheiro da fase.
- A fórmula da `%` foi verificada contra as duas linhas da folha do utilizador
  (FTSE All-World ETF 1,94%; Innodata Ação −2,00%). Rentabilidade simples sobre
  o capital investido, não anualizada.
- A data da folha de exemplo (01/10/2026) é posterior à data em que a fase foi
  desenhada (2026-09-21), por isso o formulário não deve rejeitar datas futuras.
- Só a tarefa 6 depende de validação jurídica (dicas que leem a carteira real do
  utilizador aproximam-se de aconselhamento personalizado, decisão regulatória 4
  da Fase 3). As tarefas 1 a 5 entregam valor sozinhas.
- Esta fase foi inserida antes da Internacionalização a pedido do utilizador em
  2026-09-21 — Internacionalização, Segurança/Qualidade e Publicação foram
  renumeradas de Fase 6/7/8 para Fase 7/8/9 (ver `00-CODE-SPEC.md` secção 6 e
  histórico abaixo).
- **Não depender de índices `unique` do Mongoose**: a criação automática de
  índices não funciona neste projeto (`server/plugins/mongoose.ts` liga com
  `bufferCommands: false`). Para o cache da tarefa 6 usar `_id` determinístico
  (`userId`), como já se faz em `DocumentScanUsage`.
- Testar sempre em pelo menos mobile (emulador/dispositivo Android) e desktop
  (janela larga), incluindo tablet/ultra-wide — ver `AGENT-RULES.md` ("Testes
  manuais mínimos"). A tabela de 6 colunas tem de degradar para cartões em
  mobile. Confirmar que o gating das Fases 2 e 3 não regrediu.
- ⚠️ **BLOQUEADOR antes de produção (herdado da Fase 3, ainda por resolver)**:
  `android/app/src/main/AndroidManifest.xml` tem
  `android:usesCleartextTraffic="true"`, ligado para testar a app Android via
  `adb reverse` num telemóvel físico por cabo USB. Tem de voltar a `"false"`
  antes de qualquer build de produção/release — decisão explícita do utilizador
  de deixar para a fase de publicação. Não é âmbito desta fase, mas fica o
  lembrete enquanto não for revertido.

## Critérios de aceitação

- Reproduz a folha: FTSE All-World ETF (1 000 € + 30 € → 1 050 €) mostra 1,94%,
  Innodata Ação (50 € + 0 € → 49 €) mostra −2,00%; resumo do portfolio 1 080 €
  investidos, 1 099 € de valor atual, 19 € de ganho e 1,76% (sobre totais)
- A `%` não existe na base de dados; alterar a `Situação` recalcula-a sem outra
  escrita; "Reforçar" soma ao reforço existente
- Free/Pro não usam a área — paywall no client e `403 feature_locked` em todos
  os endpoints `/api/investments/**` mesmo chamados diretamente
- Um utilizador nunca vê, edita nem elimina posições de outro (id alheio → 404)
- Sem perfil de investidor, `/investimento` pede-o primeiro e volta ao hub ao
  guardar; com perfil expirado o portfolio continua visível e editável
- Abrir `/investimento` não faz pedidos à Anthropic; só "Gerar dicas" o faz, e
  uma 2.ª geração em 24 h sem alterações devolve o cache
- Com a flag desligada o payload da IA é igual ao da Fase 3; com a flag ligada
  só leva agregados (sem nomes, valores por posição nem datas)
- As dicas com portfolio nunca nomeiam um ativo, nunca dizem
  comprar/vender/reequilibrar e mostram sempre o disclaimer
- Layout correto em mobile (cartões), desktop (tabela) e ultra-wide, sem
  regressões no gating das Fases 2 e 3
- Validação jurídica das dicas com portfolio feita antes de ligar a flag em
  produção (não bloqueia o resto da fase)

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
