import { z } from 'zod'
import { User, RefundedAccount } from '../../models'
import { seedDefaultCategories } from '../../utils/defaultCategories'
import { validateBody } from '../../utils/validate'
import { enforceRateLimit } from '../../utils/rateLimit'
import { issueSession, issuePending2fa, clearAppSession, readSession } from '../../utils/session'
import { getServerLocale, serverT } from '../../utils/i18n'
import { hashPassword, verifyPassword } from '../../utils/password'
import { logEvent, hashIdentifier } from '../../utils/logger'
import { LEGAL_UPDATED } from '../../../utils/legalContent'

// Fase 8, ponto 9 — ver a verificação em RefundedAccount, mais abaixo.
const REFUND_BLOCK_MS = 6 * 30 * 24 * 60 * 60 * 1000

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
    acceptTerms: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.action === 'register' && !data.name) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'auth.nameRequired', path: ['name'] })
    }
    // Aceitação explícita (checkbox desmarcada por omissão no client) — exigida
    // também no servidor: não pode depender só de a UI a mostrar.
    if (data.action === 'register' && data.acceptTerms !== true) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'auth.termsRequired', path: ['acceptTerms'] })
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

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const locale = getServerLocale(event)

  if (method === 'GET') {
    const userId = readSession(event)
    if (!userId) return { user: null }

    const user = await User.findById(userId).select('name email image twoFactorEnabled').lean()
    if (!user) return { user: null }

    return { user: toPublicUser(user) }
  }

  if (method === 'POST') {
    const { action, email, password, name } = await validateBody(event, AuthBodySchema)

    // Duas camadas: por IP (trava criação/tentativas em massa a partir de uma
    // única origem, mesmo contra emails diferentes) e por IP+email no login
    // (trava força bruta contra uma conta específica sem penalizar todo o IP
    // de imediato — ex. um IP partilhado por vários utilizadores legítimos).
    await enforceRateLimit(event, {
      name: `auth-${action}-ip`,
      limit: action === 'register' ? 5 : 30,
      windowSeconds: 15 * 60,
    })
    if (action === 'login') {
      await enforceRateLimit(event, { name: 'auth-login-identity', limit: 8, windowSeconds: 15 * 60, identity: email })
    }

    let user: any

    if (action === 'register') {
      // Fase 8, ponto 9 — contrapartida da devolução total sem perguntas no
      // direito de livre resolução (Termos, ponto 4): quem foi reembolsado
      // não pode recriar a conta com o mesmo email nos 6 meses seguintes.
      const refunded = await RefundedAccount.findOne({ email }).sort({ refundedAt: -1 }).lean()
      if (refunded && Date.now() - new Date(refunded.refundedAt).getTime() < REFUND_BLOCK_MS) {
        throw createError({ statusCode: 403, message: serverT(locale, 'auth.refundedAccountBlocked') })
      }

      const existing = await User.findOne({ email }).select('+passwordHash')
      if (existing?.passwordHash) {
        throw createError({ statusCode: 409, message: serverT(locale, 'auth.accountAlreadyExists') })
      }

      user = existing || new User({ email })
      user.name = name
      user.passwordHash = hashPassword(password)
      user.provider = 'password'
      user.emailVerified = user.emailVerified || new Date()
      user.termsAcceptedAt = new Date()
      user.termsVersion = LEGAL_UPDATED
      await user.save()
      await seedDefaultCategories(user._id, locale)
    } else {
      user = await User.findOne({ email }).select('+passwordHash')
      if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
        logEvent('warn', 'auth.login_failed', { account: hashIdentifier(email) }, event)
        throw createError({ statusCode: 401, message: serverT(locale, 'auth.invalidCredentials') })
      }
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
