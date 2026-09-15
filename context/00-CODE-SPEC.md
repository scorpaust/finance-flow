# CODE SPEC — FinanceFlow (Web + Android + Subscrições)

> Documento de referência transversal. Todos os agentes (Claude Code) devem ler
> este ficheiro antes de iniciar qualquer fase. As fases (01 a 07) implementam
> este spec de forma incremental. Não avançar de fase sem os critérios de
> aceitação da anterior cumpridos.

## 1. Estado atual (baseline)

- **Framework**: Nuxt 3.x (SSR/SPA), Vue 3 + `<script setup>` + TypeScript
- **Estilo**: Tailwind CSS, tema dark "glass morphism"
- **Estado**: Pinia (`auth`, `finance`, `groups`, `toast`)
- **Dados**: MongoDB via Mongoose (`User`, `Category`, `Transaction`, `Group`)
- **Auth**: local (email+password, scrypt), sessão via cookie `httpOnly`
- **IA**: ConvNeXt-1D em TensorFlow.js, treino/inferência no browser
- **PWA**: `@vite-pwa/nuxt`, instalável, offline-ready
- **Gráficos**: Chart.js via `vue-chartjs`

## 2. Stack alvo (a adicionar)

| Camada | Tecnologia | Fase |
|---|---|---|
| App Android | Capacitor (`@capacitor/core`, `@capacitor/android`) | Fase 1 |
| Billing (web + Android) | PayPal — Orders API + Subscriptions API, com MB WAY e Multibanco como métodos de pagamento | Fase 2 |
| Billing Android — enquadramento | Pagamentos externos (fora do Google Play Billing), via programa de pagamentos externos da Google na EEA | Fase 2 |
| Reconciliação de subscrição | Webhook PayPal → MongoDB | Fase 2 |
| Insights com IA (estatísticas) | Anthropic API, `claude-haiku-4-5` | Fase 3 |
| Dicas de investimento educativas | Anthropic API + dados de mercado (Twelve Data, grátis) | Fase 3 |
| Internacionalização | `@nuxtjs/i18n` (6 idiomas) + MaxMind GeoLite2 (país por IP) | Fase 5 |
| Validação de input server-side | Zod | Fase 6 |
| Testes | Vitest (unit/integração) + Playwright (e2e) | Fase 6 |
| Monitorização | Sentry (ou equivalente) | Fase 6 |

**Porquê PayPal como processador único**: é o único dos processadores
avaliados com MB WAY e Multibanco disponíveis como métodos de pagamento
próprios (via `payment_source.mb_way` / `payment_source.multibanco` na
Orders API), evitando um segundo contrato/PSP só para estes métodos locais.
**Limitação a respeitar em toda a Fase 2**: MB WAY e Multibanco não suportam
débito automático (sem "billing agreement"), por isso o modelo de subscrição
é híbrido — ver `02-FASE-2-sistema-subscricoes.md` para o detalhe
(`recurring` via cartão/saldo PayPal, `prepaid` por período via MB WAY/
Multibanco).

**Porquê pagamentos externos no Android em vez de Google Play Billing**: para
usar PayPal/MB WAY/Multibanco também dentro da app Android é necessário sair
do Google Play Billing, o que só passou a ser possível na EEA (inclui
Portugal) a partir de 30 de junho de 2026, através do programa de pagamentos
externos da Google. Isto implica inscrição prévia, requisitos de disclosure
ao utilizador, reporte de transações à Google (`ExternalTransactionId` API) e
uma taxa de serviço à Google mesmo pagando por fora — confirmar valores e
requisitos atualizados na Play Console antes do lançamento (Fase 7), pois
esta é uma política recente e sujeita a evolução.

**Porquê Anthropic + Twelve Data para os insights da Fase 3**: `claude-haiku-4-5`
é o modelo atual mais barato da Anthropic, suficiente para gerar JSON
estruturado a partir de agregados já calculados no servidor — não há
necessidade de um modelo mais caro. A Twelve Data foi escolhida entre as
alternativas gratuitas avaliadas por ter o plano grátis mais generoso (800
pedidos/dia) — irrelevante ter dados em tempo real aqui, o snapshot de
mercado é diário e partilhado por todos os utilizadores Premium, nunca
pedido por utilizador/pedido. **Limitação a respeitar em toda a Fase 3**:
a secção de investimento é estritamente educativa por perfil de risco,
nunca recomendações específicas de compra/venda — ver
`03-FASE-3-insights-ia.md` para o detalhe e o motivo regulatório.

**Porquê internacionalização só depois do Design System (Fase 5, não antes)**:
traduzir strings de templates que a Fase 4 ainda vai reescrever é
retrabalho. Idioma da UI e país para métodos de pagamento são **sinais
independentes** — idioma vem da preferência do browser (com override
manual), país vem de geolocalização de IP (MaxMind GeoLite2). Lançamento
com 6 idiomas (PT-PT, EN, FR, DE, IT, ES), EN como fallback universal.
Métodos de pagamento pré-pagos continuam exclusivos de Portugal (MB WAY/
Multibanco) — expandir a outros países fica fora desta fase, ver
`05-FASE-5-internacionalizacao.md`.

