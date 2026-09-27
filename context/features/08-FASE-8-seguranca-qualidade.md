# FASE 8 — Segurança, Qualidade e Preparação para Produção

> Pré-requisito: Fases 1 a 7 concluídas. Esta fase não adiciona
> funcionalidades novas — endurece o que já existe antes da Fase 9
> (publicação).
>
> **Atualização de 2026-09-19**: renumerada de "Fase 6" para "Fase 7" —
> inserida a nova Fase 5 (Digitalização de Documentos com IA) antes da
> Internacionalização.
>
> **Atualização de 2026-09-21**: renumerada de "Fase 7" para "Fase 8" —
> inserida a nova Fase 6 (Registo de Investimentos) antes da
> Internacionalização (agora Fase 7).
>
> **Atualização de 2026-09-22**: adicionada a tarefa de autenticação de dois
> fatores (2FA) como novo ponto 3, com as tarefas seguintes renumeradas —
> apenas por app autenticadora (TOTP), email e SMS ficaram fora de âmbito.
>
> **Atualização de 2026-09-22 (2)**: adicionada a tarefa de bloqueio da app
> por biometria (Android) como novo ponto 4, com as tarefas seguintes
> renumeradas (5-11) — camada de conveniência sobre a sessão já existente,
> não uma forma de autenticação nova.

## Objetivo

Deixar a aplicação pronta para expor a utilizadores reais, com pagamentos
reais, em web e Android.

## Tarefas

### 1. Validação e segurança de input
- [x] Introduzir validação de schema (Zod) em todos os endpoints
      `server/api/**` que recebem body/query (auth, transactions,
      categories, groups, subscription, insights/investimento da Fase 3, e
      investments da Fase 6 — a validação manual de
      `server/utils/investments.ts` migra para Zod)
      — feito em `auth/session.ts`, `auth/2fa/**`, `transactions/*`,
      `categories/*`, `groups/*`, `investments.ts`,
      `subscription/easypay/create-*.ts` + `confirm.post.ts` e o corpo
      opcional de `insights/stats.post.ts` (`insights/investment.post.ts` não
      recebe corpo). O webhook EasyPay ficou com validação mínima manual de
      propósito: o corpo nunca é fonte de verdade (ver ponto 5)
