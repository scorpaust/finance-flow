<template>
  <div v-if="state?.show" class="glass-card rounded-3xl p-5 border border-brand-500/20" data-testid="onboarding">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="font-semibold text-white">{{ t('onboarding.title') }}</h3>
        <p class="text-white/50 text-xs mt-0.5">{{ t('onboarding.progress', { done: state.done, total: state.total }) }}</p>
      </div>
      <button class="text-xs text-white/40 hover:text-white" type="button" data-testid="onboarding-dismiss" @click="dismiss">
        {{ t('onboarding.dismiss') }}
      </button>
    </div>
    <div class="progress-bar h-1.5 mt-3">
      <div class="progress-fill h-full" :style="{ width: (state.total ? (state.done / state.total) * 100 : 0) + '%' }" />
    </div>
    <ul class="mt-4 space-y-2">
      <li v-for="step in state.steps" :key="step.id" class="flex items-center gap-3" :data-testid="`onboarding-step-${step.id}`">
        <span
          class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border"
          :class="step.done ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'border-white/15 text-white/30'"
          :aria-label="step.done ? t('onboarding.doneAria') : t('onboarding.todoAria')"
        >
          <Check v-if="step.done" class="w-3.5 h-3.5" />
        </span>
        <span class="text-sm flex-1" :class="step.done ? 'text-white/40 line-through' : 'text-white/80'">{{ t(`onboarding.steps.${step.id}`) }}</span>
        <span v-if="step.locked" class="text-[10px] px-2 py-0.5 rounded-full bg-brand-600/30 text-brand-300 font-semibold">{{ t('tiers.pro') }}</span>
        <button
          v-else-if="!step.done"
          type="button"
          class="text-xs text-brand-300 hover:text-white"
          :data-testid="`onboarding-go-${step.id}`"
          @click="go(step.id)"
        >
          {{ t(`onboarding.actions.${step.id}`) }} →
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import type { OnboardingStepId, OnboardingStep } from '~/shared/onboarding'

// Upgrade 08 — lista de primeiros passos no painel de uma conta nova. O
// progresso vem do servidor (deduzido dos dados); fecha-se sozinha quando
// fica completa, ou com "Não mostrar mais". Os passos de transação pedem ao
// painel que abra o formulário (evento `add-transaction`).
const emit = defineEmits<{ 'add-transaction': [] }>()
const { t } = useI18n()

interface OnboardingStateDto { steps: OnboardingStep[]; done: number; total: number; show: boolean }
const state = ref<OnboardingStateDto | null>(null)

async function load() {
  try {
    state.value = await $fetch<OnboardingStateDto>('/api/onboarding')
  } catch {
    state.value = null
  }
}

function go(id: OnboardingStepId) {
  if (id === 'expense' || id === 'income') emit('add-transaction')
  else if (id === 'budget') navigateTo('/groups')
  else navigateTo('/settings')
}

async function dismiss() {
  if (state.value) state.value.show = false
  try {
    await $fetch('/api/onboarding/dismiss', { method: 'POST' })
  } catch {
    // Sem rede: volta a aparecer na próxima visita, nada de grave.
  }
}

onMounted(load)
defineExpose({ reload: load })
</script>
