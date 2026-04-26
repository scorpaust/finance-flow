<template>
  <div class="min-h-screen auth-bg flex items-center justify-center p-6">
    <div class="text-center animate-scale-in">
      <div class="text-7xl mb-6 animate-bounce-subtle">{{ isNotFound ? '🔍' : '💥' }}</div>
      <h1 class="font-display font-bold text-5xl text-white mb-3">{{ error?.statusCode }}</h1>
      <p class="text-white/60 text-lg mb-2">{{ isNotFound ? 'Página não encontrada' : 'Algo correu mal' }}</p>
      <p class="text-white/30 text-sm mb-8 max-w-sm mx-auto">{{ error?.message }}</p>
      <div class="flex gap-3 justify-center">
        <button class="btn-secondary" @click="clearError({ redirect: '/' })">← Voltar</button>
        <NuxtLink to="/" class="btn-primary">Dashboard</NuxtLink>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number; message?: string } }>()
const isNotFound = computed(() => props.error?.statusCode === 404)
</script>
