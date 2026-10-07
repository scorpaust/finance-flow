# UPGRADE 01 — Google Play Billing na app Android

> Pedido do utilizador (2026-10-06), a meio dos testes fechados da Fase 9:
> "a Google só permite na Google Play pagamentos externos a empresas e sou
> trabalhador independente apenas... só posso ter conta pessoal e não estou
> elegível... vou manter como está para a web mas na Google Play vou utilizar
> pagamentos pelo Google Pay apenas (Google Play Billing, disponível para
> contas pessoais)".
>
> Substitui a decisão de 2026-09-29 ("alternative billing only",
> `context/PLAY-STORE.md` secção 5), que nunca chegou a estar ativa: sem
> inscrição aprovada, a app Android não deixava comprar.

## Objetivo

- Na app Android, as subscrições Pro e Premium são compradas com a
  **Google Play Billing**: a Google cobra, emite o recibo ao utilizador,
  trata do IVA ao consumidor e paga ao programador uma vez por mês.
- Na **web** fica tudo como está: EasyPay com cartão, débito direto,
  MB WAY e Multibanco.
- **O plano é da conta, não da loja.** Quem pagou na web tem o plano no
  Android, e quem pagou na Google Play tem o plano na web. O servidor é a
  única fonte de verdade do plano (`effectiveTier`).

## Decisões

Já tomadas (utilizador, 2026-10-06):

1. A conta de programador é pessoal e não é elegível para pagamentos
   externos. Na app Android, a **única** forma de pagar é a Google Play
   Billing.
2. A web mantém a EasyPay e todos os métodos atuais.
3. A Google paga mensalmente, a partir do limiar mínimo do perfil de
   pagamentos. A faturação à Google é feita à mão pelo utilizador; ver a
   secção "Faturação e IVA".

Tomadas a 2026-10-06 (resposta do utilizador às decisões propostas):

4. **Preços iguais na web e na Play.** A Play nunca pode ser mais cara do
   que a web. Uma subida, se houver, é nos dois. Os novos preços compensam a
   taxa da Google e arredondam a números certos. **Escolhida a opção B
   (utilizador, 2026-10-06): Pro 7 €/mês, Premium 18 €/mês**, na web e na
   Play.
5. **As mesmas ofertas nas duas plataformas.** Cada produto (`pro`,
   `premium`) tem os seguintes base plans:
   - mensal com renovação automática, como cartão e débito direto na web;
   - **pré-pagos de 1, 3, 6 e 12 meses**, sem renovação, como MB WAY e
     Multibanco na web (`PERIODS = [1, 3, 6, 12]`).

   Na Play, os pré-pagos estendem-se com um carregamento (*top-up*), e o
   tempo acumula sobre o `expiryTime`. Os meios de pagamento dentro da Play
   (cartão, PayPal, saldo Google Play…) são escolhidos pela Google, não pela
   app.
6. **Mudança de plano no Android** (aceite como proposto):
   - Pro → Premium: imediato, com `CHARGE_PRORATED_PRICE` (cobra a
     diferença, mantém a data de renovação).
   - Premium → Pro: `DEFERRED` (só na renovação).
   - Em pré-pagos, a Google só aceita `CHARGE_FULL_PRICE`.
7. **Quem paga na web e abre a app** vê o plano ativo e o texto
   "Subscrição gerida na versão web", **sem link nem botão** para o site. Não
   pode comprar na Play enquanto a subscrição da web estiver ativa. Quando a
   da web termina (cancelada ou expirada), voltam as opções de compra da
   Google Play no Android.

### Preços (decisão 4): opções

As contas abaixo são para um cliente em Portugal (IVA 23%):

- **Na Play**, a Google desconta primeiro o IVA ao consumidor (está
  incluído no preço) e depois a taxa de 15%.
- **Na web**, com a isenção do art. 53.º, o operador recebe o preço inteiro,
  menos a comissão da EasyPay.

