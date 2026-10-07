// Upgrade 02 — ecrã de arranque nativo (logótipo no fundo escuro): fica até a
// app estar montada e desenhada, e só então desaparece — sem o ecrã branco
// entre o arranque e o site. No browser não faz nada. Se isto nunca correr
// (ex. sem internet), o plugin esconde-o sozinho ao fim de launchShowDuration
// (capacitor.config.ts).
import { Capacitor } from '@capacitor/core'

export default defineNuxtPlugin((nuxtApp) => {
  if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable('SplashScreen')) return
  nuxtApp.hook('app:mounted', () => {
    // Um frame depois de montar, para não mostrar a app a meio do desenho.
    requestAnimationFrame(async () => {
      const { SplashScreen } = await import('@capacitor/splash-screen')
      await SplashScreen.hide({ fadeOutDuration: 200 }).catch(() => {})
    })
  })
})
