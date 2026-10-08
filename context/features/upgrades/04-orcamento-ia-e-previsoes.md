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

- [ ] O servidor (`/api/predictions/data`) indica qual é o mês atual
      incompleto. A previsão treina e calcula médias só com **meses
      completos**. O mês atual aparece no gráfico como "em curso",
      separado.
- [ ] Sem meses suficientes para o modelo:
  - texto claro e traduzido: "Previsão simples: são precisos 5 meses
    completos para o modelo de IA (tens N)";
  - nome do método em linguagem simples ("Média dos últimos meses"), e não
    o nome interno;
  - sem percentagem de confiança inventada.
- [ ] Alternativa com tendência: regressão linear sobre os meses completos,
      limitada (não projeta valores negativos nem saltos maiores do que o
      máximo histórico). A média só se usa quando não há tendência.
- [ ] **Um só mínimo, dito da mesma forma em todo o lado.** Hoje há três
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
- [ ] Testes unitários das funções puras: meses completos, tendência, limites.

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

- [ ] `POST /api/insights/budget` (`requireFeature('aiBudget')`):
  - agregados, cálculo determinístico, IA e validação;
  - **um pedido por conta por mês civil**: nova coleção, ou um campo com o
    mês do último pedido. A proposta guardada é devolvida por
    `GET /api/insights/budget` durante o resto do mês.
- [ ] Classificação fixa/variável:
  - `recurrence` das transações;
  - regularidade (coeficiente de variação);
  - categorias tipicamente fixas (Habitação, Contas).
- [ ] `POST /api/budget/apply`, com os limites anteriores guardados para
      "Desfazer".
- [ ] Cartão no cliente, com textos nas 6 línguas, valores na moeda de
      apresentação (Fase 10) e a mesma nota de privacidade da IA.
- [ ] **Testes:**
  - unitários: algoritmo de repartição, fixos intactos, soma ≤ disponível,
    3 meses mínimos;
  - integração: Anthropic simulada com resposta válida, fora dos limites e
    com erro;
  - E2E: pedir a proposta, aplicar e ver os limites nos grupos.

## Critérios de aceitação

- [ ] Previsões: nunca usam o mês atual incompleto. Explicam claramente
      quando usam a alternativa e quantos meses faltam. A alternativa
      segue a tendência.
- [ ] Orçamento: só aparece com 3+ meses completos. A soma dos limites
      nunca passa a receita disponível. Os fixos não são cortados. Aplicar
      e desfazer funcionam.
- [ ] Nenhuma descrição de transação é enviada à IA.
