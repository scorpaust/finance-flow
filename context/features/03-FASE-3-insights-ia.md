# FASE 3 — Insights com IA (Estatísticas Pro+ e Investimento Premium)

> Pré-requisito: Fase 2 concluída (o sistema de subscrições e o
> `requireFeature`/`hasFeature` já têm de existir — esta fase só acrescenta
> features gated aos planos já criados). Ler `00-CODE-SPEC.md` secções 3 e 4.

## Decisões de arquitetura tomadas (não reabrir sem motivo forte)

1. **LLM: Anthropic, modelo `claude-haiku-4-5`** — modelo atual mais barato
   da Anthropic ($1/$5 por milhão de tokens input/output), suficiente para
   gerar JSON estruturado a partir de agregados já calculados (não é preciso
   um modelo mais caro para isto). Chamado sempre a partir do servidor
   (`server/utils/anthropic.ts`) — a chave da API nunca chega ao client.
2. **Dados de mercado: Twelve Data**, plano gratuito (800 pedidos/dia,
   atraso de 4h) — mais generoso que a alternativa avaliada (Alpha Vantage,
   25/dia). O atraso de 4h é irrelevante aqui porque não é preciso preço em
   tempo real, só contexto geral de mercado.
3. **Split de acesso por tier** (decisão explícita do dono do produto):
   - **Interpretação de estatísticas com IA** → **Pro e Premium** (não é
     exclusivo Premium)
   - **Dicas de investimento com IA** (perfil de investidor + contexto de
     mercado) → **exclusivo Premium**