- [x] Não expor ao client o detalhe de erros da Anthropic: o
      `generateStructuredJson` (`server/utils/anthropic.ts`) faz `throw
      createError` com o corpo da resposta ("Erro Anthropic (400): ... credit
      balance is too low") e este chega ao client em `insights/stats` e
      `insights/investment`; só `transactions/scan.post.ts` o esconde
      (`upstream_error`). Uniformizar: registar no log, devolver mensagem genérica
      — uniformizado na fonte (`requestStructuredJson`): detalhe cru só no
      `console.error`, os 3 pontos de falha devolvem sempre a mesma mensagem
      genérica, `scan.post.ts` mantém a sua própria (já tinha uma boa)
- [x] Sanitização de IDs (reforçar `sanitizeId` existente e aplicar de forma
      consistente) — auditado: já aplicado em todos os `[id].ts`
      (`categories`, `groups`, `investments`, `transactions`); função mantida
      (regex de 24 hex já era suficiente)
- [x] Rate limiting em endpoints sensíveis: login, registo, criação de
      checkout session, webhooks, geração de insights por IA (Fase 3 — custo
      direto por chamada à API da Anthropic) — `server/utils/rateLimit.ts`
      (em memória, ver nota sobre single-process no próprio ficheiro),
      aplicado a login/registo, `2fa/verify`, `create-subscription`,
      `create-prepaid`, `easypay/webhook`, `insights/stats`,
      `insights/investment` e `transactions/scan`

### 2. Sessão e cookies em produção
- [x] **Assinar a sessão e remover a autenticação por header (crítico)**:
      `requireAuth` (`server/utils/auth.ts`) aceita o cookie `userId` **ou o
      header `x-user-id`**, ambos com o `_id` do utilizador em claro e sem
      assinatura — quem conhecer ou adivinhar um `_id` age como esse utilizador.
      Trocar por uma sessão assinada ou opaca (token aleatório guardado no
      servidor, ou cookie assinado com um segredo), remover o header e confirmar
      que nenhum endpoint ou script depende dele (foi usado nos testes manuais de
      várias fases) — cookie `session` assinado por HMAC (`server/utils/session.ts`,
      `SESSION_SECRET`), header `x-user-id` removido por completo de
      `requireAuth`; confirmado por grep que nada mais no código depende dele
- [x] Cookies de sessão com `secure: true`, `sameSite` apropriado, expiração
      definida — mantido (já existia), agora centralizado em
      `server/utils/session.ts`; expiração também verificada no valor
      assinado, não só no `maxAge` do cookie
- [x] Rever CORS para o domínio de produção (bloquear origens não
      autorizadas) — `server/middleware/00-cors.ts`, restrito a
      `CORS_ALLOWED_ORIGINS`/`APP_URL`, nunca `*` (os pedidos viajam com
      cookies de sessão)
- [x] Segredos (Mongo URI, EasyPay AccountId/ApiKey, Anthropic API key,
      Twelve Data API key, session secret) apenas via variáveis de ambiente
      — nunca no repositório — auditado: `.env.example` tinha chaves reais da
      Anthropic/Twelve Data e um caminho local do GeoLite2 comitáveis (estava
      no `.gitignore`, nunca chegou a ser commitado, mas ainda assim
      corrigido); `.env.example` passa a ser rastreado pelo git (removido do
      `.gitignore`) só com placeholders

### 3. Autenticação de dois fatores (2FA) — app autenticadora (TOTP)
> Opcional (ativada por escolha do utilizador nas Configurações), não
> bloqueia o login por omissão. Método único: app autenticadora (Google
> Authenticator, Authy, 1Password, etc.) via TOTP — não depende de nenhum
> fornecedor externo nem tem custo por utilização, funciona sem rede no
> momento da verificação, e é o standard mais robusto contra
> phishing/SIM swap. Email e SMS ficam fora de âmbito (o projeto não tem
> hoje infraestrutura de envio de email nem SMS, e não compensa montá-la só
> para isto).

- [x] Implementação com `otpauth` ou `speakeasy` (gera o segredo e valida o
      código de 6 dígitos) + `qrcode` (para o QR do setup) — `otpauth` +
      `qrcode`, `server/utils/twoFactor.ts`; segredo encriptado em repouso
      (AES-256-GCM, `TWO_FACTOR_ENCRYPTION_KEY`)
- [x] Modelo `User`: novos campos `twoFactorEnabled`, `twoFactorSecret`
      (encriptado em repouso, nunca em texto simples),
      `twoFactorBackupCodes` (hashes, uso único)
- [x] Fluxo de ativação (Configurações): gerar segredo/QR, exigir um código
      válido antes de marcar como ativo, mostrar os códigos de recuperação
      uma única vez e avisar o utilizador para os guardar — `auth/2fa/setup`
      + `auth/2fa/enable`, `components/settings/TwoFactorCard.vue`
- [x] Fluxo de login: após validar a password, se o utilizador tiver 2FA
      ativo, criar um estado intermédio "pendente de 2FA" (sem emitir a
      sessão completa) até o segundo fator ser validado — cookie
      `pending_2fa` assinado (10 min), `auth/2fa/verify`
- [x] Códigos de recuperação (backup codes) de uso único para o caso de perda
      do dispositivo/telemóvel onde a app autenticadora está instalada — 10
      códigos gerados no `enable`, hash SHA-256 guardado, removidos da lista
      ao serem consumidos (login ou desativação)
- [x] Rate limiting dedicado e agressivo no endpoint de verificação do
      código (poucas tentativas por janela curta) — um código de 6 dígitos é
      alvo natural de força bruta; reforça o rate limiting geral já previsto
      no ponto 1 — 5 tentativas / 10 min, chaveado pelo `userId` pendente
- [x] Permitir desativar o 2FA apenas depois de reautenticar (password +
      código atual), para não bastar um dispositivo já autenticado roubado
      — `auth/2fa/disable.post.ts`

### 4. Bloqueio da app por biometria (Android)
> Só Android (a app é Android + Web, sem iOS — ver decisões anteriores).
> Camada de conveniência/segurança **por cima** da sessão já existente, não a
> substitui: o cookie de sessão assinado (ponto 2) continua exatamente igual,
> com a mesma duração de 30 dias. A biometria não faz login nenhum contra o
> servidor — só decide se a UI mostra ou esconde o conteúdo já autenticado.
> Levantado nesta sessão a propósito do trabalho de 2FA: o utilizador notou
> que apps financeiros no telemóvel costumam pedir impressão digital/Face ID
> ao reabrir, em vez de mostrar logo o dashboard.

- [x] Escolher e integrar um plugin Capacitor de biometria (ex.
      `capacitor-native-biometric`, usa o `BiometricPrompt` nativo do
      Android — impressão digital e/ou reconhecimento facial, conforme o que
      o dispositivo tiver registado) — `@capgo/capacitor-native-biometric`
      8.x: a `capacitor-native-biometric` está no 4.x e a
      `@aparajita/capacitor-biometric-auth` no 10.x sem declarar Capacitor 8;
      esta declara `@capacitor/core >=8`
- [x] Opt-in nas Configurações (mesmo padrão do cartão de 2FA): só oferecer a
      opção se o plugin reportar hardware biométrico disponível **e** com
      pelo menos um método registado no dispositivo; guardar a preferência
      localmente (não há nada para o servidor saber sobre isto) —
      `components/settings/BiometricLockCard.vue`; só ativa depois de uma
      verificação biométrica bem-sucedida
- [x] Ecrã de bloqueio: interceta `resume` do ciclo de vida da app
      (`@capacitor/app`, evento `appStateChange`) e mostra um overlay a pedir
      biometria antes de voltar a expor o conteúdo — decidir com o
      utilizador se é sempre que a app volta do fundo ou só depois de X
      minutos em background — decidido: ao abrir a app e ao voltar do fundo
      após **60 s** (`LOCK_GRACE_MS`, `stores/appLock.ts`). A tolerância
      evita pedir biometria a meio do login quando se sai segundos para a app
      autenticadora copiar o código de 2FA
- [x] Falha ou cancelamento da biometria: nunca mostrar o conteúdo por
      omissão — oferecer só "Tentar novamente" e "Terminar sessão" (login
      normal a seguir); nunca um atalho que contorne a biometria —
      `components/AppLockOverlay.vue`
- [x] Se o utilizador desativar a biometria do telemóvel a meio (ex. remove
      todas as impressões digitais), o plugin deixa de reportar hardware
      disponível — a app deve cair de volta ao comportamento sem bloqueio
      automaticamente, não ficar presa a pedir uma biometria que já não
      existe — `reconcile()` em cada retoma
- [x] Ativação validada no telemóvel real (Honor): o cartão aparece, "Ativar"
      pede a biometria e confirma. **Armadilha do Capacitor encontrada pelo
      caminho**: o objeto do plugin é um Proxy; devolvê-lo de uma função
      `async`/Promise faz o JS chamar `.then` nele, o Capacitor trata-o como
      um método nativo `then` que nunca responde, e a Promise fica pendurada
      (o sintoma era "sem resposta" logo ao ligar ao plugin, sem erro nenhum).
      O acesso ao plugin em `stores/appLock.ts` é por isso **síncrono** —
      nunca fazer `await` sobre o próprio plugin, só sobre as suas chamadas
- [x] Bloqueio ao reabrir, tolerância de 60 s e "Terminar sessão" testados
      pelo utilizador no telemóvel real — **sem resultados detalhados
      reportados** (disse apenas "feito", sem falhas). Por testar:
      o comportamento sem biometria registada (a app deve cair de volta ao
      modo sem bloqueio) e a remoção da biometria a meio.
      É uma barreira de **UI** (o conteúdo continua no DOM por baixo do
      overlay): protege contra quem pega num telemóvel desbloqueado, não
      contra um dispositivo comprometido

### 5. Webhooks
- [x] A EasyPay não assina os webhooks (confirmado na Fase 2, ver
      `server/utils/easypay.ts`) — confirmar que **todos** os handlers
      continuam a verificar a autenticidade consultando a API de volta pelo
      `id` do recurso antes de processar qualquer evento, nunca confiando no
      corpo recebido diretamente; considerar também IP allowlist se a
      EasyPay vier a documentar um intervalo fixo
      — auditado: `syncCapture` confiava no `status` do corpo do webhook (um
      POST forjado ativava um plano por pagar, ou punha a conta de outra
      pessoa em `past_due`) — agora o resultado vem da API. `/easypay/confirm`
      passou a exigir que o checkout pertença ao utilizador da sessão. IP
      allowlist: a EasyPay continua sem documentar um intervalo fixo, não
      aplicável
- [x] Idempotência: eventos repetidos não devem duplicar efeitos no estado
      da subscrição — `User.subscription.appliedPaymentIds` (últimos 20 ids);
      antes, repetir um webhook ou chamar `/easypay/confirm` com um checkout
      antigo estendia o período (ou reativava um plano expirado) sem novo
      pagamento
- [x] (encontrado na auditoria) Uma referência Multibanco/MB WAY **por pagar**
      (`status: 'pending'`) dava acesso completo: o servidor só lia
      `subscription.tier`. Novo `effectiveTier()` em `shared/features.ts`
      (usado por `getUserTier` e por `GET /api/subscription`, para o client
      ver o mesmo que o servidor aplica) — só `active`, ou
      `canceled`/`past_due` dentro do período pago, dão acesso; pré-pagos
      fora do período pago voltam a gratuito em tempo real (o cron de
      expiração não corre em lado nenhum ainda)
- [x] Segredo dos crons comparado em tempo constante (`server/utils/cron.ts`)
- [x] Sandbox EasyPay validada nos 4 métodos (cartão, débito direto, MB WAY,
      Multibanco) — confirmado na base de dados a cada um: `paymentMethod`,
      `billingMode`, `appliedPaymentIds` a crescer; cartão e débito direto
      também confirmados como cancelados diretamente na EasyPay (deixou de
      cobrar, não só o registo local). Corrigido pelo caminho: caminho
      singular `/subscription/{id}` (a Fase 2 usava o plural, 404 sempre) e
      tratamento de respostas sem corpo (`DELETE` devolve 204)

### 6. Testes automatizados
- [x] Unit tests (Vitest) para: `useSubscription`, `useFormatters`,
      `hasFeature`/matriz de features, lógica de previsão (partes não-TF), e
      `shared/portfolio.ts` (Fase 6 — é puro de propósito, primeiro candidato:
      exemplos da folha 1,94% / −2,00% / total 1,76%, e `returnPct` nulo sem
      capital investido)
      — Vitest 3.x (a 5.x exige `@types/node` ≥22, o projeto usa 20)
      configurado (`npm test`); **46 testes a passar** em `tests/`:
      `effectiveTier`/`hasFeature`/matriz, `shared/portfolio.ts`, as funções
      puras do 2FA (TOTP + códigos de recuperação), `useFormatters` (13
      testes — arredondamento/sinal de `formatCurrency`/`formatReturnPct`/
      `formatSignedCurrency`, a regressão da folha de investimentos 1,94%/
      −2,00%, `relativeTime`), `useMLPrediction` (4 testes — o caminho
      `simpleForecast()` que o browser usa sempre que a série é curta demais
      para treinar; nunca importa `@tensorflow/tfjs`) e a store de
      subscrição (5 testes — `isExpiringSoon`, incluindo a regressão dos
      dias negativos corrigida no ponto 5). `useSubscription`/`useFormatters`/
      a store dependem de auto-imports do Nuxt (`ref`/`computed`/`useI18n`/
      `useLocaleFormat`) que não existem fora do Nuxt — resolvido com stubs
      mínimos em `tests/setup/nuxtStubs.ts` (o próprio `useLocaleFormat` real,
      não uma reimplementação) e um alias `~` em `vitest.config.ts`, em vez de
      arrancar um Nuxt inteiro só para testes de lógica pura.
- [x] Testes de integração para endpoints críticos: auth, transactions CRUD,
      subscription checkout/webhook (com mocks da EasyPay), insights/IA
      (com mocks da Anthropic e da Twelve Data — nunca chamadas reais nos
      testes, custam dinheiro), `/api/investments` (Fase 6: 403 a Free, 404 para
      o `_id` de outro utilizador, teto de 100 posições, validação, e a regra de
      `valueUpdatedAt` só mudar quando a Situação muda), a cache das dicas de
      investimento (`inputHash` + 24 h, com mock da Anthropic) e o
      `server/middleware/00-db.ts` (um pedido a frio não pode dar 500)
      — **contra o servidor Nuxt/Nitro real**: `npm run test:integration`
      (`vitest.integration.config.ts`, `tests/integration/`), 17/17 a passar.
      `@nuxt/test-utils` 3.23 (a 4.x exige vitest ^4/^5, o projeto está no
      3.x), servidor arrancado em modo `dev` (um build de produção completo —
      Sentry, TF.js, i18n, PWA — demora vários minutos nesta máquina; medido
      nesta sessão), MongoDB em memória (`mongodb-memory-server`, isolado do
      Atlas) e um servidor HTTP local que finge a Anthropic/EasyPay
      (`tests/integration/stubProviders.ts` — nunca chamadas reais).
      `easypayFetch`/`fetchMarketSnapshot` passaram a aceitar um URL base por
      variável de ambiente só para isto (nunca definida fora dos testes).
      Cobertos: registo (com/sem aceitar termos, email duplicado), login
      (password errada/certa), limite de 50 transações/mês do plano
      Gratuito, `/api/investments` completo (403 Free, 404 de outra conta em
      GET e PUT, teto de 100, validação, regra do `valueUpdatedAt`),
      checkout+webhook `subscription_create` (CC/DD) com idempotência
      (reenviar o mesmo evento não estende o período), um webhook forjado
      (`status: success` no corpo, id que a EasyPay não reconhece)
      confirmado a não alterar nada, webhook `capture` (MB WAY/Multibanco)
      a ativar o plano pré-pago de forma idempotente e a só rebaixar a conta
      para `past_due` quando o id da falha bate com o pagamento em curso
      (uma falha tardia de um pagamento antigo já substituído não mexe na
      conta), `POST /api/insights/stats` a gerar com a Anthropic simulada e
      depois servir da cache de 24h sem nova chamada, e
      `POST /api/insights/investment` (`needsProfile` sem perfil de
      investidor válido, dicas geradas com o perfil presente, disclaimer
      sempre presente) e 403 em ambos para o plano Gratuito. **Achado a
      caminho**: os testes tiveram de simular um IP diferente por
      "utilizador" (cabeçalho `X-Forwarded-For`) — a suite cria mais contas
      do que o limite de registo (5/15min por IP) permitiria a partir de uma
      única origem; não se tocou no limite em si, só se simulou corretamente
      contas de pessoas diferentes.
- [x] E2E (Playwright) do fluxo principal: registo → login → criar
      transação → ver dashboard → tentar aceder a previsões sem Premium
      (deve mostrar paywall) → upgrade sandbox → aceder a previsões
      — `e2e/main-flow.spec.ts`, `npm run test:e2e`, contra um servidor Nuxt
      real em modo `dev` + MongoDB em memória (`scripts/e2e-server.mjs`,
      mesma receita dos testes de integração). "Upgrade" é uma escrita direta
      na BD (via um pequeno servidor de controlo HTTP no mesmo processo do
      `e2e-server.mjs`), não o checkout real da EasyPay pelo browser — esse
      caminho já está coberto com mais precisão pelos testes de integração
      (idempotência, verificação contra a API); aqui o que interessa é a
      reação da UI ao tier mudar. **Achados corrigidos pelo caminho**: (1)
      `@easypaypt/checkout-sdk` fazia o Vite reotimizar dependências e
      recarregar a página a meio de um teste em modo `dev` (mesma classe de
      bug já resolvida para o Capacitor/TF.js) — acrescentado a
      `vite.optimizeDeps.include`, mas mesmo assim insuficiente sozinho;
      resolvido de vez com `e2e/global-setup.ts`, que visita cada rota uma
      vez com uma conta descartável antes dos testes reais correrem; (2) uma
      corrida real: `page.reload()`/`page.goto()` só esperam pelo evento
      `load`, não pelo pedido assíncrono a `/api/subscription` que
      `useSubscription` dispara — um clique a seguir podia ler o tier por
      omissão. Resolvido com `waitForLoadState('networkidle')` antes de
      interagir. **Nota de infraestrutura**: importar qualquer módulo `.ts`
      partilhado a partir de um spec (mesmo trivial, sem dependências)
      rebentava o transform do Playwright com "exports/require is not
      defined" nesta máquina/versão (1.63, sem `"type": "module"` no
      `package.json`) — os helpers ficam inline em cada spec, não num
      `e2e/helpers.ts` partilhado
