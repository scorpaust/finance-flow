/**
 * Upgrade 04 — dados de teste para as contas dos testers: 6 meses COMPLETOS
 * de receitas e despesas realistas (e o mês em curso até hoje), para se ver
 * tudo — previsões com o modelo de IA (≥ 5 meses completos), orçamento
 * sugerido (≥ 3), estatísticas, grupos com tetos e a carteira de
 * investimentos.
 *
 * Uso (a ligação de produção só tu a tens, como no backup):
 *   MONGODB_URI=<uri> MONGODB_DB_NAME=financeflow-prod \
 *     node scripts/seed-test-accounts.mjs [--dry] [--replace] [--reset-budget] email1 [email2 ...]
 *
 *   --dry           mostra o que faria, sem escrever nada
 *   --replace       apaga TODAS as transações da conta antes (não só as do
 *                   seed) — para contas que já tinham dados de teste antigos,
 *                   que se iam somar aos novos nos mesmos meses
 *   --reset-budget  apaga a proposta de orçamento sugerido deste mês, para o
 *                   tester poder pedir uma nova
 *
 * Só mexe em contas que já existem (não cria contas nem muda o plano). Os
 * dados gerados levam a etiqueta `dados-teste`: correr outra vez substitui-os
 * em vez de os duplicar. Usa as categorias por omissão na língua em que a
 * conta foi criada (deteta-a pelos nomes) e reutiliza grupos pelo nome; a carteira só é criada se a conta não
 * tiver nenhum investimento. Os valores são sempre os mesmos (gerador com
 * semente fixa) e o mês em curso pára no dia de hoje.
 */
import mongoose from 'mongoose'

const TAG = 'dados-teste'
const MONTHS = 6

const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const REPLACE = args.includes('--replace')
const RESET_BUDGET = args.includes('--reset-budget')
const emails = args.filter((a) => !a.startsWith('--')).map((e) => e.trim().toLowerCase())

