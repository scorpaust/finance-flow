# UPGRADE 02 — Ecrã de arranque, barra de estado e otimização R8 (app 1.2.0)

> Pedido do utilizador (2026-10-07): "junta agora o 2 e 3 e cria para isso
> uma feature em context/features/upgrades". São duas das atualizações da
> app Android previstas para os testes fechados da Fase 9 (a Google valoriza
> 2–3 atualizações durante o teste). Os atalhos no ícone e as correções do
> feedback ficam para uma versão seguinte.

## Objetivo

A app passa a abrir e a mostrar-se como uma app nativa do tema escuro, e
fica mais pequena e mais rápida a arrancar. Tudo nativo: obriga a um `.aab`
novo, versão **1.2.0** (versionCode 5).

1. **Ecrã de arranque.**
   - Hoje é o ecrã genérico do Android 12+ (ícone num fundo claro),
     seguido de um fundo branco enquanto o site carrega.
   - Passa a ser o logótipo FinanceFlow no fundo escuro da app (`#0f0f23`),
     sem flash branco, até a app estar pronta.
2. **Barra de estado.**
   - Escura e integrada no tema, com ícones claros, também no Android 15+.
   - Com `targetSdk` 36, o Android 15+ impõe o modo edge-to-edge: a app
     desenha por baixo da barra e tem de respeitar as margens de segurança
     (safe area).
3. **Otimização R8.** O build de release passa a remover código e recursos
   não usados (`minifyEnabled`, `shrinkResources`), sem partir nada:
   - plugins do Capacitor;
   - Google Play Billing;
   - câmara;
   - biometria;
   - o ecrã sem internet.

## Decisões técnicas

Fontes: Context7, `/websites/capacitorjs`, consultado a 2026-10-07 (System
Bars, Splash Screen, Android troubleshooting / ProGuard).

### Ecrã de arranque

- API Splash Screen do Android 12+, já ligada ao tema
  `AppTheme.NoActionBarLaunch` (`Theme.SplashScreen` +
  `androidx.core:core-splashscreen`, que traz o mesmo ecrã para o Android
  7–11). Atributos novos no tema:
  - `windowSplashScreenBackground` `#0f0f23`;
  - `windowSplashScreenAnimatedIcon`: o primeiro plano do ícone da app;
  - `postSplashScreenTheme` → `AppTheme.NoActionBar`.
- Plugin `@capacitor/splash-screen`:
  - mantém o ecrã de arranque até o site estar desenhado; a app chama
    `SplashScreen.hide()` ao montar;
  - tem um limite (`launchShowDuration`) para nunca ficar preso. Sem
    internet, a página local `offline.html` não tem acesso aos plugins: o
    limite esconde o ecrã de arranque e mostra-a.
- `backgroundColor: '#0f0f23'` no `capacitor.config.ts`: fundo da WebView
  enquanto o site carrega, em vez de branco.

### Barra de estado

- Plugin **SystemBars**, já incluído no `@capacitor/core` 8 e pensado para
  edge-to-edge:
  - `style: 'DARK'` (ícones claros sobre fundo escuro);
  - `insetsHandling: 'css'`.
- O plugin injeta `--safe-area-inset-*`, porque as WebViews Android < 140 dão
  valores errados em `env(safe-area-inset-*)`. O CSS da app passa a usar
  `var(--safe-area-inset-top, env(safe-area-inset-top, 0px))` (e o mesmo
  nas outras margens).
- Retira-se o `@capacitor/status-bar`: instalado mas nunca usado, e é a API
  antiga, que o SystemBars substitui.

### R8

- No `build.gradle`, `release`:
  - `minifyEnabled true`;
  - `shrinkResources true`;
  - `proguard-android-optimize.txt`.
- **Regras de manutenção (keep):**
  - o Capacitor já traz regras para todas as classes com
    `@CapacitorPlugin` e `@PluginMethod` (o `PlayBillingPlugin` incluído) e
    para as que estendem `Plugin`;
  - a Play Billing Library traz as suas;
  - `proguard-rules.pro` acrescenta uma regra explícita para os plugins
    desta app (defesa contra uma regra das bibliotecas mudar).
- **Verificação:** o `mapping.txt` do R8 tem de mostrar
  `PlayBillingPlugin` e os seus métodos com os nomes originais, e o
  `.aab` tem de ficar mais pequeno.

## Tarefas

- [x] Tema do ecrã de arranque (cores, ícone, `postSplashScreenTheme`).
- [x] `@capacitor/splash-screen`, com a configuração e `hide()` quando a app
      monta (só na app nativa).
- [x] `backgroundColor` da WebView.
- [x] SystemBars no `capacitor.config.ts`, e CSS com `--safe-area-inset-*`
      e `env()` como recurso.
- [x] Retirar `@capacitor/status-bar`.
- [x] R8 e `proguard-rules.pro`.
- [x] Versão 1.2.0 (versionCode 5) no Gradle e no `package.json`.
- [x] Build de release assinado; comparar o tamanho do `.aab` com o da
      1.1.0; verificar o `mapping.txt`.
- [x] Notas da versão (pt-PT e en-US).

Resultado (2026-10-07):
- **Tamanho do `.aab`:** 7 074 048 → **4 084 182 bytes (−42%)**.
- **`mapping.txt`:** mantém com os nomes originais
  - `PlayBillingPlugin` e os métodos `getProducts`, `purchase` e
    `queryPurchases`;
  - `CameraPlugin`, `SplashScreenPlugin` e `NativeBiometric`;
  - a ponte JS `postMessage`.
- **Testes:** unitários 67/67, E2E 5/5, typecheck 0.
- **Ainda não feito:** o teste manual num dispositivo.

## Testes

- Automáticos: unitários, integração, E2E e typecheck sem regressões (a
  parte web do CSS é partilhada).
- **Manual, num dispositivo, com a 1.2.0 instalada pela Play:**
  - ecrã de arranque: logótipo no fundo escuro, sem flash branco;
  - barra de estado: escura, com ícones legíveis, e o conteúdo não fica
    por baixo dela. Testar em Android 15+ e, se possível, num Android
    mais antigo;
  - modo de avião ao abrir: aparece o ecrã sem internet, e o de arranque
    não fica preso;
  - funções nativas depois do R8:
    - login com biometria;
    - digitalizar um recibo com a câmara;
    - página de subscrição com os preços da Google;
    - uma compra de teste de licença.

## Critérios de aceitação

- [ ] Nenhum ecrã branco entre tocar no ícone e ver a app.
- [ ] Barra de estado escura e legível, sem conteúdo tapado, em Android
      15+.
- [ ] `.aab` 1.2.0 mais pequeno do que o 1.1.0 (7,07 MB).
- [ ] Compras, câmara, biometria e ecrã sem internet a funcionar no build
      otimizado.
