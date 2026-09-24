<template>
  <!-- Opaco e por cima de tudo: enquanto bloqueado, o conteúdo nunca é visível.
       Só oferece "Desbloquear" e "Terminar sessão" — nenhum atalho que contorne
       a biometria (Fase 8, ponto 4). -->
  <div
    v-if="visible"
    class="fixed inset-0 z-[300] flex items-center justify-center auth-bg p-6"
    role="dialog"
    aria-modal="true"
  >
    <div class="glass-card rounded-4xl p-8 w-full max-w-sm text-center space-y-5">
      <div class="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
        <Fingerprint class="w-8 h-8 text-white" />
      </div>
      <div>
        <h2 class="font-display font-bold text-xl text-white">{{ t('appLock.title') }}</h2>
        <p class="text-white/50 text-sm mt-1">{{ t('appLock.subtitle') }}</p>
      </div>
      <button class="btn-primary w-full" type="button" :disabled="busy" @click="tryUnlock">
        {{ t('appLock.unlock') }}
      </button>
      <button class="text-rose-400 text-sm hover:text-rose-300 transition-colors" type="button" @click="logout">
        {{ t('appLock.signOut') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Fingerprint } from 'lucide-vue-next'

const { t } = useI18n()
const lock = useAppLockStore()
const auth = useAuthStore()
const busy = ref(false)

// Sem sessão não há nada para proteger (ex. ecrã de login depois de terminar
// sessão); enquanto a sessão carrega, mantém-se bloqueado para o dashboard
// nunca aparecer por instantes antes do overlay.
const visible = computed(() => lock.locked && (auth.loading || auth.isAuthenticated))

async function tryUnlock() {
  if (busy.value) return
  busy.value = true
  try {
    await lock.unlock(t('appLock.reason'), t('appLock.title'), t('common.cancel'))
  } finally {
    busy.value = false
  }
}

async function logout() {
  lock.locked = false
  await auth.signOut()
}

// Pede a biometria logo que o ecrã bloqueia (sem exigir um toque extra).
watch(
  visible,
  (isVisible) => {
    if (isVisible && !auth.loading) tryUnlock()
  }
)
watch(
  () => auth.loading,
  (loading) => {
    if (!loading && visible.value) tryUnlock()
  }
)
</script>
