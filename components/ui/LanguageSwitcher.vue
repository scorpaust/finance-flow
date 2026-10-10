<template>
  <label class="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white bg-surface-700/60 border border-white/10 rounded-xl px-2.5 py-1.5">
    <Languages class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
    <span class="sr-only">{{ t('settings.language.label') }}</span>
    <select
      :value="locale"
      :disabled="!mounted"
      data-testid="language-switcher"
      class="bg-transparent outline-none cursor-pointer text-xs pr-1"
      @change="onChange"
    >
      <option v-for="l in available" :key="l.code" :value="l.code" class="bg-surface-800 text-white">{{ l.name }}</option>
    </select>
  </label>
</template>

<script setup lang="ts">
import { Languages } from 'lucide-vue-next'

// Upgrade 06 — seletor de língua compacto para o ecrã de entrada e as
// páginas públicas (antes só existia nas Definições, com sessão iniciada).
// Os nomes das línguas aparecem sempre na própria língua ("Español",
// "Deutsch"), para quem não percebe a língua atual encontrar a sua.
const { t } = useI18n()
const { locale, available, chooseLocale } = useAppLocale()
// O login aparece antes da hidratação (Upgrade 03): uma escolha feita nesse
// intervalo perdia-se. Desativado até o Vue assumir, como o formulário.
const mounted = ref(false)
onMounted(() => { mounted.value = true })

function onChange(e: Event) {
  chooseLocale((e.target as HTMLSelectElement).value)
}
</script>
