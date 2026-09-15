import { defineStore } from 'pinia'

interface User {
  _id: string
  name: string
  email: string
  image?: string
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
    try {
      const data = await $fetch<{ user: User | null }>('/api/auth/session')
      user.value = data.user
    } catch {
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function signInWithPassword(payload: { email: string; password: string }) {
    const data = await $fetch<{ user: User }>('/api/auth/session', {
      method: 'POST',
      body: { ...payload, action: 'login' },
    })
    user.value     = data.user
    _fetched.value = true
    return data.user
  }

  async function registerWithPassword(payload: { name: string; email: string; password: string }) {
    const data = await $fetch<{ user: User }>('/api/auth/session', {
      method: 'POST',
      body: { ...payload, action: 'register' },
    })
    user.value     = data.user
    _fetched.value = true
    return data.user
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
    registerWithPassword,
    signOut,
  }
})
