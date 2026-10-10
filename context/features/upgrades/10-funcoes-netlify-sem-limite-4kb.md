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

## Implementação (2026-10-10)

- **Causa:** o Nitro 2 só escolhe o preset `netlify` (Functions v2) quando a
  `compatibilityDate` do projeto é ≥ 2024-05-07 (nitropack
  `presets/netlify/preset.mjs` e `presets/_resolve.mjs`). O projeto não tinha
  data, e o Nuxt usava `2024-04-03`, por isso escolhia o `netlify-legacy`.
- **Correção:** `compatibilityDate: '2024-05-07'` em `nuxt.config.ts`.
  - A data não muda mais nada no Nitro 2 (só a escolha de presets).
  - A pasta das funções é a mesma (`.netlify/functions-internal`), por isso o
    script de deploy só ganhou `--alias <nome>` para rascunhos.
- **Rascunho** `https://upgrade-10--financeflow-webapp.netlify.app`, com o
  build a confirmar "Nitro preset: netlify". Testado:
  - páginas públicas;
  - login e sessão (dois cookies), painel com SSR, subscrição, transações,
    previsões, orçamento por IA;
  - país detetado (PT → MB WAY e Multibanco: os cabeçalhos `x-nf-*`
    continuam a chegar);
  - preços lidos da Google Play;
  - recuperação de password;
  - endpoint RTDN (401 sem autenticação).

## Tarefas (opção A)

- [x] `nuxt.config.ts`: `compatibilityDate: '2024-05-07'` (em vez de forçar
      `nitro.preset`: assim a deteção automática continua a funcionar); o
      script de deploy só precisou de `--alias`.
- [x] Deploy de rascunho testado: páginas, login e sessão, orçamento por IA,
      RTDN (sem autenticação), preços da Google Play, recuperação de
      password, país. Não testados no rascunho: 2FA, crons e digitalização de
      documentos (não dependem do tipo de função; verificar em produção se
      houver dúvidas).
- [ ] Confirmar com uma variável de teste que a soma acima de 4 KB é aceite (depois do deploy de produção).
- [x] Atualizar `context/OPERATIONS.md` ("Deploy web") e
      `CONFIG-REFERENCE.md`.

## Critérios de aceitação

- [ ] Deploy aceite com mais de 4 KB de variáveis.
- [x] Os fluxos testados a funcionar no rascunho antes de ir para
      produção.
