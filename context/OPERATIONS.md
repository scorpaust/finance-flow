# Operações — FinanceFlow

> Fase 8, ponto 10 (Estratégia de dados) e o item correspondente do ponto 9
> (dados financeiros sensíveis). Ver
> `context/features/08-FASE-8-seguranca-qualidade.md` para o checklist
> completo da Fase 8.

## Backups do MongoDB

**Estado atual**: o projeto usa MongoDB Atlas no tier **M0 (gratuito)**. A
Atlas só oferece backups geridos (Continuous Cloud Backup, com
"point-in-time recovery" ao segundo, restauro num clique) a partir do tier
**M10** (pago) — o M0 **não tem nenhum backup automático da parte da Atlas**.
Isto não é uma omissão de configuração; é uma limitação do tier.

**Solução mínima enquanto o projeto estiver no M0**: `scripts/backup-mongo.mjs`
exporta todas as coleções para EJSON (preserva `ObjectId`/`Date`/etc., ao
contrário de `JSON.stringify` simples — usa o `mongoose.mongo.BSON.EJSON` já
disponível via o mongoose do projeto, sem depender do binário `mongodump`,
que não está instalado neste ambiente). Testado com um ciclo completo
backup → apagar a coleção → `scripts/restore-mongo.mjs` → confirmar que o
`_id`/`Date`/número voltam com o tipo original (não como texto), correndo
contra uma instância MongoDB em memória (nunca contra o Atlas real).

```bash
# Backup manual
MONGODB_URI=<uri-de-produção> node scripts/backup-mongo.mjs
# grava em backups/<timestamp>/<coleção>.json (pasta local, .gitignore)

# Restauro (recusa-se a correr contra um URI que não seja localhost, a não
# ser que forces com --force — pensado para não restaurar em produção por engano)
MONGODB_URI=<uri> node scripts/restore-mongo.mjs backups/<timestamp>
```

**Decisão tomada (2026-09-27)**: agendar `scripts/backup-mongo.mjs` via
GitHub Actions (`.github/workflows/backup.yml`, diariamente às 03:17 UTC),
com upload para **Cloudflare R2** (compatível com S3, nível gratuito de
10GB) em vez de guardar como artefacto do workflow — os artefactos do
GitHub Actions não retêm ficheiros durante 3 anos (o limite é muito menor),
e a Política de Privacidade (ponto 6) promete reter cópias de segurança até
3 anos.

**Passos que faltam no lado da conta (não é código, é configuração)**:
1. Criar uma conta Cloudflare (grátis) e um bucket R2 (ex. `financeflow-backups`).
2. Gerar um R2 API token (Cloudflare dashboard → R2 → Manage API tokens →
   "Object Read & Write", restrito a esse bucket) — dá o Account ID, Access
   Key ID e Secret Access Key.
3. No bucket, em Settings → Object lifecycle rules, criar uma regra que
   expira ("Delete objects") objetos com mais de **1095 dias** (3 anos) —
   isto é o que torna a promessa "até 3 anos" da Política de Privacidade
   verdadeira; sem esta regra os backups ficam para sempre (não é errado,
   mas não corresponde ao que o texto diz).
4. No repositório GitHub, em Settings → Secrets and variables → Actions,
   criar os secrets `MONGODB_URI` (a ligação de **produção**, não a de
   desenvolvimento), `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
   `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.

Sem esses 5 secrets configurados, o workflow `backup.yml` corre mas falha
(sem `MONGODB_URI` o script recusa-se a arrancar; sem as variáveis `R2_*` o
script já não falha — só avisa e grava apenas localmente dentro do runner,
que é destruído no fim, ou seja, sem efeito prático). Testado localmente
apenas com o caminho local (sem R2) — o upload para R2 em si **não foi
testado contra um bucket real** (não há credenciais Cloudflare
disponíveis nesta sessão); a lógica é uma chamada `PutObjectCommand` direta
do `@aws-sdk/client-s3` contra o endpoint `https://<account-id>.r2.cloudflarestorage.com`,
o padrão documentado da própria Cloudflare para usar o SDK da AWS com R2.

Continua válida a alternativa de subir para o tier **M10** da Atlas
(~57 USD/mês em 2026) e usar o Continuous Cloud Backup nativo em vez desta
solução — não escolhida por ter um custo mensal fixo bem mais alto do que
R2 + Actions (ambos com níveis gratuitos suficientes para este volume).

