<template>
  <nav class="fixed bottom-0 inset-x-0 z-40 lg:hidden glass-card border-t border-white/[0.08]" style="padding-bottom: env(safe-area-inset-bottom, 0px)">
    <div class="flex items-center justify-around px-1 pt-2 pb-1">
      <NuxtLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-200"
        :class="isActive(item.path) ? 'text-brand-400 bg-brand-600/20' : 'text-white/40'"
      >
        <component :is="item.icon" class="w-5 h-5 shrink-0" />
        <span class="text-[10px] font-medium">{{ item.label }}</span>
      </NuxtLink>

      <button
        class="flex flex-col items-center gap-1 px-3 py-1.5"
        @click="$emit('add')"
      >
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center -mt-6 shadow-glow border-4 border-surface-900">
          <Plus class="w-5 h-5 text-white" />
        </div>
        <span class="text-[10px] font-medium text-white/40">Novo</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { Home, ArrowLeftRight, Layers, Settings, Plus } from 'lucide-vue-next'
defineEmits(['add'])
const route = useRoute()
const navItems = [
  { path: '/',             label: 'Início',     icon: Home },
  { path: '/transactions', label: 'Transações', icon: ArrowLeftRight },
  { path: '/groups',       label: 'Grupos',     icon: Layers },
  { path: '/settings',     label: 'Config',     icon: Settings },
]
function isActive(path: string) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}
</script>
