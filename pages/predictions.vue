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
          Voltar ao dashboard
        </button>
        <h2 class="font-display font-bold text-2xl text-white flex items-center gap-2">
          <span>🤖</span> Previsões com IA
        </h2>
        <p class="text-white/40 text-xs mt-1">Modelo ConvNeXt-1D treinado com os teus dados históricos</p>
      </div>
      <button
        v-if="isTraining"
        class="btn-secondary text-sm flex items-center gap-2"
        type="button"
        @click="cancelPrediction"
      >
        Cancelar
      </button>
      <button
        :disabled="isTraining"
        class="btn-primary text-sm flex items-center gap-2"
        @click="runPrediction"
      >
        <Brain v-if="!isTraining" class="w-4 h-4" />
        <Loader2 v-else class="w-4 h-4 animate-spin" />
        {{ isTraining ? 'A treinar...' : 'Executar Previsão' }}
      </button>
    </div>

    <!-- Model info banner -->
    <div class="glass-card rounded-3xl p-4 border border-brand-500/20">
      <div class="flex flex-wrap items-center gap-4">
        <div class="w-10 h-10 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center shrink-0">
          <Cpu class="w-5 h-5 text-brand-400" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-white">ConvNeXt-1D Financial Forecaster</p>
          <p class="text-white/40 text-xs mt-0.5">
            Convoluções 1D depthwise-separáveis + Layer Normalization + Residual connections
            — Inspirado na arquitetura ConvNeXt adaptada para séries temporais financeiras
          </p>
        </div>
        <div class="flex gap-3 flex-wrap">
          <div class="text-center">
            <p class="text-brand-400 font-bold text-sm">{{ historicalMonths }}</p>
            <p class="text-white/30 text-xs">meses de dados</p>
          </div>
          <div class="text-center" v-if="result">
            <p class="text-emerald-400 font-bold text-sm">{{ (result.confidence * 100).toFixed(0) }}%</p>
            <p class="text-white/30 text-xs">confiança</p>
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
            <p class="text-white font-semibold text-sm">{{ statusMsg || 'A treinar modelo...' }}</p>
            <p class="text-white/40 text-xs">
              {{ progress > 0 ? `Epoch ${Math.round(progress / 100 * 48)}/48` : 'A inicializar...' }}
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
          Previsão para os próximos {{ result.forecasts.length }} meses
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
                {{ i === 0 ? 'Próximo' : `+${(i as number) + 1} meses` }}
              </span>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs text-white/40">Receitas</span>
                <span class="text-emerald-400 font-bold text-sm">{{ formatCompact(f.income.value) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-white/40">Despesas</span>
                <span class="text-rose-400 font-bold text-sm">{{ formatCompact(f.expense.value) }}</span>
              </div>
              <div class="border-t border-white/[0.08] pt-2 flex justify-between items-center">
                <span class="text-xs text-white/40">Saldo</span>
                <span class="font-bold" :class="f.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                  {{ formatCurrency(f.balance) }}
                </span>
              </div>
              <div class="text-xs text-white/25 text-right">
                IC: [{{ formatCompact(f.income.lower) }} – {{ formatCompact(f.income.upper) }}]
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Forecast chart -->
      <div class="chart-wrapper">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h3 class="font-semibold text-white">Histórico + Previsão</h3>
            <p class="text-white/40 text-xs mt-0.5">Dados reais vs projeção do modelo</p>
          </div>
          <div class="flex gap-2 text-xs text-white/50">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-1 rounded-sm bg-emerald-400 inline-block" />Receitas</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-1 rounded-sm bg-rose-400 inline-block" />Despesas</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-1 rounded-sm border-b-2 border-dashed border-brand-400 inline-block" />Previsão</span>
          </div>
        </div>
        <ForecastChart :historical="historicalData" :forecasts="result.forecasts" />
      </div>

      <!-- Trends + Insights -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Trend indicators -->
        <div class="glass-card rounded-3xl p-6">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2">
            <Activity class="w-4 h-4 text-brand-400" /> Tendências Detetadas
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-surface-700/50 rounded-2xl p-4">
              <p class="text-white/40 text-xs mb-2">Receitas</p>
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
              <p class="text-white/40 text-xs mb-2">Despesas</p>
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
            <p class="text-white/50 text-xs font-medium mb-1">Modelo utilizado</p>
            <p class="text-brand-400 font-semibold text-sm">{{ result.modelType }}</p>
            <p class="text-white/30 text-xs mt-1">
              Confiança: {{ (result.confidence * 100).toFixed(0) }}% — baseado em {{ historicalMonths }} meses de dados
            </p>
          </div>
        </div>

        <!-- AI Insights -->
        <div class="glass-card rounded-3xl p-6">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2">
            <Lightbulb class="w-4 h-4 text-yellow-400" /> Insights da IA
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
      <h3 class="font-semibold text-white text-lg mb-2">Pronto para prever o futuro?</h3>
      <p class="text-white/40 text-sm mb-6 max-w-md mx-auto">
        O modelo ConvNeXt-1D vai analisar os teus dados históricos e gerar previsões
        de receitas e despesas para os próximos 3 meses.
      </p>
      <button class="btn-primary flex items-center gap-2 mx-auto" @click="runPrediction">
        <Brain class="w-4 h-4" /> Iniciar Previsão IA
      </button>
      <p class="text-white/20 text-xs mt-4">Precisas de pelo menos 3 meses de dados</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Brain, Loader2, Cpu, TrendingUp, TrendingDown, Minus,
  Activity, Lightbulb, ArrowLeft,
} from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

const router = useRouter()
const { formatCurrency, formatCompact, formatMonthYear } = useFormatters()
const ml = useMLPrediction()
const isTraining = ml.isTraining   // top-level ref so Vue auto-unwraps in template
const progress   = ml.progress
const statusMsg  = ml.statusMsg
const toast = useToastStore()

const result = ref<any>(null)
const historicalData = ref<any[]>([])
const historicalMonths = ref(0)
const predictionRunId = ref(0)

const trainingSteps = [
  { icon: '📊', label: 'Dados', threshold: 10 },
  { icon: '🏗️', label: 'Modelo', threshold: 25 },
  { icon: '⚡', label: 'Treino', threshold: 50 },
  { icon: '🎯', label: 'Previsão', threshold: 90 },
]

function trendLabel(t: string) {
  return { up: 'Crescente', down: 'Decrescente', stable: 'Estável' }[t] || t
}

async function runPrediction() {
  const runId = ++predictionRunId.value
  try {
    const data = await $fetch<any>('/api/predictions/data', { params: { months: 12 } })
    historicalData.value = data.monthlySeries
    historicalMonths.value = data.monthlySeries.length

    if (historicalMonths.value < 2) {
      toast.error('Precisas de pelo menos 2 meses de dados para fazer previsões')
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
      toast.error('O treino demorou demasiado. Tenta novamente mais tarde.')
      return
    }

    result.value = prediction
    if (ml.error.value) {
      toast.warning(`Modelo IA falhou — a usar previsão linear. (${ml.error.value})`)
      ml.error.value = null
    } else {
      toast.success('Previsão concluída! 🎯')
    }
  } catch (e: any) {
    ml.cancelTraining()
    toast.error(e?.message || 'Erro na previsão')
  }
}

function cancelPrediction() {
  predictionRunId.value++
  ml.cancelTraining()
  toast.info('Treino cancelado')
}
</script>
