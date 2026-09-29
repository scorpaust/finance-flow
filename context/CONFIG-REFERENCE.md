# CONFIG-REFERENCE.md — Variáveis de ambiente e configurações externas

> Atualizar este ficheiro sempre que uma nova variável for introduzida em
> qualquer fase. Nunca colocar valores reais aqui — só nomes e descrição.

## Já existentes (baseline)

| Variável | Descrição |
|---|---|
| `MONGODB_URI` | Ligação à instância MongoDB |
| `SESSION_SECRET` | Segredo HMAC para assinar o cookie de sessão (Fase 8, `server/utils/session.ts`) — gerar com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`, nunca reutilizar entre ambientes |
| `DEMO_PASSWORD` | Opcional, só para `scripts/seed.mjs` (conta demo de desenvolvimento). Sem ela, o script gera uma password aleatória e mostra-a no fim — nunca há uma password fixa no repositório |

## Fase 1 — Capacitor / Android

| Variável / config | Descrição |
|---|---|
| `capacitor.config.ts` → `appId` | `com.financeflow.app` (ou definitivo escolhido) |
| `capacitor.config.ts` → `server.url` | Domínio de staging/produção usado pelo shell Android (ver decisão da Fase 1) |

## Fase 2 — Subscrições (EasyPay: CC/DD, MB WAY, Multibanco)

| Variável | Descrição |
|---|---|
| `EASYPAY_ENV` | `test` / `production` (determina o host da API — sandbox `api.test.easypay.pt`) |
| `EASYPAY_ACCOUNT_ID` | AccountId da conta EasyPay |
| `EASYPAY_API_KEY` | ApiKey da conta EasyPay (server-side apenas) |
| `CRON_SECRET` | Segredo partilhado com o cron externo que invoca `check-expirations` (header `x-cron-secret`) — mesma variável usada pelo cron de `market-snapshot` da Fase 3 |
| `SUBSCRIPTION_RENEWAL_REMINDER_DAYS` | Nº de dias de antecedência para gerar a referência Multibanco / avisar de expiração |
| `ADMIN_SECRET` | Fase 8, ponto 9 — segredo separado do `CRON_SECRET`, para `POST /api/admin/refund-delete` (header `x-admin-secret`). Só o operador o usa, manualmente, depois de processar um reembolso de livre resolução na EasyPay — ver `utils/legalContent.ts`, Termos ponto 4 |

Confirmado via Context7 (`docs.easypay.pt`, guia de Webhooks): a EasyPay **não
assina** os webhooks — a validação de autenticidade é feita consultando a API
de volta pelo `id` do recurso (`GET /single/{id}` ou equivalente) antes de
confiar em qualquer campo do corpo recebido, nunca processando o payload do
webhook diretamente. Sem variável de segredo dedicada para isto (ver
`server/utils/easypay.ts`).

O checkout EasyPay **não é um redirecionamento por URL** — o pacote
`@easypaypt/checkout-sdk` (client-side) recebe o manifest devolvido por
`POST /checkout` (`{ id, session, config }`) e embebe o formulário na própria
página via `startCheckout(manifest, { display: 'inline', ... })`. O modo
`'popup'` do SDK **não abre sozinho**: fica à espera de um clique no elemento
com o `id` passado nas opções (pensado para apontar a um botão "Pagar" já
visível, não para abrir programaticamente) — usar sempre `'inline'` neste
projeto (ver `pages/subscription/index.vue`).

#### Dados de teste da sandbox (`docs.easypay.pt/docs/guides/payment-methods`)

| Método | Valor de teste | Resultado |
|---|---|---|
| Cartão (CC) | `0000000000000000` | Autorizado em todas as operações |
| Cartão (CC) | `2222222222222222` | Pede autenticação 3DS |
| Cartão (CC) | `1111111111111111` | Falha em todas as operações |
| Cartão (CC) | `1234123412341234` | Recusado em todas as operações |
| MB WAY | `911234567` | Autorizado em todas as operações |
| MB WAY | `917654321` | Falha em todas as operações |
| MB WAY | `913456789` | Recusado em todas as operações |
| MB WAY | `919876543` | Pendente em todas as operações |
| Direct Debit (DD) | qualquer IBAN válido | Sucesso, **exceto** `PT50000201231234567890154` |
| Multibanco | — | Não se simula preenchendo nada no formulário; a referência é gerada normalmente e confirma-se manualmente no BackOffice da EasyPay (Pontual → Listar → pagamento → "Testar pagamento") |

### Configuração externa (não é env var)

| Item | Descrição |
|---|---|
| Conta EasyPay | Sandbox (`api.test.easypay.pt`) e produção, com Checkout configurado para os métodos `cc`, `dd`, `mbw`, `mb` |
| Inscrição no programa de pagamentos externos da Google (EEA) | Necessária para usar EasyPay dentro da app Android sem Google Play Billing — iniciar o pedido com antecedência (Fase 2/9) |

## Fases 3, 5 e 6 — IA (Anthropic + Twelve Data)

| Variável | Descrição |
|---|---|
| `ANTHROPIC_API_KEY` | Chave da API Anthropic (`claude-haiku-4-5`) — interpretação de estatísticas e dicas de investimento (Fase 3), digitalização de documentos (Fase 5). Só no servidor, nunca em `public` |
| `TWELVE_DATA_API_KEY` | Chave gratuita da Twelve Data — snapshot diário de mercado para as dicas de investimento (Fase 3) |
| `INVESTMENT_TIPS_INCLUDE_PORTFOLIO` | `true` para as dicas de investimento receberem um resumo **agregado** do portfolio registado (Fase 6, tarefa 6 — nunca nomes nem valores por posição). Por omissão desligada (`false`); **só ligar em produção depois da validação jurídica** (ver `06-FASE-6-registo-investimentos.md`, decisão 8) |

## Fase 7 — Internacionalização (idiomas + geolocalização + câmbio)

| Variável | Descrição |
|---|---|
| `GEOLITE2_DB_PATH` | Caminho local do ficheiro `GeoLite2-Country.mmdb` (MaxMind, licenciado, gratuito com registo — ver `server/utils/geo.ts` para o processo de download/atualização). Guardado fora do repositório. Sem esta variável, a geolocalização por IP fica sempre "país desconhecido" (nunca assume Portugal), e o checkout de subscrição só mostra a opção de auto-renovação |

Câmbio (transações em moeda estrangeira, Fase 7 tarefa 6) reutiliza
`TWELVE_DATA_API_KEY` (já existente, Fase 3) — `server/utils/exchangeRates.ts`
usa o endpoint `/exchange_rate`. **Não confirmado em sandbox real** nesta
sessão se o plano gratuito cobre pares forex (só índices/ETFs foram testados
na Fase 3) — por validar antes de depender disto em produção; sem resposta
válida, a criação/edição da transação falha com `422
exchange_rate_unavailable` em vez de gravar um valor não convertido.

O idioma da UI (`@nuxtjs/i18n`, cookie `financeflow_locale`) não usa nenhuma
variável de ambiente — é sempre detetado do `Accept-Language` do browser ou
escolhido manualmente nas Configurações.

## Fase 8 — Segurança e observabilidade

| Variável | Descrição |
|---|---|
| `SESSION_SECRET` | Ver linha em "Já existentes" acima — implementado nesta fase |
| `TWO_FACTOR_ENCRYPTION_KEY` | Chave para encriptar (AES-256-GCM) os segredos TOTP do 2FA em repouso (`server/utils/twoFactor.ts`) — gerar da mesma forma que `SESSION_SECRET`, com um valor diferente. Sem valor, qualquer tentativa de configurar 2FA falha (falha alto e cedo, não assina com um valor previsível) |
| `CORS_ALLOWED_ORIGINS` | Origens (separadas por vírgula) autorizadas a fazer pedidos cross-origin à API (`server/middleware/00-cors.ts`) — vazio por omissão (usa `APP_URL`); sem isto o browser já bloqueia leitura cross-origin por Same-Origin Policy, isto é sobretudo para um domínio de staging separado a consumir a API de produção |
| `SENTRY_DSN` | DSN do projeto Sentry (`@sentry/nuxt` 10.x). **Vazio = desligado**: o módulo nem é carregado (`nuxt.config.ts`), nada é enviado. Com DSN, envia erros de client e servidor **sem** corpo dos pedidos, cookies nem cabeçalhos (`sentry.*.config.ts`) e sem Session Replay (gravaria valores financeiros). O DSN é público por desenho (vai no bundle do client). Em produção (`node-server`) arrancar com `node --import ./.output/server/sentry.server.config.mjs .output/server/index.mjs` para instrumentar o servidor |
| `NODE_ENV` | `development` / `production` — já existente, controla cookies `secure`, logging, etc. |

2FA (`server/utils/twoFactor.ts`, ponto 3) suporta só app autenticadora (TOTP)
— `otpauth` para gerar/validar o código, `qrcode` para o QR code do setup.
Email e SMS ficaram deliberadamente fora de âmbito (sem infraestrutura de
envio no projeto — ver `context/features/08-FASE-8-seguranca-qualidade.md`).

## Fase 9 — Publicação / produção

| Item (não é env var, é configuração externa) | Descrição |
|---|---|
| Keystore Android de produção | Guardado fora do repositório, com backup seguro documentado |
| Domínio de produção + certificado HTTPS | Confirmar renovação automática se aplicável |
| Conta EasyPay **live** (não sandbox) | `EASYPAY_ENV=production` + `EASYPAY_ACCOUNT_ID`/`EASYPAY_API_KEY` de produção, confirmados antes do lançamento (ver Fase 2) |
| Inscrição aprovada no programa de pagamentos externos da Google | Pedido submetido na Fase 2, aprovação confirmada antes de publicar na Play Store |

## Checklist rápida antes de qualquer deploy

- [ ] `.env.example` reflete todas as variáveis desta tabela
- [ ] Nenhuma chave **live**/produção em ambiente de desenvolvimento
- [ ] Nenhuma chave de teste em ambiente de produção
- [ ] `INVESTMENT_TIPS_INCLUDE_PORTFOLIO` está `false` (ou ausente) em produção, salvo validação jurídica feita
- [ ] `android:usesCleartextTraffic="false"` e sem `CAPACITOR_SERVER_URL` no build de release Android