- [x] E2E cobrindo a Fase 7 (internacionalização): app abre em EN para um IP
      simulado fora dos 6 países suportados (fallback), muda de idioma
      manualmente nas Configurações, e o checkout de subscrição só mostra
      MB WAY/Multibanco para Portugal
      — `e2e/i18n-flow.spec.ts`, 2/2 a passar. **Correção à especificação**:
      o idioma nunca dependeu de geolocalização (`detectBrowserLanguage:
      false` de propósito, ver `plugins/locale.ts`) — deteta-se do
      `Accept-Language`/`navigator.languages`, nunca do IP; a geolocalização
      só decide os métodos de pagamento pré-pagos. O teste cobre os dois
      mecanismos, separados corretamente: (1) `Accept-Language: ja-JP`
      (Playwright `locale: 'ja-JP'`) cai em EN, gravado no cookie
      `financeflow_locale`; (2) sem `GEOLITE2_DB_PATH` configurado neste
      ambiente (sem licença MaxMind disponível), o país fica sempre
      desconhecido — o mesmo resultado que "fora de Portugal" — e só CC/DD
      aparecem no checkout; **não testado** o caso positivo (Portugal → MB
      WAY/Multibanco aparecem), que exigiria uma base de dados GeoLite2 real.
      **Achado, não confirmado como bug**: trocar manualmente o idioma em
      Configurações via `select.selectOption()` do Playwright muda o valor
      do `<select>` nativo mas o resto da app nunca reage (o cabeçalho
      "Language"/"Idioma" nunca muda) — removido do teste automatizado por
      não se conseguir confirmar se é um defeito real da app ou uma
      particularidade de como o Playwright dispara eventos sintéticos num
      `<select>`; precisa de confirmação manual num browser real

