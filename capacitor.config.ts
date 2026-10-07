import type { CapacitorConfig } from '@capacitor/cli'

// Domínio público (produção/staging) onde a app web está publicada.
// A shell nativa Android carrega esta URL dentro da WebView — como uma PWA
// "instalada" — em vez de servir os ficheiros estáticos locais em `webDir`.
// Motivo: a sessão usa cookie `httpOnly`; se a WebView carregasse `webDir`
// localmente, o domínio não corresponderia ao do backend e o cookie seria
// tratado como de terceiros. Ver decisão em context/features/01-FASE-1-fundacao-multiplataforma.md
// e no README ("Arquitetura multiplataforma Android").
// Fase 9 — produção no subdomínio do Netlify (decisão do utilizador,
// 2026-09-29, até haver domínio próprio). Mudar aqui E em APP_URL no Netlify
// se o site mudar de nome ou ganhar domínio próprio.
const PROD_APP_URL = process.env.CAPACITOR_SERVER_URL || 'https://financeflow-webapp.netlify.app'
// cleartext (HTTP simples) só quando o URL é mesmo http:// — um dev server
// local (adb reverse / IP da LAN). Antes bastava CAPACITOR_SERVER_URL estar
// definida, mesmo com um https://. O build de release proíbe cleartext de
// qualquer forma (android/app/src/main/AndroidManifest.xml).
const IS_DEV_OVERRIDE = PROD_APP_URL.startsWith('http://')

const config: CapacitorConfig = {
  appId: 'com.dinismcosta.financeflow',
  appName: 'FinanceFlow',
  // Fase 9 (1.0.2) — só os ficheiros locais da shell: index.html (salto para
  // o site) e offline.html (ecrã sem internet). Antes era `.output/public`,
  // que metia um build Nuxt antigo e inútil dentro da app.
  webDir: 'android-web',
  server: {
    url: PROD_APP_URL,
    cleartext: IS_DEV_OVERRIDE,
    // Página local mostrada pela WebView quando o site não carrega (sem
    // internet, DNS, timeout). Não tem acesso aos plugins nativos.
    errorPath: 'offline.html',
  },
  // Upgrade 02 — fundo da WebView enquanto o site carrega (antes: branco).
  backgroundColor: '#0f0f23',
  android: {
    allowMixedContent: IS_DEV_OVERRIDE,
  },
  plugins: {
    // Edge-to-edge (obrigatório no Android 15+ com targetSdk 36): barra de
    // estado escura com ícones claros; as margens de segurança chegam ao CSS
    // em --safe-area-inset-* (corrige env() nas WebViews < 140).
    SystemBars: {
      insetsHandling: 'css',
      style: 'DARK',
    },
    // A app esconde o ecrã de arranque quando o site está desenhado
    // (plugins/native-splash.client.ts). O limite garante que nunca fica
    // preso — ex. sem internet, a página offline.html não tem plugins.
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 4000,
      backgroundColor: '#0f0f23',
    },
  },
}

export default config
