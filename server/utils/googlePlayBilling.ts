import { createSign } from 'node:crypto'
import { GooglePlayTransaction, type IGooglePlayTransaction } from '../models'
import { TIER_PRICE_EUR } from '../../shared/features'
import { getCheckoutStatus } from './easypay'
import { logEvent } from './logger'

// Fase 9 — "alternative billing only" da Google Play (EEE). A app Android cobra
// com a EasyPay; cada transação feita DENTRO da app tem de ser reportada à
// Google Play Developer API em até 24 h (externaltransactions.create), com o
// token que a Play Billing Library deu à app antes da compra. As renovações
// mensais de cartão/débito direto reportam-se como parte da mesma série
// (initialExternalTransactionId). Fontes: context/PLAY-STORE.md, secção 5.
//
// Fluxo (documentos GooglePlayTransaction, server/models/index.ts):
//   1. registerCheckoutToken — o checkout criado na app traz o token
//   2. onCheckoutResult / onPaymentPaid — a EasyPay confirma o pagamento
//   3. reportTransaction — POST à Google; falhas temporárias ficam `pending`
//   4. processGooglePlayQueue (cron de hora a hora) — repete o que falhou e
//      recupera checkouts cuja confirmação não passou pela app

const SCOPE = 'https://www.googleapis.com/auth/androidpublisher'
// Um checkout por pagar há mais de 7 dias já não vai ser pago (a referência
// Multibanco da EasyPay expira antes disso).
const AWAITING_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
// A 1.ª cobrança de uma subscrição pode também chegar como "capture" — não é
// uma renovação. Renovações são mensais; nada abaixo disto conta como tal.
const MIN_RENEWAL_GAP_MS = 20 * 24 * 60 * 60 * 1000
const MAX_ATTEMPTS = 50

type Method = IGooglePlayTransaction['method']
type Tier = IGooglePlayTransaction['tier']

interface ServiceAccount {
  client_email: string
  private_key: string
  token_uri?: string
}

function apiBase(): string {
  return process.env.GOOGLE_PLAY_API_BASE_URL || 'https://androidpublisher.googleapis.com'
}

function readServiceAccount(): ServiceAccount | null {
  const raw = String(useRuntimeConfig().googlePlayServiceAccount || '').trim()
  if (!raw) return null
  try {
    const json = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8')
    const parsed = JSON.parse(json)
    return parsed?.client_email && parsed?.private_key ? parsed : null
  } catch {
    logEvent('error', 'google_play.service_account_invalid')
    return null
  }
}

let cachedToken: { value: string; expiresAt: number } | null = null

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString('base64url')
}

// OAuth 2.0 para contas de serviço (JWT bearer, RS256) — sem dependências
// extra, só node:crypto.
async function getAccessToken(account: ServiceAccount): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value
  const tokenUri = account.token_uri || 'https://oauth2.googleapis.com/token'
  const now = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = base64url(JSON.stringify({ iss: account.client_email, scope: SCOPE, aud: tokenUri, iat: now, exp: now + 3600 }))
  const signature = createSign('RSA-SHA256').update(`${header}.${claims}`).sign(account.private_key)
  const assertion = `${header}.${claims}.${base64url(signature)}`

  const res = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  })
  if (!res.ok) throw new Error(`OAuth ${res.status}`)
  const data = (await res.json()) as { access_token: string; expires_in?: number }
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 }
  return data.access_token
}

export function priceCents(tier: Tier, periodMonths: number): number {
  return Math.round(TIER_PRICE_EUR[tier] * periodMonths * 100)
}

// Google: `priceMicros` = unidades × 1 000 000, em string.
function money(cents: number) {
  return { currency: 'EUR', priceMicros: String(cents * 10_000) }
}

function splitTax(amountCents: number): { preTaxCents: number; taxCents: number } {
  const rate = Number(useRuntimeConfig().billingVatRate) || 0
  const preTaxCents = Math.round(amountCents / (1 + rate))
  return { preTaxCents, taxCents: amountCents - preTaxCents }
}

// 1–63 caracteres [a-zA-Z0-9_-], único por app, sem dados pessoais.
function externalIdFor(paymentId: string): string {
  return `ff-${paymentId.replace(/[^a-zA-Z0-9_-]/g, '')}`.slice(0, 63)
}

function isRecurring(method: Method): boolean {
  return method === 'cc' || method === 'dd'
}

// ── 1. Checkout criado dentro da app Android ─────────────────────────────────
export async function registerCheckoutToken(opts: {
  userId: string
  token: string
  checkoutId: string
  tier: Tier
  method: Method
  periodMonths: number
  regionCode: string | null
}): Promise<void> {
  await GooglePlayTransaction.create({
    userId: opts.userId,
    kind: 'initial',
    status: 'awaiting_payment',
    token: opts.token,
    checkoutId: opts.checkoutId,
    tier: opts.tier,
    method: opts.method,
    periodMonths: opts.periodMonths,
    amountCents: priceCents(opts.tier, opts.periodMonths),
    // Sem país detetado, o da sede do operador — a Google exige sempre um.
    regionCode: opts.regionCode || 'PT',
  })
}

