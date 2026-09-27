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

// Fase 8, ponto 9 — endpoints de administração acionados manualmente pelo
// operador (nunca por um cron nem por um utilizador), ex.
// server/api/admin/refund-delete.post.ts. Segredo separado do `cronSecret`
// de propósito: privilégio mínimo — uma fuga do segredo do cron (partilhado
// com um serviço externo de agendamento) não devia também dar acesso a isto.
export function requireAdminSecret(event: H3Event): void {
  const expected = useRuntimeConfig().adminSecret
  const provided = getHeader(event, 'x-admin-secret') || ''
  if (!expected) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const a = createHash('sha256').update(provided).digest()
  const b = createHash('sha256').update(expected).digest()
  if (!timingSafeEqual(a, b)) throw createError({ statusCode: 401, message: 'Unauthorized' })
}
