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
const PROD_APP_URL = process.env.CAPACITOR_SERVER_URL || 'https://financeflow-fase2-subs.netlify.app'
// cleartext (HTTP simples) só quando o URL é mesmo http:// — um dev server
// local (adb reverse / IP da LAN). Antes bastava CAPACITOR_SERVER_URL estar
// definida, mesmo com um https://. O build de release proíbe cleartext de
// qualquer forma (android/app/src/main/AndroidManifest.xml).
const IS_DEV_OVERRIDE = PROD_APP_URL.startsWith('http://')

const config: CapacitorConfig = {
  appId: 'com.financeflow.app',
  appName: 'FinanceFlow',
  // Fallback local (offline mínimo) caso `server.url` seja removido no futuro.
  webDir: '.output/public',
  server: {
    url: PROD_APP_URL,
    cleartext: IS_DEV_OVERRIDE,
  },
  android: {
    allowMixedContent: IS_DEV_OVERRIDE,
  },
}

export default config
