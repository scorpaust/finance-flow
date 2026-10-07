import { describe, expect, it } from 'vitest'
import { greetingKey } from '../shared/greeting'

// Saudação do painel pela hora local do dispositivo (reportado a 2026-10-07:
// às 02:00 em Portugal a app dizia "Bom dia", e depois "Good evening" em inglês).
describe('greetingKey', () => {
  it('madrugada: "boa noite" onde é cumprimento, "olá" nas outras línguas', () => {
    for (const hour of [0, 2, 4]) {
      expect(greetingKey(hour, 'pt-PT')).toBe('greetingEvening') // Boa noite
      expect(greetingKey(hour, 'es')).toBe('greetingEvening') // Buenas noches
      expect(greetingKey(hour, 'fr')).toBe('greetingEvening') // Bonsoir
      expect(greetingKey(hour, 'en')).toBe('greetingHello') // não "Good evening"
      expect(greetingKey(hour, 'de')).toBe('greetingHello')
      expect(greetingKey(hour, 'it')).toBe('greetingHello')
    }
    for (const locale of ['pt-PT', 'en', 'fr', 'de', 'it', 'es']) expect(greetingKey(5, locale)).toBe('greetingMorning')
  })

  it('português: boa tarde até às 20h', () => {
    expect(greetingKey(11, 'pt-PT')).toBe('greetingMorning')
    expect(greetingKey(12, 'pt-PT')).toBe('greetingAfternoon')
    expect(greetingKey(19, 'pt-PT')).toBe('greetingAfternoon')
    expect(greetingKey(20, 'pt-PT')).toBe('greetingEvening')
  })

  it('cada língua tem os seus escalões', () => {
    expect(greetingKey(11, 'de')).toBe('greetingAfternoon') // Guten Tag
    expect(greetingKey(12, 'it')).toBe('greetingMorning') // Buongiorno
    expect(greetingKey(18, 'it')).toBe('greetingEvening') // Buonasera
    expect(greetingKey(12, 'es')).toBe('greetingMorning') // Buenos días
    expect(greetingKey(20, 'es')).toBe('greetingAfternoon') // Buenas tardes
    expect(greetingKey(21, 'es')).toBe('greetingEvening') // Buenas noches
    expect(greetingKey(18, 'en')).toBe('greetingEvening')
    expect(greetingKey(23, 'en')).toBe('greetingEvening')
    expect(greetingKey(18, 'fr')).toBe('greetingEvening') // Bonsoir
  })

  it('língua desconhecida usa as regras do inglês', () => {
    expect(greetingKey(17, 'ja')).toBe('greetingAfternoon')
    expect(greetingKey(2, 'ja')).toBe('greetingHello')
  })
})
