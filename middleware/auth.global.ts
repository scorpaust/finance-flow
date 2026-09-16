export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = ['/login']
  const isPublic = publicRoutes.some(r => to.path.startsWith(r))
  if (isPublic) return

  if (import.meta.server) {
    // O cookie de sessão (`userId`) é httpOnly — invisível a `document.cookie`
    // no client, mas o servidor vê o header Cookie do próprio pedido, por
    // isso este atalho só é seguro aqui (nunca no client, onde daria sempre
    // "sem sessão" mesmo com o utilizador autenticado). Sem cookie, sabemos
    // de certeza que não há sessão e redirecionamos já durante o SSR — sem
    // isto a página protegida era sempre renderizada no servidor (com dados
    // vazios/placeholder) e só corrigida depois no client, causando um
    // "flash" real do dashboard antes do login aparecer (bug confirmado em
    // teste num dispositivo Android real).
    const sessionCookie = useCookie('userId')
    if (!sessionCookie.value) {
      return navigateTo('/login')
    }
    return
  }

  const auth = useAuthStore()

  // Always ensure session is fetched before deciding — the store
  // uses an internal _fetched flag so this is safe to call on every nav
  await auth.fetchSession()

  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }
})