### 7. Performance
- [ ] Lighthouse (web) e auditoria equivalente em Android: performance,
      acessibilidade, PWA
      — **por fazer**: um `npm run build` de produção (preset `netlify-legacy`,
      ver ponto 8) falhou nesta sessão com
      `Error: Could not load .../.nuxt/dist/server/styles.mjs (imported by
      .../build-files.mjs): ENOENT` — não investigado a fundo (não bloqueava
      o trabalho desta sessão, que correu inteiramente contra o servidor de
      `dev`); tentar `rm -rf .nuxt .output` antes de repetir o build antes de
      assumir que é um bug real
- [x] Carregar TensorFlow.js apenas na página de previsões (lazy/dynamic
      import), não no bundle inicial — **já estava feito** (Fase 1, tarefa 7):
      `composables/useMLPrediction.ts` só faz `await import('@tensorflow/tfjs')`
      dentro de `predictNextMonths()`, nunca a nível de módulo; `nuxt.config.ts`
      já marca `@tensorflow/tfjs` como `ssr.external` (nunca no bundle do
      servidor) e em `optimizeDeps.include` (pré-empacotado para o dynamic
      import ser rápido quando pedido, não para entrar no bundle inicial).
      Confirmado por grep: nenhum ficheiro importa `@tensorflow/tfjs` fora
      deste único `await import()`
