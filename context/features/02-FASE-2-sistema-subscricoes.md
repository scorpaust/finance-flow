# FASE 2 — Sistema de Subscrições (PayPal + MB WAY + Multibanco)

> Pré-requisito: Fase 1 concluída + ler `00-CODE-SPEC.md` (secções 3 e 4,
> atualizadas nesta revisão). Esta é a fase de maior risco de negócio e de
> compliance — em caso de dúvida sobre regras de preço/feature ou sobre
> requisitos da Google, assinalar explicitamente no PR em vez de assumir.

## Decisões de arquitetura tomadas (não reabrir sem motivo forte)

1. **Processador único: PayPal**, com três métodos de pagamento expostos ao
   utilizador: cartão/saldo PayPal, MB WAY, Multibanco.
2. **MB WAY e Multibanco não suportam débito automático** (não têm "billing
   agreement" — MB WAY é confirmado no telemóvel por compra, Multibanco é uma
   referência/voucher com até 7 dias para pagar). Por isso o modelo é
   **híbrido**:
   - **Cartão ou saldo PayPal** → subscrição com **auto-renovação real**,
     via PayPal Subscriptions (Billing Agreements).
   - **MB WAY ou Multibanco** → **pagamento por período** (pré-pago de 1, 3,
     6 ou 12 meses); no fim do período a subscrição expira e o utilizador é
     avisado para renovar manualmente — **não há cobrança automática**.
3. **Android usa pagamentos externos** (PayPal/MB WAY/Multibanco) em vez de
   Google Play Billing, ao abrigo do programa de pagamentos externos da
   Google disponível na EEA desde 30 de junho de 2026. Isto implica
   inscrição prévia no programa, cumprimento dos requisitos da Google
   (disclosure "vais sair da Play Store", reporte de transações à Google via
   `ExternalTransactionId` API) e uma taxa de serviço de 10% à Google sobre
   subscrições recorrentes, mesmo pagando por fora — confirmar valores
   atualizados na Play Console antes de lançar, esta taxa está sujeita a
   alteração pela Google.

## Objetivo

Três planos — Gratuito, Pro (5,00 €/mês), Premium (12,99 €/mês) — pagáveis
com cartão/PayPal (auto-renovável) ou MB WAY/Multibanco (pré-pago por
período), disponíveis tanto na web como na app Android, com a mesma conta a
refletir o estado da subscrição nas duas plataformas.

## Tarefas

### 1. Modelo de dados

- [ ] Atualizar `UserSubscription` (ver `00-CODE-SPEC.md` secção 3
      atualizada) com `periodType: 'recurring' | 'prepaid'`,
      `paymentMethod: 'card' | 'paypal_balance' | 'mbway' | 'multibanco'`,
      `provider: 'paypal'`, `currentPeriodEnd`, `autoRenew: boolean`
- [ ] Migração: utilizadores existentes entram como `tier: 'free'`,
      `status: 'active'`, `provider: 'none'`

### 2. Fonte única da matriz de features

- [ ] Criar/confirmar `shared/features.ts` com `SubscriptionTier`,
      `FEATURE_MATRIX`, `hasFeature(tier, feature)` (ver code spec — matriz é
      ponto de partida, confirmar limites finais antes de implementar)

### 3. Integração PayPal — base

- [ ] Criar conta PayPal Business, ativar Multibanco (pedido de aprovação
      via link `bizsignup?product=multibanco`) e MB WAY (está em beta —
      confirmar disponibilidade/aprovação da conta antes de depender dela
      para lançamento)
- [ ] Configurar credenciais sandbox e live (`PAYPAL_CLIENT_ID`,
      `PAYPAL_CLIENT_SECRET`)
- [ ] `server/utils/paypal.ts` — wrapper fino sobre a PayPal REST API
      (Orders API + Subscriptions API), autenticação OAuth2 server-to-server

### 4. Fluxo de auto-renovação (cartão / saldo PayPal)

- [ ] Criar planos na PayPal (Subscriptions API): `plan_pro_monthly` (5€),
      `plan_premium_monthly` (12,99€)
- [ ] `server/api/subscription/paypal/create-subscription.post.ts` — cria a
      subscrição PayPal e devolve o link de aprovação
- [ ] `server/api/subscription/paypal/webhook.post.ts` — valida assinatura
      do webhook PayPal, trata `BILLING.SUBSCRIPTION.ACTIVATED`,
      `BILLING.SUBSCRIPTION.CANCELLED`, `BILLING.SUBSCRIPTION.EXPIRED`,
      `PAYMENT.SALE.COMPLETED` (renovação), atualiza `User.subscription`
      com `periodType: 'recurring'`, `autoRenew: true`

### 5. Fluxo pré-pago (MB WAY / Multibanco)

