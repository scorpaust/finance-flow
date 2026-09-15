import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

// Faz o botão/gesto físico "voltar" do Android navegar para trás na stack de
// rotas Nuxt em vez de fechar a app — exceto na página inicial, onde minimiza
// a app (comportamento padrão Android).
export default defineNuxtPlugin(() => {
  if (!Capacitor.isNativePlatform()) return

  const router = useRouter()

  CapacitorApp.addListener('backButton', () => {
    if (window.history.state?.back) {
      router.back()
    } else {
      CapacitorApp.exitApp()
    }
  })
})
