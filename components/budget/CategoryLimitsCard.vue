<template>
  <div v-if="rows.length" class="glass-card rounded-3xl p-5" data-testid="category-limits">
    <h3 class="font-semibold text-white">{{ t('categoryLimits.title') }}</h3>
    <p class="text-white/40 text-xs mt-0.5 mb-4">{{ t('categoryLimits.subtitle') }}</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div v-for="r in rows" :key="r.id" class="bg-surface-700/30 rounded-2xl p-3" data-testid="category-limit-row">
        <div class="flex items-center justify-between gap-2">
          <p class="text-white text-sm font-medium truncate">{{ r.icon }} {{ r.name }}</p>
          <p class="text-xs shrink-0" :class="r.pct >= 100 ? 'text-rose-400' : 'text-white/50'">{{ Math.round(r.pct) }}%</p>
        </div>
        <p class="text-white/40 text-xs mt-0.5">{{ t('categoryLimits.spent', { spent: formatCurrency(r.spent), limit: formatCurrency(r.limit) }) }}</p>
        <div class="progress-bar h-1.5 mt-2">
          <div
            class="h-full rounded-full"
            :style="{ width: Math.min(100, r.pct) + '%', background: r.pct >= 100 ? '#f43f5e' : r.pct >= 80 ? '#eab308' : r.color }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Upgrade 04 — os limites das categorias (preenchidos pelo orçamento sugerido,
// `monthlyLimit`) com o gasto deste mês. Só aparece se alguma categoria tiver limite.
const { t } = useI18n()
const { formatCurrency } = useFormatters()

interface Row { id: string; name: string; icon: string; color: string; limit: number; spent: number; pct: number }
const rows = ref<Row[]>([])

async function load() {
  const now = new Date()
  const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  try {
    const [categories, stats] = await Promise.all([
      $fetch<any[]>('/api/categories', { params: { type: 'expense' } }),
      $fetch<any>('/api/stats/categories', { params: { type: 'expense', startDate } }),
    ])
    const spentById = new Map<string, number>()
    for (const c of stats?.byCategory || []) spentById.set(String(c.categoryId), (spentById.get(String(c.categoryId)) || 0) + c.total)
    rows.value = categories
      .filter((c) => (c.monthlyLimit || 0) > 0)
      .map((c) => {
        const spent = spentById.get(String(c._id)) || 0
        return { id: c._id, name: c.name, icon: c.icon, color: c.color, limit: c.monthlyLimit, spent, pct: (spent / c.monthlyLimit) * 100 }
      })
      .sort((a, b) => b.pct - a.pct)
  } catch {
    rows.value = []
  }
}

onMounted(load)
defineExpose({ reload: load })
</script>
