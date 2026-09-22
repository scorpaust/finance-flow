# FASE 7 — Internacionalização (Idiomas + Métodos de Pagamento por País)

> Pré-requisito: Fases 1 a 6 concluídas. Deliberadamente depois do Design
> System (Fase 4), da Digitalização de Documentos (Fase 5) e do Registo de
> Investimentos (Fase 6) — traduzir só
> depois de todo o UI estar estruturalmente estável evita retrabalho
> (extrair strings de um template que ainda vai ser reescrito é
> desperdício). Ler `00-CODE-SPEC.md` secções 3 e 4.
>
> **Atualização de 2026-09-19**: renumerada de "Fase 5" para "Fase 6" para
> abrir espaço à nova Fase 5 (Digitalização de Documentos com IA, ver
> `context/features/05-FASE-5-scan-documentos-ia.md`), inserida antes desta
> por pedido do utilizador. Segurança/Qualidade e Publicação também
> renumeradas em conformidade.
>
> **Atualização de 2026-09-21**: renumerada de "Fase 6" para "Fase 7" —
> inserida a nova Fase 6 (Registo de Investimentos, ver
> `context/features/06-FASE-6-registo-investimentos.md`) antes desta.
> Segurança/Qualidade e Publicação passam a Fase 8 e Fase 9. As novas
> strings da Fase 6 (área de investimentos) entram na auditoria de
> extração da tarefa 2.

## Decisões de arquitetura tomadas (não reabrir sem motivo forte)

1. **Dois sinais independentes, nunca confundidos:**
   - **Idioma da UI** ← preferência de idioma do dispositivo/browser
     (`Accept-Language`), com override manual persistente nas
     Configurações. Localização física é irrelevante para esta decisão —
     um português a viajar continua a querer PT-PT.
   - **Métodos de pagamento disponíveis** ← país detetado por
     geolocalização de IP. Esta é uma questão de que rails bancários
     existem nesse país, não de preferência do utilizador.
2. **Idiomas no lançamento**: PT-PT, EN, FR, DE, IT, ES. **EN é o fallback
   universal** para qualquer idioma de browser não suportado (nunca mostrar
   texto por traduzir). Arquitetura aberta a acrescentar mais línguas depois
   (ficheiro de traduções novo, sem tocar em código) — mas o trabalho de
   tradução em si não escala automaticamente, por isso o lançamento fica
   fechado a estas 6.
3. **Biblioteca**: `@nuxtjs/i18n` (módulo standard do ecossistema Nuxt).
4. **Geolocalização**: MaxMind GeoLite2 (base de dados local, sem chamadas
   externas por pedido, sem limites de taxa) — mais robusto do que depender
   de estar por trás de um proxy específico (ex. Cloudflare), já que o
   hosting de produção final ainda não está decidido.
5. **Métodos de pagamento por país — âmbito deliberadamente limitado**:
   construir a arquitetura como tabela `país → métodos disponíveis`, mas só
   **implementar a fundo Portugal** (MB WAY/Multibanco, já existente desde a
   Fase 2). Todos os outros países caem no fallback universal (cartão com
   auto-renovação via EasyPay, `billingMode: 'auto'`, já existente desde a
   Fase 2). Confirmar a cobertura da EasyPay fora de Portugal (cartões
   emitidos noutros países; o Débito Direto SEPA só faz sentido em países
   SEPA) antes de a prometer. Adicionar Bancontact (Bélgica), iDEAL
   (Holanda), etc. fica fora desta fase — cada país é o mesmo esforço que
   MB WAY/Multibanco foram na Fase 2, não vale a pena fazer todos de vez.

## Objetivo

A app abre automaticamente no idioma certo (por preferência de browser, com
fallback EN) e, no checkout de subscrição, só mostra métodos de pagamento
pré-pagos que realmente existem no país detetado do utilizador — hoje, isso
significa MB WAY/Multibanco continuam exclusivos de Portugal, e o resto do
mundo vê só as opções de auto-renovação (cartão; Débito Direto onde aplicável).

## Tarefas

### 1. Infraestrutura de i18n

