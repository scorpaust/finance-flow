# FASE 6 — Registo de Investimentos (Portfolio pessoal + integração com a IA)

> Pré-requisito: Fases 1 a 5 concluídas. Ler `00-CODE-SPEC.md` secções 3 e 4
> (feature gating) e `03-FASE-3-insights-ia.md` inteira — esta fase estende a
> área `/investimento`, o perfil de investidor e as dicas de investimento que
> a Fase 3 criou, e herda a decisão regulatória 4 dessa fase (nunca
> recomendações específicas).
>
> Inserida nesta posição por pedido do utilizador em 2026-09-21 (antes da
> Internacionalização, que passa a Fase 7; Segurança/Qualidade e Publicação
> passam a Fase 8 e Fase 9). O modelo de dados vem de uma folha de Excel que o
> utilizador já usa para acompanhar os investimentos dele.

## A folha de origem

| Portfolio | Inicial | Data | Reforço | Situação | % |
|---|---|---|---|---|---|
| FTSE All-World ETF | 1 000,00 € | 01/10/2026 | 30,00 € | 1 050,00 € | 1,94% |
| Innodata Ação | 50,00 € | 01/10/2026 | 0,00 € | 49,00 € | -2,00% |

A coluna `%` é calculada, não introduzida. Verificado contra as duas linhas:

```
investido = Inicial + Reforço
%         = (Situação − investido) / investido

FTSE:     (1 050 − 1 030) / 1 030 =  1,94%
Innodata: (   49 −    50) /    50 = −2,00%
```

É uma rentabilidade **simples sobre o capital investido** — não é anualizada
nem pondera o momento em que cada reforço entrou (a folha também não).

## Decisões de arquitetura tomadas (não reabrir sem motivo forte)

1. **Modelo = a folha.** Uma linha = uma posição (um ativo que o utilizador
   detém). O formulário tem os campos da folha e a percentagem aparece como
   resultado, nunca como campo editável.
2. **`%` nunca é guardado.** Deriva sempre de `Inicial`, `Reforço` e
   `Situação`, calculado numa única função em `shared/portfolio.ts` usada pelo
   servidor, pelo pré-visualizar do formulário e pelo resumo enviado à IA —
   mesmo padrão de `shared/features.ts` (nunca duplicar a fórmula). O total do
   portfolio calcula-se sobre os **totais** (Σ situação vs. Σ investido), não
   como média das percentagens de cada linha.
3. **`Reforço` é um total acumulado**, como na folha, não uma lista de
   movimentos com data. A ação "Reforçar" soma ao total. Guardar cada reforço
   com data (e daí calcular rentabilidade ponderada no tempo) é uma extensão
   possível mas muda o modelo — fica fora de âmbito (ver secção própria).
4. **`Situação` é introduzida à mão** pelo utilizador (como na folha), com a
   data da última atualização guardada. **Sem preços automáticos por ativo**:
   exigiria um ticker por posição e chamadas à Twelve Data por utilizador,
   contra a regra da Fase 3 (um único snapshot diário partilhado por todos, 800
   pedidos/dia no plano gratuito).
5. **Separado das transações.** Registar ou reforçar um investimento **não cria
   uma `Transaction`** e não entra nas estatísticas, previsões nem na taxa de
   poupança. Razão: o dinheiro investido não é uma despesa, e ligar os dois
   duplicaria valores nas contas. Ligar o reforço a um débito na conta é uma
   extensão possível — fora de âmbito.
6. **Vive dentro de `/investimento`**, depois do perfil de investidor
   (pedido do utilizador). A página passa a ser um hub: portfolio primeiro,
   dicas de IA por baixo. Ver "Fluxo e organização".
7. **A IA só recebe agregados, nunca nomes de posições.** O resumo enviado à
   Anthropic tem totais, percentagens por classe de ativo e concentração — não
   os nomes ("FTSE All-World ETF"), nem valores por posição, nem datas.
   Consistente com a regra de privacidade da Fase 3 e evita que o modelo seja
   tentado a comentar ativos concretos.
8. **Dicas com IA continuam educativas.** Ler a carteira real do utilizador
   contra o perfil dele aproxima-se mais de aconselhamento personalizado do que
   as dicas genéricas da Fase 3. Por isso a integração com a IA (tarefa 6) é
   opcional e fica desligada em produção por uma flag até haver validação
   jurídica — o registo em si (contabilidade pessoal) não tem esse risco e não
   depende disso.
