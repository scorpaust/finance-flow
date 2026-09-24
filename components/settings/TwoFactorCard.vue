<template>
  <div class="glass-card rounded-3xl p-6">
    <h3 class="font-semibold text-white mb-4 flex items-center gap-2">
      <ShieldCheck class="w-4 h-4 text-brand-400" /> {{ t('settings.twoFactor.title') }}
    </h3>
    <p class="text-white/40 text-xs mb-4">{{ t('settings.twoFactor.description') }}</p>

    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-center gap-2">
        <span
          class="w-2 h-2 rounded-full"
          :class="auth.user?.twoFactorEnabled ? 'bg-emerald-400' : 'bg-white/20'"
        />
        <p class="text-white text-sm font-medium">
          {{ auth.user?.twoFactorEnabled ? t('settings.twoFactor.statusEnabled') : t('settings.twoFactor.statusDisabled') }}
        </p>
      </div>
      <button
        v-if="!auth.user?.twoFactorEnabled"
        class="btn-primary text-sm py-2"
        type="button"
        :disabled="loadingSetup"
        @click="startSetup"
      >
        <Loader2 v-if="loadingSetup" class="w-4 h-4 animate-spin" />
        <span v-else>{{ t('settings.twoFactor.enableButton') }}</span>
      </button>
      <button v-else class="btn-secondary text-sm py-2" type="button" @click="showDisable = true">
        {{ t('settings.twoFactor.disableButton') }}
      </button>
    </div>

    <!-- Setup: QR code + confirmação do código -->
    <Teleport to="body">
      <div v-if="showSetup" class="modal-overlay" @click.self="cancelSetup">
        <div class="modal-content max-w-sm">
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-semibold text-white">{{ t('settings.twoFactor.setupTitle') }}</h3>
            <button class="btn-icon" :aria-label="t('common.close')" @click="cancelSetup"><X class="w-4 h-4" /></button>
          </div>

          <div v-if="!backupCodes.length" class="space-y-4">
            <p class="text-white/50 text-xs">{{ t('settings.twoFactor.setupInstructions') }}</p>
            <img v-if="qrCode" :src="qrCode" alt="QR code" class="w-40 h-40 mx-auto rounded-xl bg-white p-2" />
            <div>
              <label class="form-label">{{ t('settings.twoFactor.secretLabel') }}</label>
              <code class="block text-xs text-white/60 bg-surface-800/60 rounded-lg px-3 py-2 break-all select-all">{{ secret }}</code>
            </div>
            <div>
              <label class="form-label">{{ t('settings.twoFactor.codeLabel') }}</label>
              <input
                v-model="confirmCode"
                type="text"
                inputmode="numeric"
                class="form-input tracking-widest"
                :placeholder="t('settings.twoFactor.codePlaceholder')"
              />
            </div>

            <div v-if="errorMessage" class="flex items-center gap-2 bg-rose-500/[0.15] border border-rose-500/30 rounded-2xl px-4 py-3 text-rose-400 text-sm">
              <AlertCircle class="w-4 h-4 shrink-0" />
              {{ errorMessage }}
            </div>

            <div class="flex gap-3 pt-2">
              <button class="btn-secondary flex-1" type="button" @click="cancelSetup">{{ t('common.cancel') }}</button>
              <button class="btn-primary flex-1" type="button" :disabled="loadingConfirm || confirmCode.length !== 6" @click="confirmSetup">
                <Loader2 v-if="loadingConfirm" class="w-4 h-4 animate-spin" />
                <span v-else>{{ t('settings.twoFactor.confirmButton') }}</span>
              </button>
            </div>
          </div>

          <!-- Códigos de recuperação, mostrados uma única vez -->
          <div v-else class="space-y-4">
            <p class="text-amber-400 text-xs font-medium">{{ t('settings.twoFactor.backupCodesWarning') }}</p>
            <div class="grid grid-cols-2 gap-2 bg-surface-800/60 rounded-xl p-4">
              <code v-for="c in backupCodes" :key="c" class="text-xs text-white/70 text-center">{{ c }}</code>
            </div>
            <button class="btn-primary w-full" type="button" @click="finishSetup">
              {{ t('settings.twoFactor.backupCodesDoneButton') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Desativar: password + código atual -->
    <Teleport to="body">
      <div v-if="showDisable" class="modal-overlay" @click.self="cancelDisable">
        <div class="modal-content max-w-sm">
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-semibold text-white">{{ t('settings.twoFactor.disableTitle') }}</h3>
            <button class="btn-icon" :aria-label="t('common.close')" @click="cancelDisable"><X class="w-4 h-4" /></button>
          </div>
          <div class="space-y-4">
            <div>
              <label class="form-label">{{ t('settings.twoFactor.disablePasswordLabel') }}</label>
              <input v-model="disablePassword" type="password" class="form-input" autocomplete="current-password" />
            </div>
            <div>
              <label class="form-label">{{ t('settings.twoFactor.disableCodeLabel') }}</label>
              <input v-model="disableCode" type="text" class="form-input tracking-widest" :placeholder="t('settings.twoFactor.disableCodePlaceholder')" />
            </div>

            <div v-if="errorMessage" class="flex items-center gap-2 bg-rose-500/[0.15] border border-rose-500/30 rounded-2xl px-4 py-3 text-rose-400 text-sm">
              <AlertCircle class="w-4 h-4 shrink-0" />
              {{ errorMessage }}
            </div>

            <div class="flex gap-3 pt-2">
              <button class="btn-secondary flex-1" type="button" @click="cancelDisable">{{ t('common.cancel') }}</button>
              <button class="btn-primary flex-1" type="button" :disabled="loadingDisable || !disablePassword || !disableCode" @click="confirmDisable">
                <Loader2 v-if="loadingDisable" class="w-4 h-4 animate-spin" />
                <span v-else>{{ t('settings.twoFactor.disableConfirmButton') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, Loader2, ShieldCheck, X } from 'lucide-vue-next'

const { t } = useI18n()
const auth = useAuthStore()
const toast = useToastStore()

const showSetup = ref(false)
const showDisable = ref(false)
const loadingSetup = ref(false)
const loadingConfirm = ref(false)
const loadingDisable = ref(false)
const errorMessage = ref('')

const secret = ref('')
const qrCode = ref('')
const confirmCode = ref('')
const backupCodes = ref<string[]>([])

const disablePassword = ref('')
const disableCode = ref('')

async function startSetup() {
  if (loadingSetup.value) return
  errorMessage.value = ''
  loadingSetup.value = true
  try {
    const data = await $fetch<{ secret: string; qrCode: string }>('/api/auth/2fa/setup', { method: 'POST' })
    secret.value = data.secret
    qrCode.value = data.qrCode
    confirmCode.value = ''
    backupCodes.value = []
    showSetup.value = true
  } catch (error: any) {
    toast.error(error?.data?.message || t('settings.twoFactor.errorGeneric'))
  } finally {
    loadingSetup.value = false
  }
}

async function confirmSetup() {
  if (loadingConfirm.value) return
  errorMessage.value = ''
  loadingConfirm.value = true
  try {
    const data = await $fetch<{ backupCodes: string[] }>('/api/auth/2fa/enable', {
      method: 'POST',
      body: { code: confirmCode.value.trim() },
    })
    backupCodes.value = data.backupCodes
  } catch (error: any) {
    errorMessage.value = error?.data?.message || t('settings.twoFactor.errorGeneric')
  } finally {
    loadingConfirm.value = false
  }
}

function finishSetup() {
  auth.setTwoFactorEnabled(true)
  showSetup.value = false
  toast.success(t('settings.twoFactor.toastEnabled'))
}

function cancelSetup() {
  // Abandonar o setup é seguro: o segredo gerado fica na BD mas
  // `twoFactorEnabled` continua false, nunca é usado para autenticar nada.
  showSetup.value = false
  secret.value = ''
  qrCode.value = ''
  confirmCode.value = ''
  backupCodes.value = []
  errorMessage.value = ''
}

async function confirmDisable() {
  if (loadingDisable.value) return
  errorMessage.value = ''
  loadingDisable.value = true
  try {
    await $fetch('/api/auth/2fa/disable', {
      method: 'POST',
      body: { password: disablePassword.value, code: disableCode.value.trim() },
    })
    auth.setTwoFactorEnabled(false)
    cancelDisable()
    toast.success(t('settings.twoFactor.toastDisabled'))
  } catch (error: any) {
    errorMessage.value = error?.data?.message || t('settings.twoFactor.errorGeneric')
  } finally {
    loadingDisable.value = false
  }
}

function cancelDisable() {
  showDisable.value = false
  disablePassword.value = ''
  disableCode.value = ''
  errorMessage.value = ''
}
</script>
