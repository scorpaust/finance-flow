# FASE 4 — Design System, Safe Areas e Responsividade

> Pré-requisito: Fases 1, 2 e 3 concluídas (para poder aplicar o novo visual
> também ao paywall, secções gated e às novas secções de IA da Fase 3). Ler
> `00-CODE-SPEC.md` secção 5.

## Objetivo

Modernizar o layout mantendo a identidade "glass morphism" dark existente,
com:
- Moldura/borda visível e áreas de segurança corretas em web e Android
- Responsividade sólida em telemóvel, tablet, desktop e ecrãs grandes/ultra-wide
- Animações moderadas (não exageradas), acessíveis (`prefers-reduced-motion`)
- Visual apelativo mas funcional para uso diário

## Tarefas

### 1. Tokens de design centralizados
- [ ] Rever `tailwind.config` e consolidar cores/tipografia/spacing como
      tokens nomeados (manter base: `surface-900 #0f0f23`, brand indigo
      `#6366f1`, income emerald `#34d399`, expense rose `#fb7185`; ajustar/
      expandir paleta com tons intermédios para melhor hierarquia visual e
      contraste AA)
- [ ] Eliminar cores hardcoded fora do `tailwind.config` nos componentes

### 2. Safe areas (Android + web)
- [ ] Garantir `viewport-fit=cover` no `<head>` (Nuxt config/`app.head`)
- [ ] Usar `env(safe-area-inset-top/right/bottom/left)` em CSS para:
      `MobileNav.vue` (bottom nav — crítico para gesto de navegação Android),
      topbar/header, e qualquer overlay fullscreen (modais, drawers)
- [ ] Testar em emulador Android com barra de gestos e em dispositivo com
      "notch"/câmara em furo

### 3. Moldura/contentor visível
- [ ] Em ecrãs desktop/tablet/ultra-wide, envolver o conteúdo principal numa
      moldura consistente (`border` subtil + `rounded-2xl`/`3xl` + sombra
      suave) para que a app não pareça "esticada" em monitores grandes —
      usar `max-width` central com padding lateral crescente por breakpoint
- [ ] Em mobile a moldura pode ser mais discreta/ausente (edge-to-edge),
      respeitando sempre as safe areas

### 4. Breakpoints
- [ ] Rever grelha responsiva com breakpoints explícitos:
      mobile `<640px`, tablet `640–1024px`, desktop `1024–1536px`,
      ultra-wide `>1536px`
- [ ] Testar sidebar colapsável (desktop) vs. bottom nav (mobile) nestes
      pontos de quebra, incluindo o novo ecrã de subscrição/paywall
- [ ] Garantir zero overflow horizontal em qualquer breakpoint, incluindo
      tabelas (transações, mensal em `/stats`)

### 5. Animações
- [ ] Transições de navegação entre páginas (Nuxt `<Transition>` / page
      transitions) suaves e curtas (150–250ms)
- [ ] Micro-interações em botões, cards e itens de lista (hover/press/focus)
- [ ] Skeleton loaders consistentes (já existe `ChartSkeleton` — generalizar
      o padrão a outras secções com carregamento assíncrono)
- [ ] Respeitar `prefers-reduced-motion: reduce` — desativar/reduzir
      animações não essenciais nesse caso

### 6. Ícones e splash (alinhar com Fase 1)
- [ ] Confirmar consistência entre ícone adaptativo Android, splash screen e
      favicon/manifest PWA web (mesma identidade visual)

### 7. Acessibilidade básica
- [ ] Contraste de texto vs. fundo AA em todos os estados (normal, hover,
      disabled)
- [ ] Estados de foco visíveis em todos os elementos interativos
      (navegação por teclado no web)
- [ ] `aria-label` em botões apenas com ícone

## Fora de âmbito nesta fase
- Alterações a regras de negócio de subscrição (Fase 2 já fechada)
- Alterações às features de IA (Fase 3 já fechada)
- Internacionalização/idiomas (Fase 6)
- Otimizações de performance profundas (Fase 7)

## Critérios de aceitação
- [ ] Sem overflow horizontal em nenhum breakpoint testado
- [ ] Bottom nav e overlays respeitam safe areas em emulador/dispositivo
      Android real
- [ ] Moldura visível e proporcional em desktop/ultra-wide sem quebrar em
      janelas redimensionadas
- [ ] Animações funcionam e desaparecem corretamente com
      `prefers-reduced-motion`
- [ ] Auditoria de contraste (ex. Lighthouse/axe) sem falhas críticas
