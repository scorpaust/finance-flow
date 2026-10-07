# Google Play — ficha, declarações e faturação

Fase 9, tarefas 2 e 3. Rascunhos prontos a colar na Play Console; tudo o que
diz respeito a dados tem de bater certo com a Política de Privacidade
(`utils/legalContent.ts`) — se um mudar, o outro também.

## 1. Ficha da loja

**Categoria**: Finanças. **Público-alvo**: 18+ (a app lida com dinheiro,
pagamentos e investimentos). **Email de contacto**: o publicado nos Termos.
**Política de privacidade**: `<APP_URL>/privacy` (pública, sem login).

### PT-PT

- **Título** (máx. 30): `FinanceFlow: Finanças Pessoais`
- **Descrição curta** (máx. 80):
  `Controla gastos, orçamentos e investimentos, com previsões e dicas por IA.`
- **Descrição completa**:

  > O FinanceFlow ajuda-te a perceber para onde vai o teu dinheiro.
  >
  > **Grátis**
  > • Regista receitas e despesas em segundos, com categorias prontas a usar
  > • Painel com saldo, gastos do mês e evolução ao longo do tempo
  > • Gráficos por categoria
  >
  > **Pro**
  > • Transações ilimitadas e categorias próprias
  > • Grupos de orçamento com limites mensais e semanais e alertas
  > • Estatísticas avançadas e exportação em CSV
  > • Interpretação das tuas estatísticas por IA
  > • Digitalização de recibos e faturas: tira uma foto e a transação fica preenchida
  >
  > **Premium**
  > • Previsões do teu saldo com um modelo de IA que corre no teu dispositivo
  > • Registo da tua carteira de investimentos
  > • Dicas educativas de investimento adaptadas ao teu perfil
  >
  > **Privacidade e segurança**
  > • Autenticação de dois fatores e bloqueio por biometria
  > • Exporta ou apaga todos os teus dados a qualquer momento
  > • À IA só chegam totais já calculados — nunca as descrições das tuas transações
  >
  > Disponível em português, inglês, francês, alemão, italiano e espanhol.
  >
  > As dicas de investimento são conteúdo educativo, não aconselhamento financeiro.

### EN

- **Title**: `FinanceFlow: Personal Finance`
- **Short description**:
  `Track spending, budgets and investments, with AI forecasts and insights.`
- **Full description**: tradução direta da versão PT-PT acima (manter as
  mesmas funcionalidades por plano e a frase final sobre aconselhamento
  financeiro). As restantes 4 línguas podem ficar para depois — a Play
  Console mostra a versão EN por omissão.

### Imagens

Geradas por `node scripts/store-assets.mjs` a partir de `assets/icon-only.svg`
(logótipo da Fase 4) — voltar a correr se o logótipo mudar:

- **Ícone da app** 512×512, PNG 32 bits: `assets/store/play-icon-512.png` —
  quadrado, sem cantos arredondados (a Play Store aplica a sua máscara).
- **Gráfico de funcionalidades** 1024×500, PNG 24 bits sem transparência:
  `assets/store/feature-graphic-pt-PT.png` (ficha PT-PT) e
  `assets/store/feature-graphic-en.png` (ficha EN).
- **Capturas de ecrã** — `assets/store/screenshots/`, geradas por
  `npm run store:screenshots` (`store-screenshots/store.spec.ts`: servidor
  de testes com MongoDB em memória, conta Premium "Ana"/`ana@exemplo.pt` e
  dados de exemplo genéricos, PT-PT). Os mesmos 4 ecrãs (painel, transações,
  estatísticas, investimentos) em cada secção da Play Console:

  | Secção | Ficheiros | Tamanho |
  |---|---|---|
  | Telemóvel (2–8; 4+ com ≥1080 px para a promoção) | `phone-*.png` | 1080×1920 (9:16) |
  | Tablet de 7" | `tablet7-*.png` | 1224×2176 (9:16) |
  | Tablet de 10" (lados ≥1080 px) | `tablet10-*.png` | 2560×1440 (16:9) |
  | Chromebook (4–8, lados ≥1080 px) | `chromebook-*.png` | 1920×1080 (16:9) |

## 2. Classificação de conteúdo (questionário IARC)

Categoria "Utilitários, produtividade, comunicação ou outra". Respostas
esperadas: sem violência, sexo, linguagem imprópria, drogas ou jogos de
azar; **sem interação entre utilizadores** (nada é partilhado entre contas);
**sem partilha da localização** com outros utilizadores; **compras digitais:
sim** (subscrições Pro/Premium).

## 3. Segurança dos dados (Data safety)

