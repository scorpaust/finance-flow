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

### 6. Testes automatizados
- [ ] Unit tests (Vitest) para: `useSubscription`, `useFormatters`,
      `hasFeature`/matriz de features, lógica de previsão (partes não-TF), e
      `shared/portfolio.ts` (Fase 6 — é puro de propósito, primeiro candidato:
      exemplos da folha 1,94% / −2,00% / total 1,76%, e `returnPct` nulo sem
      capital investido)
      — **parcial**: Vitest 3.x (a 5.x exige `@types/node` ≥22, o projeto usa
      20) configurado (`npm test`); 24 testes a passar em `tests/`:
      `effectiveTier`/`hasFeature`/matriz, `shared/portfolio.ts` e as funções
      puras do 2FA (TOTP + códigos de recuperação). **Por fazer**:
      `useSubscription`, `useFormatters`, previsão
- [ ] Testes de integração para endpoints críticos: auth, transactions CRUD,
      subscription checkout/webhook (com mocks da EasyPay), insights/IA
      (com mocks da Anthropic e da Twelve Data — nunca chamadas reais nos
      testes, custam dinheiro), `/api/investments` (Fase 6: 403 a Free, 404 para
      o `_id` de outro utilizador, teto de 100 posições, validação, e a regra de
      `valueUpdatedAt` só mudar quando a Situação muda), a cache das dicas de
      investimento (`inputHash` + 24 h, com mock da Anthropic) e o
      `server/middleware/00-db.ts` (um pedido a frio não pode dar 500)
- [ ] E2E (Playwright) do fluxo principal: registo → login → criar
      transação → ver dashboard → tentar aceder a previsões sem Premium
      (deve mostrar paywall) → upgrade sandbox → aceder a previsões
- [ ] E2E cobrindo a Fase 7 (internacionalização): app abre em EN para um IP
      simulado fora dos 6 países suportados (fallback), muda de idioma
      manualmente nas Configurações, e o checkout de subscrição só mostra
      MB WAY/Multibanco para Portugal

### 7. Performance
- [ ] Lighthouse (web) e auditoria equivalente em Android: performance,
      acessibilidade, PWA
- [ ] Carregar TensorFlow.js apenas na página de previsões (lazy/dynamic
      import), não no bundle inicial
- [ ] Rever tamanho de bundle e code-splitting por rota
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
      **Por validar**: erros de JavaScript no browser/telemóvel, e o
      comportamento em produção (o SDK avisa em dev que "detetou um build
      Netlify" e que o envio do servidor pode ser pouco fiável nesse caso —
      a produção usa `node-server` em Docker, mas não foi testada). Em
      produção arrancar com
      `node --import ./.output/server/sentry.server.config.mjs`
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
      — **rascunho escrito, NÃO publicável ainda**: `utils/legalContent.ts`
      (PT-PT e EN; os outros 4 idiomas mostram EN com nota), páginas públicas
      `/privacy` e `/terms` ligadas no login e nas Configurações, aviso de
      rascunho visível enquanto `LEGAL_IS_DRAFT`. Escrito a partir do que o
      código realmente faz (Atlas, EasyPay, Anthropic, Twelve Data, Sentry,
      cookies). **Tem campos `[ENTRE PARÊNTESIS RETOS]` por preencher**
      (responsável pelo tratamento, contacto, prazo dos backups, livre
      resolução/reembolsos, foro, salvaguardas de transferências fora do EEE)
      e **tem de ser revisto por um jurista** antes de pôr
      `LEGAL_IS_DRAFT = false`
- [x] Checklist RGPD: base legal para dados pessoais, exportação de dados do
      utilizador, eliminação de conta e dados associados — exportação:
      `GET /api/account/export` (sem hash da password nem segredos 2FA);
      eliminação: `DELETE /api/account` (exige password + código 2FA, cancela
      a subscrição com renovação automática na EasyPay **antes** de apagar —
      se falhar, não apaga); UI em Configurações → Privacidade e dados.
      Bases legais e conservação descritas no rascunho da política.
      **Não testado ainda** (nem a exportação nem a eliminação)
- [ ] Rever se dados financeiros sensíveis exigem medidas adicionais
      (encriptação em repouso, se aplicável ao plano de hosting)

### 10. Estratégia de dados
- [ ] Backups regulares do MongoDB de produção documentados
- [ ] Plano de rollback para migrações de schema (ex. campo `subscription`)
- [ ] **Índices do Mongoose que nunca são criados**: com `bufferCommands: false`
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
- [ ] Aviso de hidratação num `<span>` de texto ("Hydration text content
      mismatch") visto no log da app Android, que não aparece no browser de
      desktop — origem por identificar (suspeita: texto dependente da hora ou do
      fuso, como a data do topo). Inofensivo; o do `ToastContainer` já foi
      corrigido na Fase 6

## Critérios de aceitação
- [ ] Suite de testes (unit + integração + e2e principal) corre em CI e
      passa
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
- [ ] Nenhum endpoint devolve ao client o corpo de um erro de um fornecedor
      externo (Anthropic, EasyPay, Twelve Data)
- [ ] Webhooks validam assinatura e são idempotentes (testado com reenvio de
      evento)
- [ ] Lighthouse web ≥ 90 em Performance e Acessibilidade (ou justificação
      documentada dos itens não atingidos)
- [ ] Política de privacidade e termos de serviço publicados e linkados na
      app
