<template>
  <div class="h-full w-full flex flex-col justify-end gap-1 px-2 pb-6 pt-4">
    <div class="flex items-end gap-2 h-full">
      <div
        v-for="(h, i) in heights"
        :key="i"
        class="skeleton flex-1 rounded-t-md"
        :style="{ height: h + '%', animationDelay: (i * 0.07) + 's' }"
      />
    </div>
    <div class="flex gap-2 mt-2">
      <div v-for="i in 8" :key="i" class="skeleton flex-1 h-3 rounded" :style="{ animationDelay: (i * 0.05) + 's' }" />
    </div>
  </div>
</template>
<script setup lang="ts">
const heights = [45, 62, 55, 78, 48, 85, 60, 70, 52, 80, 65, 90]
</script>
