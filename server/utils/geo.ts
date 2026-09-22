// Fase 7 — Geolocalização por IP (server-side), só para decidir que métodos
// de pagamento pré-pagos mostrar/aceitar (ver shared/paymentMethods.ts).
// Nunca usado para decidir o idioma da UI (essa preferência vem do browser,
// ver nuxt.config.ts → i18n.detectBrowserLanguage).
//
// Base de dados: MaxMind GeoLite2-Country (licenciada, gratuita com registo).
// Não está incluída no repositório — processo de obtenção/atualização:
//   1. Criar conta gratuita em https://www.maxmind.com/en/geolite2/signup
//   2. Gerar uma licence key em Account → My License Keys
//   3. Descarregar o ficheiro GeoLite2-Country.mmdb (formato "GeoIP2 Binary")
//      manualmente ou com o `geoipupdate` oficial da MaxMind
//   4. Guardar o ficheiro fora do repositório (ex. /var/lib/geoip/ em
//      produção) e apontar `GEOLITE2_DB_PATH` para o caminho completo
//   5. A MaxMind atualiza a base de dados semanalmente; `geoipupdate` corrido
//      por um cron mensal (ex. dia 1) é suficiente para este caso de uso —
//      não é dado sensível a tempo real, só a lista de rails bancários por
//      país, que muda com pouquíssima frequência
//
// Sem `GEOLITE2_DB_PATH` configurado (dev local, ou antes de a base estar
// instalada em produção), `lookupCountry()` devolve sempre `null` — o
// chamador (shared/paymentMethods.ts) trata país desconhecido como "sem
// métodos pré-pagos locais", o mesmo que qualquer país fora de Portugal.
import { Reader, AddressNotFoundError, ValueError } from '@maxmind/geoip2-node'
import type { ReaderModel, Country } from '@maxmind/geoip2-node'
import type { H3Event } from 'h3'

let readerPromise: Promise<ReaderModel | null> | null = null

function getReader(): Promise<ReaderModel | null> {
  if (readerPromise) return readerPromise

  const dbPath = useRuntimeConfig().geoliteDbPath
  if (!dbPath) {
    readerPromise = Promise.resolve(null)
    return readerPromise
  }

  readerPromise = Reader.open(dbPath).catch((error) => {
    console.error('[geo] Falha a abrir GeoLite2-Country.mmdb em', dbPath, error)
    return null
  })
  return readerPromise
}

// Devolve o código de país ISO 3166-1 alpha-2 (ex. "PT") para um IP, ou
// `null` se a base de dados não estiver configurada, o IP não constar dela
// (redes privadas/reservadas, ex. em dev local) ou for inválido.
export async function lookupCountry(ip: string | undefined | null): Promise<string | null> {
  if (!ip) return null

  const reader = await getReader()
  if (!reader) return null

  try {
    const response: Country = reader.country(ip)
    return response.country?.isoCode || null
  } catch (error) {
    if (error instanceof AddressNotFoundError || error instanceof ValueError) return null
    console.error('[geo] Erro inesperado no lookup de', ip, error)
    return null
  }
}

// `x-forwarded-for` pode trazer uma lista "cliente, proxy1, proxy2" — o
// primeiro é o IP original do pedido. Sem proxy à frente (dev local), cai no
// IP direto da ligação.
export function getRequestIp(event: H3Event): string | undefined {
  const forwarded = getHeader(event, 'x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return getRequestIP(event, { xForwardedFor: false }) || undefined
}
