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
| **Estatísticas** | Gráficos Bar/Area/Donut/Horizontal + tabela mensal + totais por período + distribuição/quartis (Pro+) |
| **Previsões IA** | ConvNeXt-1D (TensorFlow.js, browser) — previsão 3 meses c/ intervalos confiança (Premium) |
| **Subscrições** | Planos Gratuito/Pro (5€)/Premium (12,99€) via EasyPay — Cartão/Débito Direto (auto-renovação real), MB WAY e Multibanco (pagamento único de 1/3/6/12 meses) — ver [Subscrições](#-subscrições-easypay-cartãodd--mb-way--multibanco) |
| **Insights com IA** | Interpretação de estatísticas (Pro+) e dicas de investimento educativas por perfil de risco (Premium), via Anthropic — ver [Insights com IA](#-insights-com-ia) |
| **Exportar CSV** | Download de transações filtradas (Pro+) |
| **PWA** | Instalável, offline-ready, manifest completo |
| **App Android nativa** | Empacotada com Capacitor, mesmo código-base — ver [App Android Nativa](#-app-android-nativa-capacitor) |
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
Capacitor       (app Android nativa a partir do mesmo código-base)
EasyPay REST API (Checkout — subscrições, Cartão/Débito Direto/MB WAY/Multibanco)
@easypaypt/checkout-sdk (formulário de pagamento embutido, client-side)
Anthropic API   (claude-haiku-4-5 — interpretação de estatísticas e dicas de investimento)
Twelve Data API (snapshot diário de mercados globais para as dicas de investimento)
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

### Variáveis de ambiente

`npm run dev` funciona sem mais nada além de `MONGODB_URI`. As funcionalidades
pagas (subscrições, insights com IA) precisam de variáveis adicionais —
ver `.env.example` e a descrição de cada uma em
[`context/CONFIG-REFERENCE.md`](context/CONFIG-REFERENCE.md):

| Grupo | Variáveis |
|---|---|
| Subscrições (EasyPay) | `EASYPAY_ENV`, `EASYPAY_ACCOUNT_ID`, `EASYPAY_API_KEY`, `SUBSCRIPTION_RENEWAL_REMINDER_DAYS`, `CRON_SECRET` |
| Insights com IA | `ANTHROPIC_API_KEY`, `TWELVE_DATA_API_KEY` |

Utilizadores existentes sem o campo `subscription` (pré-Fase-2) podem ser
migrados para o plano `free` com:
```bash
npm run migrate:subscriptions
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
│   │                              CategoryDonut, HorizontalBar, ForecastChart,
│   │                              DistributionHistogram, CategoryBoxplot
│   │                              + ChartSkeleton, ChartEmpty
│   ├── forms/TransactionModal  ← Criar / editar transação
│   ├── insights/                ← StatsInsightCard (interpretação IA, Pro+)
│   ├── layout/MobileNav        ← Bottom nav PWA mobile
│   ├── subscription/           ← PaywallModal, UpsellBanner
│   └── ui/                     ← KpiCard, TransactionRow, ToastContainer
├── composables/
│   ├── useFormatters.ts        ← Moeda, datas, percentagens (PT-PT)
│   ├── useMLPrediction.ts      ← ConvNeXt-1D TF.js (client-only)
│   ├── usePlatform.ts          ← isNative/isAndroid/isWeb (Capacitor)
│   └── useSubscription.ts      ← tier, hasFeature(key), paywall
├── layouts/default.vue         ← Sidebar + topbar + mobile nav
├── middleware/auth.global.ts   ← Proteção de rotas (client-only)
├── pages/
│   ├── index.vue               ← Dashboard
│   ├── login.vue               ← Email + password (login / registo)
│   ├── transactions/           ← Lista, filtros, paginação, exportar CSV (Pro+)
│   ├── groups/                 ← Gestão de grupos, orçamentos + drawer de detalhe (Pro+)
│   ├── stats/                  ← Gráficos + tabela mensal + interpretação IA (Pro+)
│   ├── predictions.vue         ← UI de treino IA + forecast (Premium)
│   ├── subscription/           ← Planos, checkout EasyPay embutido, /return (polling pós-pagamento)
│   ├── investimento/           ← Perfil de investidor + dicas educativas IA (Premium)
│   └── settings/               ← Perfil + gestão de categorias
├── plugins/
│   ├── chartjs.client.ts             ← Registo global Chart.js (dark theme)
│   ├── init.client.ts                ← Init auth store
│   └── capacitor-back-button.client.ts ← Botão "voltar" Android
├── server/
│   ├── api/
│   │   ├── auth, transactions, categories, groups   ← CRUD base
│   │   ├── stats/          ← overview, categories, advanced (Pro+)
│   │   ├── predictions/    ← dados agregados para o modelo ML
│   │   ├── subscription/   ← estado, checkout/webhook EasyPay, cron de expiração
│   │   ├── insights/       ← stats.post (Pro+), investment.post (Premium),
│   │   │                      market-snapshot.post (cron diário)
│   │   └── investor-profile/  ← questionário de perfil de investidor (GET/POST)
│   ├── models/index.ts     ← Mongoose: User (+ subscription, investorProfile),
│   │                          Category, TransactionGroup, Transaction,
│   │                          MarketSnapshot, AiInsightCache
│   ├── plugins/mongoose.ts ← Ligação MongoDB via Nitro plugin
│   └── utils/
│       ├── auth.ts              ← requireAuth, sanitizeId
│       ├── requireFeature.ts    ← enforcement server-side por tier (403 se bloqueado)
│       ├── easypay.ts           ← wrapper Checkout API (Cartão/DD/MB WAY/Multibanco)
│       ├── subscriptionSync.ts  ← lógica partilhada webhook + confirmação client-side
│       ├── anthropic.ts         ← wrapper Messages API (structured outputs)
│       ├── marketData.ts        ← wrapper Twelve Data Quote API
│       └── investorProfile.ts   ← validade do perfil (renovação anual)
├── shared/features.ts          ← Fonte única da matriz de features por tier
├── stores/                     ← Pinia: auth, finance, groups, subscription, toast
├── types/index.ts               ← TypeScript types + constantes
├── scripts/
│   ├── seed.mjs                    ← 12 meses de dados de teste
│   └── migrate-subscriptions.mjs   ← dá tier 'free' a utilizadores pré-Fase-2
├── android/                     ← Projeto nativo gerado pelo Capacitor (ver secção própria)
├── capacitor.config.ts
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

## 💳 Subscrições (EasyPay: Cartão/DD + MB WAY + Multibanco)

Três planos — **Gratuito**, **Pro** (5,00 €/mês) e **Premium** (12,99 €/mês)
— com um único processador (EasyPay), expondo quatro métodos de pagamento ao
utilizador via um único fluxo de Checkout:

- **Cartão / Débito Direto** → subscrição nativa EasyPay com auto-renovação
  real todos os meses (`billingMode: 'auto'`).
- **MB WAY / Multibanco** → pagamento único de um período fixo (1/3/6/12
  meses), sem cobrança automática — nenhum dos dois métodos suporta
  renovação recorrente sem ação manual do cliente a cada ciclo. A subscrição
  expira e faz downgrade para `free` se não houver renovação manual antes do
  fim do período.

O Checkout da EasyPay **não redireciona para fora da app** — o pacote
client-side [`@easypaypt/checkout-sdk`](https://github.com/Easypay/checkout-sdk)
recebe o manifest devolvido por `POST /checkout` e embebe o formulário de
pagamento diretamente na página (`pages/subscription/index.vue`). Como a
EasyPay não consegue entregar webhooks a um servidor sem endereço público
(ex. `localhost` em desenvolvimento), a confirmação do pagamento tem dois
caminhos que partilham a mesma lógica idempotente
(`server/utils/subscriptionSync.ts`): o webhook (`server/api/subscription/
easypay/webhook.post.ts`, fonte de verdade em produção) e uma chamada direta
do client logo após o `onSuccess` do SDK (`.../confirm.post.ts`). Existe
ainda um botão "Verificar pagamento" (`.../check-payment.post.ts`) para o
utilizador confirmar manualmente um MB WAY/Multibanco `pending`, sem esperar
pelo webhook.

A matriz de features por plano vive num único sítio,
[`shared/features.ts`](shared/features.ts) (`FEATURE_MATRIX`, `hasFeature()`),
partilhado entre client e servidor:

- **Client**: `useSubscription()` expõe `tier`/`hasFeature(key)` para UI e
  paywalls (`PaywallModal`, `UpsellBanner`).
- **Servidor (obrigatório)**: `requireFeature(event, key)` em
  `server/utils/requireFeature.ts` — devolve `403` se o tier não chegar,
  independentemente do que o client mostra. Esconder no client é UX;
  bloquear no server é a segurança real.

Detalhe completo da arquitetura, decisões e fluxos em
[`context/features/02-FASE-2-sistema-subscricoes.md`](context/features/02-FASE-2-sistema-subscricoes.md).

---

## 🧠 Insights com IA

Duas secções geradas por Anthropic (`claude-haiku-4-5`, respostas JSON
estruturadas via `output_config.format`) a partir dos dados financeiros do
utilizador — nunca a partir de descrições de transações em bruto, só
agregados já calculados no servidor:

- **Interpretação de estatísticas** (`/stats`, Pro e Premium) — 2-3 insights
  e 1-2 sugestões sobre os padrões de despesa, com cache de 24h por
  utilizador (`AiInsightCache`) para controlar custo.
- **Dicas de investimento educativas** (`/investimento`, exclusivo Premium)
  — combina um questionário de perfil de investidor (renovado anualmente)
  com um snapshot diário de mercados globais (Twelve Data,
  `MarketSnapshot`, partilhado por todos os utilizadores Premium, nunca
  pedido por utilizador). **Nunca recomenda ativos/tickers específicos** —
  secção estritamente educativa por perfil de risco, com disclaimer fixo
  ("não é aconselhamento financeiro") sempre visível, por decisão de
  produto face ao risco regulatório (CMVM).

Detalhe completo em
[`context/features/03-FASE-3-insights-ia.md`](context/features/03-FASE-3-insights-ia.md).

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
com `server.cleartext`/`android.allowMixedContent` **sempre `false` por
default** (URL de produção é HTTPS) — só ficam `true` quando
`CAPACITOR_SERVER_URL` é explicitamente definido para testar contra um
servidor de desenvolvimento local (ver "Testar num dispositivo físico via
USB" abaixo). O `webDir` (`.output/public`, gerado por `nuxi generate`) fica
apenas como fallback offline mínimo, não como fonte principal.

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

### Testar num dispositivo físico via USB

Para ver a app Android nativa a carregar o dev server local (`npm run dev`)
num telemóvel físico ligado por cabo, em vez do domínio de produção:

```bash
# 1. Dev server acessível por IPv4 (adb reverse liga-se a 127.0.0.1, não a ::1)
npm run dev -- --host 0.0.0.0

# 2. Telemóvel com Depuração USB ativa e autorizado (adb devices → "device")
adb reverse tcp:3000 tcp:3000

# 3. Sync (Bash/PowerShell, tanto faz)
CAPACITOR_SERVER_URL=http://localhost:3000 npx cap sync android

# 4. Build — no Windows, a partir do PowerShell nativo (gradlew.bat não
#    resolve corretamente a partir do Git Bash)
cd android
.\gradlew.bat assembleDebug
adb install -r app\build\outputs\apk\debug\app-debug.apk
adb shell am start -n com.financeflow.app/.MainActivity
```

Isto ativa automaticamente `cleartext`/`allowMixedContent` em
`capacitor.config.ts` (condicional a `CAPACITOR_SERVER_URL` estar definido —
nunca liga no URL de produção por default). **Falta ainda** ativar
`android:usesCleartextTraffic="true"` manualmente em
`android/app/src/main/AndroidManifest.xml` — não é gerado a partir do
`capacitor.config.ts`, e **tem de voltar a `"false"` antes de qualquer build
de release** (ver aviso em "Permissões" abaixo).

Problemas comuns: ligação USB instável (`adb kill-server && adb start-server`
+ reautorizar no telemóvel), `npx cap run android` falha a validar
dispositivos físicos reais mesmo aparecendo em `cap run android --list`
(contornar com o fluxo manual acima), `JAVA_HOME` a apontar para um JDK mais
antigo do que o exigido pelos plugins Capacitor.

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
`server.url`) e `android:usesCleartextTraffic` que **deve estar `"false"`**
em qualquer build de release (URL de produção é sempre HTTPS).

> ⚠️ **Estado atual do repositório**: este valor está temporariamente
> `"true"` — foi ligado para testar a app num dispositivo físico via USB
> (ver secção acima) e ainda não foi revertido. Confirmar e repor `"false"`
> antes de gerar qualquer build de release/Play Store (ver também
> `context/current-feature.md`).

---

## 📝 Licença

MIT
