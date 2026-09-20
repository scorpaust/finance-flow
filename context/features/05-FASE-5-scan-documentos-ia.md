# FASE 5 — Digitalização de Documentos com IA (Recibos/Faturas)

> Pré-requisito: Fases 1 a 4 concluídas (UI estruturalmente estável antes de
> desenhar mais um fluxo sobre ela). Ler `00-CODE-SPEC.md` secções 3 e 4
> (arquitetura de feature gating — esta fase segue exatamente o mesmo
> padrão `requireFeature()`/`hasFeature()` já usado nas Fases 2 e 3).
>
> Inserida nesta posição por pedido do utilizador em 2026-09-19 (antes da
> Internacionalização, que passa a Fase 6). Viabilidade técnica (modelo,
> custo, limitações) confirmada via a skill `claude-api` deste projeto
> contra a documentação atual da Anthropic antes de escrever este documento
> — não é uma suposição.

## Decisões de arquitetura tomadas (não reabrir sem motivo forte)

1. **Modelo: Claude Haiku 4.5** (`claude-haiku-4-5`), o mesmo já usado em
   `server/utils/anthropic.ts` desde a Fase 3 — mantém um único fornecedor
   de IA no projeto. Confirmado: Haiku aceita input de imagem (`type:
   "image"`) e PDF nativo (`type: "document"`, base64, sem beta, até 32 MB /
   600 páginas) na Messages API, combinável com `output_config.format`
   (structured outputs, já em uso) para forçar a resposta a um JSON com
   schema fixo. **Sem OCR separado** — o modelo lê a imagem/PDF diretamente,
   não é preciso Tesseract/`pdf-parse` nem pipeline próprio.
2. **Custo por documento é residual** face ao preço de Haiku 4.5 ($1/$5 por
   milhão de tokens input/output): uma foto de recibo tipicamente ocupa
   poucos milhares de tokens de imagem e a resposta é um JSON pequeno — o
   custo fica na ordem dos **cêntimos por cada centena de documentos
   processados**, não por documento. Confirmar o valor exato só é possível
   depois de medir com `response.usage` em sandbox real (ver tarefa 5), mas
   a ordem de grandeza já chega para não ser um fator limitante de negócio.
3. **Extração → pré-preenchimento → confirmação manual, nunca gravação
   automática** (decisão explícita do utilizador, 2026-09-19, apesar do
   pedido inicial ter sido "regista automaticamente"): a IA nunca escreve
   diretamente na coleção `Transaction`. Devolve os campos extraídos, o
   client abre o `TransactionModal` já existente pré-preenchido, e só a
   confirmação do utilizador cria a transação através do endpoint
   `POST /api/transactions` já existente — sem endpoint novo de escrita.
   Razão: erros de OCR/IA em dados financeiros (valor errado, receita
   confundida com despesa) devem ter sempre um humano a validar antes de
   entrarem nas contas do utilizador.
4. **Gating: Pro e Premium — não Gratuito** (decisão do utilizador,
   2026-09-19). Nova chave em `shared/features.ts`:
   `documentScan: 'pro'` em `FEATURE_MATRIX`.
5. **Um documento = uma transação**, sem separação automática por artigo/
   categoria (ex. um talão de supermercado com itens de categorias
   diferentes gera uma única transação com o valor total e a categoria mais
   provável do conjunto). Divisão por item fica fora de âmbito — ver secção
   própria.
6. **Sem armazenamento permanente do documento original** nesta fase: a
   imagem/PDF é processada de forma efémera (recebida, enviada à Anthropic,
   descartada) — não é guardada em disco/BD nem anexada à transação criada.
   Anexar o recibo à transação para consulta futura é uma extensão natural,
   mas exige decidir uma solução de armazenamento de ficheiros que o
   projeto ainda não tem (sem S3/blob storage configurado) — fica de fora
   para não bloquear esta fase nessa decisão à parte.
7. **Captura**: `@capacitor/camera` (nova dependência) para fotografar
   diretamente na app Android nativa; upload de ficheiro (picker/drag-drop)
   na web e como alternativa no Android. Aceita imagem (`jpg`/`png`/`heic`)
   ou PDF de uma página.
