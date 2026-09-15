# Funcionalidade Atual

<!-- Ver especificação completa em context/features/02-FASE-2-sistema-subscricoes.md -->

## Estado

Em progresso

## Objetivos

FASE 2 — Sistema de Subscrições (PayPal + MB WAY + Multibanco). Três planos
— Gratuito, Pro (5,00 €/mês), Premium (12,99 €/mês) — pagáveis com
cartão/PayPal (auto-renovável) ou MB WAY/Multibanco (pré-pago por período),
disponíveis tanto na web como na app Android, com a mesma conta a refletir o
estado da subscrição nas duas plataformas.

Decisões de arquitetura já tomadas (não reabrir sem motivo forte — ver
especificação secção correspondente):
1. Processador único: PayPal, com três métodos de pagamento expostos ao
   utilizador (cartão/saldo PayPal, MB WAY, Multibanco).
2. Modelo híbrido: cartão/saldo PayPal → subscrição com auto-renovação real
   (PayPal Subscriptions/Billing Agreements); MB WAY/Multibanco → pagamento
   pré-pago por período (1/3/6/12 meses), sem cobrança automática, com
   downgrade para `free` no fim do período se não houver renovação manual.
3. Android usa pagamentos externos (programa da Google para a EEA) em vez de
   Google Play Billing — implica inscrição prévia, disclosure obrigatório,
   reporte via `ExternalTransactionId` API e taxa de serviço de 10% à
   Google sobre subscrições recorrentes.

Tarefas principais (ver especificação para detalhe completo):
1. Modelo de dados (`UserSubscription`: `periodType`, `paymentMethod`,
   `provider`, `currentPeriodEnd`, `autoRenew`) + migração de utilizadores
   existentes para `tier: 'free'`
2. Fonte única da matriz de features (`shared/features.ts`,
   `hasFeature(tier, feature)`)
3. Integração PayPal base (conta Business, Multibanco/MB WAY aprovados,
   credenciais sandbox/live, `server/utils/paypal.ts`)
4. Fluxo de auto-renovação (planos PayPal Subscriptions, endpoint de
   criação, webhook de ciclo de vida)
5. Fluxo pré-pago (Orders API para MB WAY/Multibanco, tratamento do estado
   "pendente" do Multibanco, job de aviso de expiração + downgrade
   automático)
6. Composable `useSubscription()` e componentes de paywall/checkout no
   client
7. Enforcement obrigatório no servidor (`requireFeature(featureKey)`,
   resposta `403` consistente)
8. Android — pagamentos externos (inscrição no programa Google, fluxo de
   checkout fora do Google Play Billing, reporte `ExternalTransactionId`)
9. Ambiente de testes (sandbox PayPal para os três métodos, job de
   expiração, fluxo completo em Android)

Fora de âmbito nesta fase: redesign visual do paywall/checkout (Fase 3),
submissão final e aprovação do programa de pagamentos externos na Play
Store em produção (Fase 5 — aqui só a integração técnica e o pedido de
inscrição).

## Notas

- Fase de maior risco de negócio e de compliance — em caso de dúvida sobre
  regras de preço/feature ou sobre requisitos da Google, assinalar
  explicitamente no PR em vez de assumir.
- Ler `00-CODE-SPEC.md` (secções 3 e 4, atualizadas para esta fase) antes de
  implementar o modelo de dados e a matriz de features.
- O pedido de inscrição no programa de pagamentos externos da Google tem
  lead time próprio — iniciar cedo, não deixar para o fim da fase.

## Critérios de aceitação

- Utilizador consegue subscrever com cartão/PayPal (auto-renovável) em
  sandbox, web e Android
- Utilizador consegue pagar um período com MB WAY e com Multibanco em
  sandbox, web e Android, e a subscrição fica com a data de expiração
  correta
- Mudar de plano/expirar reflete-se imediatamente na UI e nos endpoints
  protegidos (403 quando aplicável)
- Webhook PayPal testado com eventos simulados para os três métodos,
  incluindo o estado "pendente" do Multibanco
- Job de aviso de expiração testado (gera notificação, faz downgrade se não
  houver renovação)
- Nenhum endpoint sensível depende apenas de verificação no client
- Pedido de inscrição no programa de pagamentos externos da Google
  submetido (aprovação pode não estar concluída nesta fase, mas o pedido
  tem de estar feito antes da Fase 5)

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
