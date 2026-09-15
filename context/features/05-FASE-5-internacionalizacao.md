# FASE 5 — Internacionalização (Idiomas + Métodos de Pagamento por País)

> Pré-requisito: Fases 1 a 4 concluídas. Deliberadamente depois do Design
> System (Fase 4) — traduzir só depois de todo o UI estar estruturalmente
> estável evita retrabalho (extrair strings de um template que a Fase 4
> ainda vai reescrever é desperdício). Ler `00-CODE-SPEC.md` secções 3 e 4.

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
   Fase 2). Todos os outros países caem no fallback universal (cartão/saldo
   PayPal via Subscriptions API, que já funciona em qualquer lado — nenhuma
   alteração necessária aí). Adicionar Bancontact (Bélgica), iDEAL
   (Holanda), etc. fica fora desta fase — cada país é o mesmo esforço que
   MB WAY/Multibanco foram na Fase 2, não vale a pena fazer todos de vez.

## Objetivo

A app abre automaticamente no idioma certo (por preferência de browser, com
fallback EN) e, no checkout de subscrição, só mostra métodos de pagamento
pré-pagos que realmente existem no país detetado do utilizador — hoje, isso
significa MB WAY/Multibanco continuam exclusivos de Portugal, e o resto do
mundo vê só a opção de auto-renovação por cartão/PayPal.

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
- [ ] `server/api/subscription/paypal/create-order.post.ts` — validar que o
      `paymentMethod` pedido está mesmo disponível para o país detetado do
      utilizador (nunca confiar só na UI a esconder as opções)
- [ ] `pages/subscription/index.vue` — só mostrar o separador "Pagar um
      período (MB WAY/Multibanco)" quando o país detetado tiver métodos
      disponíveis; caso contrário, mostrar só "Renovação automática"

### 5. Android

- [ ] Confirmar que o idioma detetado/escolhido no `WebView` do Capacitor
      coincide com o da app web (mesma conta, mesmo idioma nas duas
      plataformas)

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
- [ ] `POST /api/subscription/paypal/create-order` rejeita (403/400) um
      pedido de `paymentMethod` não disponível no país do utilizador, mesmo
      que a UI tenha sido adulterada
- [ ] Datas/moeda mostradas corretamente formatadas para cada um dos 6
      idiomas
