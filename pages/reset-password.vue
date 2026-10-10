<template>
  <main class="min-h-screen auth-bg flex items-center justify-center p-4">
    <div class="w-full max-w-md glass-card rounded-4xl p-8 sm:p-10">
      <h1 class="font-display font-bold text-2xl text-white mb-2">{{ t('passwordReset.resetTitle') }}</h1>

      <template v-if="!token">
        <p class="text-rose-300 text-sm mb-6" data-testid="reset-invalid">{{ t('passwordReset.missingToken') }}</p>
        <NuxtLink to="/forgot-password" class="btn-primary inline-flex">{{ t('passwordReset.askNewLink') }}</NuxtLink>
      </template>

      <template v-else>
        <p class="text-white/50 text-sm leading-relaxed mb-6">{{ t('passwordReset.resetDescription') }}</p>
        <form class="space-y-4" @submit.prevent="submit">
          <div>
            <label class="form-label" for="reset-password">{{ t('passwordReset.newPasswordLabel') }}</label>
            <input
              id="reset-password"
              v-model="password"
              type="password"
              data-testid="reset-password"
              class="form-input"
              autocomplete="new-password"
              minlength="8"
              :placeholder="t('auth.passwordPlaceholder')"
              required
            />
          </div>
          <div>
            <label class="form-label" for="reset-confirm">{{ t('passwordReset.confirmPasswordLabel') }}</label>
            <input
              id="reset-confirm"
              v-model="confirm"
              type="password"
              data-testid="reset-confirm"
              class="form-input"
              autocomplete="new-password"
              minlength="8"
              required
            />
          </div>
          <div
            v-if="errorMessage"
            class="flex items-center gap-2 bg-rose-500/[0.15] border border-rose-500/30 rounded-2xl px-4 py-3 text-rose-400 text-sm"
            data-testid="reset-error"
          >
            <AlertCircle class="w-4 h-4 shrink-0" />
            <span>
              {{ errorMessage }}
              <NuxtLink v-if="linkExpired" to="/forgot-password" class="underline ml-1">{{ t('passwordReset.askNewLink') }}</NuxtLink>
            </span>
          </div>
          <button :disabled="loading" data-testid="reset-submit" class="btn-primary w-full flex items-center justify-center gap-2" type="submit">
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            {{ t('passwordReset.resetSubmit') }}
          </button>
        </form>
      </template>

      <NuxtLink to="/login" class="mt-6 inline-flex items-center gap-2 text-white/50 hover:text-white text-sm">
        <ArrowLeft class="w-4 h-4" /> {{ t('passwordReset.backToLogin') }}
      </NuxtLink>
    </div>
  </main>
</template>

<script setup lang="ts">
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-vue-next'

// Upgrade 05 — nova password a partir do link do email (página pública). Ao
// terminar, volta ao login com uma mensagem; as sessões antigas já não valem.
definePageMeta({ layout: false })

const { t } = useI18n()
const route = useRoute()
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))
const password = ref('')
const confirm = ref('')
const loading = ref(false)
const errorMessage = ref('')
const linkExpired = ref(false)

useHead({ title: computed(() => t('passwordReset.resetTitle')) })

async function submit() {
  errorMessage.value = ''
  linkExpired.value = false
  if (password.value.length < 8) {
    errorMessage.value = t('passwordReset.tooShort')
    return
  }
  if (password.value !== confirm.value) {
    errorMessage.value = t('passwordReset.mismatch')
    return
  }
  loading.value = true
  try {
    await $fetch('/api/auth/password/reset', { method: 'POST', body: { token: token.value, password: password.value } })
    await navigateTo({ path: '/login', query: { reset: '1' } })
  } catch (e: any) {
    linkExpired.value = e?.data?.data?.error === 'invalid_reset_link'
    errorMessage.value = e?.data?.message || t('auth.errorGeneric')
  } finally {
    loading.value = false
  }
}
</script>
