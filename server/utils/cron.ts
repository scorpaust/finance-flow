import { createHash, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

// Fase 8 — os endpoints de cron (`x-cron-secret`) comparavam o segredo com `!==`,
// que termina no primeiro carácter diferente (vazamento por tempo de resposta).
// Compara os hashes SHA-256 (tamanho fixo) em tempo constante.
export function requireCronSecret(event: H3Event): void {
  const expected = useRuntimeConfig().cronSecret
  const provided = getHeader(event, 'x-cron-secret') || ''
  if (!expected) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const a = createHash('sha256').update(provided).digest()
  const b = createHash('sha256').update(expected).digest()
  if (!timingSafeEqual(a, b)) throw createError({ statusCode: 401, message: 'Unauthorized' })
}
