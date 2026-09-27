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
bloqueada 6 meses para um novo registo com o mesmo email. Como não há
reembolso automático via API da EasyPay integrado neste projeto, o fluxo é
manual, feito pelo operador (tu):

1. O pedido chega por email (dinismiguelcosta@gmail.com, conforme os Termos).
2. Processas o reembolso manualmente no dashboard da EasyPay.
3. Chamas o endpoint de administração para apagar a conta e aplicar o
   bloqueação de 6 meses:
   ```bash
   curl -X POST https://<domínio-de-produção>/api/admin/refund-delete \
     -H "content-type: application/json" \
     -H "x-admin-secret: <o valor de ADMIN_SECRET>" \
     -d '{"email":"cliente@exemplo.com"}'
   ```
   Cancela primeiro qualquer subscrição com renovação automática na EasyPay
   (se existir) — se essa cancelação falhar, a conta NÃO é apagada, para não
   ficares a cobrar alguém já reembolsado.

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
