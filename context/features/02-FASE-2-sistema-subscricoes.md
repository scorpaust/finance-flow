# FASE 2 — Sistema de Subscrições (EasyPay: Cartão/DD, MB WAY, Multibanco)

> Pré-requisito: Fase 1 concluída + ler `00-CODE-SPEC.md` (secções 3 e 4,
> atualizadas nesta revisão). Substitui a versão anterior desta fase.
> Esta continua a ser a fase de maior risco de negócio e de
> compliance — em caso de dúvida sobre regras de preço/feature ou sobre
> requisitos da Google, assinalar explicitamente no PR em vez de assumir.
>
> **Atualização de 2026-09-19 (testes em sandbox real)**: as tarefas 6/7 e a
> tabela abaixo descrevem o desenho original — MB WAY/Multibanco com "cron
> mensal" a disparar cada ciclo. Foi revisto durante os testes: nenhum dos
> dois métodos permite cobrança recorrente sem ação manual do cliente a cada
> ciclo, por isso passaram a **pagamento único de um período fixo** (1/3/6/12
> meses, sem renovação automática). Ver `context/current-feature.md`
> para o detalhe completo desta decisão; código-fonte é a referência atual
> (`server/api/subscription/easypay/create-prepaid.post.ts`), não as tarefas
> 6/7 abaixo.

## Decisões de arquitetura tomadas (não reabrir sem motivo forte)

1. **Processador único: EasyPay** (`docs.easypay.pt`), cobrindo Cartão de
   Crédito/Débito (CC), Débito Direto (DD), MB WAY e Multibanco com um único
   contrato/API.
2. A EasyPay tem **três "modos de cobrança" com níveis de automação
   diferentes** — o modelo de subscrição tem de refletir isto explicitamente,
   não tratar todos os métodos como equivalentes:

   | Método | Mecanismo EasyPay | Nível de automação |
   |---|---|---|
   | Cartão (CC) / Débito Direto (DD) | API nativa `POST /subscription` (`frequency`, `unlimited_payments`, retries/failover geridos pela EasyPay) | **`auto`** — cobrança 100% automática, sem ação do cliente a cada ciclo |
   | MB WAY | *Frequent Payment* — perfil tokenizado via Checkout, cobrança disparada pelo nosso backend (cron mensal) através da API de Pagamentos | **`push_confirm`** — disparado automaticamente pelo sistema, mas o cliente tem de aprovar uma notificação push na app MB WAY em cada ciclo |
   | Multibanco | *Frequent/Single Payment* — o backend gera uma nova referência a cada ciclo | **`manual_reference`** — geração automática da referência, mas o pagamento em si depende de o cliente ir pagar (ATM/homebanking) dentro do prazo de validade |

   Esta distinção é a base de todo o desenho de dados e UX desta fase.
3. **Android continua a usar pagamentos externos** (fora do Google Play
   Billing), ao abrigo do programa de pagamentos externos da Google
   disponível na EEA desde 30 de junho de 2026 — esta decisão não depende do
   processador escolhido e mantém-se da versão anterior desta fase.

## Objetivo

Três planos — Gratuito, Pro (5,00 €/mês), Premium (12,99 €/mês) — pagáveis
via EasyPay com Cartão/Débito Direto (auto-renovação real), MB WAY
(cobrança automática com confirmação push) ou Multibanco (referência gerada
automaticamente, pagamento manual), disponíveis na web e na app Android, com
a mesma conta a refletir o estado da subscrição nas duas plataformas.

## Tarefas

### 1. Modelo de dados

- [ ] Atualizar `UserSubscription` (ver `00-CODE-SPEC.md` secção 3
      atualizada) com `billingMode: 'auto' | 'push_confirm' |
      'manual_reference'`, `paymentMethod: 'cc' | 'dd' | 'mbway' |
      'multibanco' | 'none'`, `provider: 'easypay'`,
      `easypaySubscriptionId` (quando `billingMode === 'auto'`) ou
      `easypayFrequentPaymentId` (quando `mbway`/`multibanco`),
      `currentPeriodEnd`, `autoRenew: boolean`
