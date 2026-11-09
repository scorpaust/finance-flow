// Transações recorrentes com confirmação: a app nunca cria uma transação
// sozinha, só a propõe a partir de alguns dias antes da data prevista (o
// salário que chega na sexta antes do fim de semana já aparece a tempo).
// Funções puras, partilhadas pelo servidor e pelos testes.

export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

// Quantos dias antes da data prevista a transação já é proposta.
export const RECURRENCE_LEAD_DAYS = 3

const DAY_MS = 86_400_000

// As transações guardam a data às 00:00 UTC (o formulário envia AAAA-MM-DD).
export function utcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function clampedDay(year: number, month: number, day: number): Date {
  const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  return new Date(Date.UTC(year, month, Math.min(day, last)))
}

// A ocorrência seguinte. `anchorDay` é o dia do mês da primeira transação da
// série: um salário a 31 passa a 28 de fevereiro e volta a 31 em março.
export function nextOccurrence(from: Date, recurrence: Recurrence, anchorDay: number): Date | null {
  const y = from.getUTCFullYear()
  const m = from.getUTCMonth()
  const d = from.getUTCDate()
  switch (recurrence) {
    case 'daily': return new Date(Date.UTC(y, m, d + 1))
    case 'weekly': return new Date(Date.UTC(y, m, d + 7))
    case 'monthly': return clampedDay(y, m + 1, anchorDay)
    case 'yearly': return clampedDay(y + 1, m, anchorDay)
    default: return null
  }
}

// A ocorrência a propor hoje, ou null se ainda faltar mais de
// RECURRENCE_LEAD_DAYS. Períodos já passados sem resposta não se acumulam:
// propõe-se só o mais recente.
export function dueOccurrence(nextDueAt: Date, recurrence: Recurrence, anchorDay: number, today: Date): Date | null {
  const limit = utcDay(today).getTime() + RECURRENCE_LEAD_DAYS * DAY_MS
  let due = utcDay(nextDueAt)
  if (due.getTime() > limit) return null
  for (let i = 0; i < 5000; i++) {
    const next = nextOccurrence(due, recurrence, anchorDay)
    if (!next || next.getTime() > limit) break
    due = next
  }
  return due
}

// A data proposta ao confirmar: hoje, se for antes da prevista (pago mais
// cedo); a prevista, se já passou.
export function suggestedDate(expected: Date, today: Date): Date {
  const t = utcDay(today)
  return t.getTime() < expected.getTime() ? t : expected
}
