import { format, parseISO, startOfMonth, endOfMonth, subMonths, isValid } from 'date-fns'

// Fase 7 — todos os formatadores seguem o idioma ativo da UI (nunca o país
// geolocalizado, que só decide métodos de pagamento — ver
// shared/paymentMethods.ts). `formatCurrency` aceita uma moeda por chamada
// (default EUR) — usado com a moeda original de uma transação estrangeira
// (tarefa 6); todos os outros valores agregados (KPIs, estatísticas,
// orçamentos, previsões) continuam sempre em € (ver
// server/utils/transactionCurrency.ts).
export function useFormatters() {
  const { t } = useI18n()
  const { dateFnsLocale, intlLocale } = useLocaleFormat()

  function formatCurrency(value: number, currency = 'EUR'): string {
    return new Intl.NumberFormat(intlLocale.value, {
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
      return format(d, fmt, { locale: dateFnsLocale.value })
    } catch {
      return '—'
    }
  }

  function formatMonthYear(monthKey: string): string {
    try {
      const [year, month] = monthKey.split('-')
      const d = new Date(parseInt(year), parseInt(month) - 1, 1)
      return format(d, 'MMM yy', { locale: dateFnsLocale.value })
    } catch {
      return monthKey
    }
  }

  function formatPercentage(value: number, decimals = 1): string {
    const v = value ?? 0
    return `${v >= 0 ? '+' : ''}${v.toFixed(decimals)}%`
  }

  // Rentabilidade como na folha de investimentos (Fase 6): "1,94%" / "-2,00%"
  // em pt-PT, formato equivalente no idioma ativo. `null` (sem capital
  // investido) mostra "—".
  function formatReturnPct(value: number | null | undefined, decimals = 2): string {
    if (value === null || value === undefined || !Number.isFinite(value)) return '—'
    return new Intl.NumberFormat(intlLocale.value, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100)
  }

  // Ganho/perda em euros com sinal explícito ("+20,00 €" / "-1,00 €"). Onde o
  // `signDisplay` não é suportado, cai para o formato normal (só o "-").
  function formatSignedCurrency(value: number): string {
    return new Intl.NumberFormat(intlLocale.value, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      signDisplay: 'exceptZero',
    }).format(value ?? 0)
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
      if (days === 0) return t('common.today')
      if (days === 1) return t('common.yesterday')
      if (days < 7)   return t('common.daysAgo', { count: days })
      if (days < 30)  return t('common.weeksAgo', { count: Math.floor(days / 7) })
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
    formatReturnPct,
    formatSignedCurrency,
    getMonthRange,
    relativeTime,
  }
}
