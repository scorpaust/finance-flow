<template>
  <div class="space-y-4" data-testid="help-center">
    <div class="relative">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" aria-hidden="true" />
      <input
        v-model="query"
        type="search"
        class="form-input pl-9"
        :placeholder="t('help.searchPlaceholder')"
        :aria-label="t('help.searchPlaceholder')"
        data-testid="help-search"
      />
    </div>

    <p v-if="!filtered.length" class="text-white/50 text-sm" data-testid="help-no-results">{{ t('help.noResults') }}</p>

    <section v-for="section in filtered" :key="section.id" class="glass-card rounded-3xl p-5">
      <h3 class="font-semibold text-white mb-3">{{ section.title }}</h3>
      <div class="space-y-2">
        <details
          v-for="item in section.items"
          :id="item.id"
          :key="item.id"
          :open="query.trim().length > 0 || openId === item.id"
          class="bg-surface-700/30 rounded-2xl px-4 py-3 group scroll-mt-24"
          data-testid="help-item"
        >
          <summary class="cursor-pointer text-white/80 text-sm font-medium list-none flex items-center justify-between gap-3">
            {{ item.q }}
            <ChevronDown class="w-4 h-4 shrink-0 text-white/40 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <p class="text-white/60 text-sm leading-relaxed mt-2">{{ item.a }}</p>
        </details>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown, Search } from 'lucide-vue-next'
import { HELP_CONTENT } from '~/utils/helpContent'
import { isSupportedLocale } from '~/shared/locale'

// Upgrade 08 — perguntas frequentes com pesquisa, na língua da app. Usado na
// página pública /help e em "Ajuda e opinião" (/feedback). Uma ligação com
// `#<id>` (HelpLink) abre e mostra essa pergunta.
const { t, locale } = useI18n()
const route = useRoute()
const query = ref('')
const openId = ref<string | null>(null)

const sections = computed(() => HELP_CONTENT[isSupportedLocale(locale.value) ? locale.value : 'en'])

function normalize(v: string) {
  return v.toLocaleLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

const filtered = computed(() => {
  const q = normalize(query.value.trim())
  if (!q) return sections.value
  return sections.value
    .map((s) => ({ ...s, items: s.items.filter((i) => normalize(`${i.q} ${i.a}`).includes(q)) }))
    .filter((s) => s.items.length)
})

onMounted(async () => {
  const id = route.hash?.slice(1)
  if (!id) return
  openId.value = id
  await nextTick()
  document.getElementById(id)?.scrollIntoView({ block: 'start' })
})
</script>
