import type { CapacitorConfig } from '@capacitor/cli'

// Domínio público (produção/staging) onde a app web está publicada.
// A shell nativa Android carrega esta URL dentro da WebView — como uma PWA
// "instalada" — em vez de servir os ficheiros estáticos locais em `webDir`.
// Motivo: a sessão usa cookie `httpOnly`; se a WebView carregasse `webDir`
// localmente, o domínio não corresponderia ao do backend e o cookie seria
// tratado como de terceiros. Ver decisão em context/features/01-FASE-1-fundacao-multiplataforma.md
// e no README ("Arquitetura multiplataforma Android").
const PROD_APP_URL = process.env.CAPACITOR_SERVER_URL || 'https://financeflow.example.com'

const config: CapacitorConfig = {
  appId: 'com.financeflow.app',
  appName: 'FinanceFlow',
  // Fallback local (offline mínimo) caso `server.url` seja removido no futuro.
  webDir: '.output/public',
  server: {
    url: PROD_APP_URL,
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
}

export default config