4. **Nunca recomendações de investimento específicas.** Risco regulatório
   real: aconselhamento de investimento personalizado pode exigir licença da
   CMVM em Portugal, mesmo vindo de uma IA. A secção de investimento é
   estritamente **educativa e genérica por perfil de risco** (nunca "compra
   X"), com disclaimer "não é aconselhamento financeiro" sempre visível.
   Isto molda o prompt (secção 4) e não é negociável sem validação legal.
5. **Sem proração/cobrança nova aqui** — esta fase não toca no sistema de
   subscrições da Fase 2, só consome `hasFeature()`/`requireFeature()` já
   existentes.

## Objetivo

Duas secções novas, geradas por IA a partir dos dados financeiros do
utilizador:
1. **Interpretação de estatísticas + sugestões de melhoria** (Pro e Premium)
   em `/stats`.
2. **Dicas de investimento educativas por perfil de risco**, combinando as
   finanças pessoais do utilizador com contexto geral de mercado (Premium),
   com um questionário de perfil de investidor renovado anualmente.

## Tarefas

### 1. Configuração base

- [ ] Criar conta/chave da API Anthropic (`ANTHROPIC_API_KEY`)
- [ ] Criar conta/chave gratuita da Twelve Data (`TWELVE_DATA_API_KEY`)
- [ ] `server/utils/anthropic.ts` — wrapper fino sobre a Messages API
      (`POST /v1/messages`, modelo `claude-haiku-4-5`, `output_config.format`
      para forçar JSON estruturado em vez de prosa livre)
- [ ] `server/utils/marketData.ts` — wrapper sobre a Twelve Data API (pedir
      só os índices/mercados globais principais, não ações individuais)

### 2. Modelo de dados

- [ ] Adicionar a `User` (`server/models/index.ts`):
  ```ts
  interface IInvestorProfile {
    riskTolerance: 'conservador' | 'moderado' | 'arrojado'
    horizonYears: number
    hasExistingInvestments: boolean
    knowledgeLevel: 'iniciante' | 'intermedio' | 'avancado'
    goals: string[]
    updatedAt: Date
  }
  ```
  campo `investorProfile?: IInvestorProfile` no `IUser` — sem valor default
  automático, só existe depois do utilizador responder ao questionário.
- [ ] Nova collection `MarketSnapshot` (singleton, 1 documento, ou
      `{ date, data }` por dia) — cache do snapshot diário da Twelve Data,
      partilhado por todos os utilizadores Premium nesse dia. Nunca chamar a
      Twelve Data por utilizador/pedido.

### 3. Fonte única de features (atualizar `shared/features.ts`)

- [ ] Adicionar `FeatureKey`: `'aiStatsInsights'` (Pro) e
      `'aiInvestmentTips'` (Premium) à `FEATURE_MATRIX` existente

### 4. Interpretação de estatísticas (Pro + Premium)

- [ ] `server/api/insights/stats.post.ts`, gated com
      `requireFeature(event, 'aiStatsInsights')`
- [ ] Body: `{ months }`. Busca os agregados já existentes
      (`/api/stats/overview`, `/categories`, e `/advanced` quando
      disponível) — **nunca enviar descrições de transações em bruto ao
      LLM**, só números/nomes de categoria já agregados (privacidade: as
      descrições podem conter texto sensível, ex. "consulta psiquiatra")
- [ ] Prompt fixo (system prompt versionado no código, não editável em
      runtime) que pede JSON: `{ insights: string[], suggestions: string[] }`
      (2-3 insights, 1-2 sugestões), em PT-PT
- [ ] Cache de 24h por utilizador (não gerar de novo a cada visita a
      `/stats` — controla custo). Guardar `lastInsightAt` e o resultado, ou
      numa collection dedicada `AiInsightCache`
- [ ] `components/insights/StatsInsightCard.vue` — botão "Analisar com IA",
      mostra loading, depois os insights/sugestões; paywall/teaser para Free
- [ ] Secção nova em `pages/stats/index.vue`, gated com
      `useSubscription().hasFeature('aiStatsInsights')`

### 5. Dicas de investimento (Premium)

- [ ] Questionário de perfil de investidor:
  - [ ] `server/api/investor-profile/index.ts` (GET/POST) — grava
        `IInvestorProfile` no `User`
  - [ ] `pages/investimento/perfil.vue` — formulário curto (5-10 perguntas:
        horizonte temporal, tolerância ao risco, conhecimento, objetivos,
        investimentos existentes)
  - [ ] Lógica de "renovar anualmente": se `investorProfile.updatedAt` tem
        mais de 365 dias, tratar como se não existisse (pedir de novo antes
        de mostrar dicas)
- [ ] Job diário (reutilizar o padrão do cron de `check-expirations` da
      Fase 2 — endpoint protegido por `CRON_SECRET`, chamado de fora) que
      atualiza o `MarketSnapshot` do dia via Twelve Data
- [ ] `server/api/insights/investment.post.ts`, gated com
      `requireFeature(event, 'aiInvestmentTips')`. Se não houver
      `investorProfile` válido (inexistente ou > 365 dias), devolver
      `{ needsProfile: true }` em vez de gerar dicas
- [ ] Prompt fixo, **obrigatoriamente** instruído a:
      - nunca nomear tickers/ativos específicos para comprar/vender
      - falar só de classes de ativos e conceitos gerais (ex. "ETFs
        diversificados", "obrigações do tesouro"), adaptados ao
        `riskTolerance` do utilizador
      - incluir sempre, no início da resposta, a frase de disclaimer fixa
        (não gerada pelo LLM — hardcoded no código, para garantir que nunca
        falta)
  Body do prompt: perfil de investidor + resumo do `MarketSnapshot` do dia +
  resumo agregado das finanças do utilizador (saldo médio, taxa de
  poupança) — outra vez, nunca descrições de transações em bruto
- [ ] `pages/investimento/index.vue` — mostra o questionário se
      `needsProfile`, senão as dicas + disclaimer sempre visível + data do
      snapshot de mercado usado
- [ ] Link "Investimento" na navegação, visível para todos mas com paywall
      (`PaywallModal`, `requiredTier: 'premium'`) se `!hasFeature('aiInvestmentTips')`

## Fora de âmbito nesta fase

- Redesign visual final destas secções (Fase 4 — design system)
- Qualquer recomendação de compra/venda de ativos específicos (nunca, em
  nenhuma fase, sem validação legal explícita)
- Testes automatizados destas features com chamadas reais à Anthropic/Twelve
  Data (mocks obrigatórios — ver Fase 5)

## Critérios de aceitação

- [ ] Free não vê nada destas secções (paywall visível); Pro/Premium veem
      interpretação de estatísticas; só Premium vê dicas de investimento
- [ ] `requireFeature('aiStatsInsights')` e `requireFeature('aiInvestmentTips')`
      bloqueiam no servidor mesmo que o client seja adulterado (403)
- [ ] Interpretação de estatísticas não repete chamada à Anthropic dentro de
      24h para o mesmo utilizador (cache confirmado)
- [ ] Questionário de perfil de investidor grava corretamente e é pedido de
      novo passados 365 dias (testável adiantando `updatedAt` manualmente)
- [ ] Dicas de investimento nunca mencionam um ativo/ticker específico
      (revisão manual de amostras geradas) e mostram sempre o disclaimer
- [ ] `MarketSnapshot` só é atualizado 1x/dia (confirmar não há chamadas
      repetidas à Twelve Data por utilizador)
- [ ] Nenhuma descrição de transação em bruto é enviada à Anthropic
      (confirmar nos payloads de request)
