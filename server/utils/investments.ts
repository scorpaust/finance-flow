// Validação e serialização do registo de investimentos (Fase 6, tarefa 3;
// migrado de validação manual para Zod na Fase 8, ponto 1). Ver
// context/features/06-FASE-6-registo-investimentos.md. As mensagens continuam
// a vir de `serverT` (não de texto fixo do Zod) — são resolvidas no momento em
// que o schema é construído (já sabemos o `locale` aqui), por isso chegam já
// prontas a `server/utils/validate.ts`.
import { z } from 'zod'
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
import { validateBody } from './validate'
import type { H3Event } from 'h3'

export interface InvestmentFields {
  name: string
  assetClass: AssetClass | null
  initialAmount: number
  initialDate: Date
  reinforcement: number
  currentValue: number
}

function amountSchema(locale: ServerLocale, fieldKey: string, opts: { min: number; exclusiveMin?: boolean }) {
  const field = serverT(locale, fieldKey)
  return z
    .number(serverT(locale, 'investments.errorInvalidValue', { field }))
    .refine((v) => Number.isFinite(v), serverT(locale, 'investments.errorInvalidValue', { field }))
    .refine((v) => (opts.exclusiveMin ? v > opts.min : v >= opts.min), {
      message: opts.exclusiveMin
        ? serverT(locale, 'investments.errorMustBeGreaterThan', { field, min: opts.min })
        : serverT(locale, 'investments.errorCannotBeNegative', { field }),
    })
    .refine((v) => v <= MAX_INVESTMENT_AMOUNT, serverT(locale, 'investments.errorValueTooHigh', { field }))
    .transform(roundMoney)
}

function dateSchema(locale: ServerLocale) {
  // Datas futuras são válidas de propósito (a data da folha de exemplo é
  // posterior à data em que a fase foi desenhada) — só se rejeita o absurdo.
  return z.preprocess(
    (v) => (typeof v === 'string' || typeof v === 'number' ? new Date(v) : v),
    z.date(serverT(locale, 'investments.errorInvalidDate'))
  ).refine((d) => d.getFullYear() >= 1900 && d.getFullYear() <= 2100, serverT(locale, 'investments.errorInvalidDate'))
}

function assetClassSchema(locale: ServerLocale) {
  return z.preprocess(
    (v) => (v === '' || v === undefined ? null : v),
    z.enum(ASSET_CLASSES, serverT(locale, 'investments.errorInvalidAssetClass')).nullable()
  )
}

function nameSchema(locale: ServerLocale) {
  return z
    .string(serverT(locale, 'investments.errorInvalidName'))
    .trim()
    .min(1, serverT(locale, 'investments.errorNameLength'))
    .max(80, serverT(locale, 'investments.errorNameLength'))
}

export async function parseInvestmentCreate(event: H3Event, locale: ServerLocale): Promise<InvestmentFields & { valueUpdatedAt: Date }> {
  const schema = z.object({
    name: nameSchema(locale),
    assetClass: assetClassSchema(locale).optional(),
    initialAmount: amountSchema(locale, 'investments.fieldInitialAmount', { min: 0, exclusiveMin: true }),
    initialDate: dateSchema(locale),
    reinforcement: amountSchema(locale, 'investments.fieldReinforcement', { min: 0 }).default(0),
    currentValue: amountSchema(locale, 'investments.fieldCurrentValue', { min: 0 }),
  })

  const body = await validateBody(event, schema)
  return {
    name: body.name,
    assetClass: body.assetClass ?? null,
    initialAmount: body.initialAmount,
    initialDate: body.initialDate,
    reinforcement: body.reinforcement,
    currentValue: body.currentValue,
    valueUpdatedAt: new Date(),
  }
}

// PUT parcial — só valida os campos enviados; serve tanto a edição completa como
// as ações rápidas ("Reforçar" e "Atualizar situação").
export async function parseInvestmentUpdate(event: H3Event, locale: ServerLocale): Promise<Partial<InvestmentFields>> {
  const schema = z
    .object({
      name: nameSchema(locale).optional(),
      assetClass: assetClassSchema(locale).optional(),
      initialAmount: amountSchema(locale, 'investments.fieldInitialAmount', { min: 0, exclusiveMin: true }).optional(),
      initialDate: dateSchema(locale).optional(),
      reinforcement: amountSchema(locale, 'investments.fieldReinforcement', { min: 0 }).optional(),
      currentValue: amountSchema(locale, 'investments.fieldCurrentValue', { min: 0 }).optional(),
    })
    .partial()

  const body = await validateBody(event, schema)
  const out: Partial<InvestmentFields> = {}
  if (body.name !== undefined) out.name = body.name
  if (body.assetClass !== undefined) out.assetClass = body.assetClass ?? null
  if (body.initialAmount !== undefined) out.initialAmount = body.initialAmount
  if (body.initialDate !== undefined) out.initialDate = body.initialDate
  if (body.reinforcement !== undefined) out.reinforcement = body.reinforcement
  if (body.currentValue !== undefined) out.currentValue = body.currentValue
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
