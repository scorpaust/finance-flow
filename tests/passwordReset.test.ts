import { describe, expect, it, beforeAll } from 'vitest'

// Upgrade 05 — partes puras da recuperação de password e da sessão com versão.
// session.ts usa `useRuntimeConfig` (auto-import do Nuxt): stub mínimo aqui.
beforeAll(() => {
  ;(globalThis as any).useRuntimeConfig = () => ({ sessionSecret: 'segredo-de-teste' })
})

const { __test } = await import('../server/utils/session')
const { newResetToken, hashResetToken, isWellFormedToken, atLeast, RESET_TOKEN_TTL_MINUTES } = await import('../server/utils/passwordReset')
const { passwordResetEmail, passwordChangedEmail } = await import('../server/utils/emailTemplates')
const { createHmac } = await import('node:crypto')

const USER = '6abed3fb89652c23ca1158ac'
const future = () => Date.now() + 60_000

describe('sessão com versão', () => {
  it('o cookie leva a versão e é verificado com ela', () => {
    const token = __test.sign('session', USER, future(), 3)
    expect(token.split('.')).toHaveLength(4)
    expect(__test.verify('session', token)).toEqual({ userId: USER, version: 3 })
  })

  it('mexer na versão invalida a assinatura (não dá para "subir" a versão à mão)', () => {
    const [id, , exp, hmac] = __test.sign('session', USER, future(), 1).split('.')
    expect(__test.verify('session', `${id}.2.${exp}.${hmac}`)).toBeNull()
  })

  it('os cookies antigos (sem versão) continuam válidos como versão 0', () => {
    const expiresAt = future()
    const hmac = createHmac('sha256', 'segredo-de-teste').update(`session.${USER}.${expiresAt}`).digest('hex')
    expect(__test.verify('session', `${USER}.${expiresAt}.${hmac}`)).toEqual({ userId: USER, version: 0 })
  })

  it('expirado, de outro tipo ou malformado → inválido', () => {
    expect(__test.verify('session', __test.sign('session', USER, Date.now() - 1, 0))).toBeNull()
    expect(__test.verify('session', __test.sign('2fa-pending', USER, future(), 0))).toBeNull()
    expect(__test.verify('session', 'lixo')).toBeNull()
    expect(__test.verify('session', `${USER}.-1.${future()}.abc`)).toBeNull()
  })
})

describe('token de recuperação', () => {
  it('é aleatório, com 43 caracteres base64url, e só o hash vai para a base de dados', () => {
    const a = newResetToken()
    const b = newResetToken()
    expect(a.token).not.toBe(b.token)
    expect(isWellFormedToken(a.token)).toBe(true)
    expect(a.tokenHash).toBe(hashResetToken(a.token))
    expect(a.tokenHash).toMatch(/^[0-9a-f]{64}$/)
    expect(a.tokenHash).not.toContain(a.token)
  })

  it('rejeita tokens malformados antes de ir à base de dados', () => {
    expect(isWellFormedToken('')).toBe(false)
    expect(isWellFormedToken('abc')).toBe(false)
    expect(isWellFormedToken({ $ne: null })).toBe(false)
    expect(isWellFormedToken('a'.repeat(42) + '!')).toBe(false)
  })

  it('a validade é de 30 minutos', () => {
    expect(RESET_TOKEN_TTL_MINUTES).toBe(30)
  })

  it('atLeast espera pelo tempo mínimo mesmo quando o trabalho é instantâneo', async () => {
    const start = Date.now()
    await atLeast(60, Promise.resolve())
    expect(Date.now() - start).toBeGreaterThanOrEqual(55)
  })
})

describe('emails nas 6 línguas', () => {
  const locales = ['pt-PT', 'en', 'fr', 'de', 'it', 'es'] as const
  const link = 'https://www.financeflow-webapp.pt/reset-password?token=abc_DEF-123'

  it('o email de recuperação leva o link (texto e HTML) e a validade, em todas as línguas', () => {
    const subjects = new Set<string>()
    for (const locale of locales) {
      const m = passwordResetEmail({ to: 'a@b.pt', name: 'Ana', link, minutes: 30, locale })
      subjects.add(m.subject)
      expect(m.text).toContain(link)
      expect(m.html).toContain(link)
      expect(m.text).toContain('30')
      expect(m.text).toContain('Ana')
    }
    expect(subjects.size).toBe(6)
  })

  it('escapa o nome no HTML (o nome é escolhido pelo utilizador)', () => {
    const m = passwordResetEmail({ to: 'a@b.pt', name: '<script>x</script>', link, minutes: 30, locale: 'en' })
    expect(m.html).not.toContain('<script>')
    expect(m.html).toContain('&lt;script&gt;')
  })

  it('o aviso de password alterada traz o contacto de suporte', () => {
    for (const locale of locales) {
      expect(passwordChangedEmail({ to: 'a@b.pt', name: '', locale }).text).toContain('dinismiguelcosta@gmail.com')
    }
  })
})
