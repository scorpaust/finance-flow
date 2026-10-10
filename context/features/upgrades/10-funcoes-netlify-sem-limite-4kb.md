# UPGRADE 10 — Funções da Netlify sem o limite de 4 KB nas variáveis

> Origem: deploy do Upgrade 05 recusado a 2026-10-10. "Your environment
> variables exceed the 4KB limit imposed by AWS Lambda. Please consider
> reducing them or upgrading from Lambda compatibility mode"
> (https://ntl.fyi/functions-migrate). A produção não foi afetada: a Netlify
> manteve a versão anterior.

## Situação

- O servidor Nuxt corre numa função em **modo de compatibilidade com Lambda**
  (preset Nitro `netlify-legacy`, `scripts/deploy-netlify.mjs`). Nesse modo,
  todas as variáveis de ambiente juntas não podem passar de 4 KB.
- A 2026-10-10 eram 23 variáveis, ~3,7 KB. Só a `GOOGLE_PLAY_SERVICE_ACCOUNT`
  (o JSON completo da conta de serviço) tinha 2 365 bytes. As duas variáveis
  da Resend fizeram passar o limite.
- **Correção imediata** (feita pelo utilizador): guardar só `client_email` e
  `private_key` nesse JSON, o que poupa ~550 bytes. O código já só usa esses
  dois campos (`server/utils/googlePlay.ts`).
- **O problema volta:** cada integração nova (ex. Upgrade 09, chaves de
  outros fornecedores) aproxima-nos outra vez do limite.

## Opções

| | Opção | Prós | Contras |
|---|---|---|---|
| A | **Preset `netlify` (funções modernas)** | Sem limite de 4 KB; é o caminho recomendado pela Netlify | Mudança de runtime: testar SSR, cookies, `waitUntil`, tamanho do bundle e o script de deploy (hoje empacota à mão por causa das ligações simbólicas no Windows) |
| B | Ligar o repositório à Netlify (build no Linux deles) e depois A | Acaba com o build local de ~45 min e com as cópias das ligações simbólicas | Mexe no fluxo de deploy; as variáveis "de build" e "de runtime" passam a ser lidas no Linux da Netlify |
| C | Tirar segredos grandes das variáveis (ex. conta de serviço guardada cifrada na base de dados, com só a chave de cifra em variável) | Não muda a infraestrutura | Mais código de segurança, para contornar uma limitação |

**Recomendação: A**, testada primeiro num deploy de rascunho (`--alias`,
como no Upgrade 03), e B a seguir, se o tempo de build continuar a ser um
problema.

## Tarefas (opção A)

- [ ] `nuxt.config.ts`: `nitro.preset = 'netlify'`; ajustar
      `scripts/deploy-netlify.mjs` à nova pasta das funções.
- [ ] Deploy de rascunho: login, 2FA, webhooks (EasyPay, RTDN), crons,
      orçamento por IA, digitalização de documentos, recuperação de
      password.
- [ ] Confirmar que a variável de teste de 5 KB (soma) deixa de ser recusada.
- [ ] Atualizar `context/OPERATIONS.md` ("Deploy web") e
      `CONFIG-REFERENCE.md`.

## Critérios de aceitação

- [ ] Deploy aceite com mais de 4 KB de variáveis.
- [ ] Todos os fluxos acima a funcionar no rascunho antes de ir para
      produção.
