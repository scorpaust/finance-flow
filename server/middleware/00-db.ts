import { ensureDb } from '../utils/db'

// Garante a ligação ao MongoDB antes de qualquer rota /api (ver server/utils/db.ts).
// Depois da primeira ligação é só uma verificação de readyState.
export default defineEventHandler(async (event) => {
  if (getRequestURL(event).pathname.startsWith('/api/')) {
    await ensureDb()
  }
})
