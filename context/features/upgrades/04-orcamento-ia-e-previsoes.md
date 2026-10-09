# UPGRADE 04 — Orçamento sugerido por IA e correções às previsões

> Pedido do utilizador (2026-10-08): "uma nova funcionalidade a acrescentar
> ao machine learning... com 3 meses de despesas ter opção para a IA gerir o
> máximo de gastos por grupos/categorias tendo em conta as receitas do
> utilizador e o fundo de maneio necessário para cada mês. (a única vez que
> usei as previsões deu-me 3 meses exatamente com os mesmos dados... foi na
> conta testers-premium. vê se está tudo ok com isso)".

## Parte A — Previsões: o que se passou e o que corrigir

**Diagnóstico** (`composables/useMLPrediction.ts`, `server/api/predictions/data.ts`).

O `tester-premium` tinha 4 meses de dados, o último ainda a meio. O modelo
ConvNeXt-1D precisa de `SEQ_LEN + 2` meses: com 4 meses, `SEQ_LEN` = 3 e
são precisos 5. Com menos, cai em `simpleForecast`: a **média dos últimos 3
meses repetida nos 3 meses seguintes**. Daí os 3 meses iguais. (Os dados de
teste também são idênticos todos os meses, o que dava uma previsão plana
mesmo com o modelo.)

Há três problemas reais:

1. **Mês atual incompleto entra nas contas.**
   - Puxa a média para baixo: por exemplo, a 8 de outubro, outubro só tem o
     salário, a renda e pouco mais.
   - No treino do modelo, ensina uma "queda" no fim da série.
2. **A página não explica a alternativa.**
   - Mostra `LinearAverage (fallback)` (inglês técnico) e uma "confiança" de
     58%.
   - A mensagem de dados insuficientes não diz quantos meses faltam.
3. **A alternativa é plana:** ignora uma tendência clara (por exemplo,
   despesas a subir mês a mês).

### Tarefas A

- [x] O servidor (`/api/predictions/data`) indica qual é o mês atual
      incompleto. A previsão treina e calcula médias só com **meses
      completos**. O mês atual aparece no gráfico como "em curso",
      separado.
- [x] Sem meses suficientes para o modelo:
  - texto claro e traduzido: "Previsão simples: são precisos 5 meses
    completos para o modelo de IA (tens N)";
  - nome do método em linguagem simples ("Média dos últimos meses"), e não
    o nome interno;
  - sem percentagem de confiança inventada.
- [x] Alternativa com tendência: regressão linear sobre os meses completos,
      limitada (não projeta valores negativos nem saltos maiores do que o
      máximo histórico). A média só se usa quando não há tendência.
- [x] **Um só mínimo, dito da mesma forma em todo o lado.** Hoje há três
      números diferentes:
  - página vazia: "pelo menos 3 meses" (`predictions.emptyHint`);
  - aviso ao gerar: "pelo menos 2 meses" (`predictions.toastMinData`);
  - o modelo de IA, na realidade: 5 meses.

  Proposta:
  - **2 meses completos** para a previsão simples (tendência);
  - **5 meses completos** para o modelo de IA;
  - a página diz quantos meses completos há e o que cada patamar
    desbloqueia;
  - os números vêm de uma constante partilhada, para não voltarem a
    divergir.
- [x] Testes unitários das funções puras: meses completos, tendência, limites.

## Parte B — Orçamento sugerido por IA (nova funcionalidade)

### Objetivo

Com **pelo menos 3 meses completos** de despesas, o utilizador pede à IA
uma proposta de **limite máximo de gastos por mês** para cada categoria e
cada grupo. A proposta tem em conta:

- as **receitas** médias, e a tendência delas;
- os **gastos fixos** (renda, contas, assinaturas — despesas recorrentes ou
  muito regulares), que não se cortam;
- o **fundo de maneio** do mês: o dinheiro que tem de ficar disponível para
  imprevistos e para não chegar ao fim do mês a zero;
- opcionalmente, uma **meta de poupança**.

O utilizador vê a proposta, ajusta-a e aplica-a com um toque. Aplicar grava
os limites que a app já tem: `monthlyLimit` das categorias e dos grupos, e o
alerta de percentagem dos grupos.

### Como funciona (proposta técnica)

