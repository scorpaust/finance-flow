# FASE 6 — Segurança, Qualidade e Preparação para Produção

> Pré-requisito: Fases 1 a 5 concluídas. Esta fase não adiciona
> funcionalidades novas — endurece o que já existe antes da Fase 7
> (publicação).

## Objetivo

Deixar a aplicação pronta para expor a utilizadores reais, com pagamentos
reais, em web e Android.

## Tarefas

### 1. Validação e segurança de input
- [ ] Introduzir validação de schema (Zod) em todos os endpoints
      `server/api/**` que recebem body/query (auth, transactions,
      categories, groups, subscription, insights/investimento da Fase 3)
- [ ] Sanitização de IDs (reforçar `sanitizeId` existente e aplicar de forma
      consistente)
- [ ] Rate limiting em endpoints sensíveis: login, registo, criação de
      checkout session, webhooks, geração de insights por IA (Fase 3 — custo
      direto por chamada à API da Anthropic)

### 2. Sessão e cookies em produção
- [ ] Cookies de sessão com `secure: true`, `sameSite` apropriado, expiração
      definida
- [ ] Rever CORS para o domínio de produção (bloquear origens não
      autorizadas)
- [ ] Segredos (Mongo URI, PayPal keys, Anthropic API key, Twelve Data API
      key, session secret) apenas via variáveis de ambiente — nunca no
      repositório

### 3. Webhooks
- [ ] Verificação de assinatura obrigatória em todos os webhooks (PayPal) —
      rejeitar pedidos não assinados
- [ ] Idempotência: eventos repetidos não devem duplicar efeitos no estado
      da subscrição

### 4. Testes automatizados
- [ ] Unit tests (Vitest) para: `useSubscription`, `useFormatters`,
      `hasFeature`/matriz de features, lógica de previsão (partes não-TF)
- [ ] Testes de integração para endpoints críticos: auth, transactions CRUD,
      subscription checkout/webhook (com mocks da PayPal), insights/IA
      (com mocks da Anthropic e da Twelve Data — nunca chamadas reais nos
      testes, custam dinheiro)
- [ ] E2E (Playwright) do fluxo principal: registo → login → criar
      transação → ver dashboard → tentar aceder a previsões sem Premium
      (deve mostrar paywall) → upgrade sandbox → aceder a previsões
- [ ] E2E cobrindo a Fase 5 (internacionalização): app abre em EN para um IP
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

## Critérios de aceitação
- [ ] Suite de testes (unit + integração + e2e principal) corre em CI e
      passa
- [ ] Nenhum segredo no repositório; `.env.example` atualizado e completo
- [ ] Webhooks validam assinatura e são idempotentes (testado com reenvio de
      evento)
- [ ] Lighthouse web ≥ 90 em Performance e Acessibilidade (ou justificação
      documentada dos itens não atingidos)
- [ ] Política de privacidade e termos de serviço publicados e linkados na
      app
