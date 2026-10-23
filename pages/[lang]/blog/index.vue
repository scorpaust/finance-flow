<template>
  <BlogShell :slug="slug">
    <h1 class="font-display font-bold text-4xl mt-6">{{ t('blog.title') }}</h1>
    <p class="text-white/60 mt-3">{{ t('blog.subtitle') }}</p>
    <div class="mt-10 space-y-4">
      <NuxtLink
        v-for="post in posts"
        :key="post.slug"
        :to="`/${slug}/blog/${post.slug}`"
        class="glass-card rounded-3xl p-6 block hover:border-brand-500/40 border border-transparent transition-colors"
        data-testid="blog-post-link"
      >
        <p class="text-white/40 text-xs">{{ formatDate(post.published) }} · {{ t('blog.readingTime', { n: readingMinutes(post) }) }}</p>
        <h2 class="font-semibold text-xl mt-2">{{ post.title }}</h2>
        <p class="text-white/60 text-sm mt-2 leading-relaxed">{{ post.description }}</p>
      </NuxtLink>
    </div>
  </BlogShell>
</template>

<script setup lang="ts">
import { blogPostsFor, readingMinutes } from '~/shared/blog'
import { LANDING_SLUGS, OG_LOCALE, SITE_URL, isLandingSlug } from '~/shared/landing'

// Upgrade 13 — lista dos artigos de uma língua (/pt/blog). Uma língua sem
// artigos não tem blog (404).
definePageMeta({
  layout: false,
  validate: (route) => isLandingSlug(route.params.lang) && blogPostsFor(route.params.lang).length > 0,
})

const slug = await useSlugLocale()
const { t } = useI18n()
const posts = computed(() => blogPostsFor(slug.value))
const formatDate = (d: string) => new Intl.DateTimeFormat(LANDING_SLUGS[slug.value], { dateStyle: 'long' }).format(new Date(`${d}T12:00:00Z`))

const url = computed(() => `${SITE_URL}/${slug.value}/blog`)
const title = () => `${t('blog.title')} · FinanceFlow`
useSeoMeta({
  title,
  description: () => t('blog.subtitle'),
  ogTitle: title,
  ogDescription: () => t('blog.subtitle'),
  ogUrl: () => url.value,
  ogLocale: () => OG_LOCALE[slug.value],
  ogImage: () => `${SITE_URL}/og/og-${slug.value}.png`,
  robots: 'index, follow',
})
useHead(() => ({
  link: [{ rel: 'canonical', href: url.value }],
}))
</script>
