# CONFIG-REFERENCE.md — Variáveis de ambiente e configurações externas

> Atualizar este ficheiro sempre que uma nova variável for introduzida em
> qualquer fase. Nunca colocar valores reais aqui — só nomes e descrição.

## Já existentes (baseline)

| Variável | Descrição |
|---|---|
| `MONGODB_URI` | Ligação à instância MongoDB |
| `SESSION_SECRET` (nome pode variar — confirmar no código atual de auth) | Segredo para assinar/gerir sessão |

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
| Inscrição no programa de pagamentos externos da Google (EEA) | Necessária para usar EasyPay dentro da app Android sem Google Play Billing — iniciar o pedido com antecedência (Fase 2/5) |

## Fase 4 — Segurança e observabilidade

| Variável | Descrição |
|---|---|
| `SENTRY_DSN` | Endpoint do projeto Sentry (ou equivalente) |
| `NODE_ENV` | `development` / `production` — controla cookies `secure`, logging, etc. |
| `CORS_ALLOWED_ORIGIN` | Domínio de produção permitido para CORS |

## Fase 5 — Publicação / produção

| Item (não é env var, é configuração externa) | Descrição |
|---|---|
| Keystore Android de produção | Guardado fora do repositório, com backup seguro documentado |
| Domínio de produção + certificado HTTPS | Confirmar renovação automática se aplicável |
| Produtos Stripe **live** (não teste) | Preços espelhados dos de teste, confirmados antes do lançamento |
| Produtos de subscrição na Google Play Console | Mesmo preço/período que Stripe, ajustado por região pela própria Play Store |

## Checklist rápida antes de qualquer deploy

- [ ] `.env.example` reflete todas as variáveis desta tabela
- [ ] Nenhuma chave **live**/produção em ambiente de desenvolvimento
- [ ] Nenhuma chave de teste em ambiente de produção