9. **Só euros, só PT-PT** nesta fase, como o resto da app. As strings novas
   entram na auditoria de extração da Fase 7.

## Objetivo

O utilizador regista os investimentos que tem (nome, valor inicial, data,
reforços, valor atual), vê a rentabilidade de cada um e do portfolio inteiro,
e mantém isto atualizado com duas ações rápidas (reforçar, atualizar situação).
Depois de preencher o perfil de investidor, este registo é o ecrã principal da
zona de investimentos, e as dicas de IA passam a poder ter em conta a
composição da carteira (só em agregado).

## A confirmar com o utilizador antes de implementar

Pontos onde há uma escolha de produto ou uma leitura minha da folha. Cada um
tem um valor por omissão (o que está escrito no resto do documento) — confirmar
ou corrigir:

> **2026-09-21**: a fase foi implementada com estes valores por omissão, a pedido
> do utilizador, sem estas confirmações. Continuam por confirmar — se algum for
> corrigido, o custo de mudança está indicado em cada ponto.

- [ ] **Plano**: por omissão, **Premium**, com chave própria
      `investmentTracker` (não reutilizar `aiInvestmentTips`). Razão: a zona de
      investimentos já é Premium, e baixar o plano mais tarde é gratuito, ao
      passo que subi-lo depois de haver utilizadores com dados registados é um
      downgrade problemático. Alternativa: Pro (não tem custo de IA, é só
      contabilidade).
- [ ] **Coluna "Data"**: assumi que é a **data do investimento inicial**. A data
      da folha (01/10/2026) é posterior a hoje (2026-09-21), por isso o
      formulário **não rejeita datas futuras**. Confirmar o significado.
- [ ] **Nome da coluna "Portfolio"**: na folha é o nome do ativo. Na UI
      proponho o campo "Investimento" (nome) e "O meu portfolio" como título da
      lista.
- [ ] **Classe de ativo** (`assetClass`) — campo opcional que **não está na
      folha**. Proposto porque é o que permite à IA falar de diversificação
      sem precisar dos nomes (decisão 7). Sem ele a integração com a IA fica
      reduzida a "número de posições" e "peso da maior".
- [ ] **Vender/encerrar**: nesta fase uma posição vendida elimina-se (com
      confirmação). Não há estado "encerrada" nem ganho realizado.
- [ ] **Downgrade**: o que acontece aos dados se o Premium expirar. Os dados
      **nunca são apagados**; falta confirmar se ficam só de leitura ou atrás
      do paywall, e seguir o que a Fase 2 já decidiu para dados de features
      bloqueadas (ex. grupos).
- [ ] **Validação jurídica** das dicas que leem a carteira (decisão 8) — quem a
      faz e quando; sem ela a flag da tarefa 6 fica desligada.

## Modelo de dados

Nova collection `Investment` em `server/models/index.ts` (mesmo estilo de
`Transaction`: `userId` + valores em euros como `Number`, 2 casas decimais
arredondadas no servidor):

```ts
interface IInvestment extends Document {
  userId: ObjectId
  name: string            // "Portfolio" na folha — trim, 1–80 caracteres
  assetClass?: 'etf' | 'acao' | 'obrigacoes' | 'fundo' | 'deposito' | 'outro'
                          // extensão à folha, opcional (ver "A confirmar")
  initialAmount: number   // "Inicial" — > 0
  initialDate: Date       // "Data" — aceita datas futuras
  reinforcement: number   // "Reforço" — ≥ 0, total acumulado, default 0
  currentValue: number    // "Situação" — ≥ 0
  valueUpdatedAt: Date    // última vez que currentValue mudou (ver tarefa 2)
  createdAt: Date
  updatedAt: Date
}
```

Derivados, **nunca guardados**: `invested = initialAmount + reinforcement`,
`gain = currentValue − invested`, `returnPct` (devolve `null` se `invested`
for 0, e a UI mostra "—").

- Índice `{ userId: 1, initialDate: -1 }` só para desempenho. **Não depender
  de índices únicos**: a criação automática de índices não é fiável neste
  projeto (`bufferCommands: false`, ver `server/plugins/mongoose.ts` e o
  comentário em `DocumentScanUsage`). Nomes repetidos são permitidos — o
  utilizador pode ter o mesmo ETF em duas corretoras.
