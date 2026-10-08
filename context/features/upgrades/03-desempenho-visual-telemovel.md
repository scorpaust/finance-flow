# UPGRADE 03 — Desempenho visual em telemóvel

> Pedido do utilizador (2026-10-08), depois do Lighthouse: "quanto à mudança
> visual tudo ok por mim... fica noutra feature".

## Contexto (Lighthouse de 2026-10-08)

**Já corrigido** (commit `5ce176e`):
- `html lang` e descrição da página por idioma;
- `robots.txt`;
- fontes servidas pelo próprio site (`@nuxt/fonts`);
- Netlify Drawer desligado pelo utilizador.

Acessibilidade, boas práticas e SEO ficaram em **100** nas páginas públicas.

**Desempenho em telemóvel**, com o CPU calibrado: login 69, privacidade 87.
- Calibração: o índice de CPU da máquina de teste era ~390; o Lighthouse
  correu com `cpuSlowdownMultiplier=1`. Com o 4× por omissão, os valores
  saíam irrealistas (29–42).
- **No login:** 4,1 s até ao conteúdo principal (LCP) e 330 ms de bloqueio
  (TBT).
- O peso é pequeno (~300 KB). O custo é de **desenho**:
  - `styleLayout` ~2,3 s e `scriptEvaluation` ~3,7 s, com o CPU 4×;
  - `backdrop-blur-xl` (24 px) em 64 componentes `glass-card`, mais modais,
    toasts e botões;
  - no login: partículas animadas (`animate-float`), um halo com `blur-2xl`
    e um ícone com `animate-bounce`.

## Objetivo

Login com desempenho **≥ 85** e LCP **≤ 2,5 s** em telemóvel (Lighthouse,
CPU calibrado), sem mudar o aspeto em computador.

## Decisão (utilizador, 2026-10-08)

Pode mudar o aspeto em telemóvel ("tudo ok por mim").

## Tarefas

- [ ] **Desfoque de fundo só em ecrãs grandes:**
  - em `max-width: 1023px`, os `glass-card`, modais, toasts, botões de vidro
    e a barra de navegação trocam `backdrop-filter` por um fundo mais
    opaco, com a mesma cor (ex. `surface-800/90`);
  - em computador fica igual;
  - em `prefers-reduced-motion` sem desfoque em todos os tamanhos.
- [ ] **Login:**
  - menos partículas em ecrã pequeno, e nenhuma com
    `prefers-reduced-motion`;
  - halo `blur-2xl` substituído por um gradiente radial (sem filtro);
  - animações de entrada mais curtas.
- [ ] **Ecrã de carregamento global** (`app.vue`): só um elemento animado.
- [ ] Confirmar que o desfoque desligado não reduz o contraste do texto (a11y
      a 100).
- [ ] Lighthouse antes/depois: login, privacidade e, se der, uma página com
      sessão. Registar os números aqui.
- [ ] E2E sem regressões.

## Fora de âmbito

- Mudar o design system em computador.
- Medir as páginas com sessão de forma automática. O Lighthouse com sessão
  ficou pendurado no browser autenticado: tentar o PageSpeed Insights com
  uma chave de API, ou o Lighthouse do Chrome DevTools à mão.

## Critérios de aceitação

- [ ] Login ≥ 85 de desempenho em telemóvel (CPU calibrado).
- [ ] Acessibilidade, boas práticas e SEO continuam em 100.
- [ ] Em computador, o aspeto é o mesmo.