| Opção | Pro | Premium | Recebido na Play, Pro / Premium | Recebido na web, Pro / Premium |
|---|---|---|---|---|
| Hoje | 5,00 € | 12,99 € | 3,46 € / 8,98 € | 5,00 € / 12,99 € |
| A: só os 15% | 6 € | 15 € | 4,15 € / 10,37 € | 6 € / 15 € |
| B: 15% e parte do IVA | 7 € | 18 € | 4,84 € / 12,44 € | 7 € / 18 € |
| C: 15% e IVA por inteiro | 8 € | 19 € | 5,53 € / 13,13 € | 8 € / 19 € |

Os pré-pagos de 3, 6 e 12 meses custam o mensal × o número de meses, como
hoje na web, salvo indicação em contrário.

Ainda não há subscritores reais: a EasyPay está em sandbox. A mudança de
preço não afeta ninguém. Atualizar `TIER_PRICE_EUR`, os textos e a ficha da
loja ao mesmo tempo.

## Regras da Google Play a cumprir

- Bens digitais vendidos dentro da app têm de usar a Google Play Billing.
  Sem inscrição num programa de pagamentos externos, a app **não pode**
  mostrar o checkout da EasyPay, nem links, botões ou texto que levem o
  utilizador a pagar no site.
- A app pode dar acesso a um plano comprado fora da app (na web).
- Cada compra nova (compra inicial, mudança de plano, nova adesão) tem de
  ser **confirmada (acknowledge) em até 3 dias**; senão, a Google reembolsa
  o utilizador e revoga a compra. As renovações não precisam de
  confirmação.
- Antes de dar o plano, verificar a compra no servidor com
  `purchases.subscriptionsv2.get` e confirmar que `subscriptionState` é
  `SUBSCRIPTION_STATE_ACTIVE`.
- O estado da subscrição (renovações, cancelamentos, períodos de carência,
  suspensões, reembolsos) chega pelas **notificações em tempo real (RTDN)**
  da Play, via Google Cloud Pub/Sub.

Fontes (Context7, `/websites/developer_android_google_play_billing`,
consultado a 2026-10-06): ciclo de vida das subscrições, acknowledge,
`subscriptionsv2`, RTDN e modos de substituição de plano.

## Tarefas

### 0. Play Console e Google Cloud (utilizador)

- [ ] **Perfil de pagamentos.** Play Console → Configuração → Perfil de
      pagamentos: conta de comerciante com IBAN e dados fiscais.
      Confirmar aí o limiar mínimo de pagamento.
- [ ] **Produtos.** Monetizar → Subscrições: criar `pro` e `premium`. Cada
      um leva estes base plans, todos com o preço da decisão 4:
  - `mensal`, com renovação automática;
  - `prepago-1m`, `prepago-3m`, `prepago-6m` e `prepago-12m`, sem
    renovação.
- [ ] **Conta de serviço.**
  - Google Cloud: ativar a Google Play Android Developer API e criar a conta
    de serviço.
  - Play Console → Utilizadores e permissões: dar-lhe "Ver dados
    financeiros" e "Gerir encomendas e subscrições".
  - Guardar a chave JSON em `GOOGLE_PLAY_SERVICE_ACCOUNT` no Netlify, como
    variável secreta. Só depois da tarefa 2.1.
- [ ] **RTDN.**
  - Criar um tópico Pub/Sub e dar a função Pub/Sub Publisher a
    `google-play-developer-notifications@system.gserviceaccount.com`.
  - Criar uma subscrição push para o endpoint da tarefa 2.4, com
    autenticação OIDC.
  - Monetizar → Configuração da monetização → ativar as notificações em
    tempo real com esse tópico → "Enviar mensagem de teste".
- [ ] **Testadores.** Configuração → Testes de licenças: acrescentar os
      testadores. As compras deles são de teste, não são cobradas, e as
      renovações mensais acontecem em minutos.

### 1. App Android (nativo)

