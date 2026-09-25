<template>
  <div class="min-h-screen auth-bg flex items-center justify-center p-4 relative overflow-hidden">
    <button
      v-if="auth.isAuthenticated"
      class="absolute top-4 right-4 z-20 btn-secondary text-sm py-2 px-4 flex items-center gap-2"
      @click="auth.signOut()"
    >
      <LogOut class="w-4 h-4 text-rose-400" />
      {{ t('auth.signOut') }}
    </button>

    <div class="orb w-[500px] h-[500px] bg-brand-700 -top-40 -left-40 opacity-30" style="animation-delay:0s" />
    <div class="orb w-[400px] h-[400px] bg-purple-700 -bottom-32 -right-32 opacity-25" style="animation-delay:-4s" />

    <div
      v-for="p in particles"
      :key="p.id"
      class="absolute w-1 h-1 rounded-full bg-brand-400/40 animate-float pointer-events-none"
      :style="{ left: p.x + '%', top: p.y + '%', animationDelay: p.delay + 's', animationDuration: p.dur + 's' }"
    />

    <div class="relative z-10 w-full max-w-md animate-scale-in">
      <div class="absolute inset-0 bg-gradient-to-br from-brand-600/20 to-purple-600/20 rounded-4xl blur-2xl" />

      <div class="relative glass-card rounded-4xl p-8 sm:p-10">
        <div class="text-center mb-8">
          <div class="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center neon-brand animate-bounce-subtle">
            <span class="text-4xl">💹</span>
          </div>
          <h1 class="font-display font-bold text-3xl text-white mb-2">FinanceFlow</h1>
          <p class="text-white/50 text-sm leading-relaxed">
            {{ step === 'twoFactor' ? t('auth.twoFactorSubtitle') : mode === 'login' ? t('auth.loginSubtitle') : t('auth.registerSubtitle') }}
          </p>
        </div>

        <div v-if="step === 'credentials'" class="grid grid-cols-2 gap-1 bg-surface-700/50 rounded-2xl p-1 mb-6">
          <button
            type="button"
            data-testid="login-tab-login"
            class="py-2.5 rounded-xl text-sm font-semibold transition-all"
            :class="mode === 'login' ? 'bg-brand-600 text-white shadow-glow-sm' : 'text-white/50 hover:text-white'"
            @click="setMode('login')"
          >
            {{ t('auth.loginTab') }}
          </button>
          <button
            type="button"
            data-testid="login-tab-register"
            class="py-2.5 rounded-xl text-sm font-semibold transition-all"
            :class="mode === 'register' ? 'bg-brand-600 text-white shadow-glow-sm' : 'text-white/50 hover:text-white'"
            @click="setMode('register')"
          >
            {{ t('auth.registerTab') }}
          </button>
        </div>

        <form v-if="step === 'credentials'" class="space-y-4" @submit.prevent="submit">
          <div v-if="mode === 'register'">
            <label class="form-label">{{ t('auth.nameLabel') }}</label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                v-model="form.name"
                type="text"
                data-testid="login-name"
                class="form-input pl-9"
                autocomplete="name"
                :placeholder="t('auth.namePlaceholder')"
              />
            </div>
          </div>

          <div>
            <label class="form-label">{{ t('auth.emailLabel') }}</label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                v-model="form.email"
                type="email"
                data-testid="login-email"
                class="form-input pl-9"
                autocomplete="email"
                placeholder="nome@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label class="form-label">{{ t('auth.passwordLabel') }}</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                v-model="form.password"
                type="password"
                data-testid="login-password"
                class="form-input pl-9"
                :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
                :placeholder="t('auth.passwordPlaceholder')"
                required
              />
            </div>
          </div>

          <!-- Aceitação explícita: desmarcada por omissão e obrigatória (validada
               também no servidor). Só no registo. -->
          <label v-if="mode === 'register'" class="flex items-start gap-3 cursor-pointer">
            <input
              v-model="form.acceptTerms"
              type="checkbox"
              data-testid="login-accept-terms"
              class="mt-0.5 w-4 h-4 shrink-0 accent-brand-500"
              required
            />
            <i18n-t keypath="auth.acceptTerms" tag="span" class="text-white/60 text-xs leading-relaxed">
              <template #terms>
                <NuxtLink to="/terms" target="_blank" class="underline hover:text-white">{{ t('legal.terms') }}</NuxtLink>
              </template>
              <template #privacy>
                <NuxtLink to="/privacy" target="_blank" class="underline hover:text-white">{{ t('legal.privacy') }}</NuxtLink>
              </template>
            </i18n-t>
          </label>

          <div
            v-if="errorMessage"
            class="flex items-center gap-2 bg-rose-500/[0.15] border border-rose-500/30 rounded-2xl px-4 py-3 text-rose-400 text-sm"
          >
            <AlertCircle class="w-4 h-4 shrink-0" />
            {{ errorMessage }}
          </div>

          <button
            :disabled="loading"
            data-testid="login-submit"
            class="btn-primary w-full flex items-center justify-center gap-2"
            type="submit"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <LogIn v-else class="w-4 h-4" />
            {{ loading ? t('auth.submitting') : mode === 'login' ? t('auth.submitLogin') : t('auth.submitRegister') }}
          </button>
        </form>

        <!-- Fase 8, ponto 3 — segundo passo do login quando a conta tem 2FA ativo -->
        <form v-else class="space-y-4" @submit.prevent="submitTwoFactor">
          <div>
            <label class="form-label">{{ t('auth.twoFactorCodeLabel') }}</label>
            <div class="relative">
              <ShieldCheck class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                v-model="twoFactorCode"
                type="text"
                inputmode="text"
                autocomplete="one-time-code"
                class="form-input pl-9 tracking-widest"
                :placeholder="t('auth.twoFactorCodePlaceholder')"
                autofocus
                required
              />
            </div>
            <p class="text-white/30 text-xs mt-2">{{ t('auth.twoFactorHint') }}</p>
          </div>

          <div
            v-if="errorMessage"
            class="flex items-center gap-2 bg-rose-500/[0.15] border border-rose-500/30 rounded-2xl px-4 py-3 text-rose-400 text-sm"
          >
            <AlertCircle class="w-4 h-4 shrink-0" />
            {{ errorMessage }}
          </div>

          <button
            :disabled="loading"
            class="btn-primary w-full flex items-center justify-center gap-2"
            type="submit"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <ShieldCheck v-else class="w-4 h-4" />
            {{ loading ? t('auth.submitting') : t('auth.twoFactorSubmit') }}
          </button>

          <button type="button" class="text-white/40 text-xs w-full text-center hover:text-white/60 transition-colors" @click="cancelTwoFactor">
            {{ t('auth.twoFactorBackButton') }}
          </button>
        </form>

        <p v-if="step === 'credentials'" class="text-center text-white/25 text-xs mt-5">
          {{ t('auth.footerNote') }}
        </p>
        <p v-if="step === 'credentials'" class="text-center text-white/40 text-xs mt-2 space-x-3">
          <NuxtLink to="/terms" class="hover:text-white/70 underline">{{ t('legal.terms') }}</NuxtLink>
          <NuxtLink to="/privacy" class="hover:text-white/70 underline">{{ t('legal.privacy') }}</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, Loader2, Lock, LogIn, LogOut, Mail, ShieldCheck, User } from 'lucide-vue-next'

