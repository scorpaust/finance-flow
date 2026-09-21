<template>
  <div class="glass-card rounded-3xl p-6 space-y-4">
    <div class="flex items-center gap-2 flex-wrap">
      <h3 class="font-semibold text-white flex items-center gap-2">
        <Lightbulb class="w-4 h-4 text-yellow-400" /> Dicas para o teu perfil
      </h3>
      <span class="text-xs px-2 py-0.5 rounded-full bg-brand-600/30 text-brand-300 font-semibold">Premium</span>
    </div>

    <!-- Sem acesso às dicas (o registo e as dicas têm chaves de plano separadas) -->
    <div v-if="!canUse" class="text-center py-4">
      <p class="text-white/40 text-sm mb-4 max-w-md mx-auto">
        Dicas educativas de IA adaptadas ao teu perfil de risco — disponível no plano Premium.
      </p>
      <button class="btn-primary" type="button" @click="navigateTo('/subscription?tier=premium')">Ver planos</button>
    </div>

    <!-- Perfil expirado: só as dicas ficam bloqueadas, o portfolio não -->
    <div v-else-if="profileState === 'expired'" class="text-center py-4">
      <p class="text-white/40 text-sm mb-4 max-w-md mx-auto">
        O teu perfil de investidor tem mais de um ano. Renova-o para voltares a receber dicas — o teu portfolio
        continua disponível.
      </p>
      <button class="btn-primary" type="button" @click="navigateTo('/investimento/perfil')">Renovar perfil</button>
    </div>

    <template v-else>
      <SkeletonBlock v-if="loading" rounded="3xl" class="h-24" />

      <template v-else>
        <div v-if="disclaimer" class="rounded-2xl p-4 border border-amber-500/30 flex items-start gap-3 bg-amber-500/[0.06]">
          <AlertTriangle class="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p class="text-sm text-white/70">{{ disclaimer }}</p>
        </div>

        <ul v-if="tips?.length" class="space-y-3">
          <li v-for="(tip, i) in tips" :key="i" class="text-sm text-white/70 bg-surface-700/30 rounded-2xl p-3.5">
            {{ tip }}
          </li>
        </ul>
        <p v-else class="text-white/40 text-sm">
          Ainda não geraste dicas. A IA usa o teu perfil de investidor e o contexto geral de mercado
          <template v-if="portfolioIncluded">, e um resumo agregado do teu portfolio</template>.
        </p>

        <p v-if="portfolioIncluded" class="text-white/40 text-xs flex items-start gap-1.5">
          <ShieldCheck class="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
          As dicas usam só totais e percentagens da tua carteira — os nomes dos teus investimentos não são enviados à IA.
        </p>

        <div class="flex items-center justify-between flex-wrap gap-3">
          <div class="text-white/20 text-xs space-y-0.5">
            <p v-if="generatedAt">Geradas em {{ formattedDate }}</p>
            <p v-if="marketSnapshotDate">Contexto de mercado de {{ marketSnapshotDate }}</p>
            <p v-if="tips?.length && !outdated" class="text-white/30">Nada mudou desde a última geração.</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="btn-secondary text-sm" type="button" @click="navigateTo('/investimento/perfil')">
              Atualizar perfil
            </button>
            <button
              class="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
              type="button"
              :disabled="generating || (!!tips?.length && !outdated)"
              @click="generate"
            >
              <Loader2 v-if="generating" class="w-4 h-4 animate-spin" />
              <Sparkles v-else class="w-4 h-4" />
              {{ generating ? 'A gerar...' : tips?.length ? 'Atualizar dicas' : 'Gerar dicas' }}
            </button>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Lightbulb, AlertTriangle, Sparkles, Loader2, ShieldCheck } from 'lucide-vue-next'

// Dicas de investimento por IA (Fase 3) na zona de investimentos (Fase 6). Ao
// abrir mostra as últimas dicas geradas SEM chamar a Anthropic (GET); só o botão
// gera dicas novas (POST). Ver context/features/06-FASE-6-registo-investimentos.md.
const props = defineProps<{ profileState: 'valid' | 'expired' }>()

interface TipsResponse {
  needsProfile: boolean
  disclaimer?: string
  tips?: string[] | null
  marketSnapshotDate?: string | null
  portfolioIncluded?: boolean
  generatedAt?: string
  outdated?: boolean
}

const sub = useSubscription()
const toast = useToastStore()
const canUse = computed(() => sub.hasFeature('aiInvestmentTips'))

const loading = ref(true)
const generating = ref(false)
const disclaimer = ref('')
const tips = ref<string[] | null>(null)
const marketSnapshotDate = ref<string | null>(null)
const portfolioIncluded = ref(false)
const generatedAt = ref<string | null>(null)
const outdated = ref(true)

const formattedDate = computed(() => (generatedAt.value ? new Date(generatedAt.value).toLocaleString('pt-PT') : ''))

function apply(data: TipsResponse) {
  disclaimer.value = data.disclaimer ?? ''
  tips.value = data.tips ?? null
  marketSnapshotDate.value = data.marketSnapshotDate ?? null
  portfolioIncluded.value = !!data.portfolioIncluded
  generatedAt.value = data.generatedAt ?? null
  outdated.value = data.outdated ?? true
}

async function loadCached() {
  if (!canUse.value || props.profileState !== 'valid') {
    loading.value = false
    return
  }
  loading.value = true
  try {
    apply(await $fetch<TipsResponse>('/api/insights/investment'))
  } catch {
    // Sem cache legível: o utilizador ainda pode gerar dicas pelo botão.
  } finally {
    loading.value = false
  }
}

async function generate() {
  generating.value = true
  try {
    apply(await $fetch<TipsResponse>('/api/insights/investment', { method: 'POST' }))
  } catch {
    toast.error('Não foi possível gerar as dicas agora. Tenta novamente daqui a pouco.')
  } finally {
    generating.value = false
  }
}

// `canUse` só fica certo depois do fetch assíncrono de useSubscription() resolver
// (mesmo padrão de pages/stats/index.vue).
watch([canUse, () => props.profileState], loadCached)
onMounted(loadCached)
</script>
