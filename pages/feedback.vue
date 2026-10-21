<template>
  <div class="space-y-5 animate-fade-in max-w-3xl">
    <div>
      <h2 class="font-display font-bold text-2xl text-white flex items-center gap-2">
        <LifeBuoy class="w-6 h-6 text-brand-400" /> {{ t('feedback.title') }}
      </h2>
      <p class="text-white/40 text-sm mt-1">{{ t('feedback.subtitle') }}</p>
    </div>
    <!-- Upgrade 08 — perguntas frequentes antes do formulário -->
    <HelpCenter />
    <div class="glass-card rounded-3xl p-6">
      <h3 class="font-semibold text-white mb-4">{{ t('help.contactCta') }}</h3>
      <FeedbackForm :from-page="fromPage" />
    </div>
    <p class="text-white/30 text-xs">{{ t('feedback.responseNote', { email: SUPPORT_EMAIL }) }}</p>
  </div>
</template>

<script setup lang="ts">
import { LifeBuoy } from 'lucide-vue-next'

// Upgrade 09 — "Ajuda e opinião" (com sessão). `?from=` diz de que página veio.
definePageMeta({ layout: 'default' })
const { t } = useI18n()
const route = useRoute()
const fromPage = computed(() => (typeof route.query.from === 'string' ? route.query.from : undefined))
// O contacto publicado nos Termos (o mesmo de server/utils/emailTemplates.ts).
const SUPPORT_EMAIL = 'dinismiguelcosta@gmail.com'
useHead({ title: computed(() => t('feedback.title')), meta: [{ name: 'robots', content: 'noindex' }] })
</script>
