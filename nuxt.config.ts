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
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },

  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/financeflow',
    public: {
      appUrl: process.env.APP_URL || 'http://localhost:3000',
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
      ],
      meta: [
        { name: 'viewport',                        content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color',                     content: '#0f0f23' },
        { name: 'apple-mobile-web-app-capable',    content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
    },
  },
})
