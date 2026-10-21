<template>
  <main class="min-h-screen auth-bg text-white" data-testid="landing">
    <!-- Topo -->
    <header class="max-w-6xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
      <NuxtLink :to="`/${slug}`" class="flex items-center gap-2 font-display font-bold text-lg">
        <img src="/icons/apple-touch-icon.png" alt="" width="32" height="32" class="rounded-xl" />
        FinanceFlow
      </NuxtLink>
      <nav class="flex items-center gap-2">
        <NuxtLink v-if="!auth.isAuthenticated" to="/login" class="btn-secondary text-sm py-2 px-4" data-testid="landing-signin">{{ t('landing.signIn') }}</NuxtLink>
        <NuxtLink v-else to="/" class="btn-primary text-sm py-2 px-4">{{ t('landing.ctaOpenApp') }}</NuxtLink>
      </nav>
    </header>

    <!-- Destaque -->
    <section class="max-w-6xl mx-auto px-4 sm:px-8 pt-6 pb-14 grid lg:grid-cols-2 gap-10 items-center">
      <div>
        <h1 class="font-display font-bold text-4xl sm:text-5xl leading-tight" data-testid="landing-title">{{ t('landing.heroTitle') }}</h1>
        <p class="text-white/70 text-lg mt-5">{{ t('landing.heroSubtitle') }}</p>
        <div class="flex flex-wrap gap-3 mt-8">
          <NuxtLink :to="auth.isAuthenticated ? '/' : '/login?mode=register'" class="btn-primary px-6" data-testid="landing-cta">
            {{ auth.isAuthenticated ? t('landing.ctaOpenApp') : t('landing.ctaStart') }}
          </NuxtLink>
          <a :href="playUrl" class="btn-secondary px-6 inline-flex items-center gap-2" rel="noopener" target="_blank" data-testid="landing-play">
            <Smartphone class="w-4 h-4" /> {{ t('landing.ctaPlay') }}
          </a>
        </div>
        <p class="text-white/40 text-sm mt-4">{{ t('landing.heroNote') }}</p>
      </div>
      <div class="flex justify-center gap-4">
        <img
          :src="`/landing/${slug}/phone-1-painel.webp`"
          :alt="t('landing.screens.dashboard')"
          width="360"
          height="780"
          fetchpriority="high"
          class="w-44 sm:w-56 h-auto rounded-3xl shadow-2xl border border-white/10"
        />
        <img
          :src="`/landing/${slug}/phone-3-estatisticas.webp`"
          :alt="t('landing.screens.stats')"
          width="360"
          height="780"
          class="hidden sm:block w-56 h-auto rounded-3xl shadow-2xl border border-white/10 mt-12"
        />
      </div>
    </section>

    <!-- Funcionalidades -->
    <section class="max-w-6xl mx-auto px-4 sm:px-8 py-14">
      <h2 class="font-display font-bold text-3xl text-center">{{ t('landing.featuresTitle') }}</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        <article v-for="f in FEATURES" :key="f.id" class="glass-card rounded-3xl p-6">
          <component :is="f.icon" class="w-6 h-6 text-brand-300" aria-hidden="true" />
          <h3 class="font-semibold text-lg mt-4">{{ t(`landing.features.${f.id}.title`) }}</h3>
          <p class="text-white/60 text-sm mt-2 leading-relaxed">{{ t(`landing.features.${f.id}.text`) }}</p>
        </article>
      </div>
    </section>

    <!-- Capturas -->
    <section class="max-w-6xl mx-auto px-4 sm:px-8 py-14">
      <h2 class="font-display font-bold text-3xl text-center">{{ t('landing.screensTitle') }}</h2>
      <div class="flex gap-4 overflow-x-auto pb-4 mt-10 sm:justify-center snap-x">
        <figure v-for="s in SCREENS" :key="s.file" class="shrink-0 snap-center text-center">
          <img
            :src="`/landing/${slug}/${s.file}.webp`"
            :alt="t(`landing.screens.${s.id}`)"
            width="360"
            height="780"
            loading="lazy"
            class="w-48 h-auto rounded-3xl border border-white/10"
          />
          <figcaption class="text-white/50 text-xs mt-3">{{ t(`landing.screens.${s.id}`) }}</figcaption>
        </figure>
      </div>
    </section>

    <!-- Planos -->
    <section class="max-w-6xl mx-auto px-4 sm:px-8 py-14" data-testid="landing-plans">
      <h2 class="font-display font-bold text-3xl text-center">{{ t('landing.plansTitle') }}</h2>
      <p class="text-white/60 text-center mt-3">{{ t('landing.plansSubtitle') }}</p>
      <div class="grid md:grid-cols-3 gap-4 mt-10">
        <article
          v-for="tier in TIERS"
          :key="tier"
          class="glass-card rounded-3xl p-6 flex flex-col"
          :class="tier === 'pro' ? 'border border-brand-500/40' : ''"
        >
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-xl">{{ tier === 'free' ? t('landing.free') : t(`tiers.${tier}`) }}</h3>
            <span v-if="tier === 'pro'" class="text-[10px] px-2 py-0.5 rounded-full bg-brand-600/30 text-brand-300 font-semibold">{{ t('landing.popular') }}</span>
          </div>
          <p class="mt-4">
            <span class="font-display font-bold text-3xl" :data-testid="`landing-price-${tier}`">{{ formatEur(tier === 'free' ? 0 : monthly(tier)) }}</span>
            <span class="text-white/50 text-sm">{{ t('landing.perMonth') }}</span>
          </p>
          <ul class="mt-5 space-y-2 text-sm text-white/70 flex-1">
            <li v-for="h in PLAN_HIGHLIGHTS[tier]" :key="h.id" class="flex gap-2">
              <Check class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" /> {{ t(`planHighlights.${h.id}`, h.params || {}) }}
            </li>
          </ul>
          <NuxtLink :to="auth.isAuthenticated ? `/subscription?tier=${tier}` : '/login?mode=register'" class="mt-6 text-center" :class="tier === 'pro' ? 'btn-primary' : 'btn-secondary'">
            {{ tier === 'free' ? t('landing.ctaStart') : t('landing.planCta') }}
          </NuxtLink>
        </article>
      </div>
    </section>

    <!-- Perguntas frequentes -->
    <section class="max-w-3xl mx-auto px-4 sm:px-8 py-14">
      <h2 class="font-display font-bold text-3xl text-center">{{ t('landing.faqTitle') }}</h2>
      <div class="mt-8 space-y-3">
        <details v-for="item in faq" :key="item.id" class="glass-card rounded-2xl p-5 group">
          <summary class="font-semibold cursor-pointer list-none flex justify-between gap-3">
            {{ item.q }}
            <ChevronDown class="w-5 h-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <p class="text-white/70 text-sm mt-3 leading-relaxed">{{ item.a }}</p>
        </details>
      </div>
      <p class="text-center mt-6">
        <NuxtLink to="/help" class="text-brand-300 hover:text-white text-sm">{{ t('landing.faqMore') }} →</NuxtLink>
      </p>
    </section>

    <!-- Chamada final -->
    <section class="max-w-6xl mx-auto px-4 sm:px-8 py-14">
      <div class="glass-card rounded-4xl p-10 text-center">
        <h2 class="font-display font-bold text-3xl">{{ t('landing.finalTitle') }}</h2>
        <p class="text-white/60 mt-3">{{ t('landing.finalText') }}</p>
        <div class="flex flex-wrap justify-center gap-3 mt-8">
          <NuxtLink :to="auth.isAuthenticated ? '/' : '/login?mode=register'" class="btn-primary px-6">
            {{ auth.isAuthenticated ? t('landing.ctaOpenApp') : t('landing.ctaStart') }}
          </NuxtLink>
          <a :href="playUrl" class="btn-secondary px-6 inline-flex items-center gap-2" rel="noopener" target="_blank">
            <Smartphone class="w-4 h-4" /> {{ t('landing.ctaPlay') }}
          </a>
        </div>
      </div>
    </section>

    <!-- Rodapé -->
    <footer class="max-w-6xl mx-auto px-4 sm:px-8 py-10 border-t border-white/10 text-sm text-white/50 flex flex-col sm:flex-row gap-6 justify-between">
      <div class="flex flex-wrap gap-4">
        <NuxtLink to="/help" class="hover:text-white">{{ t('help.title') }}</NuxtLink>
        <NuxtLink to="/privacy" class="hover:text-white">{{ t('legal.privacy') }}</NuxtLink>
        <NuxtLink to="/terms" class="hover:text-white">{{ t('legal.terms') }}</NuxtLink>
        <a href="https://www.livroreclamacoes.pt/Inicio/" target="_blank" rel="noopener" class="hover:text-white">{{ t('legal.complaintsBook') }}</a>
        <span>© {{ year }} FinanceFlow</span>
      </div>
      <nav :aria-label="t('landing.footerLanguages')" class="flex flex-wrap gap-3" data-testid="landing-languages">
        <NuxtLink
          v-for="(code, s) in LANDING_SLUGS"
          :key="s"
          :to="`/${s}`"
          :hreflang="HREFLANG[s]"
          class="hover:text-white"
          :class="s === slug ? 'text-white font-semibold' : ''"
        >
          {{ LANGUAGE_NAMES[s] }}
        </NuxtLink>
      </nav>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { BarChart3, Brain, Check, ChevronDown, PiggyBank, Receipt, ShieldCheck, Smartphone, TrendingUp } from 'lucide-vue-next'
