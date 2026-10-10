# UPGRADE 07 — Ficha da loja (ASO) nas 6 línguas

> Origem: relatório dos testes fechados (2026-10-10), ponto 1 "ASO
> Description Optimization": a descrição é curta e sem as palavras-chave que
> as pessoas procuram (finanças pessoais, orçamento, despesas,
> investimentos), o que limita a descoberta na Play Store.

## O que existe

- **PT-PT:** título, descrição curta e descrição completa
  (`context/PLAY-STORE.md`).
- **EN:** título e descrição curta; a descrição completa ficou como "tradução
  direta do PT-PT, a fazer". As restantes 4 línguas não têm ficha.
- **Capturas de ecrã:** só em PT-PT (`npm run store:screenshots`, dados de
  exemplo genéricos).
- **Funcionalidades em falta na descrição:** a ficha é anterior ao
  orçamento sugerido (Premium, Upgrade 04, já na descrição PT-PT), à
  recuperação de password e ao domínio próprio.

## Proposta

1. **Palavras-chave por língua** (sem ferramentas pagas):
   - sugestões da pesquisa da Play Store;
   - fichas das apps concorrentes mais bem colocadas;
   - termos naturais de cada língua. Ex. PT: "controlo de despesas",
     "orçamento mensal", "gestor de finanças pessoais", "poupança";
     EN: "budget planner", "expense tracker", "money manager".
2. **Textos novos nas 6 línguas**, dentro dos limites da Play:
   - título até 30 caracteres, com uma palavra-chave (ex. "FinanceFlow:
     Budget & Expenses");
   - descrição curta até 80;
   - descrição completa até 4000: o benefício primeiro, depois as secções
     por plano com as funcionalidades atuais (orçamento por IA, previsões,
     digitalização de recibos, investimentos, 2FA, 6 línguas), privacidade e
     o aviso "não é aconselhamento financeiro". Palavras-chave usadas com
     naturalidade, sem listas de termos (a Google penaliza).
3. **Capturas de ecrã por língua:** o `playwright.store.config.ts` passa a
   gerar os mesmos ecrãs em cada língua (o cookie `financeflow_locale` por
   corrida), com dados de exemplo traduzidos.
4. **Avaliações reais em vez de "testemunhos":**
   - o relatório sugere testemunhos na descrição, mas a política da Google
     **proíbe testemunhos de utilizadores na ficha** e não há utilizadores
     reais ainda (inventá-los seria enganoso). Fica de fora;
   - em vez disso, pedir uma avaliação dentro da app com a **In-App Review
     API** da Google (plugin Capacitor): depois de um momento positivo (ex.
     30 dias de uso e a 10.ª transação), no máximo uma vez, nunca a seguir a
     um erro.

## Tarefas

- [ ] Pesquisa de palavras-chave (1 lista por língua, no `PLAY-STORE.md`).
- [ ] Título, descrição curta e completa nas 6 línguas (`PLAY-STORE.md`,
      prontos a colar).
- [ ] Capturas de ecrã nas 6 línguas (`store:screenshots` com parâmetro de
      língua).
- [ ] Pedido de avaliação na app (In-App Review; precisa de `.aab` novo).
- [ ] Utilizador: colar as fichas e as imagens na Play Console.

## Critérios de aceitação

- [ ] Ficha completa nas 6 línguas, com as funcionalidades atuais.
- [ ] Capturas de ecrã na língua de cada ficha.
- [ ] O pedido de avaliação aparece no máximo uma vez e nunca depois de um
      erro.