## Reembolso por livre resolução (14 dias) — como aplicar

Os Termos de Serviço (ponto 4) prometem devolução total sem perguntas nos
primeiros 14 dias, com a contrapartida de a conta ser eliminada e ficar
bloqueada 6 meses para um novo registo com o mesmo email. Não há reembolso
automático via API da EasyPay integrado neste projeto, nem nenhum ecrã na
app onde o cliente peça isto — o fluxo é inteiramente manual, por email,
feito pelo operador (tu). **Sem um passo de confirmação explícita, não há
nenhum registo de que o cliente sabia da consequência (eliminação + bloqueio
de 6 meses) e quis mesmo avançar** — por isso o passo 2 abaixo não é
opcional, é o que serve de prova do consentimento.

1. O pedido chega por email (dinismiguelcosta@gmail.com, conforme os Termos).
2. **Antes de processar nada**, responde com o modelo abaixo (PT ou EN,
   conforme o idioma do cliente) e espera pela confirmação explícita por
   escrito. Guarda os dois emails (o teu e a resposta dele) — ex. numa
   etiqueta/pasta "Reembolsos" — é o único registo que vai existir de que
   ele foi avisado e concordou.
3. Só depois de receberes essa confirmação, processas o reembolso. O passo
   depende de onde foi feita a compra:
   - **Site (EasyPay):** à mão, no dashboard da EasyPay.
   - **App Android (Google Play):** não há nada a fazer à mão. O passo 4
     pede o reembolso à Google pela API (revoke com reembolso total) e
     termina o acesso. Se a resposta trouxer `googlePlayRefundFailed: true`,
     reembolsa à mão na Play Console (Encomendas).
4. Chamas o endpoint de administração para apagar a conta e aplicar o
   bloqueio de 6 meses:
   ```bash
   curl -X POST https://<domínio-de-produção>/api/admin/refund-delete \
     -H "content-type: application/json" \
     -H "x-admin-secret: <o valor de ADMIN_SECRET>" \
     -d '{"email":"cliente@exemplo.com"}'
   ```
   Cancela primeiro qualquer subscrição com renovação automática, na EasyPay
   ou na Google Play (se existir). Se essa cancelação falhar, a conta NÃO é
   apagada, para não ficares a cobrar alguém já reembolsado.

### Modelo de email — PT-PT

```
Assunto: Confirmação necessária — reembolso e eliminação de conta (FinanceFlow)

Olá [nome],

Recebi o teu pedido para exercer o direito de livre resolução da tua
subscrição FinanceFlow. Antes de avançar, confirmo os termos exatos (ponto 4
dos Termos de Serviço):

- Vais receber a devolução total do valor pago, sem qualquer dedução, no
  prazo de 14 dias a contar de hoje.
- Em contrapartida, a tua conta ([email]) vai ser ELIMINADA de forma
  irreversível — todos os teus dados, transações, investimentos e
  definições serão apagados.
- Não poderás criar uma nova conta com este mesmo email durante os 6 meses
  seguintes.

Para avançar, responde a este email com a frase exata:

"Confirmo que quero o reembolso total e aceito que a minha conta seja
eliminada e que fico impedido de criar uma nova conta com este email
durante 6 meses."

Assim que receber essa confirmação, processo o reembolso e elimino a conta.
Se tiveres dúvidas antes de confirmar, responde a este email.

Cumprimentos,
Dinis
```

### Email template — EN

```
Subject: Confirmation needed — refund and account deletion (FinanceFlow)

Hi [name],

I received your request to exercise your right of withdrawal for your
FinanceFlow subscription. Before proceeding, let me confirm the exact terms
(Terms of Service, section 4):

- You will receive a full refund of the amount paid, with no deductions,
  within 14 days from today.
- In exchange, your account ([email]) will be PERMANENTLY DELETED — all
  your data, transactions, investments and settings will be erased.
- You will not be able to create a new account with this same email for the
  following 6 months.

To proceed, please reply to this email with the exact sentence:

"I confirm I want the full refund and I accept that my account will be
deleted and that I will not be able to create a new account with this
email for 6 months."

Once I receive that confirmation, I will process the refund and delete the
account. If you have any questions before confirming, just reply here.

Best,
Dinis
```

## Plano de rollback para migrações de schema

