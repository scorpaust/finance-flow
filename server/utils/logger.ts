import { createHash } from 'node:crypto'
import type { H3Event } from 'h3'
import { getClientIp } from './clientIp'

// Fase 8, ponto 8 — logging estruturado (uma linha JSON por evento) dos eventos
// críticos: falhas de pagamento, falhas de webhook, erros de autenticação. É
// o que um agregador (Sentry, Loki, o log do Docker) consegue filtrar por
// `event`. Regras de privacidade: NUNCA passwords, códigos, tokens nem corpos
// de pedidos; emails só como hash curto (correlaciona tentativas contra a
// mesma conta sem guardar a morada).
type Level = 'info' | 'warn' | 'error'

export function hashIdentifier(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex').slice(0, 12)
}

export function logEvent(level: Level, eventName: string, data: Record<string, unknown> = {}, h3?: H3Event): void {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event: eventName,
    ip: h3 ? getClientIp(h3) : undefined,
    ...data,
  })
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}
