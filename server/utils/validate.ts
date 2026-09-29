import type { H3Event } from 'h3'
import { z } from 'zod'
import { getServerLocale, serverT } from './i18n'

// Helper fino sobre `readValidatedBody`/`getValidatedQuery` do h3 (Fase 8,
// ponto 1) — converte um `ZodError` num 400 com uma mensagem legível, em vez
// de deixar a exceção do Zod (ou um erro genérico de parsing) chegar ao
// client tal como está. A mensagem lista o(s) campo(s) em causa, não é um
// dump da estrutura interna do erro — não há nada sensível num erro de
// validação do nosso próprio schema, ao contrário dos erros de fornecedores
// externos (ver server/utils/anthropic.ts).
//
// Se a mensagem do issue Zod for uma chave de `server/utils/i18n.ts` (ex.
// `schema.message: 'auth.passwordTooShort'`), é traduzida para o locale do
// pedido; caso contrário `serverT` devolve a própria chave inalterada
// (dicionário sem essa entrada), por isso passa sempre por aqui sem risco —
// schemas que só querem uma mensagem genérica em inglês não precisam de
// nenhuma entrada no dicionário.
function formatZodMessage(event: H3Event, error: z.ZodError): string {
  const first = error.issues[0]
  if (!first) return 'Invalid request'
  return serverT(getServerLocale(event), first.message)
}

export async function validateBody<T extends z.ZodTypeAny>(event: H3Event, schema: T): Promise<z.infer<T>> {
  return readValidatedBody(event, (body) => {
    const result = schema.safeParse(body)
    if (!result.success) {
      throw createError({ statusCode: 400, message: formatZodMessage(event, result.error), data: { error: 'validation_error' } })
    }
    return result.data
  })
}

export async function validateQuery<T extends z.ZodTypeAny>(event: H3Event, schema: T): Promise<z.infer<T>> {
  return getValidatedQuery(event, (query) => {
    const result = schema.safeParse(query)
    if (!result.success) {
      throw createError({ statusCode: 400, message: formatZodMessage(event, result.error), data: { error: 'validation_error' } })
    }
    return result.data
  })
}