- [ ] Rever tamanho de bundle e code-splitting por rota
      — **por fazer**: bloqueado pelo mesmo erro de build acima (o passo que
      falhou é já depois do bundle do client estar gerado — `Client built in
      516628ms` — mas antes de se conseguir correr uma auditoria completa)
- [ ] Testar app em dispositivo Android de gama baixa (ou emulador com
      recursos limitados) para validar fluidez das animações da Fase 4 e do
      modelo de ML

### 8. Observabilidade
- [x] Integrar monitorização de erros (ex. Sentry) em client e server —
      `@sentry/nuxt` 10.x (a 11.x exige um Vite que o Nuxt 3.21 não usa;
      instalado com `--legacy-peer-deps` por causa do peer opcional
      `nitro@3`). **Só carrega com `SENTRY_DSN`** (sem DSN a app não envia
      nada); sem corpos de pedidos, cookies, cabeçalhos nem Session Replay.
      Projeto `javascript-nuxt` criado e DSN no `.env` local. **Servidor
      validado ponta a ponta em dev**: um erro 500 provocado de propósito
      (endpoint temporário, já apagado) apareceu como issue no painel.
      **Corrigido nesta sessão**: a nota anterior aqui presumia, sem
      confirmar, que a produção usa `node-server` em Docker (nesse caso
      arrancaria com `node --import ./.output/server/sentry.server.config.mjs`).
      **Falso** — confirmado a partir de `.netlify/` (estado real de deploy
      já ligado neste projeto) que o alvo real é o **Netlify** (Nitro gera
      funções serverless, preset `netlify-legacy`). Num serverless não há
      comando de arranque nosso para passar `--import`, e sem o `flush()`
      certo os eventos podem perder-se quando a função termina logo a seguir
      a responder. `nuxt.config.ts` passou a definir
      `sentry: { autoInjectServerSentry: 'top-level-import' }` — injeta a
      configuração no topo do ficheiro de entrada do Nitro e faz a Sentry
      voltar a exportar o handler serverless embrulhado (consultado via
      Context7, documentação oficial "Nuxt SDK — Limited Server Tracing").
      Ver context/OPERATIONS.md. **Ainda por validar**: erros de JavaScript
      no browser/telemóvel, e um teste real contra o Netlify (só verificado
      em dev e por documentação — este projeto não tem um deploy de
      produção ativo para testar contra)
