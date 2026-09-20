# AGENT-RULES.md — Regras para agentes (Claude Code) neste projeto

Estas regras aplicam-se a **todas** as fases (`01` a `07`). Ler antes de
qualquer alteração de código.

## Ordem de trabalho

1. Ler `context/00-CODE-SPEC.md` sempre no início de uma sessão nova.
2. Trabalhar uma fase de cada vez, pela ordem numerada. Não misturar tarefas
   de fases diferentes no mesmo commit/branch.
3. No fim de cada fase, confirmar explicitamente os "Critérios de aceitação"
   do respetivo ficheiro antes de a marcar como concluída.
4. Se uma tarefa da fase depender de uma decisão de negócio não definida
   (preço, limite exato de uma feature no plano gratuito, nome legal da
   empresa, etc.), **parar e assinalar a dúvida** em vez de assumir um valor.

## Convenções de código

- Vue 3 Composition API com `<script setup lang="ts">` em todo o código novo.
- TypeScript estrito — sem `any` não justificado.
- Lógica de negócio reutilizável vive em `composables/`, nunca duplicada
  dentro de componentes `.vue`.
- Estilos usam os tokens do `tailwind.config` (ver Fase 4) — não introduzir
  cores/espaçamentos "mágicos" inline.
- Todas as strings visíveis ao utilizador em português europeu (PT-PT) até
  à Fase 5; a partir daí, sempre por chave de tradução (`@nuxtjs/i18n`),
  nunca texto fixo num só idioma — ver `05-FASE-5-internacionalizacao.md`.
- Nomes de ficheiros e pastas seguem a estrutura já existente em
  `financeflow/` (ver README do repositório).

## Segurança (não negociável)

- Nunca commitar segredos (`.env`, chaves EasyPay/Anthropic/Twelve Data,
  keystore Android). Confirmar `.gitignore` cobre estes ficheiros.
- Qualquer controlo de acesso a uma funcionalidade paga tem de existir
  **também no servidor**, nunca só no client.
- Webhooks (EasyPay) não vêm assinados — têm de ser validados antes de
  processar qualquer evento, confirmando o recurso com um GET à API pelo
  `id` (nunca confiar no corpo recebido).
- Nunca enviar descrições de transações em bruto à API da Anthropic (Fase
  3) — só agregados/números já calculados no servidor.

## Git e commits

- Commits pequenos e descritivos, em português ou inglês técnico consistente
  com o histórico existente do repositório.
- Um PR por fase (ou por sub-tarefa significativa dentro de uma fase, se a
  fase for grande) — não juntar Fase 2 e Fase 3 no mesmo PR.
- Antes de considerar uma tarefa concluída: correr build (`npm run build`) e,
  a partir da Fase 6, a suite de testes.

## Testes manuais mínimos antes de marcar uma fase como concluída

- Testar em pelo menos: mobile (emulador Android ou dispositivo), desktop
  (janela larga) — a partir da Fase 4, testar também tablet/ultra-wide.
- Confirmar que não há regressões nas funcionalidades das fases anteriores
  (ex.: ao implementar a Fase 4, confirmar que o gating das Fases 2 e 3
  continua a funcionar).

## Documentação

- Sempre que uma decisão técnica relevante for tomada durante a
  implementação (ex.: escolha entre `server.url` vs. build estática na Fase
  1), documentar no `README.md` do projeto e, se afetar o spec, atualizar
  `00-CODE-SPEC.md`.
- Manter `context/CONFIG-REFERENCE.md` atualizado sempre que uma nova variável de
  ambiente for introduzida.
