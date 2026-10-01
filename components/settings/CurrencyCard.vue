<template>
  <div class="glass-card rounded-3xl p-6">
    <h3 class="font-semibold text-white mb-4 flex items-center gap-2">
      <Coins class="w-4 h-4 text-brand-400" /> {{ t('settings.currency.title') }}
    </h3>
    <p class="text-white/40 text-xs mb-3">{{ t('settings.currency.description') }}</p>

    <label class="form-label" for="currency-search">{{ t('settings.currency.label') }}</label>
    <input
      id="currency-search"
      v-model="search"
      type="search"
      class="form-input w-full sm:w-80 mb-2"
      :placeholder="t('settings.currency.search')"
      data-testid="settings-currency-search"
    />
    <select
      :value="fx.selected"
      :disabled="saving"
      data-testid="settings-currency-select"
      class="form-select w-full sm:w-80"
      @change="change(($event.target as HTMLSelectElement).value)"
    >
      <option v-for="c in options" :key="c.code" :value="c.code">{{ c.code }} — {{ c.name }}</option>
    </select>

    <p class="text-xs mt-3" :class="fx.stale ? 'text-amber-300/80' : 'text-white/40'" data-testid="settings-currency-rate">
      <template v-if="fx.currency === 'EUR' && fx.selected !== 'EUR'">{{ t('settings.currency.unavailable') }}</template>
      <template v-else-if="fx.currency !== 'EUR'">
        {{ t(fx.stale ? 'settings.currency.rateStale' : 'settings.currency.rateToday', { rate: rateText, day: fx.day || '' }) }}
      </template>
    </p>
  </div>
</template>

<script setup lang="ts">
import { Coins } from 'lucide-vue-next'

// Fase 10 — moeda de apresentação (ver stores/currency.ts). A lista vem do
// servidor (as moedas que o fornecedor de câmbio suporta); o nome de cada
// moeda é o do idioma ativo (Intl.DisplayNames), não traduzido à mão.
const { t } = useI18n()
const { intlLocale } = useLocaleFormat()
const fx = useCurrencyStore()
const toast = useToastStore()

const search = ref('')
const saving = ref(false)

const names = computed(() => {
  try {
    return new Intl.DisplayNames([intlLocale.value], { type: 'currency' })
  } catch {
    return null
  }
})

const options = computed(() => {
  const q = search.value.trim().toLowerCase()
  const all = fx.currencies.map((code) => ({ code, name: names.value?.of(code) || code }))
  const filtered = q ? all.filter((c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)) : all
  // A moeda escolhida fica sempre na lista (senão o <select> mostrava outra).
  if (!filtered.some((c) => c.code === fx.selected)) {
    filtered.unshift({ code: fx.selected, name: names.value?.of(fx.selected) || fx.selected })
  }
  return filtered.sort((a, b) => a.name.localeCompare(b.name, intlLocale.value))
})

const rateText = computed(
  () =>
    `1 € = ${new Intl.NumberFormat(intlLocale.value, {
      style: 'currency',
      currency: fx.currency,
      maximumFractionDigits: fx.rate >= 100 ? 2 : 4,
    }).format(fx.rate)}`
)

onMounted(() => {
  if (!fx.loaded) fx.load()
})

async function change(code: string) {
  if (code === fx.selected) return
  saving.value = true
  try {
    await fx.setCurrency(code)
    toast.success(t('settings.currency.toastChanged', { currency: code }))
  } catch (e: any) {
    toast.error(e?.data?.message || t('settings.currency.error'))
  } finally {
    saving.value = false
  }
}
</script>