- Teto fixo de segurança de 100 posições por utilizador (limita o tamanho da
  lista e do que a IA vê). **Não é um limite de plano** — não vai para
  `TIER_LIMITS`.

## Fluxo e organização

`/investimento` passa a decidir o que mostrar por estado:

| Estado do utilizador | O que vê |
|---|---|
| Free ou Pro | `PaywallModal` (`requiredTier: 'premium'`), como hoje |
| Premium, **sem perfil** de investidor | Cartão "Preenche o teu perfil de investidor" → `/investimento/perfil`, que já volta a `/investimento` ao guardar |
| Premium, perfil **válido** | Hub completo: resumo, lista/tabela, cartão de dicas de IA |
| Premium, perfil **expirado** (> 365 dias) | Hub completo, mais um aviso "renova o teu perfil"; só o cartão de dicas fica bloqueado |

Duas regras que não são óbvias:

- **Perfil expirado nunca esconde os dados do utilizador.** A Fase 3 trata um
  perfil com mais de 365 dias "como se não existisse" para as dicas; aqui isso
  só se aplica às dicas. O registo continua acessível e editável.
- **O perfil é uma ordem de UX, não um controlo de segurança.** O servidor só
  exige o plano (`requireFeature`), não o perfil — o perfil já não tem gate
  próprio (`server/api/investor-profile/index.ts`). Se o utilizador chamar a API
  diretamente sem perfil, funciona.

A chamada à Anthropic **deixa de acontecer ao abrir a página** (hoje
`pages/investimento/index.vue` chama `/api/insights/investment` no `onMounted`,
ou seja, um pedido pago por cada visita). Com o portfolio como ecrã principal,
as dicas passam a ser geradas por botão, com cache (tarefa 6).

## Tarefas

### 1. Matriz de features e enforcement

- [x] `shared/features.ts` — nova `FeatureKey` `investmentTracker` com
      `investmentTracker: 'premium'` em `FEATURE_MATRIX` (tier a confirmar,
      ver acima), com o comentário a apontar para esta spec
- [x] `requireFeature(event, 'investmentTracker')` em todos os endpoints da
      tarefa 3 (403 `feature_locked` mesmo com o client adulterado)
- [x] `pages/investimento/index.vue` passa a usar
      `hasFeature('investmentTracker')` para o paywall da página;
      `aiInvestmentTips` fica só no cartão de dicas e no seu endpoint

### 2. Modelo e cálculo

- [x] `Investment` em `server/models/index.ts` (secção "Modelo de dados")
- [x] `shared/portfolio.ts` — funções puras: `investedAmount()`, `gainAmount()`,
      `returnPct()` (devolve `null` com `invested === 0`) e `summarizePortfolio()`
      (totais, retorno agregado sobre totais, peso por `assetClass`, peso da
      maior posição, dias desde a atualização mais antiga). Sem dependências de
      Vue nem de Mongo — para o servidor, o client e (na Fase 8) os testes
      unitários usarem exatamente o mesmo código
- [x] `valueUpdatedAt`: definido na criação e sempre que um `PUT` altera
      `currentValue`; não muda se só se editar o nome, por exemplo

### 3. API (servidor)

Segue o padrão do projeto (`index.ts` + `[id].ts`, despacho por método,
validação manual como em `server/api/investor-profile/index.ts` — o Zod só
chega na Fase 8, escrever a validação de forma fácil de migrar).

- [x] `server/api/investments/index.ts` — `GET` devolve a lista (com `invested`,
      `gain`, `returnPct` já calculados) e o `summary`; `POST` cria
- [x] `server/api/investments/[id].ts` — `PUT` **parcial** (só valida os campos
      enviados; é o que serve tanto a edição completa como as ações rápidas) e
      `DELETE`
- [x] Todas as queries filtram por `userId` do pedido (`findOne({ _id, userId })`);
      `_id` de outro utilizador → 404, nunca 403 (não confirmar que existe)
- [x] Validação: `name` 1–80; `initialAmount` > 0; `reinforcement` e
      `currentValue` ≥ 0; valores finitos e abaixo de um teto absurdo (ex.
      1e9); `assetClass` dentro do enum; `initialDate` data válida; teto de
      100 posições → 400 com código `investment_limit`
