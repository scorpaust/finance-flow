// Wrapper fino sobre a PayPal REST API (Orders API + Subscriptions API + Webhooks).
// Ver context/features/02-FASE-2-sistema-subscricoes.md tarefa 3.
// Requer PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET / PAYPAL_ENV / PAYPAL_WEBHOOK_ID em runtimeConfig.

const PAYPAL_API_BASE = () =>
  useRuntimeConfig().paypalEnv === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

let cachedToken: { value: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value
  }

  const config = useRuntimeConfig()
  if (!config.paypalClientId || !config.paypalClientSecret) {
    throw createError({
      statusCode: 500,
      message: 'PayPal não configurado (PAYPAL_CLIENT_ID/PAYPAL_CLIENT_SECRET em falta)',
    })
  }

  const res = await fetch(`${PAYPAL_API_BASE()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.paypalClientId}:${config.paypalClientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    throw createError({ statusCode: 502, message: 'Falha na autenticação PayPal' })
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 }
  return cachedToken.value
}

async function paypalFetch<T>(path: string, options: { method?: string; body?: unknown; headers?: Record<string, string> } = {}): Promise<T> {
  const token = await getAccessToken()
  const res = await fetch(`${PAYPAL_API_BASE()}${path}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw createError({ statusCode: 502, message: `Erro PayPal (${res.status}): ${detail.slice(0, 500)}` })
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

// ─── Subscriptions API (cartão / saldo PayPal, auto-renovação) ────────────────

export interface PayPalSubscriptionLink { rel: string; href: string; method: string }
export interface PayPalSubscription { id: string; status: string; links: PayPalSubscriptionLink[] }

export async function createSubscription(opts: {
  planId: string
  customId: string
  returnUrl: string
  cancelUrl: string
}): Promise<PayPalSubscription> {
  return paypalFetch<PayPalSubscription>('/v1/billing/subscriptions', {
    method: 'POST',
    body: {
      plan_id: opts.planId,
      custom_id: opts.customId,
      application_context: {
        brand_name: 'FinanceFlow',
        locale: 'pt-PT',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: opts.returnUrl,
        cancel_url: opts.cancelUrl,
      },
    },
  })
}

export async function getSubscription(subscriptionId: string) {
  return paypalFetch<any>(`/v1/billing/subscriptions/${subscriptionId}`)
}

export async function cancelSubscription(subscriptionId: string, reason: string) {
  return paypalFetch<void>(`/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    body: { reason },
  })
}

// A PayPal não faz proração automática num upgrade/downgrade: o novo preço só
// entra em vigor no ciclo de faturação seguinte (confirmado em
// developer.paypal.com/docs/subscriptions/customize/revise-subscriptions) —
// decisão de negócio (ver context/current-feature.md) é aceitar isso em vez
// de cobrar/creditar manualmente a diferença. O acesso à nova tier muda já,
// só a cobrança é que respeita o ciclo em curso.
export async function reviseSubscription(subscriptionId: string, newPlanId: string) {
  return paypalFetch<{ plan_id?: string; links?: PayPalSubscriptionLink[] }>(
    `/v1/billing/subscriptions/${subscriptionId}/revise`,
    { method: 'POST', body: { plan_id: newPlanId } }
  )
}

// ─── Orders API (MB WAY / Multibanco, pagamento pré-pago por período) ────────
// Confirmado em developer.paypal.com/mbway e .../docs/checkout/apm/multibanco/orders-api/
// (não indexado no Context7 — pesquisa web direta): os dois métodos têm fluxos
// diferentes entre si e diferentes do resto da Orders API.
//
// MB WAY  — passo único: payment_source.mbway já na criação da order, com
//           processing_instruction=ORDER_COMPLETE_ON_PAYMENT_APPROVAL (captura
//           automática após o buyer confirmar no telemóvel). Sem redirect —
//           "the buyer stays on your website... no redirection action is
//           required". Chave é "mbway", não "mb_way".
// Multibanco — dois passos: 1) criar a order "vazia" (sem payment_source);
//           2) POST .../confirm-payment-source com payment_source.multibanco
//           (name + country_code) + processing_instruction +
//           application_context{return_url,cancel_url}. A referência a pagar
//           no ATM vem logo na resposta desse 2º passo, em
//           payment_source.multibanco.{payment_reference,payment_entity} — não
//           precisa de capture explícito.

export interface PayPalOrder { id: string; status: string; links: PayPalSubscriptionLink[] }

function splitName(fullName: string): { given_name: string; surname: string } {
  const parts = fullName.trim().split(/\s+/)
  return { given_name: parts[0] || fullName, surname: parts.slice(1).join(' ') || parts[0] || fullName }
}

export async function createMbWayOrder(opts: {
  amountValue: string
  customId: string
  description: string
  payerName: string
  phoneNationalNumber: string
}): Promise<PayPalOrder> {
  // PayPal exige PayPal-Request-Id (idempotency key) sempre que a criação da
  // order já inclui payment_source (processa o pagamento no mesmo pedido).
  return paypalFetch<PayPalOrder>('/v2/checkout/orders', {
    method: 'POST',
    headers: { 'PayPal-Request-Id': crypto.randomUUID() },
    body: {
      intent: 'CAPTURE',
      processing_instruction: 'ORDER_COMPLETE_ON_PAYMENT_APPROVAL',
      payment_source: {
        mbway: {
          country_code: 'PT',
          name: opts.payerName,
          phone: { country_code: '351', national_number: opts.phoneNationalNumber },
          experience_context: { brand_name: 'FinanceFlow' },
        },
      },
      purchase_units: [
        {
          custom_id: opts.customId,
          description: opts.description,
          amount: { currency_code: 'EUR', value: opts.amountValue },
        },
      ],
    },
  })
}

export async function createMultibancoOrder(opts: {
  amountValue: string
  customId: string
  description: string
  payerName: string
  returnUrl: string
  cancelUrl: string
}): Promise<PayPalOrder> {
  const order = await paypalFetch<PayPalOrder>('/v2/checkout/orders', {
    method: 'POST',
    body: {
      intent: 'CAPTURE',
      purchase_units: [
        {
          custom_id: opts.customId,
          description: opts.description,
          amount: { currency_code: 'EUR', value: opts.amountValue },
        },
      ],
    },
  })

  // Confirmado em sandbox real (não como a doc sugeria): a resposta não traz
  // a referência diretamente — fica PAYER_ACTION_REQUIRED com um link
  // `payer-action` para uma página da PayPal que mostra entidade/referência
  // ao buyer. É essa página que é preciso abrir (redirect), como qualquer
  // outro método baseado em redirect.
  return paypalFetch<PayPalOrder>(`/v2/checkout/orders/${order.id}/confirm-payment-source`, {
    method: 'POST',
    headers: { 'PayPal-Request-Id': crypto.randomUUID() },
    body: {
      payment_source: {
        multibanco: { name: opts.payerName, country_code: 'PT' },
      },
      processing_instruction: 'ORDER_COMPLETE_ON_PAYMENT_APPROVAL',
      application_context: {
        locale: 'pt-PT',
        return_url: opts.returnUrl,
        cancel_url: opts.cancelUrl,
      },
    },
  })
}

export async function getOrder(orderId: string) {
  return paypalFetch<any>(`/v2/checkout/orders/${orderId}`)
}

// ─── Webhooks ──────────────────────────────────────────────────────────────

export interface PayPalWebhookHeaders {
  transmissionId: string
  transmissionTime: string
  certUrl: string
  authAlgo: string
  transmissionSig: string
}

export async function verifyWebhookSignature(headers: PayPalWebhookHeaders, webhookEvent: unknown): Promise<boolean> {
  const config = useRuntimeConfig()
  if (!config.paypalWebhookId) {
    throw createError({ statusCode: 500, message: 'PAYPAL_WEBHOOK_ID não configurado' })
  }

  const result = await paypalFetch<{ verification_status: string }>('/v1/notifications/verify-webhook-signature', {
    method: 'POST',
    body: {
      transmission_id: headers.transmissionId,
      transmission_time: headers.transmissionTime,
      cert_url: headers.certUrl,
      auth_algo: headers.authAlgo,
      transmission_sig: headers.transmissionSig,
      webhook_id: config.paypalWebhookId,
      webhook_event: webhookEvent,
    },
  })

  return result.verification_status === 'SUCCESS'
}