1. **Servidor: cálculo determinístico** (fonte de verdade dos números):
   - por categoria e por grupo, com meses completos: média, mediana,
     desvio, mínimo e máximo, e se é fixa (recorrente ou com variação
     < 10%) ou variável;
   - receita disponível =
     receita mensal esperada − fundo de maneio − meta de poupança;
   - os fixos ficam com o valor atual. A diferença entre a receita
     disponível e os fixos reparte-se pelas variáveis, proporcionalmente ao
     histórico, cortando primeiro as mais "discricionárias" (lazer,
     compras, restaurantes) se o total não couber.
2. **IA (Anthropic, como na Fase 3)**:
   - recebe **só os agregados** (nunca descrições de transações);
   - devolve, em JSON validado, ajustes dentro de limites (nenhum limite
     abaixo de 50% do mínimo histórico, total nunca acima da receita
     disponível) e uma explicação curta por categoria, no idioma da app;
   - o servidor volta a verificar as somas: se a IA falhar ou sair dos
     limites, fica a proposta determinística.
3. **Cliente**:
   - na página de Previsões (ou em Grupos), um cartão "Orçamento sugerido";
   - mostra o resumo (receita, fixos, fundo de maneio, poupança,
     disponível) e uma tabela categoria/grupo com o gasto médio, o limite
     proposto e a diferença;
   - campos editáveis, um botão "Aplicar limites" e um botão "Desfazer"
     (guarda os limites anteriores).

### Decisões (utilizador, 2026-10-08)

1. **Plano: Premium** (o Pro não tem acesso). Nova chave na matriz:
   `aiBudget: 'premium'`. O destaque do plano entra em `PLAN_HIGHLIGHTS`.
2. **Fundo de maneio por omissão: 10% da receita mensal**, editável pelo
   utilizador.
3. **Meta de poupança por omissão: 10%**, editável (pode pôr 0%).
4. **Onde aparece:** é gestão orçamental, não previsões. Fica na página
   **Grupos e orçamentos** (`/groups`), onde já se definem os limites, como
   um cartão "Orçamento sugerido por IA" no topo da página.
   - Também aparece numa vista simples das categorias, porque os limites
     das categorias também são preenchidos.
   - Um utilizador Pro vê o cartão bloqueado (paywall Premium).
5. **Só a pedido do utilizador, uma vez por mês civil** (no fuso de Lisboa,
   como o resto do servidor).
   - O pedido fica registado por conta e por mês, e um segundo pedido no
     mesmo mês é recusado com uma mensagem a dizer quando pode voltar a
     pedir.
   - Entretanto, a proposta do mês continua visível e pode ser aplicada ou
     desfeita as vezes que quiser.
   - Não há sugestão automática.

### Tarefas B

- [x] `POST /api/insights/budget` (`requireFeature('aiBudget')`):
  - agregados, cálculo determinístico, IA e validação;
  - **um pedido por conta por mês civil**: nova coleção, ou um campo com o
    mês do último pedido. A proposta guardada é devolvida por
    `GET /api/insights/budget` durante o resto do mês.
- [x] Classificação fixa/variável:
  - `recurrence` das transações;
  - regularidade (coeficiente de variação);
  - categorias tipicamente fixas (Habitação, Contas).
- [x] `POST /api/budget/apply`, com os limites anteriores guardados para
      "Desfazer".
- [x] Cartão no cliente, com textos nas 6 línguas, valores na moeda de
      apresentação (Fase 10) e a mesma nota de privacidade da IA.
- [x] **Testes:**
  - unitários: algoritmo de repartição, fixos intactos, soma ≤ disponível,
    3 meses mínimos;
  - integração: Anthropic simulada com resposta válida, fora dos limites e
    com erro;
  - E2E: pedir a proposta, aplicar e ver os limites nos grupos.

## Implementação (2026-10-09)

Branch `feature/upgrade-04-orcamento-ia-previsoes`.

### Parte A — previsões

- `shared/forecast.ts`, partilhado pelo servidor e pelo client:
  - `PREDICTION_MIN_MONTHS` (`{ simple: 2, model: 5 }`);
  - mês em curso no fuso de Lisboa (`currentMonthKey`);
  - `splitCompleteMonths` e `forecastSeries`.
- `/api/predictions/data`:
  - `monthlySeries` só com meses completos (também exclui meses futuros);
  - o mês em curso vem em `currentMonth`;
  - `meta.minMonths`.
- Previsão simples:
  - regressão linear sobre os meses completos;
  - sem tendência (variação < 4% por mês face à média), usa a média dos
    últimos 3 meses;
  - limites: nunca negativa, e cada mês projetado não se afasta do
    anterior mais do que a maior variação mensal do histórico.
  - Interpretação de "saltos maiores do que o máximo histórico". Limitar
    ao valor máximo achatava qualquer tendência a subir.
