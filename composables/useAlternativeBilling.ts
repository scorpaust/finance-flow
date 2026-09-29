import { Capacitor, registerPlugin } from '@capacitor/core'

// Fase 9 — "alternative billing only" da Google Play (EEE). Na app Android,
// antes de cada compra com a EasyPay, o plugin nativo
// (android/.../AlternativeBillingPlugin.java) confirma que o programa está
// disponível, mostra o ecrã informativo da Google e devolve o token da
// transação, que vai no pedido de criação do checkout para o servidor o
// reportar à Google (server/utils/googlePlayBilling.ts). No browser não há
// nada a fazer: compras feitas no site não se reportam.
type PrepareResult =
  | { status: 'ready'; token: string }
  | { status: 'canceled' }
  | { status: 'unavailable'; code?: number }

interface AlternativeBillingPlugin {
  prepare(): Promise<PrepareResult>
}

const AlternativeBilling = registerPlugin<AlternativeBillingPlugin>('AlternativeBilling')

export type AlternativeBillingOutcome =
  | { kind: 'web' }
  | { kind: 'ready'; token: string }
  | { kind: 'canceled' }
  | { kind: 'unavailable' }

export function useAlternativeBilling() {
  async function prepareAndroidPurchase(): Promise<AlternativeBillingOutcome> {
    if (!(Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android')) return { kind: 'web' }
    try {
      const result = await AlternativeBilling.prepare()
      if (result.status === 'ready') return { kind: 'ready', token: result.token }
      if (result.status === 'canceled') return { kind: 'canceled' }
      return { kind: 'unavailable' }
    } catch {
      // Versão antiga da app sem o plugin, ou falha da biblioteca da Google.
      return { kind: 'unavailable' }
    }
  }

  return { prepareAndroidPurchase }
}
