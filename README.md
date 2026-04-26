# 💹 FinanceFlow — Finanças Pessoais com IA

PWA full-stack para gestão de finanças pessoais com previsões por deep learning.

---

## ✨ Funcionalidades

| Módulo | Detalhes |
|---|---|
| **Auth** | Email + password (scrypt) com cookie session `httpOnly` — autenticação local, sem OAuth |
| **Transações** | CRUD completo — tipo, valor, categoria, data, tags, recorrência, grupo, notas |
| **Categorias** | 14 categorias padrão + criação livre; todas editáveis e elimináveis |
| **Grupos** | Agrupamento de transações com teto mensal/semanal, alertas de percentagem, stats e drawer de detalhe |
| **Dashboard** | KPIs em tempo real, evolução do saldo, top categorias, transações recentes |
| **Estatísticas** | Gráficos Bar/Area/Donut/Horizontal + tabela mensal + totais por período |
| **Previsões IA** | ConvNeXt-1D (TensorFlow.js, browser) — previsão 3 meses c/ intervalos confiança |
| **Exportar CSV** | Download de transações filtradas |
| **PWA** | Instalável, offline-ready, manifest completo |
| **Responsivo** | Mobile-first, sidebar colapsável desktop, bottom nav mobile |

---

## 🏗️ Stack

```
Nuxt 3.x        (full-stack, SSR/SPA)
Vue 3 + TypeScript
Tailwind CSS    (glass morphism dark theme)
Chart.js        (via vue-chartjs, client-only)
TensorFlow.js   (ConvNeXt-1D, browser-only)
MongoDB         (Mongoose ODM)
Pinia           (state management)
date-fns v3     (formatação de datas)
VueUse          (useWindowSize, useDebounceFn)
lucide-vue-next (ícones)
@vite-pwa/nuxt  (PWA + Workbox)
```

---

## 🚀 Setup em 3 Passos

### Opção A — Docker (mais rápido)
```bash
cp .env.example .env
docker-compose up -d mongodb   # Só MongoDB
npm install && npm run dev     # Dev server
# OU
docker-compose up              # Tudo em produção
```

### Opção B — Local
```bash
# 1. Instalar
npm install

# 2. Configurar
cp .env.example .env
# Edita .env: MONGODB_URI se necessario

# 3. Arrancar
npm run dev   # → http://localhost:3000
```

### Popular com dados de exemplo (12 meses)
```bash
MONGODB_URI=mongodb://localhost:27017/financeflow node scripts/seed.mjs
# Cria uma conta no ecra de login
```

---

## 🔐 Autenticação

A app usa autenticação **local** — sem OAuth externo. Regista uma conta diretamente no ecrã de login com nome, email e password (mínimo 8 caracteres). A password é guardada em hash com `scrypt` e a sessão é mantida via cookie `httpOnly`.

---

## 📁 Estrutura

```
financeflow/
├── assets/css/main.css         ← Glass morphism, animações, dark theme
├── components/
│   ├── charts/                 ← BalanceChart, BarChart, AreaChart,
│   │                              CategoryDonut, HorizontalBar, ForecastChart
│   │                              + ChartSkeleton, ChartEmpty
│   ├── forms/TransactionModal  ← Criar / editar transação
│   ├── layout/MobileNav        ← Bottom nav PWA mobile
│   └── ui/                     ← KpiCard, TransactionRow, ToastContainer
├── composables/
│   ├── useFormatters.ts        ← Moeda, datas, percentagens (PT-PT)
│   └── useMLPrediction.ts      ← ConvNeXt-1D TF.js (client-only)
├── layouts/default.vue         ← Sidebar + topbar + mobile nav
├── middleware/auth.global.ts   ← Proteção de rotas (client-only)
├── pages/
│   ├── index.vue               ← Dashboard
│   ├── login.vue               ← Email + password (login / registo)
│   ├── transactions/           ← Lista, filtros, paginação, exportar CSV
│   ├── groups/                 ← Gestão de grupos, orçamentos + drawer de detalhe
│   ├── stats/                  ← Gráficos + tabela mensal
│   ├── predictions.vue         ← UI de treino IA + forecast
│   └── settings/               ← Perfil + gestão de categorias
├── plugins/
│   ├── chartjs.client.ts       ← Registo global Chart.js (dark theme)
│   └── init.client.ts          ← Init auth store
├── server/
│   ├── api/                    ← REST: auth, transactions, categories,
│   │                              groups, stats (overview+categories), predictions
│   ├── models/index.ts         ← Mongoose: User, Category, Transaction, Group
│   ├── plugins/mongoose.ts     ← Ligação MongoDB via Nitro plugin
│   └── utils/auth.ts           ← requireAuth, sanitizeId
├── stores/                     ← Pinia: auth, finance, groups, toast
├── types/index.ts              ← TypeScript types + constantes
├── scripts/
│   └── seed.mjs                ← 12 meses de dados de teste
├── docker-compose.yml
└── Dockerfile
```

---

## 🤖 Modelo IA — ConvNeXt-1D

```
Input: sequência mensal (N × 1)
  ↓
Block 1: Conv1D(32, kernel=7) → LayerNorm → Conv1D(128,1) → Conv1D(32,1) → Dropout
  ↓
Block 2: Conv1D(32, kernel=5) → LayerNorm → Conv1D(128,1) → Conv1D(32,1)
         + Residual Add
  ↓
GlobalAveragePooling1D → Dense(64,relu) → Dropout → Dense(1)
  ↓
Output: valor previsto (receita ou despesa)
```

- **Treino no browser** via TensorFlow.js (24 epochs, Adam lr=0.002)
- **Multi-step rollout** com janela deslizante para 3 meses
- **Intervalos de confiança** crescentes por horizonte
- **Fallback linear** se dados < 3 meses

---

## 🎨 Design System

| Token | Valor |
|---|---|
| Background | `#0f0f23` (surface-900) |
| Brand | `#6366f1` (indigo) |
| Income | `#34d399` (emerald-400) |
| Expense | `#fb7185` (rose-400) |
| Fonts | Inter (body) + Space Grotesk (headings) |
| Cards | `backdrop-blur-xl` + `rgba` borders + gradient background |
| Glows | `box-shadow` coloridos nos cards e botões activos |

---

## 📱 PWA

- Instalável em Android/iOS/Desktop
- Service Worker com Workbox (cache-first para assets)
- Funciona offline após primeiro carregamento
- Bottom navigation bar no mobile

---

## 📝 Licença

MIT
