// Registo do Chart.js e defaults do tema escuro. Importado (só por efeito)
// pelos componentes de components/charts/ — antes era um plugin global, o que
// punha o Chart.js no bundle inicial de todas as páginas, incluindo o login.
// O boxplot regista-se à parte em CategoryBoxplot.vue (só a página de
// estatísticas o usa).
import {
  Chart,
  CategoryScale, LinearScale,
  PointElement, LineElement,
  BarElement, ArcElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js'
Chart.register(
  CategoryScale, LinearScale,
  PointElement, LineElement,
  BarElement, ArcElement,
  Title, Tooltip, Legend, Filler,
)

// Global Chart.js dark-mode defaults
Chart.defaults.color            = 'rgba(255,255,255,0.4)'
Chart.defaults.borderColor      = 'rgba(255,255,255,0.06)'
Chart.defaults.font.family      = 'Inter, system-ui, sans-serif'
Chart.defaults.font.size        = 12
Chart.defaults.plugins.legend.display = false
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(19,19,43,0.95)'
Chart.defaults.plugins.tooltip.borderColor      = 'rgba(255,255,255,0.1)'
Chart.defaults.plugins.tooltip.borderWidth      = 1
Chart.defaults.plugins.tooltip.titleColor       = 'rgba(255,255,255,0.7)'
Chart.defaults.plugins.tooltip.bodyColor        = '#ffffff'
Chart.defaults.plugins.tooltip.padding          = 12
Chart.defaults.plugins.tooltip.cornerRadius     = 12

