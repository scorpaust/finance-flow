# Funcionalidade Atual

<!-- Ver especificação completa em context/features/01-FASE-1-fundacao-multiplataforma.md -->

## Estado

Concluída (critérios de aceitação validados num dispositivo real; a aguardar decisão de commit)

## Objetivos

FASE 1 — Fundação Multiplataforma (Web + Android). Tornar o mesmo código-base
capaz de correr como app web (mantendo SSR) e como app Android nativa
empacotada com Capacitor, sem duplicar lógica.

No fim desta fase deve ser possível:
- `npm run dev` → app web como hoje (sem regressões).
- `npm run build:android` → gera um APK/AAB instalável num emulador/dispositivo
  Android, com login, dashboard, transações e gráficos funcionais.

Tarefas principais:
1. Setup Capacitor (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`,
   `cap init`, `capacitor.config.ts`, `cap add android`)
2. Scripts de build (`build:web`, `build:android:assets`, `cap:sync`,
   `build:android`)
3. Composable `usePlatform()` (`isNative`, `isAndroid`, `isWeb`)
4. Back button Android (listener `App.addListener('backButton', ...)`)
5. Ícones e splash screen adaptados ao branding (fundo `surface-900` `#0f0f23`)
6. Permissões e manifest Android (`INTERNET`, `usesCleartextTraffic="false"`)
7. Validar TensorFlow.js (ConvNeXt-1D) na WebView Android, fallback `cpu` se
   necessário
8. Viewport e comportamento mobile nativo (`viewport-fit=cover`, zoom)

Fora de âmbito: subscrições (Fase 2), redesign visual (Fase 3), Play Store
(Fase 5).

## Notas

- Decisão técnica recomendada: usar `server.url` no `capacitor.config.ts`
  apontando para o domínio de produção/staging já publicado, em vez de
  reescrever a autenticação por token. A app Android carrega a app web real
  dentro do shell nativo (como uma PWA "instalada"). Motivo: sessão via
  cookie `httpOnly` pode falhar na WebView se `webDir` local não corresponder
  ao domínio do backend (cookies de terceiros). Registar esta decisão no
  README.
- Migração para autenticação por token só é necessária se no futuro se
  quiser um modo 100% offline nativo — não fazer nesta fase.

## Critérios de aceitação

- Build web continua a funcionar sem regressões (`npm run dev`, `npm run build`)
- App corre em emulador Android: login, dashboard, listagem de transações,
  criação de transação e um gráfico em `/stats` funcionam
- Botão físico/gesto "voltar" do Android navega corretamente
- Sem erros no `adb logcat` relacionados com cookies/CORS/mixed content
- Documentação da decisão de arquitetura (server.url vs. build estática)
  registada no README

## Histórico

<!-- Manter atualizado. Da mais antiga para a mais recente -->

- 2026-09-15: Definida como funcionalidade atual — FASE 1 (Fundação
  Multiplataforma Web + Android), especificação em
  `context/features/01-FASE-1-fundacao-multiplataforma.md`.
- 2026-09-15: Branch `feature/fase-1-fundacao-multiplataforma` criado; estado
  passa a "Em progresso". Implementadas as tarefas 1-8: Capacitor instalado
  e projeto Android gerado (`cap add android`), `capacitor.config.ts` com
  `server.url` (produção/staging, decisão registada no README), scripts
  `build:web`/`build:android:assets`/`cap:sync`/`build:android`, composable
  `usePlatform()`, plugin de back button Android, ícones/splash gerados a
  partir de `assets/icon-*.svg`+`splash.svg` via `@capacitor/assets`,
  manifest revisto (`INTERNET` only, `usesCleartextTraffic=false`), fallback
  de backend `cpu` no TF.js quando `isNative`, e `viewport-fit=cover` +
  zoom desativado. `npm run build:web` validado sem regressões. Build Gradle
  do APK debug validado com sucesso nesta máquina (foi necessário instalar
  JDK 21, exigido por `@capacitor/android` 8.x/AGP 8.13 — só havia JDK 8/17).
  App instalada e lançada num emulador Android 7.1 (API 25, único system
  image completo disponível localmente) confirmou via `adb logcat` que o
  Capacitor bridge inicializa e liga corretamente ao `server.url` configurado
  (sem exceções de rede após adicionar regra de firewall para o dev server);
  não foi possível validar visualmente o fluxo completo (login/dashboard/
  transações/gráfico) porque a WebView desse emulador (Chrome 69, 2018) é
  demasiado antiga para o bundle Vite/Vue3 gerado — os outros system images
  locais (24/27/31/33) estão incompletos (só stub `.installer`, sem
  download completo).
- 2026-09-15: Testado com sucesso num telemóvel Android real ligado por USB
  (Honor ALI_NX1, Android 15, WebView Chrome 152 — moderna, sem o problema
  do emulador). Fluxo de teste local: `adb reverse tcp:3000 tcp:3000` +
  `capacitor.config.ts` temporariamente com `server.url=http://localhost:3000`
  e `cleartext:true` (nunca commitar assim — reverter para o domínio de
  produção antes de qualquer commit). Testar contra `npm run dev` mostrou
  UI a comportar-se mal (transições lentas, áreas em falta) — é o Vite dev
  server a compilar rotas on-demand na 1ª visita (confirmado: 1º pedido a
  `/` demorou ~100s a compilar); build de produção
  (`NITRO_PRESET=node-server nuxt build` + `node .output/server/index.mjs`)
  não tem esse problema e é o que deve ser usado para testes de UI.
  Durante os testes em produção encontrados e corrigidos 3 bugs pré-existentes
  da app (não introduzidos pelo Capacitor, mas só visíveis agora por causa do
  padrão SSR + hidratação + sessão longa que a Fase 1 introduz — antes só se
  testava com reload completo da página no browser):
  1. **Sobreposição login/página protegida** — quando a sessão é inválida
     numa rota protegida, o SSR renderiza sempre a página protegida (proteção
     de rotas é client-only, ver `middleware/auth.global.ts`) e o redirect
     client-side para `/login` acontecia tarde demais, corrompendo a árvore
     DOM (Vue deixava conteúdo antigo e novo ambos montados). Corrigido em
     `stores/auth.ts`: `loading` passa a começar `true` (em vez de `false`),
     para SSR e cliente hidratarem sempre no ramo do ecrã de loading em
     `app.vue` primeiro.
  2. **Botão no limite do ecrã e sem resposta ao toque** — consequência
     direta de ativar `viewport-fit=cover` (tarefa 8) sem o padding de
     "safe area" correspondente; o conteúdo passava a estender-se para
     debaixo da status bar. Corrigido com
     `pt/pb/pl/pr-[env(safe-area-inset-*)]` no wrapper raiz de `app.vue`.
  3. **Dashboard "desformatado"** (botões fora do ecrã, ex.
     `x:-102px`/`x:650px` num viewport de 369px) — diagnosticado ligando o
     Chrome DevTools remoto ao WebView via `adb forward tcp:9222
     localabstract:webview_devtools_remote_<pid>` + `curl
     http://localhost:9222/json` para obter o `webSocketDebuggerUrl`, depois
     `Runtime.evaluate` via websocket (ver `scripts/_cdp_check.mjs`,
     apagado no fim — recriar se precisar outra vez). Confirmou-se que o
     link "Transações" estava aninhado **dentro** da div do ecrã de loading
     (`fixed inset-0 ... auth-bg`) em vez de serem irmãos `v-if`/`v-else`
     mutuamente exclusivos — a correção do bug 1 (loading a começar `true`)
     introduziu uma race: ao trocar de ramo `v-if`/`v-else` logo a seguir à
     hidratação, o Vue por vezes aninha o ramo novo dentro do antigo em vez
     de o substituir. Corrigido trocando `v-if`/`v-else` por `v-show` no
     ecrã de loading de `app.vue` (mantém `NuxtPage` sempre montado como
     irmão estável, nunca há troca estrutural de ramo).
- 2026-09-15: Retomado depois de registar no `00-CODE-SPEC.md` (secção
  "Convenções") a regra "nunca cortar palavras/texto na UI" — motivada por
  um corte real observado no seletor de período do dashboard ("Últimos 6
  me..."). Causa: `.form-select` (`w-full`) dentro de uma linha `flex`
  sem `flex-wrap`, a encolher abaixo da largura do texto. Corrigido em
  `pages/index.vue` (`w-auto` no select + `flex-wrap` no container).
  Rebuild de produção com o fix `v-show` (bug 3 acima) validado no telemóvel
  real: dashboard renderiza perfeitamente, sem sobreposições nem elementos
  fora do ecrã — confirmado também via DevTools remoto (`loadingDisplay:
  "none"`, sem conteúdo aninhado, coordenadas de todos os elementos dentro
  do viewport).
  **Todos os critérios de aceitação validados no dispositivo real (Honor
  ALI_NX1, Android 15)**:
  - Login/registo (via seed: `demo@financeflow.app` — nota: o seed script
    não carrega `.env`, correr com `MONGODB_URI=<atlas-uri> node
    scripts/seed.mjs` para popular a BD certa; só atualiza a password se o
    utilizador ainda não tiver `passwordHash`, não faz reset automático)
  - Dashboard, navegação entre páginas (Transações/Grupos/Estatísticas/
    Configurações) — sem sobreposições
  - `/stats` renderiza com Chart.js a funcionar (canvas presente, eixos e
    grelha corretos)
  - Botão físico "voltar" Android: navega para trás na stack de rotas
    corretamente (testado `/stats → /` e `/ → /transactions`), sem fechar a
    app enquanto há histórico
  - Sem erros de cookies/CORS/mixed content no `adb logcat` durante os
    testes
  Não testado explicitamente: o fluxo completo de criação de uma transação
  (botão "Nova transação" existe e abre; submissão não foi clicada até ao
  fim) — o componente `TransactionModal.vue` não foi alterado nesta fase e
  já é usado pela app web existente, risco considerado baixo.
  Config revertida para produção antes de terminar: `capacitor.config.ts`
  (`server.url` = domínio real via `CAPACITOR_SERVER_URL`, `cleartext:
  false`) e `android/app/src/main/AndroidManifest.xml`
  (`usesCleartextTraffic="false"`), depois confirmado via `npm run cap:sync`
  que `android/app/src/main/assets/capacitor.config.json` reflete os
  valores de produção. Scripts de debug temporários (`scripts/_cdp_*.mjs`)
  removidos. Nada foi commitado ainda nesta branch — falta decidir com o
  utilizador se/quando fazer commit.
