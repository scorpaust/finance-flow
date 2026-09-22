<template>
  <div class="h-full flex flex-col items-center justify-center text-white/25 gap-2">
    <BarChart2 class="w-8 h-8" />
    <p class="text-sm">{{ t('charts.empty') }}</p>
  </div>
</template>
<script setup lang="ts">
import { BarChart2 } from 'lucide-vue-next'
const { t } = useI18n()
</script>