// Mesmas tolerâncias do scripts/backup-mongo.mjs; nunca imprime o valor.
const URI = (process.env.MONGODB_URI || '').trim().replace(/^MONGODB_URI\s*=\s*/, '').replace(/^["']|["']$/g, '').trim()
const DB_NAME = (process.env.MONGODB_DB_NAME || 'financeflow').trim()
if (!URI || !/^mongodb(\+srv)?:\/\//.test(URI)) {
  console.error('MONGODB_URI em falta ou inválido.')
  process.exit(1)
}
if (!emails.length) {
  console.error('Indica pelo menos um email: node scripts/seed-test-accounts.mjs [--dry] email1 [email2 ...]')
  process.exit(1)
}

// Gerador com semente fixa (mulberry32): os mesmos valores em todas as corridas.
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const round2 = (v) => Math.round(v * 100) / 100

// Categorias por omissão da app, nas 6 línguas (as mesmas de
// server/utils/defaultCategories.ts — manter iguais). A conta é criada na
// língua em que se registou; o script deteta-a pelos nomes que já tem e usa
// as categorias dessa língua, sem criar duplicados noutra.
const CATEGORY_STYLE = {
  salary: { type: 'income', icon: '💰', color: '#10b981' },
  otherIncome: { type: 'income', icon: '📈', color: '#22c55e' },
  housing: { type: 'expense', icon: '🏠', color: '#f43f5e' },
  groceries: { type: 'expense', icon: '🛒', color: '#f97316' },
  transport: { type: 'expense', icon: '🚗', color: '#eab308' },
  health: { type: 'expense', icon: '💊', color: '#ec4899' },
  bills: { type: 'expense', icon: '💡', color: '#3b82f6' },
  leisure: { type: 'expense', icon: '🎮', color: '#06b6d4' },
  shopping: { type: 'expense', icon: '🛍️', color: '#a855f7' },
}
const CATEGORY_NAMES = {
  'pt-PT': { salary: 'Salário', otherIncome: 'Outros rendimentos', housing: 'Habitação', groceries: 'Alimentação', transport: 'Transportes', health: 'Saúde', bills: 'Contas da casa', leisure: 'Lazer', shopping: 'Compras' },
  en: { salary: 'Salary', otherIncome: 'Other income', housing: 'Housing', groceries: 'Groceries', transport: 'Transport', health: 'Health', bills: 'Bills & utilities', leisure: 'Leisure', shopping: 'Shopping' },
  fr: { salary: 'Salaire', otherIncome: 'Autres revenus', housing: 'Logement', groceries: 'Alimentation', transport: 'Transports', health: 'Santé', bills: 'Factures', leisure: 'Loisirs', shopping: 'Achats' },
  de: { salary: 'Gehalt', otherIncome: 'Sonstige Einnahmen', housing: 'Wohnen', groceries: 'Lebensmittel', transport: 'Verkehr', health: 'Gesundheit', bills: 'Nebenkosten', leisure: 'Freizeit', shopping: 'Einkäufe' },
  it: { salary: 'Stipendio', otherIncome: 'Altre entrate', housing: 'Casa', groceries: 'Spesa alimentare', transport: 'Trasporti', health: 'Salute', bills: 'Bollette', leisure: 'Tempo libero', shopping: 'Acquisti' },
  es: { salary: 'Salario', otherIncome: 'Otros ingresos', housing: 'Vivienda', groceries: 'Alimentación', transport: 'Transporte', health: 'Salud', bills: 'Facturas', leisure: 'Ocio', shopping: 'Compras' },
}
const GROUP_NAMES = {
  'pt-PT': { home: 'Casa', outings: 'Saídas e lazer' },
  en: { home: 'Home', outings: 'Going out' },
  fr: { home: 'Maison', outings: 'Sorties et loisirs' },
  de: { home: 'Zuhause', outings: 'Ausgehen und Freizeit' },
  it: { home: 'Casa e bollette', outings: 'Uscite e svago' },
  es: { home: 'Hogar', outings: 'Salidas y ocio' },
}
const GROUPS = {
  home: { color: '#f43f5e', categories: ['housing', 'bills'] },
  outings: { color: '#06b6d4', categories: ['leisure'] },
}
// Descrições das transações: PT-PT para contas em português, inglês nas outras.
const DESCRIPTIONS = {
  'pt-PT': {
    salary: 'Salário', extra: 'Trabalho extra', rent: 'Renda', electricity: 'Eletricidade', internet: 'Internet e telemóvel',
    water: 'Água', pass: 'Passe', gym: 'Ginásio', supermarket: 'Supermercado', fuel: 'Combustível', pharmacy: 'Farmácia',
    dinner: 'Jantar fora', cinema: 'Cinema', restaurant: 'Restaurante', streaming: 'Streaming', clothes: 'Roupa', home: 'Casa e decoração',
  },
  en: {
    salary: 'Salary', extra: 'Side job', rent: 'Rent', electricity: 'Electricity', internet: 'Internet and phone',
    water: 'Water', pass: 'Transit pass', gym: 'Gym', supermarket: 'Supermarket', fuel: 'Fuel', pharmacy: 'Pharmacy',
    dinner: 'Dinner out', cinema: 'Cinema', restaurant: 'Restaurant', streaming: 'Streaming', clothes: 'Clothes', home: 'Home and decor',
  },
}

const norm = (v) => String(v).trim().toLocaleLowerCase()
// Língua das categorias da conta: a que tem mais nomes por omissão em comum.
function detectLocale(existingNames) {
  const names = new Set(existingNames.map(norm))
  let best = 'pt-PT'
  let bestHits = 0
  for (const [locale, map] of Object.entries(CATEGORY_NAMES)) {
    const hits = Object.values(map).filter((n) => names.has(norm(n))).length
    if (hits > bestHits) {
      best = locale
      bestHits = hits
    }
  }
  return best
}

// 'YYYY-MM' do mês em curso em Lisboa (como o servidor, shared/forecast.ts).
function currentMonthKey(now = new Date()) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit' })
      .formatToParts(now)
      .map((x) => [x.type, x.value])
  )
  return { year: Number(p.year), month: Number(p.month) }
}