O projeto usa migrações **ad-hoc** (`scripts/migrate-subscriptions.mjs`,
`scripts/sync-indexes.mjs`), não uma framework de migrações com versões e
rollback automático — proporcional à escala atual (uma pessoa, sem
utilizadores reais ainda). Isto documenta a estratégia real, não inventa uma
mais pesada do que o projeto precisa:

1. **Antes de qualquer migração em produção**: correr
   `node scripts/backup-mongo.mjs` contra o `MONGODB_URI` de produção. É o
   plano de rollback — restaurar o backup anterior à migração
   (`scripts/restore-mongo.mjs ... --force --drop`) se algo correr mal.
2. **Migrações aditivas** (acrescentar um campo com um valor por omissão,
   como `migrate-subscriptions.mjs` fez ao campo `subscription`, ou os
   índices de `sync-indexes.mjs`): não têm rollback "para trás" que faça
   sentido — reverter significaria apagar dados que o código já passou a
   depender de ler. O caminho seguro é sempre para a frente: se a migração
   correu mal, corrige-se com outra migração pequena, não desfazendo a
   anterior.
3. **Migrações destrutivas** (renomear/remover um campo, mudar o tipo de um
   campo existente): nenhuma feita até agora. Se vier a ser necessário, o
   padrão a seguir é: (a) backup antes, (b) fazer a app aceitar AMBOS os
   formatos (antigo e novo) num deploy só de leitura tolerante, (c) só depois
   correr a migração que reescreve os dados, (d) só num deploy seguinte
   remover o suporte ao formato antigo do código. Nunca migrar dados e código
   incompatível com o formato antigo no mesmo deploy — não há como recuar sem
   o backup completo.
4. Cada script de migração já é **idempotente** por construção
   (`sync-indexes.mjs`: `createIndex` não faz nada se já existe;
   `migrate-subscriptions.mjs`: só actualiza quem ainda não tem o campo) —
   corrê-lo outra vez por engano, incluindo depois de um restauro parcial,
   não duplica nem corrompe nada.

## Dados financeiros sensíveis — encriptação em repouso

Revisão do que já está encriptado e do que depende só da infraestrutura:

- **Disco (Atlas)**: a MongoDB Atlas encripta os dados em repouso ao nível do
  armazenamento (AES-256) em **todos os tiers, incluindo o M0 gratuito** —
  isto não é uma opção a ligar, é sempre-ligado na Atlas, gerido pelo
  provedor de cloud subjacente. Cobre a base de dados completa (transações,
  investimentos, etc.), independentemente do código da aplicação.
- **Em trânsito**: TLS obrigatório na ligação `mongodb+srv://` à Atlas (não
  é possível desligar) e HTTPS no `APP_URL` de produção.
- **Encriptado também ao nível da aplicação** (Fase 8, já implementado):
  password (scrypt, nunca reversível), segredo TOTP do 2FA (AES-256-GCM,
  `server/utils/twoFactor.ts`), códigos de recuperação do 2FA (hash SHA-256,
  nunca em texto simples).
- **Não encriptado ao nível da aplicação**: valores e descrições de
  transações, dados de investimento, perfil de investidor. Só protegidos
  pela encriptação de disco da Atlas + autenticação/autorização da app (cada
  pedido só lê os dados do próprio `userId`, ver `server/utils/auth.ts`).

**Decisão**: não adicionar encriptação ao nível de campo (ex.
`mongodb-client-side-field-level-encryption`) aos valores financeiros.
Razões: (1) FinanceFlow trata dados financeiros pessoais correntes, não dados
de categoria especial do RGPD (saúde, biometria genética, etc. — a foto do
documento digitalizado, Fase 5, também não fica guardada, só passa pela
Anthropic); (2) impede agregações no servidor (somas mensais, gráficos,
insights de IA) sem decifrar tudo primeiro, o que anularia a proposta de
valor da app; (3) a Atlas já garante encriptação de disco por omissão. Se o
âmbito do produto vier a incluir dados de categoria especial, esta decisão
deve ser reaberta.

## Keystore Android (release)

Fase 9. A keystore assina cada `.aab` enviado para a Play Console. **Perdê-la
(ou a password) impede publicar atualizações da app** — só a Google pode
repor uma chave de upload, e só com Play App Signing ativo.

1. **Criar** (uma vez), fora do repositório:
   ```bash
   keytool -genkeypair -v -keystore financeflow-upload.jks -alias upload \
     -keyalg RSA -keysize 2048 -validity 10000
   ```
