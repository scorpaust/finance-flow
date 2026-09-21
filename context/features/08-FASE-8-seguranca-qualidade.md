# FASE 8 — Segurança, Qualidade e Preparação para Produção

> Pré-requisito: Fases 1 a 7 concluídas. Esta fase não adiciona
> funcionalidades novas — endurece o que já existe antes da Fase 9
> (publicação).
>
> **Atualização de 2026-09-19**: renumerada de "Fase 6" para "Fase 7" —
> inserida a nova Fase 5 (Digitalização de Documentos com IA) antes da
> Internacionalização.
>
> **Atualização de 2026-09-21**: renumerada de "Fase 7" para "Fase 8" —
> inserida a nova Fase 6 (Registo de Investimentos) antes da
> Internacionalização (agora Fase 7).

## Objetivo

Deixar a aplicação pronta para expor a utilizadores reais, com pagamentos
reais, em web e Android.

## Tarefas

### 1. Validação e segurança de input
- [ ] Introduzir validação de schema (Zod) em todos os endpoints
      `server/api/**` que recebem body/query (auth, transactions,
      categories, groups, subscription, insights/investimento da Fase 3, e
      investments da Fase 6 — a validação manual de
      `server/utils/investments.ts` migra para Zod)
- [ ] Não expor ao client o detalhe de erros da Anthropic: o
      `generateStructuredJson` (`server/utils/anthropic.ts`) faz `throw
      createError` com o corpo da resposta ("Erro Anthropic (400): ... credit
      balance is too low") e este chega ao client em `insights/stats` e
      `insights/investment`; só `transactions/scan.post.ts` o esconde
      (`upstream_error`). Uniformizar: registar no log, devolver mensagem genérica
- [ ] Sanitização de IDs (reforçar `sanitizeId` existente e aplicar de forma
      consistente)
- [ ] Rate limiting em endpoints sensíveis: login, registo, criação de
      checkout session, webhooks, geração de insights por IA (Fase 3 — custo
      direto por chamada à API da Anthropic)

### 2. Sessão e cookies em produção
- [ ] **Assinar a sessão e remover a autenticação por header (crítico)**:
      `requireAuth` (`server/utils/auth.ts`) aceita o cookie `userId` **ou o
      header `x-user-id`**, ambos com o `_id` do utilizador em claro e sem
      assinatura — quem conhecer ou adivinhar um `_id` age como esse utilizador.
      Trocar por uma sessão assinada ou opaca (token aleatório guardado no
      servidor, ou cookie assinado com um segredo), remover o header e confirmar
      que nenhum endpoint ou script depende dele (foi usado nos testes manuais de
      várias fases)
- [ ] Cookies de sessão com `secure: true`, `sameSite` apropriado, expiração
      definida
- [ ] Rever CORS para o domínio de produção (bloquear origens não
      autorizadas)
- [ ] Segredos (Mongo URI, EasyPay AccountId/ApiKey, Anthropic API key,
      Twelve Data API key, session secret) apenas via variáveis de ambiente
      — nunca no repositório

### 3. Webhooks
- [ ] A EasyPay não assina os webhooks (confirmado na Fase 2, ver
      `server/utils/easypay.ts`) — confirmar que **todos** os handlers
      continuam a verificar a autenticidade consultando a API de volta pelo
      `id` do recurso antes de processar qualquer evento, nunca confiando no
      corpo recebido diretamente; considerar também IP allowlist se a
      EasyPay vier a documentar um intervalo fixo
- [ ] Idempotência: eventos repetidos não devem duplicar efeitos no estado
      da subscrição

### 4. Testes automatizados
- [ ] Unit tests (Vitest) para: `useSubscription`, `useFormatters`,
      `hasFeature`/matriz de features, lógica de previsão (partes não-TF), e
      `shared/portfolio.ts` (Fase 6 — é puro de propósito, primeiro candidato:
      exemplos da folha 1,94% / −2,00% / total 1,76%, e `returnPct` nulo sem
      capital investido)
- [ ] Testes de integração para endpoints críticos: auth, transactions CRUD,
      subscription checkout/webhook (com mocks da EasyPay), insights/IA
      (com mocks da Anthropic e da Twelve Data — nunca chamadas reais nos
      testes, custam dinheiro), `/api/investments` (Fase 6: 403 a Free, 404 para
      o `_id` de outro utilizador, teto de 100 posições, validação, e a regra de
      `valueUpdatedAt` só mudar quando a Situação muda), a cache das dicas de
      investimento (`inputHash` + 24 h, com mock da Anthropic) e o
      `server/middleware/00-db.ts` (um pedido a frio não pode dar 500)
- [ ] E2E (Playwright) do fluxo principal: registo → login → criar
      transação → ver dashboard → tentar aceder a previsões sem Premium
      (deve mostrar paywall) → upgrade sandbox → aceder a previsões
- [ ] E2E cobrindo a Fase 7 (internacionalização): app abre em EN para um IP
      simulado fora dos 6 países suportados (fallback), muda de idioma
      manualmente nas Configurações, e o checkout de subscrição só mostra
      MB WAY/Multibanco para Portugal

### 5. Performance
- [ ] Lighthouse (web) e auditoria equivalente em Android: performance,
      acessibilidade, PWA
- [ ] Carregar TensorFlow.js apenas na página de previsões (lazy/dynamic
      import), não no bundle inicial
- [ ] Rever tamanho de bundle e code-splitting por rota
- [ ] Testar app em dispositivo Android de gama baixa (ou emulador com
      recursos limitados) para validar fluidez das animações da Fase 4 e do
      modelo de ML

### 6. Observabilidade
- [ ] Integrar monitorização de erros (ex. Sentry) em client e server
- [ ] Logging estruturado de eventos críticos: falhas de pagamento,
      falhas de webhook, erros de autenticação

### 7. Conformidade legal
- [ ] Política de privacidade e termos de serviço (obrigatórios para Play
      Store e para cobrança de subscrições)
- [ ] Checklist RGPD: base legal para dados pessoais, exportação de dados do
      utilizador, eliminação de conta e dados associados
- [ ] Rever se dados financeiros sensíveis exigem medidas adicionais
      (encriptação em repouso, se aplicável ao plano de hosting)

### 8. Estratégia de dados
- [ ] Backups regulares do MongoDB de produção documentados
- [ ] Plano de rollback para migrações de schema (ex. campo `subscription`)
- [ ] **Índices do Mongoose que nunca são criados**: com `bufferCommands: false`
      a criação automática de índices não funciona (`server/utils/db.ts`), por
      isso os índices `unique` declarados (`MarketSnapshot.date`,
      `AiInsightCache.userId`) e o índice de desempenho de `Investment` não
      existem na base de dados. Criá-los com `Model.syncIndexes()` ou um script
      de migração, depois de limpar duplicados. Até lá o código usa `_id`
      determinísticos onde precisa de unicidade (`DocumentScanUsage`,
      `InvestmentTipsCache`)

### 9. Dívida técnica conhecida (de fases anteriores)
- [ ] Aviso de hidratação num `<span>` de texto ("Hydration text content
      mismatch") visto no log da app Android, que não aparece no browser de
      desktop — origem por identificar (suspeita: texto dependente da hora ou do
      fuso, como a data do topo). Inofensivo; o do `ToastContainer` já foi
      corrigido na Fase 6

## Critérios de aceitação
- [ ] Suite de testes (unit + integração + e2e principal) corre em CI e
      passa
- [ ] Nenhum segredo no repositório; `.env.example` atualizado e completo
- [ ] A sessão é assinada e o header `x-user-id` já não autentica nada (testado
      com um `_id` válido de outro utilizador)
- [ ] Nenhum endpoint devolve ao client o corpo de um erro de um fornecedor
      externo (Anthropic, EasyPay, Twelve Data)
- [ ] Webhooks validam assinatura e são idempotentes (testado com reenvio de
      evento)
- [ ] Lighthouse web ≥ 90 em Performance e Acessibilidade (ou justificação
      documentada dos itens não atingidos)
- [ ] Política de privacidade e termos de serviço publicados e linkados na
      app
