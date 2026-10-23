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

    <footer class="max-w-3xl mx-auto px-4 sm:px-8 py-10 border-t border-white/10 text-sm text-white/50 flex flex-wrap gap-4">
      <NuxtLink :to="`/${slug}`" class="hover:text-white">FinanceFlow</NuxtLink>
      <NuxtLink to="/help" class="hover:text-white">{{ t('help.title') }}</NuxtLink>
      <NuxtLink to="/privacy" class="hover:text-white">{{ t('legal.privacy') }}</NuxtLink>
      <NuxtLink to="/terms" class="hover:text-white">{{ t('legal.terms') }}</NuxtLink>
      <span>© {{ year }} FinanceFlow</span>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { Smartphone } from 'lucide-vue-next'
import { LANDING_SLUGS, playStoreUrl, type LandingSlug } from '~/shared/landing'

// Upgrade 13 — moldura das páginas do blog: topo, chamada para a app e rodapé.
defineProps<{ slug: LandingSlug }>()
const { t } = useI18n()
const auth = useAuthStore()
const year = new Date().getFullYear()
</script>
