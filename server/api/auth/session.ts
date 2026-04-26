import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { User, Category, TransactionGroup } from '../../models'
import { DEFAULT_BUDGET_GROUPS, PERSONAL_FINANCE_CATEGORIES } from '../../../types'

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false

  const expected = Buffer.from(hash, 'hex')
  const actual = scryptSync(password, salt, 64)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

function toPublicUser(user: any) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    image: user.image,
  }
}

const GROUP_NAME_OVERRIDES: Record<string, { name: string; description: string; aliases: string[] }> = {
  casa: { name: 'Casa', description: 'Renda e contas da casa', aliases: ['Casa'] },
  deslocacao: { name: 'Deslocação', description: 'Passe e gasolina', aliases: ['Deslocacao'] },
  estabilidade: { name: 'Estabilidade pessoal', description: 'PPR, ginásio e seguros', aliases: ['Estabilidade pessoal'] },
  credito: { name: 'Crédito', description: 'CGD e restantes prestações', aliases: ['Credito'] },
  trabalho: { name: 'Trabalho', description: 'Ferramentas profissionais essenciais', aliases: ['Trabalho'] },
  alimentacao: { name: 'Alimentação', description: 'Supermercado e talho', aliases: ['Alimentacao'] },
  'vida-diaria': { name: 'Vida diária', description: 'Pequenas despesas, lazer e cultura', aliases: ['Vida diaria'] },
  criativo: { name: 'Investimento criativo', description: 'Edição dos dois livros', aliases: ['Investimento criativo'] },
  reserva: { name: 'Reserva defensiva', description: 'Almofada de segurança intocável', aliases: ['Reserva defensiva'] },
}

const CATEGORY_NAME_OVERRIDES: Record<string, { name: string; aliases: string[] }> = {
  Salario: { name: 'Salário', aliases: ['Salario', 'SalÃ¡rio'] },
  'Agua + luz + NOS + casa': { name: 'Água + luz + NOS + casa', aliases: ['Agua + luz + NOS + casa', 'Ãgua + luz + NOS + casa'] },
  Ginasio: { name: 'Ginásio', aliases: ['Ginasio', 'GinÃ¡sio'] },
  'Credito novo CGD': { name: 'Crédito novo CGD', aliases: ['Credito novo CGD', 'CrÃ©dito CGD'] },
  'Outros creditos remanescentes': { name: 'Outros créditos remanescentes', aliases: ['Outros creditos remanescentes', 'Outros CrÃ©ditos'] },
  'WiZink amortizacao': { name: 'WiZink amortização', aliases: ['WiZink amortizacao', 'WiZink amortizaÃ§Ã£o', 'WiZink'] },
  'Edicao livros': { name: 'Edição de livros', aliases: ['Edicao livros', 'EdiÃ§Ã£o livros', 'Livros / EdiÃ§Ã£o'] },
  'Reserva de emergencia': { name: 'Reserva de emergência', aliases: ['Reserva de emergencia', 'Reserva de EmergÃªncia'] },
}

async function seedDefaultBudget(userId: any) {
  const groupMap = new Map<string, any>()

  for (const group of DEFAULT_BUDGET_GROUPS) {
    const display = GROUP_NAME_OVERRIDES[group.key] || {
      name: group.name,
      description: group.description,
      aliases: [],
    }
    const doc = await TransactionGroup.findOneAndUpdate(
      { userId, name: { $in: [group.name, display.name, ...display.aliases] } },
      {
        userId,
        name: display.name,
        description: display.description,
        color: group.color,
        monthlyLimit: group.monthlyLimit,
        weeklyLimit: group.weeklyLimit || 0,
        alertThreshold: group.alertThreshold,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
    groupMap.set(group.key, doc._id)
  }

  for (const [index, category] of PERSONAL_FINANCE_CATEGORIES.entries()) {
    const display = CATEGORY_NAME_OVERRIDES[category.name || ''] || {
      name: category.name,
      aliases: [],
    }
    await Category.findOneAndUpdate(
      { userId, name: { $in: [category.name, display.name, ...display.aliases].filter(Boolean) } },
      {
        userId,
        groupId: category.groupKey ? groupMap.get(category.groupKey) : null,
        name: display.name,
        type: category.type,
        icon: category.icon,
        color: category.color,
        monthlyLimit: category.monthlyLimit || 0,
        isDefault: true,
        order: index + 1,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
  }
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  if (method === 'GET') {
    const userId = getCookie(event, 'userId')
    if (!userId) return { user: null }

    const user = await User.findById(userId).lean()
    if (!user) return { user: null }
    await seedDefaultBudget(userId)

    return { user: toPublicUser(user) }
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const action = body.action === 'register' ? 'register' : 'login'
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const name = String(body.name || '').trim()

    if (!email) throw createError({ statusCode: 400, message: 'Email obrigatorio' })
    if (password.length < 8) {
      throw createError({ statusCode: 400, message: 'A password deve ter pelo menos 8 caracteres' })
    }

    let user: any

    if (action === 'register') {
      if (!name) throw createError({ statusCode: 400, message: 'Nome obrigatorio' })

      const existing = await User.findOne({ email }).select('+passwordHash')
      if (existing?.passwordHash) {
        throw createError({ statusCode: 409, message: 'Ja existe uma conta com este email' })
      }

      user = existing || new User({ email })
      user.name = name
      user.passwordHash = hashPassword(password)
      user.provider = 'password'
      user.emailVerified = user.emailVerified || new Date()
      await user.save()
      await seedDefaultBudget(user._id)
    } else {
      user = await User.findOne({ email }).select('+passwordHash')
      if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
        throw createError({ statusCode: 401, message: 'Email ou password invalidos' })
      }
      await seedDefaultBudget(user._id)
    }

    setCookie(event, 'userId', user._id.toString(), {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === 'production',
    })

    return { user: toPublicUser(user) }
  }

  if (method === 'DELETE') {
    deleteCookie(event, 'userId')
    return { success: true }
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})
