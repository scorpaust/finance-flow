<template>
  <div class="space-y-6 animate-fade-in max-w-2xl">
    <div>
      <button
        class="btn-secondary text-sm py-2 px-4 mb-4 flex items-center gap-2"
        type="button"
        @click="navigateTo('/')"
      >
        <ArrowLeft class="w-4 h-4" />
        {{ t('common.backToDashboard') }}
      </button>
      <h2 class="font-display font-bold text-2xl text-white">{{ t('settings.title') }}</h2>
      <p class="text-white/40 text-xs mt-1">{{ t('settings.subtitle') }}</p>
    </div>

    <!-- Profile -->
    <div class="glass-card rounded-3xl p-6">
      <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><User class="w-4 h-4 text-brand-400" /> {{ t('settings.profileTitle') }}</h3>
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-2xl overflow-hidden bg-brand-600/20 flex items-center justify-center">
          <img v-if="auth.user?.image" :src="auth.user.image" class="w-full h-full object-cover" />
          <span v-else class="text-2xl">{{ auth.user?.name?.[0] }}</span>
        </div>
        <div>
          <p class="font-semibold text-white">{{ auth.user?.name }}</p>
          <p class="text-white/50 text-sm">{{ auth.user?.email }}</p>
          <button class="text-rose-400 text-xs mt-2 hover:text-rose-300 transition-colors" @click="auth.signOut()">
            {{ t('settings.signOut') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Language (Fase 7) -->
    <div class="glass-card rounded-3xl p-6">
      <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><Languages class="w-4 h-4 text-brand-400" /> {{ t('settings.language.title') }}</h3>
      <p class="text-white/40 text-xs mb-3">{{ t('settings.language.description') }}</p>
      <label class="form-label">{{ t('settings.language.label') }}</label>
      <select v-model="currentLocale" class="form-select w-full sm:w-auto">
        <option v-for="l in availableLocales" :key="l.code" :value="l.code">{{ l.name }}</option>
      </select>
    </div>

    <!-- Subscription -->
    <div class="glass-card rounded-3xl p-6">
      <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><Crown class="w-4 h-4 text-brand-400" /> {{ t('settings.subscriptionTitle') }}</h3>
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p class="text-white font-bold">{{ TIER_LABEL[currentTier] }}</p>
          <p class="text-white/40 text-xs mt-0.5">
            {{ currentTier === 'free' ? t('settings.subscriptionFreeDescription') : t('settings.subscriptionManageDescription') }}
          </p>
        </div>
        <button class="btn-primary text-sm py-2" type="button" @click="navigateTo('/subscription')">
          {{ currentTier === 'free' ? t('common.viewPlans') : t('settings.manageSubscription') }}
        </button>
      </div>
    </div>

    <!-- Categories -->
    <div class="glass-card rounded-3xl overflow-hidden">
      <div class="flex items-center justify-between p-6 border-b border-white/[0.08]">
        <h3 class="font-semibold text-white flex items-center gap-2">
          <Tag class="w-4 h-4 text-brand-400" /> {{ t('settings.categoriesTitle') }}
        </h3>
        <button class="btn-primary text-sm py-2 flex items-center gap-1.5" @click="showCatModal = true">
          <Plus class="w-4 h-4" /> {{ t('settings.newCategory') }}
        </button>
      </div>

      <!-- Type filter -->
      <div class="flex gap-1 p-4 border-b border-white/[0.08]">
        <button v-for="opt in typeOpts" :key="opt.value"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          :class="catFilter === opt.value ? 'bg-brand-600 text-white' : 'text-white/50 hover:text-white'"
          @click="catFilter = opt.value">
          {{ opt.label }}
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
            <span v-if="cat.isDefault" class="text-xs text-white/20">{{ t('settings.defaultBadge') }}</span>
            <template v-if="confirmDeleteCatId === cat._id">
              <button class="text-xs px-2 py-1 rounded-lg text-white/50 hover:text-white transition-colors" @click="confirmDeleteCatId = null">{{ t('common.cancel') }}</button>
              <button class="text-xs px-2 py-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors" @click="deleteCat(cat._id)">{{ t('common.confirm') }}</button>
            </template>
            <template v-else>
              <button class="btn-icon w-7 h-7 hover:border-rose-500/30" :aria-label="t('settings.deleteCategoryAria')" @click="confirmDeleteCatId = cat._id">
                <Trash2 class="w-3.5 h-3.5 text-rose-400" />
              </button>
            </template>
          </div>
        </div>
        <div v-if="!filteredCats.length" class="py-8 text-center text-white/30 text-sm">
          {{ t('settings.noCategoriesEmpty') }}
        </div>
      </div>
    </div>

    <!-- New category modal -->
    <Teleport to="body">
      <div v-if="showCatModal" class="modal-overlay" @click.self="showCatModal = false">
        <div class="modal-content max-w-sm">
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-semibold text-white">{{ t('settings.newCategoryModalTitle') }}</h3>
            <button class="btn-icon" :aria-label="t('common.close')" @click="showCatModal = false"><X class="w-4 h-4" /></button>
          </div>
          <div class="space-y-4">
            <div>
              <label class="form-label">{{ t('settings.nameLabel') }}</label>
              <input v-model="newCat.name" type="text" class="form-input" :placeholder="t('settings.namePlaceholder')" />
            </div>
            <div>
              <label class="form-label">{{ t('settings.typeLabel') }}</label>
              <div class="flex gap-2">
                <button v-for="ty in ['income','expense','both']" :key="ty"
                  class="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                  :class="newCat.type === ty ? 'bg-brand-600 text-white' : 'glass-card text-white/50'"
                  @click="newCat.type = ty as any">
                  {{ typeLabel(ty) }}
                </button>
              </div>
            </div>
            <div>
              <label class="form-label">{{ t('settings.iconLabel') }}</label>
              <div class="flex flex-wrap gap-2">
                <button v-for="icon in CATEGORY_ICONS" :key="icon"
                  class="w-9 h-9 rounded-xl text-lg transition-all hover:bg-white/10"
                  :class="newCat.icon === icon ? 'bg-brand-600/40 ring-1 ring-brand-500' : ''"
                  @click="newCat.icon = icon">{{ icon }}</button>
              </div>
            </div>
            <div>
              <label class="form-label">{{ t('settings.colorLabel') }}</label>
              <div class="flex flex-wrap gap-2">
                <button v-for="color in CATEGORY_COLORS" :key="color"
                  class="w-7 h-7 rounded-lg transition-all hover:scale-110"
                  :class="newCat.color === color ? 'ring-2 ring-white scale-110' : ''"
                  :style="{ background: color }"
                  @click="newCat.color = color" />
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button class="btn-secondary flex-1" @click="showCatModal = false">{{ t('common.cancel') }}</button>
              <button class="btn-primary flex-1" :disabled="!newCat.name" @click="createCat">{{ t('common.create') }}</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { User, Tag, Plus, Trash2, X, ArrowLeft, Crown, Languages } from 'lucide-vue-next'
import { CATEGORY_ICONS, CATEGORY_COLORS } from '~/types'
import { TIER_LABEL } from '~/shared/features'

definePageMeta({ layout: 'default' })

const auth = useAuthStore()
const finance = useFinanceStore()
const toast = useToastStore()
const currentTier = useSubscription().tier
const { t, locale, locales, setLocale } = useI18n()

// Fase 7, tarefa 1 — a escolha manual aqui grava o mesmo cookie que
// `plugins/locale.ts` usa para a deteção automática (não delegado no
// `detectBrowserLanguage` do módulo — está desligado de propósito, ver
// nuxt.config.ts); por isso, depois desta escolha, a deteção por
// Accept-Language nunca mais é repetida.
const localeCookie = useCookie<string | null>('financeflow_locale', { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
const availableLocales = computed(() => locales.value as { code: string; name: string }[])
const currentLocale = computed({
  get: () => locale.value,
  set: (code: string) => {
    setLocale(code as typeof locale.value)
    localeCookie.value = code
  },
})

const showCatModal = ref(false)
const catFilter = ref('all')
const confirmDeleteCatId = ref<string | null>(null)
const typeOpts = computed(() => [
  { value: 'all', label: t('settings.filterAll') },
  { value: 'income', label: t('settings.filterIncome') },
  { value: 'expense', label: t('settings.filterExpense') },
])

const newCat = reactive({ name: '', type: 'expense' as any, icon: '💰', color: '#6366f1' })

const filteredCats = computed(() =>
  finance.categories.filter((c) => catFilter.value === 'all' || c.type === catFilter.value || c.type === 'both')
)

function typeLabel(type: string) {
  return { income: t('settings.typeIncome'), expense: t('settings.typeExpense'), both: t('settings.typeBoth') }[type] || type
}

async function createCat() {
  if (!newCat.name) return
  try {
    await finance.createCategory({ ...newCat })
    showCatModal.value = false
    newCat.name = ''
    toast.success(t('settings.toastCategoryCreated'))
  } catch (e: any) {
    toast.error(e?.data?.message || t('settings.toastCategoryCreateError'))
  }
}

async function deleteCat(id: string) {
  confirmDeleteCatId.value = null
  try {
    await finance.deleteCategory(id)
    toast.success(t('settings.toastCategoryDeleted'))
  } catch (e: any) {
    toast.error(e?.data?.message || t('settings.toastCategoryDeleteError'))
  }
}

onMounted(() => finance.fetchCategories())
</script>
