<template>
  <div class="space-y-6 animate-fade-in">
    <div>
      <button class="btn-secondary text-sm py-2 px-4 mb-4 flex items-center gap-2" type="button" @click="navigateTo('/')">
        <ArrowLeft class="w-4 h-4" />
        Voltar ao dashboard
      </button>
      <h2 class="font-display font-bold text-2xl text-white flex items-center gap-2">
        <span>📈</span> Investimento
      </h2>
      <p class="text-white/40 text-xs mt-1">Dicas educativas por perfil de risco, com contexto geral de mercado</p>
    </div>

    <div v-if="loading" class="glass-card rounded-3xl p-12 text-center">
      <Loader2 class="w-6 h-6 text-brand-400 animate-spin mx-auto" />
    </div>

    <div v-else-if="needsProfile" class="glass-card rounded-3xl p-10 text-center">
      <div class="text-4xl mb-3">📝</div>
      <h4 class="font-semibold text-white mb-2">Ainda não respondeste ao questionário de perfil de investidor</h4>
      <p class="text-white/40 text-sm mb-6 max-w-md mx-auto">
        Precisamos de saber a tua tolerância ao risco, horizonte temporal e objetivos para adaptar as dicas —
        renovado anualmente.
      </p>
      <button class="btn-primary" type="button" @click="navigateTo('/investimento/perfil')">Preencher perfil</button>
    </div>

    <template v-else-if="tips">
      <div class="glass-card rounded-3xl p-4 border border-amber-500/30 flex items-start gap-3">
        <AlertTriangle class="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p class="text-sm text-white/70">{{ disclaimer }}</p>
      </div>

      <div class="glass-card rounded-3xl p-6">
        <h3 class="font-semibold text-white mb-4 flex items-center gap-2">
          <Lightbulb class="w-4 h-4 text-yellow-400" /> Dicas para o teu perfil
        </h3>
        <ul class="space-y-3">
          <li v-for="(tip, i) in tips" :key="i" class="text-sm text-white/70 bg-surface-700/30 rounded-2xl p-3.5">
            {{ tip }}
          </li>
        </ul>
      </div>

      <div class="flex items-center justify-between flex-wrap gap-2">
        <p v-if="marketSnapshotDate" class="text-white/20 text-xs">
          Contexto de mercado de {{ marketSnapshotDate }}
        </p>
        <button class="btn-secondary text-sm" type="button" @click="navigateTo('/investimento/perfil')">
          Atualizar perfil de investidor
        </button>
      </div>
    </template>

    <PaywallModal
      v-if="showPaywall"
      required-tier="premium"
      feature-label="Dicas de Investimento com IA"
      @close="navigateTo('/')"
    />
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Loader2, Lightbulb, AlertTriangle } from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

const sub = useSubscription()
const canUse = computed(() => sub.hasFeature('aiInvestmentTips'))
const showPaywall = ref(false)

const loading = ref(true)
const needsProfile = ref(false)
const tips = ref<string[] | null>(null)
const disclaimer = ref('')
const marketSnapshotDate = ref<string | null>(null)

async function load() {
  if (!canUse.value) {
    loading.value = false
    showPaywall.value = true
    return
  }

  showPaywall.value = false
  loading.value = true
  try {
    const data = await $fetch<any>('/api/insights/investment', { method: 'POST' })
    needsProfile.value = !!data.needsProfile
    if (!data.needsProfile) {
      tips.value = data.tips
      disclaimer.value = data.disclaimer
      marketSnapshotDate.value = data.marketSnapshotDate
    }
  } finally {
    loading.value = false
  }
}

// canUse só fica certo depois do fetch assíncrono de useSubscription() resolver
// (mesmo padrão usado em pages/stats/index.vue para statsAdvanced).
watch(canUse, (allowed) => {
  if (allowed) load()
})

onMounted(load)
</script>
