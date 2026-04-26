<template>
  <div class="min-h-screen auth-bg flex items-center justify-center p-4 relative overflow-hidden">
    <button
      v-if="auth.isAuthenticated"
      class="absolute top-4 right-4 z-20 btn-secondary text-sm py-2 px-4 flex items-center gap-2"
      @click="auth.signOut()"
    >
      <LogOut class="w-4 h-4 text-rose-400" />
      Terminar sessão
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
            {{ mode === 'login' ? 'Entra na tua conta' : 'Cria uma conta local' }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-1 bg-surface-700/50 rounded-2xl p-1 mb-6">
          <button
            type="button"
            class="py-2.5 rounded-xl text-sm font-semibold transition-all"
            :class="mode === 'login' ? 'bg-brand-600 text-white shadow-glow-sm' : 'text-white/50 hover:text-white'"
            @click="setMode('login')"
          >
            Entrar
          </button>
          <button
            type="button"
            class="py-2.5 rounded-xl text-sm font-semibold transition-all"
            :class="mode === 'register' ? 'bg-brand-600 text-white shadow-glow-sm' : 'text-white/50 hover:text-white'"
            @click="setMode('register')"
          >
            Criar conta
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="submit">
          <div v-if="mode === 'register'">
            <label class="form-label">Nome</label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                v-model="form.name"
                type="text"
                class="form-input pl-9"
                autocomplete="name"
                placeholder="O teu nome"
              />
            </div>
          </div>

          <div>
            <label class="form-label">Email</label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                v-model="form.email"
                type="email"
                class="form-input pl-9"
                autocomplete="email"
                placeholder="nome@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label class="form-label">Password</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                v-model="form.password"
                type="password"
                class="form-input pl-9"
                :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
                placeholder="Minimo 8 caracteres"
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

          <button
            :disabled="loading"
            class="btn-primary w-full flex items-center justify-center gap-2"
            type="submit"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <LogIn v-else class="w-4 h-4" />
            {{ loading ? 'A autenticar...' : mode === 'login' ? 'Entrar' : 'Criar conta' }}
          </button>
        </form>

        <p class="text-center text-white/25 text-xs mt-5">
          Autenticacao local guardada no MongoDB.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, Loader2, Lock, LogIn, LogOut, Mail, User } from 'lucide-vue-next'

definePageMeta({ layout: false })

const auth = useAuthStore()
const toast = useToastStore()
const loading = ref(false)
const errorMessage = ref('')
const mode = ref<'login' | 'register'>('login')

const form = reactive({
  name: '',
  email: '',
  password: '',
})

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
      })
      toast.success('Conta criada')
    } else {
      await auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      toast.success('Sessao iniciada')
    }

    await navigateTo('/')
  } catch (error: any) {
    errorMessage.value = error?.data?.message || 'Erro de autenticacao'
  } finally {
    loading.value = false
  }
}
</script>
