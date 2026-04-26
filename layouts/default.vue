<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Ambient orbs -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div class="orb w-96 h-96 bg-brand-600 -top-20 -left-20"    style="animation-delay:0s" />
      <div class="orb w-80 h-80 bg-purple-600 top-1/2 -right-20"  style="animation-delay:-3s" />
      <div class="orb w-64 h-64 bg-brand-800 bottom-0 left-1/3"   style="animation-delay:-6s" />
    </div>

    <!-- ── SIDEBAR (desktop) ───────────────────────────────────── -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-40 flex flex-col glass-card border-r border-white/[0.08]',
        'transition-all duration-300 ease-in-out',
        sidebarOpen ? 'w-64' : 'w-[4.5rem]',
        'lg:relative',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 p-5 border-b border-white/[0.08] shrink-0 overflow-hidden">
        <div class="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center neon-brand shrink-0">
          <span class="text-lg">💹</span>
        </div>
        <Transition name="fade">
          <div v-if="sidebarOpen" class="min-w-0">
            <p class="font-display font-bold text-white text-lg leading-tight">FinanceFlow</p>
            <p class="text-white/40 text-xs">Finanças Pessoais</p>
          </div>
        </Transition>
      </div>

      <!-- Nav items -->
      <nav class="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="['nav-item group', { active: isActive(item.path) }]"
          :title="!sidebarOpen ? item.label : undefined"
        >
          <component :is="item.icon" class="shrink-0 w-5 h-5" />
          <Transition name="fade">
            <span v-if="sidebarOpen" class="truncate text-sm">{{ item.label }}</span>
          </Transition>
        </NuxtLink>
      </nav>

      <!-- Collapse toggle (desktop only) -->
      <div class="px-3 py-2 border-t border-white/[0.08] hidden lg:block">
        <button class="nav-item w-full justify-center" @click="sidebarOpen = !sidebarOpen">
          <ChevronLeft :class="['w-4 h-4 transition-transform duration-300', !sidebarOpen && 'rotate-180']" />
          <Transition name="fade">
            <span v-if="sidebarOpen" class="text-xs ml-2">Recolher</span>
          </Transition>
        </button>
      </div>

      <!-- User / sign out -->
      <div class="p-3 border-t border-white/[0.08] shrink-0">
        <div class="nav-item cursor-pointer group" @click="handleSignOut">
          <div class="w-8 h-8 rounded-xl overflow-hidden bg-brand-600/30 shrink-0 flex items-center justify-center">
            <img v-if="auth.user?.image" :src="auth.user.image" :alt="auth.user?.name" class="w-full h-full object-cover" />
            <span v-else class="text-sm font-bold">{{ auth.user?.name?.[0]?.toUpperCase() }}</span>
          </div>
          <Transition name="fade">
            <div v-if="sidebarOpen" class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white truncate">{{ auth.user?.name }}</p>
              <p class="text-xs text-white/40 truncate">{{ auth.user?.email }}</p>
            </div>
          </Transition>
          <Transition name="fade">
            <LogOut v-if="sidebarOpen" class="w-4 h-4 text-white/30 group-hover:text-rose-400 shrink-0 transition-colors" />
          </Transition>
        </div>
      </div>
    </aside>

    <!-- Mobile backdrop -->
    <Transition name="fade">
      <div
        v-if="sidebarOpen && isMobile"
        class="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- ── MAIN AREA ─────────────────────────────────────────────── -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
      <!-- Top bar -->
      <header class="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-white/[0.08] glass-card shrink-0">
        <!-- Mobile hamburger -->
        <button class="btn-icon lg:hidden" @click="sidebarOpen = !sidebarOpen">
          <Menu class="w-5 h-5" />
        </button>

        <div class="flex-1 min-w-0">
          <h1 class="font-display font-bold text-white text-lg truncate">{{ currentTitle }}</h1>
          <p class="text-white/40 text-xs hidden sm:block">{{ currentDate }}</p>
        </div>

        <!-- Balance pill (desktop) -->
        <div
          v-if="auth.isAuthenticated && quickBalance !== null"
          class="hidden md:flex items-center gap-2 glass-card rounded-2xl px-4 py-2 border"
          :class="quickBalance >= 0 ? 'border-emerald-500/20' : 'border-rose-500/20'"
        >
          <span class="text-white/40 text-xs">Saldo total</span>
          <span class="font-bold text-sm" :class="quickBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'">
            {{ formatCompact(quickBalance) }}
          </span>
        </div>

        <!-- Quick add (desktop) -->
        <button
          class="btn-primary text-sm py-2 px-4 hidden sm:flex items-center gap-2 shrink-0"
          @click="showTxModal = true"
        >
          <Plus class="w-4 h-4" />
          Nova Transação
        </button>
        <NuxtLink
          to="/settings"
          class="btn-icon shrink-0"
          title="Configurações"
        >
          <Settings class="w-5 h-5" />
        </NuxtLink>
        <button
          class="flex items-center gap-2 rounded-2xl border border-rose-500/30 px-3 sm:px-4 py-2 text-sm font-semibold text-rose-400 transition-all hover:border-rose-400 hover:bg-rose-500/10 shrink-0"
          title="Terminar sessão"
          @click="handleSignOut"
        >
          <LogOut class="w-4 h-4" />
          <span class="hidden sm:inline">Sair</span>
        </button>
      </header>

      <!-- Page content — extra bottom padding on mobile for nav bar -->
      <main class="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6">
        <NuxtPage />
      </main>
    </div>

    <!-- ── MOBILE BOTTOM NAV ────────────────────────────────────── -->
    <MobileNav @add="showTxModal = true" />

    <!-- ── GLOBAL TRANSACTION MODAL ───────────────────────────── -->
    <TransactionModal
      v-if="showTxModal"
      @close="showTxModal = false"
      @saved="onSaved"
    />
  </div>