2. **Configurar o build** — criar `android/keystore.properties` (está no
   `.gitignore`, nunca vai para o git):
   ```properties
   storeFile=C:/caminho/seguro/financeflow-upload.jks
   storePassword=...
   keyAlias=upload
   keyPassword=...
   ```
   Em CI, em alternativa, as variáveis `ANDROID_KEYSTORE_PATH`,
   `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.
   Sem nenhum dos dois, `bundleRelease` recusa-se a correr
   (`android/app/build.gradle`) — nunca sai um bundle sem assinatura.
3. **Play App Signing** (recomendado, é o default para apps novas): a Google
   guarda a chave de assinatura final; a nossa passa a ser só a *chave de
   upload*. Se a de upload se perder, pede-se uma nova à Google em vez de
   perder a app.
4. **Backup**: o `.jks` e as passwords em **dois** sítios independentes (ex.
   gestor de passwords com anexo + pen/cofre offline). Nunca por email,
   nunca na mesma pasta do código, nunca num serviço sincronizado com o
   repositório.

## Versões da app Android

- `versionCode` (`android/app/build.gradle`): inteiro, **+1 em cada upload**
  para a Play Console, mesmo que o upload seja descartado — a Play Console
  nunca aceita um `versionCode` repetido ou menor.
- `versionName`: acompanha o `"version"` do `package.json` (semver — patch
  para correções, minor para funcionalidades novas).
- Como a app Android é uma shell que carrega o site de produção
  (`capacitor.config.ts` → `server.url`), a maior parte das alterações chega
  aos utilizadores Android **só com o deploy web**, sem nova versão na loja.
  Uma nova versão Android só é precisa para mudanças nativas (plugins
  Capacitor, permissões, ícone/splash, manifest, `server.url`).

## Deploy web (Netlify)

- **Publicar a partir desta máquina: `npm run deploy:netlify`**
  (`scripts/deploy-netlify.mjs`) — nunca um `netlify deploy --build` simples
  em Windows: o `.env` local entrava no build de produção, e as junctions que
  o Nitro cria para as duas versões do `vue-router` chegavam partidas ao
  Linux do Netlify (502 em todas as páginas no 1.º deploy, 2026-09-30). O
  script afasta o `.env`, faz o build, troca as ligações por cópias, apaga o
  zip já gerado e publica com `--no-build`. Demora ~45 min nesta máquina. Com
  o repositório ligado ao Netlify (build no Linux deles) nada disto é preciso.
- **Rascunho antes de produção**: `npm run deploy:netlify -- --alias <nome>`
  publica em `https://<nome>--financeflow-webapp.netlify.app` sem mudar a
  produção (mesmas variáveis e mesma base de dados — usar as contas
  `tester-*`). Usado no Upgrade 10.
- **Funções**: preset Nitro `netlify` (Functions v2, Upgrade 10). Se um build
  mostrar `netlify-legacy`, a `compatibilityDate` de `nuxt.config.ts` foi
  perdida — com o legacy volta o limite de 4 KB nas variáveis.
- Configuração do build: `netlify.toml` (raiz). O site está ligado ao
  projeto (`.netlify/state.json`), subdomínio
  `financeflow-webapp.netlify.app` (decisão de 2026-09-29, até haver
  domínio próprio — renomear o site no Netlify muda o subdomínio, e então é
  preciso atualizar `APP_URL`, `capacitor.config.ts` e o webhook EasyPay).
- Variáveis de ambiente: todas as de `context/CONFIG-REFERENCE.md`, no painel
  do Netlify (Site configuration → Environment variables). Em produção
  `SESSION_SECRET`, `TWO_FACTOR_ENCRYPTION_KEY`, `CRON_SECRET` e
  `ADMIN_SECRET` **gerados de novo**, nunca copiados do `.env` de
  desenvolvimento.
- Webhook EasyPay: no painel da EasyPay, apontar para
  `<APP_URL>/api/subscription/easypay/webhook` (desde 2026-10-10:
  `https://www.financeflow-webapp.pt/api/subscription/easypay/webhook`) (primeiro na conta sandbox;
  na conta de produção quando se ligar `EASYPAY_ENV=production`).
- Crons (`.github/workflows/cron.yml`): secrets `APP_URL` e `CRON_SECRET` no
  GitHub (o mesmo `CRON_SECRET` do Netlify).
- Índices: correr `npm run db:sync-indexes` contra a base de dados de
  produção antes do primeiro deploy e depois de qualquer alteração a índices.

