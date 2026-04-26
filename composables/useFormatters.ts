import { format, parseISO, startOfMonth, endOfMonth, subMonths, isValid } from 'date-fns'
import { pt } from 'date-fns/locale'

export function useFormatters() {
  function formatCurrency(value: number, currency = 'EUR'): string {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value ?? 0)
  }

  function formatCompact(value: number): string {
    const v = value ?? 0
    if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M €`
    if (Math.abs(v) >= 1_000)     return `${(v / 1_000).toFixed(1)}k €`
    return formatCurrency(v)
  }

  function formatDate(date: string | Date | undefined | null, fmt = 'dd MMM yyyy'): string {
    if (!date) return '—'
    try {
      const d = typeof date === 'string' ? parseISO(date) : date
      if (!isValid(d)) return '—'
      return format(d, fmt, { locale: pt })
    } catch {
      return '—'
    }
  }

  function formatMonthYear(monthKey: string): string {
    try {
      const [year, month] = monthKey.split('-')
      const d = new Date(parseInt(year), parseInt(month) - 1, 1)
      return format(d, 'MMM yy', { locale: pt })
    } catch {
      return monthKey
    }
  }

  function formatPercentage(value: number, decimals = 1): string {
    const v = value ?? 0
    return `${v >= 0 ? '+' : ''}${v.toFixed(decimals)}%`
  }

  function getMonthRange(monthsBack = 0): { start: string; end: string } {
    const base = subMonths(new Date(), monthsBack)
    return {
      start: format(startOfMonth(base), 'yyyy-MM-dd'),
      end:   format(endOfMonth(base),   'yyyy-MM-dd'),
    }
  }

  function relativeTime(date: string | Date | undefined | null): string {
    if (!date) return '—'
    try {
      const d    = typeof date === 'string' ? parseISO(date) : date
      if (!isValid(d)) return '—'
      const diff = Date.now() - d.getTime()
      const days = Math.floor(diff / 86_400_000)
      if (days === 0) return 'Hoje'
      if (days === 1) return 'Ontem'
      if (days < 7)   return `${days} dias atrás`
      if (days < 30)  return `${Math.floor(days / 7)} sem. atrás`
      return formatDate(d, 'dd MMM')
    } catch {
      return '—'
    }
  }

  return {
    formatCurrency,
    formatCompact,
    formatDate,
    formatMonthYear,
    formatPercentage,
    getMonthRange,
    relativeTime,
  }
}