</template>

<script setup lang="ts">
import {
  Home, ArrowLeftRight, BarChart3, Settings,
  LogOut, Menu, Plus, Brain, Layers, ChevronLeft,
} from 'lucide-vue-next'
import { format } from 'date-fns'
import { pt }     from 'date-fns/locale'

const auth    = useAuthStore()
const finance = useFinanceStore()
const toast   = useToastStore()
const route   = useRoute()
const { width }        = useWindowSize()
const { formatCompact } = useFormatters()

const sidebarOpen  = ref(false)
const showTxModal  = ref(false)
const isMobile     = computed(() => width.value < 1024)
const quickBalance = ref<number | null>(null)

onMounted(() => {
  sidebarOpen.value = window.innerWidth >= 1024
})
watch(isMobile, v => { sidebarOpen.value = !v })

const navItems = [
  { path: '/',             label: 'Dashboard',    icon: Home },
  { path: '/transactions', label: 'Transações',   icon: ArrowLeftRight },
  { path: '/groups',       label: 'Grupos',       icon: Layers },
  { path: '/stats',        label: 'Estatísticas', icon: BarChart3 },
  { path: '/predictions',  label: 'Previsões IA', icon: Brain },
  { path: '/settings',     label: 'Configurações', icon: Settings },
]

function isActive(path: string) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}

const currentTitle = computed(() => navItems.find(n => isActive(n.path))?.label || 'FinanceFlow')
const currentDate  = computed(() =>
  format(new Date(), "EEEE, dd 'de' MMMM", { locale: pt })
)

async function onSaved() {
  showTxModal.value = false
  toast.success('Transação adicionada! ✅')
  await finance.fetchTransactions({ page: 1 })
  await refreshBalance()
}

async function refreshBalance() {
  if (!auth.isAuthenticated) {
    quickBalance.value = null
    return
  }
  try {
    const s = await $fetch<any>('/api/stats/overview', { params: { months: 1 } })
    quickBalance.value = s.overview?.currentBalance ?? null
  } catch { /* silent */ }
}

async function handleSignOut() {
  quickBalance.value = null
  showTxModal.value = false
  await auth.signOut()
}

onMounted(refreshBalance)
</script>
