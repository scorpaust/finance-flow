import type { H3Event } from 'h3'

// IP real do cliente, para rate limiting, logs e geolocalização. Nunca o
// PRIMEIRO valor de `x-forwarded-for`: esse é o que o cliente enviou, e rodá-lo
// a cada pedido contornava por completo os limites por IP (e escolhia o país
// dos métodos de pagamento). Por ordem:
//   1. `x-nf-client-connection-ip` — definido pelo Netlify (deploy de
//      produção), que substitui qualquer valor vindo do cliente;
//   2. o ÚLTIMO valor de `x-forwarded-for` — o acrescentado pelo proxy
//      imediatamente à frente da app;
//   3. o IP direto da ligação (dev local, sem proxy).
export function getClientIp(event: H3Event): string | undefined {
  const netlify = getRequestHeader(event, 'x-nf-client-connection-ip')
  if (netlify) return netlify.trim()

  const forwarded = getRequestHeader(event, 'x-forwarded-for')
  if (forwarded) {
    const hops = forwarded.split(',').map((h) => h.trim()).filter(Boolean)
    if (hops.length) return hops[hops.length - 1]
  }

  return event.node.req.socket?.remoteAddress || undefined
}