- [ ] Migração: utilizadores existentes entram como `tier: 'free'`,
      `status: 'active'`, `provider: 'none'`

### 2. Fonte única da matriz de features

- [ ] Criar/confirmar `shared/features.ts` com `SubscriptionTier`,
      `FEATURE_MATRIX`, `hasFeature(tier, feature)` (ver code spec — matriz é
      ponto de partida, confirmar limites finais antes de implementar)

### 3. Integração EasyPay — base

- [ ] Criar conta EasyPay, obter `AccountId` e `ApiKey` de sandbox
      (`api.test.easypay.pt`) e de produção
- [ ] `server/utils/easypay.ts` — wrapper fino sobre a REST API da EasyPay
      (Checkout, Subscription, Payments), autenticação via headers
      `AccountId`/`ApiKey`
- [ ] Confirmar na documentação atual o mecanismo de validação de
      autenticidade dos webhooks EasyPay (assinatura ou IP allowlist —
      confirmar no guia de Webhooks no momento da implementação) e
      implementá-lo antes de processar qualquer evento

### 4. Onboarding do método de pagamento (EasyPay Checkout)

- [ ] Usar o **EasyPay Checkout** (formulário hospedado, PCI-compliant) para
      recolher o método escolhido pelo utilizador: `cc`, `dd`, `mbw`
      (MB WAY) ou `mb` (Multibanco)
- [ ] No caso de `cc`/`dd`, o resultado do Checkout alimenta diretamente a
      criação da Subscription nativa (passo 5)
- [ ] No caso de `mbw`/`mb`, o resultado do Checkout tokeniza os dados do
      cliente para uso como *Frequent Payment* (passo 6) — não criar uma
      Subscription nativa para estes métodos, a API não os suporta nesse
      objeto

### 5. Fluxo `auto` (Cartão / Débito Direto)

- [ ] `server/api/subscription/easypay/create-subscription.post.ts` — cria a
      Subscription EasyPay (`POST /subscription`) com `frequency: "1M"`,
      `unlimited_payments: true`, `method: "CC" | "DD"`, `value` conforme o
      plano escolhido
- [ ] Para DD, recolher e validar os dados do `sdd_mandate` (IBAN, titular)
      no Checkout antes de criar a subscrição
- [ ] `server/api/subscription/easypay/webhook.post.ts` — trata eventos de
      subscrição (sucesso/falha de ciclo, cancelamento), atualiza
      `User.subscription` com `billingMode: 'auto'`, `autoRenew: true`

### 6. Fluxo `push_confirm` (MB WAY)

- [ ] Job agendado (cron mensal) que, para cada utilizador com
      `paymentMethod: 'mbway'`, dispara a cobrança do ciclo via API de
      Pagamentos EasyPay (Frequent Payment), usando a referência tokenizada
      do onboarding
- [ ] Tratar o resultado assíncrono via webhook: sucesso → renovar
      `currentPeriodEnd`; falha/sem confirmação dentro de uma janela (ex.
      24-48h) → aplicar `retries` (a EasyPay suporta tentativas
      configuráveis) e, se esgotadas, marcar `status: 'past_due'`
- [ ] Notificar o utilizador (in-app/email) quando o ciclo depende da sua
      confirmação push, para reduzir falhas por falta de atenção

### 7. Fluxo `manual_reference` (Multibanco)

- [ ] Job agendado que gera uma **nova referência Multibanco** X dias antes
      do fim do período atual (dar tempo suficiente até `expiration_time`,
      ex. 5–7 dias), reutilizando os dados do cliente tokenizados no
      onboarding
- [ ] Notificar o utilizador com a entidade/referência/valor a pagar
- [ ] Webhook trata a confirmação de pagamento da referência (evento
      "quando um cliente paga uma referência Multibanco") → renovar
      `currentPeriodEnd`
- [ ] Se a referência expirar sem pagamento: `status: 'expired'` e downgrade
      automático para `free` (ver também item 8)

### 8. Composable e enforcement no client