## 3. Modelo de subscrição (regra de negócio)

```ts
enum SubscriptionTier {
  FREE = 'free',
  PRO = 'pro',       // 5,00 €/mês
  PREMIUM = 'premium' // 12,99 €/mês
}

interface UserSubscription {
  tier: SubscriptionTier
  status: 'active' | 'pending' | 'past_due' | 'canceled' | 'expired'
  provider: 'paypal' | 'none'
  paymentMethod: 'card' | 'paypal_balance' | 'mbway' | 'multibanco' | 'none'
  // 'recurring' = auto-renovação real (cartão/saldo PayPal via Subscriptions API)
  // 'prepaid'   = período pago à cabeça (MB WAY/Multibanco), expira sem cobrança automática
  periodType: 'recurring' | 'prepaid' | 'none'
  autoRenew: boolean
  currentPeriodEnd: Date | null
}
```

`status: 'pending'` é necessário para Multibanco: o pagamento pode demorar
até 7 dias a confirmar (voucher pago em ATM/homebanking), pelo que a
subscrição fica "pendente" entre a criação da Order e a confirmação via
webhook.

### Matriz de funcionalidades (referência — afinar na Fase 2)

| Funcionalidade | Free | Pro (5€) | Premium (12,99€) |
|---|---|---|---|
| Dashboard + KPIs básicos | ✅ | ✅ | ✅ |
| Transações (limite mensal a definir, ex. 50) | ✅ (limitado) | ✅ (ilimitado) | ✅ (ilimitado) |
| Categorias custom | 1–2 | Ilimitadas | Ilimitadas |
| Grupos/orçamentos | ❌ | ✅ | ✅ |
| Estatísticas avançadas (gráficos completos) | básico | ✅ | ✅ |
| Exportar CSV | ❌ | ✅ | ✅ |
| Interpretação de estatísticas com IA (Fase 3) | ❌ | ✅ | ✅ |
| Dicas de investimento educativas com IA (Fase 3) | ❌ | ❌ | ✅ |
| Previsões IA / ML (ConvNeXt-1D) | ❌ | ❌ | ✅ |
| Suporte prioritário / extras futuros | ❌ | ❌ | ✅ |

Esta tabela é a **fonte de verdade** e deve existir no código como um objeto
único partilhado entre client e server (ex. `shared/features.ts`) — nunca
duplicar a lógica em dois sítios.

## 4. Arquitetura de feature gating

- **Client**: composable `useSubscription()` expõe `tier`, `hasFeature(key)`,
  `isLoading`. UI usa isto para mostrar/esconder secções e mostrar paywall.
- **Server (obrigatório, nunca confiar só no client)**: middleware
  `requireFeature(featureKey)` nos endpoints de `server/api/**` que protegem
  dados sensíveis (ex. previsões).
- Esconder no client é UX; bloquear no server é segurança. As duas camadas são
  obrigatórias em todas as features pagas.

## 5. Convenções

- TypeScript estrito em todo o código novo.
- Composables para lógica reutilizável (`use*.ts`), nunca duplicar lógica de
  negócio em componentes.
- Nomes de ficheiros de fase (`01-...md` a `07-...md`) definem o âmbito de
  cada PR/branch — não misturar tarefas de fases diferentes no mesmo commit.
- Todas as strings visíveis ao utilizador em PT-PT (até à Fase 5, que
  introduz suporte multi-idioma — ver `05-FASE-5-internacionalizacao.md`;
  depois disso, todas as strings passam por chaves de tradução, nunca texto
  fixo num só idioma).
- Cores, tipografia e espaçamento passam a viver em tokens Tailwind
  centralizados (ver Fase 4) — não usar valores hardcoded em componentes.
- **Nunca cortar palavras/texto na UI.** Nenhum texto visível (labels,
  botões, `<select>`/`<option>`, inputs, cards, badges) pode ficar truncado
  a meio de uma palavra por falta de largura — nem com reticências (`...`)
  nem cortado sem aviso. Onde o espaço for limitado, o elemento deve
  ajustar-se ao conteúdo (`w-auto`/`min-w-fit`), quebrar linha
  (`whitespace-normal`/`break-words`), ou usar um layout responsivo
  diferente — nunca `overflow-hidden` sozinho num texto curto. Válido em
  todas as plataformas (web e Android/Capacitor).

## 6. Índice de ficheiros deste pacote

1. `01-FASE-1-fundacao-multiplataforma.md`
2. `02-FASE-2-sistema-subscricoes.md`
3. `03-FASE-3-insights-ia.md`
4. `04-FASE-4-design-system-ui.md`
5. `05-FASE-5-internacionalizacao.md`
6. `06-FASE-6-seguranca-qualidade.md`
7. `07-FASE-7-publicacao.md`
8. `AGENT-RULES.md`
9. `CONFIG-REFERENCE.md`