// Transações de um mês. `i` = 0 é o mais antigo; o mês em curso é i = MONTHS.
// Datas ao meio-dia UTC de um dia do calendário (como a app as grava, um dia).
function monthTransactions({ year, month, i, maxDay, rand, text }) {
  const out = []
  const day = (d) => (d <= maxDay ? new Date(Date.UTC(year, month - 1, d, 12)) : null)
  const add = (key, type, amount, description, d, recurrence = 'none') => {
    const date = day(d)
    if (date) out.push({ key, type, amount: round2(amount), description, date, recurrence })
  }
  const between = (min, max) => min + rand() * (max - min)

  // Receitas: salário com aumento a meio do período, extras ocasionais.
  add('salary', 'income', i >= 3 ? 1950 : 1850, text.salary, 1, 'monthly')
  if (i % 3 === 1) add('otherIncome', 'income', between(150, 350), text.extra, 20)

  // Fixas (recorrentes ou muito regulares).
  add('housing', 'expense', 650, text.rent, 2, 'monthly')
  add('bills', 'expense', between(55, 75), text.electricity, 8)
  add('bills', 'expense', 32, text.internet, 9, 'monthly')
  add('bills', 'expense', between(18, 26), text.water, 12)
  add('transport', 'expense', 40, text.pass, 1, 'monthly')
  add('health', 'expense', 35, text.gym, 3, 'monthly')

  // Variáveis (variação > 10% de mês para mês, para não passarem por fixas);
  // a alimentação sobe um pouco ao longo dos meses (tendência).
  for (const d of [4, 11, 18, 25]) add('groceries', 'expense', between(35, 105) + i * 3, text.supermarket, d)
  add('transport', 'expense', between(15, 95), text.fuel, 14)
  if (rand() > 0.4) add('health', 'expense', between(12, 40), text.pharmacy, 16)

  // Discricionárias.
  add('leisure', 'expense', between(25, 45), text.dinner, 7)
  add('leisure', 'expense', between(12, 22), text.cinema, 15)
  add('leisure', 'expense', between(30, 70), text.restaurant, 22)
  add('leisure', 'expense', 11, text.streaming, 10, 'monthly')
  add('shopping', 'expense', between(30, 90), text.clothes, 13)
  if (i % 2 === 0) add('shopping', 'expense', between(60, 160), text.home, 24)

  return out
}

const conn = await mongoose.createConnection(URI).asPromise()
const db = conn.useDb(DB_NAME).db
console.log(`Base de dados: ${DB_NAME}${DRY ? ' (--dry: nada é escrito)' : ''}`)

const { year: cy, month: cm } = currentMonthKey()
const todayLisbon = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Lisbon', day: 'numeric' }).format(new Date()))

