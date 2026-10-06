import { createHmac, createPublicKey, createSign, verify as cryptoVerify } from 'node:crypto'
import { User, type IUserSubscription } from '../models'
import { effectiveTier } from '../../shared/features'
import { PLAY_PACKAGE_NAME, tierForPlayProduct, type PaidTier } from '../../shared/playBilling'
import { logEvent } from './logger'

// Upgrade 01 — Google Play Billing na app Android
// (context/features/upgrades/01-google-play-billing-android.md). A Google
// cobra; o servidor só lê o estado da compra na Google Play Developer API e
// aplica-o à conta. Três caminhos levam ao mesmo syncPlayPurchase():
//   1. a app, logo depois da compra (POST /api/billing/google-play/verify)
//   2. as notificações em tempo real da Google (RTDN, via Pub/Sub push —
//      POST /api/billing/google-play/rtdn)
//   3. a reconciliação (cron) e a leitura de /api/subscription, para o caso
//      de uma notificação se perder
// Nunca se confia no tipo da notificação nem no que a app envia: o estado é
// sempre lido de novo na Google.
//
// Configuração lida do ambiente em RUNTIME (não do runtimeConfig): uma
// variável marcada como secreta no Netlify chega mascarada ao build local do
// CLI e ficava assim no build (incidente de 2026-10-04, ver server/utils/db.ts).

const SCOPE = 'https://www.googleapis.com/auth/androidpublisher'

function env(name: string): string {
  return String(process.env[name] || '').trim()
}

function apiBase(): string {
  return env('GOOGLE_PLAY_API_BASE_URL') || 'https://androidpublisher.googleapis.com'
}

export function playPackageName(): string {
  return env('GOOGLE_PLAY_PACKAGE_NAME') || PLAY_PACKAGE_NAME
}

interface ServiceAccount {
  client_email: string
  private_key: string
  token_uri?: string
}

