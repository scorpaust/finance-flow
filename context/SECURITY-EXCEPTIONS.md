# Vulnerabilidades em aberto — registo e análise de impacto

Exigido pela política de segurança (`context/SECURITY-POLICY.md`, secção
6): o que fica por corrigir, porquê, e o risco real.

**Critério.** Uma vulnerabilidade só fica em aberto se reunir duas
condições:
1. não chegar ao servidor de produção (`.output/server`) nem ao código
   que corre no browser ou na app;
2. a correção não existir, ou partir o projeto.

As que chegam à produção corrigem-se sempre (`overrides` no
`package.json`).

Revisto a 2026-10-09 (alertas do Dependabot de 2026-10-04, 2026-10-07 e 2026-10-08).

## Corrigidas por `overrides`

| Pacote | Gravidade | Versão forçada |
|---|---|---|
| `tar` | crítica | ^7.5.22 |
| `sharp` | alta | ^0.35.5 |
| `uuid` | moderada | ^11.1.1 |
| `@capacitor/assets` → `@capacitor/cli` | alta | a do projeto (8.x) |
| `shell-quote` | crítica | ^1.12.0 |
| `source-map-js` | alta | ^1.2.2 — **estava no servidor de produção** |
| `tinypool` | crítica | ^2.2.0 (testado com vitest 3: unit, integração e E2E verdes) |
| `simple-git` → `@simple-git/argv-parser` | crítica | ^2.0.1 |
| `fontless` → `esbuild` | baixa | ^0.28.1 — leitura de ficheiros no servidor de desenvolvimento do esbuild em Windows (GHSA-g7r4-m6w7-qqqr, afeta 0.27.3–0.28.0). Só a cópia 0.27.7 do `fontless` (`@nuxt/fonts` 0.14, que fixa `esbuild ^0.27`) estava no intervalo; o `fontless` só usa `transform`, nunca `serve`. Os 0.25.12 do `@nuxtjs/i18n` e do `vitest` estão fora do intervalo |

## Em aberto

| Pacote | Gravidade | Vem de | Onde corre | Porque fica |
|---|---|---|---|---|
| `simple-git` 3.36 | crítica/alta | `@nuxt/devtools` (via `nuxt`) | Só no servidor de desenvolvimento local (DevTools). Desligado nos E2E e inexistente em produção | A correção é a 4.x, que deixou de ter `export default`: o `@nuxt/devtools` atual rebenta (`nuxt prepare` falha). Fechar quando o Nuxt atualizar o DevTools |
| `vitest` / `@vitest/mocker` 3.x | moderada | testes | Só a correr testes | Correção na vitest 5 (major), que exige atualizar também `@nuxt/test-utils`. Trabalho à parte |
| `braces`, `node-forge` | alta | ferramentas de build e CLI do Nuxt | Build e servidor de desenvolvimento | Sem versão corrigida publicada |
| `postcss-selector-parser` 6.x | moderada | Tailwind CSS 3 | Build (CSS nosso, não de terceiros) | Correção só na 7.x, que o Tailwind 3 não usa. Fechar com a migração para Tailwind 4 |
| `sprintf-js` | moderada | `@tensorflow/tfjs` → `argparse` (CLI do TensorFlow) | Não é usado: a app só usa o TensorFlow no browser | Sem versão corrigida publicada |

**No GitHub**, os alertas desta tabela podem ser marcados como *Dismiss →
Vulnerable code is not actually used* (ou *Risk is tolerable*), com uma
ligação para este ficheiro.
