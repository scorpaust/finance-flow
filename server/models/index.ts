import mongoose, { Schema, Document } from 'mongoose'

// ─── USER ────────────────────────────────────────────────────────────────────
// Ver context/00-CODE-SPEC.md secção 3 e context/features/02-FASE-2-sistema-subscricoes.md
export interface IUserSubscription {
  tier: 'free' | 'pro' | 'premium'
  status: 'active' | 'pending' | 'past_due' | 'canceled' | 'expired'
  provider: 'paypal' | 'none'
  paymentMethod: 'card' | 'paypal_balance' | 'mbway' | 'multibanco' | 'none'
  // 'recurring' = auto-renovação real (cartão/saldo PayPal, Subscriptions API)
  // 'prepaid'   = período pago à cabeça (MB WAY/Multibanco), expira sem cobrança automática
  periodType: 'recurring' | 'prepaid' | 'none'
  autoRenew: boolean
  currentPeriodEnd: Date | null
  paypalSubscriptionId?: string
  paypalOrderId?: string
  reminderSentAt?: Date | null
}

const UserSubscriptionSchema = new Schema<IUserSubscription>(
  {
    tier:             { type: String, enum: ['free', 'pro', 'premium'], default: 'free' },
    status:           { type: String, enum: ['active', 'pending', 'past_due', 'canceled', 'expired'], default: 'active' },
    provider:         { type: String, enum: ['paypal', 'none'], default: 'none' },
    paymentMethod:    { type: String, enum: ['card', 'paypal_balance', 'mbway', 'multibanco', 'none'], default: 'none' },
    periodType:       { type: String, enum: ['recurring', 'prepaid', 'none'], default: 'none' },
    autoRenew:        { type: Boolean, default: false },
    currentPeriodEnd: { type: Date, default: null },
    paypalSubscriptionId: { type: String },
    paypalOrderId:        { type: String },
    reminderSentAt:       { type: Date, default: null },
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
  },
  { timestamps: true }
)
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

// ─── PENDING PAYPAL ORDER ────────────────────────────────────────────────────
// Mapa temporário order PayPal -> (tier/período/método) para o webhook da Fase 2
// conseguir reconstituir o que foi comprado (a Orders API não guarda isto por si
// só). Criado em create-order.post.ts, consumido e apagado em webhook.post.ts.
export interface IPendingPayPalOrder extends Document {
  paypalOrderId: string
  userId: mongoose.Types.ObjectId
  tier: 'pro' | 'premium'
  periodMonths: number
  paymentMethod: 'mbway' | 'multibanco'
  createdAt: Date
}

const PendingPayPalOrderSchema = new Schema<IPendingPayPalOrder>(
  {
    paypalOrderId: { type: String, required: true, unique: true },
    userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tier:          { type: String, enum: ['pro', 'premium'], required: true },
    periodMonths:  { type: Number, required: true },
    paymentMethod: { type: String, enum: ['mbway', 'multibanco'], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)
// TTL de segurança: Multibanco pode demorar até 7 dias a confirmar — expira só
// depois disso para não perder a reconciliação de um pagamento lento.
PendingPayPalOrderSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 14 })
export const PendingPayPalOrder =
  mongoose.models.PendingPayPalOrder ||
  mongoose.model<IPendingPayPalOrder>('PendingPayPalOrder', PendingPayPalOrderSchema)

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
