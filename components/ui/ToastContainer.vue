<template>
  <Teleport to="body">
    <div class="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 items-end">
      <TransitionGroup name="toast-anim">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="toast cursor-pointer"
          :class="toastClasses(toast.type)"
          @click="toastStore.remove(toast.id)"
        >
          <span class="text-lg shrink-0">{{ toastIcon(toast.type) }}</span>
          <p class="text-sm font-medium text-white flex-1">{{ toast.message }}</p>
          <button class="text-white/30 hover:text-white shrink-0 transition-colors">
            <X class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'

const toastStore = useToastStore()

function toastIcon(type: string) {
  return { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }[type] || '📢'
}

function toastClasses(type: string) {
  return {
    success: 'border-emerald-500/40 shadow-glow-emerald',
    error: 'border-rose-500/40 shadow-glow-rose',
    info: 'border-brand-500/40 shadow-glow-sm',
    warning: 'border-yellow-500/40',
  }[type] || ''
}
</script>

<style scoped>
.toast-anim-enter-active { animation: slideInRight 0.3s ease-out; }
.toast-anim-leave-active { animation: slideInRight 0.3s ease-out reverse; }
.toast-anim-move { transition: transform 0.3s ease; }
</style>