async function markPaid(doc: InstanceType<typeof GooglePlayTransaction>, paymentId: string): Promise<void> {
  doc.paymentId = paymentId
  doc.externalTransactionId = externalIdFor(paymentId)
  doc.transactionTime = new Date()
  doc.status = 'pending'
  await doc.save()
  await reportTransaction(doc)
}

// ── 2a. Resultado do checkout (confirm.post.ts ou cron) ─────────────────────
// `paid` falso = ainda pendente (Multibanco por pagar, débito direto à espera
// do mandato): só liga o checkout ao pagamento, o reporte vem com onPaymentPaid.
export async function onCheckoutResult(checkoutId: string, paymentId: string, paid: boolean): Promise<void> {
  const doc = await GooglePlayTransaction.findOne({ checkoutId, status: 'awaiting_payment' })
  if (!doc) return
  if (!paid) {
    if (doc.paymentId !== paymentId) {
      doc.paymentId = paymentId
      await doc.save()
    }
    return
  }
  await markPaid(doc, paymentId)
}

// ── 2b. Pagamento confirmado por webhook ─────────────────────────────────────
export async function onPaymentPaid(paymentId: string): Promise<void> {
  const doc = await GooglePlayTransaction.findOne({ paymentId, status: 'awaiting_payment' })
  if (doc) await markPaid(doc, paymentId)
}

// ── 2c. Cobrança de uma subscrição (cartão/débito direto) ───────────────────
// `seriesId` = id da subscrição na EasyPay (= paymentId da transação inicial).
// Débito direto: a 1.ª cobrança só é confirmada depois do checkout, por
// webhook, com um id próprio — é ela que completa a transação inicial. As
// seguintes são renovações da mesma série.
export async function onSubscriptionCharge(seriesId: string, chargeId: string, tier: Tier): Promise<void> {
  if (!seriesId) return
  const firstCharge = await GooglePlayTransaction.findOne({ paymentId: seriesId, status: 'awaiting_payment' })
  if (firstCharge) {
    await markPaid(firstCharge, seriesId)
    return
  }
  if (chargeId === seriesId) return
  const initial = await GooglePlayTransaction.findOne({
    kind: 'initial',
    paymentId: seriesId,
    method: { $in: ['cc', 'dd'] },
    status: { $in: ['pending', 'reported'] },
  })
  if (!initial?.externalTransactionId) return
  if (initial.transactionTime && Date.now() - initial.transactionTime.getTime() < MIN_RENEWAL_GAP_MS) return
  if (await GooglePlayTransaction.exists({ paymentId: chargeId })) return

  const doc = await GooglePlayTransaction.create({
    userId: initial.userId,
    kind: 'renewal',
    status: 'pending',
    paymentId: chargeId,
    initialExternalTransactionId: initial.externalTransactionId,
    externalTransactionId: externalIdFor(chargeId),
    tier,
    method: initial.method,
    periodMonths: 1,
    amountCents: priceCents(tier, 1),
    regionCode: initial.regionCode,
    transactionTime: new Date(),
  })
  await reportTransaction(doc)
}

// ── 3. Reporte à Google ──────────────────────────────────────────────────────
function buildBody(doc: IGooglePlayTransaction) {
  const { preTaxCents, taxCents } = splitTax(doc.amountCents)
  const body: Record<string, unknown> = {
    originalPreTaxAmount: money(preTaxCents),
    originalTaxAmount: money(taxCents),
    transactionTime: (doc.transactionTime || new Date()).toISOString(),
    userTaxAddress: { regionCode: doc.regionCode },
  }
  if (doc.kind === 'renewal') {
    body.recurringTransaction = {
      initialExternalTransactionId: doc.initialExternalTransactionId,
      externalSubscription: { subscriptionType: 'RECURRING' },
    }
  } else if (isRecurring(doc.method)) {
    body.recurringTransaction = {
      externalTransactionToken: doc.token,
      externalSubscription: { subscriptionType: 'RECURRING' },
    }
  } else {
    // MB WAY / Multibanco: período fixo pago de uma vez, sem renovação.
    body.recurringTransaction = {
      externalTransactionToken: doc.token,
      externalSubscription: { subscriptionType: 'PREPAID' },
    }
  }
  return body
}

