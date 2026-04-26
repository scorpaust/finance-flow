<template>
  <div class="space-y-6 animate-fade-in max-w-2xl">
    <div>
      <button
        class="btn-secondary text-sm py-2 px-4 mb-4 flex items-center gap-2"
        type="button"
        @click="navigateTo('/')"
      >
        <ArrowLeft class="w-4 h-4" />
        Voltar ao dashboard
      </button>
      <h2 class="font-display font-bold text-2xl text-white">Configurações</h2>
      <p class="text-white/40 text-xs mt-1">Gere categorias, grupos e preferências</p>
    </div>

    <!-- Profile -->
    <div class="glass-card rounded-3xl p-6">
      <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><User class="w-4 h-4 text-brand-400" /> Perfil</h3>
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-2xl overflow-hidden bg-brand-600/20 flex items-center justify-center">
          <img v-if="auth.user?.image" :src="auth.user.image" class="w-full h-full object-cover" />
          <span v-else class="text-2xl">{{ auth.user?.name?.[0] }}</span>
        </div>
        <div>
          <p class="font-semibold text-white">{{ auth.user?.name }}</p>
          <p class="text-white/50 text-sm">{{ auth.user?.email }}</p>
          <button class="text-rose-400 text-xs mt-2 hover:text-rose-300 transition-colors" @click="auth.signOut()">
            Terminar sessão
          </button>
        </div>
      </div>
    </div>

    <!-- Categories -->
    <div class="glass-card rounded-3xl overflow-hidden">
      <div class="flex items-center justify-between p-6 border-b border-white/[0.08]">
        <h3 class="font-semibold text-white flex items-center gap-2">
          <Tag class="w-4 h-4 text-brand-400" /> Categorias
        </h3>
        <button class="btn-primary text-sm py-2 flex items-center gap-1.5" @click="showCatModal = true">
          <Plus class="w-4 h-4" /> Nova
        </button>
      </div>

      <!-- Type filter -->
      <div class="flex gap-1 p-4 border-b border-white/[0.08]">
        <button v-for="t in typeOpts" :key="t.value"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          :class="catFilter === t.value ? 'bg-brand-600 text-white' : 'text-white/50 hover:text-white'"
          @click="catFilter = t.value">
          {{ t.label }}
        </button>
      </div>

      <div class="divide-y divide-white/5">
        <div v-for="cat in filteredCats" :key="cat._id" class="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.03] transition-colors group">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center text-base"
            :style="{ backgroundColor: cat.color + '20', border: `1px solid ${cat.color}30` }">
            {{ cat.icon }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white">{{ cat.name }}</p>
            <p class="text-xs text-white/40 capitalize">{{ typeLabel(cat.type) }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="cat.isDefault" class="text-xs text-white/20">padrão</span>
            <template v-if="confirmDeleteCatId === cat._id">
              <button class="text-xs px-2 py-1 rounded-lg text-white/50 hover:text-white transition-colors" @click="confirmDeleteCatId = null">Cancelar</button>
              <button class="text-xs px-2 py-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors" @click="deleteCat(cat._id)">Confirmar</button>
            </template>
            <template v-else>
              <button class="btn-icon w-7 h-7 hover:border-rose-500/30" @click="confirmDeleteCatId = cat._id">
                <Trash2 class="w-3.5 h-3.5 text-rose-400" />
              </button>
            </template>
          </div>
        </div>
        <div v-if="!filteredCats.length" class="py-8 text-center text-white/30 text-sm">
          Sem categorias
        </div>
      </div>
    </div>

    <!-- New category modal -->
    <Teleport to="body">
      <div v-if="showCatModal" class="modal-overlay" @click.self="showCatModal = false">
        <div class="modal-content max-w-sm">
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-semibold text-white">Nova Categoria</h3>
            <button class="btn-icon" @click="showCatModal = false"><X class="w-4 h-4" /></button>
          </div>
          <div class="space-y-4">
            <div>
              <label class="form-label">Nome *</label>
              <input v-model="newCat.name" type="text" class="form-input" placeholder="Nome da categoria" />
            </div>
            <div>
              <label class="form-label">Tipo *</label>
              <div class="flex gap-2">
                <button v-for="t in ['income','expense','both']" :key="t"
                  class="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                  :class="newCat.type === t ? 'bg-brand-600 text-white' : 'glass-card text-white/50'"
                  @click="newCat.type = t as any">
                  {{ typeLabel(t) }}
                </button>
              </div>
            </div>
            <div>
              <label class="form-label">Ícone</label>
              <div class="flex flex-wrap gap-2">
                <button v-for="icon in CATEGORY_ICONS" :key="icon"
                  class="w-9 h-9 rounded-xl text-lg transition-all hover:bg-white/10"
                  :class="newCat.icon === icon ? 'bg-brand-600/40 ring-1 ring-brand-500' : ''"
                  @click="newCat.icon = icon">{{ icon }}</button>
              </div>
            </div>
            <div>
              <label class="form-label">Cor</label>
              <div class="flex flex-wrap gap-2">
                <button v-for="color in CATEGORY_COLORS" :key="color"
                  class="w-7 h-7 rounded-lg transition-all hover:scale-110"
                  :class="newCat.color === color ? 'ring-2 ring-white scale-110' : ''"
                  :style="{ background: color }"
                  @click="newCat.color = color" />
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button class="btn-secondary flex-1" @click="showCatModal = false">Cancelar</button>
              <button class="btn-primary flex-1" :disabled="!newCat.name" @click="createCat">Criar</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { User, Tag, Plus, Trash2, X, ArrowLeft } from 'lucide-vue-next'
import { CATEGORY_ICONS, CATEGORY_COLORS } from '~/types'

definePageMeta({ layout: 'default' })

const auth = useAuthStore()
const finance = useFinanceStore()
const toast = useToastStore()

const showCatModal = ref(false)
const catFilter = ref('all')
const confirmDeleteCatId = ref<string | null>(null)
const typeOpts = [
  { value: 'all', label: 'Todos' },
  { value: 'income', label: 'Receitas' },
  { value: 'expense', label: 'Despesas' },
]

const newCat = reactive({ name: '', type: 'expense' as any, icon: '💰', color: '#6366f1' })

const filteredCats = computed(() =>
  finance.categories.filter((c) => catFilter.value === 'all' || c.type === catFilter.value || c.type === 'both')
)

function typeLabel(t: string) {
  return { income: 'Receita', expense: 'Despesa', both: 'Ambos' }[t] || t
}

async function createCat() {
  if (!newCat.name) return
  try {
    await finance.createCategory({ ...newCat })
    showCatModal.value = false
    newCat.name = ''
    toast.success('Categoria criada!')
  } catch (e: any) {
    toast.error(e?.data?.message || 'Erro ao criar')
  }
}

async function deleteCat(id: string) {
  confirmDeleteCatId.value = null
  try {
    await finance.deleteCategory(id)
    toast.success('Categoria eliminada')
  } catch (e: any) {
    toast.error(e?.data?.message || 'Erro ao eliminar')
  }
}

onMounted(() => finance.fetchCategories())
</script>
