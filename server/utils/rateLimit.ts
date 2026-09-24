import type { H3Event } from 'h3'
import { getServerLocale, serverT } from './i18n'
import { logEvent } from './logger'

// Rate limiting em memória (Fase 8, ponto 1) — suficiente para este projeto:
// produção corre num único processo node-server em Docker (decisão da Fase 1),
// sem múltiplas instâncias atrás de um load balancer, por isso não há partilha
// de estado entre processos a garantir. Se isso mudar no futuro, isto precisa
// de passar para um store partilhado (Redis, Mongo com TTL index, etc.).
interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// Evita crescimento indefinido do Map num processo de longa duração.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000
const cleanupTimer = setInterval(() => {
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}, CLEANUP_INTERVAL_MS)
cleanupTimer.unref?.()

function clientIp(event: H3Event): string {
  const forwarded = getRequestHeader(event, 'x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return event.node.req.socket.remoteAddress || 'unknown'
}

export interface RateLimitOptions {
  /** Nome do endpoint/ação — parte da chave, para não partilhar contador entre limites diferentes. */
  name: string
  /** Nº máximo de pedidos dentro da janela. */
  limit: number
  /** Duração da janela, em segundos (janela fixa, não deslizante — suficiente para este caso de uso). */
  windowSeconds: number
  /**
   * Identidade a limitar, além do IP (ex. email/userId) — combina os dois
   * quando presente, para não deixar um único IP esgotar a tentativa de todas
   * as contas, nem uma conta ser atacada a partir de muitos IPs sem qualquer
   * limite por IP.
   */
  identity?: string
}

// Lança 429 se o limite for excedido; caso contrário incrementa e deixa seguir.
export function enforceRateLimit(event: H3Event, opts: RateLimitOptions): void {
  const ip = clientIp(event)
  const key = `${opts.name}:${ip}${opts.identity ? `:${opts.identity}` : ''}`
  const now = Date.now()

  let bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + opts.windowSeconds * 1000 }
    buckets.set(key, bucket)
  }

  bucket.count += 1
  if (bucket.count > opts.limit) {
    const locale = getServerLocale(event)
    logEvent('warn', 'security.rate_limited', { limiter: opts.name }, event)
    throw createError({
      statusCode: 429,
      message: serverT(locale, 'rateLimit.tooManyAttempts'),
      data: { error: 'rate_limited', retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) },
    })
  }
}