- [ ] `useSubscription()` — `tier`, `status`, `billingMode`, `autoRenew`,
      `daysUntilExpiry`, `hasFeature(key)`, `refresh()`
- [ ] `PaywallModal.vue` / `UpsellBanner.vue` reutilizáveis — mensagens
      diferenciadas por `billingMode`:
      - `auto` → sem ação necessária
      - `push_confirm` → lembrete para confirmar a notificação MB WAY
      - `manual_reference` → mostrar entidade/referência/prazo de pagamento
        diretamente na app
- [ ] Ecrã de checkout com escolha clara do método (CC/DD = "renovação
      automática"; MB WAY = "renovação com confirmação na app"; Multibanco =
      "pagar referência a cada período")
- [ ] Aplicar gating nas páginas/secções: `predictions.vue` (Premium),
      exportação CSV e grupos (Pro+), limites do dashboard (Free)

### 9. Enforcement no servidor (obrigatório)

- [ ] Middleware `requireFeature(featureKey)` aplicado a
      `server/api/predictions/**` (Premium), `server/api/groups/**` (Pro+),
      export CSV (Pro+)
- [ ] Resposta consistente `403` com `{ error: 'feature_locked',
      requiredTier }`

### 10. Android — pagamentos externos

- [ ] Inscrever a app no programa de pagamentos externos da Google para a
      EEA (Play Console) antes de submeter a build da Fase 8 — este passo
      tem lead time próprio, iniciar cedo
- [ ] No client Capacitor, o fluxo de checkout abre o EasyPay Checkout
      (browser in-app / `@capacitor/browser`) fora do fluxo de Google Play
      Billing, com o disclosure exigido pela Google ("vais sair da app para
      completar o pagamento") antes de redirecionar
- [ ] Implementar o reporte de transações à Google via
      `ExternalTransactionId` API a partir do server (obrigatório para apps
      que usam pagamentos externos na EEA — confirmar o fluxo exato na
      documentação da Play Console no momento da implementação)
- [ ] Confirmar requisitos adicionais do programa: PCI-DSS (coberto pela
      EasyPay, que é hosted/certificada), processo de disputa de
      transações, suporte ao cliente para pagamentos feitos por esta via

### 11. Ambiente de testes

- [ ] Sandbox EasyPay (`api.test.easypay.pt`) para os quatro métodos — usar
      os números de telefone de teste documentados para MB WAY
- [ ] Testar o cron de `push_confirm` (MB WAY) e de `manual_reference`
      (Multibanco), incluindo os cenários de falha/expiração
- [ ] Testar em Android real/emulador o fluxo completo de saída da app →
      EasyPay Checkout → regresso à app com estado atualizado
- [ ] Documentar todas as variáveis de ambiente em `CONFIG-REFERENCE.md`

## Fora de âmbito nesta fase

- Redesign visual do paywall/checkout (visual final vem na Fase 3, aqui é
  funcional)
- Submissão final e aprovação do programa de pagamentos externos na Play
  Store em produção (Fase 8 — aqui só a integração técnica e o pedido de
  inscrição)

## Critérios de aceitação

- [ ] Utilizador consegue subscrever com Cartão ou Débito Direto (auto-
      renovação real, sem ação mensal) em sandbox, web e Android
- [ ] Utilizador consegue subscrever com MB WAY em sandbox e o cron mensal
      dispara corretamente a cobrança, com o ciclo a depender só da
      confirmação push
- [ ] Utilizador consegue pagar uma referência Multibanco em sandbox, e o
      cron gera automaticamente a referência do ciclo seguinte com
      antecedência suficiente
- [ ] Mudar de plano/expirar reflete-se imediatamente na UI e nos endpoints
      protegidos (403 quando aplicável)
- [ ] Webhook EasyPay testado com eventos simulados para os três modos de
      cobrança, incluindo falha de cobrança e expiração de referência
- [ ] Nenhum endpoint sensível depende apenas de verificação no client
- [ ] Pedido de inscrição no programa de pagamentos externos da Google
      submetido (aprovação pode não estar concluída nesta fase, mas o
      pedido tem de estar feito antes da Fase 8)
