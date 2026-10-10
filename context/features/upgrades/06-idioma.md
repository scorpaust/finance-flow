# UPGRADE 06 — Idioma: escolher antes de entrar, acompanhar o telemóvel, sem textos por traduzir

> Origem: relatório dos testes fechados (Testers Community, 2026-10-10),
> ponto 2 "Language Accessibility Options": a língua da interface "não é
> fácil de perceber ou não corresponde à língua preferida do utilizador".
> Sem crashes nem falhas reportados.

## O que já existe

- 6 línguas (pt-PT, en, fr, de, it, es).
- Deteção automática na 1.ª visita (`plugins/locale.ts`): `Accept-Language`
  no servidor e `navigator.languages` no client. Sem correspondência, inglês.
- Escolha manual em Definições → Idioma.

## Problemas encontrados no código

1. **Não se escolhe a língua antes de entrar.** O seletor só existe nas
   Definições, com sessão iniciada. Quem cai numa língua que não percebe
   (ex. telemóvel em hindi → inglês) tem de registar-se nessa língua.
2. **A deteção só acontece uma vez.** O resultado fica gravado no cookie
   `financeflow_locale` durante 1 ano e não volta a ser lido. Se o telemóvel
   mudar de língua, a app não acompanha, mesmo que a pessoa nunca tenha
   escolhido uma língua à mão.
3. **Textos fixos em português, vistos por toda a gente:**
   - Previsões, progresso do treino: "A carregar TF.js...", "A inicializar
     backend...", "A treinar modelo..." (`composables/useMLPrediction.ts`);
   - Definições → Bloqueio biométrico: a mensagem de diagnóstico ("sem
     biometria disponível…", "plataforma … (não é a app nativa)",
     `stores/appLock.ts`), mostrada na interface.
4. **Categorias por omissão na língua do registo.** Mudar a língua da app
   não muda "Salário", "Habitação"… São dados do utilizador, que os pode
   renomear, mas as que nunca foram mexidas podiam acompanhar a língua.
5. **Jargão técnico nas Previsões** ("ConvNeXt-1D", "Layer Normalization",
   "Epoch") em todas as línguas.

## Proposta

- **Seletor de língua no ecrã de entrada** (e nas páginas públicas:
  recuperação de password, privacidade, termos): um botão com o nome da
  língua atual ("Português ▾"), compacto, no topo.
- **Distinguir "detetada" de "escolhida":**
  - um cookie `financeflow_locale_source` com o valor `auto` ou `user`;
  - com `auto`, a deteção volta a correr a cada visita (acompanha o
    telemóvel);
  - com `user`, a escolha manual fica sempre;
  - escolher nas Definições ou no ecrã de entrada grava `user`;
  - cookies atuais sem origem contam como `user` (decidido na implementação):
    a escolha nas Definições gravava o mesmo cookie, por isso não se
    distingue de uma deteção. Assim ninguém vê a língua mudar sozinha depois
    do deploy; só as deteções novas ficam `auto`.
- **Traduzir os textos fixos** (pontos 3 e 5):
  - estado do treino por chave i18n;
  - diagnóstico da biometria: frase traduzida para o utilizador e o detalhe
    técnico só no log;
  - Previsões com linguagem simples (o nome do modelo só num "saber mais").
- **Categorias:** ao mudar de língua, se houver categorias por omissão com o
  nome original (nunca renomeadas), perguntar "Traduzir as categorias por
  omissão para <língua>?". Um toque renomeia só essas, pelos nomes de
  `server/utils/defaultCategories.ts`.
- **Verificação contínua:** um teste que falha se aparecer texto em português
  fixo em `.vue`/composables fora dos ficheiros de tradução (lista de
  exceções para comentários e emojis), e outro que confirma que as 6 línguas
  têm as mesmas chaves.

## Implementação (2026-10-10)

- **Lógica de língua:** `shared/locale.ts` (pura, testada).
  - `plugins/locale.ts` usa-a a cada visita.
  - `composables/useAppLocale.ts` faz a escolha manual (Definições e
    `LanguageSwitcher`).
- **Defeito da Fase 7 encontrado pelos testes:** a correspondência procurava
  primeiro um código exato em **toda** a lista do dispositivo, por isso "de-AT,
  en" dava inglês. Agora segue a ordem de preferência: para cada língua, o
  código exato ou só a língua.
- **Seletor:** `components/ui/LanguageSwitcher.vue` no login, na recuperação de
  password e nas páginas legais. Os nomes das línguas aparecem sempre na
  própria língua.
- **Tradução das categorias:**
  - `POST /api/categories/translate-defaults` (`dryRun` conta);
  - só as `isDefault` com um nome por omissão de qualquer língua (nunca
    renomeadas);
  - um nome já ocupado fica como está;
  - nas Definições, ao mudar de língua, aparece "Traduzi-las para esta
    língua?".
- **Textos fixos:**
  - o estado do treino nas Previsões passa por i18n;
  - na biometria, um código traduzido e o detalhe técnico, em inglês, dentro
    de "Detalhes técnicos";
  - as Previsões e o cartão do painel ficam sem "ConvNeXt-1D", "Layer
    Normalization" nem "Epoch".
- **Verificação contínua** (`tests/i18nConsistency.test.ts`):
  - as 6 línguas com as mesmas chaves;
  - nenhum texto acentuado escrito diretamente no código do cliente.

## Tarefas

- [x] Componente `LanguageSwitcher` (login e páginas públicas; reutilizado
      nas Definições).
- [x] `plugins/locale.ts`: origem `auto`/`user`; re-deteção com `auto`.
- [x] Chaves i18n para o treino das Previsões e para a biometria; textos das
      Previsões sem jargão.
- [x] `POST /api/categories/translate-defaults` (só as não renomeadas) e o
      pedido de confirmação ao mudar de língua.
- [x] Testes:
  - unitários: deteção e origem;
  - integração: tradução só das não renomeadas;
  - E2E: mudar a língua no login antes de criar conta, e a conta nasce
    nessa língua;
  - verificação de texto fixo em português e de chaves iguais nas 6 línguas.

## Critérios de aceitação

- [x] Quem abre a app numa língua que não percebe muda-a no ecrã de entrada,
      antes de criar conta.
- [x] Com a língua "automática", mudar a língua do telemóvel muda a da app na
      visita seguinte; uma escolha manual nunca é substituída.
- [x] Nenhum texto visível em português quando a app está noutra língua.
