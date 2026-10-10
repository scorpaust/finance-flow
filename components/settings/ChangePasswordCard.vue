<template>
  <div class="glass-card rounded-3xl p-6">
    <h3 class="font-semibold text-white mb-4 flex items-center gap-2">
      <KeyRound class="w-4 h-4 text-brand-400" /> {{ t('settings.password.title') }}
    </h3>
    <p class="text-white/40 text-xs mb-4">{{ t('settings.password.description') }}</p>

    <button v-if="!open" class="btn-secondary text-sm py-2" type="button" data-testid="change-password-open" @click="open = true">
      {{ t('settings.password.openButton') }}
    </button>

    <form v-else class="space-y-3 max-w-sm" @submit.prevent="submit">
      <div>
        <label class="form-label" for="cp-current">{{ t('settings.password.currentLabel') }}</label>
        <input id="cp-current" v-model="current" type="password" class="form-input" autocomplete="current-password" data-testid="change-password-current" required />
      </div>
      <div>
        <label class="form-label" for="cp-new">{{ t('passwordReset.newPasswordLabel') }}</label>
        <input id="cp-new" v-model="next" type="password" class="form-input" autocomplete="new-password" minlength="8" data-testid="change-password-new" required />
      </div>
      <div>
        <label class="form-label" for="cp-confirm">{{ t('passwordReset.confirmPasswordLabel') }}</label>
        <input id="cp-confirm" v-model="confirm" type="password" class="form-input" autocomplete="new-password" minlength="8" data-testid="change-password-confirm" required />
      </div>
      <p v-if="errorMessage" class="text-rose-400 text-sm">{{ errorMessage }}</p>
      <div class="flex gap-2">
        <button class="btn-secondary text-sm py-2" type="button" @click="reset">{{ t('common.cancel') }}</button>
        <button class="btn-primary text-sm py-2 flex items-center gap-2" type="submit" :disabled="saving" data-testid="change-password-submit">
          <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
          {{ t('settings.password.saveButton') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { KeyRound, Loader2 } from 'lucide-vue-next'

// Upgrade 05 — alterar a password com sessão iniciada. O servidor termina as
// sessões nos outros dispositivos e mantém esta.
const { t } = useI18n()
const toast = useToastStore()
const open = ref(false)
const current = ref('')
const next = ref('')
const confirm = ref('')
const saving = ref(false)
const errorMessage = ref('')

function reset() {
  open.value = false
  current.value = ''
  next.value = ''
  confirm.value = ''
  errorMessage.value = ''
}

async function submit() {
  errorMessage.value = ''
  if (next.value.length < 8) {
    errorMessage.value = t('passwordReset.tooShort')
    return
  }
  if (next.value !== confirm.value) {
    errorMessage.value = t('passwordReset.mismatch')
    return
  }
  saving.value = true
  try {
    await $fetch('/api/auth/password/change', { method: 'POST', body: { currentPassword: current.value, newPassword: next.value } })
    toast.success(t('settings.password.toastChanged'))
    reset()
  } catch (e: any) {
    errorMessage.value = e?.data?.message || t('auth.errorGeneric')
  } finally {
    saving.value = false
  }
}
</script>
