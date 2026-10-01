// Métodos de pagamento PRÉ-PAGOS (`push_confirm`/`manual_reference`, ver
// Fase 2) — MB WAY e Multibanco. Usado tanto no client (separador de
// pagamento) como no server (`create-prepaid.post.ts`, nunca confiar só na UI).
//
// Fase 9 (2026-10-01) — disponíveis em TODOS os países (antes: só a quem a
// geolocalização dava como estando em Portugal). Dois motivos, decididos pelo
// utilizador: (1) os emigrantes portugueses (Suíça, França, Reino Unido, EUA,
// Brasil…) pagam com MB WAY/Multibanco através da conta num banco português,
// estejam onde estiverem; (2) o Regulamento (UE) 2018/302 (bloqueio
// geográfico), art. 5.º, proíbe recusar um meio de pagamento aceite por causa
// da residência/localização do cliente. Quem não tiver conta portuguesa
// simplesmente não os usa — cartão/débito direto continuam lá para todos.
// O país (geolocalização) continua a ser usado noutros sítios, ex. o país
// fiscal no reporte à Google Play (server/utils/googlePlayBilling.ts).
export type PrepaidMethod = 'mbway' | 'multibanco'

const PREPAID_METHODS: PrepaidMethod[] = ['mbway', 'multibanco']

// O parâmetro do país fica para não mudar quem chama — já não restringe nada.
export function prepaidMethodsForCountry(_countryCode?: string | null): PrepaidMethod[] {
  return [...PREPAID_METHODS]
}
