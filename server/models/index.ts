import mongoose, { Schema, Document } from 'mongoose'
import { ASSET_CLASSES, type AssetClass } from '../../shared/portfolio'

// ─── USER ────────────────────────────────────────────────────────────────────
// Ver context/00-CODE-SPEC.md secção 3 e context/features/02-FASE-2-sistema-subscricoes.md
// (processador de pagamentos: EasyPay).
export interface IUserSubscription {
  tier: 'free' | 'pro' | 'premium'
  status: 'active' | 'pending' | 'past_due' | 'canceled' | 'expired'
  provider: 'easypay' | 'none'
  paymentMethod: 'cc' | 'dd' | 'mbway' | 'multibanco' | 'none'
  // 'auto'             = CC/DD via Subscription nativa da EasyPay, cobrança 100% automática
  // 'push_confirm'     = MB WAY — pagamento único de um período fixo, confirmado por push
  // 'manual_reference' = Multibanco — pagamento único de um período fixo, via referência
  // Nenhum dos dois últimos tem renovação automática (decisão de 2026-09-19,
  // ver context/current-feature.md) — expiram no fim do período pago
  // (server/api/subscription/check-expirations.post.ts), sem cron a gerar
  // ciclos seguintes.
  billingMode: 'auto' | 'push_confirm' | 'manual_reference' | 'none'
  autoRenew: boolean
  currentPeriodEnd: Date | null
  // 'auto' (CC/DD): id da Subscription nativa EasyPay. 'push_confirm'/
  // 'manual_reference': id do pagamento único do período em curso, usado por
  // checkPendingPayment() para confirmar manualmente (ver
  // server/utils/subscriptionSync.ts).
  easypaySubscriptionId?: string
  // Referência Multibanco do período em curso ('manual_reference'), por pagar.
  multibancoEntity?: string
  multibancoReference?: string
  multibancoExpiresAt?: Date | null
  reminderSentAt?: Date | null
}

const UserSubscriptionSchema = new Schema<IUserSubscription>(
  {
    tier:             { type: String, enum: ['free', 'pro', 'premium'], default: 'free' },
    status:           { type: String, enum: ['active', 'pending', 'past_due', 'canceled', 'expired'], default: 'active' },
    provider:         { type: String, enum: ['easypay', 'none'], default: 'none' },
    paymentMethod:    { type: String, enum: ['cc', 'dd', 'mbway', 'multibanco', 'none'], default: 'none' },
    billingMode:      { type: String, enum: ['auto', 'push_confirm', 'manual_reference', 'none'], default: 'none' },
    autoRenew:        { type: Boolean, default: false },
    currentPeriodEnd: { type: Date, default: null },
    easypaySubscriptionId:    { type: String },
    multibancoEntity:         { type: String },
    multibancoReference:      { type: String },
    multibancoExpiresAt:      { type: Date, default: null },
    reminderSentAt:           { type: Date, default: null },
  },
  { _id: false }
)

// Perfil de investidor (Fase 3 — Insights com IA). Sem default automático: só
// existe depois do utilizador responder ao questionário. "Renovar anualmente"
// é aplicado em runtime comparando updatedAt (ver server/api/insights/investment.post.ts),
// não há job separado para isto.
export interface IInvestorProfile {
  riskTolerance: 'conservador' | 'moderado' | 'arrojado'
  horizonYears: number
  hasExistingInvestments: boolean
  knowledgeLevel: 'iniciante' | 'intermedio' | 'avancado'
  goals: string[]
  updatedAt: Date
}

const InvestorProfileSchema = new Schema<IInvestorProfile>(
  {
    riskTolerance:          { type: String, enum: ['conservador', 'moderado', 'arrojado'], required: true },
    horizonYears:           { type: Number, required: true, min: 0 },
    hasExistingInvestments: { type: Boolean, required: true },
    knowledgeLevel:         { type: String, enum: ['iniciante', 'intermedio', 'avancado'], required: true },
    goals:                  [{ type: String, trim: true }],
    updatedAt:              { type: Date, required: true },
  },
  { _id: false }
)

export interface IUser extends Document {
  name: string
  email: string
  passwordHash?: string
  image?: string
  emailVerified?: Date
  provider?: string
  subscription: IUserSubscription
  investorProfile?: IInvestorProfile
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name:          { type: String, required: true },
    email:         { type: String, required: true, unique: true, lowercase: true },
    passwordHash:  { type: String, select: false },
    image:         { type: String },
    emailVerified: { type: Date },
    provider:      { type: String, default: 'password' },
    subscription:  { type: UserSubscriptionSchema, default: () => ({}) },
    investorProfile: { type: InvestorProfileSchema },
  },
  { timestamps: true }
)
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

