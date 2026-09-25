import { defineStore } from 'pinia'

interface User {
  _id: string
  name: string
  email: string
  image?: string
  twoFactorEnabled?: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const user     = ref<User | null>(null)
  // Starts true (not false) so SSR and the client hydrate on the same
  // branch of app.vue's `v-if="auth.loading"` gate — otherwise SSR renders
  // the actual (protected) page unconditionally, and a client-only auth
  // redirect firing mid-hydration corrupts the DOM (old + new page content
  // both left mounted). See context/current-feature.md history.
  const loading  = ref(true)
  const _fetched = ref(false)   // reactive so middleware can watch it

  async function fetchSession() {
    // Guard: only fetch once per app lifecycle
    if (_fetched.value) return

    loading.value  = true
    _fetched.value = true          // mark immediately to prevent races
    // GET /api/auth/session responde SEMPRE 200 (`{ user: null }` quando não há
    // sessão) — por isso um erro aqui é rede ou servidor indisponível (ex. o
    // servidor a reiniciar, um corte de Wi-Fi no telemóvel), nunca "sem
    // sessão". Tratá-lo como logout mandava um utilizador com sessão válida
    // para o login. Tenta algumas vezes antes de desistir.
    const attempts = 6
    for (let i = 0; i < attempts; i++) {
      try {
        const data = (await $fetch('/api/auth/session')) as { user: User | null }
        user.value = data.user
        loading.value = false
        return
      } catch {
        if (i < attempts - 1) await new Promise((resolve) => setTimeout(resolve, 1500))
      }
    }
    // Continua sem resposta: mostra o login, mas deixa a próxima navegação
    // tentar de novo em vez de ficar marcado como "já verificado".
    user.value = null
    _fetched.value = false
    loading.value = false
  }

  // Fase 8, ponto 3 — quando a conta tem 2FA ativo, o servidor não devolve
  // `user` nenhum, só `{ twoFactorRequired: true }` (sessão ainda não
  // concedida). O componente de login trata isto como um passo extra antes
  // de navegar para o dashboard — ver pages/login.vue.
  async function signInWithPassword(payload: { email: string; password: string }) {
    const data = (await $fetch('/api/auth/session', {
      method: 'POST',
      body: { ...payload, action: 'login' },
    })) as { user?: User; twoFactorRequired?: boolean }
    if (data.twoFactorRequired) return { twoFactorRequired: true as const }

    user.value     = data.user!
    _fetched.value = true
    return { twoFactorRequired: false as const, user: data.user! }
  }

  async function verifyTwoFactor(code: string) {
    const data = (await $fetch('/api/auth/2fa/verify', {
      method: 'POST',
      body: { code },
    })) as { user: User }
    user.value     = data.user
    _fetched.value = true
    return data.user
  }

  async function registerWithPassword(payload: { name: string; email: string; password: string; acceptTerms: boolean }) {
    const data = (await $fetch('/api/auth/session', {
      method: 'POST',
      body: { ...payload, action: 'register' },
    })) as { user: User }
    user.value     = data.user
    _fetched.value = true
    return data.user
  }

  function setTwoFactorEnabled(enabled: boolean) {
    if (user.value) user.value.twoFactorEnabled = enabled
  }

  async function signOut() {
    await $fetch('/api/auth/session', { method: 'DELETE' })
    user.value     = null
    _fetched.value = false   // allow re-fetch on next load
    await navigateTo('/login')
  }

  const isAuthenticated = computed(() => !!user.value)

  return {
    user,
    loading,
    isAuthenticated,
    fetchSession,
    signInWithPassword,
    verifyTwoFactor,
    setTwoFactorEnabled,
    registerWithPassword,
    signOut,
  }
})