8. **Categoria sugerida restrita às categorias já existentes do
   utilizador** — passadas ao modelo como enum fechado no JSON schema
   (nomes de `Category` do próprio utilizador), nunca uma categoria
   inventada pela IA. Se nada corresponder bem, o modelo devolve `null` e o
   utilizador escolhe manualmente no formulário (mesmo comportamento que já
   existe ao criar uma transação manual sem categoria pré-selecionada).
9. **Confiança por campo**: o schema pedido ao modelo inclui um campo de
   confiança (`low`/`medium`/`high`) por valor extraído (comerciante, data,
   valor, tipo). O formulário pré-preenchido realça visualmente os campos
   `low` para o utilizador rever com mais atenção antes de confirmar.

## Objetivo

O utilizador tira uma foto (Android) ou carrega uma imagem/PDF (Android ou
web) de um recibo ou fatura. A app envia o documento à Anthropic (Haiku
4.5), que devolve comerciante, data, valor, moeda, tipo (receita/despesa) e
uma categoria sugerida (das categorias do próprio utilizador). Esses dados
abrem o formulário de transação já existente, pré-preenchido — o utilizador
revê, corrige se necessário, e confirma para gravar. Disponível só para
planos Pro e Premium.

## Tarefas

### 1. Matriz de features e enforcement

- [x] `shared/features.ts` — adicionar `documentScan` a `FeatureKey`,
      `documentScan: 'pro'` em `FEATURE_MATRIX`
- [x] `requireFeature(event, 'documentScan')` no endpoint do servidor (403
      `feature_locked` para utilizadores Free, mesmo que o client esteja
      adulterado)

### 2. Extração de dados (servidor)

- [x] `server/utils/anthropic.ts` — nova função (ex.
      `extractDocumentData()`) que envia o ficheiro (`image`/`document`
      content block, base64) + a lista de categorias do utilizador, e pede
      `output_config.format` com schema:
      `{ merchant, date, amount, currency, type: 'income'|'expense',
      suggestedCategory: string|null, confidence: { merchant, date, amount,
      type }, isReceipt: boolean }`. `isReceipt: false` cobre o caso de o
      documento não ser reconhecível como recibo/fatura — nesse caso não
      preencher o resto, devolver erro amigável ao client (ver tarefa 4)
- [x] Prompt fixo em PT-PT (consistente com o resto da app — tradução fica
      para a Fase 6, tal como as restantes secções de IA)
- [ ] Medir `response.usage` num punhado de documentos reais em sandbox
      (feito para 1 documento — ver critérios de aceitação; falta um punhado)
      para confirmar o custo real por documento (ver decisão 2)

### 3. Endpoint

- [x] `server/api/transactions/scan.post.ts` — recebe o ficheiro
      (`multipart/form-data`, limite de tamanho ex. 8 MB), valida
      tipo/tamanho, chama `extractDocumentData()`, devolve os campos
      extraídos ao client. **Não cria a transação** — ver decisão 3
- [x] Rate limiting por utilizador (ex. N documentos/mês) — reutilizar o
      padrão de `TIER_LIMITS` em `shared/features.ts` se fizer sentido dar
      limites diferentes a Pro vs. Premium, ou um limite fixo único;
      confirmar o valor concreto antes de implementar (custo residual por
      documento, mas ainda vale a pena um teto contra abuso)

### 4. Client — captura e revisão

- [x] Instalar `@capacitor/camera`; `usePlatform()` já existente para
      decidir câmara nativa (Android) vs. upload de ficheiro (web)
- [x] Novo ponto de entrada — botão "Digitalizar documento" junto ao atalho
      existente de adicionar transação (dashboard e/ou `/transactions`)
