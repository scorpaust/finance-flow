<template>
  <div class="glass-card rounded-3xl p-6">
    <h3 class="font-semibold text-white mb-2 flex items-center gap-2">
      <Database class="w-4 h-4 text-brand-400" /> {{ t('settings.account.title') }}
    </h3>
    <p class="text-white/40 text-xs mb-4">{{ t('settings.account.description') }}</p>

    <div class="flex flex-wrap gap-3">
      <button class="btn-secondary text-sm py-2 flex items-center gap-2" type="button" :disabled="exporting" @click="exportData">
        <Loader2 v-if="exporting" class="w-4 h-4 animate-spin" />
        <Download v-else class="w-4 h-4" />
        {{ t('settings.account.export') }}
      </button>
      <button class="text-sm py-2 px-4 rounded-2xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 transition-colors" type="button" @click="showDelete = true">
        {{ t('settings.account.delete') }}
      </button>
    </div>

    <p class="text-white/30 text-xs mt-4 space-x-3">
      <NuxtLink to="/terms" class="underline hover:text-white/60">{{ t('legal.terms') }}</NuxtLink>
      <NuxtLink to="/privacy" class="underline hover:text-white/60">{{ t('legal.privacy') }}</NuxtLink>
    </p>

    <Teleport to="body">
      <div v-if="showDelete" class="modal-overlay" @click.self="closeDelete">
        <div class="modal-content max-w-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-white">{{ t('settings.account.deleteTitle') }}</h3>
            <button class="btn-icon" :aria-label="t('common.close')" @click="closeDelete"><X class="w-4 h-4" /></button>
          </div>
          <div class="space-y-4">
            <p class="text-rose-300 text-xs">{{ t('settings.account.deleteWarning') }}</p>
            <div>
              <label class="form-label">{{ t('settings.twoFactor.disablePasswordLabel') }}</label>
              <input v-model="password" type="password" class="form-input" autocomplete="current-password" />
            </div>
            <div v-if="auth.user?.twoFactorEnabled">
              <label class="form-label">{{ t('settings.twoFactor.disableCodeLabel') }}</label>
              <input v-model="code" type="text" class="form-input tracking-widest" :placeholder="t('settings.twoFactor.disableCodePlaceholder')" />
            </div>
            <div v-if="errorMessage" class="flex items-center gap-2 bg-rose-500/[0.15] border border-rose-500/30 rounded-2xl px-4 py-3 text-rose-400 text-sm">
              <AlertCircle class="w-4 h-4 shrink-0" /> {{ errorMessage }}
            </div>
            <div class="flex gap-3 pt-2">
              <button class="btn-secondary flex-1" type="button" @click="closeDelete">{{ t('common.cancel') }}</button>
              <button
                class="flex-1 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2.5 transition-colors disabled:opacity-50"
                type="button"
                :disabled="deleting || !password || (auth.user?.twoFactorEnabled && !code)"
                @click="deleteAccount"
              >
                <Loader2 v-if="deleting" class="w-4 h-4 animate-spin mx-auto" />
                <span v-else>{{ t('settings.account.deleteConfirm') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, Database, Download, Loader2, X } from 'lucide-vue-next'

const { t } = useI18n()
const auth = useAuthStore()
const toast = useToastStore()

const exporting = ref(false)
const deleting = ref(false)
const showDelete = ref(false)
const password = ref('')
const code = ref('')
const errorMessage = ref('')

async function exportData() {
  if (exporting.value) return
  exporting.value = true
  try {
    const data = await $fetch('/api/account/export')
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'financeflow-export.json'
    a.click()
    URL.revokeObjectURL(url)
  } catch (error: any) {
    toast.error(error?.data?.message || t('settings.account.errorGeneric'))
  } finally {
    exporting.value = false
  }
}

async function deleteAccount() {
  if (deleting.value) return
  errorMessage.value = ''
  deleting.value = true
  try {
    await $fetch('/api/account', {
      method: 'DELETE',
      body: { password: password.value, code: code.value.trim() || undefined },
    })
    closeDelete()
    await auth.signOut()
  } catch (error: any) {
    errorMessage.value = error?.data?.message || t('settings.account.errorGeneric')
  } finally {
    deleting.value = false
  }
}

function closeDelete() {
  showDelete.value = false
  password.value = ''
  code.value = ''
  errorMessage.value = ''
}
</script>