- Página e dashboard:
  - método traduzido (`predictions.method.*`);
  - sem percentagem de confiança na previsão simples;
  - aviso "são precisos 5 meses completos (tens N)";
  - a página mostra logo quantos meses completos há e o que cada patamar
    desbloqueia;
  - no gráfico, o mês em curso aparece como pontos ocos.

### Parte B — orçamento sugerido

- **Cálculo** (`shared/budget.ts`, puro):
  - janela: os últimos 6 meses completos com movimentos;
  - receita esperada: a média dos últimos 3 meses, ou a tendência se for
    mais baixa (não conta com aumentos ainda por chegar);
  - fixa = pista pelo nome (Habitação/Contas nas 6 línguas, renda,
    seguro…), ≥ 50% recorrente, ou presente em todos os meses com
    variação < 10%;
  - limite dos fixos: o maior entre o último mês e a média;
  - variáveis: a média;
  - cortes proporcionais até ao piso (50% do mínimo histórico),
    primeiro nas discricionárias;
  - se nem assim couber, desce abaixo do piso e o estado fica `tight`;
  - se os fixos já passam o disponível: variáveis a 0 e estado
    `fixedExceedAvailable`;
  - limite de cada grupo: o gasto do grupo em cada categoria, escalado
    como o limite dessa categoria. A soma dos grupos nunca passa a das
    categorias. Alerta a 90% se o grupo for sobretudo fixo, senão 80%.
- **IA** (`server/utils/aiBudget.ts`):
  - recebe referências `c1…` com nome, tipo, média/mediana/mín/máx, piso e
    limite proposto, na moeda de apresentação;
  - devolve `{ overview, categories: [{ ref, limit, note }] }`;
  - o limite que devolver para um fixo é ignorado;
  - referência desconhecida, valor inválido, abaixo do piso ou soma acima
    do disponível → fica a proposta da app (`source: 'deterministic'`).
    Erro da Anthropic → o mesmo.
- **Endpoints**:
  - `GET`/`POST /api/insights/budget` (`requireFeature('aiBudget')`). O
    POST aceita `workingCapitalPct`/`savingsPct` de 0 a 50.
  - `POST /api/budget/apply` e `POST /api/budget/undo`.
- **Um pedido por mês**: coleção `AiBudgetProposal` com
  `_id = ${userId}:${YYYY-MM}`.
  - O pedido fica registado antes de gerar.
  - Um segundo pedido no mesmo mês → 429, com a data a partir da qual
    pode voltar a pedir.
  - Com menos de 3 meses → 400, e o pedido não conta.
  - Um pedido que ficou a meio há mais de 2 minutos não bloqueia o mês.
- **Desfazer**:
  - repõe os limites de antes da 1.ª aplicação do mês;
  - aplicar várias vezes mantém esse ponto de partida.
- **Cliente** (`/groups`):
  - `AiBudgetCard` no topo: paywall para o Pro, percentagens, resumo,
    tabelas editáveis, total contra o disponível, Aplicar/Desfazer;
  - `CategoryLimitsCard`: vista simples dos limites das categorias com o
    gasto do mês;
  - os cartões dos grupos passam a mostrar o teto mensal.
- **Plano Premium**:
  - `aiBudget: 'premium'` e destaque `planHighlights.aiBudget` nas 6
    línguas;
  - ficha da loja (`context/PLAY-STORE.md`), `00-CODE-SPEC.md` e README.
- **Privacidade**:
  - Política de Privacidade, ponto 5: o que o orçamento sugerido envia à
    IA; Termos, ponto 5: o orçamento sugerido entre os conteúdos gerados por IA;
  - os dois documentos passam a existir nas 6 línguas (FR, DE, IT e ES em
    `utils/legal/*.ts`, traduzidos da versão EN); antes, essas 4 línguas
    mostravam a versão inglesa com uma nota;
  - data atualizada para 2026-10-09;
  - a conta apagada também apaga as propostas.

## Critérios de aceitação

- [x] Previsões: nunca usam o mês atual incompleto. Explicam claramente
      quando usam a alternativa e quantos meses faltam. A alternativa
      segue a tendência.
- [x] Orçamento: só aparece com 3+ meses completos. A soma dos limites
      nunca passa a receita disponível. Os fixos não são cortados. Aplicar
      e desfazer funcionam.
- [x] Nenhuma descrição de transação é enviada à IA.