- [x] Plugin Capacitor `PlayBillingPlugin.java`, que substitui
      `AlternativeBillingPlugin.java` e usa a Play Billing Library 9.x, já
      incluída. Funções:
  - `getProducts()`: `queryProductDetailsAsync` para `pro`/`premium`;
    devolve o preço formatado pela Google na moeda do utilizador e o
    `offerToken`.
  - `purchase({ productId, accountId, oldPurchaseToken?, replacementMode? })`:
    `launchBillingFlow` com `setObfuscatedAccountId` igual a um hash do
    `userId` (nunca o email), para o servidor saber a que conta pertence a
    compra.
  - `queryActivePurchases()`: compras ativas, chamada ao abrir a app e ao
    voltar ao primeiro plano, para recuperar compras cuja confirmação se
    perdeu.
  - Eventos do `PurchasesUpdatedListener`: comprado, pendente, cancelado e
    erro.
- [x] `MainActivity` regista o plugin novo.
- [x] Retirar `AlternativeBillingPlugin.java`.
- [x] `versionName` 1.1.0, `versionCode` 4.

### 2. Servidor

- [x] **2.1** `GOOGLE_PLAY_SERVICE_ACCOUNT` lida do ambiente em runtime
      (`process.env`), como `MONGODB_URI` em `server/utils/db.ts`. Uma
      variável secreta do Netlify chega mascarada ao build local (incidente
      de 2026-10-04).
- [x] **2.2** `POST /api/billing/google-play/verify`, recebendo
      `{ purchaseToken, productId }`:
  - chama `subscriptionsv2.get`;
  - confirma que o produto é conhecido, que o estado é ativo e que
    `externalAccountIdentifiers.obfuscatedExternalAccountId` corresponde ao
    utilizador da sessão;
  - grava a subscrição com `provider: 'google_play'`, `tier`,
    `currentPeriodEnd = expiryTime`, `autoRenew`, `purchaseToken` e
    `latestOrderId`;
  - faz o acknowledge no servidor (`purchases.subscriptions.acknowledge`) se
    `acknowledgementState` ainda for pendente.
  - É idempotente: o mesmo token chamado duas vezes não estraga nada.
- [x] **2.3** Um `purchaseToken` só pode pertencer a uma conta: índice
      único. Quando há mudança de plano, o `linkedPurchaseToken` substitui o
      token antigo, sem duplicar.
- [x] **2.4** `POST /api/billing/google-play/rtdn`, o push do Pub/Sub:
  - verifica o token OIDC do Pub/Sub (emissor Google e audiência
    configurada) e recusa o resto;
  - para cada `subscriptionNotification`, volta a ler o estado com
    `subscriptionsv2.get`, sem confiar no tipo da notificação;
  - atualiza o plano: ativa, período de carência (mantém o acesso), em
    suspensão, cancelada (acesso até `expiryTime`), expirada ou revogada
    (passa a free);
  - trata as `voidedPurchaseNotification` (reembolso ou estorno): retira o
    plano;
  - responde 200 depressa, porque o Pub/Sub repete o que não for
    confirmado.
- [x] **2.5** `effectiveTier` conhece `provider: 'google_play'`: ativo
      enquanto `currentPeriodEnd` estiver no futuro e o estado não for
      `expired`.
- [x] **2.6** Proteção contra subscrição dupla: o `verify` recusa uma
      compra na Play se a conta tiver uma subscrição EasyPay ativa, e o
      checkout EasyPay da web recusa se houver uma subscrição Play ativa.
      Mensagem clara nas 6 línguas.
- [x] **2.7** Cron diário de reconciliação: volta a ler o estado de todas as
      subscrições Play que expiram nas próximas 48 h ou que já expiraram sem
      notificação. Rede de segurança caso falhe uma RTDN. Substitui o
      `process-queue` do alternative billing.
- [x] **2.8** Eliminação de conta com subscrição Play ativa: revogar no
      servidor (`subscriptionsv2.revoke`) ou, no mínimo, avisar antes de
      apagar que a subscrição continua na Google Play e tem de ser
      cancelada lá.
