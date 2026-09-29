<template>
  <div class="min-h-screen auth-bg p-4 sm:p-8">
    <article class="max-w-3xl mx-auto glass-card rounded-4xl p-6 sm:p-10 space-y-6">
      <NuxtLink to="/login" class="btn-secondary text-sm py-2 px-4 inline-flex items-center gap-2">
        <ArrowLeft class="w-4 h-4" /> {{ t('legal.back') }}
      </NuxtLink>

      <div
        v-if="LEGAL_IS_DRAFT"
        class="bg-amber-500/[0.12] border border-amber-500/30 rounded-2xl px-4 py-3 text-amber-300 text-sm"
      >
        {{ t('legal.draftNotice') }}
      </div>
      <p v-if="!hasOwnLanguage" class="text-white/40 text-xs">{{ t('legal.englishOnly') }}</p>

      <h1 class="font-display font-bold text-3xl text-white">{{ content.title }}</h1>

      <section v-for="s in content.sections" :key="s.h" class="space-y-2">
        <h2 class="font-semibold text-white text-lg">{{ s.h }}</h2>
        <p v-for="(para, i) in s.p" :key="i" class="text-white/60 text-sm leading-relaxed">{{ para }}</p>
      </section>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { LEGAL_CONTENT, LEGAL_IS_DRAFT, type LegalDocKey } from '~/utils/legalContent'

const props = defineProps<{ doc: LegalDocKey }>()
const { t, locale } = useI18n()

// Só PT-PT e EN estão escritos; qualquer outro idioma cai em EN (com nota).
const hasOwnLanguage = computed(() => locale.value === 'pt-PT' || locale.value === 'en')
const content = computed(() => LEGAL_CONTENT[props.doc][locale.value === 'pt-PT' ? 'pt-PT' : 'en'])

useHead({ title: computed(() => content.value.title) })
</script>
