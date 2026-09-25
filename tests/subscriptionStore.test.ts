import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSubscriptionStore } from '../stores/subscription'

// Fase 8, ponto 6 — "useSubscription": a fachada (composables/useSubscription.ts)
// é só um proxy de getters sem lógica própria; o que vale testar é a store por
// trás (stores/subscription.ts), em particular isExpiringSoon — teve uma
// regressão real nesta sessão (dias negativos após expirar mostravam "expira
// em -1 dias" com o plano já gratuito), corrigida com a condição `>= 0`.
describe('useSubscriptionStore — isExpiringSoon', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  function setState(store: ReturnType<typeof useSubscriptionStore>, billingMode: string, daysUntilExpiry: number | null) {
    store.subscription = { ...store.subscription, billingMode: billingMode as never }
    store.daysUntilExpiry = daysUntilExpiry
  }

  it('REGRESSÃO: dias negativos (já expirado) nunca mostram aviso de "expira em breve"', () => {
    const store = useSubscriptionStore()
    setState(store, 'push_confirm', -1)
    expect(store.isExpiringSoon).toBe(false)
  })

  it('dentro da janela de 0-7 dias mostra o aviso, para MB WAY/Multibanco', () => {
    const store = useSubscriptionStore()
    setState(store, 'push_confirm', 3)
    expect(store.isExpiringSoon).toBe(true)
    setState(store, 'manual_reference', 0)
    expect(store.isExpiringSoon).toBe(true)
    setState(store, 'manual_reference', 7)
    expect(store.isExpiringSoon).toBe(true)
  })

  it('fora da janela (>7 dias) não mostra aviso', () => {
    const store = useSubscriptionStore()
    setState(store, 'push_confirm', 8)
    expect(store.isExpiringSoon).toBe(false)
  })

  it('nunca mostra aviso para subscrições com renovação automática (billingMode "auto")', () => {
    const store = useSubscriptionStore()
    setState(store, 'auto', 3)
    expect(store.isExpiringSoon).toBe(false)
  })

  it('sem daysUntilExpiry conhecido (null), não mostra aviso', () => {
    const store = useSubscriptionStore()
    setState(store, 'push_confirm', null)
    expect(store.isExpiringSoon).toBe(false)
  })
})
