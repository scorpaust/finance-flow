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

## Fase 2 — Subscrições (PayPal + MB WAY + Multibanco)

| Variável | Descrição |
|---|---|
| `PAYPAL_ENV` | `sandbox` / `live` |
| `PAYPAL_CLIENT_ID` | Client ID da app PayPal (REST API) |
| `PAYPAL_CLIENT_SECRET` | Client Secret da app PayPal (server-side apenas) |
| `PAYPAL_WEBHOOK_ID` | ID do webhook PayPal, usado para validar a assinatura dos eventos recebidos |
| `PAYPAL_PLAN_ID_PRO` | ID do plano PayPal Subscriptions do plano Pro (5,00 €/mês, auto-renovável) |
| `PAYPAL_PLAN_ID_PREMIUM` | ID do plano PayPal Subscriptions do plano Premium (12,99 €/mês, auto-renovável) |
| `SUBSCRIPTION_RENEWAL_REMINDER_DAYS` | Nº de dias antes de expirar um plano pré-pago (MB WAY/Multibanco) para disparar o aviso de renovação |

### Configuração externa (não é env var)

| Item | Descrição |
|---|---|
| Conta PayPal Business | Com Multibanco aprovado (pedido via `bizsignup?product=multibanco`) e MB WAY ativo (beta — confirmar disponibilidade da conta) |
| Inscrição no programa de pagamentos externos da Google (EEA) | Necessária para usar PayPal/MB WAY/Multibanco dentro da app Android sem Google Play Billing — iniciar o pedido com antecedência (Fase 2/5) |

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
