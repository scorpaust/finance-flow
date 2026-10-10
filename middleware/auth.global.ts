export default defineNuxtRouteMiddleware(async (to) => {
  // /privacy e /terms têm de ser públicas: são obrigatórias para a Play Store
  // e têm de ser legíveis antes de criar conta. Upgrade 05 — a recuperação de
  // password também (quem a usa não tem sessão).
  const publicRoutes = ['/login', '/privacy', '/terms', '/forgot-password', '/reset-password']
  const isPublic = publicRoutes.some(r => to.path.startsWith(r))
  if (isPublic) return

  if (import.meta.server) {
    // O cookie de sessão (`session`, assinado — Fase 8, ver server/utils/session.ts)
    // é httpOnly — invisível a `document.cookie` no client, mas o servidor vê
    // o header Cookie do próprio pedido, por isso este atalho só é seguro
    // aqui (nunca no client, onde daria sempre "sem sessão" mesmo com o
    // utilizador autenticado). É só uma verificação de presença (mais barata
    // que validar a assinatura) — sem cookie nenhum, sabemos de certeza que
    // não há sessão e redirecionamos já durante o SSR; a verificação real da
    // assinatura acontece sempre a seguir, em requireAuth()/GET /api/auth/session.
    // Sem isto a página protegida era sempre renderizada no servidor (com
    // dados vazios/placeholder) e só corrigida depois no client, causando um
    // "flash" real do dashboard antes do login aparecer (bug confirmado em
    // teste num dispositivo Android real).
    const sessionCookie = useCookie('session')
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