Tudo **encriptado em trânsito** (HTTPS). O utilizador **pode pedir a
eliminação**: na app (Configurações → Privacidade e dados) e, sem a app,
pelo email de contacto — a Play Console exige um URL público com essas
instruções: usar `<APP_URL>/privacy`.

| Tipo de dado (Play) | O que é na app | Recolhido | Finalidade | Opcional |
|---|---|---|---|---|
| Nome | Nome da conta | Sim | Gestão da conta | Não |
| Endereço de email | Login | Sim | Gestão da conta | Não |
| IDs do utilizador | Id interno da conta | Sim | Gestão da conta | Não |
| Outras informações financeiras | Transações, orçamentos, investimentos, perfil de investidor | Sim | Funcionalidade da app | Não |
| Histórico de compras | Subscrições compradas (plano, estado, referências de pagamento; na app Android, o identificador da compra na Google Play) | Sim | Gestão da conta, funcionalidade da app | Não |
| Fotos | Recibo/fatura digitalizado (Pro) — enviado à Anthropic para extração, **não guardado** | Sim, processamento efémero | Funcionalidade da app | Sim |
| Ficheiros e documentos | Recibo/fatura em PDF na digitalização — idem, **não guardado** | Sim, processamento efémero | Funcionalidade da app | Sim |
| Outro conteúdo gerado pelo utilizador | Descrições e notas das transações, nomes de categorias/grupos | Sim | Funcionalidade da app | Não |
| Localização aproximada | País, a partir do IP, só para mostrar os métodos de pagamento — **não guardado** | Sim, processamento efémero | Funcionalidade da app | Não |
| Registos de falhas / diagnóstico | Sentry (só com `SENTRY_DSN` definido; sem corpos, cookies nem Session Replay) | Sim | Análise e correção de erros | Não |

**Dados de pagamento**: na app Android o pagamento é feito na própria
Google Play (Upgrade 01), e no site no formulário da EasyPay (cartão, IBAN,
telemóvel MB WAY). Nos dois casos **nunca passam pelos nossos servidores**,
por isso não se declaram como recolhidos pela app.

**Partilha**: Anthropic (IA), EasyPay (pagamentos), Sentry e MongoDB Atlas
são prestadores que processam dados **em nosso nome** — pelas regras da
Google isso não conta como "partilha". Resposta: **não partilha dados com
terceiros**.

## 4. Outras declarações da Play Console

- **Funcionalidades financeiras**: declarar "gestão de finanças pessoais /
  orçamentos"; a app **não** oferece empréstimos, crédito, criptomoedas nem
  negociação de valores — as dicas de investimento são educativas.
- **Anúncios**: não tem.
- **Acesso à app para revisão**: a revisão da Google precisa de uma conta de
  teste (email + password) com plano Premium ativo, para ver todas as
  funcionalidades. Criar uma conta dedicada, nunca a do operador.
- **Permissões**: câmara (digitalização de documentos) e biometria
  (bloqueio da app) — ambas com uso claro na própria app.

## 5. Faturação — Google Play Billing na app Android

**Decisão atual (2026-10-06, Upgrade 01):** na app Android, a **única**
forma de pagar é a Google Play Billing. O site mantém a EasyPay (cartão,
débito direto, MB WAY, Multibanco). Especificação e decisões:
`context/features/upgrades/01-google-play-billing-android.md`.

**Histórico.** A 2026-09-29 tinha sido escolhido o *alternative billing
only* (cobrar com a EasyPay dentro da app e reportar cada transação à
Google). Foi implementado mas nunca ativado: a conta de programador é
**pessoal** (trabalhador independente) e não é elegível para pagamentos
externos. Esse código foi retirado no Upgrade 01.

### Oferta e preços

**A Play Console é a única fonte dos preços** (2026-10-07). O servidor lê
o preço de **Portugal** de cada base plan (IVA incluído) e o site e o
checkout EasyPay usam exatamente esse valor (`server/utils/playPrices.ts`,
`GET /api/billing/prices`, cache de 10 minutos). Decisão do utilizador:
**Pro 8 €/mês, Premium 18 €/mês**, e os pré-pagos ao mensal × meses.

**Atenção ao definir preços:**
- O "preço predefinido" da Play Console é **sem impostos**. A Google
  converte-o para cada país e soma o IVA local, arredondando (7 € → 8,49 €
  em Portugal).
- Para o cliente pagar um valor exato, edita a **linha de cada país** (em
  Portugal e nos países do euro, o valor dessa linha já inclui o IVA).
- Não voltes a aplicar a conversão automática por cima.

