import type { H3Event } from 'h3'
import { RateLimitBucket } from '../models'
import { getClientIp } from './clientIp'
import { getServerLocale, serverT } from './i18n'
import { hashIdentifier, logEvent } from './logger'

// Rate limiting (Fase 8, ponto 1) com o contador no MongoDB. Antes era um Map
// em memória, pensado para um único processo node-server — mas o deploy real
// é serverless (Netlify, ver nuxt.config.ts): cada instância tinha o seu
// próprio contador e o limite do login/2FA ficava praticamente sem efeito.
// Janela fixa por chave; o índice TTL em `expiresAt` apaga os contadores
// expirados sozinho.

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
   * limite por IP. Guardada só como hash (pode ser um email).
   */
  identity?: string
}

// Os índices não são criados ao arrancar (`bufferCommands: false`, ver
// scripts/sync-indexes.mjs) — sem o TTL a coleção crescia para sempre.
let ttlIndexReady: Promise<unknown> | null = null
function ensureTtlIndex(): Promise<unknown> {
  if (!ttlIndexReady) {
    ttlIndexReady = RateLimitBucket.createIndexes().catch((e) => {
      ttlIndexReady = null
      logEvent('error', 'rate_limit.index_failed', { message: String(e?.message || e) })
    })
  }
  return ttlIndexReady
}

async function hit(key: string, windowMs: number): Promise<{ count: number; expiresAt: Date }> {
  const now = new Date()
  const live = { $gt: ['$expiresAt', now] }
  // Um só pedido atómico: incrementa dentro da janela, ou recomeça-a.
  const update = [
    {
      $set: {
        count: { $cond: [live, { $add: ['$count', 1] }, 1] },
        expiresAt: { $cond: [live, '$expiresAt', new Date(now.getTime() + windowMs)] },
      },
    },
  ]
  try {
    return (await RateLimitBucket.findOneAndUpdate({ _id: key }, update, { upsert: true, new: true }).lean())!
  } catch (e: any) {
    // Dois upserts simultâneos da mesma chave nova: o perdedor recebe E11000 —
    // o documento já existe, basta repetir.
    if (e?.code !== 11000) throw e
    return (await RateLimitBucket.findOneAndUpdate({ _id: key }, update, { new: true }).lean())!
  }
}

// Lança 429 se o limite for excedido; caso contrário incrementa e deixa seguir.
export async function enforceRateLimit(event: H3Event, opts: RateLimitOptions): Promise<void> {
  void ensureTtlIndex()
  const ip = getClientIp(event) || 'unknown'
  const key = `${opts.name}:${ip}${opts.identity ? `:${hashIdentifier(opts.identity)}` : ''}`

  const bucket = await hit(key, opts.windowSeconds * 1000)
  if (bucket.count > opts.limit) {
    const locale = getServerLocale(event)
    logEvent('warn', 'security.rate_limited', { limiter: opts.name }, event)
    throw createError({
      statusCode: 429,
      message: serverT(locale, 'rateLimit.tooManyAttempts'),
      data: {
        error: 'rate_limited',
        retryAfterSeconds: Math.max(1, Math.ceil((new Date(bucket.expiresAt).getTime() - Date.now()) / 1000)),
      },
    })
  }
}
