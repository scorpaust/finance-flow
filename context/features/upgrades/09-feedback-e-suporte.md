# UPGRADE 09 — Feedback e suporte dentro da app

> Origem: relatório dos testes fechados (2026-10-10), "Additional
> Recommendations": um ciclo regular de feedback dos utilizadores, e suporte
> acessível em todas as línguas.

## O que existe

- **Contacto:** só o email publicado nos Termos
  (`dinismiguelcosta@gmail.com`). Não há forma de contactar a partir da app
  nem de saber em que ecrã ou versão estava a pessoa.
- **Envio de email:** a app já envia emails pela Resend (Upgrade 05).

## Proposta

1. **"Enviar opinião / Pedir ajuda"** em Definições, na página de ajuda
   (Upgrade 08) e no menu:
   - tipo (ideia, problema, pergunta, pagamento), mensagem e um
     "posso ser contactado por email";
   - anexa automaticamente só o contexto técnico necessário: versão da app,
     web ou Android, língua, plano e página de onde veio. Nunca dados
     financeiros;
   - chega ao operador por email (Resend), com `Reply-To` = email do
     utilizador, para responder diretamente;
   - fica guardado numa coleção `Feedback` (para contar e ordenar temas), e
     apaga-se com a conta.
2. **Confirmação para o utilizador**, na língua dele: "Recebemos a tua
   mensagem e respondemos em até 2 dias úteis." Respostas na língua da
   pessoa (as traduções podem ser feitas com ajuda de IA pelo operador).
3. **Pedido de opinião curto** (1 pergunta, de 1 a 5) ao fim de 30 dias de
   uso, uma só vez, para quem não pediu avaliação na loja no Upgrade 07.
4. **Limites contra abuso:** 5 mensagens/dia por conta; texto até 2000
   caracteres.

## Tarefas

- [ ] `POST /api/feedback` (sessão obrigatória; limites; email ao operador e
      confirmação ao utilizador).
- [ ] Modelo `Feedback` e limpeza na eliminação de conta; exportação de
      dados inclui-o.
- [ ] Formulário (componente partilhado) nas 6 línguas.
- [ ] Política de Privacidade (6 línguas): mensagens de suporte e o que se
      guarda.
- [ ] Testes:
  - integração com a Resend simulada: email ao operador com Reply-To,
    confirmação ao utilizador, limites;
  - E2E: enviar uma mensagem a partir das Definições.

## Critérios de aceitação

- [ ] Qualquer utilizador contacta o suporte sem sair da app, na sua língua.
- [ ] O operador recebe a mensagem com o contexto técnico e responde com um
      clique.
