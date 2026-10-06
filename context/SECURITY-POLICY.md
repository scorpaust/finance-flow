# Política de Segurança da Informação — FinanceFlow

| | |
|---|---|
| Versão | 1.0 |
| Data | 2026-10-03 |
| Responsável | Dinis Miguel Costa (titular e único administrador) |
| Revisão | Anual, e sempre que mude a forma de receber pagamentos ou de alojar a app |

## 1. Objetivo e âmbito

Esta política define como o FinanceFlow protege a informação dos
utilizadores e cumpre o PCI DSS 4.0 na modalidade **SAQ A** (comerciante
que não guarda, processa nem transmite dados de cartão).

Abrange:

- a app web em https://financeflow-webapp.netlify.app;
- a app Android `com.dinismcosta.financeflow`;
- o código em github.com/scorpaust/finance-flow;
- as contas de administração dos fornecedores listados na secção 3.

## 2. Dados de cartão: o que nunca fazemos

- Os pagamentos com cartão e débito direto são feitos inteiramente na
  EasyPay, num iframe de `pay.easypay.pt`. O número do cartão, o CVV e o
  IBAN vão do browser do utilizador diretamente para a EasyPay.
- **Proibido**:
  - pedir, receber ou guardar dados de cartão ou IBAN em qualquer sistema
    nosso (base de dados, logs, email, suporte, capturas de ecrã);
  - criar formulários próprios de cartão.
- Se um utilizador enviar dados de cartão por email ou suporte, a mensagem é
  apagada e o utilizador é avisado para não o repetir.
- Qualquer mudança que altere esta forma de pagar (por exemplo, campos de
  cartão na nossa página) obriga a rever esta política e o tipo de SAQ
  **antes** de ir para produção.

## 3. Fornecedores (prestadores de serviço)

| Fornecedor | Função | Dados |
|---|---|---|
| EasyPay | Pagamentos (cartão, débito direto, MB WAY, Multibanco) | Dados de pagamento |
| Netlify | Alojamento da app web e do servidor | Tráfego da app |
| MongoDB Atlas | Base de dados | Contas e dados financeiros pessoais (sem cartões) |
| Cloudflare R2 | Backups encriptados da base de dados | Cópia da base de dados |
| GitHub | Código e automatismos (CI, backups, tarefas agendadas) | Código e segredos de CI |
| Google Play | Distribuição Android e pagamentos na app (Google Play Billing) | Dados de instalação e compras na app |
| Anthropic | IA (análise de estatísticas, leitura de documentos) | Agregados e imagens de documentos, não guardados |
| Twelve Data | Câmbios e dados de mercado | Nenhum dado pessoal |
| Sentry | Registo de erros | Erros técnicos, sem dados sensíveis |

- **Uma vez por ano**, obter o certificado de conformidade PCI DSS (AOC) da
  EasyPay e guardá-lo junto desta política.
- Um fornecedor novo que toque em dados pessoais ou de pagamento só entra
  depois de ser acrescentado a esta tabela, à política de privacidade e à
  declaração de segurança de dados da Google Play.

## 4. Controlo de acessos

- **Administração**: só o responsável tem acesso às consolas da EasyPay,
  Netlify, MongoDB Atlas, Cloudflare, GitHub, Google Play Console e
  Anthropic. Se houver mais pessoas, cada uma tem uma conta própria.
  Contas partilhadas de administração são proibidas.
- **2FA obrigatória** em todas essas consolas.
- **Palavras-passe**:
  - únicas por serviço, longas e aleatórias, guardadas num gestor de
    palavras-passe;
  - as palavras-passe e valores por defeito dos fornecedores são sempre
    substituídos.
- **Segredos da app** (chaves de API, URI da base de dados, chave de
  sessão):
  - só nas variáveis de ambiente do Netlify e nos secrets do GitHub, nunca
    no código;
  - o GitGuardian vigia o repositório.
- **Base de dados**:
  - utilizadores da base de dados com o mínimo de permissões (app:
    `readWrite` na base de dados de produção; backup: só leitura);
  - a ligação é sempre TLS.
