<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex items-start justify-between flex-wrap gap-4">
      <div>
        <button
          class="btn-secondary text-sm py-2 px-4 mb-4 flex items-center gap-2"
          type="button"
          @click="router.push('/')"
        >
          <ArrowLeft class="w-4 h-4" />
          {{ t('common.backToDashboard') }}
        </button>
        <h2 class="font-display font-bold text-2xl text-white flex items-center gap-2">
          <span>🤖</span> {{ t('predictions.title') }}
        </h2>
        <p class="text-white/40 text-xs mt-1">{{ t('predictions.subtitle') }}</p>
      </div>
      <button
        v-if="isTraining"
        class="btn-secondary text-sm flex items-center gap-2"
        type="button"
        @click="cancelPrediction"
      >
        {{ t('predictions.cancel') }}
      </button>
      <button
        :disabled="isTraining"
        class="btn-primary text-sm flex items-center gap-2"
        @click="runPrediction"
      >
        <Brain v-if="!isTraining" class="w-4 h-4" />
        <Loader2 v-else class="w-4 h-4 animate-spin" />
        {{ isTraining ? t('predictions.training') : t('predictions.runPrediction') }}
      </button>
    </div>

    <!-- Model info banner -->
    <div class="glass-card rounded-3xl p-4 border border-brand-500/20">
      <div class="flex flex-wrap items-center gap-4">
        <div class="w-10 h-10 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center shrink-0">
          <Cpu class="w-5 h-5 text-brand-400" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-white">{{ t('predictions.modelName') }}</p>
          <p class="text-white/40 text-xs mt-0.5">
            {{ t('predictions.modelDescription') }}
          </p>
        </div>
        <div class="flex gap-3 flex-wrap">
          <div class="text-center">
            <p class="text-brand-400 font-bold text-sm">{{ historicalMonths }}</p>
            <p class="text-white/30 text-xs">{{ t('predictions.monthsOfData') }}</p>
          </div>
          <div class="text-center" v-if="result">
            <p class="text-emerald-400 font-bold text-sm">{{ (result.confidence * 100).toFixed(0) }}%</p>
            <p class="text-white/30 text-xs">{{ t('predictions.confidence') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Training progress -->
    <Transition name="slide-up">
      <div v-if="isTraining" class="glass-card rounded-3xl p-6 border border-brand-500/30">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 rounded-xl bg-brand-600/30 flex items-center justify-center">
            <Loader2 class="w-4 h-4 text-brand-400 animate-spin" />
          </div>
          <div>
            <p class="text-white font-semibold text-sm">{{ statusMsg || t('predictions.trainingModel') }}</p>
            <p class="text-white/40 text-xs">
              {{ progress > 0 ? t('predictions.epoch', { current: Math.round(progress / 100 * 48), total: 48 }) : t('predictions.initializing') }}
            </p>
          </div>
          <p class="ml-auto text-brand-400 font-bold">{{ progress }}%</p>
        </div>
        <div class="progress-bar h-3">
          <div
            class="progress-fill h-full transition-all duration-500"
            :style="{ width: progress + '%' }"
          />
        </div>
        <div class="grid grid-cols-4 gap-2 mt-4">
          <div
            v-for="step in trainingSteps"
            :key="step.label"
            class="rounded-xl p-2.5 text-center transition-all duration-500"
            :class="progress >= step.threshold ? 'bg-brand-600/20 border border-brand-500/30' : 'bg-surface-700/30'"
          >
            <p class="text-base">{{ step.icon }}</p>
            <p class="text-xs text-white/50 mt-0.5">{{ step.label }}</p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Results -->
    <template v-if="result && !isTraining">
      <!-- Forecast cards -->
      <div>
        <h3 class="font-semibold text-white mb-3 flex items-center gap-2">
          <TrendingUp class="w-4 h-4 text-brand-400" />
          {{ t('predictions.forecastTitle', { months: result.forecasts.length }) }}
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            v-for="(f, i) in result.forecasts"
            :key="f.month"
            class="glass-card rounded-3xl p-5 border transition-all duration-300 hover:border-brand-500/40"
            :class="i === 0 ? 'border-brand-500/30' : 'border-white/10'"
          >
            <div class="flex items-center justify-between mb-4">
              <p class="text-white/60 text-sm font-medium capitalize">{{ formatMonthYear(f.month) }}</p>
              <span
                class="text-xs px-2 py-0.5 rounded-full font-semibold"
                :class="i === 0 ? 'bg-brand-600/30 text-brand-300' : 'bg-surface-600/50 text-white/40'"
              >
                {{ i === 0 ? t('predictions.next') : t('predictions.inMonths', { months: (i as number) + 1 }) }}
              </span>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs text-white/40">{{ t('predictions.income') }}</span>
                <span class="text-emerald-400 font-bold text-sm">{{ formatCompact(f.income.value) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-white/40">{{ t('predictions.expense') }}</span>
                <span class="text-rose-400 font-bold text-sm">{{ formatCompact(f.expense.value) }}</span>
              </div>
              <div class="border-t border-white/[0.08] pt-2 flex justify-between items-center">
                <span class="text-xs text-white/40">{{ t('predictions.balance') }}</span>
                <span class="font-bold" :class="f.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                  {{ formatCurrency(f.balance) }}
                </span>
              </div>
              <div class="text-xs text-white/25 text-right">
                {{ t('predictions.confidenceInterval', { lower: formatCompact(f.income.lower), upper: formatCompact(f.income.upper) }) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Forecast chart -->
      <div class="chart-wrapper">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h3 class="font-semibold text-white">{{ t('predictions.historyForecastTitle') }}</h3>
            <p class="text-white/40 text-xs mt-0.5">{{ t('predictions.historyForecastSubtitle') }}</p>
          </div>
          <div class="flex gap-2 text-xs text-white/50">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-1 rounded-sm bg-emerald-400 inline-block" />{{ t('predictions.legendIncome') }}</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-1 rounded-sm bg-rose-400 inline-block" />{{ t('predictions.legendExpense') }}</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-1 rounded-sm border-b-2 border-dashed border-brand-400 inline-block" />{{ t('predictions.legendForecast') }}</span>
          </div>
        </div>
        <ForecastChart :historical="historicalData" :forecasts="result.forecasts" />
      </div>

      <!-- Trends + Insights -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Trend indicators -->
        <div class="glass-card rounded-3xl p-6">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2">
            <Activity class="w-4 h-4 text-brand-400" /> {{ t('predictions.trendsTitle') }}
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-surface-700/50 rounded-2xl p-4">
              <p class="text-white/40 text-xs mb-2">{{ t('predictions.income') }}</p>
              <div class="flex items-center gap-2">
                <TrendingUp v-if="result.trend.income === 'up'" class="w-5 h-5 text-emerald-400" />
                <TrendingDown v-else-if="result.trend.income === 'down'" class="w-5 h-5 text-rose-400" />
                <Minus v-else class="w-5 h-5 text-white/40" />
                <span
                  class="text-sm font-bold capitalize"
                  :class="{
                    'text-emerald-400': result.trend.income === 'up',
                    'text-rose-400': result.trend.income === 'down',
                    'text-white/60': result.trend.income === 'stable',
                  }"
                >
                  {{ trendLabel(result.trend.income) }}
                </span>
              </div>
            </div>
            <div class="bg-surface-700/50 rounded-2xl p-4">
              <p class="text-white/40 text-xs mb-2">{{ t('predictions.expense') }}</p>
              <div class="flex items-center gap-2">
                <TrendingDown v-if="result.trend.expense === 'down'" class="w-5 h-5 text-emerald-400" />
                <TrendingUp v-else-if="result.trend.expense === 'up'" class="w-5 h-5 text-rose-400" />
                <Minus v-else class="w-5 h-5 text-white/40" />
                <span
                  class="text-sm font-bold capitalize"
                  :class="{
                    'text-emerald-400': result.trend.expense === 'down',
                    'text-rose-400': result.trend.expense === 'up',
                    'text-white/60': result.trend.expense === 'stable',
                  }"
                >
                  {{ trendLabel(result.trend.expense) }}
                </span>
              </div>
            </div>
          </div>
          <div class="mt-4 bg-surface-700/30 rounded-2xl p-4">
            <p class="text-white/50 text-xs font-medium mb-1">{{ t('predictions.modelUsed') }}</p>
            <p class="text-brand-400 font-semibold text-sm">{{ result.modelType }}</p>
            <p class="text-white/30 text-xs mt-1">
              {{ t('predictions.confidenceBasedOn', { pct: (result.confidence * 100).toFixed(0), months: historicalMonths }) }}
            </p>
          </div>
        </div>

        <!-- AI Insights -->
        <div class="glass-card rounded-3xl p-6">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2">
            <Lightbulb class="w-4 h-4 text-yellow-400" /> {{ t('predictions.insightsTitle') }}
          </h3>
          <div class="space-y-3">
            <div
              v-for="(insight, i) in result.insights"
              :key="i"
              class="flex items-start gap-3 bg-surface-700/30 rounded-2xl p-3.5 animate-slide-up"
              :style="{ animationDelay: (i as number) * 0.1 + 's' }"
            >
              <span class="text-lg shrink-0">{{ insight.split(' ')[0] }}</span>
              <p class="text-white/70 text-sm leading-relaxed">{{ insight.substring(insight.indexOf(' ') + 1) }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Empty / initial state -->
    <div v-else-if="!isTraining" class="glass-card rounded-3xl p-12 text-center">
      <div class="text-6xl mb-4 animate-bounce-subtle">🧠</div>
      <h3 class="font-semibold text-white text-lg mb-2">{{ t('predictions.emptyTitle') }}</h3>
      <p class="text-white/40 text-sm mb-6 max-w-md mx-auto">
        {{ t('predictions.emptyDescription') }}
      </p>
      <button class="btn-primary flex items-center gap-2 mx-auto" @click="runPrediction">
        <Brain class="w-4 h-4" /> {{ t('predictions.startPrediction') }}
      </button>
      <p class="text-white/20 text-xs mt-4">{{ t('predictions.emptyHint') }}</p>
    </div>

    <PaywallModal
      v-if="showPaywall"
      required-tier="premium"
      :feature-label="t('predictions.paywallFeatureLabel')"
      @close="showPaywall = false"
    />
  </div>
</template>

<script setup lang="ts">
import {
  Brain, Loader2, Cpu, TrendingUp, TrendingDown, Minus,
  Activity, Lightbulb, ArrowLeft,
} from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

const router = useRouter()
const { t } = useI18n()
const { formatCurrency, formatCompact, formatMonthYear } = useFormatters()
const ml = useMLPrediction()
const isTraining = ml.isTraining   // top-level ref so Vue auto-unwraps in template
const progress   = ml.progress
const statusMsg  = ml.statusMsg
const toast = useToastStore()
const sub = useSubscription()
const showPaywall = ref(false)

const result = ref<any>(null)
const historicalData = ref<any[]>([])
const historicalMonths = ref(0)
const predictionRunId = ref(0)

const trainingSteps = computed(() => [
  { icon: '📊', label: t('predictions.stepData'), threshold: 10 },
  { icon: '🏗️', label: t('predictions.stepModel'), threshold: 25 },
  { icon: '⚡', label: t('predictions.stepTraining'), threshold: 50 },
  { icon: '🎯', label: t('predictions.stepForecast'), threshold: 90 },
])

function trendLabel(trend: string) {
  return { up: t('predictions.trendUp'), down: t('predictions.trendDown'), stable: t('predictions.trendStable') }[trend] || trend
}

async function runPrediction() {
  if (!sub.hasFeature('predictions')) {
    showPaywall.value = true
    return
  }

  const runId = ++predictionRunId.value
  try {
    const data = await $fetch<any>('/api/predictions/data', { params: { months: 12 } })
    historicalData.value = data.monthlySeries
    historicalMonths.value = data.monthlySeries.length

    if (historicalMonths.value < 2) {
      toast.error(t('predictions.toastMinData'))
      return
    }

    const timeout = new Promise((resolve) => {
      setTimeout(() => resolve({ timedOut: true }), 90000)
    })
    const prediction = await Promise.race([
      ml.predictNextMonths(data.monthlySeries, 3),
      timeout,
    ]) as any

    if (runId !== predictionRunId.value) return

    if (prediction?.timedOut) {
      ml.cancelTraining()
      toast.error(t('predictions.toastTimeout'))
      return
    }

    result.value = prediction
    if (ml.error.value) {
      toast.warning(t('predictions.toastFallback', { error: ml.error.value }))
      ml.error.value = null
    } else {
      toast.success(t('predictions.toastSuccess'))
    }
  } catch (e: any) {
    ml.cancelTraining()
    toast.error(e?.message || t('predictions.toastError'))
  }
}

function cancelPrediction() {
  predictionRunId.value++
  ml.cancelTraining()
  toast.info(t('predictions.toastCanceled'))
}
</script>
