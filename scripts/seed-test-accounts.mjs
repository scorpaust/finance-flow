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
 * em vez de os duplicar. Categorias e grupos são reutilizados pelo nome (os
 * nomes por omissão em português); a carteira só é criada se a conta não
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

// Categorias por omissão da app (pt-PT, server/utils/defaultCategories.ts).
const CATEGORIES = {
  salary: { name: 'Salário', type: 'income', icon: '💰', color: '#10b981' },
  otherIncome: { name: 'Outros rendimentos', type: 'income', icon: '📈', color: '#22c55e' },
  housing: { name: 'Habitação', type: 'expense', icon: '🏠', color: '#f43f5e' },
  groceries: { name: 'Alimentação', type: 'expense', icon: '🛒', color: '#f97316' },
  transport: { name: 'Transportes', type: 'expense', icon: '🚗', color: '#eab308' },
  health: { name: 'Saúde', type: 'expense', icon: '💊', color: '#ec4899' },
  bills: { name: 'Contas da casa', type: 'expense', icon: '💡', color: '#3b82f6' },
  leisure: { name: 'Lazer', type: 'expense', icon: '🎮', color: '#06b6d4' },
  shopping: { name: 'Compras', type: 'expense', icon: '🛍️', color: '#a855f7' },
}
const GROUPS = {
  home: { name: 'Casa', color: '#f43f5e', categories: ['housing', 'bills'] },
  outings: { name: 'Saídas e lazer', color: '#06b6d4', categories: ['leisure'] },
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
function monthTransactions({ year, month, i, maxDay, rand }) {
  const out = []
  const day = (d) => (d <= maxDay ? new Date(Date.UTC(year, month - 1, d, 12)) : null)
  const add = (key, type, amount, description, d, recurrence = 'none') => {
    const date = day(d)
    if (date) out.push({ key, type, amount: round2(amount), description, date, recurrence })
  }
  const between = (min, max) => min + rand() * (max - min)

  // Receitas: salário com aumento a meio do período, extras ocasionais.
  add('salary', 'income', i >= 3 ? 1950 : 1850, 'Salário', 1, 'monthly')
  if (i % 3 === 1) add('otherIncome', 'income', between(150, 350), 'Trabalho extra', 20)

  // Fixas (recorrentes ou muito regulares).
  add('housing', 'expense', 650, 'Renda', 2, 'monthly')
  add('bills', 'expense', between(55, 75), 'Eletricidade', 8)
  add('bills', 'expense', 32, 'Internet e telemóvel', 9, 'monthly')
  add('bills', 'expense', between(18, 26), 'Água', 12)
  add('transport', 'expense', 40, 'Passe', 1, 'monthly')
  add('health', 'expense', 35, 'Ginásio', 3, 'monthly')

  // Variáveis: a alimentação sobe um pouco ao longo dos meses (tendência).
  for (const d of [4, 11, 18, 25]) add('groceries', 'expense', between(55, 70) + i * 3, 'Supermercado', d)
  add('transport', 'expense', between(35, 60), 'Combustível', 14)
  if (rand() > 0.4) add('health', 'expense', between(12, 40), 'Farmácia', 16)

  // Discricionárias.
  add('leisure', 'expense', between(25, 45), 'Jantar fora', 7)
  add('leisure', 'expense', between(12, 22), 'Cinema', 15)
  add('leisure', 'expense', between(30, 70), 'Restaurante', 22)
  add('leisure', 'expense', 11, 'Streaming', 10, 'monthly')
  add('shopping', 'expense', between(30, 90), 'Roupa', 13)
  if (i % 2 === 0) add('shopping', 'expense', between(60, 160), 'Casa e decoração', 24)

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

  // Categorias: reutiliza pelo nome, cria as que faltarem.
  const existingCats = await db.collection('categories').find({ userId }).toArray()
  const catId = {}
  for (const [key, c] of Object.entries(CATEGORIES)) {
    const found = existingCats.find((x) => x.name.toLowerCase() === c.name.toLowerCase())
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
  for (const g of Object.values(GROUPS)) {
    let groupId = existingGroups.find((x) => x.name.toLowerCase() === g.name.toLowerCase())?._id
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
    for (const t of monthTransactions({ year, month, i, maxDay: Math.min(maxDay, new Date(Date.UTC(year, month, 0)).getUTCDate()), rand })) {
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
