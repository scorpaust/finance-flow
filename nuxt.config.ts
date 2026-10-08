export default defineNuxtConfig({
  // Desligadas quando a app corre pela infraestrutura de testes/capturas
  // (scripts/e2e-server.mjs define E2E_PORT): o botão flutuante das devtools
  // aparecia nas capturas da Play Store e pode tapar elementos nos testes.
  devtools: { enabled: !process.env.E2E_PORT },

  // O Nuxt regenera a app a cada ficheiro criado/apagado dentro do projeto. Um
  // `gradlew assembleDebug` ou `cap sync` mexe em milhares de ficheiros em
  // android/ e deixava o dev server em ciclo de recompilações (arranque de
  // minutos, avisos de hidratação). Nada em android/ faz parte da app web.
  ignore: ['android/**'],

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  modules: [
    '@nuxtjs/tailwindcss',
    ['@pinia/nuxt', { storesDirs: ['./stores/**'] }],
    '@vueuse/nuxt',
    '@vite-pwa/nuxt',
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    // Lighthouse (2026-10-08) — fontes servidas pelo próprio site, em vez do
    // CSS do Google Fonts que bloqueava o primeiro desenho (~1 s em telemóvel)
    // e obrigava a dois domínios externos na CSP. Descarregadas no build.
    '@nuxt/fonts',
    // Fase 8, ponto 8 — monitorização de erros. Só carrega com SENTRY_DSN
    // definido: sem DSN a app não instrumenta nem envia nada (dev/testes
    // nunca poluem o projeto Sentry, e um DSN em falta nunca parte o build).
    // Fase 8, ponto 8 — o alvo de deploy real é o Netlify (Nitro gera funções
    // serverless, confirmado pelo preset `netlify-legacy` detetado a partir de
    // .netlify/ neste projeto — NÃO um node-server persistente em Docker, como
    // uma versão anterior desta nota presumia sem confirmar). Num serverless o
    // CLI flag `--import` não é aplicável (não há um comando de arranque
    // nosso a controlar) — `autoInjectServerSentry: 'top-level-import'` injeta
    // a configuração do Sentry no topo do ficheiro de entrada do Nitro durante
    // o build, e o próprio módulo volta a exportar o handler serverless
    // embrulhado (necessário para a Sentry conseguir fazer `flush()` antes de
    // a função terminar — sem isto, eventos capturados podem perder-se quando
    // o processo é morto logo após responder). Ver context/OPERATIONS.md.
    // As opções vão junto com o módulo (e não numa chave `sentry:` à parte):
    // sem DSN o módulo não é carregado, a chave fica sem tipo e o
    // `nuxt typecheck` do CI (sem SENTRY_DSN) falhava com TS2353.
    ...(process.env.SENTRY_DSN ? [['@sentry/nuxt/module', { autoInjectServerSentry: 'top-level-import' }] as [string, Record<string, unknown>]] : []),
  ],

  // Fase 7— Internacionalização. `strategy: 'no_prefix'` porque a app não
  // tem (nem precisa de) rotas prefixadas por idioma (`/en/transacoes`) — o
  // idioma é só uma preferência de interface, não faz parte do endereço da
  // página (bookmarks, deep links do WebView Android continuam a funcionar
  // sem alteração).
  //
  // `detectBrowserLanguage` está DESLIGADO de propósito (não é o default do
  // módulo — decisão explícita): o mecanismo de redireciono embutido
  // (`redirectOn: 'root'`) só faz sentido em estratégias com prefixo, onde
  // existe um URL localizado para onde redirecionar. Em `no_prefix` não há
  // nenhum URL para onde ir, mas o módulo ainda assim tentava navegar sempre
  // que a app chegava a `/` — e como um utilizador não autenticado nunca
  // chega a renderizar `/` (o `middleware/auth.global.ts` intercepta e manda
  // logo para `/login`), a 1.ª vez que `/` era mesmo visitado era já a
  // seguir ao login, do lado do client (`navigateTo('/')` em
  // `pages/login.vue`) — nessa altura o redireciono do módulo entrava em
  // conflito com a navegação da própria app e a app ficava presa no login
  // (bug real, reproduzido e corrigido nesta sessão). Deteção e persistência
  // feitas à mão em vez disso — ver `plugins/locale.ts`.
  i18n: {
    locales: [
      { code: 'pt-PT', name: 'Português', file: 'pt-PT.json' },
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'fr', name: 'Français', file: 'fr.json' },
      { code: 'de', name: 'Deutsch', file: 'de.json' },
      { code: 'it', name: 'Italiano', file: 'it.json' },
      { code: 'es', name: 'Español', file: 'es.json' },
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix',
    langDir: 'locales/',
    detectBrowserLanguage: false,
  },

  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'dark',
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'FinanceFlow',
      short_name: 'FinanceFlow',
      description: 'Personal Finance Manager with AI Predictions',
      theme_color: '#0f0f23',
      background_color: '#0f0f23',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '/',
      icons: [
        { src: '/icons/icon-72x72.svg',   sizes: '72x72',   type: 'image/svg+xml' },
        { src: '/icons/icon-96x96.svg',   sizes: '96x96',   type: 'image/svg+xml' },
        { src: '/icons/icon-128x128.svg', sizes: '128x128', type: 'image/svg+xml' },
        { src: '/icons/icon-144x144.svg', sizes: '144x144', type: 'image/svg+xml' },
        { src: '/icons/icon-152x152.svg', sizes: '152x152', type: 'image/svg+xml' },
        { src: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
        { src: '/icons/icon-384x384.svg', sizes: '384x384', type: 'image/svg+xml' },
        { src: '/icons/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'google-fonts-stylesheets' },
        },
        // Os ficheiros de fonte em si (antes nunca ficavam em cache offline).
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-webfonts',
            cacheableResponse: { statuses: [0, 200] },
            expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
          },
        },
      ],
    },
    // Desativado em dev — um service worker ativo contra um dev server que
    // muda a cada gravação causa cache desatualizada persistente (formatação
    // partida ao reabrir a app, cliques a não reagir por estarem a intercetar
    // pedidos antigos). Confirmado em teste real na app Android via túnel USB
    // nesta sessão. Produção continua com o SW normalmente ativo (controlado
    // por `registerType`/`workbox` acima, não por `devOptions`).
    devOptions: {
      enabled: false,
    },
  },

  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/financeflow',
    // Fase 9 — produção e desenvolvimento no mesmo cluster Atlas, em bases
    // separadas (decisão de 2026-09-30): produção usa `financeflow-prod`.
    mongodbDbName: process.env.MONGODB_DB_NAME || 'financeflow',
    // Fase 8, ponto 2 — assina o cookie de sessão (server/utils/session.ts).
    // Sem valor por omissão de propósito: sem isto, TODAS as sessões seriam
    // inválidas (falha alto e cedo, em vez de assinar com um segredo
    // previsível/partilhado entre instalações).
    sessionSecret: process.env.SESSION_SECRET || '',
    // Fase 8, ponto 3 — chave de encriptação dos segredos TOTP em repouso
    // (server/utils/twoFactor.ts). Também sem default: nunca deve ser
    // previsível.
    twoFactorEncryptionKey: process.env.TWO_FACTOR_ENCRYPTION_KEY || '',
    // Fase 2 — Subscrições (EasyPay: CC/DD, MB WAY, Multibanco). Ver context/CONFIG-REFERENCE.md.
    easypayEnv: process.env.EASYPAY_ENV || 'test',
    easypayAccountId: process.env.EASYPAY_ACCOUNT_ID || '',
    easypayApiKey: process.env.EASYPAY_API_KEY || '',
    subscriptionRenewalReminderDays: process.env.SUBSCRIPTION_RENEWAL_REMINDER_DAYS || '5',
    cronSecret: process.env.CRON_SECRET || '',
    // Fase 8, ponto 9 — segredo separado do `cronSecret`, para o endpoint de
    // administração manual (refund-delete.post.ts). Ver server/utils/cron.ts.
    adminSecret: process.env.ADMIN_SECRET || '',
    // Fase 3 — Insights com IA (Anthropic + Twelve Data). Nunca em `public`: a
    // chave nunca pode chegar ao client. Ver context/features/03-FASE-3-insights-ia.md.
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    twelveDataApiKey: process.env.TWELVE_DATA_API_KEY || '',
    // Fase 6 — só com 'true' as dicas de investimento recebem um resumo agregado
    // do portfolio. Desligada por omissão até haver validação jurídica (ver
    // context/features/06-FASE-6-registo-investimentos.md, decisão 8).
    investmentTipsIncludePortfolio: process.env.INVESTMENT_TIPS_INCLUDE_PORTFOLIO === 'true',
    // Fase 7 — caminho local do ficheiro GeoLite2-Country.mmdb (licenciado,
    // não fica no repositório — ver context/CONFIG-REFERENCE.md para o
    // processo de download/atualização). Sem o ficheiro, `server/utils/geo.ts`
    // devolve sempre `null` (país desconhecido) em vez de rebentar.
    geoliteDbPath: process.env.GEOLITE2_DB_PATH || '',
    // Upgrade 01 — a configuração da Google Play (GOOGLE_PLAY_*) NÃO passa por
    // aqui: é lida do ambiente em runtime em server/utils/googlePlay.ts (as
    // variáveis secretas do Netlify chegam mascaradas ao build local).
    public: {
      // O DSN do Sentry é público por desenho (vai no bundle do client).
      sentryDsn: process.env.SENTRY_DSN || '',
      appUrl: process.env.APP_URL || 'http://localhost:3000',
      // Passado ao @easypaypt/checkout-sdk (opção `testing`) — não é secreto,
      // só diz ao SDK client-side qual API da EasyPay usar.
      easypayTesting: process.env.EASYPAY_ENV !== 'production',
    },
  },

  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  // server/plugins/ é carregado automaticamente pelo Nitro (antes o
  // mongoose.ts estava também listado aqui e registava-se duas vezes).
  //
  // Cabeçalhos de segurança em todas as respostas.
  //
  // Fase 9 — CSP obrigatória (bloqueia) desde 2026-10-03. Validada antes em
  // Report-Only num build de produção: todas as páginas (conta Premium) e o
  // checkout EasyPay sandbox com cartão e débito direto, 0 violações. É a
  // proteção contra scripts maliciosos na página que embebe o iframe de
  // pagamento (PCI DSS 4.0, SAQ A). O checkout da EasyPay (iframe em
  // pay[.sandbox].easypay.pt), as Google Fonts e o Sentry vêm de domínios
  // terceiros. `'unsafe-inline'` em script-src por causa do payload de
  // hidratação inline do Nuxt.
  routeRules: {
    '/**': {
      headers: {
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline'",
          "style-src 'self' 'unsafe-inline'",
          "font-src 'self' data:",
          "img-src 'self' data: blob: https:",
          "connect-src 'self' https://*.ingest.sentry.io https://*.ingest.de.sentry.io https://*.ingest.us.sentry.io https://pay.easypay.pt https://pay.sandbox.easypay.pt",
          "frame-src https://pay.easypay.pt https://pay.sandbox.easypay.pt",
          "worker-src 'self' blob:",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
        ].join('; '),
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        // Sem `payment`: o iframe de checkout da EasyPay pode precisar dele.
        'Permissions-Policy': 'camera=(self), microphone=(), geolocation=()',
        // Ignorado pelos browsers em http:// (dev local); só tem efeito em HTTPS.
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      },
    },
    // Respostas da API são por utilizador: nunca em caches partilhadas.
    '/api/**': { headers: { 'Cache-Control': 'no-store' } },
  },

  // TF.js is browser-only — pre-bundle for fast dynamic import, exclude from SSR
  vite: {
    optimizeDeps: {
      // Os módulos do Capacitor são importados dinamicamente (só correm em
      // nativo) — sem isto o Vite só os descobre na primeira utilização, o que
      // reotimiza e recarrega a página a meio (ver stores/appLock.ts). O SDK
      // de checkout da EasyPay tem o mesmo problema — reproduzido nesta
      // sessão por um teste E2E (Playwright) que abriu a página de
      // subscrição pela 1.ª vez a meio de um fluxo: o Vite reotimizou e
      // recarregou a página, perdendo o estado do formulário nessa página.
      // Só acontece em `nuxt dev` (produção pré-empacota tudo à partida).
      include: ['@tensorflow/tfjs', '@capacitor/core', '@capacitor/app', '@easypaypt/checkout-sdk'],
    },
    ssr: {
      noExternal: ['chart.js'],
      external: ['@tensorflow/tfjs'],
    },
  },

  // Mark heavy client-only libs so Nuxt doesn't SSR them
  build: {
    transpile: ['vue-chartjs', 'chart.js'],
  },

  typescript: {
    strict: false,
    typeCheck: false,
    // `ignore: ['android/**']` (acima) só vale para o Nuxt, não para o
    // TypeScript: sem isto o type-check lia os bundles JS dentro dos builds
    // do Gradle, que declaram um `$fetch` minificado e não genérico
    // (a origem dos erros "Expected 0 type arguments" em `$fetch<T>`).
    tsConfig: {
      exclude: ['../android'],
    },
  },

  // Só os pesos realmente usados (Tailwind font-normal…font-bold) e os
  // alfabetos latinos (as 6 línguas da app); preload da fonte principal de cada família.
  fonts: {
    families: [
      { name: 'Inter', weights: [400, 500, 600, 700] },
      { name: 'Space Grotesk', weights: [400, 500, 600, 700] },
    ],
    defaults: {
      subsets: ['latin', 'latin-ext'],
      preload: true,
    },
  },

  app: {
    head: {
      title: 'FinanceFlow',
      link: [
        // Mesmo logótipo do ícone Android/manifest PWA (Fase 4, tarefa 6) —
        // sem isto o browser não tinha favicon explícito nenhum.
        { rel: 'icon', type: 'image/svg+xml', href: '/icons/icon-192x192.svg' },
        { rel: 'apple-touch-icon', href: '/icons/icon-192x192.svg' },
      ],
      meta: [
        // Sem maximum-scale/user-scalable=no: bloquear o pinch-zoom falha o
        // critério WCAG 1.4.4/1.4.10 (Fase 4, tarefa 7 — acessibilidade).
        { name: 'viewport',                        content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color',                     content: '#0f0f23' },
        { name: 'apple-mobile-web-app-capable',    content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
    },
    // Transição de página global (Fase 4, tarefa 5) — classes .page-* já
    // existentes em assets/css/main.css, só faltava ligar ao router.
    // layoutTransition tem de estar sincronizada com pageTransition: sem
    // isto, uma navegação que também troca de layout (ex. dashboard
    // `layout: 'default'` → `login.vue` `layout: false`) pode renderizar a
    // página nova por instantes dentro do layout antigo, em vez de
    // substituir a página inteira — reproduzido em teste real (login a
    // aparecer "no meio" do dashboard antigo).
    // `mode: 'out-in'` é necessário: sem ele, a página que sai e a que
    // entra ficam as duas no DOM ao mesmo tempo (Vue não remove a antiga só
    // porque tem opacity/transform a animar) — testado e confirmado que
    // isso bloqueia cliques nos itens de menu e pode esconder conteúdo de
    // páginas novas por trás da antiga. Correto vale mais do que ligeiramente
    // mais rápido.
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'page', mode: 'out-in' },
  },
})