- [x] **2.9** Reembolso de livre resolução (14 dias, `admin/refund-delete`):
      para Play, `subscriptionsv2.revoke` com reembolso, em vez do reporte
      `externalTransactions:refund`.
- [x] **2.10** Retirar o alternative billing:
  - `server/utils/googlePlayBilling.ts` (reportes `externalTransactions`);
  - modelo `GooglePlayTransaction`;
  - `/api/billing/google-play/process-queue` e o passo correspondente em
    `.github/workflows/cron.yml`;
  - `googlePlayToken` no checkout EasyPay;
  - `BILLING_VAT_RATE` (só servia o reporte).
  - Confirmar antes que a coleção está vazia em produção.

### 3. Cliente (web dentro da app)

- [x] Em `pages/subscription/index.vue`, com `isNative`, o fluxo é outro:
  - **Escolha do plano:** cartões Pro e Premium com o preço vindo da Google
    (`getProducts`), e não o `TIER_PRICE_EUR` convertido.
  - **Pagamento:** a mesma escolha da web, mas sem iframe EasyPay:
    - "Renovação automática (mensal)", no lugar de cartão e débito direto;
    - "Pagamento único" com período de 1, 3, 6 ou 12 meses, no lugar de
      MB WAY e Multibanco;
    - um botão "Pagar com Google Play";
    - num pré-pago ativo, oferecer "Prolongar" (top-up) a partir de
      `allowExtendAfterTime`.
  - **Depois da compra:** chamar `verify`, atualizar o store de subscrição e
    mostrar sucesso.
  - **Compra pendente** (por exemplo, pagamento em dinheiro numa loja):
    mostrar "a aguardar pagamento" e não dar o plano.
  - **Mudança de plano:** passa o token antigo e o modo de substituição da
    decisão 6.
  - **Plano da Play ativo:** mostrar "Gerir na Google Play", que abre
    `https://play.google.com/store/account/subscriptions?sku=…&package=com.dinismcosta.financeflow`.
  - **Plano da web ativo:** mostrar "Subscrição gerida na versão web", sem
    link e sem botões de compra. Quando a subscrição da web termina, voltam
    as opções da Google Play (decisão 7).
- [x] **Na web**, com um plano da Play ativo: mostrar "Subscrição gerida na
      Google Play", com o link acima, e esconder o checkout EasyPay.
- [x] Retirar `composables/useAlternativeBilling.ts` e a mensagem
      `subscription.androidBillingUnavailable`.
- [x] Textos novos nas 6 línguas.
- [x] Moeda de apresentação (Fase 10): no Android, o preço da Google já vem
      na moeda do utilizador e não leva o "≈".
- [x] Termos de utilização:
  - no Android, a cobrança, a renovação e o cancelamento são feitos pela
    Google Play;
  - reembolsos das compras feitas na Play seguem as regras da Google;
  - os 14 dias de livre resolução continuam, pedidos ao suporte.

### 4. Documentação e declarações

- [x] `context/PLAY-STORE.md` secção 5: reescrever para Google Play Billing
      e registar o histórico (alternative billing abandonado: conta pessoal
      não elegível).
- [x] **Play Console, declaração de segurança dos dados:**
  - a compra passa a ser processada pela Google;
  - o servidor guarda só o estado da subscrição e o id da encomenda.
- [x] **Política de Privacidade:**
  - Google como processador de pagamentos no Android;
  - retirar "reporte de transações à Google".
  - Atualizar `LEGAL_UPDATED`.
- [x] `context/SECURITY-POLICY.md`, tabela de fornecedores: "Google Play —
      distribuição Android **e pagamentos na app**".
- [x] `context/CONFIG-REFERENCE.md`:
  - acrescentar `GOOGLE_PLAY_SERVICE_ACCOUNT` e a audiência OIDC do RTDN;
  - retirar `BILLING_VAT_RATE`.
