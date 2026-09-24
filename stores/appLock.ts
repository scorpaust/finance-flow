import { defineStore } from 'pinia'
// Imports ESTÁTICOS de propósito: com `import()` dinâmico no WebView da app (a
// carregar módulos avulsos do dev server por USB) as chamadas ficavam penduradas
// sem nunca resolver nem falhar — medido no telemóvel. Ambos os pacotes são
// pequenos e seguros no servidor (só tocam na ponte nativa quando chamados).
import { Capacitor, registerPlugin } from '@capacitor/core'
import { App } from '@capacitor/app'

// Fase 8, ponto 4 — bloqueio da app por biometria (só Android nativo). Camada
// de UI por cima da sessão existente: NÃO autentica nada contra o servidor, só
// decide se o conteúdo já autenticado fica escondido. O cookie de sessão
// continua igual (ver context/features/08-FASE-8-seguranca-qualidade.md).
//
// Quando bloqueia: ao abrir a app (arranque a frio) e ao voltar do fundo
// depois de LOCK_GRACE_MS. A tolerância existe porque um caso comum é sair
// segundos para a app autenticadora (Google Authenticator) copiar o código de
// 2FA — bloquear em cada saída obrigava a repetir a biometria a meio do login.
// 60 s é o valor por omissão típico em apps financeiras (a maioria oferece
// "imediato / 1 min / 5 min"; não há seletor aqui de propósito, simplicidade).
const STORAGE_KEY = 'financeflow_biometric_lock'
export const LOCK_GRACE_MS = 60_000

function readEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

// Subconjunto da API do @capgo/capacitor-native-biometric que usamos.
interface NativeBiometricApi {
  isAvailable(opts: { useFallback: boolean }): Promise<{
    isAvailable: boolean
    deviceIsSecure?: boolean
    errorCode?: number | string
  }>
  verifyIdentity(opts: {
    reason?: string
    title?: string
    negativeButtonText?: string
    maxAttempts?: number
  }): Promise<void>
}

// O plugin é pedido PELO NOME à ponte do Capacitor (`registerPlugin`), em vez
// de `import('@capgo/capacitor-native-biometric')`: no WebView da app esse
// import dinâmico ficava pendurado sem nunca resolver nem falhar (medido no
// telemóvel — "sem resposta em import do plugin"). O módulo JS do pacote só
// serve de proxy para a ponte nativa, que já está registada pelo `cap sync`
// (o log do Android mostra `Capacitor/NativeBiometric`). `registerPlugin`
// só pode correr uma vez por nome, por isso o proxy fica em cache.
//
// IMPORTANTE: esta função é SÍNCRONA de propósito. O objeto do plugin é um
// Proxy do Capacitor; devolvê-lo de uma função `async` (ou resolvê-lo numa
// Promise) faz o JS chamar `.then` nele, o Capacitor trata isso como um método
// nativo `then` que nunca responde, e a Promise fica pendurada para sempre —
// foi exatamente o que ficava preso no telemóvel ("sem resposta em ligação ao
// plugin"). Só se faz `await` sobre o RESULTADO das chamadas (isAvailable...),
// nunca sobre o próprio plugin.
let biometricProxy: NativeBiometricApi | null = null
function plugin(): NativeBiometricApi {
  if (!biometricProxy) biometricProxy = registerPlugin<NativeBiometricApi>('NativeBiometric')
  return biometricProxy
}

// Uma chamada nativa que nunca responde deixava o estado parado sem erro nem
// motivo (visto no telemóvel: nativo=true, suportado=false, motivo vazio).
function withTimeout<T>(p: Promise<T>, stage: string, ms = 6000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`sem resposta em "${stage}" após ${ms / 1000}s`)), ms)
    p.then(
      (v) => {
        clearTimeout(timer)
        resolve(v)
      },
      (e) => {
        clearTimeout(timer)
        reject(e)
      }
    )
  })
}

export const useAppLockStore = defineStore('appLock', () => {
  const supported = ref(false) // Android nativo com biometria registada
  const native = ref(false) // a correr dentro da app Android (Capacitor)
  // Porque não está disponível (mostrado nas Definições em vez de esconder o
  // cartão em silêncio — sem isto era impossível perceber o motivo).
  const reason = ref('')
  const enabled = ref(false)
  const locked = ref(false)
  let backgroundedAt: number | null = null
  let initialized = false

  async function checkAvailable(): Promise<boolean> {
    try {
      native.value = Capacitor.isNativePlatform()
      if (!native.value) {
        reason.value = `plataforma ${Capacitor.getPlatform()} (não é a app nativa)`
        return false
      }
      reason.value = 'a chamar isAvailable() no Android…'
      const res = await withTimeout(plugin().isAvailable({ useFallback: false }), 'isAvailable() nativo')
      if (!res.isAvailable) {
        reason.value = `sem biometria disponível (código ${res.errorCode ?? 'n/d'}, ecrã de bloqueio seguro: ${res.deviceIsSecure})`
        return false
      }
      reason.value = ''
      return true
    } catch (e: any) {
      // Não engolir: o erro do plugin é mostrado nas Definições.
      reason.value = `erro do plugin: ${String(e?.message || e).slice(0, 160)}`
      return false
    }
  }

  // Sem biometria registada (ex. o utilizador apagou todas as impressões
  // digitais) a app volta ao comportamento sem bloqueio, em vez de ficar presa
  // a pedir algo que já não existe.
  async function reconcile(): Promise<void> {
    supported.value = await checkAvailable()
    if (enabled.value && !supported.value) {
      setEnabled(false)
      locked.value = false
    }
  }

  function setEnabled(value: boolean) {
    enabled.value = value
    try {
      localStorage.setItem(STORAGE_KEY, value ? '1' : '0')
    } catch {
      /* sem localStorage: a preferência só dura esta sessão */
    }
  }

  // Devolve true se a biometria foi confirmada.
  async function verify(reason: string, title: string, cancel: string): Promise<boolean> {
    try {
      await plugin().verifyIdentity({ reason, title, negativeButtonText: cancel, maxAttempts: 3 })
      return true
    } catch {
      return false
    }
  }

  async function unlock(reason: string, title: string, cancel: string): Promise<boolean> {
    const ok = await verify(reason, title, cancel)
    if (ok) locked.value = false
    return ok
  }

  async function enable(reason: string, title: string, cancel: string): Promise<boolean> {
    // Só ativa depois de o utilizador provar que a biometria funciona.
    if (!supported.value || !(await verify(reason, title, cancel))) return false
    setEnabled(true)
    return true
  }

  // Chamado uma vez, já no client e depois de montar (nunca durante o SSR/
  // hidratação — senão o overlay causava diferenças de hidratação).
  async function init(): Promise<void> {
    if (initialized) return
    initialized = true
    enabled.value = readEnabled()
    await reconcile()
    if (enabled.value) locked.value = true // arranque a frio

    try {
      if (!Capacitor.isNativePlatform()) return
      await App.addListener('appStateChange', async ({ isActive }) => {
        if (!isActive) {
          backgroundedAt = Date.now()
          return
        }
        await reconcile()
        if (enabled.value && backgroundedAt !== null && Date.now() - backgroundedAt >= LOCK_GRACE_MS) {
          locked.value = true
        }
        backgroundedAt = null
      })
    } catch {
      /* fora do Capacitor não há ciclo de vida nativo */
    }
  }

  return { supported, native, reason, enabled, locked, init, unlock, enable, disable: () => setEnabled(false), reconcile }
})
