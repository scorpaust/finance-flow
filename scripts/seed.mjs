/**
 * Seed — dados reais baseados no perfil financeiro
 * Uso: MONGODB_URI=mongodb://localhost:27017/financeflow node scripts/seed.mjs
 */
import mongoose from 'mongoose'
import { randomBytes, scryptSync } from 'node:crypto'

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/financeflow'
const DEMO_EMAIL = 'demo@financeflow.app'
const DEMO_PASSWORD = 'password123'

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

const UserSchema        = new mongoose.Schema({ name: String, email: { type: String, unique: true }, passwordHash: String, image: String, provider: String, emailVerified: Date }, { timestamps: true })
const CategorySchema    = new mongoose.Schema({ userId: mongoose.Types.ObjectId, name: String, type: String, icon: String, color: String, isDefault: Boolean, order: Number }, { timestamps: true })
const TransactionSchema = new mongoose.Schema({ userId: mongoose.Types.ObjectId, type: String, amount: Number, description: String, categoryId: mongoose.Types.ObjectId, date: Date, tags: [String], recurrence: { type: String, default: 'none' }, notes: String, groupId: { type: mongoose.Types.ObjectId, default: null } }, { timestamps: true })

const User        = mongoose.model('User',        UserSchema)
const Category    = mongoose.model('Category',    CategorySchema)
const Transaction = mongoose.model('Transaction', TransactionSchema)

const CATS = [
  // Receitas
  { name: 'Salário',                type: 'income',  icon: '💰', color: '#10b981', order: 1  },
  { name: 'Freelance / Extra',      type: 'income',  icon: '💼', color: '#6366f1', order: 2  },
  // Casa
  { name: 'Renda',                  type: 'expense', icon: '🏠', color: '#f43f5e', order: 10 },
  { name: 'Água / Luz / Internet',  type: 'expense', icon: '💡', color: '#f97316', order: 11 },
  { name: 'Seguros / Securitas',    type: 'expense', icon: '🛡️', color: '#3b82f6', order: 12 },
  // Mobilidade
  { name: 'Passe',                  type: 'expense', icon: '🚌', color: '#eab308', order: 20 },
  { name: 'Gasolina',               type: 'expense', icon: '⛽', color: '#f59e0b', order: 21 },
  // Saúde
  { name: 'Ginásio',                type: 'expense', icon: '💪', color: '#14b8a6', order: 30 },
  { name: 'Saúde / Farmácia',       type: 'expense', icon: '💊', color: '#ec4899', order: 31 },
  // Poupança
  { name: 'PPR',                    type: 'expense', icon: '📈', color: '#8b5cf6', order: 40 },
  { name: 'Reserva de Emergência',  type: 'expense', icon: '🔒', color: '#6366f1', order: 41 },
  // Crédito
  { name: 'Crédito CGD',            type: 'expense', icon: '🏦', color: '#7c3aed', order: 50 },
  { name: 'WiZink',                 type: 'expense', icon: '💳', color: '#dc2626', order: 51 },
  { name: 'Outros Créditos',        type: 'expense', icon: '📋', color: '#9ca3af', order: 52 },
  // Trabalho
  { name: 'Ferramentas Profissionais', type: 'expense', icon: '🛠️', color: '#0ea5e9', order: 60 },
  { name: 'Replit',                 type: 'expense', icon: '💻', color: '#0891b2', order: 61 },
  { name: 'OpenAI / Claude',        type: 'expense', icon: '🤖', color: '#059669', order: 62 },
  { name: 'Suno / Waves',           type: 'expense', icon: '🎵', color: '#7c3aed', order: 63 },
  // Alimentação
  { name: 'Supermercado',           type: 'expense', icon: '🛒', color: '#16a34a', order: 70 },
  { name: 'Talho / Frescos',        type: 'expense', icon: '🥩', color: '#b45309', order: 71 },
  { name: 'Restaurante / Café',     type: 'expense', icon: '☕', color: '#d97706', order: 72 },
  // Vida corrente
  { name: 'Dia a Dia',              type: 'expense', icon: '🪙', color: '#78716c', order: 80 },
  { name: 'Lazer / Cultura',        type: 'expense', icon: '🎭', color: '#a855f7', order: 81 },
  // Criativo
  { name: 'Livros / Edição',        type: 'expense', icon: '📚', color: '#2563eb', order: 90 },
]

function d(monthsAgo, day) {
  const dt = new Date()
  dt.setMonth(dt.getMonth() - monthsAgo)
  dt.setDate(day)
  return dt
}

