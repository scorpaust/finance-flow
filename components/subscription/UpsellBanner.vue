<template>
  <div
    v-if="isExpiringSoon"
    class="glass-card rounded-3xl p-4 border border-amber-500/30 flex items-center gap-3 flex-wrap"
  >
    <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
      <AlertTriangle class="w-4 h-4 text-amber-400" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-white">O teu plano {{ TIER_LABEL[tier] }} expira em {{ daysUntilExpiry }} dia(s)</p>
      <p class="text-white/40 text-xs mt-0.5">
        Pago por período (MB WAY/Multibanco) — não há renovação automática. Renova manualmente para não perderes o acesso.
      </p>
    </div>
    <button class="btn-primary text-sm py-2 shrink-0" type="button" @click="navigateTo('/subscription')">
      Renovar agora
    </button>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import { TIER_LABEL } from '~/shared/features'

// Top-level para Vue auto-unwrapping refs em template (ver padrão em predictions.vue).
const sub = useSubscription()
const tier = sub.tier
const daysUntilExpiry = sub.daysUntilExpiry
const isExpiringSoon = sub.isExpiringSoon
</script>
