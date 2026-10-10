# UPGRADE 05 — Recuperação de password

> Pedido do utilizador (2026-10-10): "A app não tem nenhum mecanismo de
> recuperação de password :) tenta encontrar algo gratuito ou o mais barato
> possível para isso. E diz-me várias opções para eu escolher a melhor,
> dizendo qual a mais recomendada tendo em conta o contexto da app."

## Situação atual

- Login só com email e password (`server/api/auth/session.ts`, scrypt). Quem
  se esquece da password **perde o acesso à conta**: a única saída é
  escrever para o email de suporte, e o operador não tem ferramenta para
  ajudar.
- Não há "alterar password" nas Definições.
- **Sessões sem revogação.** A sessão é um cookie assinado com `userId` e
  data de expiração (`server/utils/session.ts`, até 30 dias). Mudar a
  password hoje não termina as sessões abertas noutros dispositivos.
- **A app não envia emails.** Não há fornecedor, biblioteca nem domínio
  próprio: o site está em `financeflow-webapp.netlify.app`.
  - Quase todos os serviços de email exigem um **domínio verificado**, com
    registos DNS SPF, DKIM e DMARC, para os emails não irem parar ao spam.
  - É o fator que mais pesa na escolha.
- 2FA (TOTP) com códigos de recuperação já existe. Recuperar a password
  **não** desliga o 2FA.

## Opções (preços confirmados a 2026-10-10)

| | Opção | Custo | Precisa de domínio | Limite | Prós | Contras |
|---|---|---|---|---|---|---|
| **A** | **Resend + domínio próprio** | **0 €** (plano grátis) **+ ~10–12 €/ano** de domínio | Sim | 3 000 emails/mês, 100/dia | API simples (um `fetch`, como a Anthropic e a EasyPay); boa entrega; remetente `noreply@<domínio>`; o domínio serve depois para avisos de renovação da subscrição e para a imagem da app | Custo anual do domínio; configurar DNS (uma vez); 100/dia chega para recuperações, mas não para emails em massa |
| **B** | Brevo, plano grátis | 0 € (com domínio: + ~10–12 €/ano) | Não obrigatório | 300/dia | Grátis sem domínio; limite diário maior | **Sem domínio**, a Brevo troca o remetente pelo dela (`brevosend.com`); Outlook/Hotmail marcam como spam ou recusam sem DMARC; a conta nova pode precisar de aprovação manual |
| **C** | Gmail (SMTP com "app password") da conta do operador | 0 € | Não | ~500/dia | Grátis, sem domínio, entrega razoável, pronto em minutos | Remetente é um Gmail pessoal (pouco profissional, e expõe-no); envios automáticos podem levar a Google a bloquear a conta; precisa de biblioteca SMTP (`nodemailer`); termos da Google não pensados para isto |
| **D** | Amazon SES + domínio | ~0,10 $/1000 emails + domínio | Sim | Praticamente ilimitado | O mais barato em volume | Configuração pesada (conta AWS, sair do "sandbox" com pedido à Amazon); a camada gratuita mudou em 2026; exagero para o volume atual |
| **E** | Sem email: chave de recuperação + suporte manual | 0 € | Não | — | Nada de fornecedores nem custos | Má experiência: o utilizador tem de guardar a chave (como os códigos do 2FA); contas existentes não a têm; quem a perder depende do operador, que tem de verificar a identidade à mão (risco de engenharia social) |

**Recomendação: A (Resend + domínio próprio).**
- **O domínio é o verdadeiro requisito.** Sem ele, qualquer fornecedor sério
  ou cai no spam (B), ou usa um Gmail pessoal (C).
- **Custo baixo.** ~1 €/mês resolve isso e abre caminho a outros emails que
  a app vai precisar: aviso de subscrição a expirar (o campo
  `subscription.reminderSentAt` já existe e não é usado), confirmação de
  pagamento e alertas de orçamento.
- **O plano grátis da Resend chega.** Com dezenas ou centenas de
  utilizadores, 100 emails/dia sobra para recuperações. Se um dia não
  chegar, o plano pago custa 20 $/mês por 50 000 emails.
- **Encaixa no projeto.** API por `fetch`, sem SDK, testável com o servidor
  simulado dos testes de integração (como a Anthropic).

**Alternativa a custo zero: C (Gmail SMTP)**, como solução provisória até
haver domínio. O código fica igual (só muda o "transporte" do email), por
isso trocar depois para A é mudar uma variável de ambiente.

**O domínio é só para o email.** Usar o domínio novo para os emails **não**
obriga a mudar o endereço do site. Mudar `APP_URL` mexe na app Android
(`capacitor.config.ts` → `server.url`, precisa de `.aab` novo), no URL das
notificações da Google Play (RTDN) e nas fichas da loja. Isso fica para
outra altura, se se quiser.

### Decisões (utilizador, 2026-10-10)

1. **Opção A: Resend.**
2. **Domínio `financeflow-webapp.pt`**, já registado pelo utilizador. Os
   emails saem de um **subdomínio**, como a Resend recomenda:
   - remetente `FinanceFlow <noreply@mail.financeflow-webapp.pt>`;
   - região da Resend `eu-west-1` (Irlanda, a mais perto de Portugal);
   - o site continua em `financeflow-webapp.netlify.app`.

   Configuração DNS:

   | Tipo | Nome | Valor |
   |---|---|---|
   | TXT | `resend._domainkey.mail` | chave DKIM dada pela Resend |
   | MX | `send.mail` | `feedback-smtp.eu-west-1.amazonses.com`, prioridade 10 |
   | TXT | `send.mail` | SPF `v=spf1 include:amazonses.com ~all` |
   | TXT | `_dmarc` | `v=DMARC1; p=none;`, depois `p=quarantine` |

   Os valores exatos são os do separador "Records" do domínio na Resend.

