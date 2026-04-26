// Client-only plugin: initialises auth store from cookie on first load.
// This is a no-op if auth was already fetched by app.vue.
export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()
  if (!auth.isAuthenticated && !auth.loading) {
    await auth.fetchSession()
  }
})
