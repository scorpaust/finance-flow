import { User } from '../models'
import { getServerLocale, serverT } from './i18n'
import type { H3Event } from 'h3'

// Fase 8, ponto 5 — comprar um plano novo (pré-pago ou outro cartão) com uma
// subscrição de renovação automática (CC/DD) ainda ativa sobrepunha o registo
// local mas deixava a subscrição recorrente ativa na EasyPay: o cliente
// continuava a ser cobrado por um plano que já não estava associado à conta
// (cobrança dupla em produção). Exige cancelar primeiro — o fluxo já
// documentado ("mudar de plano = cancelar + subscrever"). Depois de cancelada
// (status 'canceled') o acesso mantém-se até ao fim do período e uma compra
// nova é permitida.
export async function assertNoActiveAutoRenew(event: H3Event, userId: string): Promise<void> {
  const user = await User.findById(userId).select('subscription').lean<{ subscription?: any }>()
  const sub = user?.subscription
  if (sub?.billingMode === 'auto' && sub.easypaySubscriptionId && ['active', 'past_due'].includes(sub.status)) {
    throw createError({
      statusCode: 409,
      message: serverT(getServerLocale(event), 'subscriptionApi.activeAutoRenewExists'),
      data: { error: 'active_auto_renew' },
    })
  }
}
