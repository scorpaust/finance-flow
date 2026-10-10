import { Category } from '../models'
import type { ServerLocale } from './i18n'

// Categorias iniciais de cada conta nova, criadas no registo
// (server/api/auth/session.ts). Genéricas e dentro do plano Gratuito: sem
// grupos de orçamento (funcionalidade Pro — shared/features.ts) e sem limites
// mensais pré-preenchidos. Não contam para o teto de categorias próprias do
// Gratuito (`isDefault: true`, ver server/api/categories/index.ts).
//
// O nome fica gravado na base de dados no idioma em que a conta foi criada —
// é um dado do utilizador (pode renomear), não um texto de interface.
// Só servidor — nunca faz parte do bundle do client.
type DefaultCategoryKey =
  | 'salary'
  | 'otherIncome'
  | 'housing'
  | 'groceries'
  | 'transport'
  | 'health'
  | 'bills'
  | 'leisure'
  | 'shopping'
  | 'otherExpenses'

const DEFAULT_CATEGORIES: { key: DefaultCategoryKey; type: 'income' | 'expense'; icon: string; color: string }[] = [
  { key: 'salary', type: 'income', icon: '💰', color: '#10b981' },
  { key: 'otherIncome', type: 'income', icon: '📈', color: '#22c55e' },
  { key: 'housing', type: 'expense', icon: '🏠', color: '#f43f5e' },
  { key: 'groceries', type: 'expense', icon: '🛒', color: '#f97316' },
  { key: 'transport', type: 'expense', icon: '🚗', color: '#eab308' },
  { key: 'health', type: 'expense', icon: '💊', color: '#ec4899' },
  { key: 'bills', type: 'expense', icon: '💡', color: '#3b82f6' },
  { key: 'leisure', type: 'expense', icon: '🎮', color: '#06b6d4' },
  { key: 'shopping', type: 'expense', icon: '🛍️', color: '#a855f7' },
  { key: 'otherExpenses', type: 'expense', icon: '📦', color: '#78716c' },
]

const NAMES: Record<ServerLocale, Record<DefaultCategoryKey, string>> = {
  'pt-PT': {
    salary: 'Salário',
    otherIncome: 'Outros rendimentos',
    housing: 'Habitação',
    groceries: 'Alimentação',
    transport: 'Transportes',
    health: 'Saúde',
    bills: 'Contas da casa',
    leisure: 'Lazer',
    shopping: 'Compras',
    otherExpenses: 'Outras despesas',
  },
  en: {
    salary: 'Salary',
    otherIncome: 'Other income',
    housing: 'Housing',
    groceries: 'Groceries',
    transport: 'Transport',
    health: 'Health',
    bills: 'Bills & utilities',
    leisure: 'Leisure',
    shopping: 'Shopping',
    otherExpenses: 'Other expenses',
  },
  fr: {
    salary: 'Salaire',
    otherIncome: 'Autres revenus',
    housing: 'Logement',
    groceries: 'Alimentation',
    transport: 'Transports',
    health: 'Santé',
    bills: 'Factures',
    leisure: 'Loisirs',
    shopping: 'Achats',
    otherExpenses: 'Autres dépenses',
  },
  de: {
    salary: 'Gehalt',
    otherIncome: 'Sonstige Einnahmen',
    housing: 'Wohnen',
    groceries: 'Lebensmittel',
    transport: 'Verkehr',
    health: 'Gesundheit',
    bills: 'Nebenkosten',
    leisure: 'Freizeit',
    shopping: 'Einkäufe',
    otherExpenses: 'Sonstige Ausgaben',
  },
  it: {
    salary: 'Stipendio',
    otherIncome: 'Altre entrate',
    housing: 'Casa',
    groceries: 'Spesa alimentare',
    transport: 'Trasporti',
    health: 'Salute',
    bills: 'Bollette',
    leisure: 'Tempo libero',
    shopping: 'Acquisti',
    otherExpenses: 'Altre spese',
  },
  es: {
    salary: 'Salario',
    otherIncome: 'Otros ingresos',
    housing: 'Vivienda',
    groceries: 'Alimentación',
    transport: 'Transporte',
    health: 'Salud',
    bills: 'Facturas',
    leisure: 'Ocio',
    shopping: 'Compras',
    otherExpenses: 'Otros gastos',
  },
}

