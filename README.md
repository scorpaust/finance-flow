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

## 🤖 App Android Nativa (Capacitor)

O mesmo código-base Nuxt corre também como app Android nativa, empacotada com
[Capacitor](https://capacitorjs.com), sem duplicar lógica de negócio.

### Arquitetura: `server.url` em vez de build estática local

A app usa sessão via cookie `httpOnly`. Se a WebView Android carregasse os
ficheiros estáticos locais (`webDir`), o domínio não corresponderia ao do
backend e o cookie seria tratado como de terceiros — quebrando o login.

**Decisão**: `capacitor.config.ts` usa `server.url` a apontar para o domínio
de produção/staging já publicado da app web. A app Android é, na prática, um
shell nativo que carrega a app web real (semelhante a uma PWA "instalada"),
com `server.cleartext: false` e `android.allowMixedContent: false`. O
`webDir` (`.output/public`, gerado por `nuxi generate`) fica apenas como
fallback offline mínimo, não como fonte principal.

Se no futuro se quiser um modo 100% offline nativo, isso implica migrar a
autenticação de cookie `httpOnly` para token (ex.: JWT em storage seguro) —
fora de âmbito da Fase 1.

Define o domínio real antes de gerar builds de produção, via variável de
ambiente `CAPACITOR_SERVER_URL` (ou editando diretamente `capacitor.config.ts`):

```bash
CAPACITOR_SERVER_URL=https://app.financeflow.com npx cap sync android
```

### Scripts

| Script | Descrição |
|---|---|
| `npm run build:web` | Build SSR normal (produção web, sem alterações) |
| `npm run build:android:assets` | `nuxi generate` — build estática usada como fallback local do shell Capacitor |
| `npm run cap:sync` | `cap sync android` — copia assets web + plugins nativos para o projeto Android |
| `npm run build:android` | Encadeia os dois anteriores |
| `npm run cap:open:android` | Abre o projeto no Android Studio |

### Fluxo de desenvolvimento

```bash
npm run build:android      # gera .output/public + sincroniza com o projeto Android
npm run cap:open:android   # abre o Android Studio
# Correr num emulador/dispositivo a partir do Android Studio (Run ▶)
```

### Deteção de plataforma

O composable [`usePlatform()`](composables/usePlatform.ts) expõe `isNative`,
`isAndroid` e `isWeb` (via `Capacitor.isNativePlatform()` /
`Capacitor.getPlatform()`), usado para diferenciar comportamento entre web e
app nativa (ex.: backend TensorFlow.js, navegação).

### Botão "voltar" Android

[`plugins/capacitor-back-button.client.ts`](plugins/capacitor-back-button.client.ts)
regista um listener (`@capacitor/app`) que navega para trás na stack de rotas
Nuxt; na página inicial, minimiza a app em vez de a fechar.

### TensorFlow.js na WebView

O backend WebGL do TF.js pode não ser estável em todas as WebViews Android
(risco de crash de contexto GL em dispositivos com pouca RAM). Em app nativa
(`isNative`), [`useMLPrediction.ts`](composables/useMLPrediction.ts) força o
backend `cpu` — mais lento a treinar, mas fiável. Na web mantém-se o backend
automático (normalmente WebGL).

### Ícones e splash screen

Gerados a partir de `assets/icon-*.svg` e `assets/splash.svg` (fundo
`surface-900` `#0f0f23`) via `@capacitor/assets`:

```bash
npx capacitor-assets generate --android
```

### Permissões

`AndroidManifest.xml` gerado apenas com `INTERNET` (necessária para
`server.url`) e `android:usesCleartextTraffic="false"` definido
explicitamente.

---

## 📝 Licença

MIT
