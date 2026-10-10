<template>
  <main class="min-h-screen auth-bg flex items-center justify-center p-4">
    <div class="w-full max-w-md glass-card rounded-4xl p-8 sm:p-10">
      <div class="flex justify-end mb-4"><LanguageSwitcher /></div>
      <h1 class="font-display font-bold text-2xl text-white mb-2">{{ t('passwordReset.forgotTitle') }}</h1>
      <p class="text-white/50 text-sm leading-relaxed mb-6">{{ t('passwordReset.forgotDescription') }}</p>

      <div
        v-if="sent"
        class="bg-emerald-500/[0.12] border border-emerald-500/30 rounded-2xl px-4 py-3 text-emerald-300 text-sm"
        data-testid="forgot-sent"
      >
        {{ t('passwordReset.forgotSent') }}
      </div>

      <form v-else class="space-y-4" @submit.prevent="submit">
        <div>
          <label class="form-label" for="forgot-email">{{ t('auth.emailLabel') }}</label>
          <div class="relative">
            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              id="forgot-email"
              v-model="email"
              type="email"
              data-testid="forgot-email"
              class="form-input pl-9"
              autocomplete="email"
              placeholder="nome@email.com"
              required
            />
          </div>
        </div>
        <div
          v-if="errorMessage"
          class="flex items-center gap-2 bg-rose-500/[0.15] border border-rose-500/30 rounded-2xl px-4 py-3 text-rose-400 text-sm"
        >
          <AlertCircle class="w-4 h-4 shrink-0" />
          {{ errorMessage }}
        </div>
        <button :disabled="loading" data-testid="forgot-submit" class="btn-primary w-full flex items-center justify-center gap-2" type="submit">
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          {{ t('passwordReset.forgotSubmit') }}
        </button>
      </form>

      <NuxtLink to="/login" class="mt-6 inline-flex items-center gap-2 text-white/50 hover:text-white text-sm">
        <ArrowLeft class="w-4 h-4" /> {{ t('passwordReset.backToLogin') }}
      </NuxtLink>
    </div>
  </main>
</template>

<script setup lang="ts">
import { AlertCircle, ArrowLeft, Loader2, Mail } from 'lucide-vue-next'

// Upgrade 05 — "Esqueci-me da password" (página pública). O servidor responde
// sempre o mesmo, exista ou não a conta; a página mostra sempre a mesma
// mensagem de confirmação.
definePageMeta({ layout: false })

const { t } = useI18n()
const email = ref('')
const loading = ref(false)
const sent = ref(false)
const errorMessage = ref('')

useHead({ title: computed(() => t('passwordReset.forgotTitle')) })

async function submit() {
  loading.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/auth/password/forgot', { method: 'POST', body: { email: email.value } })
    sent.value = true
  } catch (e: any) {
    errorMessage.value = e?.data?.message || t('auth.errorGeneric')
  } finally {
    loading.value = false
  }
}
</script>
