<template>
  <LandingPage :slug="slug" />
</template>

<script setup lang="ts">
import { isLandingSlug } from '~/shared/landing'

// Upgrade 12 — /pt, /en, /es, /fr, /de, /it. Outros caminhos de um segmento
// sem página própria dão 404 (as páginas estáticas, como /help, têm sempre
// prioridade sobre esta rota dinâmica).
definePageMeta({
  layout: false,
  validate: (route) => isLandingSlug(route.params.lang),
})

const slug = await useSlugLocale()
</script>
