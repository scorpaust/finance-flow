<template>
  <main class="min-h-screen auth-bg text-white" data-testid="blog">
    <header class="max-w-3xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
      <NuxtLink :to="`/${slug}`" class="flex items-center gap-2 font-display font-bold text-lg">
        <img src="/icons/apple-touch-icon.png" alt="" width="32" height="32" class="rounded-xl" />
        FinanceFlow
      </NuxtLink>
      <nav class="flex items-center gap-2">
        <NuxtLink :to="`/${slug}/blog`" class="text-white/60 hover:text-white text-sm px-2">{{ t('blog.title') }}</NuxtLink>
        <NuxtLink :to="auth.isAuthenticated ? '/' : '/login?mode=register'" class="btn-primary text-sm py-2 px-4">
          {{ auth.isAuthenticated ? t('landing.ctaOpenApp') : t('landing.ctaStart') }}
        </NuxtLink>
      </nav>
    </header>

    <div class="max-w-3xl mx-auto px-4 sm:px-8 pb-14">
      <slot />

      <!-- Chamada para a app no fim de cada página do blog -->
      <section class="glass-card rounded-3xl p-8 text-center mt-14" data-testid="blog-cta">
        <h2 class="font-display font-bold text-2xl">{{ t('blog.ctaTitle') }}</h2>
        <p class="text-white/60 mt-3">{{ t('blog.ctaText') }}</p>
        <div class="flex flex-wrap justify-center gap-3 mt-6">
          <NuxtLink :to="auth.isAuthenticated ? '/' : '/login?mode=register'" class="btn-primary px-6">
            {{ auth.isAuthenticated ? t('landing.ctaOpenApp') : t('landing.ctaStart') }}
          </NuxtLink>
          <a :href="playStoreUrl(LANDING_SLUGS[slug])" class="btn-secondary px-6 inline-flex items-center gap-2" rel="noopener" target="_blank">
            <Smartphone class="w-4 h-4" /> {{ t('landing.ctaPlay') }}
          </a>
        </div>
      </section>
    </div>

    <footer class="max-w-3xl mx-auto px-4 sm:px-8 py-10 border-t border-white/10 text-sm text-white/50 flex flex-col gap-6">
      <div class="flex flex-wrap gap-4">
        <NuxtLink :to="`/${slug}`" class="hover:text-white">FinanceFlow</NuxtLink>
        <NuxtLink to="/help" class="hover:text-white">{{ t('help.title') }}</NuxtLink>
        <NuxtLink to="/privacy" class="hover:text-white">{{ t('legal.privacy') }}</NuxtLink>
        <NuxtLink to="/terms" class="hover:text-white">{{ t('legal.terms') }}</NuxtLink>
        <span>© {{ year }} FinanceFlow</span>
      </div>
      <!-- A mesma página nas outras línguas -->
      <nav v-if="languages.length > 1" :aria-label="t('landing.footerLanguages')" class="flex flex-wrap gap-3" data-testid="blog-languages">
        <NuxtLink
          v-for="l in languages"
          :key="l.lang"
          :to="l.path"
          :hreflang="HREFLANG[l.lang]"
          class="hover:text-white"
          :class="l.lang === slug ? 'text-white font-semibold' : ''"
        >
          {{ languageName(l.lang) }}
        </NuxtLink>
      </nav>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { Smartphone } from 'lucide-vue-next'
import { HREFLANG, LANDING_SLUGS, playStoreUrl, type LandingSlug } from '~/shared/landing'

// Upgrade 13 — moldura das páginas do blog: topo, chamada para a app e rodapé
// (com a mesma página nas outras línguas).
withDefaults(defineProps<{ slug: LandingSlug; languages?: { lang: LandingSlug; path: string }[] }>(), { languages: () => [] })
const { t, locales } = useI18n()
// Nome de cada língua na própria língua (os mesmos do seletor, nuxt.config.ts).
const languageName = (lang: LandingSlug) =>
  (locales.value as { code: string; name: string }[]).find((l) => l.code === LANDING_SLUGS[lang])?.name || lang
const auth = useAuthStore()
const year = new Date().getFullYear()
</script>
