import { ref, computed } from 'vue'
import { useLocaleFormat } from '../../composables/useLocaleFormat'

// Fase 8, ponto 6 — os composables de UI (useFormatters, useMLPrediction,
// useLocaleFormat, a store de subscrição) contam com auto-imports do Nuxt
// (`ref`, `computed`, `useI18n`) que só existem dentro do build do Nuxt.
// Testá-los a sério (não uma reimplementação da lógica) sem arrancar um
// servidor Nuxt inteiro só para isto (esse custo já está pago pelos testes
// de integração, ver tests/integration/) exige estes stubs mínimos em
// globalThis — o mesmo padrão que o Nuxt usa internamente via unplugin-auto-import.
;(globalThis as any).ref = ref
;(globalThis as any).computed = computed

;(globalThis as any).useI18n = () => ({
  locale: ref('pt-PT'),
  // Devolve a própria chave (nunca o texto traduzido) — os testes que usam
  // isto verificam a LÓGICA que escolhe a chave (limiares, tendências), não
  // o texto final, que já é responsabilidade dos ficheiros de tradução da
  // Fase 7.
  t: (key: string) => key,
})

// Real composable (not a fake) — só precisa que useI18n()/computed() já
// estejam em globalThis (linhas acima) para funcionar como no Nuxt real.
;(globalThis as any).useLocaleFormat = useLocaleFormat
