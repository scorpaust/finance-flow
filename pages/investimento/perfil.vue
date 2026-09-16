<template>
  <div class="space-y-6 animate-fade-in max-w-2xl">
    <div>
      <button class="btn-secondary text-sm py-2 px-4 mb-4 flex items-center gap-2" type="button" @click="navigateTo('/investimento')">
        <ArrowLeft class="w-4 h-4" />
        Voltar
      </button>
      <h2 class="font-display font-bold text-2xl text-white">Perfil de Investidor</h2>
      <p class="text-white/40 text-xs mt-1">
        Usado só para adaptar as dicas educativas ao teu perfil — renovado anualmente.
      </p>
    </div>

    <form class="glass-card rounded-3xl p-6 space-y-6" @submit.prevent="submit">
      <!-- Risk tolerance -->
      <div>
        <label class="text-sm font-semibold text-white mb-3 block">Tolerância ao risco</label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="opt in riskOptions"
            :key="opt.value"
            type="button"
            class="rounded-2xl p-3 text-sm font-semibold border transition-all"
            :class="form.riskTolerance === opt.value
              ? 'bg-brand-600/30 border-brand-500/50 text-brand-300'
              : 'glass-card border-white/10 text-white/60 hover:text-white'"
            @click="form.riskTolerance = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Horizon -->
      <div>
        <label class="text-sm font-semibold text-white mb-3 block">
          Horizonte temporal (anos até precisares do dinheiro)
        </label>
        <input v-model.number="form.horizonYears" type="number" min="0" max="60" class="form-input" required />
      </div>

      <!-- Knowledge level -->
      <div>
        <label class="text-sm font-semibold text-white mb-3 block">Nível de conhecimento sobre investimento</label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="opt in knowledgeOptions"
            :key="opt.value"
            type="button"
            class="rounded-2xl p-3 text-sm font-semibold border transition-all"
            :class="form.knowledgeLevel === opt.value
              ? 'bg-brand-600/30 border-brand-500/50 text-brand-300'
              : 'glass-card border-white/10 text-white/60 hover:text-white'"
            @click="form.knowledgeLevel = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Existing investments -->
      <div>
        <label class="text-sm font-semibold text-white mb-3 block">Já tens investimentos atualmente?</label>
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="rounded-2xl p-3 text-sm font-semibold border transition-all"
            :class="form.hasExistingInvestments === true
              ? 'bg-brand-600/30 border-brand-500/50 text-brand-300'
              : 'glass-card border-white/10 text-white/60 hover:text-white'"
            @click="form.hasExistingInvestments = true"
          >
            Sim
          </button>
          <button
            type="button"
            class="rounded-2xl p-3 text-sm font-semibold border transition-all"
            :class="form.hasExistingInvestments === false
              ? 'bg-brand-600/30 border-brand-500/50 text-brand-300'
              : 'glass-card border-white/10 text-white/60 hover:text-white'"
            @click="form.hasExistingInvestments = false"
          >
            Não
          </button>
        </div>
      </div>

      <!-- Goals -->
      <div>
        <label class="text-sm font-semibold text-white mb-3 block">Objetivos (podes escolher vários)</label>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            v-for="opt in goalOptions"
            :key="opt"
            type="button"
            class="rounded-2xl p-3 text-sm font-semibold border transition-all text-left"
            :class="form.goals.includes(opt)
              ? 'bg-brand-600/30 border-brand-500/50 text-brand-300'
              : 'glass-card border-white/10 text-white/60 hover:text-white'"
            @click="toggleGoal(opt)"
          >
            {{ opt }}
          </button>
        </div>
      </div>

      <button
        class="btn-primary w-full flex items-center justify-center gap-2"
        type="submit"
        :disabled="!isValid || saving"
      >
        <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
        Guardar perfil
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Loader2 } from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

const toast = useToastStore()
const saving = ref(false)

const riskOptions = [
  { value: 'conservador', label: 'Conservador' },
  { value: 'moderado', label: 'Moderado' },
  { value: 'arrojado', label: 'Arrojado' },
]
const knowledgeOptions = [
  { value: 'iniciante', label: 'Iniciante' },
  { value: 'intermedio', label: 'Intermédio' },
  { value: 'avancado', label: 'Avançado' },
]
const goalOptions = ['Reforma', 'Compra de casa', 'Fundo de emergência', 'Educação', 'Rendimento passivo', 'Outro']

const form = reactive<{
  riskTolerance: string
  horizonYears: number | null
  knowledgeLevel: string
  hasExistingInvestments: boolean | null
  goals: string[]
}>({
  riskTolerance: '',
  horizonYears: null,
  knowledgeLevel: '',
  hasExistingInvestments: null,
  goals: [],
})

function toggleGoal(goal: string) {
  const i = form.goals.indexOf(goal)
  if (i === -1) form.goals.push(goal)
  else form.goals.splice(i, 1)
}

const isValid = computed(() =>
  !!form.riskTolerance &&
  !!form.knowledgeLevel &&
  form.horizonYears !== null &&
  form.horizonYears >= 0 &&
  form.hasExistingInvestments !== null
)

async function submit() {
  if (!isValid.value) return
  saving.value = true
  try {
    await $fetch('/api/investor-profile', { method: 'POST', body: form })
    toast.success('Perfil de investidor guardado! 📈')
    navigateTo('/investimento')
  } catch (e: any) {
    toast.error(e?.data?.message || 'Erro ao guardar o perfil')
  } finally {
    saving.value = false
  }
}

async function loadExisting() {
  try {
    const data = await $fetch<any>('/api/investor-profile')
    if (data.profile) {
      form.riskTolerance = data.profile.riskTolerance
      form.horizonYears = data.profile.horizonYears
      form.knowledgeLevel = data.profile.knowledgeLevel
      form.hasExistingInvestments = data.profile.hasExistingInvestments
      form.goals = data.profile.goals || []
    }
  } catch { /* silent — primeira vez sem perfil */ }
}

onMounted(loadExisting)
</script>