Ainda por confirmar (propostas):

3. Duração do link de recuperação. Proposta: **30 minutos**, uso único.
4. Depois de recuperar a password, terminar as sessões em **todos** os
   dispositivos? Proposta: sim.

## Funcionalidade (igual para A–D)

### Fluxo do utilizador

1. No login, um link **"Esqueci-me da password"** abre um formulário com o
   email.
2. A resposta é sempre a mesma, quer a conta exista ou não: "Se existir uma
   conta com este email, enviámos um link para definir uma nova password."
   Assim não se revela quem tem conta.
3. O email, na língua da app, traz um link
   `APP_URL/reset-password?token=…` válido 30 minutos e de uso único.
4. A página `/reset-password` pede a nova password (mesmas regras do
   registo: mínimo 8 caracteres) e a confirmação.
5. Depois de definida:
   - as sessões noutros dispositivos terminam;
   - o utilizador entra (com o 2FA pedido, se estiver ativo);
   - chega um email "A tua password foi alterada" com o contacto de suporte,
     caso não tenha sido ele.

**"Alterar password" nas Definições** (com sessão iniciada): pede a
password atual e a nova; termina as sessões nos outros dispositivos; envia
o mesmo aviso por email.

### Segurança

- **Token:**
  - 32 bytes aleatórios;
  - na base de dados só o **hash** (SHA-256), na coleção `PasswordResetToken`
    (`userId`, `tokenHash`, `expiresAt`, `usedAt`, TTL para limpeza);
  - pedir um novo invalida o anterior.
- **Limites** (`enforceRateLimit`): por IP (ex. 10/hora) e por email (ex.
  3/hora). Os pedidos acima do limite recebem a mesma resposta genérica, e
  o email não é enviado.
- **Revogação de sessões:** novo campo `User.sessionVersion` (ou
  `passwordChangedAt`), incluído na assinatura da sessão e verificado em
  `requireAuth`. Mudar a password incrementa-o, e as sessões antigas deixam
  de valer. Serve também para um futuro "terminar sessão em todos os
  dispositivos".
- **Dados:** o link nunca leva o email. Os logs não guardam tokens nem
  emails completos. Contas antigas sem password (`provider` antigo) podem
  definir uma pela recuperação.
- **2FA:** a recuperação não desliga o 2FA. Quem perdeu a password e o
  telemóvel usa um código de recuperação do 2FA no login.

### Envio de email

- `server/utils/email.ts`: uma função `sendEmail({ to, subject, text, html })`
  com o transporte escolhido por variável de ambiente (`EMAIL_PROVIDER`:
  `resend`, `brevo`, `smtp`). Sem ela, não envia e regista no log (útil em
  desenvolvimento).
- Modelos simples (texto + HTML mínimo), nas 6 línguas, com o nome da app e
  sem imagens externas.
- **Variáveis:** `EMAIL_PROVIDER`, `EMAIL_FROM`, e conforme a opção
  `RESEND_API_KEY` / `BREVO_API_KEY` / `SMTP_URL`. Documentar em
  `context/CONFIG-REFERENCE.md`. Na Netlify, lembrar o **redeploy** depois
  de as definir.

### Textos legais e loja

- **Política de Privacidade, ponto 4 (subcontratantes), nas 6 línguas:** o
  fornecedor de email, que recebe só o endereço de email e o conteúdo da
  mensagem. Data atualizada.
- **Ficha da Play Console, segurança dos dados:** o email já é declarado
  ("Gestão da conta"); confirmar se é preciso mais alguma coisa.

## Tarefas

- [ ] `PasswordResetToken` e `User.sessionVersion`; sessão assinada com a
      versão e verificada em `requireAuth`; incremento ao mudar a password.
- [ ] `POST /api/auth/password/forgot`: resposta genérica, limites, token e
      email.
- [ ] `POST /api/auth/password/reset`: valida o token (existe, não expirou,
      não foi usado), muda a password, marca o token como usado, revoga as
      sessões, envia o aviso.
- [ ] `POST /api/auth/password/change` (com sessão): password atual + nova.
- [ ] `server/utils/email.ts` com o transporte escolhido e modelos nas 6
      línguas.
- [ ] Cliente:
  - link "Esqueci-me da password" no login;
  - páginas `/forgot-password` e `/reset-password` (públicas, como
    `/privacy`);
  - cartão "Alterar password" nas Definições;
  - textos nas 6 línguas.
- [ ] Política de Privacidade (6 línguas), `CONFIG-REFERENCE.md`,
      `OPERATIONS.md` (configurar o domínio e o fornecedor, passo a passo).
- [ ] **Testes:**
  - **unitários:** token (hash, expiração, uso único) e versão da sessão;
  - **integração**, com o fornecedor de email simulado no `stubProviders`:
    - pedir para email existente e inexistente (mesma resposta, só um email
      enviado);
    - limites;
    - token expirado, usado e errado;
    - reset que revoga uma sessão antiga;
    - alterar password com a password atual errada;
  - **E2E:** pedir recuperação, ler o link no servidor simulado, definir a
    nova password e entrar com ela; a antiga deixa de funcionar.

## Critérios de aceitação

- [ ] Quem se esqueceu da password recupera o acesso sozinho, por email, em
      menos de 2 minutos.
- [ ] O formulário não revela se um email tem conta.
- [ ] O link expira em 30 minutos e só funciona uma vez.
- [ ] Depois de mudar a password, as sessões antigas deixam de funcionar.
- [ ] O 2FA continua a ser pedido depois da recuperação.
- [ ] Os emails chegam à caixa de entrada (não ao spam) em Gmail e Outlook,
      nas 6 línguas.
