// Wrapper fino sobre a Messages API da Anthropic — chamado só a partir do
// servidor (a chave nunca chega ao client). Modelo fixo `claude-haiku-4-5`,
// o mais barato da Anthropic, suficiente para gerar JSON estruturado a partir
// de agregados já calculados. Ver context/features/03-FASE-3-insights-ia.md
// tarefa 1. Requer ANTHROPIC_API_KEY em runtimeConfig.
//
// Usa fetch nativo em vez do SDK (consistente com server/utils/paypal.ts),
// contra o endpoint beta de structured outputs — parâmetros confirmados via
// Context7 (@anthropic-ai/sdk-typescript, helpers.md): `output_config.format`
// do tipo `{ type: 'json_schema', schema }` e header
// `anthropic-beta: structured-outputs-2025-12-15` em `/v1/messages?beta=true`.

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages?beta=true'
const ANTHROPIC_VERSION = '2023-06-01'
const STRUCTURED_OUTPUTS_BETA = 'structured-outputs-2025-12-15'
const MODEL = 'claude-haiku-4-5'

interface JsonSchema {
  type: 'object'
  properties: Record<string, unknown>
  required: string[]
}

export async function generateStructuredJson<T>(opts: {
  system: string
  prompt: string
  schema: JsonSchema
  maxTokens?: number
}): Promise<T> {
  const config = useRuntimeConfig()
  if (!config.anthropicApiKey) {
    throw createError({
      statusCode: 500,
      message: 'Anthropic não configurado (ANTHROPIC_API_KEY em falta)',
    })
  }

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': config.anthropicApiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'anthropic-beta': STRUCTURED_OUTPUTS_BETA,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: opts.maxTokens || 1024,
      system: opts.system,
      messages: [{ role: 'user', content: opts.prompt }],
      output_config: {
        format: { type: 'json_schema', schema: { ...opts.schema, additionalProperties: false } },
      },
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw createError({ statusCode: 502, message: `Erro Anthropic (${res.status}): ${detail.slice(0, 500)}` })
  }

  const data = (await res.json()) as { content: { type: string; text?: string }[] }
  const textBlock = data.content?.find((b) => b.type === 'text')
  if (!textBlock?.text) {
    throw createError({ statusCode: 502, message: 'Resposta da Anthropic sem conteúdo de texto' })
  }

  try {
    return JSON.parse(textBlock.text) as T
  } catch {
    throw createError({ statusCode: 502, message: 'Resposta da Anthropic não é JSON válido' })
  }
}
