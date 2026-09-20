# FASE 6 — Internacionalização (Idiomas + Métodos de Pagamento por País)

> Pré-requisito: Fases 1 a 5 concluídas. Deliberadamente depois do Design
> System (Fase 4) e da Digitalização de Documentos (Fase 5) — traduzir só
> depois de todo o UI estar estruturalmente estável evita retrabalho
> (extrair strings de um template que ainda vai ser reescrito é
> desperdício). Ler `00-CODE-SPEC.md` secções 3 e 4.
>
> **Atualização de 2026-09-19**: renumerada de "Fase 5" para "Fase 6" para
> abrir espaço à nova Fase 5 (Digitalização de Documentos com IA, ver
> `context/features/05-FASE-5-scan-documentos-ia.md`), inserida antes desta
> por pedido do utilizador. Segurança/Qualidade e Publicação também
> renumeradas em conformidade (agora Fase 7 e Fase 8).

## Decisões de arquitetura tomadas (não reabrir sem motivo forte)

1. **Dois sinais independentes, nunca confundidos:**
   - **Idioma da UI** ← preferência de idioma do dispositivo/browser
     (`Accept-Language`), com override manual persistente nas
     Configurações. Localização física é irrelevante para esta decisão —
     um português a viajar continua a querer PT-PT.
   - **Métodos de pagamento disponíveis** ← país detetado por
     geolocalização de IP. Esta é uma questão de que rails bancários
     existem nesse país, não de preferência do utilizador.
2. **Idiomas no lançamento**: PT-PT, EN, FR, DE, IT, ES. **EN é o fallback
   universal** para qualquer idioma de browser não suportado (nunca mostrar
   texto por traduzir). Arquitetura aberta a acrescentar mais línguas depois
   (ficheiro de traduções novo, sem tocar em código) — mas o trabalho de
   tradução em si não escala automaticamente, por isso o lançamento fica
   fechado a estas 6.
3. **Biblioteca**: `@nuxtjs/i18n` (módulo standard do ecossistema Nuxt).
4. **Geolocalização**: MaxMind GeoLite2 (base de dados local, sem chamadas
   externas por pedido, sem limites de taxa) — mais robusto do que depender
   de estar por trás de um proxy específico (ex. Cloudflare), já que o
   hosting de produção final ainda não está decidido.
5. **Métodos de pagamento por país — âmbito deliberadamente limitado**:
   construir a arquitetura como tabela `país → métodos disponíveis`, mas só
   **implementar a fundo Portugal** (MB WAY/Multibanco, já existente desde a
   Fase 2). Todos os outros países caem no fallback universal (cartão com
   auto-renovação via EasyPay, `billingMode: 'auto'`, já existente desde a
   Fase 2). Confirmar a cobertura da EasyPay fora de Portugal (cartões
   emitidos noutros países; o Débito Direto SEPA só faz sentido em países
   SEPA) antes de a prometer. Adicionar Bancontact (Bélgica), iDEAL
   (Holanda), etc. fica fora desta fase — cada país é o mesmo esforço que
   MB WAY/Multibanco foram na Fase 2, não vale a pena fazer todos de vez.

## Objetivo

A app abre automaticamente no idioma certo (por preferência de browser, com
fallback EN) e, no checkout de subscrição, só mostra métodos de pagamento
pré-pagos que realmente existem no país detetado do utilizador — hoje, isso
significa MB WAY/Multibanco continuam exclusivos de Portugal, e o resto do
mundo vê só as opções de auto-renovação (cartão; Débito Direto onde aplicável).

## Tarefas

### 1. Infraestrutura de i18n

- [ ] Instalar e configurar `@nuxtjs/i18n`
- [ ] Estrutura de ficheiros de tradução por idioma (`i18n/locales/pt-PT.json`,
      `en.json`, `fr.json`, `de.json`, `it.json`, `es.json`) — chaves
      organizadas por página/secção, não uma lista plana
- [ ] Estratégia de deteção: `Accept-Language` do browser no primeiro
      acesso → guardar escolha (cookie/preferência do `User`) → nunca voltar
      a detetar automaticamente depois de o utilizador escolher manualmente
- [ ] Seletor de idioma nas Configurações (`pages/settings/index.vue`)

### 2. Extração de strings (o trabalho mecanicamente maior)

- [ ] Auditoria de todas as strings PT-PT hardcoded em `pages/`,
      `components/`, mensagens de erro do servidor (`createError({message})`)
      e emails/notificações (se existirem a essa altura)
- [ ] Prioridade de extração: 1) autenticação/dashboard, 2) transações/
      categorias/grupos, 3) subscrição/checkout/paywall, 4) previsões/
      insights de IA (Fase 3), 5) resto
- [ ] Datas, moeda e números formatados com `Intl`/`date-fns` já
      localizados por idioma ativo (`useFormatters` já existe — adaptar
      para receber o locale em vez de assumir PT-PT fixo)
- [ ] Tradução das 6 línguas — rever qualidade (não confiar só em tradução
      automática para o texto final, especialmente termos financeiros)

### 3. Geolocalização por IP (server-side)

- [ ] Integrar MaxMind GeoLite2 (`server/utils/geo.ts`) — lookup do IP do
      pedido (`x-forwarded-for`/IP direto), devolve código de país (`PT`,
      `FR`, etc.)
- [ ] Documentar processo de atualização periódica da base de dados
      GeoLite2 (licenciada, requer registo gratuito na MaxMind, atualiza-se
      mensalmente)

