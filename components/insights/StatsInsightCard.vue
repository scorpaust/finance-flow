<template>
  <div>
    <div class="flex items-center gap-2 mb-4">
      <h3 class="font-display font-bold text-lg text-white">Interpretação com IA</h3>
      <span class="text-xs px-2 py-0.5 rounded-full bg-brand-600/30 text-brand-300 font-semibold">Pro</span>
    </div>

    <div v-if="!canUse" class="glass-card rounded-3xl p-10 text-center">
      <div class="text-4xl mb-3">🤖</div>
      <h4 class="font-semibold text-white mb-2">Interpretação automática das tuas estatísticas</h4>
      <p class="text-white/40 text-sm mb-6 max-w-md mx-auto">
        A IA analisa os teus padrões de despesa e sugere melhorias concretas — disponível a partir do plano Pro.
      </p>
      <button class="btn-primary" type="button" @click="navigateTo('/subscription')">Ver planos</button>
    </div>

    <div v-else class="glass-card rounded-3xl p-6">
      <div v-if="!result && !loading" class="text-center py-4">
        <p class="text-white/40 text-sm mb-4">
          Pede à IA para interpretar as tuas estatísticas dos últimos {{ months }} meses.
        </p>
        <button class="btn-primary flex items-center gap-2 mx-auto" type="button" @click="analyze">
          <Sparkles class="w-4 h-4" /> Analisar com IA
        </button>
      </div>

      <div v-else-if="loading" class="text-center py-8">
        <Loader2 class="w-6 h-6 text-brand-400 animate-spin mx-auto mb-3" />
        <p class="text-white/40 text-sm">A analisar os teus dados...</p>
      </div>

      <div v-else-if="result" class="space-y-5">
        <div>
          <h4 class="text-sm font-semibold text-white/70 mb-2 flex items-center gap-2">
            <Lightbulb class="w-4 h-4 text-yellow-400" /> Insights
          </h4>
          <ul class="space-y-2">
            <li
              v-for="(insight, i) in result.insights"
              :key="i"
              class="text-sm text-white/70 bg-surface-700/30 rounded-2xl p-3.5"
            >
              {{ insight }}
            </li>
          </ul>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-white/70 mb-2 flex items-center gap-2">
            <Target class="w-4 h-4 text-brand-400" /> Sugestões
          </h4>
          <ul class="space-y-2">
            <li
              v-for="(suggestion, i) in result.suggestions"
              :key="i"
              class="text-sm text-white/70 bg-surface-700/30 rounded-2xl p-3.5"
            >
              {{ suggestion }}
            </li>
          </ul>
        </div>

        <div class="flex items-center justify-between flex-wrap gap-2">
          <p class="text-white/20 text-xs">
            {{ result.cached ? 'Última análise' : 'Gerado agora' }} — {{ formattedDate }}
          </p>
          <button class="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5" type="button" @click="analyze">
            <RefreshCw class="w-3 h-3" /> Analisar de novo
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sparkles, Loader2, Lightbulb, Target, RefreshCw } from 'lucide-vue-next'

const props = defineProps<{ months: number }>()

const sub = useSubscription()
const canUse = computed(() => sub.hasFeature('aiStatsInsights'))

const loading = ref(false)
const result = ref<{ insights: string[]; suggestions: string[]; generatedAt: string; cached: boolean } | null>(null)

const formattedDate = computed(() =>
  result.value ? new Date(result.value.generatedAt).toLocaleString('pt-PT') : ''
)

async function analyze() {
  loading.value = true
  try {
    result.value = await $fetch('/api/insights/stats', {
      method: 'POST',
      body: { months: props.months },
    })
  } finally {
    loading.value = false
  }
}
</script>