for (const email of emails) {
  const user = await db.collection('users').findOne({ email })
  if (!user) {
    console.log(`\n✗ ${email}: conta não encontrada (cria-a primeiro na app)`)
    continue
  }
  const userId = user._id
  const now = new Date()
  console.log(`\n▶ ${email} (plano ${user.subscription?.tier || 'free'}/${user.subscription?.status || '—'})`)

  // Categorias: as por omissão na língua da conta; cria só as que faltarem.
  const existingCats = await db.collection('categories').find({ userId }).toArray()
  const locale = detectLocale(existingCats.map((c) => c.name))
  const text = DESCRIPTIONS[locale] || DESCRIPTIONS.en
  console.log(`  língua das categorias: ${locale}`)
  const catId = {}
  for (const [key, style] of Object.entries(CATEGORY_STYLE)) {
    const c = { name: CATEGORY_NAMES[locale][key], ...style }
    const found = existingCats.find((x) => norm(x.name) === norm(c.name))
    if (found) {
      catId[key] = found._id
    } else {
      catId[key] = new mongoose.Types.ObjectId()
      console.log(`  + categoria ${c.name}`)
      if (!DRY) {
        await db.collection('categories').insertOne({
          _id: catId[key], userId, ...c, groupId: null, monthlyLimit: 0, isDefault: true, order: 99, createdAt: now, updatedAt: now,
        })
      }
    }
  }

  // Grupos: reutiliza pelo nome; as categorias sem grupo passam a pertencer-lhe.
  const existingGroups = await db.collection('transactiongroups').find({ userId }).toArray()
  for (const [gkey, gStyle] of Object.entries(GROUPS)) {
    const g = { ...gStyle, name: GROUP_NAMES[locale][gkey] }
    let groupId = existingGroups.find((x) => norm(x.name) === norm(g.name))?._id
    if (!groupId) {
      groupId = new mongoose.Types.ObjectId()
      console.log(`  + grupo ${g.name}`)
      if (!DRY) {
        await db.collection('transactiongroups').insertOne({
          _id: groupId, userId, name: g.name, color: g.color, monthlyLimit: 0, weeklyLimit: 0, alertThreshold: 80, createdAt: now, updatedAt: now,
        })
      }
    }
    if (!DRY) {
      await db.collection('categories').updateMany(
        { userId, _id: { $in: g.categories.map((k) => catId[k]) }, groupId: null },
        { $set: { groupId, updatedAt: now } }
      )
    }
  }

  // Transações: 6 meses completos + o mês em curso até hoje.
  const rand = rng(20261009)
  const txs = []
  for (let i = 0; i <= MONTHS; i++) {
    const total = cy * 12 + (cm - 1) - (MONTHS - i)
    const year = Math.floor(total / 12)
    const month = (total % 12) + 1
    const maxDay = i === MONTHS ? todayLisbon : 31
    for (const t of monthTransactions({ year, month, i, maxDay: Math.min(maxDay, new Date(Date.UTC(year, month, 0)).getUTCDate()), rand, text })) {
      txs.push({
        userId,
        type: t.type,
        amount: t.amount,
        description: t.description,
        categoryId: catId[t.key],
        date: t.date,
        tags: [TAG],
        recurrence: t.recurrence,
        groupId: null,
        currency: 'EUR',
        originalAmount: null,
        exchangeRate: null,
        createdAt: now,
        updatedAt: now,
      })
    }
  }

  const removeFilter = REPLACE ? { userId } : { userId, tags: TAG }
  const toRemove = await db.collection('transactions').countDocuments(removeFilter)
  const income = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  console.log(`  − ${toRemove} transações ${REPLACE ? '(todas as da conta, --replace)' : `anteriores com a etiqueta "${TAG}"`}`)
  console.log(`  + ${txs.length} transações (${MONTHS} meses completos + mês em curso até dia ${todayLisbon}); receitas ${round2(income)} €, despesas ${round2(expense)} €`)
  if (!DRY) {
    await db.collection('transactions').deleteMany(removeFilter)
    await db.collection('transactions').insertMany(txs)
  }

  // Carteira de investimentos, só se a conta não tiver nenhum.
  if ((await db.collection('investments').countDocuments({ userId })) === 0) {
    const start = (monthsAgo) => new Date(Date.UTC(cy, cm - 1 - monthsAgo, 5))
    const investments = [
      { name: 'ETF MSCI World', assetClass: 'etf', initialAmount: 2000, initialDate: start(10), reinforcement: 600, currentValue: 2890 },
      { name: 'Certificados de Aforro', assetClass: 'obrigacoes', initialAmount: 1500, initialDate: start(8), reinforcement: 0, currentValue: 1542 },
      { name: 'Depósito a prazo', assetClass: 'deposito', initialAmount: 1000, initialDate: start(4), reinforcement: 0, currentValue: 1012 },
    ]
    console.log(`  + ${investments.length} investimentos`)
    if (!DRY) {
      await db.collection('investments').insertMany(
        investments.map((v) => ({ ...v, userId, valueUpdatedAt: now, createdAt: now, updatedAt: now }))
      )
    }
  } else {
    console.log('  = investimentos: a conta já tem, ficam como estão')
  }

  if (RESET_BUDGET) {
    const id = `${userId}:${cy}-${String(cm).padStart(2, '0')}`
    const has = await db.collection('aibudgetproposals').countDocuments({ _id: id })
    console.log(`  − proposta de orçamento deste mês: ${has ? 'apagada' : 'não havia'}`)
    if (!DRY && has) await db.collection('aibudgetproposals').deleteOne({ _id: id })
  }
}

await conn.close()
console.log(DRY ? '\n(--dry) Nada foi escrito.' : '\nFeito.')