- [x] Arredondar a 2 casas no servidor antes de gravar

### 4. Client — registo

- [x] `composables/useInvestments.ts` — lista, resumo, criar/editar/eliminar;
      usa `shared/portfolio.ts` (nunca reimplementar a fórmula)
- [x] `components/forms/InvestmentModal.vue` — segue o `TransactionModal`
      (mesmo estilo de modal e validação). Campos por esta ordem, como na
      folha: nome, classe de ativo (opcional), inicial, data, reforço (default
      0), situação (pré-preenchida com `inicial + reforço`, editável).
      **Pré-visualização da rentabilidade** por baixo dos campos, a atualizar
      enquanto se escreve
- [x] Ações rápidas por linha, que são o uso real da folha (todos os meses):
      - "Reforçar" — o utilizador escreve **o valor a acrescentar** (não o novo
        total, que é fácil de errar); soma a `reinforcement`
      - "Atualizar situação" — só `currentValue`
      - editar (modal completo) e eliminar (com confirmação; texto a avisar
        que não se pode desfazer)
- [x] Formatação com o `useFormatters` existente (`formatCurrency`,
      `formatDate` em `dd/MM/yyyy` como na folha, `formatPercentage` com sinal e
      2 casas — `1,94%` / `-2,00%`; acrescentar variante com sinal se não
      existir)

### 5. Client — página e organização

- [x] `pages/investimento/index.vue` reestruturada como hub (tabela de estados
      acima): resumo em `KpiCard` (total investido, valor atual, ganho/perda
      em €, rentabilidade %), lista e cartão de dicas
- [x] `components/investment/PortfolioTable.vue` — em ecrãs largos, tabela com
      as **mesmas colunas da folha** (Portfolio, Inicial, Data, Reforço,
      Situação, %); em mobile, cartões (uma tabela de 6 colunas não cabe num
      telemóvel). Ganho/perda positivo e negativo distinguidos por **sinal e
      ícone**, não só por cor
- [x] Indicador de "situação desatualizada" quando `valueUpdatedAt` tem mais de
      30 dias (a rentabilidade mostrada pode já não ser a real)
- [x] Estado vazio com chamada à ação ("Regista o teu primeiro investimento")
- [x] Estados de loading/erro consistentes com o resto da app; usar os tokens
      do design system da Fase 4, sem cores inline

### 6. Integração com a IA (dicas de investimento)

> Esta tarefa é a única que depende de validação jurídica (decisão 8). As
> tarefas 1 a 5 entregam valor sozinhas e não dependem dela.

- [x] `server/utils/portfolio.ts` — `portfolioSummaryForAi(userId)` que usa
      `summarizePortfolio()` e devolve **só agregados**:
      `{ positions, totalInvested, totalValue, returnPct, allocation:
      [{ assetClass, weightPct }], largestPositionPct, oldestValuationDays }`.
      **Sem `name`, sem valores por posição, sem datas de posições**
- [x] Flag `INVESTMENT_TIPS_INCLUDE_PORTFOLIO` (default `false`) — quando
      desligada, `investment.post.ts` comporta-se exatamente como na Fase 3.
      Documentar em `context/CONFIG-REFERENCE.md` (regra do `AGENT-RULES.md`)
- [x] `server/api/insights/investment.post.ts` — com a flag ligada e pelo menos
      uma posição, acrescentar `portfolio` ao payload. Se houver posições, o
      `hasExistingInvestments` enviado é `true` mesmo que o perfil (respondido
      há meses) diga o contrário
- [x] System prompt (fixo, versionado no código), acrescentar regras:
      - usar a carteira só para comentar **diversificação, concentração e
        regularidade** em termos gerais, relativos ao `riskTolerance`
      - nunca sugerir vender, comprar ou reequilibrar posições concretas, nem
        classes com percentagens-alvo ("deves ter 60% em X")
      - nunca prever nem extrapolar a rentabilidade mostrada
      - se `oldestValuationDays` for alto, dizer que os números podem estar
        desatualizados
      O disclaimer continua **hardcoded** no servidor, como na Fase 3
- [x] Cache: nova collection `InvestmentTipsCache` com `_id` = `userId` (mesmo
      truque de `DocumentScanUsage`, pelo mesmo motivo dos índices), `tips`,
      `inputHash` (hash do perfil + agregados + data do snapshot de mercado) e
      `generatedAt`. Devolve o cache se tiver menos de 24 h **ou** se o
      `inputHash` for igual; só regenera cedo quando o hash mudou (perfil ou
      carteira alterados). Controla custo e impede regeneração em loop
