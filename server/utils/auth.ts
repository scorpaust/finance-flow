import { H3Event } from 'h3'

export async function requireAuth(event: H3Event): Promise<string> {
  const userId = getCookie(event, 'userId') || getHeader(event, 'x-user-id')
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
