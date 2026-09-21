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

function parseAmount(value: unknown, field: string, opts: { min: number; exclusiveMin?: boolean }): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw invalid(`${field}: valor inválido`)
  if (opts.exclusiveMin ? value <= opts.min : value < opts.min) {
    throw invalid(opts.exclusiveMin ? `${field}: tem de ser maior que ${opts.min}` : `${field}: não pode ser negativo`)
  }
  if (value > MAX_INVESTMENT_AMOUNT) throw invalid(`${field}: valor demasiado elevado`)
  return roundMoney(value)
}

function parseDate(value: unknown): Date {
  const d = typeof value === 'string' || typeof value === 'number' ? new Date(value) : null
  // Datas futuras são válidas de propósito (a data da folha de exemplo é
  // posterior à data em que a fase foi desenhada) — só se rejeita o absurdo.
  if (!d || Number.isNaN(d.getTime()) || d.getFullYear() < 1900 || d.getFullYear() > 2100) {
    throw invalid('Data inválida')
  }
  return d
}

function parseAssetClass(value: unknown): AssetClass | null {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string' || !(ASSET_CLASSES as readonly string[]).includes(value)) {
    throw invalid('Classe de ativo inválida')
  }
  return value as AssetClass
}

function parseName(value: unknown): string {
  if (typeof value !== 'string') throw invalid('Nome inválido')
  const name = value.trim()
  if (name.length < 1 || name.length > 80) throw invalid('O nome tem de ter entre 1 e 80 caracteres')
  return name
}

// POST — todos os campos obrigatórios exceto assetClass e reinforcement (default 0).
export function parseInvestmentCreate(body: any): InvestmentFields & { valueUpdatedAt: Date } {
  const initialAmount = parseAmount(body?.initialAmount, 'Valor inicial', { min: 0, exclusiveMin: true })
  const reinforcement = body?.reinforcement === undefined ? 0 : parseAmount(body.reinforcement, 'Reforço', { min: 0 })
  return {
    name: parseName(body?.name),
    assetClass: parseAssetClass(body?.assetClass),
    initialAmount,
    initialDate: parseDate(body?.initialDate),
    reinforcement,
    currentValue: parseAmount(body?.currentValue, 'Situação', { min: 0 }),
    valueUpdatedAt: new Date(),
  }
}

// PUT parcial — só valida os campos enviados; serve tanto a edição completa como
// as ações rápidas ("Reforçar" e "Atualizar situação").
export function parseInvestmentUpdate(body: any): Partial<InvestmentFields> {
  const out: Partial<InvestmentFields> = {}
  if (body?.name !== undefined) out.name = parseName(body.name)
  if (body?.assetClass !== undefined) out.assetClass = parseAssetClass(body.assetClass)
  if (body?.initialAmount !== undefined) {
    out.initialAmount = parseAmount(body.initialAmount, 'Valor inicial', { min: 0, exclusiveMin: true })
  }
  if (body?.initialDate !== undefined) out.initialDate = parseDate(body.initialDate)
  if (body?.reinforcement !== undefined) out.reinforcement = parseAmount(body.reinforcement, 'Reforço', { min: 0 })
  if (body?.currentValue !== undefined) out.currentValue = parseAmount(body.currentValue, 'Situação', { min: 0 })
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