export async function reportTransaction(doc: InstanceType<typeof GooglePlayTransaction>): Promise<void> {
  const account = readServiceAccount()
  if (!account) {
    logEvent('warn', 'google_play.not_configured', { externalTransactionId: doc.externalTransactionId })
    return
  }
  const packageName = useRuntimeConfig().googlePlayPackageName
  const url =
    `${apiBase()}/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/externalTransactions` +
    `?externalTransactionId=${encodeURIComponent(doc.externalTransactionId!)}`

  doc.attempts += 1
  try {
    const token = await getAccessToken(account)
    const res = await fetch(url, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(buildBody(doc)),
    })
    // 409 = já reportada (repetição depois de uma resposta perdida).
    if (res.ok || res.status === 409) {
      doc.status = 'reported'
      doc.reportedAt = new Date()
      doc.lastError = undefined
      logEvent('info', 'google_play.reported', { externalTransactionId: doc.externalTransactionId, kind: doc.kind })
    } else {
      const detail = (await res.text().catch(() => '')).slice(0, 300)
      doc.lastError = `HTTP ${res.status}: ${detail}`
      // 4xx (exceto 429) não se resolve a repetir — precisa de intervenção.
      if (res.status >= 400 && res.status < 500 && res.status !== 429) doc.status = 'failed'
      logEvent('error', 'google_play.report_failed', { externalTransactionId: doc.externalTransactionId, status: res.status })
    }
  } catch (e: any) {
    doc.lastError = String(e?.message || e).slice(0, 300)
    logEvent('error', 'google_play.report_failed', { externalTransactionId: doc.externalTransactionId, message: doc.lastError })
  }
  if (doc.status === 'pending' && doc.attempts >= MAX_ATTEMPTS) doc.status = 'failed'
  await doc.save()
}

// ── 4. Fila (cron) ───────────────────────────────────────────────────────────
export async function processGooglePlayQueue(): Promise<{ reported: number; failed: number; expired: number; stillPending: number }> {
  // Checkouts da app cuja confirmação não passou por confirm.post.ts (app
  // fechada a meio, Multibanco pago dias depois): o estado vem da EasyPay.
  const awaiting = await GooglePlayTransaction.find({ status: 'awaiting_payment' }).limit(200)
  for (const doc of awaiting) {
    if (Date.now() - doc.createdAt.getTime() > AWAITING_MAX_AGE_MS) {
      doc.status = 'expired'
      await doc.save()
      continue
    }
    try {
      const checkout = await getCheckoutStatus(doc.checkoutId!)
      const paymentId = checkout.payment?.id
      const status = checkout.payment?.status
      if (!paymentId) continue
      const paid = typeof status === 'string' && ['success', 'paid', 'authorised', 'active', 'ok'].includes(status)
      await onCheckoutResult(doc.checkoutId!, paymentId, paid)
    } catch (e: any) {
      logEvent('warn', 'google_play.checkout_lookup_failed', { checkoutId: doc.checkoutId, message: String(e?.message || e).slice(0, 200) })
    }
  }

  const pending = await GooglePlayTransaction.find({ status: 'pending' }).limit(200)
  for (const doc of pending) await reportTransaction(doc)

  const [reported, failed, expired, stillPending] = await Promise.all([
    GooglePlayTransaction.countDocuments({ status: 'reported' }),
    GooglePlayTransaction.countDocuments({ status: 'failed' }),
    GooglePlayTransaction.countDocuments({ status: 'expired' }),
    GooglePlayTransaction.countDocuments({ status: 'pending' }),
  ])
  if (failed) logEvent('error', 'google_play.failed_transactions', { failed })
  return { reported, failed, expired, stillPending }
}

// ── Reembolso (livre resolução, server/api/admin/refund-delete.post.ts) ─────
// Reporta à Google o reembolso total das transações da app nos últimos 14
// dias (o prazo da livre resolução). Devolve quantas ficaram por reportar.
export async function refundRecentForUser(userId: string): Promise<number> {
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  const docs = await GooglePlayTransaction.find({ userId, status: 'reported', transactionTime: { $gte: since } })
  if (!docs.length) return 0
  const account = readServiceAccount()
  if (!account) {
    logEvent('error', 'google_play.refund_not_configured', { count: docs.length })
    return docs.length
  }
  const packageName = useRuntimeConfig().googlePlayPackageName
  let failures = 0
  for (const doc of docs) {
    try {
      const token = await getAccessToken(account)
      const res = await fetch(
        `${apiBase()}/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/externalTransactions/${encodeURIComponent(doc.externalTransactionId!)}:refund`,
        {
          method: 'POST',
          headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
          body: JSON.stringify({ refundTime: new Date().toISOString(), fullRefund: {} }),
        }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      doc.status = 'refunded'
      doc.refundedAt = new Date()
      await doc.save()
    } catch (e: any) {
      failures += 1
      logEvent('error', 'google_play.refund_failed', { externalTransactionId: doc.externalTransactionId, message: String(e?.message || e).slice(0, 200) })
    }
  }
  return failures
}