// ─── CATEGORY ────────────────────────────────────────────────────────────────
export interface ICategory extends Document {
  userId:    mongoose.Types.ObjectId
  groupId?:  mongoose.Types.ObjectId
  name:      string
  type:      'income' | 'expense' | 'both'
  icon:      string
  color:     string
  monthlyLimit?: number
  isDefault: boolean
  order:     number
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<ICategory>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    groupId:   { type: Schema.Types.ObjectId, ref: 'TransactionGroup', default: null, index: true },
    name:      { type: String, required: true, trim: true },
    type:      { type: String, enum: ['income', 'expense', 'both'], required: true },
    icon:      { type: String, default: '💰' },
    color:     { type: String, default: '#6366f1' },
    monthlyLimit: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
    order:     { type: Number, default: 99 },
  },
  { timestamps: true }
)
CategorySchema.index({ userId: 1, name: 1 }, { unique: true })
export const Category =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema)

// ─── TRANSACTION GROUP ───────────────────────────────────────────────────────
export interface ITransactionGroup extends Document {
  userId:      mongoose.Types.ObjectId
  name:        string
  description?: string
  color:       string
  monthlyLimit?: number
  weeklyLimit?: number
  alertThreshold?: number
  createdAt:   Date
  updatedAt:   Date
}

