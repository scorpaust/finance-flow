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

- [ ] Componente `OnboardingChecklist` no painel; estado deduzido dos dados
      e "não mostrar" no utilizador.
- [ ] `/help` com o conteúdo nas 6 línguas (+ teste de estrutura igual em
      todas, como o dos textos legais) e ligação no menu e no login.
- [ ] Ícones "?" com ligação à pergunta.
- [ ] Testes:
  - unitários: dedução do progresso;
  - E2E: conta nova vê a lista, regista a 1.ª despesa e o passo fica feito;
    `/help` acessível sem sessão.

## Critérios de aceitação

- [ ] Uma conta nova sabe o que fazer a seguir sem sair da app.
- [ ] Cada funcionalidade avançada tem explicação a um toque, nas 6 línguas.