- [x] `components/insights/InvestmentTipsCard.vue` — botão "Gerar dicas", mostra
      as dicas (movidas de `index.vue`), o disclaimer **sempre visível**, a data
      do snapshot de mercado e a de geração; estados `needsProfile` /
      perfil expirado. Texto de transparência: "As dicas usam só totais e
      percentagens da tua carteira — os nomes dos teus investimentos não são
      enviados à IA"
- [ ] Custo: medir `response.usage` de uma geração com portfolio e comparar com
      a da Fase 3 (o payload cresce alguns agregados; deve continuar residual)
      → **por fazer**: a conta Anthropic estava sem créditos (2026-09-21), a
      geração real nunca correu. O payload é pequeno (só agregados), mas o valor
      não foi medido

## Notas de implementação (2026-09-21)

Onde a implementação se afastou do texto acima, ou o interpretou:

- **`KpiCard` não foi reutilizado** (tarefa 5 pedia-o): mostra valores compactos
  ("1.1k €") e a percentagem com 1 casa e cores de "taxa de poupança". Criado
  `components/investment/InvestmentSummary.vue`, com valores exatos e a
  rentabilidade com 2 casas, como na folha.
- **Endpoint novo `GET /api/insights/investment`** (não estava na lista): devolve
  as últimas dicas da cache **sem chamar a Anthropic**. É o que permite à página
  mostrar as dicas ao abrir sem gerar (e pagar) uma geração por visita. Devolve
  também `outdated`, que decide se o botão "Atualizar dicas" faz sentido.
- **Regra da cache** (o texto da tarefa 6 era ambíguo): serve a cache se o
  `inputHash` for igual **e** tiver menos de 24 h; regenera se o hash mudou ou
  passaram 24 h. O hash usa agregados arredondados, por isso mudanças de cêntimos
  não invalidam a cache. Com a flag desligada o hash não inclui o portfolio.
- **Cache também com a flag desligada**: as dicas da Fase 3 passam a ter cache
  (antes geravam uma chamada por visita). O payload e o prompt com a flag
  desligada são os da Fase 3.
- **`valueUpdatedAt`** só muda quando a `Situação` muda de facto: gravar o mesmo
  valor não conta como atualização.
- **Mensagens de erro** da API no formato `Campo: motivo`; o teto de 100 posições
  devolve `data.error = 'investment_limit'`.
- **Sem `Intl` com sinal "+"** na rentabilidade: `1,94%` e `-2,00%` como na folha;
  o ganho em € usa `formatSignedCurrency` (`+20,00 €` / `-1,00 €`).

## Fora de âmbito nesta fase

- **Preços de mercado automáticos por posição** (ticker + Twelve Data) — ver
  decisão 4; exigiria repensar limites e o modelo de dados
- **Histórico de valorizações e gráfico de evolução** — hoje só se guarda o
  valor atual; cada atualização sobrescreve o anterior
- **Reforços com data** (lista de movimentos) e rentabilidade anualizada/
  ponderada no tempo (TWR/IRR) — ver decisão 3
- **Vendas e ganho realizado**, dividendos/juros, comissões e impostos
- **Várias moedas** — só euros, como a app inteira; a conversão é tema da Fase 7
- **Ligar reforços a `Transaction`** (débito automático na conta) — decisão 5
- **Importar a folha de Excel/CSV** — extensão natural (o utilizador já tem os
  dados lá), fica para depois do modelo estar validado no uso real
- **Digitalizar extratos de corretora** com o scan da Fase 5 — outro schema e
  outro prompt; não misturar
- **Investimentos nas estatísticas/previsões**, património líquido no dashboard
- **Recomendações específicas de compra/venda** — nunca, em nenhuma fase, sem
  validação jurídica explícita (decisão regulatória 4 da Fase 3)
- Testes automatizados — a suite chega na Fase 8; `shared/portfolio.ts` fica
  puro justamente para ser o primeiro candidato

## Critérios de aceitação

