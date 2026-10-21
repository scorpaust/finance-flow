<template>
  <LandingPage :slug="slug" />
</template>

<script setup lang="ts">
import { Capacitor } from '@capacitor/core'
import { LANDING_SLUGS, isLandingSlug, type LandingSlug } from '~/shared/landing'

// Upgrade 12 — /pt, /en, /es, /fr, /de, /it. Outros caminhos de um segmento
// sem página própria dão 404 (as páginas estáticas, como /help, têm sempre
// prioridade sobre esta rota dinâmica).
definePageMeta({
  layout: false,
  validate: (route) => isLandingSlug(route.params.lang),
})

const route = useRoute()
const slug = computed(() => route.params.lang as LandingSlug)
const { locale, setLocale } = useI18n()

// A página mostra-se na língua do endereço, sem mexer na preferência gravada
// (cookies de língua): só a língua em memória desta visita.
if (locale.value !== LANDING_SLUGS[slug.value]) await setLocale(LANDING_SLUGS[slug.value])
watch(slug, async (s) => {
  if (locale.value !== LANDING_SLUGS[s]) await setLocale(LANDING_SLUGS[s])
})

// Na app Android a entrada é o login (a página tem o botão da Google Play).
onMounted(() => {
  if (Capacitor.isNativePlatform()) navigateTo('/login', { replace: true })
})
</script>
