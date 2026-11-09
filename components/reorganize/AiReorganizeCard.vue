<template>
  <div class="glass-card rounded-3xl p-5 sm:p-6 border border-brand-500/20" data-testid="ai-reorganize-card">
    <div class="flex items-center gap-2 mb-1 flex-wrap">
      <Wand2 class="w-4 h-4 text-brand-400" />
      <h3 class="font-display font-bold text-lg text-white">{{ t('aiReorganize.title') }}</h3>
      <span class="text-xs px-2 py-0.5 rounded-full bg-brand-600/30 text-brand-300 font-semibold">{{ t('tiers.premium') }}</span>
    </div>

    <!-- Sem Premium: bloqueado -->
    <div v-if="!canUse" class="mt-3">
      <p class="text-white/50 text-sm mb-4 max-w-2xl">{{ t('aiReorganize.lockedDescription') }}</p>
      <button class="btn-primary text-sm" type="button" data-testid="ai-reorganize-locked" @click="showPaywall = true">
        {{ t('common.viewPlans') }}
      </button>
      <PaywallModal
        v-if="showPaywall"
        required-tier="premium"
        :feature-label="t('aiReorganize.paywallFeatureLabel')"
        @close="showPaywall = false"
      />
    </div>

    <div v-else-if="!state" class="mt-4">
      <SkeletonBlock rounded="2xl" class="h-16" />
    </div>

    <template v-else>
      <p class="text-white/50 text-sm mt-1 max-w-2xl">{{ t('aiReorganize.intro') }}</p>

      <!-- Proposta por rever -->
      <div v-if="proposal?.status === 'ready'" class="mt-4 space-y-3" data-testid="ai-reorganize-proposal">
        <p class="text-white/80 text-sm">{{ proposal.summary }}</p>
        <p v-if="!proposal.operations.length" class="text-white/50 text-sm" data-testid="ai-reorganize-nothing">
          {{ t('aiReorganize.nothingToChange') }}
        </p>
        <template v-else>
          <ul class="space-y-2">
            <li
              v-for="(op, i) in (proposal.operations as any[])"
              :key="i"
              class="flex items-start gap-3 border border-white/10 rounded-2xl p-3"
              data-testid="ai-reorganize-op"
            >
              <input
                :id="`reorg-op-${i}`"
                type="checkbox"
                class="mt-1"
                :checked="selected.has(i)"
                @change="toggle(i, ($event.target as HTMLInputElement).checked)"
              />
              <label :for="`reorg-op-${i}`" class="flex-1 min-w-0 cursor-pointer">
                <span class="text-white text-sm font-medium block">{{ describe(op) }}</span>
                <span class="text-white/40 text-xs block">{{ op.reason }}</span>
              </label>
            </li>
          </ul>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="btn-primary text-sm"
              :disabled="busy || !selected.size"
              data-testid="ai-reorganize-apply"
              @click="apply"
            >
              {{ t('aiReorganize.apply', { n: selected.size }) }}
            </button>
            <button type="button" class="btn-secondary text-sm" :disabled="busy" @click="selectAll(!allSelected)">
              {{ allSelected ? t('aiReorganize.selectNone') : t('aiReorganize.selectAll') }}
            </button>
          </div>
        </template>
      </div>

      <!-- Aplicada -->
      <div v-else-if="proposal?.status === 'applied'" class="mt-4 space-y-3">
        <p class="text-emerald-300 text-sm" data-testid="ai-reorganize-applied">{{ t('aiReorganize.applied', { n: proposal.appliedOps.length }) }}</p>
        <button
          v-if="proposal.canUndo"
          type="button"
          class="btn-secondary text-sm"
          :disabled="busy"
          data-testid="ai-reorganize-undo"
          @click="undo"
        >
          {{ t('aiReorganize.undo') }}
        </button>
      </div>

      <!-- Pedir uma proposta -->
      <div v-if="proposal?.status !== 'ready'" class="mt-4 space-y-2">
        <p
          v-if="!state.eligibility.ok"
          class="text-yellow-300/90 text-sm bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-3"
          data-testid="ai-reorganize-need-data"
        >
          {{ t('aiReorganize.needData', state.eligibility) }}
        </p>
        <button
          v-else
          type="button"
          class="btn-primary text-sm flex items-center gap-2"
          :disabled="busy || state.used >= state.limit"
          data-testid="ai-reorganize-request"
          @click="request"
        >
          <Loader2 v-if="busy" class="w-4 h-4 animate-spin" />
          {{ t('aiReorganize.request') }}
        </button>
        <p class="text-white/30 text-xs">{{ t('aiReorganize.usage', { used: state.used, limit: state.limit }) }}</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Loader2, Wand2 } from 'lucide-vue-next'

