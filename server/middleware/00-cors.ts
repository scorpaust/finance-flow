// Fase 8, ponto 2 — CORS explícito para /api/**. Sem nenhum cabeçalho
// Access-Control-Allow-Origin, o browser já bloqueia por omissão a leitura
// cross-origin das respostas (Same-Origin Policy) — este middleware é sobretudo
// uma decisão documentada e um ponto único de configuração para o caso de vir
// a existir um domínio separado a consumir esta API (ex. staging). Nunca
// reflete a origem do pedido nem usa `*`: só as origens explicitamente
// listadas em CORS_ALLOWED_ORIGINS (ou APP_URL, por omissão) recebem o
// cabeçalho — importante porque os pedidos viajam com cookies de sessão
// (`credentials`).
const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || process.env.APP_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/')) return

  const origin = getRequestHeader(event, 'origin')
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    setResponseHeader(event, 'Access-Control-Allow-Origin', origin)
    setResponseHeader(event, 'Access-Control-Allow-Credentials', 'true')
    setResponseHeader(event, 'Vary', 'Origin')
  }

  if (getMethod(event) === 'OPTIONS') {
    setResponseHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    setResponseHeader(event, 'Access-Control-Allow-Headers', 'Content-Type')
    setResponseStatus(event, 204)
    return ''
  }
})