- **Keystore Android**: fora do repositório e com cópia de segurança offline.
  As palavras-passe ficam no gestor de palavras-passe.
- **Utilizadores da app**:
  - cada pedido só acede aos dados do próprio utilizador;
  - palavras-passe com scrypt;
  - 2FA (TOTP) disponível;
  - limites de tentativas no login e nas funções de IA.
- **Saídas**: se alguém deixar de precisar de acesso, o acesso é retirado no
  próprio dia e os segredos que conhecia são trocados.

## 5. Desenvolvimento e alterações

- Todas as alterações passam pelo Git, e o CI corre type-check e testes
  unitários, de integração e E2E.
- Mudanças em autenticação, pagamentos ou cabeçalhos de segurança exigem
  testes a cobrir o caso.
- A página que embebe o checkout está protegida por uma Content Security
  Policy obrigatória:
  - só carrega scripts do próprio site;
  - só permite o iframe da EasyPay;
  - qualquer domínio novo na CSP tem de ser justificado no commit.
- Cabeçalhos de segurança ativos em produção: HSTS, `X-Frame-Options: DENY`,
  `nosniff` e `Referrer-Policy`.
- A app Android de release proíbe tráfego sem encriptação e backups do
  sistema.

## 6. Gestão de vulnerabilidades

- O Dependabot abre PRs semanais (npm, GitHub Actions) e mensais (Gradle).
  Os alertas de segurança chegam logo.
- **Prazos de correção**:
  - crítica ou alta que afete o código em produção: até 7 dias;
  - restantes: na atualização mensal seguinte;
  - vulnerabilidades sem correção publicada ficam registadas com a análise
    de impacto.
- `npm audit` em cada atualização de dependências, distinguindo o que vai
  para o servidor de produção do que é só ferramenta de build/teste.
- Os computadores usados para administrar e fazer deploy têm o sistema
  operativo atualizado, antivírus ativo (Microsoft Defender) e disco
  encriptado.

## 7. Registo e monitorização

- O servidor regista eventos estruturados (login, falhas, limites,
  pagamentos, erros de fornecedores), **sem** palavras-passe, códigos,
  tokens ou dados financeiros. Os logs ficam no Netlify, e os erros no
  Sentry.
- A EasyPay e o Atlas mantêm os seus próprios registos de acesso.
- **Revisão mensal**:
  - erros no Sentry;
  - picos de falhas de login;
  - alertas do Atlas;
  - pagamentos sem confirmação.

## 8. Cópias de segurança

- Backup diário da base de dados para o Cloudflare R2, por um workflow do
  GitHub.
- O procedimento de restauro está em `context/OPERATIONS.md`. Testar o
  restauro pelo menos uma vez por ano numa base de dados de teste.

## 9. Resposta a incidentes

Ao suspeitar de um incidente (acesso indevido, fuga de segredos,
alteração não autorizada do site ou do checkout):

1. **Conter**:
   - trocar de imediato os segredos afetados (Netlify, GitHub, Atlas,
     EasyPay);
   - terminar sessões;
   - se preciso, voltar ao último deploy bom (ver "Rollback" em
     `context/OPERATIONS.md`).
2. **Avisar**:
   - a EasyPay, se o pagamento puder ter sido afetado;
   - a CNPD, em até 72 horas, se houver violação de dados pessoais (RGPD,
     art. 33.º);
   - os utilizadores afetados, quando houver risco elevado para eles
     (art. 34.º).
3. **Investigar** com os logs do Netlify, do Sentry, do Atlas e do GitHub,
   e registar o que aconteceu, quando e o que foi afetado.
4. **Corrigir** a causa e rever esta política.

Contacto para reportar problemas de segurança: dinismiguelcosta@gmail.com.

## 10. Formação e aceitação

Quem tiver acesso de administração lê esta política ao entrar e em cada
revisão anual, e confirma por escrito (email ou assinatura neste ficheiro).

| Nome | Data | Confirmação |
|---|---|---|
| Dinis Miguel Costa | 2026-10-03 | Lida e aceite |
