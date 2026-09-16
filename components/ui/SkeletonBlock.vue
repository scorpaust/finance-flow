<template>
  <div class="skeleton" :class="roundedClass" />
</template>

<script setup lang="ts">
// Generaliza o padrão de loading já usado em vários pontos da app (KpiCard,
// tabelas de /stats e /transactions) — antes cada sítio repetia
// `<div class="skeleton h-X w-Y rounded" />` à mão; isto só nomeia o
// padrão, mantém a mesma classe `.skeleton` (assets/css/main.css). Uso:
// `<SkeletonBlock class="h-8 w-36" />`, ou `rounded="full"` para avatares.
const props = withDefaults(
  defineProps<{ rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full' }>(),
  { rounded: 'md' }
)

const ROUNDED_MAP = {
  sm: 'rounded-sm',
  md: 'rounded',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
} as const

const roundedClass = computed(() => ROUNDED_MAP[props.rounded])
</script>
