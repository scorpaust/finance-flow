import { H3Event } from 'h3'
import { readValidSession } from './session'

// Fase 8, ponto 2 — a sessão passa a ser um cookie assinado (server/utils/session.ts);
// o header `x-user-id` (aceite em claro, sem qualquer verificação) foi removido
// por completo. Quem conhecer um `_id` de outro utilizador já não consegue agir
// como ele só por o enviar num header ou cookie forjado.
//
// Upgrade 05 — confirma também a versão da sessão: depois de mudar ou recuperar
// a password, as sessões antigas recebem 401.
export async function requireAuth(event: H3Event): Promise<string> {
  const userId = await readValidSession(event)
  if (!userId) {
    throw createError({ statusCode: 401, message: 'Unauthorized — please sign in' })
  }
  return userId
}

export function sanitizeId(id: string): string {
  if (!id?.match(/^[0-9a-fA-F]{24}$/)) {
    throw createError({ statusCode: 400, message: 'Invalid ID format' })
  }
  return id
}
