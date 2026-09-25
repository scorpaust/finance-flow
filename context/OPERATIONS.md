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

**Por fazer, decisão do utilizador** (não é algo que se resolva só com
código): escolher entre
1. **Agendar** `scripts/backup-mongo.mjs` (ex. GitHub Actions com um cron
   trigger e `secrets.MONGODB_URI` só de leitura, guardando o resultado como
   artefacto do workflow — retenção por omissão de 90 dias) — grátis, mas
   mais um componente para manter, e um restauro completo, não
   point-in-time.
2. **Subir para o tier M10** da Atlas (~57 USD/mês em 2026) e usar o
   Continuous Cloud Backup nativo — sem manutenção, point-in-time recovery,
   mas com custo mensal.

Nenhuma das duas opções foi ativada nesta sessão — a primeira precisa de um
`secrets.MONGODB_URI` no repositório GitHub (ação no GitHub, não no código);
a segunda precisa de uma alteração de plano na Atlas (ação na consola da
Atlas, com custo). Enquanto isto não acontecer, corre
`node scripts/backup-mongo.mjs` manualmente de vez em quando, sobretudo antes
de qualquer migração de schema (ver secção seguinte).

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
