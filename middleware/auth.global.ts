export default defineNuxtRouteMiddleware(async (to) => {
  // Skip entirely on SSR — no cookie context on server
  if (import.meta.server) return

  const auth = useAuthStore()

  // Always ensure session is fetched before deciding — the store
  // uses an internal _fetched flag so this is safe to call on every nav
  await auth.fetchSession()

  const publicRoutes = ['/login']
  const isPublic = publicRoutes.some(r => to.path.startsWith(r))

  if (!auth.isAuthenticated && !isPublic) {
    return navigateTo('/login')
  }
})