### 4. Métodos de pagamento por país

- [ ] `shared/paymentMethods.ts` — tabela `país → métodos pré-pagos
      disponíveis` (hoje: só `PT: ['mbway', 'multibanco']`; qualquer outro
      país → `[]`, cai no fallback recorrente)
- [ ] `server/api/subscription/easypay/create-prepaid.post.ts` — validar que o
      `paymentMethod` pedido está mesmo disponível para o país detetado do
      utilizador (nunca confiar só na UI a esconder as opções)
- [ ] `pages/subscription/index.vue` — só mostrar o separador "Pagar um
      período (MB WAY/Multibanco)" quando o país detetado tiver métodos
      disponíveis; caso contrário, mostrar só "Renovação automática"

### 5. Android

- [ ] Confirmar que o idioma detetado/escolhido no `WebView` do Capacitor
      coincide com o da app web (mesma conta, mesmo idioma nas duas
      plataformas)

### 6. Digitalização de documentos (Fase 5) em contexto internacional

> Levantado em 2026-09-20 ao concluir a Fase 5 (ver
> `05-FASE-5-scan-documentos-ia.md`, "Fora de âmbito"). O modelo já lê
> documentos noutros idiomas, mas a Fase 5 assume Portugal e euros; ler
> recibos/faturas estrangeiros e recibos de vencimento exige as decisões e
> ajustes abaixo. **Confirmar cada decisão com o utilizador antes de
> implementar.**

- [ ] **Moeda** — hoje a app é só em € e a Fase 5 devolve o valor de um
      documento noutra moeda *sem converter* (formulário com o montante
      marcado para rever + aviso, moeda original nas notas). A tarefa 2 desta
      fase só localiza o *formato* de moeda na interface; não trata de
      guardar/converter valores estrangeiros. Decidir entre:
      - **A) Converter para €** à taxa do dia do documento, mantendo o
        ledger só em € (estatísticas e previsões ficam intactas). Precisa de
        uma fonte de câmbios — a Twelve Data (Fase 3) pode servir, mas **não
        está confirmado** que o plano gratuito cobre pares de moedas.
      - **B) Guardar a moeda em cada transação** — mais fiel, mas mexe no
        modelo `Transaction`, nas estatísticas e nas previsões.
      Lean inicial: A, por ser bastante mais simples; a confirmar.
- [ ] **Formato das datas** — o prompt da Fase 5
      (`DOCUMENT_SYSTEM_PROMPT` em `server/utils/anthropic.ts`) diz que as
      datas portuguesas são dia/mês/ano; um recibo americano `03/04` seria
      lido ao contrário. Passar ao modelo o país/idioma do utilizador e/ou do
      documento e, quando a data for ambígua (dia e mês ≤ 12) sem indicação
      clara, devolver `confidence.date: 'low'` — reaproveita o realce âmbar
      que já existe no `TransactionModal`.
- [ ] **Idioma do prompt** — o prompt de extração está fixo em PT-PT (como as
      restantes secções de IA); passa a seguir o idioma ativo, tal como o
      resto do conteúdo gerado por IA.
- [ ] **Recibos de vencimento** — não estão desenhados na Fase 5: o prompt
      pede o "total a pagar com IVA", e num recibo de vencimento o valor
      relevante é o **líquido** (não o bruto). Decidir se entram em âmbito;
      se sim, prompt/schema próprios (bruto, líquido, descontos) e teste
      com recibos reais de vários países antes de os prometer.
- [ ] **Privacidade** — um recibo de vencimento envia NIF, morada e salário
      à Anthropic. Decidir se pede aviso/consentimento explícito antes do
      envio (RGPD) e se a política de privacidade da app (Fase 8) o deve
      mencionar. Vale também para faturas com dados pessoais.

## Fora de âmbito nesta fase

- Adicionar métodos de pagamento locais para outros países além de Portugal
  (Bancontact, iDEAL, etc.) — trabalho futuro incremental, país a país
- Tradução de conteúdo gerado por IA (Fase 3) para outro idioma além do
  ativo no momento do pedido — o prompt já deve pedir a resposta no idioma
  ativo do utilizador, sem tradução adicional depois
- Mais do que as 6 línguas confirmadas

## Critérios de aceitação

- [ ] App abre automaticamente no idioma do browser quando é um dos 6
      suportados, e em EN quando não é
- [ ] Escolha manual de idioma nas Configurações persiste e nunca é
      substituída por deteção automática depois de escolhida
- [ ] Nenhuma string visível fica por traduzir em nenhuma das 6 línguas
      (auditoria completa, não amostragem)
- [ ] Checkout de subscrição só mostra MB WAY/Multibanco para utilizadores
      com país detetado = Portugal; todos os outros só veem a opção
      recorrente
- [ ] `POST /api/subscription/easypay/create-prepaid` rejeita (403/400) um
      pedido de `paymentMethod` não disponível no país do utilizador, mesmo
      que a UI tenha sido adulterada
- [ ] Datas/moeda mostradas corretamente formatadas para cada um dos 6
      idiomas
- [ ] Um recibo/fatura numa moeda diferente de € é tratado segundo a decisão
      confirmada (convertido ou guardado com a moeda) — nunca gravado como €
      sem aviso
- [ ] Um recibo com data ambígua (ex. `03/04`) não é gravado com o mês
      trocado em silêncio: fica com a data realçada como baixa confiança