import { PLAN_HIGHLIGHTS } from '~/shared/features'
import { HREFLANG, LANDING_FAQ_IDS, LANDING_SLUGS, OG_LOCALE, SITE_URL, playStoreUrl, type LandingSlug } from '~/shared/landing'
import { HELP_CONTENT } from '~/utils/helpContent'

// Upgrade 12 — página de apresentação de uma língua (/pt, /en, …). Conteúdo
// em i18n (`landing.*`), planos e preços reais (os mesmos da subscrição) e
// perguntas da ajuda. Metadados para pesquisa (título, descrição, endereço
// canónico, hreflang entre as 6 línguas, dados estruturados) e para partilha.
const props = defineProps<{ slug: LandingSlug }>()
const { t, locales } = useI18n()
const auth = useAuthStore()

const locale = computed(() => LANDING_SLUGS[props.slug])
const playUrl = computed(() => playStoreUrl(locale.value))
const year = new Date().getFullYear()
const TIERS = ['free', 'pro', 'premium'] as const

// Nomes de cada língua na própria língua (os mesmos do seletor, nuxt.config.ts).
const LANGUAGE_NAMES = computed(() =>
  Object.fromEntries(
    Object.entries(LANDING_SLUGS).map(([s, code]) => [s, (locales.value as { code: string; name: string }[]).find((l) => l.code === code)?.name || s])
  ) as Record<LandingSlug, string>
)

