// Fase 7 — tabela país → métodos de pagamento PRÉ-PAGOS disponíveis
// (`push_confirm`/`manual_reference`, ver Fase 2). Usado tanto no client
// (esconder o separador quando o país não tem nenhum) como no server
// (`create-prepaid.post.ts`, nunca confiar só na UI). Deliberadamente
// limitado a Portugal nesta fase (decisão de arquitetura 5 da especificação)
// — qualquer país fora desta tabela cai no fallback universal de
// auto-renovação (Cartão/Débito Direto, `billingMode: 'auto'`), que nunca
// depende do país.
export type PrepaidMethod = 'mbway' | 'multibanco'

const PREPAID_METHODS_BY_COUNTRY: Record<string, PrepaidMethod[]> = {
  PT: ['mbway', 'multibanco'],
}

// País `null`/desconhecido (geolocalização não configurada ou IP não
// encontrado) é tratado como "sem métodos pré-pagos locais" — nunca
// assumido como Portugal.
export function prepaidMethodsForCountry(countryCode: string | null | undefined): PrepaidMethod[] {
  if (!countryCode) return []
  return PREPAID_METHODS_BY_COUNTRY[countryCode.toUpperCase()] || []
}

export function isPrepaidMethodAvailable(countryCode: string | null | undefined, method: string): boolean {
  return prepaidMethodsForCountry(countryCode).includes(method as PrepaidMethod)
}