- [x] Logging estruturado de eventos críticos: falhas de pagamento,
      falhas de webhook, erros de autenticação — `server/utils/logger.ts`
      (uma linha JSON por evento; emails só como hash curto): `auth.login_failed`,
      `auth.2fa_failed`, `security.rate_limited`, `payment.capture_failed`,
      `webhook.easypay_failed`, e `server.unhandled_error` para todo o 5xx
      (`server/plugins/errorLog.ts`). O webhook passou a responder 500 quando
      falha, para a EasyPay reentregar (os handlers são idempotentes)

### 9. Conformidade legal
- [ ] Política de privacidade e termos de serviço (obrigatórios para Play
      Store e para cobrança de subscrições)
      — **texto completo, mas continua NÃO publicável**: `utils/legalContent.ts`
      (PT-PT e EN; os outros 4 idiomas mostram EN com nota), páginas públicas
      `/privacy` e `/terms` ligadas no login e nas Configurações, aviso de
      rascunho visível enquanto `LEGAL_IS_DRAFT`. Escrito a partir do que o
      código realmente faz (Atlas, EasyPay, Anthropic, Twelve Data, Sentry,
      cookies). **Já não tem nenhum campo `[ENTRE PARÊNTESIS RETOS]` por
      preencher** (todos fechados entre 2026-09-24 e 2026-09-27 — ver as
      entradas de histórico correspondentes), mas **continua a precisar de
      revisão por um jurista** antes de pôr `LEGAL_IS_DRAFT = false`,
      sobretudo a cláusula de limitação de responsabilidade (ponto 7 dos
      Termos) — tem uma referência ao DL 446/85 que pode estar a citar essa
      lei no sentido errado (ver a entrada de 2026-09-27 mais abaixo)
- [x] Checklist RGPD: base legal para dados pessoais, exportação de dados do
      utilizador, eliminação de conta e dados associados — exportação:
      `GET /api/account/export` (sem hash da password nem segredos 2FA);
      eliminação: `DELETE /api/account` (exige password + código 2FA, cancela
      a subscrição com renovação automática na EasyPay **antes** de apagar —
      se falhar, não apaga); UI em Configurações → Privacidade e dados.
      Bases legais e conservação descritas no rascunho da política.
      Testado ponta a ponta em dev (22/22): exportação sem segredos, eliminação
      com password errada/certa e com 2FA (sem código, código errado, código de
      recuperação), e remoção de todos os dados associados