## Lançamento e rollout

Decisões de 2026-09-29: web no Netlify, pagamentos EasyPay em **sandbox**
durante os testes internos, produção real só na promoção para a faixa
pública.

1. **Web**: deploy no Netlify com `EASYPAY_ENV=test`; verificar HTTPS, login,
   registo, uma subscrição sandbox de cada método, e os avisos da CSP na
   consola (ver `nuxt.config.ts`).
2. **Android — testes internos**: `.aab` assinado na faixa de testes
   internos; instalar a partir da Play Store num dispositivo real e repetir o
   fluxo (login, subscrição sandbox, funcionalidades por plano); confirmar que
   a mesma conta mostra o mesmo plano na web e no Android.
3. **Passagem a pagamentos reais**: `EASYPAY_ENV=production` e credenciais de
   produção no Netlify, webhook na conta EasyPay de produção, uma subscrição
   real de baixo valor para confirmar, reembolsada a seguir.
4. **Produção na Play Store**: só com a Google Play Billing configurada
   (`context/PLAY-STORE.md`, secção 5: produtos, conta de serviço, RTDN) e
   uma compra de teste de cada tipo feita por um testador de licenças.
   Rollout faseado 20% → 50% → 100%, pelo menos 48 h em cada passo, a vigiar
   o Sentry e os registos do Netlify.

## Rollback

- **Web** (a maioria dos problemas, incluindo na app Android): Netlify →
  Deploys → escolher o último deploy bom → **Publish deploy**. Instantâneo,
  sem novo build. Se o problema for de dados, ver "Plano de rollback para
  migrações de schema" acima.
- **Android**: a Play Console não permite voltar a uma versão anterior. Num
  rollout faseado, **Halt rollout** para parar a distribuição; a correção sai
  numa versão nova (`versionCode` +1). Como a app carrega o site, um problema
  só da parte web resolve-se com o rollback web acima.
- **Pagamentos**: se algo falhar com pagamentos reais, voltar
  `EASYPAY_ENV=test` no Netlify (novos checkouts deixam de cobrar) e tratar
  os pagamentos já feitos manualmente no painel da EasyPay.
- **Contacto**: o operador (email de contacto publicado nos Termos e na
  Política de Privacidade, `utils/legalContent.ts`) é quem decide e executa
  o rollback; os utilizadores reportam problemas pelo mesmo email.

## Preços — como mudar

Só na **Play Console**: Monetizar com o Google Play → Subscrições → `pro`
ou `premium` → cada base plan → Preços → **linha de Portugal** (e dos
outros países do euro), com o valor final já com IVA.

- O site e o checkout EasyPay seguem sozinhos em cerca de 10 minutos.
- Para confirmar: `GET /api/billing/prices` deve devolver
  `source: "google_play"` e os valores novos.
- Uma subscrição EasyPay com renovação automática já criada continua com o
  valor antigo até ser renovada à mão (cancelar e subscrever de novo).
- Na Play, a Google trata das subscrições existentes segundo as regras de
  alteração de preço dela.

## Google Play Billing — vigiar e resolver (Upgrade 01)

Compras da app Android. A Google cobra; o servidor só lê o estado e aplica-o
à conta. Configuração: `context/PLAY-STORE.md`, secção 5.

- **Logs do Netlify** (eventos `google_play.*`):
  - `synced`: normal;
  - `ack_failed`: a confirmação à Google falhou. A reconciliação diária
    repete-a, e a Google reembolsa ao fim de 3 dias sem confirmação. Se
    persistir, ver a conta de serviço;
  - `unknown_user`: uma compra que não liga a nenhuma conta;
  - `web_conflict_revoked`: compra na Play com um plano da web ativo,
    revogada com reembolso;
  - `rtdn_not_configured`: falta `GOOGLE_PLAY_RTDN_AUDIENCE`.
- **As notificações (RTDN) pararam:**
  - na Play Console → Configuração da monetização → "Enviar mensagem de
    teste", o log deve mostrar `google_play.rtdn_test`;
  - se não mostrar, ver a subscrição push no Google Cloud Pub/Sub (URL,
    autenticação, audiência);
  - entretanto, a reconciliação diária
    (`.github/workflows/cron.yml` → `google-play-reconcile`) e a leitura de
    `/api/subscription` mantêm os planos certos.
