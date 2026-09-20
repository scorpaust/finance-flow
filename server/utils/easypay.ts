// Wrapper fino sobre a REST API da EasyPay (Checkout, Subscription, Frequent
// Payments). Ver context/features/02-FASE-2-sistema-subscricoes.md tarefa 3.
// Requer EASYPAY_ACCOUNT_ID / EASYPAY_API_KEY / EASYPAY_ENV em runtimeConfig.
// Documentação consultada via Context7 (/websites/easypay_pt).

import type { CheckoutManifest } from '@easypaypt/checkout-sdk'

const EASYPAY_API_BASE = () =>
  useRuntimeConfig().easypayEnv === 'production'
    ? 'https://api.easypay.pt/2.0'
    : 'https://api.test.easypay.pt/2.0'

async function easypayFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const config = useRuntimeConfig()
  if (!config.easypayAccountId || !config.easypayApiKey) {
    throw createError({
      statusCode: 500,
      message: 'EasyPay não configurado (EASYPAY_ACCOUNT_ID/EASYPAY_API_KEY em falta)',
    })
  }

  const res = await fetch(`${EASYPAY_API_BASE()}${path}`, {
    method: options.method || 'GET',
    headers: {
      AccountId: config.easypayAccountId,
      ApiKey: config.easypayApiKey,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw createError({ statusCode: 502, message: `Erro EasyPay (${res.status}): ${detail.slice(0, 500)}` })
  }

  return (await res.json()) as T
}

// A EasyPay deixa-nos encodar o nosso próprio identificador no pagamento
// (`key`/`customer.key`) — o webhook devolve-o sem alterações, e a verificação
// (GET ao recurso pelo `id`) também. Evita precisar de uma tabela de "pending
// orders" só para correlacionar checkout -> (utilizador, plano, método).
// `periodMonths` só é
// usado por MB WAY/Multibanco (pagamento único por período fixo — decisão do
// utilizador de 2026-09-19: nenhum dos dois permite renovação automática sem
// ação manual a cada ciclo, por isso o modelo passou de "cron mensal" para
// "período pré-pago").
export function encodeMerchantKey(userId: string, tier: 'pro' | 'premium', paymentMethod: string, periodMonths?: number): string {
  return periodMonths ? `${userId}:${tier}:${paymentMethod}:${periodMonths}` : `${userId}:${tier}:${paymentMethod}`
}

export function decodeMerchantKey(
  key: string
): { userId: string; tier: 'pro' | 'premium'; paymentMethod: string; periodMonths: number | null } | null {
  const parts = key.split(':')
  if (parts.length !== 3 && parts.length !== 4) return null
  const [userId, tier, paymentMethod, periodMonthsStr] = parts
  if (tier !== 'pro' && tier !== 'premium') return null
  const periodMonths = periodMonthsStr ? parseInt(periodMonthsStr, 10) : null
  return { userId, tier, paymentMethod, periodMonths: periodMonths && !isNaN(periodMonths) ? periodMonths : null }
}

// ─── Checkout (formulário PCI-compliant, renderizado no client via SDK) ───────
// Usado para os 4 métodos — CC/DD com type: ['subscription'] (cria diretamente
// a Subscription nativa no fim do checkout, cobrança 100% automática todos os
// meses); MB WAY/Multibanco com type: ['single'] (pagamento único do valor
// total de um período fixo escolhido pelo utilizador — decisão de 2026-09-19:
// nenhum dos dois métodos permite renovação sem ação manual do cliente a
// cada ciclo, por isso não faz sentido tokenizar para reutilização). Schema
// do pedido confirmado via Context7 contra o guia de produto
// (docs.easypay.pt/docs/products/checkout —
// "Common Use Cases"): o `type` (single/frequent/subscription) é um **array
// de nível superior**, não um campo dentro de `payment`; o valor a cobrar vai
// dentro de `order`, não solto no corpo do pedido. Confirmado em sandbox real
// (2026-09-18): sem o `type` de nível superior a API devolve 412 "type: value
// is required".
//
// A EasyPay Checkout **não é um redirecionamento por URL** — a resposta deste POST é o "manifest" que o SDK
// `@easypaypt/checkout-sdk` (client-side, ver pages/subscription/index.vue)
// usa para renderizar o formulário inline/popup diretamente na página, sem
// sair da app. Confirmado no `.d.ts` do pacote instalado
// (node_modules/@easypaypt/checkout-sdk/dist/src/index.d.ts): a resposta
// desta chamada É o `CheckoutManifest` (`{ id, session, config }`).
export type EasyPayCheckoutManifest = CheckoutManifest

// EasyPay espera datas no formato "Y-m-d H:i" (ex. start_time), não ISO 8601.
function easypayDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// Para DD, o `sdd_mandate` (IBAN/titular/telefone) NÃO é pré-preenchido por
// nós — o próprio formulário hospedado da EasyPay pede esses dados ao
// cliente. Passá-los aqui também criava um formulário duplicado e redundante
// (reportado em sandbox, 2026-09-19: o utilizador preenchia o nosso
// formulário e o checkout da EasyPay voltava a pedir tudo outra vez).
export async function createSubscriptionCheckout(opts: {
  method: 'CC' | 'DD'
  value: number
  key: string
  descriptive: string
  customerName: string
  customerEmail: string
}): Promise<EasyPayCheckoutManifest> {
  return easypayFetch<EasyPayCheckoutManifest>('/checkout', {
    method: 'POST',
    body: {
      type: ['subscription'],
      payment: {
        methods: [opts.method],
        type: 'sale',
        currency: 'EUR',
        key: opts.key,
        frequency: '1M',
        start_time: easypayDateTime(new Date()),
        unlimited_payments: true,
        capture_now: true,
        retries: 2,
      },
      order: {
        items: [{ description: opts.descriptive, quantity: 1, value: opts.value }],
        value: opts.value,
      },
      customer: { name: opts.customerName, email: opts.customerEmail, key: opts.key },
    },
  })
}

// MB WAY/Multibanco: pagamento único (não recorrente) do valor total do
// período escolhido — ver nota em encodeMerchantKey(). type: ['single'] em
// vez de ['frequent']: sem token para reutilizar depois, não faz sentido
// tokenizar. Multibanco devolve entidade/referência diretamente ligadas a
// este pagamento (ver getSingle() para os obter depois de confirmado).
export async function createSinglePaymentCheckout(opts: {
  method: 'MBW' | 'MB'
  value: number
  key: string
  descriptive: string
  customerName: string
  customerEmail: string
}): Promise<EasyPayCheckoutManifest> {
  return easypayFetch<EasyPayCheckoutManifest>('/checkout', {
    method: 'POST',
    body: {
      type: ['single'],
      payment: {
        methods: [opts.method],
        type: 'sale',
        currency: 'EUR',
        key: opts.key,
        capture: { descriptive: opts.descriptive },
      },
      order: {
        items: [{ description: opts.descriptive, quantity: 1, value: opts.value }],
        value: opts.value,
      },
      customer: { name: opts.customerName, email: opts.customerEmail, key: opts.key },
    },
  })
}

// ─── Verificação de autenticidade dos webhooks ────────────────────────────────
// A EasyPay não assina os webhooks (confirmado na doc de Webhooks consultada
// via Context7) — a prática recomendada é nunca confiar no corpo recebido e
// consultar sempre a API pelo `id` do recurso antes de processar o evento.

export interface EasyPayResource {
  id?: string
  key?: string
  status?: string
  payment_status?: string
  method?: { type?: string; entity?: string; reference?: string; expiration_date?: string } | string
  customer?: { key?: string; email?: string; name?: string }
  subscription_id?: string
  frequent_id?: string
  [key: string]: unknown
}

export async function getSingle(id: string): Promise<EasyPayResource> {
  return easypayFetch<EasyPayResource>(`/single/${id}`)
}

export async function getSubscriptionResource(id: string): Promise<EasyPayResource> {
  return easypayFetch<EasyPayResource>(`/subscriptions/${id}`)
}

// Verificação pelo id do **checkout** (o que o nosso servidor recebeu ao
// criar o checkout, `manifest.id` — sempre válido, ao contrário de tentar
// adivinhar entre /subscriptions/{id}, /frequent/{id} ou /single/{id} a
// partir do `payment.id` devolvido pelo SDK no onSuccess, que em sandbox
// devolveu 404 nos três em 2026-09-18). Schema confirmado via Context7
// ("Checkout Get Details Response Schema").
export interface EasyPayCheckoutStatus {
  status?: string
  message?: string[]
  checkout?: { id?: string; status?: string }
  payment?: { id?: string; status?: string; methods?: string[]; key?: string }
  value?: number
  [key: string]: unknown
}

export async function getCheckoutStatus(checkoutId: string): Promise<EasyPayCheckoutStatus> {
  return easypayFetch<EasyPayCheckoutStatus>(`/checkout/${checkoutId}`)
}

// ─── Subscription nativa (CC/DD) ──────────────────────────────────────────────

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await easypayFetch<unknown>(`/subscriptions/${subscriptionId}`, { method: 'DELETE' })
}