// Reorganização de categorias e grupos com IA (Premium, shared/reorganize.ts):
// a IA propõe, cada alteração mostra o motivo e só se aplica o que for
// escolhido. Escolher uma alteração escolhe as de que depende; tirá-la tira
// as que dependem dela.
const emit = defineEmits<{ changed: [] }>()
const { t } = useI18n()
const toast = useToastStore()
const sub = useSubscription()
const canUse = computed(() => sub.hasFeature('aiReorganize'))
const showPaywall = ref(false)

const state = ref<any>(null)
const busy = ref(false)
const selected = ref(new Set<number>())
const proposal = computed(() => state.value?.proposal)
const allSelected = computed(() => !!proposal.value?.operations.length && selected.value.size === proposal.value.operations.length)

function setState(next: any) {
  state.value = next
  // Por omissão, tudo escolhido: a pessoa tira o que não quiser.
  selected.value = new Set(next?.proposal?.status === 'ready' ? next.proposal.operations.map((_: unknown, i: number) => i) : [])
}

function toggle(i: number, on: boolean) {
  const ops = proposal.value.operations
  const next = new Set(selected.value)
  const visit = (j: number) => {
    if (on ? next.has(j) : !next.has(j)) return
    on ? next.add(j) : next.delete(j)
    if (on) ops[j].dependsOn.forEach(visit)
    else ops.forEach((op: any, k: number) => { if (op.dependsOn.includes(j)) visit(k) })
  }
  visit(i)
  selected.value = next
}

function selectAll(on: boolean) {
  selected.value = new Set(on ? proposal.value.operations.map((_: unknown, i: number) => i) : [])
}

function describe(op: any): string {
  const l = op.label || {}
  const group = l.group ?? t('aiReorganize.noGroup')
  switch (op.kind) {
    case 'createGroup': return t('aiReorganize.op.createGroup', { name: op.name })
    case 'renameGroup': return t('aiReorganize.op.renameGroup', { from: l.target, name: op.name })
    case 'deleteGroup': return t('aiReorganize.op.deleteGroup', { name: l.target })
    case 'createCategory': return t('aiReorganize.op.createCategory', { name: `${op.icon} ${op.name}`, group })
    case 'renameCategory': return t('aiReorganize.op.renameCategory', { from: l.target, name: op.name })
    case 'setCategoryGroup': return t('aiReorganize.op.setCategoryGroup', { name: l.target, group })
    case 'moveTransactions': return t('aiReorganize.op.moveTransactions', { n: op.affected, from: l.target, into: l.into, list: op.descriptions.join(', ') })
    case 'mergeCategory': return t('aiReorganize.op.mergeCategory', { from: l.target, into: l.into, n: op.affected })
    case 'deleteCategory': return t('aiReorganize.op.deleteCategory', { name: l.target })
    default: return op.kind
  }
}

async function call(path: string, body?: object) {
  busy.value = true
  try {
    setState(await $fetch(path, { method: 'POST', body }))
    return true
  } catch (e: any) {
    if (e?.data?.data?.error !== 'feature_locked') toast.error(e?.data?.message || t('aiReorganize.errorGeneric'))
    return false
  } finally {
    busy.value = false
  }
}

async function request() {
  await call('/api/reorganize')
}

async function apply() {
  if (await call('/api/reorganize/apply', { id: proposal.value._id, operations: [...selected.value] })) {
    toast.success(t('aiReorganize.toastApplied'))
    emit('changed')
  }
}

async function undo() {
  if (!confirm(t('aiReorganize.confirmUndo'))) return
  if (await call('/api/reorganize/undo', { id: proposal.value._id })) {
    toast.success(t('aiReorganize.toastUndone'))
    emit('changed')
  }
}

// O plano pode chegar depois de a página montar.
watch(canUse, async (allowed) => {
  if (!allowed || state.value) return
  try {
    setState(await $fetch('/api/reorganize'))
  } catch {
    toast.error(t('aiReorganize.errorGeneric'))
  }
}, { immediate: true })
</script>
