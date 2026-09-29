import {
  User,
  Category,
  TransactionGroup,
  Transaction,
  Investment,
  InvestmentTipsCache,
  AiInsightCache,
  DocumentScanUsage,
} from '../models'
import { cancelSubscription } from './easypay'

// Partilhado por server/api/account/index.delete.ts (o próprio utilizador,
// autenticado) e server/api/admin/refund-delete.post.ts (o operador, depois
// de um reembolso de livre resolução) — a mesma limpeza de dados nos dois
// casos. Cancela a subscrição com renovação automática na EasyPay ANTES de
// apagar; se falhar, não apaga (o cliente não pode ficar a ser cobrado por
// uma conta que já não existe).
export async function deleteUserAccount(userId: string): Promise<void> {
  const user = await User.findById(userId)
  if (!user) return

  const sub = user.subscription
  if (sub?.billingMode === 'auto' && sub.easypaySubscriptionId && ['active', 'past_due'].includes(sub.status)) {
    await cancelSubscription(sub.easypaySubscriptionId)
  }

  await Promise.all([
    Category.deleteMany({ userId }),
    TransactionGroup.deleteMany({ userId }),
    Transaction.deleteMany({ userId }),
    Investment.deleteMany({ userId }),
    AiInsightCache.deleteMany({ userId }),
    DocumentScanUsage.deleteMany({ userId }),
    InvestmentTipsCache.deleteOne({ _id: String(userId) }),
  ])
  await User.deleteOne({ _id: userId })
}
