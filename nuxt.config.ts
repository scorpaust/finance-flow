export default defineNuxtConfig({
  devtools: { enabled: true },

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  modules: [
    '@nuxtjs/tailwindcss',
    ['@pinia/nuxt', { storesDirs: ['./stores/**'] }],
    '@vueuse/nuxt',
    '@vite-pwa/nuxt',
    '@nuxt/image',
    '@nuxtjs/color-mode',
  ],

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
          handler: 'CacheFirst',
          options: { cacheName: 'google-fonts-cache' },
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
    // Fase 2 — Subscrições (EasyPay: CC/DD, MB WAY, Multibanco). Ver context/CONFIG-REFERENCE.md.
    easypayEnv: process.env.EASYPAY_ENV || 'test',
    easypayAccountId: process.env.EASYPAY_ACCOUNT_ID || '',
    easypayApiKey: process.env.EASYPAY_API_KEY || '',
    subscriptionRenewalReminderDays: process.env.SUBSCRIPTION_RENEWAL_REMINDER_DAYS || '5',
    cronSecret: process.env.CRON_SECRET || '',
    // Fase 3 — Insights com IA (Anthropic + Twelve Data). Nunca em `public`: a
    // chave nunca pode chegar ao client. Ver context/features/03-FASE-3-insights-ia.md.
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    twelveDataApiKey: process.env.TWELVE_DATA_API_KEY || '',
    public: {
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

  nitro: {
    plugins: ['~/server/plugins/mongoose.ts'],
  },

  // TF.js is browser-only — pre-bundle for fast dynamic import, exclude from SSR
  vite: {
    optimizeDeps: {
      include: ['@tensorflow/tfjs'],
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
  },

  app: {
    head: {
      title: 'FinanceFlow',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap',
        },
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
