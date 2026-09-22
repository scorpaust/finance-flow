// Validação e serialização do registo de investimentos (Fase 6, tarefa 3). Ver
// context/features/06-FASE-6-registo-investimentos.md. Validação manual, no
// mesmo estilo de server/api/investor-profile/index.ts — o Zod só chega na Fase 8,
// por isso as regras estão concentradas aqui para serem fáceis de migrar.
import type { IInvestment } from '../models'
import {
  ASSET_CLASSES,
  MAX_INVESTMENT_AMOUNT,
  gainAmount,
  investedAmount,
  returnPct,
  roundMoney,
  type AssetClass,
  type InvestmentDto,
} from '../../shared/portfolio'
import { serverT, type ServerLocale } from './i18n'

export interface InvestmentFields {
  name: string
  assetClass: AssetClass | null
  initialAmount: number
  initialDate: Date
  reinforcement: number
  currentValue: number
}

function invalid(message: string, code = 'invalid_investment') {
  return createError({ statusCode: 400, message, data: { error: code } })
}

function parseAmount(
  locale: ServerLocale,
  value: unknown,
  fieldKey: string,
  opts: { min: number; exclusiveMin?: boolean }
): number {
  const field = serverT(locale, fieldKey)
  if (typeof value !== 'number' || !Number.isFinite(value)) throw invalid(serverT(locale, 'investments.errorInvalidValue', { field }))
  if (opts.exclusiveMin ? value <= opts.min : value < opts.min) {
    throw invalid(
      opts.exclusiveMin
        ? serverT(locale, 'investments.errorMustBeGreaterThan', { field, min: opts.min })
        : serverT(locale, 'investments.errorCannotBeNegative', { field })
    )
  }
  if (value > MAX_INVESTMENT_AMOUNT) throw invalid(serverT(locale, 'investments.errorValueTooHigh', { field }))
  return roundMoney(value)
}

function parseDate(locale: ServerLocale, value: unknown): Date {
  const d = typeof value === 'string' || typeof value === 'number' ? new Date(value) : null
  // Datas futuras são válidas de propósito (a data da folha de exemplo é
  // posterior à data em que a fase foi desenhada) — só se rejeita o absurdo.
  if (!d || Number.isNaN(d.getTime()) || d.getFullYear() < 1900 || d.getFullYear() > 2100) {
    throw invalid(serverT(locale, 'investments.errorInvalidDate'))
  }
  return d
}

function parseAssetClass(locale: ServerLocale, value: unknown): AssetClass | null {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string' || !(ASSET_CLASSES as readonly string[]).includes(value)) {
    throw invalid(serverT(locale, 'investments.errorInvalidAssetClass'))
  }
  return value as AssetClass
}

function parseName(locale: ServerLocale, value: unknown): string {
  if (typeof value !== 'string') throw invalid(serverT(locale, 'investments.errorInvalidName'))
  const name = value.trim()
  if (name.length < 1 || name.length > 80) throw invalid(serverT(locale, 'investments.errorNameLength'))
  return name
}

// POST — todos os campos obrigatórios exceto assetClass e reinforcement (default 0).
export function parseInvestmentCreate(locale: ServerLocale, body: any): InvestmentFields & { valueUpdatedAt: Date } {
  const initialAmount = parseAmount(locale, body?.initialAmount, 'investments.fieldInitialAmount', { min: 0, exclusiveMin: true })
  const reinforcement = body?.reinforcement === undefined ? 0 : parseAmount(locale, body.reinforcement, 'investments.fieldReinforcement', { min: 0 })
  return {
    name: parseName(locale, body?.name),
    assetClass: parseAssetClass(locale, body?.assetClass),
    initialAmount,
    initialDate: parseDate(locale, body?.initialDate),
    reinforcement,
    currentValue: parseAmount(locale, body?.currentValue, 'investments.fieldCurrentValue', { min: 0 }),
    valueUpdatedAt: new Date(),
  }
}

// PUT parcial — só valida os campos enviados; serve tanto a edição completa como
// as ações rápidas ("Reforçar" e "Atualizar situação").
export function parseInvestmentUpdate(locale: ServerLocale, body: any): Partial<InvestmentFields> {
  const out: Partial<InvestmentFields> = {}
  if (body?.name !== undefined) out.name = parseName(locale, body.name)
  if (body?.assetClass !== undefined) out.assetClass = parseAssetClass(locale, body.assetClass)
  if (body?.initialAmount !== undefined) {
    out.initialAmount = parseAmount(locale, body.initialAmount, 'investments.fieldInitialAmount', { min: 0, exclusiveMin: true })
  }
  if (body?.initialDate !== undefined) out.initialDate = parseDate(locale, body.initialDate)
  if (body?.reinforcement !== undefined) out.reinforcement = parseAmount(locale, body.reinforcement, 'investments.fieldReinforcement', { min: 0 })
  if (body?.currentValue !== undefined) out.currentValue = parseAmount(locale, body.currentValue, 'investments.fieldCurrentValue', { min: 0 })
  return out
}

// Os derivados (invested/gain/returnPct) são calculados aqui, nunca guardados.
export function toInvestmentDto(doc: Pick<
  IInvestment,
  'name' | 'assetClass' | 'initialAmount' | 'initialDate' | 'reinforcement' | 'currentValue' | 'valueUpdatedAt' | 'createdAt' | 'updatedAt'
> & { _id: unknown }): InvestmentDto {
  const amounts = {
    initialAmount: doc.initialAmount,
    reinforcement: doc.reinforcement,
    currentValue: doc.currentValue,
  }
  return {
    _id: String(doc._id),
    name: doc.name,
    assetClass: doc.assetClass ?? null,
    ...amounts,
    initialDate: new Date(doc.initialDate).toISOString(),
    valueUpdatedAt: new Date(doc.valueUpdatedAt).toISOString(),
    invested: investedAmount(amounts),
    gain: gainAmount(amounts),
    returnPct: returnPct(amounts),
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  }
}
