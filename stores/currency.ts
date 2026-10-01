import { defineStore } from 'pinia'

// Fase 10 — moeda de apresentação. Todos os valores vêm da API em euros; esta
// store guarda a moeda escolhida (na conta, por isso igual na web e no
// Android) e o câmbio do dia, e `useFormatters` converte ao mostrar.
// `currency`/`rate` são o que se aplica — podem ficar em euros, com `stale`,
// se o câmbio estiver indisponível, mesmo com `selected` noutra moeda.
interface CurrencyPayload {
  selected: string
  currency: string
  rate: number
  day: string | null
  stale: boolean
  currencies: string[]
}

export const useCurrencyStore = defineStore('currency', () => {
  const selected = ref('EUR')
  const currency = ref('EUR')
  const rate = ref(1)
  const day = ref<string | null>(null)
  const stale = ref(false)
  const currencies = ref<string[]>(['EUR'])
  const loaded = ref(false)

  function apply(data: CurrencyPayload) {
    selected.value = data.selected
    currency.value = data.currency
    rate.value = data.rate > 0 ? data.rate : 1
    day.value = data.day
    stale.value = data.stale
    currencies.value = data.currencies?.length ? data.currencies : ['EUR']
    loaded.value = true
  }

  async function load() {
    try {
      apply(await $fetch<CurrencyPayload>('/api/account/currency'))
    } catch {
      // Sem sessão ou sem rede: continua em euros (os valores da API já são euros).
    }
  }

  async function setCurrency(code: string) {
    apply(await $fetch<CurrencyPayload>('/api/account/currency', { method: 'PUT', body: { currency: code } }))
  }

  function reset() {
    selected.value = 'EUR'
    currency.value = 'EUR'
    rate.value = 1
    day.value = null
    stale.value = false
    loaded.value = false
  }

  // Euros (como guardados) → moeda de apresentação, e o inverso para gravar
  // o que o utilizador escreve. Arredonda ao cêntimo da moeda de destino.
  const fromEur = (eur: number) => (eur ?? 0) * rate.value
  const toEur = (value: number) => Math.round(((value ?? 0) / rate.value) * 100) / 100

  return { selected, currency, rate, day, stale, currencies, loaded, load, setCurrency, reset, fromEur, toEur }
})
