/**
 * useMLPrediction — ConvNeXt-1D for financial time-series forecasting
 * Client-only (TensorFlow.js runs in the browser).
 * Architecture: depthwise-separable Conv1D + LayerNorm + Residual (ConvNeXt-style)
 */
export function useMLPrediction() {
  const isTraining  = ref(false)
  const progress    = ref(0)
  const ready       = ref(false)
  const error       = ref<string | null>(null)
  const statusMsg   = ref<string | null>(null)
  const cancelRequested = ref(false)

  // ─── Normalisation helpers ───────────────────────────────────────────────
  function normalize(data: number[]) {
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    return { normalized: data.map(v => (v - min) / range), min, max }
  }
  function denormalize(v: number, min: number, max: number) {
    return v * (max - min) + min
  }

  // ─── Sliding-window sequences ────────────────────────────────────────────
  function makeSequences(data: number[], seqLen: number) {
    const X: number[][][] = []
    const y: number[][]   = []
    for (let i = 0; i + seqLen + 1 <= data.length; i++) {
      X.push(data.slice(i, i + seqLen).map(v => [v]))
      y.push([data[i + seqLen]])
    }
    return { X, y }
  }

  // ─── Build ConvNeXt-1D model ─────────────────────────────────────────────
  function buildModel(tf: any, seqLen: number) {
    const inp = tf.input({ shape: [seqLen, 1] })

    // Block 1: large-kernel depthwise-style conv
    let x = tf.layers.conv1d({ filters: 32, kernelSize: 7, padding: 'same', activation: 'relu' }).apply(inp)
    x = tf.layers.layerNormalization().apply(x)
    // Point-wise expansion (ConvNeXt inverted bottleneck)
    x = tf.layers.conv1d({ filters: 128, kernelSize: 1, activation: 'relu' }).apply(x)
    x = tf.layers.conv1d({ filters: 32,  kernelSize: 1 }).apply(x)
    x = tf.layers.dropout({ rate: 0.1 }).apply(x)

    // Block 2 + residual
    let x2 = tf.layers.conv1d({ filters: 32, kernelSize: 5, padding: 'same', activation: 'relu' }).apply(x)
    x2 = tf.layers.layerNormalization().apply(x2)
    x2 = tf.layers.conv1d({ filters: 128, kernelSize: 1, activation: 'relu' }).apply(x2)
    x2 = tf.layers.conv1d({ filters: 32,  kernelSize: 1 }).apply(x2)
    x2 = tf.layers.add().apply([x, x2])   // residual

    // Head
    let out = tf.layers.globalAveragePooling1d().apply(x2)
    out = tf.layers.dense({ units: 64, activation: 'relu' }).apply(out)
    out = tf.layers.dropout({ rate: 0.1 }).apply(out)
    out = tf.layers.dense({ units: 1 }).apply(out)

    const model = tf.model({ inputs: inp, outputs: out as any })
    model.compile({ optimizer: tf.train.adam(0.002), loss: 'meanSquaredError' })
    return model
  }

  // ─── Main forecast function ──────────────────────────────────────────────
  async function predictNextMonths(
    monthlySeries: Array<{ month: string; income: number; expense: number; balance: number }>,
    forecastMonths = 3
  ) {
    if (typeof window === 'undefined') {
      return simpleForecast(monthlySeries, forecastMonths)
    }

    cancelRequested.value = false
    isTraining.value = true
    progress.value   = 0
    error.value      = null
    statusMsg.value  = 'A carregar TF.js...'

    try {
      // Dynamic import — keeps TF.js out of SSR bundle
      const tf = await import('@tensorflow/tfjs')
      statusMsg.value = 'A inicializar backend...'
      await tf.ready()
      statusMsg.value = 'A treinar modelo...'

      const EPOCHS  = 24
      const SEQ_LEN = Math.min(6, Math.max(3, monthlySeries.length - 2))

      if (monthlySeries.length < SEQ_LEN + 2) {
        return simpleForecast(monthlySeries, forecastMonths)
      }

      const results: Record<string, Array<{ value: number; lower: number; upper: number }>> = {}

      for (const [ki, key] of (['income', 'expense'] as const).entries()) {
        const raw = monthlySeries.map(m => m[key])
        const { normalized, min, max } = normalize(raw)
        const { X, y } = makeSequences(normalized, SEQ_LEN)

        if (X.length < 2) {
          results[key] = simpleForecastSeries(raw, forecastMonths)
          continue
        }

        const xT = tf.tensor3d(X)
        const yT = tf.tensor2d(y)
        const model = buildModel(tf, SEQ_LEN)

        await model.fit(xT, yT, {
          epochs:          EPOCHS,
          batchSize:       Math.min(8, X.length),
          shuffle:         true,
          validationSplit: X.length >= 10 ? 0.1 : 0,
          callbacks: {
            onEpochEnd: (epoch: number) => {
              if (cancelRequested.value) {
                model.stopTraining = true
                return
              }
              // 0-50% for income, 50-100% for expense
              progress.value = Math.round(((ki * EPOCHS + epoch + 1) / (2 * EPOCHS)) * 100)
            },
          },
        })

        if (cancelRequested.value) {
          xT.dispose(); yT.dispose(); model.dispose()
          return simpleForecast(monthlySeries, forecastMonths)
        }

        // Multi-step rollout
        let seq = normalized.slice(-SEQ_LEN)
        const preds: number[] = []
        for (let i = 0; i < forecastMonths; i++) {
          const inp  = tf.tensor3d([seq.map(v => [v])])
          const pred = model.predict(inp) as any
          const val  = (await pred.data())[0] as number
          preds.push(val)
          seq = [...seq.slice(1), val]
          inp.dispose()
          pred.dispose()
        }

        const CI = 0.1
        results[key] = preds.map((p, i) => {
          const v = Math.max(0, denormalize(p, min, max))
          return {
            value: v,
            lower: Math.max(0, v * (1 - CI * (i + 1))),
            upper: v * (1 + CI * (i + 1)),
          }
        })

        xT.dispose(); yT.dispose(); model.dispose()
      }

      // Build forecast array
      const last       = monthlySeries[monthlySeries.length - 1]?.month || ''
      const [ly, lm]   = last.split('-').map(Number)
      const forecasts  = Array.from({ length: forecastMonths }, (_, i) => {
        const d  = new Date(ly, lm + i)
        const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const inc = results.income?.[i]  ?? { value: 0, lower: 0, upper: 0 }
        const exp = results.expense?.[i] ?? { value: 0, lower: 0, upper: 0 }
        return { month: mk, income: inc, expense: exp, balance: inc.value - exp.value }
      })

      const incSlope = linearSlope(monthlySeries.slice(-4).map(m => m.income))
      const expSlope = linearSlope(monthlySeries.slice(-4).map(m => m.expense))

      ready.value = true
      return {
        forecasts,
        trend: {
          income:  incSlope > 0.04 ? 'up' : incSlope < -0.04 ? 'down' : 'stable',
          expense: expSlope > 0.04 ? 'up' : expSlope < -0.04 ? 'down' : 'stable',
        },
        insights:    generateInsights(forecasts, monthlySeries, incSlope, expSlope),
        confidence:  parseFloat(Math.min(0.95, 0.72 + monthlySeries.length * 0.018).toFixed(2)),
        modelType:   'ConvNeXt-1D (TensorFlow.js)',
      }
    } catch (e: any) {
      error.value = e?.message || 'Prediction failed'
      return simpleForecast(monthlySeries, forecastMonths)
    } finally {
      isTraining.value = false
      statusMsg.value  = null
    }
  }

  function cancelTraining() {
    cancelRequested.value = true
    isTraining.value = false
    progress.value   = 0
    statusMsg.value  = null
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────
  function simpleForecastSeries(
    values: number[],
    n: number
  ): Array<{ value: number; lower: number; upper: number }> {
    const avg = values.slice(-3).reduce((s, v) => s + v, 0) / Math.min(3, values.length)
    return Array.from({ length: n }, (_, i) => ({
      value: avg,
      lower: avg * (0.88 - i * 0.03),
      upper: avg * (1.12 + i * 0.03),
    }))
  }

  function simpleForecast(series: any[], n: number) {
    const last3 = series.slice(-3)
    const avgI  = last3.reduce((s: number, m: any) => s + m.income,  0) / (last3.length || 1)
    const avgE  = last3.reduce((s: number, m: any) => s + m.expense, 0) / (last3.length || 1)
    const last  = series[series.length - 1]?.month || ''
    const [ly, lm] = last.split('-').map(Number)
    return {
      forecasts: Array.from({ length: n }, (_, i) => {
        const d  = new Date(ly, lm + i)
        const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        return {
          month:   mk,
          income:  { value: avgI, lower: avgI * 0.87, upper: avgI * 1.13 },
          expense: { value: avgE, lower: avgE * 0.87, upper: avgE * 1.13 },
          balance: avgI - avgE,
        }
      }),
      trend:      { income: 'stable' as const, expense: 'stable' as const },
      insights:   ['Dados insuficientes para o modelo ConvNeXt. A usar média dos últimos meses.'],
      confidence: 0.58,
      modelType:  'LinearAverage (fallback)',
    }
  }

  function linearSlope(values: number[]): number {
    if (values.length < 2) return 0
    const n     = values.length
    const xMean = (n - 1) / 2
    const yMean = values.reduce((s, v) => s + v, 0) / n
    const num   = values.reduce((s, v, i) => s + (i - xMean) * (v - yMean), 0)
    const den   = values.reduce((s, _, i) => s + (i - xMean) ** 2, 0)
    const slope = den === 0 ? 0 : num / den
    return yMean === 0 ? 0 : slope / yMean
  }

  function generateInsights(
    forecasts: any[],
    history: any[],
    incSlope: number,
    expSlope: number
  ): string[] {
    const insights: string[] = []
    const nextBal   = forecasts[0]?.balance ?? 0
    const avgBal    = history.slice(-3).reduce((s, m) => s + m.balance, 0) / 3
    const avgInc    = history.slice(-3).reduce((s, m) => s + m.income,  0) / 3
    const savRate   = avgInc > 0 ? avgBal / avgInc : 0

    if (nextBal < 0)
      insights.push('⚠️ Défice previsto no próximo mês. Considera reduzir despesas.')
    else if (nextBal > avgBal * 1.2)
      insights.push('📈 O modelo prevê melhoria significativa no saldo.')

    if (expSlope > 0.05)
      insights.push('📊 Despesas em tendência crescente nos últimos meses.')
    if (expSlope < -0.04)
      insights.push('✅ Despesas em queda — bom controlo financeiro!')
    if (incSlope > 0.05)
      insights.push('💹 Rendimentos com tendência positiva.')
    if (incSlope < -0.05)
      insights.push('⚠️ Rendimentos em queda. Verifica fontes de receita.')

    if (savRate < 0.1)
      insights.push('💡 Taxa de poupança abaixo dos 10%. Otimiza despesas fixas.')
    else if (savRate > 0.3)
      insights.push('🌟 Taxa de poupança excelente! Padrão financeiro muito saudável.')

    if (insights.length === 0)
      insights.push('✅ Padrão financeiro estável. Continua com o bom trabalho!')

    return insights
  }

  return { predictNextMonths, cancelTraining, isTraining, progress, statusMsg, ready, error }
}
