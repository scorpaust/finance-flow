<template>
  <div class="max-w-md mx-auto text-center py-16 animate-fade-in space-y-4">
    <div class="w-14 h-14 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mx-auto">
      <Loader2 v-if="confirming" class="w-6 h-6 text-brand-400 animate-spin" />
      <Check v-else-if="outcome === 'active'" class="w-6 h-6 text-emerald-400" />
      <Clock v-else class="w-6 h-6 text-amber-400" />
    </div>
    <h2 class="font-display font-bold text-xl text-white">
      {{ confirming ? 'A confirmar pagamento...' : outcome === 'active' ? 'Pagamento confirmado!' : 'Pagamento pendente' }}
    </h2>
    <p class="text-white/50 text-sm">
      {{
        confirming
          ? 'A PayPal está a notificar-nos da confirmação — pode demorar alguns segundos.'
          : outcome === 'active'
            ? 'O teu plano já está ativo.'
            : 'Ainda não recebemos a confirmação final — se usaste Multibanco, pode demorar até 7 dias após pagares no ATM/homebanking.'
      }}
    </p>
    <button class="btn-primary" type="button" @click="navigateTo('/subscription')">Ver subscrição</button>
  </div>
</template>

<script setup lang="ts">
import { Loader2, Check, Clock } from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

const sub = useSubscription()
const confirming = ref(true)
const outcome = ref<'active' | 'pending'>('pending')

// O webhook PayPal é assíncrono — fazemos um curto polling ao estado da
// subscrição em vez de assumir que já está atualizado logo após o redirect.
// Pára assim que houver um resultado: o plano mudou (pago confirmado), ou já
// existe uma compra pendente registada (referência Multibanco gerada, à
// espera de pagamento — estado terminal válido, não é para continuar a
// esperar por isso aqui).
onMounted(async () => {
  for (let i = 0; i < 8; i++) {
    await sub.refresh()
    if (sub.tier.value !== 'free') {
      outcome.value = 'active'
      break
    }
    if (sub.pendingPurchase.value) {
      outcome.value = 'pending'
      break
    }
    await new Promise((r) => setTimeout(r, 2000))
  }
  confirming.value = false
})
</script>
