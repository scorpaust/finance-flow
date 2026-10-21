<template>
  <main class="min-h-screen auth-bg p-4 sm:p-8">
    <div class="max-w-3xl mx-auto space-y-5">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <NuxtLink :to="auth.isAuthenticated ? '/' : '/login'" class="btn-secondary text-sm py-2 px-4 inline-flex items-center gap-2">
          <ArrowLeft class="w-4 h-4" /> {{ auth.isAuthenticated ? t('common.backToDashboard') : t('passwordReset.backToLogin') }}
        </NuxtLink>
        <LanguageSwitcher />
      </div>
      <div>
        <h1 class="font-display font-bold text-3xl text-white">{{ t('help.title') }}</h1>
        <p class="text-white/50 text-sm mt-1">{{ t('help.subtitle') }}</p>
      </div>
      <HelpCenter />
      <div class="glass-card rounded-3xl p-5 flex items-center justify-between gap-3 flex-wrap">
        <p class="text-white/70 text-sm">{{ t('help.contactCta') }}</p>
        <NuxtLink :to="auth.isAuthenticated ? '/feedback?from=/help' : '/login'" class="btn-primary text-sm" data-testid="help-contact">
          {{ auth.isAuthenticated ? t('settings.help.button') : t('help.signInToWrite') }}
        </NuxtLink>
      </div>
      <p class="text-white/30 text-xs">{{ t('feedback.responseNote', { email: SUPPORT_EMAIL }) }}</p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

// Upgrade 08 — página de ajuda pública (perguntas frequentes nas 6 línguas),
// acessível sem conta (ligação no ecrã de entrada).
definePageMeta({ layout: false })
const { t } = useI18n()
const auth = useAuthStore()
// O contacto publicado nos Termos.
const SUPPORT_EMAIL = 'dinismiguelcosta@gmail.com'
usePublicSeo({ title: () => t('help.title'), description: () => t('help.subtitle'), path: '/help' })
</script>