async function seed() {
  await mongoose.connect(URI)
  console.log('✅ MongoDB ligado')

  let user = await User.findOne({ email: DEMO_EMAIL })
  if (!user) {
    user = await User.create({
      name: 'Demo User',
      email: DEMO_EMAIL,
      passwordHash: hashPassword(DEMO_PASSWORD),
      provider: 'password',
      emailVerified: new Date(),
    })
  } else if (!user.passwordHash) {
    user.passwordHash = hashPassword(DEMO_PASSWORD)
    user.provider = 'password'
    await user.save()
  }

  await Category.deleteMany({ userId: user._id })
  await Transaction.deleteMany({ userId: user._id })

  const cats = await Category.insertMany(CATS.map(c => ({ ...c, userId: user._id, isDefault: true })))
  const cm = {}
  cats.forEach(c => { cm[c.name] = c._id })
  console.log(`📂 ${cats.length} categorias criadas`)

  // 6 meses de transacções realistas
  const txs = []
  for (let m = 5; m >= 0; m--) {
    // Receita
    txs.push({ type: 'income', amount: 1587 + (Math.random() * 30 - 15), description: 'Salário', categoryId: cm['Salário'], date: d(m, 1), tags: ['salário'], recurrence: 'monthly' })

    // Fixos mensais
    txs.push({ type: 'expense', amount: 490,    description: 'Renda',              categoryId: cm['Renda'],                  date: d(m, 2),  tags: ['fixo'], recurrence: 'monthly' })
    txs.push({ type: 'expense', amount: 80,     description: 'PPR Allianz',        categoryId: cm['PPR'],                    date: d(m, 2),  tags: ['poupança'], recurrence: 'monthly' })
    txs.push({ type: 'expense', amount: 106.92, description: 'Ginásio Holmes',     categoryId: cm['Ginásio'],                date: d(m, 3),  tags: ['saúde'], recurrence: 'monthly' })
    txs.push({ type: 'expense', amount: 70,     description: 'Crédito CGD',        categoryId: cm['Crédito CGD'],            date: d(m, 5),  tags: ['crédito'], recurrence: 'monthly' })
    txs.push({ type: 'expense', amount: 40,     description: 'Passe Navegante',    categoryId: cm['Passe'],                  date: d(m, 1),  tags: ['fixo'], recurrence: 'monthly' })
    txs.push({ type: 'expense', amount: 40,     description: 'Gasolina',           categoryId: cm['Gasolina'],               date: d(m, 10 + Math.floor(Math.random()*5)), tags: ['carro'] })
    txs.push({ type: 'expense', amount: 140,    description: 'Seguros + Securitas', categoryId: cm['Seguros / Securitas'],   date: d(m, 4),  tags: ['fixo'], recurrence: 'monthly' })
    txs.push({ type: 'expense', amount: 148 + (Math.random() * 20 - 10), description: 'NOS + Água + Luz', categoryId: cm['Água / Luz / Internet'], date: d(m, 8), tags: ['casa'] })

    // Ferramentas (alguns meses variam)
    txs.push({ type: 'expense', amount: 25,     description: 'Replit',             categoryId: cm['Replit'],                 date: d(m, 6),  tags: ['trabalho'], recurrence: 'monthly' })
    txs.push({ type: 'expense', amount: 20,     description: 'OpenAI Plus',        categoryId: cm['OpenAI / Claude'],        date: d(m, 6),  tags: ['trabalho'], recurrence: 'monthly' })
    txs.push({ type: 'expense', amount: 20,     description: 'Claude Pro',         categoryId: cm['OpenAI / Claude'],        date: d(m, 6),  tags: ['trabalho'], recurrence: 'monthly' })
    if (m % 2 === 0) txs.push({ type: 'expense', amount: 22, description: 'Suno AI', categoryId: cm['Suno / Waves'],        date: d(m, 7),  tags: ['trabalho', 'música'] })

    // Alimentação semanal
    for (const week of [5, 12, 19, 26]) {
      txs.push({ type: 'expense', amount: 38 + (Math.random()*15-5), description: 'Supermercado', categoryId: cm['Supermercado'], date: d(m, week), tags: ['alimentação'] })
    }
    if (Math.random() > 0.4) txs.push({ type: 'expense', amount: 18 + Math.random()*12, description: 'Talho', categoryId: cm['Talho / Frescos'], date: d(m, 14), tags: ['alimentação'] })
    if (Math.random() > 0.5) txs.push({ type: 'expense', amount: 4 + Math.random()*6, description: 'Café', categoryId: cm['Restaurante / Café'], date: d(m, 8 + Math.floor(Math.random()*5)) })

    // Vida corrente
    if (Math.random() > 0.3) txs.push({ type: 'expense', amount: 3 + Math.random()*8, description: 'Compras pequenas', categoryId: cm['Dia a Dia'], date: d(m, 15 + Math.floor(Math.random()*7)) })

    // WiZink (prestações/pagamentos)
    if (m > 0) { // mês 0 = atual: pagamento grande
      txs.push({ type: 'expense', amount: 80 + Math.random()*40, description: 'WiZink prestação', categoryId: cm['WiZink'], date: d(m, 12), tags: ['crédito'] })
    }
  }

  // Eventos especiais (no mês atual)
  txs.push({ type: 'expense', amount: 1500, description: 'Pagamento WiZink (amortização)', categoryId: cm['WiZink'], date: d(0, 3), tags: ['crédito', 'amortização'] })
  txs.push({ type: 'expense', amount: 1185, description: 'Edição livros', categoryId: cm['Livros / Edição'], date: d(0, 4), tags: ['criativo', 'investimento'] })

  // Freelance ocasional
  txs.push({ type: 'income', amount: 350, description: 'Projeto freelance', categoryId: cm['Freelance / Extra'], date: d(2, 18), tags: ['extra'] })
  txs.push({ type: 'income', amount: 200, description: 'Consultoria', categoryId: cm['Freelance / Extra'], date: d(4, 22), tags: ['extra'] })

  const txWithUser = txs.map(t => ({ ...t, userId: user._id, recurrence: t.recurrence || 'none', groupId: null }))
  await Transaction.insertMany(txWithUser)
  console.log(`💳 ${txWithUser.length} transacções criadas (6 meses)`)
  console.log('\n🎉 Seed completo! Login: demo@financeflow.app')
  console.log(`   Saldo simulado: ~${3347} € | Orçamento mensal: ~1.597 €`)

  await mongoose.disconnect()
}
seed().catch(e => { console.error(e); process.exit(1) })