- [x] Instalar e configurar `@nuxtjs/i18n`
- [x] Estrutura de ficheiros de tradução por idioma (`i18n/locales/pt-PT.json`,
      `en.json`, `fr.json`, `de.json`, `it.json`, `es.json`) — chaves
      organizadas por página/secção, não uma lista plana
- [x] Estratégia de deteção: `Accept-Language` do browser no primeiro
      acesso → guardar escolha (cookie/preferência do `User`) → nunca voltar
      a detetar automaticamente depois de o utilizador escolher manualmente
      (implementado só com cookie — `detectBrowserLanguage` do
      `@nuxtjs/i18n`, `strategy: 'no_prefix'` porque a app não tem nem
      precisa de rotas prefixadas por idioma; sem sincronizar com o `User`)
- [x] Seletor de idioma nas Configurações (`pages/settings/index.vue`)

### 2. Extração de strings (o trabalho mecanicamente maior)

- [x] Auditoria de todas as strings PT-PT hardcoded em `pages/`,
      `components/` e mensagens de erro do servidor (`createError({message})`)
      — as 6 prioridades abaixo estão extraídas, incluindo a varredura final
      (gráficos, `KpiCard`/`ToastContainer`, endpoints de servidor fora dos
      já cobertos por scan/investment-tips/stats); nenhuma string PT-PT
      hardcoded conhecida por traduzir a esta data. Não existem emails/
      notificações no projeto
- [x] Prioridade de extração: 1) **autenticação/dashboard — feito**
      (`pages/login.vue`, `pages/index.vue`, `layouts/default.vue`,
      `components/layout/MobileNav.vue`), 2) **transações/categorias/grupos —
      feito** (`pages/transactions/index.vue`, `pages/groups/index.vue`,
      `pages/settings/index.vue` inteira — Perfil, Idioma, Subscrição,
      Categorias —, `components/forms/TransactionModal.vue`,
      `components/ui/TransactionRow.vue`), 3) **subscrição/checkout/paywall —
      feito** (`pages/subscription/index.vue`, `pages/subscription/return.vue`,
      `components/subscription/PaywallModal.vue`,
      `components/subscription/UpsellBanner.vue` — inclui o mapeamento do
      idioma ativo para os 3 idiomas suportados pelo checkout-sdk da EasyPay,
      `en`/`pt_PT`/`es_ES`, com fr/de/it a cair em `en`), 4) **previsões/
      insights de IA (Fase 3) — feito** (`pages/predictions.vue`,
      `composables/useMLPrediction.ts`, `pages/stats/index.vue`,
      `components/insights/StatsInsightCard.vue`,
      `server/api/insights/stats.post.ts` — o prompt de interpretação de
      estatísticas passa a seguir o idioma ativo da UI, com a cache de 24h a
      invalidar quando o idioma muda), 5) **registo de investimentos (Fase 6)
      — feito** (`pages/investimento/index.vue`, `pages/investimento/perfil.vue`,
      `components/investment/PortfolioTable.vue`,
      `components/investment/InvestmentSummary.vue`,
      `components/investment/InvestmentQuickModal.vue`,
      `components/forms/InvestmentModal.vue`,
      `components/insights/InvestmentTipsCard.vue` — inclui os rótulos de
      classe de ativo, que deixaram de vir do `ASSET_CLASS_LABEL` fixo em
      `shared/portfolio.ts` nestes componentes cliente; o ficheiro
      partilhado em si não foi tocado, continua a ser usado tal e qual no
      servidor/IA), 6) **resto — feito**
      (`components/forms/DocumentScanButton.vue` +
      `composables/useDocumentScan.ts` — botão "Digitalizar documento" do
      dashboard e respetivos estados de erro/consentimento;
      `server/api/transactions/scan.post.ts` — mensagens de erro do servidor
      via o novo `server/utils/i18n.ts`; varredura final —
      `components/charts/*.vue` (8 componentes, novo namespace `charts`,
      incluindo labels de dataset e tooltips do Chart.js), `KpiCard.vue`/
      `ToastContainer.vue`, e mensagens de erro de
      `server/api/transactions/index.ts`, `categories/index.ts`,
      `investor-profile/index.ts`, `investments/index.ts`+`[id].ts` — esta
      última exigiu passar `locale` como parâmetro a
      `server/utils/investments.ts` porque as suas funções de validação
      constroem mensagens com o nome do campo interpolado, também traduzido);
      confirmado por inspeção que `server/utils/documentScan.ts` e os
      endpoints de `groups`/`categories/[id]`/`transactions/[id]`/
      `transactions/export.ts` não tinham texto PT-PT hardcoded
