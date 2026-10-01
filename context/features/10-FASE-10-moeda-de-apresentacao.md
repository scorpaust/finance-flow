# FASE 10 — Moeda de apresentação

> Pedido do utilizador (2026-10-01): "em Configurações, o utilizador poder
> escolher a moeda em uso na app, dentre todas as existentes; sempre que
> alterar a moeda, uma chamada à API com o câmbio atual altera os valores em
> toda a app para essa moeda". Implementada **antes** dos testes fechados da
> Play Store (Fase 9 em pausa até lá).

## Objetivo

Cada utilizador escolhe a moeda em que vê **todos** os valores da app
(painel, transações, gráficos, orçamentos, estatísticas, previsões,
investimentos, interpretação por IA), convertidos ao câmbio do dia. Os dados
continuam guardados em euros.

## Decisões (utilizador, 2026-10-01)

1. **Euro como moeda base; a moeda escolhida é só de apresentação.** Nenhum
   valor guardado é reescrito quando a moeda muda — converter os dados a cada
   troca perdia precisão (EUR→USD→JPY→EUR não volta ao valor original) e
   mexia no histórico. Voltar ao euro mostra exatamente os valores de antes.
2. **Câmbio do dia** para tudo, incluindo transações passadas (não o câmbio
   histórico de cada transação): uma taxa por moeda por dia, em cache. Os
   totais passados numa moeda que não o euro variam ligeiramente de dia para
   dia — aceite pelo utilizador.
3. **Preços das subscrições continuam em euros** (a EasyPay cobra em euros),
   com o valor aproximado na moeda escolhida: "5,00 € (≈ 5,62 $)".
4. **Fornecedor: Twelve Data** (a mesma chave da Fase 3/7). Verificado a
   2026-10-01 com a chave do projeto: o plano gratuito cobre câmbio —
   **121 moedas** a partir do euro, incluindo BRL, AOA, CVE, MZN, CHF, GBP,
   USD, JPY. A lista de moedas na app é a que o fornecedor suporta (mais o
   euro), não as ~180 da norma ISO 4217.

## Tarefas

### 1. Servidor
- [ ] Preferência `displayCurrency` no utilizador (por omissão `EUR`),
      sincronizada entre web e Android (vive na conta, não no browser);
      `GET`/`PUT` com validação (só moedas suportadas)
- [ ] Câmbio EUR→X do dia em cache no MongoDB (um pedido à Twelve Data por
      moeda por dia, partilhado por todos os utilizadores); falha do
      fornecedor → última taxa conhecida, ou euro se nunca houve nenhuma,
      nunca um erro que parta a app
- [ ] Lista de moedas suportadas em cache (24 h)
- [ ] Interpretação de estatísticas por IA na moeda escolhida (agregados
      convertidos antes de irem ao modelo; cache por moeda)

### 2. Cliente
- [ ] Seletor de moeda em Configurações (lista com pesquisa, nome da moeda
      no idioma da UI via `Intl.DisplayNames`)
- [ ] `useFormatters`: um valor em euros sem moeda explícita é convertido e
      formatado na moeda escolhida; com moeda explícita (o original de um
      recibo estrangeiro, Fase 7) mostra-se tal como está
- [ ] Gráficos (eixos e tooltips) na moeda escolhida
- [ ] Campos de valor (transação, orçamentos de grupos/categorias,
      investimentos): o utilizador escreve na moeda escolhida; a transação
      grava a moeda escolhida como moeda original (conversão exata para euros
      no servidor, como os recibos estrangeiros); limites e investimentos são
      convertidos para euros ao gravar e de volta ao editar
- [ ] Rótulos com "(€)" fixo passam a mostrar a moeda escolhida (6 línguas)
- [ ] Página de subscrição: "5,00 € (≈ X)" quando a moeda não é o euro
- [ ] Indicação discreta da taxa usada ("1 € = 1,12 $ · hoje")

### 3. Fora de âmbito
- Exportação CSV continua em euros (a coluna já diz que o valor é em €) e
  com a moeda/valor originais das transações estrangeiras
- Câmbio histórico por transação (decisão 2)
- Cobrança das subscrições noutra moeda que não o euro

## Critérios de aceitação
- [ ] Mudar a moeda em Configurações altera todos os valores da app sem
      recarregar dados, e a escolha mantém-se no Android e na web para a
      mesma conta
- [ ] Voltar ao euro mostra exatamente os mesmos valores de antes
- [ ] Uma transação criada em dólares fica guardada em euros com o valor e a
      moeda originais, e aparece em dólares
- [ ] Sem câmbio disponível (fornecedor em baixo), a app continua a funcionar
      e diz que valores estão em euros
- [ ] Testes: unitários (conversão/formatação), integração (preferência,
      câmbio em cache, fornecedor em falha), E2E (mudar a moeda e ver o
      painel em dólares)