- [x] **Reproduz a folha**: registar FTSE All-World ETF (1 000 € inicial, 30 €
      de reforço, 1 050 € de situação) mostra **1,94%**, e Innodata Ação
      (50 €, 0 €, 49 €) mostra **−2,00%**. Resumo do portfolio: investido
      1 080 €, valor atual 1 099 €, ganho 19 € e **1,76%** (19 / 1 080 — não a
      média de 1,94% e −2,00%)
      → verificado pela API e na UI (browser headless): 1,94%, -2,00%, resumo 1 080 € / 1 099 € / 19 € / 1,76%.

- [x] `%` não existe na base de dados; alterar `Situação` muda-a sem qualquer
      outra escrita
      → confirmado no documento cru da BD: só initialAmount/reinforcement/currentValue são guardados.

- [x] Reforçar 20 € numa posição soma 20 ao reforço existente (não o
      substitui) e a percentagem recalcula
      → confirmado pela API e pela UI (reforçar +50 sobre 0 dá 50; a % recalcula).

- [x] Utilizador Free/Pro não usa a área — paywall no client e 403
      `feature_locked` em **todos** os endpoints `/api/investments/**` mesmo
      chamados diretamente
      → testado com um utilizador Free (403 `feature_locked` em GET/POST/PUT/DELETE e nos dois endpoints de dicas; paywall na UI). Pro não foi testado à parte — é o mesmo caminho, o tier mínimo é `premium`.

- [x] Um utilizador nunca vê, edita nem elimina posições de outro (testar com
      um `_id` alheio: 404)
      → testado com dois utilizadores Premium: GET/PUT/DELETE sobre o `_id` do outro dão 404.

- [x] Sem perfil de investidor, `/investimento` pede o perfil primeiro e volta
      ao hub ao guardar. Com perfil expirado o utilizador **continua a ver e
      editar** o portfolio
      → verificado na UI: sem perfil pede o perfil; preencher e guardar o
      questionário volta a `/investimento` e mostra o hub; com o perfil expirado
      (400 dias) o portfolio continua visível e editável, só o cartão de dicas
      bloqueia, e os endpoints de dicas devolvem `needsProfile`.
- [x] Abrir `/investimento` **não** faz nenhum pedido à Anthropic; só o botão
      "Gerar dicas" o faz, e uma 2.ª geração dentro de 24 h sem alterações
      devolve o cache (confirmado nos logs do servidor)
      → confirmado num registo dos pedidos enviados: o GET não gera nenhum; o 2.º POST sem alterações devolve a cache. **Feito com uma resposta da Anthropic simulada** (conta sem créditos), por isso valida a lógica de cache, não a geração real.

- [x] Com a flag desligada, o payload da IA é igual ao da Fase 3. Com a flag
      ligada, o payload contém **só agregados** — confirmar nos payloads de
      request que não há nomes de posições, valores por posição nem datas
      → confirmado nos payloads capturados: sem flag, chaves `profile, financeSummary, marketSnapshot` e prompt sem a adenda; com flag, o `portfolio` só tem agregados (sem nomes, valores por posição nem datas) e `hasExistingInvestments` passa a `true`.

- [ ] As dicas geradas com portfolio nunca nomeiam um ativo, nunca dizem
      comprar/vender/reequilibrar e mostram sempre o disclaimer (revisão manual
      de amostras com carteiras diferentes: concentrada, diversificada, vazia)
      → **não verificado**: exige geração real da Anthropic (sem créditos a 2026-09-21). O prompt proíbe-o e o modelo nunca recebe nomes, mas a revisão manual de amostras reais continua por fazer.

- [ ] Layout correto em mobile (cartões), desktop (tabela com as colunas da
      folha) e ultra-wide; gating das Fases 2 e 3 sem regressões (ver
      `AGENT-RULES.md`, "Testes manuais mínimos")
      → **quase completo**: verificado num Edge headless a 390 px (cartões), 820 px
      (tablet, tabela), 1440 px (desktop) e 2560 px (ultra-wide), sem scroll
      horizontal em nenhum. Gating das Fases 2 e 3 sem regressões: Free recebe
      403 em grupos, exportação CSV, previsões, estatísticas avançadas,
      interpretação de estatísticas, digitalização de documentos e dicas;
      Premium continua a receber 200. **Por verificar**: um dispositivo Android
      real.
- [ ] Validação jurídica das dicas com portfolio feita **antes** de ligar a
      flag em produção (não bloqueia o resto da fase)