- [x] Datas, moeda e números formatados com `Intl`/`date-fns` já
      localizados por idioma ativo — `useFormatters` e o novo
      `useLocaleFormat` (mapeia o locale ativo para o locale do date-fns e
      para a string `Intl`); `formatReturnPct`/`formatSignedCurrency` da Fase
      6 já seguem o locale. Como o formatador em si mudou (não o texto
      envolvente), isto já se aplica em toda a app, mesmo nas páginas cujas
      strings ainda não foram extraídas
- [x] Texto do lado do servidor da Fase 6: mensagens de erro de
      `/api/investments` (formato `Campo: motivo`), rótulos de classe de ativo
      (`ASSET_CLASS_LABEL` em `shared/portfolio.ts`) e o prompt e o
      **disclaimer** das dicas de investimento (`server/utils/investmentTips.ts`)
      — `DISCLAIMER` passou a `DISCLAIMERS` (um por idioma) e o
      `SYSTEM_PROMPT` passou a `buildSystemPrompt(locale)`, com a cache a
      invalidar por idioma. O disclaimer traduzido para cada língua **não foi
      revisto juridicamente**, só traduzido — isto é um aviso importante
      (não é aconselhamento financeiro), tratar a tradução como primeira
      versão até revisão jurídica
- [~] Tradução das 6 línguas — feita para todo o conteúdo extraído até agora
      (paridade de chaves confirmada nas 6 línguas); qualidade **não revista
      por um humano/falante nativo** nesta sessão — tratar como primeira
      versão, sobretudo para termos financeiros e o disclaimer de
      investimento acima

### 3. Geolocalização por IP (server-side)

- [x] Integrar MaxMind GeoLite2 (`server/utils/geo.ts`) — lookup do IP do
      pedido (`x-forwarded-for`/IP direto), devolve código de país (`PT`,
      `FR`, etc.). **Não testado com uma base de dados `.mmdb` real** nesta
      sessão (não incluída no repositório, licenciada) — sem
      `GEOLITE2_DB_PATH` configurado, devolve sempre país desconhecido
      (nunca assume Portugal)
- [x] Documentar processo de atualização periódica da base de dados
      GeoLite2 (licenciada, requer registo gratuito na MaxMind, atualiza-se
      mensalmente) — ver comentário no topo de `server/utils/geo.ts` e
      `context/CONFIG-REFERENCE.md`

### 4. Métodos de pagamento por país

- [x] `shared/paymentMethods.ts` — tabela `país → métodos pré-pagos
      disponíveis` (hoje: só `PT: ['mbway', 'multibanco']`; qualquer outro
      país → `[]`, cai no fallback recorrente)
- [x] `server/api/subscription/easypay/create-prepaid.post.ts` — validar que o
      `paymentMethod` pedido está mesmo disponível para o país detetado do
      utilizador (nunca confiar só na UI a esconder as opções). **Efeito
      colateral importante**: sem `GEOLITE2_DB_PATH` configurado (dev local,
      ou produção antes de instalar a base de dados), o país é sempre
      desconhecido e este endpoint passa a rejeitar (403) qualquer pedido
      MB WAY/Multibanco — mesmo em Portugal. MB WAY/Multibanco só voltam a
      funcionar depois de configurar a geolocalização
- [x] `pages/subscription/index.vue` — só mostrar o separador "Pagar um
      período (MB WAY/Multibanco)" quando o país detetado tiver métodos
      disponíveis; caso contrário, mostrar só "Renovação automática"

### 5. Android

- [ ] Confirmar que o idioma detetado/escolhido no `WebView` do Capacitor
      coincide com o da app web (mesma conta, mesmo idioma nas duas
      plataformas) — **por fazer**, exige um dispositivo Android real (não
      disponível nesta sessão)

### 6. Digitalização de documentos (Fase 5) em contexto internacional