const TransactionGroupSchema = new Schema<ITransactionGroup>(
  {
    userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name:        { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    color:       { type: String, default: '#6366f1' },
    monthlyLimit: { type: Number, default: 0 },
    weeklyLimit:  { type: Number, default: 0 },
    alertThreshold: { type: Number, default: 80 },
  },
  { timestamps: true }
)
export const TransactionGroup =
  mongoose.models.TransactionGroup ||
  mongoose.model<ITransactionGroup>('TransactionGroup', TransactionGroupSchema)

// ─── TRANSACTION ─────────────────────────────────────────────────────────────
export interface ITransaction extends Document {
  userId:     mongoose.Types.ObjectId
  type:       'income' | 'expense'
  amount:     number
  description:string
  categoryId: mongoose.Types.ObjectId
  date:       Date
  tags:       string[]
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  notes?:     string
  groupId?:   mongoose.Types.ObjectId
  createdAt:  Date
  updatedAt:  Date
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type:        { type: String, enum: ['income', 'expense'], required: true },
    amount:      { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    categoryId:  { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    date:        { type: Date, required: true, index: true },
    tags:        [{ type: String, trim: true, lowercase: true }],
    recurrence:  {
      type:    String,
      enum:    ['none', 'daily', 'weekly', 'monthly', 'yearly'],
      default: 'none',
    },
    notes:   { type: String, trim: true },
    groupId: { type: Schema.Types.ObjectId, ref: 'TransactionGroup', default: null },
  },
  { timestamps: true }
)
TransactionSchema.index({ userId: 1, date: -1 })
TransactionSchema.index({ userId: 1, type: 1 })
TransactionSchema.index({ userId: 1, categoryId: 1 })
export const Transaction =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema)

// ─── MARKET SNAPSHOT ─────────────────────────────────────────────────────────
// Cache diário do contexto de mercado (Twelve Data), partilhado por todos os
// utilizadores Premium nesse dia — nunca chamar a Twelve Data por utilizador/
// pedido. Ver context/features/03-FASE-3-insights-ia.md tarefa 2 e 5.
export interface IMarketIndex {
  symbol: string
  name: string
  price: number
  changePercent: number
}

export interface IMarketSnapshot extends Document {
  date: string // YYYY-MM-DD, chave única — 1 documento por dia
  indices: IMarketIndex[]
  fetchedAt: Date
}

const MarketSnapshotSchema = new Schema<IMarketSnapshot>({
  date:      { type: String, required: true, unique: true },
  indices: [
    {
      _id:           false,
      symbol:        { type: String, required: true },
      name:          { type: String, required: true },
      price:         { type: Number, required: true },
      changePercent: { type: Number, required: true },
    },
  ],
  fetchedAt: { type: Date, required: true },
})
export const MarketSnapshot =
  mongoose.models.MarketSnapshot ||
  mongoose.model<IMarketSnapshot>('MarketSnapshot', MarketSnapshotSchema)

// ─── DOCUMENT SCAN USAGE ─────────────────────────────────────────────────────
// Contador mensal de documentos digitalizados por utilizador (Fase 5, tarefa 3)
// — rate limiting persistente, atómico via $inc. Um documento por (utilizador,
// mês 'YYYY-MM'); o teto vem de TIER_LIMITS.documentScansPerMonth.
// O `_id` é a própria chave `${userId}:${month}` de propósito: a unicidade que
// o rate limiting exige vem do índice `_id` (sempre presente), não de um
// índice composto — a criação automática de índices não é fiável neste
// projeto (ver server/plugins/mongoose.ts, `bufferCommands: false`).
export interface IDocumentScanUsage extends Document {
  _id: string
  userId: mongoose.Types.ObjectId
  month: string
  count: number
}

const DocumentScanUsageSchema = new Schema<IDocumentScanUsage>({
  _id:    { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  month:  { type: String, required: true },
  count:  { type: Number, required: true, default: 0 },
})
export const DocumentScanUsage =
  mongoose.models.DocumentScanUsage ||
  mongoose.model<IDocumentScanUsage>('DocumentScanUsage', DocumentScanUsageSchema)

// ─── AI INSIGHT CACHE ────────────────────────────────────────────────────────
// Cache de 24h da interpretação de estatísticas por IA (Fase 3, tarefa 4) — um
// documento por utilizador, sobrescrito a cada geração nova, para controlar o
// custo de chamadas à Anthropic.
export interface IAiInsightCache extends Document {
  userId: mongoose.Types.ObjectId
  months: number
  insights: string[]
  suggestions: string[]
  generatedAt: Date
}

const AiInsightCacheSchema = new Schema<IAiInsightCache>({
  userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  months:      { type: Number, required: true },
  insights:    [{ type: String }],
  suggestions: [{ type: String }],
  generatedAt: { type: Date, required: true },
})
export const AiInsightCache =
  mongoose.models.AiInsightCache ||
  mongoose.model<IAiInsightCache>('AiInsightCache', AiInsightCacheSchema)

// ─── INVESTMENT ──────────────────────────────────────────────────────────────
// Registo de investimentos (Fase 6) — uma linha por posição, com os campos da
// folha de Excel do utilizador. Ver context/features/06-FASE-6-registo-investimentos.md.
// `invested`, `gain` e `returnPct` NUNCA são guardados: derivam de
// initialAmount/reinforcement/currentValue em shared/portfolio.ts.
// O índice é só para desempenho — a criação automática de índices não é fiável
// neste projeto (server/plugins/mongoose.ts), por isso nada aqui depende de
// unicidade. Nomes repetidos são permitidos.
export interface IInvestment extends Document {
  userId:         mongoose.Types.ObjectId
  name:           string
  assetClass?:    AssetClass
  initialAmount:  number
  initialDate:    Date
  reinforcement:  number
  currentValue:   number
  valueUpdatedAt: Date
  createdAt:      Date
  updatedAt:      Date
}

const InvestmentSchema = new Schema<IInvestment>(
  {
    userId:         { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name:           { type: String, required: true, trim: true, maxlength: 80 },
    assetClass:     { type: String, enum: ASSET_CLASSES },
    initialAmount:  { type: Number, required: true, min: 0 },
    initialDate:    { type: Date, required: true },
    reinforcement:  { type: Number, required: true, default: 0, min: 0 },
    currentValue:   { type: Number, required: true, min: 0 },
    valueUpdatedAt: { type: Date, required: true },
  },
  { timestamps: true }
)
InvestmentSchema.index({ userId: 1, initialDate: -1 })
export const Investment =
  mongoose.models.Investment || mongoose.model<IInvestment>('Investment', InvestmentSchema)

// ─── INVESTMENT TIPS CACHE ───────────────────────────────────────────────────
// Cache das dicas de investimento por IA (Fase 6, tarefa 6) — um documento por
// utilizador, sobrescrito a cada geração. O `_id` é o próprio userId de
// propósito (mesmo motivo de DocumentScanUsage: a unicidade vem do índice
// `_id`, que existe sempre). `inputHash` cobre o perfil, os agregados do
// portfolio e a data do snapshot de mercado — ver server/utils/investmentTips.ts.
export interface IInvestmentTipsCache extends Document {
  _id: string
  tips: string[]
  inputHash: string
  marketSnapshotDate: string | null
  portfolioIncluded: boolean
  generatedAt: Date
}

const InvestmentTipsCacheSchema = new Schema<IInvestmentTipsCache>({
  _id:                { type: String },
  tips:               [{ type: String }],
  inputHash:          { type: String, required: true },
  marketSnapshotDate: { type: String, default: null },
  portfolioIncluded:  { type: Boolean, required: true, default: false },
  generatedAt:        { type: Date, required: true },
})
export const InvestmentTipsCache =
  mongoose.models.InvestmentTipsCache ||
  mongoose.model<IInvestmentTipsCache>('InvestmentTipsCache', InvestmentTipsCacheSchema)
