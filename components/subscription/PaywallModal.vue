<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content max-w-md w-full text-center" @click.stop>
        <div class="w-14 h-14 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-4">
          <Lock class="w-6 h-6 text-brand-400" />
        </div>

        <h2 class="font-display font-bold text-xl text-white">Funcionalidade {{ TIER_LABEL[requiredTier] }}</h2>
        <p class="text-white/50 text-sm mt-2">
          {{ featureLabel }} está disponível a partir do plano
          <span class="text-brand-300 font-semibold">{{ TIER_LABEL[requiredTier] }}</span>
          ({{ TIER_PRICE_EUR[requiredTier].toFixed(2).replace('.', ',') }} €/mês).
        </p>

        <div class="flex gap-3 mt-6">
          <button class="btn-secondary flex-1" type="button" @click="$emit('close')">Agora não</button>
          <button class="btn-primary flex-1 flex items-center justify-center gap-2" type="button" @click="goToCheckout">
            <Sparkles class="w-4 h-4" /> Ver planos
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Lock, Sparkles } from 'lucide-vue-next'
import type { SubscriptionTier } from '~/shared/features'
import { TIER_LABEL, TIER_PRICE_EUR } from '~/shared/features'

const props = defineProps<{
  requiredTier: SubscriptionTier
  featureLabel: string
}>()

const emit = defineEmits<{ close: [] }>()

function goToCheckout() {
  emit('close')
  navigateTo(`/subscription?tier=${props.requiredTier}`)
}
</script>