- **Ver as compras de um utilizador:** Play Console → Encomendas, pesquisar
  pelo id da encomenda (`subscription.googlePlayOrderId` na conta).
- **Reembolso fora da livre resolução:** pela Play Console (Encomendas →
  Reembolsar). A Google avisa o servidor (`voidedPurchaseNotification`) e o
  plano cai sozinho.
- **Faturação:**
  - a Google é a vendedora perante o cliente e emite-lhe o recibo;
  - o operador fatura à Google (Google Commerce Ltd, Irlanda) o valor de
    cada pagamento mensal. Regras de IVA intracomunitárias: confirmar com o
    contabilista;
  - as vendas no site continuam a exigir fatura a cada cliente.

## Dados de teste nas contas dos testers (Upgrade 04)

`scripts/seed-test-accounts.mjs` põe 6 meses **completos** de receitas e
despesas realistas (e o mês em curso até hoje) em contas que já existem, para
os testers verem tudo: previsões com o modelo de IA (≥ 5 meses completos),
orçamento sugerido (≥ 3), estatísticas, dois grupos (casa; saídas e lazer) e
uma carteira de 3 investimentos (só se a conta não tiver nenhum). Não cria
contas nem muda o plano. Deteta a língua da conta pelas categorias por
omissão que já tem e usa essas (nunca cria duplicados noutra língua).

Contas de teste em produção: `tester-free`, `tester-pro` e
`tester-premium` `@example.com` (semeadas a 2026-10-09).

```bash
# 1. ver o que faria (não escreve nada)
MONGODB_URI=<uri-de-produção> MONGODB_DB_NAME=financeflow-prod \
  node scripts/seed-test-accounts.mjs --dry email1 email2
# 2. aplicar
MONGODB_URI=<uri-de-produção> MONGODB_DB_NAME=financeflow-prod \
  node scripts/seed-test-accounts.mjs --replace --reset-budget email1 email2
```

- As transações geradas levam a etiqueta `dados-teste`; correr outra vez
  substitui-as (não duplica).
- `--replace` apaga **todas** as transações da conta antes — usar em contas
  que já tinham dados de teste antigos, senão somam-se nos mesmos meses.
- `--reset-budget` apaga a proposta de orçamento sugerido do mês, para o
  tester poder pedir outra (1 pedido por mês).
- As credenciais do `.env` local não têm acesso a `financeflow-prod`: é
  preciso a ligação de produção (a mesma do backup).

## Domínio próprio e emails (Upgrade 05)

Domínio `financeflow-webapp.pt` (registado pelo utilizador a 2026-10-10). DNS
no registador (não na Netlify):

| Tipo | Nome | Valor | Para quê |
|---|---|---|---|
| A | `@` | `75.2.60.5` | site (Netlify) |
| CNAME | `www` | `financeflow-webapp.netlify.app` | site (Netlify) — domínio principal |
| TXT | `resend._domainkey.mail` | chave DKIM da Resend | emails |
| MX | `send.mail` | `feedback-smtp.eu-west-1.amazonses.com` (10) | emails (devoluções) |
| TXT | `send.mail` | `v=spf1 include:amazonses.com ~all` | emails |
| TXT | `_dmarc` | `v=DMARC1; p=none;` → mais tarde `p=quarantine` | emails |

- **Netlify**: `www.financeflow-webapp.pt` é o domínio principal (o apex
  redireciona). Certificado Let's Encrypt automático.
- **Endereços que dependem do domínio** (todos mudados a 2026-10-10): `APP_URL`
  (Netlify e secret do GitHub para os crons), webhook da EasyPay, endpoint da
  subscrição push do Pub/Sub (RTDN da Google Play — a "audience" ficou igual),
  links da Play Console (política de privacidade, site, eliminação de dados) e
  `capacitor.config.ts` (app 1.2.3+).
- **`.netlify.app`**: continua a servir o mesmo site para as versões ≤ 1.2.2 da
  app Android. Redirecioná-lo para o domínio só quando já ninguém as usar.
- **Emails (Resend)**: domínio `mail.financeflow-webapp.pt`, região Irlanda
  (eu-west-1), plano grátis (3 000/mês, 100/dia). Variáveis `RESEND_API_KEY` e
  `EMAIL_FROM` no Netlify (+ redeploy). Se os emails não chegarem: ver o
  estado do domínio e os registos de envio no painel da Resend, e o log
  `email.send_failed` na Netlify.

