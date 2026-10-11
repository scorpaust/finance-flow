import type { HelpSection } from '../helpContent'

export const helpPt: HelpSection[] = [
  {
    id: 'transactions',
    title: 'Transações e categorias',
    items: [
      { id: 'add-transaction', q: 'Como registo uma despesa ou uma receita?', a: 'Toca no botão + (ou em "Nova transação" no painel), escolhe o tipo, o valor, a categoria e a data. Nos planos Pro e Premium também podes tirar uma foto a um recibo ou fatura: a IA preenche os campos e tu revês antes de guardar.' },
      { id: 'categories', q: 'Posso criar as minhas categorias?', a: 'Sim, em Definições → Categorias. No plano Gratuito podes ter 2 categorias próprias, além das que vêm com a conta; no Pro e no Premium são ilimitadas.' },
      { id: 'free-limit', q: 'O plano Gratuito tem limites?', a: 'Até 50 transações por mês e 2 categorias próprias. O painel e os gráficos por categoria estão incluídos.' },
      { id: 'currency', q: 'Posso ver os valores noutra moeda?', a: 'Sim, em Definições → Moeda escolhes entre mais de 100 moedas. Os valores são convertidos ao câmbio do dia; os teus dados continuam guardados em euros.' },
    ],
  },
  {
    id: 'budgets',
    title: 'Grupos e orçamentos',
    items: [
      { id: 'groups', q: 'Para que servem os grupos?', a: 'Juntam as transações de um tema (casa, férias, um projeto) e permitem um teto mensal ou semanal, com um alerta quando chegas a uma percentagem desse teto. Disponível nos planos Pro e Premium.' },
      { id: 'ai-budget', q: 'O que é o orçamento sugerido por IA?', a: 'No Premium, com pelo menos 3 meses completos de despesas, a app propõe um limite mensal para cada categoria e grupo, a partir das tuas receitas, dos gastos fixos, do fundo de maneio e da meta de poupança. Revês, ajustas e aplicas — e podes desfazer.' },
      { id: 'ai-budget-once', q: 'Porque só posso pedir o orçamento uma vez por mês?', a: 'Cada pedido usa a IA e a proposta fica guardada para o resto do mês: podes aplicá-la e desfazê-la as vezes que quiseres. No mês seguinte podes pedir uma nova.' },
      { id: 'fixed-costs', q: 'O que são gastos fixos e fundo de maneio?', a: 'Gastos fixos são despesas regulares que não se cortam (renda, contas, assinaturas): a app nunca lhes reduz o limite. O fundo de maneio é a parte da receita que fica livre para imprevistos — por omissão, 10%.' },
    ],
  },
  {
    id: 'ai',
    title: 'IA e privacidade',
    items: [
      { id: 'ai-data', q: 'Que dados vão para a IA?', a: 'Só totais já calculados (por mês e por categoria), nomes de categorias e, no orçamento sugerido, a receita esperada e as percentagens que escolhes. As descrições das tuas transações nunca são enviadas.' },
      { id: 'scan-privacy', q: 'O que acontece às fotos dos recibos?', a: 'A imagem ou o PDF é enviado à IA só para ler os campos, é processado em memória e não fica guardado. Evita documentos com dados pessoais desnecessários.' },
      { id: 'investment-tips', q: 'As dicas de investimento são aconselhamento financeiro?', a: 'Não. São conteúdo educativo adaptado ao teu perfil de risco (Premium) e podem ter erros. As decisões e os riscos são teus.' },
    ],
  },
  {
    id: 'forecasts',
    title: 'Previsões',
    items: [
      { id: 'forecast-how', q: 'Como funcionam as previsões?', a: 'No Premium, um modelo de IA aprende com os teus meses completos e prevê as receitas, as despesas e o saldo dos próximos 3 meses. Corre no teu dispositivo: os dados não saem dele para isso.' },
      { id: 'forecast-simple', q: 'Porque aparece "previsão simples"?', a: 'O modelo de IA precisa de 5 meses completos. Com 2 a 4, a app segue a tendência dos teus meses. O mês em curso nunca conta, porque ainda está incompleto.' },
    ],
  },
  {
    id: 'subscription',
    title: 'Subscrição e pagamentos',
    items: [
      { id: 'plans', q: 'Que planos existem?', a: 'Gratuito, Pro e Premium. Vê o que inclui cada um e os preços em Subscrição.' },
      { id: 'payment-methods', q: 'Como posso pagar?', a: 'No site: cartão ou débito direto (com renovação automática), MB WAY ou Multibanco (pagamento único de 1, 3, 6 ou 12 meses). Na app Android, pela Google Play.' },
      { id: 'cancel', q: 'Como cancelo a subscrição?', a: 'Se compraste no site, em Definições → Subscrição; manténs o acesso até ao fim do período pago. Se compraste na app Android, cancela na Google Play (Pagamentos e subscrições).' },
      { id: 'refund', q: 'Posso pedir o reembolso?', a: 'Sim, nos primeiros 14 dias e sem indicar o motivo (direito de livre resolução): escreve-nos. Devolvemos o valor total e a conta é eliminada — os detalhes estão nos Termos, ponto 4.' },
    ],
  },
  {
    id: 'account',
    title: 'Segurança e conta',
    items: [
      { id: 'forgot-password', q: 'Esqueci-me da password. E agora?', a: 'No ecrã de entrada, toca em "Esqueci-me da password": enviamos-te um link, válido durante 30 minutos, para definires uma nova.' },
      { id: 'two-factor', q: 'Como ativo a autenticação de dois fatores?', a: 'Em Definições, na autenticação de dois fatores, lê o código QR com uma app autenticadora e guarda os códigos de recuperação. A partir daí, a entrada pede também o código da app.' },
      { id: 'biometric', q: 'Posso bloquear a app com a impressão digital?', a: 'Sim, na app Android, em Definições → Bloqueio biométrico. Precisas de ter uma impressão digital ou o rosto registados no telemóvel.' },
      { id: 'export-delete', q: 'Como exporto ou apago os meus dados?', a: 'Em Definições → Privacidade e dados podes descarregar tudo em JSON ou eliminar a conta e todos os dados.' },
      { id: 'language', q: 'Como mudo a língua?', a: 'No ecrã de entrada ou em Definições → Idioma. Se não escolheres nenhuma, a app acompanha a língua do telemóvel.' },
    ],
  },
]
