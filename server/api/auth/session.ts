import { z } from 'zod'
import { User, Category, TransactionGroup } from '../../models'
import { DEFAULT_BUDGET_GROUPS, PERSONAL_FINANCE_CATEGORIES } from '../../../types'
import { validateBody } from '../../utils/validate'
import { enforceRateLimit } from '../../utils/rateLimit'
import { issueSession, issuePending2fa, clearAppSession, readSession } from '../../utils/session'
import { getServerLocale, serverT } from '../../utils/i18n'
import { hashPassword, verifyPassword } from '../../utils/password'
import { logEvent, hashIdentifier } from '../../utils/logger'

// Fase 8, ponto 1 — shape validado por Zod; as mensagens de negócio (email já
// registado, password errada) continuam a vir de `serverT`, não do Zod, para
// manter a mesma qualidade de mensagem que os outros endpoints do projeto.
const AuthBodySchema = z
  .object({
    action: z.enum(['login', 'register']).catch('login'),
    email: z
      .string()
      .min(1, 'auth.emailRequired')
      .transform((v) => v.trim().toLowerCase())
      .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'auth.emailInvalid'),
    password: z.string().min(8, 'auth.passwordTooShort'),
    name: z.string().trim().optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.action === 'register' && !data.name) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'auth.nameRequired', path: ['name'] })
    }
  })

function toPublicUser(user: any) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    image: user.image,
    twoFactorEnabled: !!user.twoFactorEnabled,
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

// Fase 8 — corrido em série (um `await` por documento) isto fazia ~46 idas e
// voltas sequenciais ao MongoDB Atlas (9 grupos + 37 categorias) em CADA
// login e em CADA `GET /api/auth/session` (todo o arranque da app) — a causa
// real da autenticação "lenta" reportada pelo utilizador (~2s consistentes,
// medidos em dev local). Cada grupo/categoria é independente dos outros
// dentro da mesma fase, só a 2.ª fase (categorias) depende do `groupMap` da
// 1.ª (resolver `category.groupKey`) — por isso as duas fases continuam
// sequenciais entre si, mas cada uma corre em paralelo internamente
// (`Promise.all`). Mesmo resultado (upserts continuam idempotentes), só
// muda a concorrência.
async function seedDefaultBudget(userId: any) {
  const groupEntries = await Promise.all(
    DEFAULT_BUDGET_GROUPS.map(async (group) => {
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
      return [group.key, doc._id] as const
    })
  )
  const groupMap = new Map(groupEntries)

  await Promise.all(
    PERSONAL_FINANCE_CATEGORIES.map(async (category, index) => {
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
      ).catch((e: any) => {
        // Índice único {userId, name} (criado por db:sync-indexes): se dois
        // pedidos correrem o seed ao mesmo tempo, o perdedor da corrida
        // recebe E11000 — a categoria já existe, que é exatamente o objetivo.
        if (e?.code !== 11000) throw e
      })
    })
  )
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const locale = getServerLocale(event)

  if (method === 'GET') {
    const userId = readSession(event)
    if (!userId) return { user: null }

    const user = await User.findById(userId).lean()
    if (!user) return { user: null }
    await seedDefaultBudget(userId)

    return { user: toPublicUser(user) }
  }

  if (method === 'POST') {
    const { action, email, password, name } = await validateBody(event, AuthBodySchema)

    // Duas camadas: por IP (trava criação/tentativas em massa a partir de uma
    // única origem, mesmo contra emails diferentes) e por IP+email no login
    // (trava força bruta contra uma conta específica sem penalizar todo o IP
    // de imediato — ex. um IP partilhado por vários utilizadores legítimos).
    enforceRateLimit(event, {
      name: `auth-${action}-ip`,
      limit: action === 'register' ? 5 : 30,
      windowSeconds: 15 * 60,
    })
    if (action === 'login') {
      enforceRateLimit(event, { name: 'auth-login-identity', limit: 8, windowSeconds: 15 * 60, identity: email })
    }

    let user: any

    if (action === 'register') {
      const existing = await User.findOne({ email }).select('+passwordHash')
      if (existing?.passwordHash) {
        throw createError({ statusCode: 409, message: serverT(locale, 'auth.accountAlreadyExists') })
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
        logEvent('warn', 'auth.login_failed', { account: hashIdentifier(email) }, event)
        throw createError({ statusCode: 401, message: serverT(locale, 'auth.invalidCredentials') })
      }
      await seedDefaultBudget(user._id)
    }

    // Fase 8, ponto 3 — password correta não basta quando o utilizador tem
    // 2FA ativo: um estado intermédio assinado prova que a password foi
    // validada, sem ainda conceder uma sessão completa (ver
    // server/api/auth/2fa/verify.post.ts).
    if (user.twoFactorEnabled) {
      issuePending2fa(event, user._id.toString())
      return { twoFactorRequired: true }
    }

    issueSession(event, user._id.toString())
    return { user: toPublicUser(user) }
  }

  if (method === 'DELETE') {
    clearAppSession(event)
    return { success: true }
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})
