import { describe, expect, it } from 'vitest'
import { greetingPeriod } from '../shared/greeting'

// Saudação do painel pela hora local do dispositivo (reportado a 2026-10-07:
// às 02:00 em Portugal a app dizia "Bom dia").
describe('greetingPeriod', () => {
  it('de madrugada é sempre a saudação da noite, em todas as línguas', () => {
    for (const locale of ['pt-PT', 'en', 'fr', 'de', 'it', 'es']) {
      expect(greetingPeriod(0, locale)).toBe('evening')
      expect(greetingPeriod(2, locale)).toBe('evening')
      expect(greetingPeriod(4, locale)).toBe('evening')
      expect(greetingPeriod(5, locale)).toBe('morning')
    }
  })

  it('português: boa tarde até às 20h', () => {
    expect(greetingPeriod(11, 'pt-PT')).toBe('morning')
    expect(greetingPeriod(12, 'pt-PT')).toBe('afternoon')
    expect(greetingPeriod(19, 'pt-PT')).toBe('afternoon')
    expect(greetingPeriod(20, 'pt-PT')).toBe('evening')
  })

  it('cada língua tem os seus escalões', () => {
    expect(greetingPeriod(11, 'de')).toBe('afternoon') // Guten Tag
    expect(greetingPeriod(12, 'it')).toBe('morning') // Buongiorno
    expect(greetingPeriod(18, 'it')).toBe('evening') // Buonasera
    expect(greetingPeriod(12, 'es')).toBe('morning') // Buenos días
    expect(greetingPeriod(20, 'es')).toBe('afternoon') // Buenas tardes
    expect(greetingPeriod(21, 'es')).toBe('evening') // Buenas noches
    expect(greetingPeriod(18, 'en')).toBe('evening')
    expect(greetingPeriod(18, 'fr')).toBe('evening') // Bonsoir
  })

  it('língua desconhecida usa os escalões do inglês', () => {
    expect(greetingPeriod(17, 'ja')).toBe('afternoon')
    expect(greetingPeriod(18, 'ja')).toBe('evening')
  })
})
