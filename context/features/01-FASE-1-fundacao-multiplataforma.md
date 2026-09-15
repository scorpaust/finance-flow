# FASE 1 — Fundação Multiplataforma (Web + Android)

> Pré-requisito: ler `00-CODE-SPEC.md`. Objetivo desta fase: tornar o mesmo
> código-base capaz de correr como app web (já funciona, manter SSR) e como
> app Android nativa empacotada com Capacitor, sem duplicar lógica.

## Objetivo

No fim desta fase deve ser possível:
- `npm run dev` → app web como hoje (sem regressões).
- `npm run build:android` → gera um APK/AAB instalável num emulador/dispositivo
  Android, com login, dashboard, transações e gráficos funcionais.

## Contexto técnico importante

A app usa sessão via cookie `httpOnly`. Dentro de uma WebView Capacitor isto
pode falhar se o `webDir` local não corresponder ao domínio do backend
(cookies de terceiros). **Decisão recomendada**: usar `server.url` no
`capacitor.config.ts` a apontar para o domínio de produção/staging já
publicado (a app Android carrega a app web real dentro do shell nativo, tal
como uma PWA "instalada"). Isto evita reescrever a autenticação nesta fase.
Registar esta decisão no README; se no futuro se quiser um modo 100% offline
nativo, isso implica migrar para autenticação por token — não fazer agora,
fora de âmbito.

## Tarefas

### 1. Setup Capacitor
- [ ] Instalar `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`
- [ ] `npx cap init` — `appId` sugerido: `com.financeflow.app`, `appName`:
      `FinanceFlow`
- [ ] Criar `capacitor.config.ts` com:
  - `webDir` a apontar para a build estática (fallback offline mínimo) **ou**
    `server.url` para o domínio de produção (ver decisão acima) + `server.cleartext: false`
  - `android.allowMixedContent: false`
- [ ] `npx cap add android`

### 2. Scripts de build
- [ ] Adicionar ao `package.json`:
  - `build:web` — build SSR atual (sem alterações)
  - `build:android:assets` — `nuxi generate` (build estática, usada como
    fallback local do shell Capacitor)
  - `cap:sync` — `cap sync android`
  - `build:android` — encadeia os dois anteriores
- [ ] Documentar os scripts no `README.md`

### 3. Deteção de plataforma
- [ ] Criar composable `usePlatform()` que expõe `isNative`, `isAndroid`,
      `isWeb` usando `Capacitor.isNativePlatform()` / `Capacitor.getPlatform()`
- [ ] Usar este composable onde o comportamento tiver de diferir (ex.:
      esconder prompts de instalação PWA quando já é nativo, ajustar
      navegação/back button Android)

### 4. Back button Android
- [ ] Registar listener `App.addListener('backButton', ...)` (plugin
      `@capacitor/app`) para navegar para trás na stack de rotas Nuxt em vez
      de fechar a app na página inicial

### 5. Ícones e splash screen
- [ ] Gerar ícone adaptativo Android e splash screen a partir do logo/branding
      atual (usar `@capacitor/assets` ou equivalente)
- [ ] Cor de fundo do splash consistente com `surface-900` (`#0f0f23`)

### 6. Permissões e manifest Android
- [ ] Rever `AndroidManifest.xml` gerado: `INTERNET` (necessário), remover
      permissões não usadas
- [ ] Definir `android:usesCleartextTraffic="false"`

### 7. Validar TensorFlow.js na WebView
- [ ] Confirmar que o treino/inferência do modelo ConvNeXt-1D corre sem
      crashes na WebView Android (testar em emulador com pelo mens 4GB RAM)
- [ ] Se o backend WebGL do TF.js não for suportado de forma estável, cair
      para backend `cpu` explicitamente quando `isNative` for verdadeiro
      (documentar a diferença de performance esperada)

### 8. Viewport e comportamento mobile nativo
- [ ] Confirmar `viewport-fit=cover` no `<head>` (necessário também para a
      Fase 3, safe areas)
- [ ] Desativar zoom por pinch onde fizer sentido para UX tipo app nativa

## Fora de âmbito nesta fase
- Sistema de subscrições (Fase 2)
- Redesign visual (Fase 3)
- Publicação na Play Store (Fase 5)

## Critérios de aceitação
- [ ] Build web continua a funcionar sem regressões (`npm run dev`, `npm run build`)
- [ ] App corre em emulador Android: login, dashboard, listagem de transações,
      criação de transação e um gráfico em `/stats` funcionam
- [ ] Botão físico/gesto "voltar" do Android navega corretamente
- [ ] Sem erros no `adb logcat` relacionados com cookies/CORS/mixed content
- [ ] Documentação da decisão de arquitetura (server.url vs. build estática)
      registada no README
