import { Capacitor } from '@capacitor/core'

// Upgrade 07 — pedido de avaliação na Google Play, só na app Android e só
// quando o servidor diz que a conta é elegível (server/api/account/review-prompt.post.ts).
// Chamado depois de guardar uma transação com sucesso. Nunca mostra erros: nas
// versões da app sem o plugin (≤ 1.2.3) ou sem rede, simplesmente não pede.
export function useInAppReview() {
  async function maybeAskForReview(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return
    try {
      const { prompt } = await $fetch<{ prompt: boolean }>('/api/account/review-prompt', { method: 'POST' })
      if (!prompt) return
      const { InAppReview } = await import('@capacitor-community/in-app-review')
      await InAppReview.requestReview()
    } catch {
      // Sem plugin nativo, sem rede ou a Google não mostrou: nada a fazer.
    }
  }
  return { maybeAskForReview }
}
