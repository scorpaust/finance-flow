// Upgrade 11 — fatura-recibo para cada pagamento EasyPay confirmado no site.
// As compras na app Android são vendidas pela Google (que emite o recibo ao
// cliente); o operador fatura à Google uma vez por mês, fora daqui.
//
// Regras:
// - um pagamento (paymentId) gera no máximo uma fatura (índice único);
// - proteção extra contra o mesmo pagamento chegar com ids diferentes
//   (checkout, webhook de criação e de cobrança): a mesma conta, o mesmo plano
//   e o mesmo valor nos últimos DUPLICATE_WINDOW_DAYS dias ficam `skipped` e
//   registados no log, para o operador confirmar;
// - nunca deita abaixo o fluxo de pagamento: sem configuração ou com erro do
//   InvoiceXpress a fatura fica `pending` e o cron diário volta a tentar.
import mongoose from 'mongoose'
import { Invoice, User, type IInvoice } from '../models'
import { logEvent } from './logger'
import { getPlanPrices } from './playPrices'
import { createFinalizedInvoiceReceipt, emailInvoiceReceipt, getInvoiceXpressConfig } from './invoicexpress'
import { isValidPortugueseNif, normalizeFiscalId } from '../../shared/fiscalId'
import type { ServerLocale } from './i18n'

export const DUPLICATE_WINDOW_DAYS = 20
const MAX_ATTEMPTS = 10

const EMAIL: Record<ServerLocale, { subject: (n: string) => string; body: (name: string) => string }> = {
  'pt-PT': {
    subject: (n) => `FinanceFlow — fatura-recibo ${n}`,
    body: (name) => `Olá ${name},\n\nObrigado pela tua subscrição do FinanceFlow. Em anexo segue a fatura-recibo do teu pagamento.\n\nA equipa FinanceFlow`,
  },
  en: {
    subject: (n) => `FinanceFlow — invoice-receipt ${n}`,
    body: (name) => `Hi ${name},\n\nThank you for subscribing to FinanceFlow. Your invoice-receipt for this payment is attached.\n\nThe FinanceFlow team`,
  },
  fr: {
    subject: (n) => `FinanceFlow — facture-reçu ${n}`,
    body: (name) => `Bonjour ${name},\n\nMerci pour ton abonnement à FinanceFlow. Tu trouveras ci-joint la facture-reçu de ton paiement.\n\nL'équipe FinanceFlow`,
  },
  de: {
    subject: (n) => `FinanceFlow — Rechnung mit Quittung ${n}`,
    body: (name) => `Hallo ${name},\n\ndanke für dein FinanceFlow-Abo. Im Anhang findest du die Rechnung mit Quittung für deine Zahlung.\n\nDein FinanceFlow-Team`,
  },
  it: {
    subject: (n) => `FinanceFlow — fattura-ricevuta ${n}`,
    body: (name) => `Ciao ${name},\n\ngrazie per il tuo abbonamento a FinanceFlow. In allegato trovi la fattura-ricevuta del tuo pagamento.\n\nIl team FinanceFlow`,
  },
  es: {
    subject: (n) => `FinanceFlow — factura-recibo ${n}`,
    body: (name) => `Hola ${name},\n\ngracias por suscribirte a FinanceFlow. Adjuntamos la factura-recibo de tu pago.\n\nEl equipo de FinanceFlow`,
  },
}

const IX_LANGUAGE: Record<ServerLocale, 'pt' | 'en' | 'es'> = { 'pt-PT': 'pt', en: 'en', fr: 'en', de: 'en', it: 'en', es: 'es' }

export function invoicingEnabled(): boolean {
  const env = process.env.EASYPAY_ENV || useRuntimeConfig().easypayEnv
  // INVOICING_ALLOW_SANDBOX só existe nos testes de integração.
  return env === 'production' || process.env.INVOICING_ALLOW_SANDBOX === 'true'
}

export async function resolveAmount(tier: 'pro' | 'premium', periodMonths: number, prepaid: boolean, value?: unknown): Promise<number> {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  if (Number.isFinite(n) && n > 0) return Math.round(n * 100) / 100
  const { prices } = await getPlanPrices()
  if (!prepaid) return prices[tier].monthly
  return (prices[tier].prepaid as Record<number, number>)[periodMonths] ?? prices[tier].monthly * periodMonths
}