definePageMeta({ layout: false })

const auth = useAuthStore()
const toast = useToastStore()
const { t } = useI18n()
const loading = ref(false)
const errorMessage = ref('')
const mode = ref<'login' | 'register'>('login')
const step = ref<'credentials' | 'twoFactor'>('credentials')
const twoFactorCode = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  acceptTerms: false,
})

// Quem já tem sessão válida não deve ficar parado no ecrã de login (acontecia
// quando a página recarregava a meio da navegação para o dashboard — ex. o
// Vite a reotimizar dependências em dev — e só aparecia "Terminar sessão").
watch(
  () => [auth.isAuthenticated, auth.loading] as const,
  ([authenticated, isLoading]) => {
    if (authenticated && !isLoading && step.value === 'credentials') navigateTo('/')
  },
  { immediate: true }
)

const particles = Array.from({ length: 18 }, (_, i) => {
  const seed = i + 1
  return {
    id: i,
    x: (seed * 37) % 100,
    y: (seed * 61) % 100,
    delay: -Number(((seed * 0.37) % 6).toFixed(1)),
    dur: Number((5 + ((seed * 0.53) % 4)).toFixed(1)),
  }
})

function setMode(nextMode: 'login' | 'register') {
  mode.value = nextMode
  errorMessage.value = ''
}

async function submit() {
  if (loading.value) return

  errorMessage.value = ''
  loading.value = true

  try {
    if (mode.value === 'register') {
      await auth.registerWithPassword({
        name: form.name,
        email: form.email,
        password: form.password,
        acceptTerms: form.acceptTerms,
      })
      toast.success(t('auth.toastAccountCreated'))
      await navigateTo('/')
      return
    }

    const result = await auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (result.twoFactorRequired) {
      step.value = 'twoFactor'
      return
    }

    toast.success(t('auth.toastSignedIn'))
    await navigateTo('/')
  } catch (error: any) {
    errorMessage.value = error?.data?.message || t('auth.errorGeneric')
  } finally {
    loading.value = false
  }
}

async function submitTwoFactor() {
  if (loading.value) return

  errorMessage.value = ''
  loading.value = true

  try {
    await auth.verifyTwoFactor(twoFactorCode.value.trim())
    toast.success(t('auth.toastSignedIn'))
    await navigateTo('/')
  } catch (error: any) {
    errorMessage.value = error?.data?.message || t('auth.errorGeneric')
  } finally {
    loading.value = false
  }
}

function cancelTwoFactor() {
  step.value = 'credentials'
  twoFactorCode.value = ''
  errorMessage.value = ''
  form.password = ''
}
</script>
