import { Capacitor } from '@capacitor/core'

/**
 * usePlatform — deteção de plataforma (web vs. Android nativo via Capacitor).
 * Usar para diferenciar comportamento (ex.: esconder prompt de instalação PWA
 * quando já corre como app nativa, ajustar navegação/back button Android).
 */
export function usePlatform() {
  const isNative  = computed(() => Capacitor.isNativePlatform())
  const platform  = computed(() => Capacitor.getPlatform())
  const isAndroid = computed(() => platform.value === 'android')
  const isWeb     = computed(() => platform.value === 'web')

  return { isNative, isAndroid, isWeb, platform }
}