// Regista o pagamento confirmado e tenta emitir a fatura logo. Nunca lança.
export async function invoicePayment(input: {
  userId: string
  paymentId: string
  tier: 'pro' | 'premium'
  periodMonths: number
  prepaid: boolean
  value?: unknown
}): Promise<void> {
  // Pagamentos da sandbox da EasyPay nunca geram fatura (nem pendente: o cron
  // emiti-la-ia a sério quando o InvoiceXpress fosse configurado).
  if (!invoicingEnabled()) return
  try {
    const existing = await Invoice.findOne({ paymentId: input.paymentId })
    if (existing) {
      if (existing.status === 'pending') await issueInvoice(existing)
      return
    }
    const amount = await resolveAmount(input.tier, input.periodMonths, input.prepaid, input.value)
    const since = new Date(Date.now() - DUPLICATE_WINDOW_DAYS * 86_400_000)
    const recent = await Invoice.findOne({
      userId: new mongoose.Types.ObjectId(input.userId),
      tier: input.tier,
      amount,
      status: { $in: ['pending', 'issued'] },
      createdAt: { $gte: since },
    }).select('paymentId')

    let invoice: IInvoice
    try {
      invoice = await Invoice.create({
        userId: input.userId,
        paymentId: input.paymentId,
        tier: input.tier,
        periodMonths: input.periodMonths,
        amount,
        status: recent ? 'skipped' : 'pending',
        lastError: recent ? `duplicate_window:${recent.paymentId}` : null,
      })
    } catch (e: any) {
      if (e?.code === 11000) return // outra confirmação do mesmo pagamento chegou ao mesmo tempo
      throw e
    }
    if (recent) {
      logEvent('warn', 'invoice.duplicate_skipped', { userId: input.userId, paymentId: input.paymentId, matchedPaymentId: recent.paymentId, amount })
      return
    }
    await issueInvoice(invoice)
  } catch (e) {
    logEvent('error', 'invoice.record_failed', { userId: input.userId, paymentId: input.paymentId, message: String((e as Error)?.message || e).slice(0, 300) })
  }
}

async function issueInvoice(invoice: IInvoice): Promise<void> {
  const config = getInvoiceXpressConfig()
  if (!config) {
    logEvent('warn', 'invoice.not_configured', { paymentId: invoice.paymentId })
    return
  }
  const user = await User.findById(invoice.userId)
    .select('name email fiscalId billingLocale')
    .lean<{ _id: unknown; name: string; email: string; fiscalId?: string | null; billingLocale?: ServerLocale }>()
  if (!user) {
    // Conta apagada antes de faturar: fica para o operador emitir à mão.
    await Invoice.updateOne({ _id: invoice._id }, { $set: { lastError: 'user_not_found' } })
    logEvent('error', 'invoice.user_missing', { paymentId: invoice.paymentId })
    return
  }
  const locale: ServerLocale = user.billingLocale && EMAIL[user.billingLocale] ? user.billingLocale : 'pt-PT'
  const nif = isValidPortugueseNif(user.fiscalId) ? normalizeFiscalId(user.fiscalId) : null
  const plan = invoice.tier === 'premium' ? 'Premium' : 'Pro'

  try {
    let id = invoice.invoicexpressId || null
    let number = invoice.invoiceNumber || null
    if (!id) {
      const created = await createFinalizedInvoiceReceipt(config, {
        date: new Date(),
        reference: invoice.paymentId.slice(0, 50),
        client: { code: `FF-${String(user._id)}`, name: user.name || user.email, email: user.email, fiscalId: nif, language: IX_LANGUAGE[locale] },
        item: {
          name: `FinanceFlow ${plan}`,
          description: `Subscrição FinanceFlow ${plan} — ${invoice.periodMonths} ${invoice.periodMonths === 1 ? 'mês' : 'meses'}`,
          unitPrice: invoice.amount,
        },
      })
      id = created.id
      number = created.number
      // Guardado logo: se o email falhar, a nova tentativa não cria outra fatura.
      await Invoice.updateOne({ _id: invoice._id }, { $set: { invoicexpressId: id, invoiceNumber: number } })
    }
    const t = EMAIL[locale]
    await emailInvoiceReceipt(config, id, { email: user.email, subject: t.subject(number || ''), body: t.body(user.name || '') })
    await Invoice.updateOne(
      { _id: invoice._id },
      { $set: { status: 'issued', issuedAt: new Date(), lastError: null }, $inc: { attempts: 1 } }
    )
    logEvent('info', 'invoice.issued', { paymentId: invoice.paymentId, invoiceNumber: number })
  } catch (e) {
    const message = String((e as Error)?.message || e).slice(0, 300)
    await Invoice.updateOne({ _id: invoice._id }, { $set: { lastError: message }, $inc: { attempts: 1 } })
    logEvent('error', 'invoice.issue_failed', { paymentId: invoice.paymentId, attempts: invoice.attempts + 1, message })
  }
}

// Cron diário: faturas que ficaram por emitir (sem configuração ou erro).
export async function retryPendingInvoices(limit = 25): Promise<{ tried: number }> {
  const pending = await Invoice.find({ status: 'pending', attempts: { $lt: MAX_ATTEMPTS } }).sort({ createdAt: 1 }).limit(limit)
  for (const invoice of pending) await issueInvoice(invoice)
  return { tried: pending.length }
}