- [ ] `server/api/subscription/paypal/create-order.post.ts` — cria uma Order
      PayPal para o período escolhido (1/3/6/12 meses × preço do plano),
      com `payment_source.mb_way` ou `payment_source.multibanco` conforme a
      escolha do utilizador
- [ ] Mesmo webhook (ou handler dedicado) trata
      `CHECKOUT.ORDER.APPROVED` / `PAYMENT.CAPTURE.COMPLETED` para
      Multibanco (pagamento confirmado só depois, no ATM/homebanking —
      tratar o estado "pendente" até 7 dias) e confirmação imediata para
      MB WAY
- [ ] Ao capturar o pagamento, definir `currentPeriodEnd = hoje + período
      comprado`, `periodType: 'prepaid'`, `autoRenew: false`
- [ ] Job agendado (cron/worker) que, X dias antes de `currentPeriodEnd`
      expirar num plano pré-pago, dispara notificação/email a pedir
      renovação manual; ao expirar sem renovação, faz downgrade automático
      para `free`

### 6. Composable e enforcement no client

- [ ] `useSubscription()` — `tier`, `status`, `periodType`, `autoRenew`,
      `daysUntilExpiry`, `hasFeature(key)`, `refresh()`
- [ ] `PaywallModal.vue` / `UpsellBanner.vue` reutilizáveis — mostrar aviso
      diferenciado quando `periodType === 'prepaid'` e a expirar em breve
- [ ] Ecrã de checkout com escolha clara: "Renovação automática (cartão/
      PayPal)" vs. "Pagar agora um período (MB WAY / Multibanco)"
- [ ] Aplicar gating nas páginas/secções: `predictions.vue` (Premium),
      exportação CSV e grupos (Pro+), limites do dashboard (Free)

### 7. Enforcement no servidor (obrigatório)

- [ ] Middleware `requireFeature(featureKey)` aplicado a
      `server/api/predictions/**` (Premium), `server/api/groups/**` (Pro+),
      export CSV (Pro+)
- [ ] Resposta consistente `403` com `{ error: 'feature_locked',
      requiredTier }`

### 8. Android — pagamentos externos

- [ ] Inscrever a app no programa de pagamentos externos da Google para a
      EEA (Play Console) antes de submeter a build da Fase 5 — este passo
      tem lead time próprio, iniciar cedo
- [ ] No client Capacitor, o fluxo de checkout abre o checkout PayPal
      (browser in-app / `@capacitor/browser`) fora do fluxo de Google Play
      Billing, com o disclosure exigido pela Google ("vais sair da app para
      completar o pagamento") antes de redirecionar
- [ ] Implementar o reporte de transações à Google via
      `ExternalTransactionId` API a partir do server (obrigatório para apps
      que usam pagamentos externos na EEA — confirmar o fluxo exato na
      documentação da Play Console no momento da implementação, esta API
      tem vindo a ser atualizada em 2026)
- [ ] Confirmar requisitos adicionais do programa: PCI-DSS (coberto pelo
      PayPal, que é hosted), processo de disputa de transações, suporte ao
      cliente para pagamentos feitos por esta via

### 9. Ambiente de testes

- [ ] PayPal Sandbox para os três métodos (cartão/saldo, MB WAY, Multibanco)
      — confirmar que o sandbox simula corretamente o atraso de confirmação
      do Multibanco
- [ ] Testar o job de expiração/aviso de renovação de planos pré-pagos
- [ ] Testar em Android real/emulador o fluxo completo de saída da app →
      PayPal → regresso à app com estado atualizado
- [ ] Documentar todas as variáveis de ambiente em `CONFIG-REFERENCE.md`

## Fora de âmbito nesta fase

- Redesign visual do paywall/checkout (visual final vem na Fase 3, aqui é
  funcional)
- Submissão final e aprovação do programa de pagamentos externos na Play
  Store em produção (Fase 5 — aqui só a integração técnica e o pedido de
  inscrição)

## Critérios de aceitação

- [ ] Utilizador consegue subscrever com cartão/PayPal (auto-renovável) em
      sandbox, web e Android
- [ ] Utilizador consegue pagar um período com MB WAY e com Multibanco em
      sandbox, web e Android, e a subscrição fica com a data de expiração
      correta
- [ ] Mudar de plano/expirar reflete-se imediatamente na UI e nos endpoints
      protegidos (403 quando aplicável)
- [ ] Webhook PayPal testado com eventos simulados para os três métodos,
      incluindo o estado "pendente" do Multibanco
- [ ] Job de aviso de expiração testado (gera notificação, faz downgrade se
      não houver renovação)
- [ ] Nenhum endpoint sensível depende apenas de verificação no client
- [ ] Pedido de inscrição no programa de pagamentos externos da Google
      submetido (aprovação pode não estar concluída nesta fase, mas o
      pedido tem de estar feito antes da Fase 5)
