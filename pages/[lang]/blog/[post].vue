<template>
  <BlogShell :slug="slug" :languages="languages">
    <article v-if="post" data-testid="blog-article">
      <NuxtLink :to="`/${slug}/blog`" class="text-brand-300 hover:text-white text-sm">← {{ t('blog.allPosts') }}</NuxtLink>
      <h1 class="font-display font-bold text-3xl sm:text-4xl leading-tight mt-6">{{ post.title }}</h1>
      <p class="text-white/40 text-sm mt-4">
        <time :datetime="post.published">{{ formatDate(post.published) }}</time> · {{ t('blog.readingTime', { n: readingMinutes(post) }) }}
      </p>

      <div class="mt-8 space-y-5 text-white/80 leading-relaxed">
        <template v-for="(block, i) in post.blocks" :key="i">
          <h2 v-if="block.type === 'h2'" class="font-display font-bold text-2xl text-white pt-6">{{ block.text }}</h2>
          <p v-else-if="block.type === 'p'">{{ block.text }}</p>
          <ul v-else-if="block.type === 'ul'" class="list-disc pl-6 space-y-2">
            <li v-for="item in block.items" :key="item">{{ item }}</li>
          </ul>
          <ol v-else-if="block.type === 'ol'" class="list-decimal pl-6 space-y-2">
            <li v-for="item in block.items" :key="item">{{ item }}</li>
          </ol>
          <p v-else-if="block.type === 'tip'" class="glass-card rounded-2xl p-5 border-l-4 border-brand-500 text-white/90">{{ block.text }}</p>
        </template>
      </div>
    </article>
  </BlogShell>
</template>

<script setup lang="ts">
import { blogPostPath, findBlogPost, readingMinutes, translationsOf } from '~/shared/blog'
import { HREFLANG, LANDING_SLUGS, OG_LOCALE, SITE_URL, isLandingSlug } from '~/shared/landing'

// Upgrade 13 — um artigo do blog (/pt/blog/<slug>). Conteúdo em shared/blog/.
definePageMeta({
  layout: false,
  validate: (route) => isLandingSlug(route.params.lang) && !!findBlogPost(route.params.lang, String(route.params.post)),
})

const slug = await useSlugLocale()
const route = useRoute()
const { t } = useI18n()
const post = computed(() => findBlogPost(slug.value, String(route.params.post)))
// O mesmo artigo nas outras línguas (rodapé e hreflang).
const languages = computed(() => (post.value ? translationsOf(post.value) : []).map((p) => ({ lang: p.lang, path: blogPostPath(p) })))
const formatDate = (d: string) => new Intl.DateTimeFormat(LANDING_SLUGS[slug.value], { dateStyle: 'long' }).format(new Date(`${d}T12:00:00Z`))

const url = computed(() => (post.value ? `${SITE_URL}${blogPostPath(post.value)}` : ''))
const image = computed(() => `${SITE_URL}/og/og-${slug.value}.png`)
useSeoMeta({
  title: () => `${post.value?.title} · FinanceFlow`,
  description: () => post.value?.description,
  ogType: 'article',
  ogTitle: () => post.value?.title,
  ogDescription: () => post.value?.description,
  ogUrl: () => url.value,
  ogLocale: () => OG_LOCALE[slug.value],
  ogImage: () => image.value,
  twitterTitle: () => post.value?.title,
  twitterDescription: () => post.value?.description,
  twitterImage: () => image.value,
  robots: 'index, follow',
})
useHead(() => ({
  link: [
    { rel: 'canonical', href: url.value },
    ...languages.value.map((l) => ({ rel: 'alternate', hreflang: HREFLANG[l.lang], href: `${SITE_URL}${l.path}` })),
    ...languages.value.filter((l) => l.lang === 'en').map((l) => ({ rel: 'alternate', hreflang: 'x-default', href: `${SITE_URL}${l.path}` })),
  ],
  script: post.value
    ? [{
        type: 'application/ld+json',
        key: 'ld-article',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.value.title,
          description: post.value.description,
          inLanguage: HREFLANG[slug.value],
          datePublished: post.value.published,
          dateModified: post.value.updated || post.value.published,
          mainEntityOfPage: url.value,
          image: image.value,
          author: { '@type': 'Organization', name: 'FinanceFlow', url: SITE_URL },
          publisher: { '@type': 'Organization', name: 'FinanceFlow', logo: { '@type': 'ImageObject', url: `${SITE_URL}/icons/apple-touch-icon.png` } },
        }),
      }]
    : [],
}))
</script>