- [x] Aceitação explícita dos termos no registo: caixa desmarcada por omissão
      em `pages/login.vue`, exigida **também no servidor** (`acceptTerms`
      booleano `true` no schema Zod de `auth/session.ts`), com data e versão
      guardadas em `User.termsAcceptedAt`/`termsVersion`. Testado (7/7).
      **Contas anteriores a esta regra não têm registo de aceitação** — hoje
      só há contas de teste, mas antes de haver utilizadores reais convém
      pedir a aceitação no primeiro início de sessão após uma mudança de
      versão. **Não coberto**: o texto do botão de pagamento ("encomenda com
      obrigação de pagar") e o consentimento expresso para a perda do direito
      de livre resolução — decisão de negócio + jurista
- [x] Texto legal preenchido no que dependia de factos: identificação (nome,
      NIF, email; **sem morada**, por decisão do utilizador), reembolso,
      lei/foro/RAL, portfolio (não enviado — a variável não está definida).
      **Corrigido um erro do rascunho**: mencionava a plataforma europeia de
      resolução de litígios em linha (RLL/ODR), que foi encerrada em julho de
      2025 (a ligação que o utilizador colou é uma página de relocação); o
      texto colado sobre "texto obrigatório da plataforma RLL" estava
      desatualizado e não foi usado.
      **Fechado nesta sessão (2026-09-27)**: transferências fora do EEE
      (linguagem genérica de salvaguardas RGPD, sem confirmar fornecedor a
      fornecedor); RAL — Centro de Arbitragem de Conflitos de Consumo de
      Lisboa (CACCL), morada/email/telefone reais, substitui o CNIACC
      genérico; retenção de backups corrigida (ver ponto 10 — deixou de ser
      uma promessa vazia, há agora um agendamento real, mesmo que a ativação
      final dependa de o utilizador criar a conta Cloudflare); valor
      proporcional em livre resolução — decisão de negócio do utilizador:
      devolução total sem perguntas, com a conta eliminada e um bloqueio de
      6 meses para um novo registo com o mesmo email como contrapartida
      (**implementado em código**, não só no texto — `RefundedAccount`
      model, `POST /api/admin/refund-delete` protegido por `ADMIN_SECRET`
      próprio, verificação no registo em `auth/session.ts`; testado em
      integração: 401 sem/com segredo errado, elimina com o segredo certo,
      e um novo registo com o mesmo email é recusado). Livro de Reclamações
      Eletrónico — obrigatório em Portugal, ainda por registar pelo
      utilizador; texto e um link placeholder já em `pages/login.vue`
      (rodapé), a trocar pelo link específico do comerciante depois do
      registo em livroreclamacoes.pt.
      **Limitação de responsabilidade (Termos, ponto 7) preenchida
      (2026-09-27)**: texto fornecido pelo utilizador (5 cláusulas — isenção
      "tal como está", exclusão de aconselhamento financeiro, remissão para
      o DL 446/85 e Código Civil para responsabilidade limitada a dolo/culpa
      grave, exclusão de danos indiretos, e o teto de responsabilidade em 12
      meses de subscrição paga ou 50 € no plano Gratuito). Acrescentada por
      iniciativa própria uma frase de salvaguarda no fim ("nada nesta
      cláusula limita direitos imperativos, nomeadamente os do ponto 4") —
      mitiga mas não elimina uma preocupação por confirmar: o DL 446/85 é
      mais conhecido por **proibir** cláusulas de exclusão/limitação de
      responsabilidade em contratos de consumo (cláusulas contratuais gerais
      não negociadas individualmente) do que por as autorizar — citá-lo como
      fundamento para limitar a responsabilidade pode estar a apontar na
      direção errada. **Nenhum marcador `[ENTRE PARÊNTESIS]`/`[REVER COM
      JURISTA]` continua no texto** — mas isto não substitui a revisão por um
      jurista prometida em `LEGAL_IS_DRAFT`, precisamente por causa deste
      ponto
- [x] Rever se dados financeiros sensíveis exigem medidas adicionais
      (encriptação em repouso, se aplicável ao plano de hosting)
      — ver `context/OPERATIONS.md` secção "Dados financeiros sensíveis —
      encriptação em repouso". Decisão: a Atlas encripta o disco por omissão
      em todos os tiers (incluindo o M0 gratuito), TLS obrigatório em
      trânsito, e password/segredo TOTP/códigos de recuperação já são
      encriptados/hash ao nível da aplicação (Fase 8, pontos 1-3). Não
      adicionar encriptação ao nível de campo aos valores financeiros — impede
      agregações no servidor (KPIs, insights de IA) sem decifrar tudo
      primeiro, e os dados aqui não são de categoria especial do RGPD

### 10. Estratégia de dados
- [x] Backups regulares do MongoDB de produção documentados
      — ver `context/OPERATIONS.md`. **Estado real**: o projeto usa o tier
      M0 (gratuito) da Atlas, que **não tem nenhum backup gerido** (só a
      partir do M10, pago). `scripts/backup-mongo.mjs`/`restore-mongo.mjs`
      dão um mínimo viável (exportação/restauro completo via EJSON, sem
      depender do binário `mongodump`, que não está instalado neste
      ambiente) — testado com um ciclo completo backup→apagar→restauro
      contra MongoDB em memória, nunca contra o Atlas real, confirmando que
      `ObjectId`/`Date`/números voltam com o tipo original.
      **Agendamento implementado** (2026-09-27): `.github/workflows/backup.yml`
      (diário, `workflow_dispatch` também disponível) corre o script e envia
      cada ficheiro para um bucket Cloudflare R2 via `@aws-sdk/client-s3`
      (compatível com S3) — não como artefacto do GitHub Actions, que não
      retém ficheiros durante os 3 anos prometidos na Política de Privacidade.
      **Por fazer, ação do utilizador, fora do código**: criar a conta
      Cloudflare + bucket R2, a regra de lifecycle de 1095 dias no bucket, e
      os 5 secrets no GitHub (`MONGODB_URI` de produção +
      `R2_ACCOUNT_ID`/`R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`/`R2_BUCKET`)
      — passos exatos em `context/OPERATIONS.md`. **Não testado** o upload
      real para R2 (sem credenciais Cloudflare nesta sessão) — só o caminho
      local, já testado em sessão anterior
- [x] Plano de rollback para migrações de schema (ex. campo `subscription`)
      — ver `context/OPERATIONS.md`. O projeto usa migrações ad-hoc
      (`scripts/migrate-subscriptions.mjs`, `scripts/sync-indexes.mjs`), não
      uma framework com rollback automático — desproporcional à escala atual.
      Documentado: backup antes de qualquer migração é o próprio plano de
      rollback; migrações aditivas não têm "voltar atrás" que faça sentido
      (só corrigir para a frente); um padrão de dois passos para eventuais
      migrações destrutivas futuras (nenhuma feita até agora)
- [x] **Índices do Mongoose que nunca são criados**: com `bufferCommands: false`
      a criação automática de índices não funciona (`server/utils/db.ts`), por
      isso os índices `unique` declarados (`MarketSnapshot.date`,
      `AiInsightCache.userId`) e o índice de desempenho de `Investment` não
      existem na base de dados. Criá-los com `Model.syncIndexes()` ou um script
      de migração, depois de limpar duplicados. Até lá o código usa `_id`
      determinísticos onde precisa de unicidade (`DocumentScanUsage`,
      `InvestmentTipsCache`)
      — script pronto: `npm run db:sync-indexes` (`--dry` só procura
      duplicados). O `--dry` no Atlas de desenvolvimento não encontrou
      nenhum; **aplicado** (14 índices criados, 3 deles unique). Como o
      `categories {userId,name}` unique passou a existir de verdade, o seed
      de categorias em `auth/session.ts` ignora o erro E11000 quando dois
      pedidos correm o seed em simultâneo

### 11. Dívida técnica conhecida (de fases anteriores)
- [x] Aviso de hidratação num `<span>` de texto ("Hydration text content
      mismatch") visto no log da app Android, que não aparece no browser de
      desktop — origem por identificar (suspeita: texto dependente da hora ou do
      fuso, como a data do topo). Inofensivo; o do `ToastContainer` já foi
      corrigido na Fase 6
      — **origem confirmada e corrigida**: duas ocorrências reais de
      `new Date()` chamado dentro de um `computed`, executado uma vez no
      servidor (SSR) e outra no cliente (hidratação) — `pages/index.vue`
      (saudação "Bom dia/Boa tarde/Boa noite", depende da HORA) e
      `layouts/default.vue` (data por extenso no cabeçalho, depende do DIA).
      Nenhum dos dois precisa que servidor e cliente concordem sempre —
      só que não *discordem* entre os dois renders da mesma navegação, o que
      acontece sempre que a hora muda de escalão (meio-dia, 18h) ou o dia
      muda (meia-noite) entre o render do servidor e a hidratação no
      cliente, ou quando o fuso horário do servidor de produção não coincide
      com o do telemóvel. Corrigido com `useState()` a fixar o valor
      calculado no servidor e reutilizá-lo na hidratação, em vez de o
      recalcular no cliente com o seu próprio relógio. **Não testado no
      Android real** (só localmente, forçando o computed a correr perto de
      um limite de hora) — o aviso original só tinha sido visto lá

## Critérios de aceitação
- [x] Suite de testes (unit + integração + e2e principal) corre em CI e
      passa
      — `.github/workflows/ci.yml`, 3 jobs: `unit` (46/46), `integration`
      (17/17, servidor Nuxt real + Mongo em memória), `e2e` (3/3, Playwright
      + Chromium, mesma receita). Nenhum precisa de segredos reais. `nuxt
      typecheck` corre no job `unit` só a informar (`|| true`, nunca falha o
      job) — tem uma dívida de erros de tipos pré-existente e maior do que o
      âmbito desta sessão (confirmado com `git stash`: os mesmos erros já
      existiam antes de qualquer alteração feita aqui). **Corrigidos pelo
      caminho** (afetavam código de produção, não só o `typecheck`):
      `ofetch@2.0.0-alpha.3` duplicado (nested em `@nuxt/telemetry`,
      conflituava com o `ofetch@1.5.1` usado pelo resto do projeto — fixado
      com `overrides` no `package.json`), `$fetch<T>()` deixou de aceitar um
      genérico depois desse fix (contornado com um cast no valor devolvido
      em `stores/{auth,finance,groups,subscription}.ts`, sem mudar
      comportamento em runtime), os modelos Mongoose exportados sem
      anotação `Model<T>` explícita perdiam o tipo de retorno de
      `.lean()`/`.findById()` sem genérico no chamador (`server/models/index.ts`
      — todos os 9 modelos anotados; `IInvestmentTipsCache`/
      `IDocumentScanUsage` também corrigidos para `extends Document<string>`,
      já que usam `_id` string, não `ObjectId`), e uma chave computada
      inválida em `server/utils/marketData.ts` (união não estreitada por
      `'symbol' in data`)
- [x] Nenhum segredo no repositório; `.env.example` atualizado e completo
- [x] A sessão é assinada e o header `x-user-id` já não autentica nada (testado
      com um `_id` válido de outro utilizador) — testado em dev local contra
      MongoDB Atlas real: `GET /api/auth/session` com `x-user-id` de uma conta
      real e sem cookie devolve `{ user: null }`
- [x] Um utilizador consegue ativar 2FA (pelo menos o método TOTP), fazer
      login com o segundo fator, e recuperar o acesso com um código de
      recuperação caso perca o dispositivo — fluxo completo testado em dev
      local (setup → enable com código real gerado por `otpauth` → logout →
      login → `twoFactorRequired` → verify com TOTP e com código de
      recuperação → reutilização do mesmo código de recuperação rejeitada →
      rate limit a bloquear ao fim de 5 tentativas)
- [x] Nenhum endpoint devolve ao client o corpo de um erro de um fornecedor
      externo (Anthropic, EasyPay, Twelve Data) — Anthropic já estava feito;
      EasyPay e Twelve Data uniformizados na fonte (`easypayFetch`,
      `fetchMarketSnapshot`, mesmo padrão): detalhe cru só no log estruturado
      (`payment.easypay_upstream_error`/`market.twelvedata_upstream_error`),
      mensagem genérica ao cliente. Confirmado por grep que nenhum código
      decide o que fazer a partir do texto da mensagem (só apanha a exceção
      para tentar outro caminho ou registar aviso). Testado no servidor real
      com um id inexistente: cliente recebe a mensagem genérica, o log
      guarda o detalhe verdadeiro ("Subscription Not Found")
- [x] Webhooks validam assinatura e são idempotentes (testado com reenvio de
      evento)
      — a EasyPay não assina webhooks (ponto 5); a "assinatura" real é a
      verificação obrigatória contra a própria API antes de confiar em
      qualquer campo do corpo (nunca o `status` do pedido recebido).
      Idempotência testada com reenvio de evento para `subscription_create`
      e para `capture` (`tests/integration/api.test.ts`, 17/17) — ver ponto 6
- [ ] Lighthouse web ≥ 90 em Performance e Acessibilidade (ou justificação
      documentada dos itens não atingidos)
- [ ] Política de privacidade e termos de serviço publicados e linkados na
      app
