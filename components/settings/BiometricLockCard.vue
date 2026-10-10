<template>
  <!-- Só na app Android (na web não faz sentido); sem biometria disponível
       mostra o motivo em vez de esconder o cartão (ver stores/appLock.ts). -->
  <div v-if="lock.native" class="glass-card rounded-3xl p-6">
    <h3 class="font-semibold text-white mb-2 flex items-center gap-2">
      <Fingerprint class="w-4 h-4 text-brand-400" /> {{ t('settings.biometric.title') }}
    </h3>
    <p class="text-white/40 text-xs mb-4">{{ t('settings.biometric.description') }}</p>
    <div v-if="!lock.supported" class="space-y-3">
      <p class="text-amber-300 text-xs">{{ t('settings.biometric.unavailable') }}</p>
      <p v-if="lock.reasonCode" class="text-white/60 text-xs">{{ t(`settings.biometric.reason.${lock.reasonCode}`) }}</p>
      <details v-if="lock.reason" class="text-white/40 text-xs">
        <summary class="cursor-pointer">{{ t('settings.biometric.technicalDetails') }}</summary>
        <p class="mt-1 break-words font-mono">{{ lock.reason }}</p>
      </details>
      <button class="btn-secondary text-sm py-2" type="button" @click="lock.reconcile()">
        {{ t('settings.biometric.retry') }}
      </button>
    </div>
    <div v-else class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <Fingerprint class="w-4 h-4" :class="lock.enabled ? 'text-emerald-400' : 'text-white/30'" />
        <p class="text-white text-sm font-medium">
          {{ lock.enabled ? t('settings.biometric.statusEnabled') : t('settings.biometric.statusDisabled') }}
        </p>
      </div>
      <button class="text-sm py-2" :class="lock.enabled ? 'btn-secondary' : 'btn-primary'" type="button" :disabled="busy" @click="toggle">
        {{ lock.enabled ? t('settings.biometric.disable') : t('settings.biometric.enable') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Fingerprint } from 'lucide-vue-next'

const { t } = useI18n()
const lock = useAppLockStore()
const toast = useToastStore()
const busy = ref(false)

// Volta a verificar a disponibilidade sempre que o ecrã abre.
onMounted(() => lock.reconcile())

async function toggle() {
  if (busy.value) return
  busy.value = true
  try {
    if (lock.enabled) {
      lock.disable()
      return
    }
    const ok = await lock.enable(t('appLock.reason'), t('settings.biometric.title'), t('common.cancel'))
    if (ok) toast.success(t('settings.biometric.toastEnabled'))
  } finally {
    busy.value = false
  }
}
</script>