export const DEFAULT_CATEGORY_COUNT = DEFAULT_CATEGORIES.length

// Upserts idempotentes por nome — um registo sobre uma conta antiga sem
// password não duplica nada.
export async function seedDefaultCategories(userId: unknown, locale: ServerLocale): Promise<void> {
  const names = NAMES[locale] || NAMES.en
  await Promise.all(
    DEFAULT_CATEGORIES.map((category, index) =>
      Category.findOneAndUpdate(
        { userId, name: names[category.key] },
        {
          $setOnInsert: {
            userId,
            name: names[category.key],
            type: category.type,
            icon: category.icon,
            color: category.color,
            monthlyLimit: 0,
            groupId: null,
            isDefault: true,
            order: index + 1,
          },
        },
        { upsert: true }
      ).catch((e: any) => {
        // Índice único {userId, name}: dois registos simultâneos — o perdedor
        // recebe E11000, e a categoria já existe, que é o objetivo.
        if (e?.code !== 11000) throw e
      })
    )
  )
}

// Upgrade 04 — pista para o orçamento sugerido (shared/budget.ts): Habitação e
// Contas são tipicamente fixas; Lazer, Compras e restaurantes são as primeiras
// a cortar. Reconhece os nomes por omissão nas 6 línguas (a conta pode ter
// sido criada noutra língua) e algumas palavras comuns em categorias próprias.
const FIXED_KEYS: DefaultCategoryKey[] = ['housing', 'bills']
const DISCRETIONARY_KEYS: DefaultCategoryKey[] = ['leisure', 'shopping']
const FIXED_WORDS = /\b(renda|rent|loyer|miete|affitto|alquiler|hipoteca|mortgage|cr[eé]dito habita|seguro|insurance|assurance|versicherung|assicurazion|condom[ií]nio)/i
const DISCRETIONARY_WORDS = /(restaura|ristorant|caf[eé]s?\b|takeaway|take-away|fast.?food|bares\b|\bbars?\b|lazer|leisure|loisir|freizeit|svago|ocio|divers[aã]o|entretenimento|entertainment|shopping|compras|vestu[aá]rio|roupa|clothing|viage(m|ns)|travel|f[eé]rias|hobbies?)/i

function normalizeName(name: string): string {
  return name.trim().toLocaleLowerCase()
}

export function budgetHintForCategory(name: string): 'fixed' | 'discretionary' | null {
  const n = normalizeName(name)
  for (const names of Object.values(NAMES)) {
    if (FIXED_KEYS.some((k) => normalizeName(names[k]) === n)) return 'fixed'
    if (DISCRETIONARY_KEYS.some((k) => normalizeName(names[k]) === n)) return 'discretionary'
  }
  if (FIXED_WORDS.test(name)) return 'fixed'
  if (DISCRETIONARY_WORDS.test(name)) return 'discretionary'
  return null
}

// Upgrade 06 — ao mudar a língua da app, as categorias por omissão que nunca
// foram renomeadas podem acompanhá-la. "Nunca renomeada" = `isDefault` e o
// nome é ainda um dos nomes por omissão (em qualquer língua) da mesma chave.
export function defaultCategoryKeyForName(name: string): DefaultCategoryKey | null {
  const n = normalizeName(name)
  for (const names of Object.values(NAMES)) {
    const key = (Object.keys(names) as DefaultCategoryKey[]).find((k) => normalizeName(names[k]) === n)
    if (key) return key
  }
  return null
}

export function defaultCategoryName(key: DefaultCategoryKey, locale: ServerLocale): string {
  return (NAMES[locale] || NAMES.en)[key]
}