Na Play, o IVA é sempre cobrado ao cliente, mesmo com a isenção do art. 53.º
(a Google é a vendedora perante o consumidor) e a Google fica ainda com 15%
do valor sem IVA. No site, com a isenção, o operador recebe o preço inteiro.

| Produto (Play Console) | Base plans |
|---|---|
| `pro` | `mensal` (renovação automática), `prepago-1m`, `prepago-3m`, `prepago-6m`, `prepago-12m` |
| `premium` | os mesmos |

- Os pré-pagos custam o mensal × o número de meses, como na web.
- Os ids têm de bater certo com `shared/playBilling.ts`.
- **Mudança de plano:**
  - Pro → Premium: imediata, com `CHARGE_PRORATED_PRICE`;
  - Premium → Pro: na renovação (`DEFERRED`);
  - pré-pagos: `CHARGE_FULL_PRICE`, regra da Google.

### Implementação

- **App (nativo):** `PlayBillingPlugin.java` (Play Billing Library 9.1.0) e
  `composables/usePlayBilling.ts`.
  - Lê os preços da Google e abre a compra com `obfuscatedAccountId`, um HMAC
    do id da conta.
  - Ao abrir a página, recupera compras por confirmar.
  - Na app não há nenhum caminho para pagar fora da Play: nem EasyPay, nem
    links para o site.
- **Servidor:** `server/utils/googlePlay.ts`, com a configuração lida em
  runtime.
  - `POST /api/billing/google-play/verify`: lê `subscriptionsv2`, confirma a
    conta, aplica o plano e faz o acknowledge.
  - `POST /api/billing/google-play/rtdn`: notificações em tempo real via
    Pub/Sub push, com o token OIDC verificado.
  - `POST /api/billing/google-play/reconcile`: cron diário.
  - Leitura sob pedido em `GET /api/subscription`.
  - Reembolsos e estornos (`voidedPurchaseNotification`) tiram o plano.
  - Apagar a conta pára as cobranças (`subscriptionsv2.cancel`).
  - Livre resolução: `subscriptionsv2.revoke` com reembolso total.
- **Um plano de cada vez:**
  - com um plano da web ativo, a app esconde a compra; se acontecer na
    mesma, é revogada com reembolso;
  - com um plano da Play ativo, o checkout EasyPay do site recusa (409).

### Passos do utilizador (fora do código)

1. **Perfil de pagamentos**: Play Console → Configuração → Perfil de
   pagamentos (conta de comerciante, IBAN, dados fiscais).
2. **Produtos**: Monetizar → Subscrições → criar `pro` e `premium` com os 5
   base plans cada, aos preços acima, e ativá-los.
3. **Conta de serviço**:
   - Google Cloud → ativar a *Google Play Android Developer API* → criar a
     conta de serviço → chave JSON;
   - Play Console → Utilizadores e permissões → convidar o email da conta
     com "Ver dados financeiros" e "Gerir encomendas e subscrições";
   - Netlify: `GOOGLE_PLAY_SERVICE_ACCOUNT` (o JSON, ou em base64), marcada
     como secreta.
4. **Notificações em tempo real (RTDN)**:
   - Google Cloud Pub/Sub → criar o tópico (por exemplo `play-rtdn`) e dar a
     `google-play-developer-notifications@system.gserviceaccount.com` a
     função *Pub/Sub Publisher*;
   - criar uma subscrição **push** para
     `https://financeflow-webapp.netlify.app/api/billing/google-play/rtdn`,
     com **autenticação ativada**: escolher uma conta de serviço para o push
     e definir a audiência (por exemplo o próprio URL);
   - Netlify: `GOOGLE_PLAY_RTDN_AUDIENCE` (a audiência) e
     `GOOGLE_PLAY_RTDN_SERVICE_ACCOUNT` (o email da conta de serviço do
     push);
   - Play Console → Monetizar → Configuração da monetização → ativar as
     notificações com o tópico
     `projects/<projeto>/topics/play-rtdn` → "Enviar mensagem de teste". O
     log do Netlify deve mostrar `google_play.rtdn_test`.
5. **Testadores**: Configuração → Testes de licenças → acrescentar os emails
   dos testadores. As compras deles não são cobradas, e as renovações
   mensais de teste acontecem em minutos.
6. **Base de dados**: correr `npm run db:sync-indexes` contra produção, para
   criar os índices novos (`subscription.googlePlayPurchaseToken`,
   `playAccountId`).
7. **Coleção antiga**: `googleplaytransactions` (alternative billing) pode
   ser apagada no Atlas. Deve estar vazia: a app nunca deixou comprar sem a
   inscrição aprovada.