- [x] Ecrã/estado de carregamento enquanto o documento é processado
- [x] Em caso de `isReceipt: false` ou erro, mensagem clara (ex. "Não
      conseguimos ler este documento como recibo/fatura — tenta outra foto
      ou preenche manualmente"), nunca abrir o formulário com dados
      inventados
- [x] Em caso de sucesso, abrir `TransactionModal` pré-preenchido com os
      campos extraídos; campos com `confidence: 'low'` realçados
      visualmente (ex. borda âmbar + ícone) para o utilizador rever com
      mais atenção
- [x] `PaywallModal` para utilizadores Free que tentem aceder ao botão

## Fora de âmbito nesta fase

- Dividir um documento com vários itens em várias transações por categoria
  — fica sempre uma única transação com o valor total
- Armazenar/anexar o documento original à transação para consulta
  posterior (precisa de decidir uma solução de armazenamento de ficheiros
  que o projeto não tem ainda)
- Suporte iOS — app é Android + Web (ver `README.md`); não se aplica
- Documentos multi-página complexos (faturas com várias páginas/totais) —
  assume-se um documento simples de uma página/imagem
- Tradução do prompt/respostas para outro idioma — prompt fixo em PT-PT
  nesta fase, tal como as restantes secções de IA (Fase 6 trata i18n)
- Limite de páginas de PDF — **decidido deixar como está (2026-09-20)**: o
  servidor aceita PDFs até 8 MB sem contar páginas, e um PDF longo pode custar
  até ~$0,20 por scan (Haiku 4.5 tem 200K de contexto), contra ~$0,004 de uma
  foto. No teto de 100 documentos/mês do Premium isso seria ~$20 no pior caso,
  acima do preço do plano. Opção se vier a ser preciso: cortar o PDF no
  servidor (ex. `pdf-lib`) para a 1.ª e a última página antes de enviar —
  mantém a aceitação de documentos grandes e limita o custo; a API não tem
  parâmetro de intervalo de páginas. Ao omitir páginas, marcar o valor como
  baixa confiança e avisar o utilizador
- Documentos estrangeiros e recibos de vencimento: esta fase assume Portugal
  e euros. Um documento noutra moeda é lido mas **não convertido** (montante
  marcado para rever + aviso); datas assumem dia/mês/ano; recibos de
  vencimento não têm prompt próprio (o prompt pede o total a pagar, não o
  líquido). O tratamento fica definido na Fase 6, secção 6 — incluindo a
  questão de privacidade de enviar dados pessoais (NIF, salário) à Anthropic

## Critérios de aceitação

- [x] Utilizador Free não consegue usar a funcionalidade — nem no client
      (paywall) nem no servidor (`403 feature_locked` mesmo chamando o
      endpoint diretamente)
- [ ] Utilizador Pro/Premium consegue fotografar (Android) ou carregar
      (Android/web) um recibo/fatura real e ver o formulário de transação
      abrir pré-preenchido com comerciante, data, valor, moeda, tipo e
      categoria sugerida corretos (validado com uma amostra real de
      recibos/faturas portugueses variados — papel térmico, fatura
      eletrónica em PDF, etc.)
      → 2026-09-20: o utilizador validou o formulário pré-preenchido em
      recibos reais (o contador mensal regista 2 documentos processados);
      **amostra ainda curta** — falta variedade (papel térmico, PDF,
      fatura eletrónica). Por marcar até haver mais documentos.
- [x] Nenhuma transação é criada sem confirmação explícita do utilizador
      → confirmado em 2026-09-20: após validar o formulário sem guardar, a
      conta tinha 0 transações criadas.
- [ ] Um documento que não é um recibo/fatura reconhecível (ex. uma foto
      qualquer) produz um erro claro, não um formulário com dados
      inventados
- [ ] Campos extraídos com baixa confiança ficam visualmente identificados
      no formulário
- [x] Custo medido por documento confirma a ordem de grandeza esperada
      (residual, ver decisão 2) — sem surpresas de custo em produção
      → medido em 2026-09-20 no log do servidor: JPEG de 369 KB = 3311
      tokens de entrada + 85 de saída ≈ **$0,0037 por documento** (~0,35 €
      por 100 documentos, o teto mensal do Premium). Amostra de 1 documento
      — repetir com PDF e imagens maiores para confirmar a margem.
