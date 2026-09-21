<template>
  <div class="space-y-6 animate-fade-in">
    <div>
      <button class="btn-secondary text-sm py-2 px-4 mb-4 flex items-center gap-2" type="button" @click="navigateTo('/')">
        <ArrowLeft class="w-4 h-4" />
        Voltar ao dashboard
      </button>
      <div class="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 class="font-display font-bold text-2xl text-white flex items-center gap-2">
            <span>📈</span> Investimento
          </h2>
          <p class="text-white/40 text-xs mt-1">O teu portfolio e dicas educativas por perfil de risco</p>
        </div>
        <button
          v-if="state === 'hub'"
          class="btn-primary text-sm flex items-center gap-2"
          type="button"
          @click="openForm(null)"
        >
          <Plus class="w-4 h-4" /> Novo investimento
        </button>
      </div>
    </div>

    <!-- A carregar (subscrição, perfil e investimentos) -->
    <div v-if="state === 'loading'" class="space-y-4">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonBlock v-for="i in 4" :key="i" rounded="3xl" class="h-28" />
      </div>
      <SkeletonBlock rounded="3xl" class="h-48" />
    </div>

    <!-- Sem perfil de investidor: o registo só abre depois de o preencher -->
    <div v-else-if="state === 'needsProfile'" class="glass-card rounded-3xl p-10 text-center">
      <div class="text-4xl mb-3">📝</div>
      <h4 class="font-semibold text-white mb-2">Primeiro, o teu perfil de investidor</h4>
      <p class="text-white/40 text-sm mb-6 max-w-md mx-auto">
        Precisamos de saber a tua tolerância ao risco, horizonte temporal e objetivos para adaptar as dicas.
        Depois disto, podes registar e acompanhar os teus investimentos aqui — o perfil é renovado anualmente.
      </p>
      <button class="btn-primary" type="button" @click="navigateTo('/investimento/perfil')">Preencher perfil</button>
    </div>

    <template v-else-if="state === 'hub'">
      <!-- Perfil expirado: só as dicas ficam bloqueadas, os dados do utilizador nunca -->
      <div
        v-if="profileState === 'expired'"
        class="glass-card rounded-3xl p-4 border border-amber-500/30 flex items-start gap-3"
      >
        <AlertTriangle class="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div class="flex-1 text-sm text-white/70">
          O teu perfil de investidor tem mais de um ano. Renova-o para voltares a receber dicas.
        </div>
        <button class="btn-secondary text-xs py-1.5 px-3 shrink-0" type="button" @click="navigateTo('/investimento/perfil')">
          Renovar
        </button>
      </div>

      <InvestmentSummary :summary="summary" :loading="investmentsLoading && !items.length" />

      <section class="space-y-3" aria-labelledby="portfolio-title">
        <h3 id="portfolio-title" class="font-display font-bold text-lg text-white">O meu portfolio</h3>

        <div v-if="!items.length && !investmentsLoading" class="glass-card rounded-3xl p-10 text-center">
          <div class="text-4xl mb-3">💼</div>
          <h4 class="font-semibold text-white mb-2">Ainda não registaste nenhum investimento</h4>
          <p class="text-white/40 text-sm mb-6 max-w-md mx-auto">
            Regista o valor inicial, os reforços e a situação atual de cada posição para acompanhares a rentabilidade.
          </p>
          <button class="btn-primary" type="button" @click="openForm(null)">Regista o teu primeiro investimento</button>
        </div>

        <PortfolioTable
          v-else
          :items="items"
          @edit="openForm"
          @reinforce="(item) => (quick = { item, mode: 'reinforce' })"
          @update-value="(item) => (quick = { item, mode: 'value' })"
          @remove="handleRemove"
        />
      </section>

      <InvestmentTipsCard :profile-state="profileState === 'expired' ? 'expired' : 'valid'" />
    </template>

    <InvestmentModal
      v-if="showForm"
      :investment="editing"
      @close="showForm = false"
      @saved="onSaved(editing ? 'Investimento atualizado!' : 'Investimento registado! 📈')"
    />

    <InvestmentQuickModal
      v-if="quick"
      :investment="quick.item"
      :mode="quick.mode"
      @close="quick = null"
      @saved="onSaved(quick?.mode === 'reinforce' ? 'Reforço registado!' : 'Situação atualizada!')"
    />

    <PaywallModal
      v-if="state === 'paywall'"
      required-tier="premium"
      feature-label="O registo de investimentos"
      @close="navigateTo('/')"
    />
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Plus, AlertTriangle } from 'lucide-vue-next'
import type { InvestmentDto } from '~/shared/portfolio'

definePageMeta({ layout: 'default' })

// Hub da zona de investimentos (Fase 6): portfolio primeiro, dicas de IA por
// baixo. Ver context/features/06-FASE-6-registo-investimentos.md ("Fluxo e
// organização"). O perfil de investidor é uma ordem de UX — o servidor só exige
// o plano — e um perfil expirado nunca esconde os dados do utilizador.
const sub = useSubscription()
const toast = useToastStore()
const { items, summary, loading: investmentsLoading, fetchAll, remove } = useInvestments()

const canUse = computed(() => sub.hasFeature('investmentTracker'))
const subLoading = sub.isLoading

const loadingData = ref(false)
const profile = ref<unknown | null>(null)
const profileValid = ref(false)

const showForm = ref(false)
const editing = ref<InvestmentDto | null>(null)
const quick = ref<{ item: InvestmentDto; mode: 'reinforce' | 'value' } | null>(null)

const profileState = computed<'missing' | 'valid' | 'expired'>(() => {
  if (!profile.value) return 'missing'
  return profileValid.value ? 'valid' : 'expired'
})

const state = computed<'loading' | 'paywall' | 'needsProfile' | 'hub'>(() => {
  if (subLoading.value) return 'loading'
  if (!canUse.value) return 'paywall'
  if (loadingData.value) return 'loading'
  return profileState.value === 'missing' ? 'needsProfile' : 'hub'
})

async function load() {
  loadingData.value = true
  try {
    const p = await $fetch<{ profile: unknown | null; valid: boolean }>('/api/investor-profile')
    profile.value = p.profile
    profileValid.value = p.valid
    // Sem perfil não há hub, por isso não vale a pena pedir os investimentos.
    if (p.profile) await fetchAll()
  } catch {
    toast.error('Não foi possível carregar os teus investimentos.')
  } finally {
    loadingData.value = false
  }
}

// `canUse` só fica certo depois do fetch assíncrono de useSubscription() resolver
// (mesmo padrão de pages/stats/index.vue): só se carrega quando termina.
watch(
  [canUse, subLoading],
  ([allowed, loadingSub]) => {
    if (allowed && !loadingSub) load()
  },
  { immediate: true }
)

function openForm(item: InvestmentDto | null) {
  editing.value = item
  showForm.value = true
}

async function onSaved(message: string) {
  showForm.value = false
  quick.value = null
  toast.success(message)
  await fetchAll()
}

async function handleRemove(item: InvestmentDto) {
  if (!confirm(`Eliminar "${item.name}"? Não se pode desfazer.`)) return
  try {
    await remove(item._id)
    toast.success('Investimento eliminado')
    await fetchAll()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Erro ao eliminar')
  }
}
</script>