> Levantado em 2026-09-20 ao concluir a Fase 5 (ver
> `05-FASE-5-scan-documentos-ia.md`, "Fora de âmbito"). O modelo já lê
> documentos noutros idiomas, mas a Fase 5 assume Portugal e euros; ler
> recibos/faturas estrangeiros e recibos de vencimento exige as decisões e
> ajustes abaixo.
>
> **Decisões confirmadas com o utilizador em 2026-09-22** (as 3 perguntas
> em aberto desta secção): moeda → opção B (guardar a moeda original);
> recibos de vencimento → entram no âmbito desta fase; privacidade → pedir
> consentimento explícito antes do envio.

- [x] **Moeda** — opção B implementada com um desvio deliberado explicado no
      histórico de `context/current-feature.md`: a transação guarda sempre
      `currency`/`originalAmount`/`exchangeRate` (fidelidade ao documento),
      mas `amount` continua a ser sempre o equivalente em € capturado no
      momento da transação (`server/utils/transactionCurrency.ts` +
      `server/utils/exchangeRates.ts`, Twelve Data `/exchange_rate`) — assim
      todas as agregações existentes (KPIs, estatísticas, orçamentos,
      previsões) continuam a somar um único valor em € sem nenhuma
      alteração, em vez de exigirem um redesenho multi-moeda. **Não
      confirmado em sandbox real** se o plano gratuito da Twelve Data cobre
      pares forex; sem taxa disponível, a transação falha com `422` em vez
      de gravar um valor não convertido
- [x] **Formato das datas** — o prompt (`server/utils/anthropic.ts`) já não
      assume dia/mês/ano: instruído a marcar `confidence.date: 'low'`
      sempre que dia e mês forem ambos ≤ 12 sem indicação clara do formato.
      **Não testado com documentos reais ambíguos**
- [x] **Idioma do prompt** — segue o idioma ativo da UI (lido do cookie do
      `@nuxtjs/i18n` em `scan.post.ts`); os nomes dos campos do JSON
      mantêm-se em inglês (são chaves de schema)
- [x] **Recibos de vencimento** — schema/prompt próprios implementados
      (`documentType: 'receipt' | 'payslip'`, `grossAmount`/`deductions`,
      `amount` = líquido para payslips), resumo mostrado no
      `TransactionModal`. **Não testado com recibos de vencimento reais de
      nenhum país** — tratar como primeira versão
- [x] **Privacidade** — consentimento explícito pedido antes do 1.º envio
      (`DocumentScanButton.vue`, guardado em `localStorage`, não por
      conta/servidor); a menção na política de privacidade da Fase 9 fica
      por fazer (a política em si ainda não existe)

## Fora de âmbito nesta fase

- Adicionar métodos de pagamento locais para outros países além de Portugal
  (Bancontact, iDEAL, etc.) — trabalho futuro incremental, país a país
- Tradução de conteúdo gerado por IA (Fase 3) para outro idioma além do
  ativo no momento do pedido — o prompt já deve pedir a resposta no idioma
  ativo do utilizador, sem tradução adicional depois
- Mais do que as 6 línguas confirmadas

## Critérios de aceitação

- [ ] App abre automaticamente no idioma do browser quando é um dos 6
      suportados, e em EN quando não é
- [ ] Escolha manual de idioma nas Configurações persiste e nunca é
      substituída por deteção automática depois de escolhida
- [ ] Nenhuma string visível fica por traduzir em nenhuma das 6 línguas
      (auditoria completa, não amostragem)
- [ ] Checkout de subscrição só mostra MB WAY/Multibanco para utilizadores
      com país detetado = Portugal; todos os outros só veem a opção
      recorrente
- [ ] `POST /api/subscription/easypay/create-prepaid` rejeita (403/400) um
      pedido de `paymentMethod` não disponível no país do utilizador, mesmo
      que a UI tenha sido adulterada
- [ ] Datas/moeda mostradas corretamente formatadas para cada um dos 6
      idiomas
- [ ] Um recibo/fatura numa moeda diferente de € é tratado segundo a decisão
      confirmada (convertido ou guardado com a moeda) — nunca gravado como €
      sem aviso
- [ ] Um recibo com data ambígua (ex. `03/04`) não é gravado com o mês
      trocado em silêncio: fica com a data realçada como baixa confiança
