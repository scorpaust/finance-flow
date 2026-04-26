<template>
  <div class="min-h-screen bg-surface-900">
    <!-- Global loading screen -->
    <div
      v-if="auth.loading"
      class="fixed inset-0 z-[200] flex items-center justify-center auth-bg"
    >
      <div class="flex flex-col items-center gap-4 animate-fade-in">
        <div class="w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center neon-brand animate-bounce-subtle">
          <span class="text-3xl">💹</span>
        </div>
        <div class="flex gap-1.5">
          <div v-for="i in 3" :key="i"
            class="w-2 h-2 rounded-full bg-brand-400 animate-bounce"
            :style="{ animationDelay: (i - 1) * 0.15 + 's' }"
          />
        </div>
        <p class="text-white/30 text-sm font-medium">A carregar...</p>
      </div>
    </div>

    <NuxtPage v-else />
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()

// Fetch session on client mount
onMounted(() => auth.fetchSession())
</script>