- [x] `context/OPERATIONS.md`: como ver as subscrições Play, como
      reembolsar e o que fazer se as RTDN pararem.

## Faturação e IVA (registo para o utilizador; confirmar com o contabilista)

- **Google Play.**
  - Nas vendas na Play, perante o consumidor o vendedor é a Google
    (Google Commerce Limited, Irlanda). É a Google que emite o recibo ao
    utilizador e liquida o IVA da venda ao consumidor no país dele.
  - O programador não fatura a cada utilizador. Fatura à **Google**
    (empresa irlandesa) o valor que recebe em cada pagamento mensal, que já
    vem sem a taxa de 15%.
  - Uma prestação de serviços a uma empresa de outro Estado-Membro tem
    regras próprias de IVA, mesmo no regime de isenção do art. 53.º CIVA:
    autoliquidação pelo adquirente, menção na fatura, possível obrigação de
    declaração recapitulativa. **Confirmar com o contabilista antes da 1.ª
    fatura.**
- **Web (EasyPay): continua a ser preciso faturar a cada cliente.** Uma
  venda a um consumidor em Portugal exige fatura, comunicada à AT, seja no
  Portal das Finanças, seja com um programa de faturação. Mudar o Android
  para a Google Play **não** dispensa as faturas das vendas feitas no site.
- Hoje o projeto não tem nenhuma integração de faturação: não há
  InvoiceXpress nem nenhum outro programa no código.

## Fora de âmbito

- Períodos de experiência e ofertas promocionais.
- iOS / App Store.
- Pagamentos externos no Android: só se a conta passar a ser de empresa e
  ficar elegível.

## Testes

- **Unitários:**
  - `effectiveTier` com `provider: 'google_play'` em todos os estados
    (ativa, carência, suspensa, cancelada com período por terminar,
    expirada, revogada);
  - mapeamento produto → plano.
- **Integração**, com a API da Google simulada, como o servidor simulado
  da Fase 8:
  - `verify` com token válido;
  - token de outra conta (`obfuscatedAccountId` diferente) → 403;
  - estado não ativo → 409;
  - acknowledge feito uma só vez;
  - mesmo token duas vezes (idempotente);
  - subscrição dupla Play + EasyPay recusada nos dois sentidos;
  - RTDN com token OIDC inválido → 401;
  - RTDN de renovação, cancelamento, expiração e reembolso;
  - reconciliação do cron;
  - eliminação de conta com subscrição Play.
- **E2E (web):** um utilizador com subscrição Play não vê o checkout EasyPay
  e vê "Gerida na Google Play".
- **Manual, num dispositivo**, com a app instalada pela Play no teste
  fechado e uma conta de testes de licenças:
  - comprar Pro;
  - mudar para Premium;
  - cancelar na Play;
  - deixar renovar (as renovações de teste demoram minutos);
  - reembolsar na Play Console e ver o plano cair;
  - instalar noutro dispositivo e confirmar que o plano aparece.

## Critérios de aceitação

Código e testes automáticos feitos a 2026-10-07; falta a confirmação num
dispositivo com a Play Console configurada (tarefa 0).


- [ ] Na app Android não existe nenhum caminho para pagar fora da Google
      Play (sem EasyPay, sem links para o site).
- [ ] Uma compra na Play dá o plano na hora, no Android e na web, e fica
      confirmada (acknowledged) na Google.
- [ ] Renovação, cancelamento, expiração e reembolso feitos na Google Play
      refletem-se no plano sem ação do utilizador nem do operador.
- [ ] Uma conta não consegue ter, ao mesmo tempo, uma subscrição Play e uma
      EasyPay ativas.
- [ ] Quem paga na web continua igual, e no Android vê o plano ativo.
- [ ] O código do alternative billing foi retirado, e os testes, o
      typecheck e o CI estão verdes.
- [ ] Documentação, Política de Privacidade e declaração de segurança dos
      dados atualizadas.
