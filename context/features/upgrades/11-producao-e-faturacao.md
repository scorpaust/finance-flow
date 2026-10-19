# UPGRADE 11 — Passagem a produção e faturação (InvoiceXpress)

> Origem: fim dos testes fechados (2026-10-19). Pedido do utilizador: passar
> tudo para produção (EasyPay real, faturação no InvoiceXpress), manter as
> contas de teste mais um dia e dar Premium à conta do operador.

## O que existia

- EasyPay em sandbox (`EASYPAY_ENV=test`), pronta a mudar por variáveis.
- Nenhuma integração de faturação. As vendas no site exigem uma fatura a cada
  cliente; na app Android, a Google é a vendedora e o operador fatura à
  Google uma vez por mês, fora da app.
- O operador está isento de IVA (art. 53.º do CIVA).

## Decisões

1. **Documento:** fatura-recibo (`invoice_receipts`), finalizada e enviada
   por email pelo InvoiceXpress logo que a EasyPay confirma o pagamento.
   - IVA 0% (`IVA0`) com o motivo de isenção `M10`, configuráveis por
     variável.
2. **Uma fatura por pagamento:**
   - coleção `Invoice` com `paymentId` único;
   - proteção extra: a mesma conta, o mesmo plano e o mesmo valor nos
     últimos 20 dias ficam `skipped` (evento `invoice.duplicate_skipped` no
     log). Cobre o mesmo pagamento chegar com ids diferentes pelo checkout,
     pelo webhook de criação e pelo de cobrança.
3. **Quando se fatura:**

   | Método | Momento da fatura |
   |---|---|
   | Cartão | Na 1.ª cobrança (checkout ou `subscription_create`) e em cada renovação (`subscription_capture`) |
   | Débito direto | Só na cobrança (`subscription_capture`), nunca no mandato |
   | MB WAY e Multibanco | Quando o pagamento fica pago (checkout, webhook `capture` ou "Verificar pagamento") |

4. **Nunca parte o pagamento:**
   - sem configuração ou com erro do InvoiceXpress, a fatura fica `pending`;
   - o cron diário (`check-expirations`) volta a tentar, até 10 vezes;
   - o número da fatura é guardado antes do email, para uma nova tentativa
     não criar outra.
5. **NIF opcional** no formulário de pagamento, com o dígito de controlo
   validado no cliente e no servidor. Sem NIF, a fatura vai para Consumidor
   final. A língua do email é a do site quando o pagamento começou.
6. **Premium oferecido:** plano ativo, `provider: 'none'` e sem data de fim.
   O cron de expirações não lhe toca. Aplica-se com `scripts/grant-plan.mjs`.
7. **Credenciais EasyPay e InvoiceXpress lidas em runtime** (`process.env`),
   para poderem ser marcadas como secretas na Netlify.
8. **Privacidade:**
   - InvoiceXpress acrescentado aos destinatários;
   - dados de faturação e conservação de 10 anos descritos, nas 6 línguas;
   - `LEGAL_UPDATED` passou a 2026-10-19;
   - as faturas entram na exportação de dados e não são apagadas com a conta.

## Fora de âmbito

- **Notas de crédito automáticas nos reembolsos:** emitem-se à mão no
  InvoiceXpress, ver `OPERATIONS.md`.
- **Faturas à Google:** mensais e manuais.

## Testes

- **Unitários** (`tests/fiscalId.test.ts`): NIF válido, inválido e
  normalizado.
- **Integração** (bloco "faturação InvoiceXpress (Upgrade 11)"):
  - cartão: fatura emitida uma só vez, com NIF, M10 e IVA0;
  - NIF inválido devolve 400;
  - InvoiceXpress em baixo: a fatura fica pendente e sai no cron seguinte;
  - débito direto: só fatura na cobrança.
- **Resultados:** unitários 142/142, integração 66/66, E2E 12/12, type-check
  sem erros.

## Passos do operador (fora do código)

Ver `context/OPERATIONS.md`, secção "Passagem a produção (Upgrade 11)".
