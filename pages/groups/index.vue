<template>
  <div class="space-y-5 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <button
          class="btn-secondary text-sm py-2 px-4 mb-4 flex items-center gap-2"
          type="button"
          @click="navigateTo('/')"
        >
          <ArrowLeft class="w-4 h-4" />
          Voltar ao dashboard
        </button>
        <h2 class="font-display font-bold text-2xl text-white">Grupos</h2>
        <p class="text-white/40 text-xs mt-0.5">Agrupa transações relacionadas</p>
      </div>
      <button class="btn-primary text-sm flex items-center gap-2" @click="showModal = true">
        <Plus class="w-4 h-4" /> Novo Grupo
      </button>
    </div>

    <!-- Groups grid -->
    <div v-if="groupsStore.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="skeleton rounded-3xl h-36" />
    </div>

    <div v-else-if="groupsStore.groups.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="g in groupsStore.groups"
        :key="g._id"
        class="glass-card-hover rounded-3xl p-5 cursor-pointer relative overflow-hidden group"
        @click="openGroup(g)"
      >
        <!-- Color accent -->
        <div
          class="absolute top-0 left-0 w-full h-1 rounded-t-3xl"
          :style="{ background: g.color }"
        />
        <div class="flex items-start justify-between mb-3 mt-1">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm"
              :style="{ backgroundColor: g.color + '20', border: `1px solid ${g.color}40`, color: g.color }"
            >
              {{ g.name.slice(0, 2).toUpperCase() }}
            </div>
            <div>
              <p class="font-semibold text-white text-sm">{{ g.name }}</p>
              <p v-if="g.description" class="text-white/40 text-xs truncate max-w-32">{{ g.description }}</p>
            </div>
          </div>
          <div class="flex gap-1 items-center" @click.stop>
            <template v-if="confirmDeleteId === g._id">
              <button class="text-xs px-2 py-1 rounded-lg text-white/50 hover:text-white transition-colors" @click="confirmDeleteId = null">Cancelar</button>
              <button class="text-xs px-2 py-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors" @click="doDeleteGroup(g._id)">Confirmar</button>
            </template>
            <template v-else>
              <button class="btn-icon w-7 h-7" @click="editGroup = g; showModal = true">
                <Pencil class="w-3 h-3" />
              </button>
              <button class="btn-icon w-7 h-7 hover:border-rose-500/30" @click="confirmDeleteId = g._id">
                <Trash2 class="w-3 h-3 text-rose-400" />
              </button>
            </template>
          </div>
        </div>

        <div class="flex items-center gap-4 mt-4 pt-4 border-t border-white/[0.08]">
          <div class="text-center">
            <p class="text-white font-bold text-lg">{{ Math.round(groupPercent(g)) }}%</p>
            <p class="text-white/30 text-xs">transações</p>
          </div>
          <div class="w-px h-8 bg-white/10" />
          <div class="text-center">
            <p class="font-bold text-sm" :style="{ color: g.color }">{{ formatCompact(g.monthlySpent || 0) }}</p>
            <p class="text-white/30 text-xs">total</p>
          </div>
        </div>
        <div v-if="g.monthlyLimit" class="progress-bar h-1.5 mt-3">
          <div
            class="h-full rounded-full"
            :style="{ width: Math.min(100, groupPercent(g)) + '%', background: groupPercent(g) >= 100 ? '#f43f5e' : groupPercent(g) >= (g.alertThreshold || 80) ? '#eab308' : g.color }"
          />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="glass-card rounded-3xl p-12 text-center">
      <div class="text-5xl mb-4">📁</div>
      <h3 class="font-semibold text-white mb-2">Sem grupos criados</h3>
      <p class="text-white/40 text-sm mb-6">Agrupa transações por projetos, viagens ou qualquer critério</p>
      <button class="btn-primary" @click="showModal = true">
        <Plus class="w-4 h-4 inline mr-1" /> Criar Primeiro Grupo
      </button>
    </div>

    <!-- Group detail drawer -->
    <Transition name="slide">
      <div v-if="selectedGroup" class="fixed inset-y-0 right-0 z-50 w-full max-w-lg">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="selectedGroup = null" />
        <div class="relative h-full glass-card border-l border-white/10 flex flex-col overflow-hidden">
          <!-- Drawer header -->
          <div class="flex items-center gap-4 p-6 border-b border-white/[0.08] shrink-0">
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold"
              :style="{ backgroundColor: selectedGroup.color + '20', border: `1px solid ${selectedGroup.color}40`, color: selectedGroup.color }"
            >
              {{ selectedGroup.name.slice(0, 2).toUpperCase() }}
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-white">{{ selectedGroup.name }}</h3>
              <p class="text-white/40 text-xs">{{ groupDetail?.stats?.count || 0 }} transações</p>
            </div>
            <template v-if="confirmDeleteId === selectedGroup._id">
              <button class="text-xs px-2 py-1 rounded-lg text-white/50 hover:text-white transition-colors" @click="confirmDeleteId = null">Cancelar</button>
              <button class="text-xs px-2 py-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors" @click="doDeleteGroup(selectedGroup._id)">Confirmar</button>
            </template>
            <template v-else>
              <button class="btn-icon" @click="editGroup = selectedGroup; showModal = true; selectedGroup = null">
                <Pencil class="w-4 h-4" />
              </button>
              <button class="btn-icon hover:border-rose-500/30" @click="confirmDeleteId = selectedGroup._id">
                <Trash2 class="w-4 h-4 text-rose-400" />
              </button>
            </template>
            <button class="btn-icon" @click="selectedGroup = null; confirmDeleteId = null">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-3 p-6 border-b border-white/[0.08] shrink-0">
            <div class="glass-card rounded-2xl p-3 text-center">
              <p class="text-emerald-400 font-bold">{{ formatCompact(groupDetail?.stats?.income || 0) }}</p>
              <p class="text-white/30 text-xs mt-0.5">Receitas</p>
            </div>
            <div class="glass-card rounded-2xl p-3 text-center">
              <p class="text-rose-400 font-bold">{{ formatCompact(groupDetail?.stats?.expense || 0) }}</p>
              <p class="text-white/30 text-xs mt-0.5">Despesas</p>
            </div>
            <div class="glass-card rounded-2xl p-3 text-center">
              <p class="font-bold" :class="(groupDetail?.stats?.balance || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                {{ formatCompact(groupDetail?.stats?.balance || 0) }}
              </p>
              <p class="text-white/30 text-xs mt-0.5">Saldo</p>
            </div>
          </div>

          <!-- Transaction list -->
          <div class="flex-1 overflow-y-auto">
            <div v-if="loadingDetail" class="flex items-center justify-center py-12">
              <div class="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <div
              v-for="tx in groupDetail?.transactions"
              :key="tx._id"
              class="flex items-center gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/[0.03] transition-colors"
            >
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                :style="{ backgroundColor: (tx as any).categoryId?.color + '20' }"
              >
                {{ (tx as any).categoryId?.icon || '💰' }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">{{ tx.description }}</p>
                <p class="text-xs text-white/40">{{ formatDate(tx.date) }}</p>
              </div>
              <span :class="tx.type === 'income' ? 'amount-positive' : 'amount-negative'" class="font-bold text-sm">
                {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content max-w-md">
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-semibold text-white">{{ editGroup ? 'Editar' : 'Novo' }} Grupo</h3>
            <button class="btn-icon" @click="closeModal"><X class="w-4 h-4" /></button>
          </div>
          <form class="space-y-4" @submit.prevent="saveGroup">
            <div>
              <label class="form-label">Nome *</label>
              <input v-model="form.name" type="text" class="form-input" placeholder="Ex: Férias 2024, Casa..." required />
            </div>
            <div>
              <label class="form-label">Descrição</label>
              <input v-model="form.description" type="text" class="form-input" placeholder="Descrição opcional..." />
            </div>
            <div>
              <label class="form-label">Cor</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="c in CATEGORY_COLORS"
                  :key="c"
                  type="button"
                  class="w-8 h-8 rounded-xl transition-all hover:scale-110"
                  :class="form.color === c ? 'ring-2 ring-white scale-110' : ''"
                  :style="{ background: c }"
                  @click="form.color = c"
                />
              </div>
            </div>
            <!-- Budget limits -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="form-label">Teto mensal (€)</label>
                <input
                  v-model.number="form.monthlyLimit"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-input"
                  placeholder="Sem limite"
                />
              </div>
              <div>
                <label class="form-label">Teto semanal (€)</label>
                <input
                  v-model.number="form.weeklyLimit"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-input"
                  placeholder="Sem limite"
                />
              </div>
            </div>
            <div>
              <label class="form-label">Alerta aos <span class="text-brand-400">{{ form.alertThreshold }}%</span></label>
              <input
                v-model.number="form.alertThreshold"
                type="range"
                min="50"
                max="100"
                step="5"
                class="w-full accent-brand-500"
              />
              <div class="flex justify-between text-xs text-white/30 mt-1">
                <span>50%</span><span>75%</span><span>100%</span>
              </div>
            </div>

            <!-- Preview -->
            <div class="glass-card rounded-2xl p-4 flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                :style="{ backgroundColor: form.color + '20', border: `1px solid ${form.color}40`, color: form.color }"
              >
                {{ (form.name || 'AB').slice(0, 2).toUpperCase() }}
              </div>
              <div class="flex-1">
                <p class="text-white text-sm font-medium">{{ form.name || 'Nome do grupo' }}</p>
                <p class="text-white/30 text-xs">
                  {{ form.monthlyLimit ? `Teto: ${formatCurrency(form.monthlyLimit)}/mês` : 'Sem teto definido' }}
                </p>
              </div>
            </div>
            <div class="flex gap-3 pt-1">
              <button type="button" class="btn-secondary flex-1" @click="closeModal">Cancelar</button>
              <button type="submit" class="btn-primary flex-1" :disabled="saving">
                <Loader2 v-if="saving" class="w-4 h-4 inline animate-spin mr-1" />
                {{ editGroup ? 'Atualizar' : 'Criar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Plus, Pencil, Trash2, X, Loader2, ArrowLeft } from 'lucide-vue-next'
import { CATEGORY_COLORS } from '~/types'
import type { Group } from '~/stores/groups'

definePageMeta({ layout: 'default' })

const groupsStore = useGroupsStore()
const toast = useToastStore()
const { formatCurrency, formatCompact, formatDate } = useFormatters()

const showModal = ref(false)
const saving = ref(false)
const editGroup = ref<Group | null>(null)
const selectedGroup = ref<Group | null>(null)
const groupDetail = ref<any>(null)
const loadingDetail = ref(false)
const confirmDeleteId = ref<string | null>(null)

const form = reactive({
  name: '',
  description: '',
  color: '#6366f1',
  monthlyLimit: null as number | null,
  weeklyLimit: null as number | null,
  alertThreshold: 80,
})

function groupPercent(g: Group) {
  if (!g.monthlyLimit) return 0
  return ((g.monthlySpent || 0) / g.monthlyLimit) * 100
}

function closeModal() {
  showModal.value = false
  editGroup.value = null
  form.name = ''
  form.description = ''
  form.color = '#6366f1'
  form.monthlyLimit = null
  form.weeklyLimit = null
  form.alertThreshold = 80
}

watch(editGroup, (g) => {
  if (g) {
    form.name = g.name
    form.description = g.description || ''
    form.color = g.color
    form.monthlyLimit = g.monthlyLimit ?? null
    form.weeklyLimit = g.weeklyLimit ?? null
    form.alertThreshold = g.alertThreshold ?? 80
  }
})

async function openGroup(g: Group) {
  selectedGroup.value = g
  loadingDetail.value = true
  try {
    groupDetail.value = await $fetch(`/api/groups/${g._id}`)
  } finally {
    loadingDetail.value = false
  }
}

async function saveGroup() {
  saving.value = true
  try {
    if (editGroup.value) {
      await groupsStore.updateGroup(editGroup.value._id, { ...form })
      toast.success('Grupo atualizado!')
    } else {
      await groupsStore.createGroup({ ...form })
      toast.success('Grupo criado!')
    }
    closeModal()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Erro ao guardar grupo')
  } finally {
    saving.value = false
  }
}

async function doDeleteGroup(id: string) {
  confirmDeleteId.value = null
  try {
    await groupsStore.deleteGroup(id)
    if (selectedGroup.value?._id === id) selectedGroup.value = null
    toast.success('Grupo eliminado')
  } catch {
    toast.error('Erro ao eliminar')
  }
}

onMounted(() => groupsStore.fetchGroups())
</script>
