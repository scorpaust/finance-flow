# FASE 9 — Publicação (Google Play + Deploy Web de Produção)

> Pré-requisito: Fases 1 a 8 concluídas e todos os critérios de aceitação
> cumpridos. Esta é a fase final antes de utilizadores reais.
>
> **Atualização de 2026-09-19**: renumerada de "Fase 5" para "Fase 8" —
> Digitalização de Documentos com IA (Fase 5), Internacionalização e
> Segurança/Qualidade passam a vir antes desta.
>
> **Atualização de 2026-09-21**: renumerada de "Fase 8" para "Fase 9" —
> inserida a nova Fase 6 (Registo de Investimentos) antes da
> Internacionalização (agora Fase 7) e da Segurança/Qualidade (agora Fase 8).

## Objetivo

App publicada (pelo menos em faixa de teste interno) na Google Play Store, e
versão web acessível em produção com HTTPS, ambas ligadas a billing real (ou
sandbox validado, consoante o momento de lançamento decidido pelo dono do
produto).

## Tarefas

### 1. Assinatura e build Android
- [ ] **Reverter `android:usesCleartextTraffic` para `"false"`** em
      `android/app/src/main/AndroidManifest.xml` — está `"true"` desde a Fase 3,
      ligado só para testar a app por USB contra o dev server local (decisão do
      utilizador de deixar para esta fase). Confirmar também que o build de
      release **não** usa `CAPACITOR_SERVER_URL` (que liga `cleartext` e
      `allowMixedContent` em `capacitor.config.ts`) e que aponta para o URL
      HTTPS de produção
- [ ] Gerar keystore de produção e guardar em local seguro (nunca no
      repositório) — documentar processo de backup da chave (perda da chave
      impede atualizações futuras da app)
- [ ] Gerar Android App Bundle (`.aab`) assinado via Capacitor/Gradle
- [ ] Confirmar `versionCode`/`versionName` e política de incremento para
      futuras atualizações

### 2. Ficha da Google Play Console
- [ ] Título, descrição curta/longa, categoria (Finanças)
- [ ] Screenshots em pelo menos telemóvel e tablet, ícone de alta resolução,
      banner de destaque
- [ ] Classificação de conteúdo (questionário da Play Console)
- [ ] Política de privacidade (link obrigatório, produzido na Fase 8)

### 3. Programa de pagamentos externos (Google Play / EEA)
- [ ] Confirmar aprovação do pedido de inscrição no programa de pagamentos
      externos submetido na Fase 2 — sem esta aprovação a app não pode ser
      publicada a usar EasyPay (Cartão/DD/MB WAY/Multibanco) em vez de
      Google Play Billing
- [ ] Rever se os requisitos do programa continuam cumpridos (disclosure ao
      utilizador, reporte de transações via `ExternalTransactionId`,
      processo de disputa de pagamentos, suporte ao cliente)
- [ ] Confirmar taxas atualizadas da Google para pagamentos externos na
      Play Console antes do lançamento (sujeitas a alteração)

### 4. Faixas de lançamento
- [ ] Publicar primeiro em faixa de **testes internos** (equipa/licensed
      testers)
- [ ] Validar fluxo completo em dispositivo real: instalação, login,
      subscrição real ou sandbox, uso das funcionalidades por tier
- [ ] Só depois promover para faixa de produção (rollout percentual
      recomendado, ex. 20% → 100%)

### 5. Deploy web de produção
- [ ] Escolher plataforma de hosting compatível com Nuxt SSR + Node
      (documentar a escolha em `CONFIG-REFERENCE.md`)
- [ ] Configurar domínio próprio + HTTPS (certificado válido)
- [ ] Variáveis de ambiente de produção configuradas (ver
      `CONFIG-REFERENCE.md`), incluindo `EASYPAY_ENV=production` e
      credenciais de produção (não sandbox)
- [ ] Confirmar que o webhook EasyPay aponta para o endpoint de produção

### 6. Pré-condições de produto e legais
- [ ] Dicas de investimento com portfolio: `INVESTMENT_TIPS_INCLUDE_PORTFOLIO`
      fica `false` em produção **salvo** validação jurídica feita (ver Fase 6,
      decisão 8). Se for ligada, a política de privacidade menciona que resumos
      agregados da carteira (sem nomes de posições) são enviados à Anthropic
- [ ] Conta Anthropic com créditos e um limite de gasto definido antes de expor
      as funcionalidades de IA (Fases 3, 5 e 6) — sem créditos os pedidos falham
      com 502

### 7. Verificação pós-lançamento
- [ ] Monitorizar Sentry/logs nas primeiras 48h após publicação
- [ ] Validar que uma subscrição real (ou de teste com cartão real de baixo
      valor, se aplicável) reflete corretamente o tier no perfil do
      utilizador
- [ ] Confirmar que a versão Android e a versão web mostram o mesmo estado
      de subscrição para o mesmo utilizador (conta partilhada entre
      plataformas)

## Critérios de aceitação
- [ ] App publicada em faixa de teste interno da Play Store, instalável e
      funcional em dispositivo real
- [ ] Versão web em produção, acessível via HTTPS, sem erros de
      configuração de ambiente
- [ ] Subscrição feita numa plataforma reflete-se corretamente também na
      outra, para o mesmo utilizador
- [ ] Plano de rollout e contacto/processo de rollback documentado
