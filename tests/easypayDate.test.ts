import { describe, expect, it } from 'vitest'
import { easypayDateTime } from '../shared/easypayDate'

// Regressão de 2026-10-07: em produção (servidor em UTC) o start_time saía
// uma hora no passado na hora de verão e a EasyPay recusava os checkouts de
// cartão/débito direto.
describe('easypayDateTime — sempre na hora de Portugal', () => {
  it('hora de verão (UTC+1)', () => {
    expect(easypayDateTime(new Date('2026-10-07T11:22:06Z'))).toBe('2026-10-07 12:22')
  })

  it('hora de inverno (UTC+0)', () => {
    expect(easypayDateTime(new Date('2026-01-15T09:05:00Z'))).toBe('2026-01-15 09:05')
  })

  it('mudança de dia à meia-noite de Lisboa', () => {
    expect(easypayDateTime(new Date('2026-07-31T23:30:00Z'))).toBe('2026-08-01 00:30')
  })
})
