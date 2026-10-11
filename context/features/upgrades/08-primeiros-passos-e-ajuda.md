# UPGRADE 08 — Primeiros passos e ajuda na app

> Origem: relatório dos testes fechados (2026-10-10), "Additional
> Recommendations": tutoriais em várias línguas para tirar partido das
> funcionalidades avançadas (insights de IA, grupos de orçamento), e uma
> interface mais intuitiva.

## O que existe

- Conta nova: 10 categorias por omissão e um painel vazio.
- Explicações curtas dentro de alguns cartões (previsões, orçamento
  sugerido), sem visão de conjunto.
- Nenhuma página de ajuda.

## Proposta

1. **Lista de primeiros passos** no painel de uma conta nova (fecha-se
   sozinha quando estiver completa, ou com "Não mostrar mais"):
   1. Registar a primeira despesa (ou digitalizar um recibo).
   2. Registar a receita do mês.
   3. Criar um grupo com teto (Pro) ou ver o orçamento sugerido (Premium).
   4. Escolher a moeda e ativar a autenticação de dois fatores.
   - Cada passo leva ao ecrã certo; o progresso deduz-se dos dados (sem
     coleção nova). Funcionalidades fora do plano aparecem com o selo do
     plano, sem insistir.
2. **Página de ajuda** (`/help`, também pública para quem ainda não tem
   conta):
   - perguntas frequentes por tema (transações e categorias, grupos e
     orçamentos, IA e privacidade, previsões, subscrição e pagamentos,
     segurança e conta);
   - nas 6 línguas, em ficheiros de conteúdo como os textos legais;
   - pesquisa simples no cliente.
3. **Ajuda contextual:** um ícone "?" nos cartões mais complexos (orçamento
   sugerido, previsões, grupos, dicas de investimento) que abre a resposta
   certa da ajuda.
4. **Fora de âmbito:** vídeos e tutoriais interativos com sobreposição (caros
   de manter em 6 línguas).

## Tarefas

- [x] Componente `OnboardingChecklist` no painel; estado deduzido dos dados
      e "não mostrar" no utilizador.
- [x] `/help` com o conteúdo nas 6 línguas (+ teste de estrutura igual em
      todas, como o dos textos legais) e ligação no menu e no login.
- [x] Ícones "?" com ligação à pergunta.
- [x] Testes:
  - unitários: dedução do progresso;
  - E2E: conta nova vê a lista, regista a 1.ª despesa e o passo fica feito;
    `/help` acessível sem sessão.

## Critérios de aceitação

- [x] Uma conta nova sabe o que fazer a seguir sem sair da app.
- [x] Cada funcionalidade avançada tem explicação a um toque, nas 6 línguas.

## Implementação (2026-10-11)

Branch `feature/upgrade-08-primeiros-passos`.

- **Primeiros passos:** `shared/onboarding.ts` (regras), `GET /api/onboarding`
  (estado deduzido de transações, grupos com teto, orçamento sugerido pronto e
  2FA) e `POST /api/onboarding/dismiss` (`User.onboardingDismissedAt`).
  Componente `components/help/OnboardingChecklist.vue` no painel. Passos:
  despesa, receita, orçamento (bloqueado no Gratuito, com o selo do plano, sem
  contar para o total) e segurança (2FA). A lista some quando está completa,
  quando é fechada, ou em contas com 60 dias ou mais.
  - Desvio da proposta: a escolha da moeda saiu do passo 4. Já tem um
    valor por omissão e não dá para saber se foi uma escolha consciente.
- **Ajuda:** `utils/helpContent.ts` + `utils/help/<língua>.ts` (6 secções e
  22 perguntas por língua). `components/help/HelpCenter.vue` tem pesquisa
  sem acentos e abre a pergunta do `#id` no endereço. Aparece em:
  - `/help`, pública, com ligação no ecrã de entrada;
  - `/feedback`, por cima do formulário de contacto;
  - no painel, num atalho "Ajuda" (no telemóvel, o menu sozinho não chegava).
- **Ícones "?":** `components/help/HelpLink.vue` nos cartões de:
  - orçamento sugerido;
  - grupos;
  - previsões;
  - dicas de investimento;
  - estatísticas por IA.
- **Testes:**
  - unitários `tests/onboarding.test.ts` e `tests/helpContent.test.ts`
    (136/136 ao todo);
  - integração "primeiros passos (Upgrade 08)" (62/62);
  - E2E `e2e/help-flow.spec.ts` (12/12 ao todo);
  - type-check sem erros.
- Só web: não precisa de `.aab` novo.
