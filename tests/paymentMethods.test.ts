import { describe, expect, it } from 'vitest'
import { prepaidMethodsForCountry } from '../shared/paymentMethods'

// MB WAY/Multibanco em todos os países: emigrantes com conta num banco
// português, e o Regulamento (UE) 2018/302 (bloqueio geográfico), art. 5.º.
describe('métodos pré-pagos', () => {
  it('estão disponíveis em qualquer país, incluindo fora do EEE e país desconhecido', () => {
    for (const country of ['PT', 'FR', 'CH', 'GB', 'US', 'BR', null, undefined, '']) {
      expect(prepaidMethodsForCountry(country)).toEqual(['mbway', 'multibanco'])
    }
  })
})