const FEATURES = [
  { id: 'track', icon: Receipt },
  { id: 'budgets', icon: PiggyBank },
  { id: 'ai', icon: Brain },
  { id: 'forecasts', icon: TrendingUp },
  { id: 'invest', icon: BarChart3 },
  { id: 'security', icon: ShieldCheck },
]
const SCREENS = [
  { id: 'dashboard', file: 'phone-1-painel' },
  { id: 'transactions', file: 'phone-2-transacoes' },
  { id: 'stats', file: 'phone-3-estatisticas' },
  { id: 'investments', file: 'phone-4-investimentos' },
]

// Preços reais (Play Console, Portugal, IVA incluído) — no HTML do servidor,
// para o Google os ver.
const { data: priceData } = await useFetch<{ prices: Record<'pro' | 'premium', { monthly: number }> }>('/api/billing/prices', { key: 'landing-prices' })
const monthly = (tier: 'pro' | 'premium') => priceData.value?.prices[tier].monthly ?? 0
const formatEur = (value: number) => new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'EUR' }).format(value)

const faq = computed(() =>
  HELP_CONTENT[locale.value].flatMap((s) => s.items).filter((i) => (LANDING_FAQ_IDS as readonly string[]).includes(i.id))
)

// ── Metadados ────────────────────────────────────────────────────────────────
const url = computed(() => `${SITE_URL}/${props.slug}`)
useSeoMeta({
  title: () => t('landing.metaTitle'),
  description: () => t('landing.metaDescription'),
  ogTitle: () => t('landing.metaTitle'),
  ogDescription: () => t('landing.metaDescription'),
  ogUrl: () => url.value,
  ogLocale: () => OG_LOCALE[props.slug],
  ogImage: () => `${SITE_URL}/og/og-${props.slug}.png`,
  twitterTitle: () => t('landing.metaTitle'),
  twitterDescription: () => t('landing.metaDescription'),
  twitterImage: () => `${SITE_URL}/og/og-${props.slug}.png`,
  robots: 'index, follow',
})

useHead(() => ({
  link: [
    { rel: 'canonical', href: url.value },
    ...Object.keys(LANDING_SLUGS).map((s) => ({ rel: 'alternate', hreflang: HREFLANG[s as LandingSlug], href: `${SITE_URL}/${s}` })),
    { rel: 'alternate', hreflang: 'x-default', href: `${SITE_URL}/en` },
  ],
  script: [
    {
      type: 'application/ld+json',
      key: 'ld-app',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'FinanceFlow',
        url: url.value,
        description: t('landing.metaDescription'),
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Android, Web',
        inLanguage: locale.value,
        image: `${SITE_URL}/og/og-${props.slug}.png`,
        installUrl: playUrl.value,
        offers: [
          { '@type': 'Offer', name: t('landing.free'), price: '0', priceCurrency: 'EUR' },
          ...(['pro', 'premium'] as const)
            .filter((tier) => monthly(tier) > 0)
            .map((tier) => ({ '@type': 'Offer', name: t(`tiers.${tier}`), price: monthly(tier).toFixed(2), priceCurrency: 'EUR' })),
        ],
      }),
    },
    {
      type: 'application/ld+json',
      key: 'ld-faq',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        inLanguage: locale.value,
        mainEntity: faq.value.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
      }),
    },
  ],
}))
</script>