// JSON da conta de serviço, em texto ou em base64 (mais fácil de colar).
function readServiceAccount(): ServiceAccount | null {
  const raw = env('GOOGLE_PLAY_SERVICE_ACCOUNT')
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

export function isPlayConfigured(): boolean {
  return readServiceAccount() !== null
}

let cachedToken: { value: string; expiresAt: number } | null = null

// OAuth 2.0 para contas de serviço (JWT bearer, RS256) — só node:crypto.
async function getAccessToken(account: ServiceAccount): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value
  const tokenUri = account.token_uri || 'https://oauth2.googleapis.com/token'
  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const claims = Buffer.from(JSON.stringify({ iss: account.client_email, scope: SCOPE, aud: tokenUri, iat: now, exp: now + 3600 })).toString('base64url')
  const signature = createSign('RSA-SHA256').update(`${header}.${claims}`).sign(account.private_key)
  const res = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${header}.${claims}.${signature.toString('base64url')}` }),
  })
  if (!res.ok) throw new Error(`OAuth ${res.status}`)
  const data = (await res.json()) as { access_token: string; expires_in?: number }
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 }
  return data.access_token
}

export class PlayApiError extends Error {
  constructor(public status: number, detail: string) {
    super(`Google Play API ${status}: ${detail}`)
  }
}

async function playFetch<T = any>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const account = readServiceAccount()
  if (!account) {
    throw createError({ statusCode: 503, message: 'Google Play is not configured', data: { error: 'play_not_configured' } })
  }
  const token = await getAccessToken(account)
  const res = await fetch(`${apiBase()}/androidpublisher/v3/applications/${encodeURIComponent(playPackageName())}${path}`, {
    method: init.method || 'GET',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })
  if (!res.ok) throw new PlayApiError(res.status, (await res.text().catch(() => '')).slice(0, 300))
  const text = await res.text()
  return (text ? JSON.parse(text) : {}) as T
}

// ── Recurso da Google (purchases.subscriptionsv2) ───────────────────────────
export interface PlayLineItem {
  productId?: string
  expiryTime?: string
  autoRenewingPlan?: { autoRenewEnabled?: boolean }
  prepaidPlan?: { allowExtendAfterTime?: string }
  offerDetails?: { basePlanId?: string; offerId?: string }
}

export interface PlaySubscriptionResource {
  subscriptionState?: string
  acknowledgementState?: string
  latestOrderId?: string
  linkedPurchaseToken?: string
  lineItems?: PlayLineItem[]
  externalAccountIdentifiers?: { obfuscatedExternalAccountId?: string }
  testPurchase?: object
}

const enc = encodeURIComponent

export function getPlaySubscription(token: string): Promise<PlaySubscriptionResource> {
  return playFetch(`/purchases/subscriptionsv2/tokens/${enc(token)}`)
}

async function acknowledgePlaySubscription(productId: string, token: string): Promise<void> {
  await playFetch(`/purchases/subscriptions/${enc(productId)}/tokens/${enc(token)}:acknowledge`, { method: 'POST', body: {} })
}

// Conta apagada: pára as cobranças seguintes (não pode ser retomada). O
// acesso já pago termina sozinho — a conta deixou de existir.
export async function cancelPlaySubscription(token: string): Promise<void> {
  await playFetch(`/purchases/subscriptionsv2/tokens/${enc(token)}:cancel`, {
    method: 'POST',
    body: { cancellationContext: { cancellationType: 'DEVELOPER_REQUESTED_STOP_PAYMENTS' } },
  })
}

// Reembolso total da última cobrança + fim imediato do acesso (livre
// resolução, ou compra que não devia ter acontecido).
export async function revokePlaySubscription(token: string): Promise<void> {
  await playFetch(`/purchases/subscriptionsv2/tokens/${enc(token)}:revoke`, {
    method: 'POST',
    body: { revocationContext: { fullRefund: {} } },
  })
}

// ── Conta ↔ compra ──────────────────────────────────────────────────────────
// `obfuscatedAccountId` enviado à Google em cada compra: HMAC do id da conta
// (64 caracteres hex, o máximo que a Google aceita), nunca o email.
export function playAccountIdFor(userId: string): string {
  const secret = env('SESSION_SECRET') || useRuntimeConfig().sessionSecret
  if (!secret) throw createError({ statusCode: 500, message: 'Servidor mal configurado (SESSION_SECRET em falta)' })
  return createHmac('sha256', secret).update(`play-account:${userId}`).digest('hex')
}

export async function ensurePlayAccountId(userId: string): Promise<string> {
  const accountId = playAccountIdFor(userId)
  await User.updateOne({ _id: userId, playAccountId: { $ne: accountId } }, { $set: { playAccountId: accountId } })
  return accountId
}

// ── Estado da Google → subscrição da conta ──────────────────────────────────
const STATUS_BY_STATE: Record<string, IUserSubscription['status']> = {
  SUBSCRIPTION_STATE_ACTIVE: 'active',
  // Pagamento da renovação falhou mas a Google mantém o acesso enquanto tenta.
  SUBSCRIPTION_STATE_IN_GRACE_PERIOD: 'active',
  // Renovação desligada: acesso até ao fim do período (effectiveTier).
  SUBSCRIPTION_STATE_CANCELED: 'canceled',
  SUBSCRIPTION_STATE_ON_HOLD: 'past_due',
  SUBSCRIPTION_STATE_PAUSED: 'past_due',
  // Pagamento ainda por concluir (ex. dinheiro numa loja): sem acesso.
  SUBSCRIPTION_STATE_PENDING: 'pending',
  SUBSCRIPTION_STATE_EXPIRED: 'expired',
  SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED: 'expired',
}

const TIER_RANK: Record<PaidTier, number> = { pro: 1, premium: 2 }
const expiryMs = (item: PlayLineItem) => (item.expiryTime ? new Date(item.expiryTime).getTime() : 0)

// Numa descida de plano diferida (Premium → Pro na renovação), a compra traz
// o item antigo (até ao fim do período) e o novo (a seguir). Vale o melhor
// plano ainda dentro do prazo.
function currentLineItem(resource: PlaySubscriptionResource, now = Date.now()): PlayLineItem | null {
  const items = (resource.lineItems || []).filter((i) => tierForPlayProduct(i.productId))
  const live = items.filter((i) => expiryMs(i) > now)
  const pool = live.length ? live : items
  return (
    [...pool].sort(
      (a, b) => TIER_RANK[tierForPlayProduct(b.productId)!] - TIER_RANK[tierForPlayProduct(a.productId)!] || expiryMs(b) - expiryMs(a)
    )[0] || null
  )
}

export function subscriptionFromPlay(
  token: string,
  resource: PlaySubscriptionResource,
  previous?: Partial<IUserSubscription> | null
): IUserSubscription | null {
  const item = currentLineItem(resource)
  const tier = item ? tierForPlayProduct(item.productId) : null
  if (!item || !tier) return null
  const status = STATUS_BY_STATE[resource.subscriptionState || ''] || 'expired'
  return {
    tier,
    status,
    provider: 'google_play',
    paymentMethod: 'google_play',
    billingMode: 'google_play',
    autoRenew: !!item.autoRenewingPlan && item.autoRenewingPlan.autoRenewEnabled !== false && status === 'active',
    currentPeriodEnd: item.expiryTime ? new Date(item.expiryTime) : null,
    googlePlayPurchaseToken: token,
    googlePlayProductId: item.productId,
    googlePlayBasePlanId: item.offerDetails?.basePlanId,
    googlePlayOrderId: resource.latestOrderId,
    googlePlayAllowExtendAfter: item.prepaidPlan?.allowExtendAfterTime ? new Date(item.prepaidPlan.allowExtendAfterTime) : null,
    googlePlayAckPending: false,
    reminderSentAt: null,
    appliedPaymentIds: previous?.appliedPaymentIds || [],
  }
}

function isLive(sub: Partial<IUserSubscription> | null | undefined): boolean {
  return effectiveTier(sub as any) !== 'free'
}

// Subscrição EasyPay (web) que ainda dá acesso — a Google Play não pode
// vender por cima dela (decisão 7 da especificação).
export function hasLiveWebSubscription(sub: Partial<IUserSubscription> | null | undefined): boolean {
  return sub?.provider === 'easypay' && isLive(sub)
}

export type PlaySyncOutcome = 'applied' | 'pending' | 'ignored_stale' | 'unknown_user' | 'web_conflict' | 'token_conflict' | 'invalid_product'

// Aplica o estado de uma compra à conta. `userId` só no caminho da app
// (verify): aí a compra TEM de ter sido feita por essa conta.
export async function syncPlayPurchase(
  token: string,
  opts: { source: string; userId?: string; resource?: PlaySubscriptionResource }
): Promise<{ outcome: PlaySyncOutcome; subscription?: IUserSubscription }> {
  const resource = opts.resource || (await getPlaySubscription(token))
  const accountId = resource.externalAccountIdentifiers?.obfuscatedExternalAccountId

  let user
  if (opts.userId) {
    if (!accountId || accountId !== playAccountIdFor(opts.userId)) {
      logEvent('warn', 'google_play.account_mismatch', { source: opts.source })
      throw createError({ statusCode: 403, message: 'Forbidden', data: { error: 'play_account_mismatch' } })
    }
    user = await User.findById(opts.userId)
  } else {
    user =
      (await User.findOne({ 'subscription.googlePlayPurchaseToken': token })) ||
      (resource.linkedPurchaseToken ? await User.findOne({ 'subscription.googlePlayPurchaseToken': resource.linkedPurchaseToken }) : null) ||
      (accountId ? await User.findOne({ playAccountId: accountId }) : null)
  }
  if (!user) {
    logEvent('warn', 'google_play.unknown_user', { source: opts.source })
    return { outcome: 'unknown_user' }
  }

  const next = subscriptionFromPlay(token, resource, user.subscription)
  if (!next) {
    logEvent('error', 'google_play.unknown_product', { source: opts.source, products: (resource.lineItems || []).map((i) => i.productId) })
    return { outcome: 'invalid_product' }
  }

  // Uma compra pertence a uma só conta.
  const owner = await User.exists({ 'subscription.googlePlayPurchaseToken': token, _id: { $ne: user._id } })
  if (owner) {
    logEvent('error', 'google_play.token_conflict', { source: opts.source })
    return { outcome: 'token_conflict' }
  }

  // Notificação de uma compra anterior (ex. a subscrição substituída numa
  // mudança de plano a expirar): não pode tapar a atual.
  const current = user.subscription
  const currentToken = current?.billingMode === 'google_play' ? current.googlePlayPurchaseToken : undefined
  if (currentToken && currentToken !== token && resource.linkedPurchaseToken !== currentToken) {
    const replaces = isLive(next) && (!isLive(current) || TIER_RANK[next.tier as PaidTier] >= TIER_RANK[current.tier as PaidTier])
    if (!replaces) return { outcome: 'ignored_stale' }
  }

  if (isLive(next) && hasLiveWebSubscription(current)) {
    // A app não mostra a compra nestes casos; se acontecer na mesma, a pessoa
    // não pode pagar duas vezes pelo mesmo plano.
    try {
      await revokePlaySubscription(token)
    } catch (e: any) {
      logEvent('error', 'google_play.revoke_failed', { source: opts.source, message: String(e?.message || e).slice(0, 200) })
    }
    logEvent('warn', 'google_play.web_conflict_revoked', { source: opts.source })
    return { outcome: 'web_conflict' }
  }

  if (resource.acknowledgementState === 'ACKNOWLEDGEMENT_STATE_PENDING' && next.status !== 'pending') {
    try {
      await acknowledgePlaySubscription(next.googlePlayProductId!, token)
    } catch (e: any) {
      next.googlePlayAckPending = true
      logEvent('error', 'google_play.ack_failed', { source: opts.source, message: String(e?.message || e).slice(0, 200) })
    }
  }

  user.subscription = next
  await user.save()
  logEvent('info', 'google_play.synced', { source: opts.source, tier: next.tier, status: next.status, test: !!resource.testPurchase })
  return { outcome: next.status === 'pending' ? 'pending' : 'applied', subscription: next }
}

// Reembolso ou estorno (voidedPurchaseNotification): o acesso acaba já.
export async function voidPlayPurchase(token: string): Promise<boolean> {
  const user = await User.findOne({ 'subscription.googlePlayPurchaseToken': token })
  if (!user) return false
  user.subscription.status = 'expired'
  user.subscription.autoRenew = false
  user.subscription.currentPeriodEnd = new Date()
  await user.save()
  logEvent('warn', 'google_play.voided', {})
  return true
}

// ── Notificações em tempo real (Pub/Sub push com token OIDC) ────────────────
let cachedCerts: { keys: Record<string, any>[]; expiresAt: number } | null = null

async function googleCerts(): Promise<Record<string, any>[]> {
  if (cachedCerts && cachedCerts.expiresAt > Date.now()) return cachedCerts.keys
  const res = await fetch(env('GOOGLE_OIDC_CERTS_URL') || 'https://www.googleapis.com/oauth2/v3/certs')
  if (!res.ok) throw new Error(`certs ${res.status}`)
  const data = (await res.json()) as { keys: Record<string, any>[] }
  cachedCerts = { keys: data.keys || [], expiresAt: Date.now() + 60 * 60 * 1000 }
  return cachedCerts.keys
}

// O Pub/Sub assina cada push com um token OIDC da Google. Aceita só tokens
// válidos, para a audiência configurada e (se definida) da conta de serviço
// do push — sem isto qualquer pessoa podia forjar notificações.
export async function verifyPubSubToken(authorization: string | undefined): Promise<boolean> {
  const audience = env('GOOGLE_PLAY_RTDN_AUDIENCE')
  if (!audience) {
    logEvent('error', 'google_play.rtdn_not_configured')
    return false
  }
  const jwt = authorization?.startsWith('Bearer ') ? authorization.slice(7) : ''
  const [h, p, s] = jwt.split('.')
  if (!h || !p || !s) return false
  try {
    const header = JSON.parse(Buffer.from(h, 'base64url').toString('utf8'))
    const payload = JSON.parse(Buffer.from(p, 'base64url').toString('utf8'))
    if (header.alg !== 'RS256') return false
    const jwk = (await googleCerts()).find((k) => k.kid === header.kid)
    if (!jwk) return false
    const ok = cryptoVerify('RSA-SHA256', Buffer.from(`${h}.${p}`), createPublicKey({ key: jwk as any, format: 'jwk' }), Buffer.from(s, 'base64url'))
    if (!ok) return false
    if (!['https://accounts.google.com', 'accounts.google.com'].includes(payload.iss)) return false
    if (payload.aud !== audience) return false
    if (!payload.exp || payload.exp * 1000 < Date.now()) return false
    const pushAccount = env('GOOGLE_PLAY_RTDN_SERVICE_ACCOUNT')
    if (pushAccount && (payload.email !== pushAccount || payload.email_verified !== true)) return false
    return true
  } catch {
    return false
  }
}

export interface RtdnNotification {
  packageName?: string
  subscriptionNotification?: { notificationType?: number; purchaseToken?: string }
  voidedPurchaseNotification?: { purchaseToken?: string }
  testNotification?: object
}

export async function handleRtdn(notification: RtdnNotification): Promise<string> {
  if (notification.packageName && notification.packageName !== playPackageName()) return 'other_package'
  if (notification.testNotification) {
    logEvent('info', 'google_play.rtdn_test')
    return 'test'
  }
  const voided = notification.voidedPurchaseNotification?.purchaseToken
  if (voided) return (await voidPlayPurchase(voided)) ? 'voided' : 'unknown_user'
  const token = notification.subscriptionNotification?.purchaseToken
  if (token) return (await syncPlayPurchase(token, { source: 'rtdn' })).outcome
  return 'ignored'
}

// ── Rede de segurança: reconciliação (cron) e leitura sob pedido ────────────
// Subscrições Play a expirar nas próximas 48 h (ou já expiradas sem
// notificação) e confirmações à Google em falta.
export async function reconcilePlaySubscriptions(): Promise<{ checked: number; failed: number }> {
  const soon = new Date(Date.now() + 48 * 60 * 60 * 1000)
  const users = await User.find({
    'subscription.billingMode': 'google_play',
    'subscription.googlePlayPurchaseToken': { $exists: true },
    $or: [
      { 'subscription.status': { $in: ['active', 'canceled', 'past_due', 'pending'] }, 'subscription.currentPeriodEnd': { $lt: soon } },
      { 'subscription.status': 'pending' },
      { 'subscription.googlePlayAckPending': true },
    ],
  })
    .select('subscription.googlePlayPurchaseToken')
    .limit(200)
    .lean<{ subscription: { googlePlayPurchaseToken: string } }[]>()

  let failed = 0
  for (const u of users) {
    try {
      await syncPlayPurchase(u.subscription.googlePlayPurchaseToken, { source: 'reconcile' })
    } catch (e: any) {
      failed += 1
      logEvent('error', 'google_play.reconcile_failed', { message: String(e?.message || e).slice(0, 200) })
    }
  }
  if (failed) logEvent('error', 'google_play.reconcile_summary', { checked: users.length, failed })
  return { checked: users.length, failed }
}

// GET /api/subscription: período da Google já passado mas ainda "ativo" cá —
// a renovação pode ter acontecido sem a notificação ter chegado.
export async function refreshPlayIfStale(sub: Partial<IUserSubscription> | null | undefined): Promise<boolean> {
  if (sub?.billingMode !== 'google_play' || !sub.googlePlayPurchaseToken) return false
  if (!['active', 'canceled', 'past_due'].includes(sub.status || '')) return false
  const end = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).getTime() : 0
  if (end > Date.now()) return false
  try {
    await syncPlayPurchase(sub.googlePlayPurchaseToken, { source: 'refresh' })
    return true
  } catch (e: any) {
    logEvent('warn', 'google_play.refresh_failed', { message: String(e?.message || e).slice(0, 200) })
    return false
  }
}
