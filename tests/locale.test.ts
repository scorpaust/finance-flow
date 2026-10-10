import { describe, expect, it } from 'vitest'
import { matchLocale, parseAcceptLanguage, resolveLocale } from '../shared/locale'

// Upgrade 06 — escolha da língua: deteção, escolha manual e cookies antigos.

describe('deteção pela língua do dispositivo', () => {
  it('código completo primeiro, depois só a língua; sem correspondência, nada', () => {
    expect(matchLocale(['pt-PT'])).toBe('pt-PT')
    expect(matchLocale(['pt-BR'])).toBe('pt-PT')
    expect(matchLocale(['de-AT', 'en'])).toBe('de')
    expect(matchLocale(['hi-IN', 'es-MX'])).toBe('es')
    expect(matchLocale(['hi-IN', 'ja'])).toBeNull()
  })

  it('lê o cabeçalho Accept-Language pela ordem, sem os pesos', () => {
    expect(parseAcceptLanguage('fr-CH, fr;q=0.9, en;q=0.8')).toEqual(['fr-CH', 'fr', 'en'])
    expect(parseAcceptLanguage(undefined)).toEqual([])
  })
})

describe('que língua usar', () => {
  it('primeira visita: deteta e marca como automática; sem correspondência, inglês', () => {
    expect(resolveLocale({ cookie: null, source: null, candidates: ['it-IT'] })).toEqual({ locale: 'it', source: 'auto' })
    expect(resolveLocale({ cookie: null, source: null, candidates: ['hi-IN'] })).toEqual({ locale: 'en', source: 'auto' })
  })

  it('língua automática acompanha o telemóvel na visita seguinte', () => {
    expect(resolveLocale({ cookie: 'en', source: 'auto', candidates: ['es-ES'] })).toEqual({ locale: 'es', source: 'auto' })
  })

  it('uma escolha manual nunca é substituída pela deteção', () => {
    expect(resolveLocale({ cookie: 'pt-PT', source: 'user', candidates: ['en-US'] })).toEqual({ locale: 'pt-PT', source: 'user' })
  })

  it('cookie antigo (sem origem) conta como escolha do utilizador: nada muda depois do deploy', () => {
    expect(resolveLocale({ cookie: 'pt-PT', source: null, candidates: ['en-US'] })).toEqual({ locale: 'pt-PT', source: 'user' })
  })

  it('cookie com uma língua que não existe é ignorado', () => {
    expect(resolveLocale({ cookie: 'xx', source: 'user', candidates: ['de'] })).toEqual({ locale: 'de', source: 'auto' })
  })
})
