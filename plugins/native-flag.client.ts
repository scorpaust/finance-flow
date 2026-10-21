// Upgrade 12 — marca a app Android num cookie, para o servidor saber, logo no
// pedido, que a raiz sem sessão é para abrir o login e não a página de
// apresentação (que tem o botão da Google Play). No browser não faz nada.
import { Capacitor } from '@capacitor/core'

export default defineNuxtPlugin(() => {
  if (!Capacitor.isNativePlatform()) return
  const flag = useCookie('ff_native', { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  if (String(flag.value) !== '1') flag.value = '1'
})
