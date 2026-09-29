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
- Capturas de ecrã: pelo menos 2 de telemóvel e 2 de tablet (7" e 10"). A
  gerar a partir da app em produção com uma conta demo com dados de exemplo
  (nunca dados reais).

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
| Outras informações financeiras | Transações, orçamentos, investimentos, perfil de investidor | Sim | Funcionalidade da app | Não |
| Fotos | Recibo/fatura digitalizado (Pro) — enviado à Anthropic para extração, **não guardado** | Sim, processamento efémero | Funcionalidade da app | Sim |
| Localização aproximada | País, a partir do IP, só para mostrar os métodos de pagamento — **não guardado** | Sim, processamento efémero | Funcionalidade da app | Não |
| Registos de falhas / diagnóstico | Sentry (só com `SENTRY_DSN` definido; sem corpos, cookies nem Session Replay) | Sim | Análise e correção de erros | Não |

**Dados de pagamento** (cartão, IBAN, telemóvel MB WAY): introduzidos no
formulário da EasyPay, **nunca passam pelos nossos servidores** — não se
declaram como recolhidos pela app.

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

## 5. Faturação — pagamentos com EasyPay dentro da app

**Correção à especificação** (verificado nas páginas da Google a
2026-09-29): o "programa de pagamentos externos" referido na Fase 2 é hoje
**só para o Japão**. No EEE, cobrar subscrições digitais dentro da app com um
processador próprio (a EasyPay) exige o programa **alternative billing
only**:

- integração **nativa** da Play Billing Library **8+** (obrigatória para apps
  novas e atualizações desde 31/08/2026; prorrogação possível até 01/11/2026):
  `isAlternativeBillingOnlyAvailableAsync`,
  `showAlternativeBillingOnlyInformationDialog` (ecrã informativo da Google
  na 1.ª compra) e `createAlternativeBillingOnlyReportingDetailsAsync`;
- **reporte de cada transação** à Google Play Developer API
  (`externaltransactions`) em até **24 h** — o reporte manual está a ser
  descontinuado;
- inscrição por formulário e configuração por país na Play Console; taxa de
  serviço da Google sobre cada transação (confirmar o valor atual na
  inscrição).

Fontes: [Alternative billing APIs](https://developer.android.com/google/play/billing/alternative),
[About the program (Japão)](https://developer.android.com/google/play/billing/externalpaymentlinks).

**Decisão do utilizador (2026-09-29): alternative billing only.** Implementado:

- **App (nativo)**: `AlternativeBillingPlugin.java` (Play Billing Library
  9.1.0) — antes de cada compra confirma a disponibilidade, mostra o ecrã
  informativo da Google e obtém o token; `composables/useAlternativeBilling.ts`
  + `pages/subscription/index.vue`. Sem o programa disponível (fora do EEE,
  sem inscrição aprovada), a app Android **não deixa comprar** e mostra
  `subscription.androidBillingUnavailable`. No browser nada muda.
- **Servidor**: `server/utils/googlePlayBilling.ts` + coleção
  `GooglePlayTransaction` — reporta a transação inicial (com o token), as
  renovações mensais de cartão/débito direto (mesma série) e os pagamentos
  MB WAY/Multibanco (`PREPAID`); reembolsos de livre resolução reportados em
  `admin/refund-delete`. Fila com novas tentativas de hora a hora
  (`/api/billing/google-play/process-queue`, `.github/workflows/cron.yml`).
  Compras feitas no site não se reportam. IVA reportado: 0 (isenção, art.
  53.º CIVA — `BILLING_VAT_RATE`).
- **Testes**: 5 testes de integração com a Google simulada (token, renovação,
  PREPAID, compra no site sem reporte, falha + nova tentativa, reembolso).

**Passos do utilizador** (fora do código):
1. Inscrever a app no programa *alternative billing only* (formulário da
   Google) e ativá-lo para Portugal/EEE na Play Console.
2. Criar uma conta de serviço no Google Cloud, dar-lhe acesso à app na Play
   Console (Utilizadores e permissões → "Ver dados financeiros" e "Gerir
   encomendas") e guardar o JSON em `GOOGLE_PLAY_SERVICE_ACCOUNT` no Netlify.
3. Adicionar os testadores internos como *license testers* — as transações
   deles chegam à Google marcadas como teste.
4. Vigiar o estado `failed` na coleção `GooglePlayTransaction` (o cron regista
   `google_play.failed_transactions` no log) — são transações que a Google
   recusou e que têm de ser reportadas à mão.
