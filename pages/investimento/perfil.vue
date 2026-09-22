<template>
  <div class="space-y-6 animate-fade-in max-w-2xl">
    <div>
      <button class="btn-secondary text-sm py-2 px-4 mb-4 flex items-center gap-2" type="button" @click="navigateTo('/investimento')">
        <ArrowLeft class="w-4 h-4" />
        {{ t('common.back') }}
      </button>
      <h2 class="font-display font-bold text-2xl text-white">{{ t('investment.profile.title') }}</h2>
      <p class="text-white/40 text-xs mt-1">
        {{ t('investment.profile.subtitle') }}
      </p>
    </div>

    <form class="glass-card rounded-3xl p-6 space-y-6" @submit.prevent="submit">
      <!-- Risk tolerance -->
      <div>
        <label class="text-sm font-semibold text-white mb-3 block">{{ t('investment.profile.riskLabel') }}</label>
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
          {{ t('investment.profile.horizonLabel') }}
        </label>
        <input v-model.number="form.horizonYears" type="number" min="0" max="60" class="form-input" required />
      </div>

      <!-- Knowledge level -->
      <div>
        <label class="text-sm font-semibold text-white mb-3 block">{{ t('investment.profile.knowledgeLabel') }}</label>
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
        <label class="text-sm font-semibold text-white mb-3 block">{{ t('investment.profile.existingLabel') }}</label>
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="rounded-2xl p-3 text-sm font-semibold border transition-all"
            :class="form.hasExistingInvestments === true
              ? 'bg-brand-600/30 border-brand-500/50 text-brand-300'
              : 'glass-card border-white/10 text-white/60 hover:text-white'"
            @click="form.hasExistingInvestments = true"
          >
            {{ t('investment.profile.yes') }}
          </button>
          <button
            type="button"
            class="rounded-2xl p-3 text-sm font-semibold border transition-all"
            :class="form.hasExistingInvestments === false
              ? 'bg-brand-600/30 border-brand-500/50 text-brand-300'
              : 'glass-card border-white/10 text-white/60 hover:text-white'"
            @click="form.hasExistingInvestments = false"
          >
            {{ t('investment.profile.no') }}
          </button>
        </div>
      </div>

      <!-- Goals -->
      <div>
        <label class="text-sm font-semibold text-white mb-3 block">{{ t('investment.profile.goalsLabel') }}</label>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            v-for="opt in goalOptions"
            :key="opt.value"
            type="button"
            class="rounded-2xl p-3 text-sm font-semibold border transition-all text-left"
            :class="form.goals.includes(opt.value)
              ? 'bg-brand-600/30 border-brand-500/50 text-brand-300'
              : 'glass-card border-white/10 text-white/60 hover:text-white'"
            @click="toggleGoal(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <button
        class="btn-primary w-full flex items-center justify-center gap-2"
        type="submit"
        :disabled="!isValid || saving"
      >
        <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
        {{ t('investment.profile.save') }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Loader2 } from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

const toast = useToastStore()
const { t } = useI18n()
const saving = ref(false)

const riskOptions = computed(() => [
  { value: 'conservador', label: t('investment.profile.riskConservative') },
  { value: 'moderado', label: t('investment.profile.riskModerate') },
  { value: 'arrojado', label: t('investment.profile.riskBold') },
])
const knowledgeOptions = computed(() => [
  { value: 'iniciante', label: t('investment.profile.knowledgeBeginner') },
  { value: 'intermedio', label: t('investment.profile.knowledgeIntermediate') },
  { value: 'avancado', label: t('investment.profile.knowledgeAdvanced') },
])
// Fase 7, tarefa 2 — `value` passa a ser um identificador estável (era o
// próprio texto em PT-PT, gravado tal qual no perfil); perfis já guardados
// com o texto antigo deixam de aparecer pré-selecionados aqui (não é
// validado por enum no servidor — ver server/api/investor-profile/index.ts —
// por isso não parte nada, só deixa de destacar a opção até o utilizador
// voltar a guardar o perfil).
const goalOptions = computed(() => [
  { value: 'retirement', label: t('investment.profile.goalRetirement') },
  { value: 'home', label: t('investment.profile.goalHome') },
  { value: 'emergencyFund', label: t('investment.profile.goalEmergencyFund') },
  { value: 'education', label: t('investment.profile.goalEducation') },
  { value: 'passiveIncome', label: t('investment.profile.goalPassiveIncome') },
  { value: 'other', label: t('investment.profile.goalOther') },
])

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
    toast.success(t('investment.profile.toastSaved'))
    navigateTo('/investimento')
  } catch (e: any) {
    toast.error(e?.data?.message || t('investment.profile.toastError'))
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
