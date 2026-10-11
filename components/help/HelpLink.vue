<template>
  <NuxtLink
    :to="target"
    class="inline-flex items-center justify-center w-6 h-6 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
    :aria-label="t('help.learnMore')"
    :title="t('help.learnMore')"
    :data-testid="`help-link-${topic}`"
  >
    <CircleHelp class="w-4 h-4" aria-hidden="true" />
  </NuxtLink>
</template>

<script setup lang="ts">
import { CircleHelp } from 'lucide-vue-next'
import type { HelpTopic } from '~/utils/helpContent'

// Upgrade 08 — ícone "?" que abre a resposta certa da ajuda. Com sessão vai
// para "Ajuda e opinião" (fica dentro da app); sem sessão, para /help.
const props = defineProps<{ topic: HelpTopic }>()
const { t } = useI18n()
const auth = useAuthStore()
const target = computed(() => `${auth.isAuthenticated ? '/feedback' : '/help'}#${props.topic}`)
</script>
