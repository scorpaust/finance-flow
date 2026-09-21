import type { AssetClass, InvestmentDto, PortfolioSummary } from '~/shared/portfolio'

// Registo de investimentos (Fase 6) — fachada fina sobre /api/investments. Os
// derivados (invested/gain/returnPct) e o resumo vêm sempre do servidor, que usa
// o mesmo cálculo de shared/portfolio.ts — nunca reimplementar a fórmula aqui.
//
// O estado (items/summary) é local a cada chamada: quem o mostra (a página) chama
// fetchAll() depois de cada escrita. Os modais só usam create/update, que não
// mexem no estado — por isso emitem 'saved' e é a página que recarrega.

export interface InvestmentPayload {
  name: string
  assetClass: AssetClass | null
  initialAmount: number
  initialDate: string // YYYY-MM-DD
  reinforcement: number
  currentValue: number
}

export function useInvestments() {
  const items = ref<InvestmentDto[]>([])
  const summary = ref<PortfolioSummary | null>(null)
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      const data = await $fetch<{ items: InvestmentDto[]; summary: PortfolioSummary }>('/api/investments')
      items.value = data.items
      summary.value = data.summary
    } finally {
      loading.value = false
    }
  }

  async function create(payload: InvestmentPayload) {
    await $fetch('/api/investments', { method: 'POST', body: payload })
  }

  // PUT parcial: só os campos enviados são validados/alterados. Serve a edição
  // completa e as ações rápidas ("Reforçar", "Atualizar situação").
  async function update(id: string, changes: Partial<InvestmentPayload>) {
    await $fetch(`/api/investments/${id}`, { method: 'PUT', body: changes })
  }

  async function remove(id: string) {
    await $fetch(`/api/investments/${id}`, { method: 'DELETE' })
  }

  return { items, summary, loading, fetchAll, create, update, remove }
}
