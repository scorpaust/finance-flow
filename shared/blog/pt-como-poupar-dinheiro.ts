import type { BlogPost } from './index'

export const comoPouparDinheiro: BlogPost = {
  key: 'save-money',
  slug: 'como-poupar-dinheiro',
  lang: 'pt',
  title: 'Como poupar dinheiro: 6 passos que funcionam mesmo',
  description: 'Um método simples para poupar todos os meses: saber para onde vai o dinheiro, poupar primeiro, pôr limites por categoria e criar um fundo de emergência.',
  published: '2026-10-24',
  blocks: [
    { type: 'p', text: 'Quase toda a gente quer poupar mais, e quase toda a gente já tentou. O problema raramente é falta de força de vontade: é tentar cortar gastos sem saber quais são. Estes seis passos seguem uma ordem pensada para isso. Primeiro percebes para onde vai o dinheiro, depois decides o que mudar.' },

    { type: 'h2', text: '1. Regista todos os gastos durante dois meses' },
    { type: 'p', text: 'Antes de mudar qualquer coisa, aponta tudo o que gastas: supermercado, cafés, combustível, entregas ao domicílio, subscrições, a prenda de anos do colega. Não cortes nada ainda. O objetivo é ter uma fotografia real dos teus gastos, não a que tens na cabeça.' },
    { type: 'p', text: 'No fim do primeiro mês, agrupa os gastos por categoria. A maioria das pessoas fica surpreendida com os pequenos valores repetidos: três euros por dia em cafés e lanches são cerca de 90 € por mês, mais de 1000 € por ano.' },
    { type: 'tip', text: 'Regista o gasto no momento, no telemóvel. Quem deixa para o fim do dia esquece-se de metade, e quem deixa para o fim da semana desiste.' },

    { type: 'h2', text: '2. Poupa primeiro, gasta depois' },
    { type: 'p', text: 'Se poupares o que sobra no fim do mês, vais poupar pouco ou nada, porque raramente sobra. Inverte a ordem: no dia em que recebes o salário, transfere logo um valor fixo para uma conta separada, e só depois começa a gastar.' },
    { type: 'p', text: 'Começa com um valor que não doa, mesmo que sejam 5 % do salário. É mais fácil aumentar uma poupança que já existe do que começar uma grande. Se o teu banco permitir, agenda uma transferência automática para o dia a seguir ao pagamento do salário: assim nem tens de te lembrar.' },

    { type: 'h2', text: '3. Dá um limite mensal a cada categoria' },
    { type: 'p', text: 'Com os dados do passo 1, define quanto queres gastar por mês em cada categoria: alimentação, restaurantes, transportes, lazer, compras. Não precisa de ser perfeito. Começa pelo que gastaste em média e corta um pouco nas categorias que te surpreenderam.' },
    { type: 'p', text: 'Uma forma simples de começar é a regra 50/30/20: cerca de 50 % do rendimento para necessidades (casa, contas, alimentação, transportes), 30 % para desejos e 20 % para poupança. Não é uma lei, é um ponto de partida que depois ajustas à tua realidade.' },
    { type: 'tip', text: 'Exemplo: com um salário líquido de 1200 €, seriam cerca de 600 € para necessidades, 360 € para desejos e 240 € para poupar. Se a renda já leva 550 €, os números mudam, e não faz mal: o importante é decidires os limites antes de o mês começar.' },
    { type: 'p', text: 'Quando o limite de uma categoria acaba, acabou até ao mês seguinte. Se uma categoria rebenta todos os meses, o limite estava irrealista: ajusta-o e tira a diferença de outra.' },

    { type: 'h2', text: '4. Revê as subscrições e os débitos diretos' },
    { type: 'p', text: 'Streaming, ginásio, armazenamento na nuvem, aplicações, revistas, seguros que já não fazem sentido. Cada um parece pouco, mas juntos chegam facilmente a 50 € ou 100 € por mês.' },
    { type: 'ul', items: [
      'Abre o extrato dos últimos três meses e lista todos os pagamentos que se repetem.',
      'Cancela o que não usaste no último mês. Se fizer falta, voltas a subscrever.',
      'Nos serviços que ficam, vê se há um plano mais barato ou partilhado.',
      'Repete esta revisão duas vezes por ano.',
    ] },

    { type: 'h2', text: '5. Cria um fundo de emergência antes de investir' },
    { type: 'p', text: 'Um fundo de emergência é dinheiro guardado só para imprevistos: o carro que avaria, uma conta do dentista, um mês sem rendimento. O valor habitual é o equivalente a três a seis meses de despesas essenciais, num sítio onde o consigas levantar depressa.' },
    { type: 'p', text: 'Sem este fundo, um imprevisto acaba no cartão de crédito ou num crédito pessoal, e os juros comem o que poupaste. Com ele, um mês mau é só um mês mau. Só depois de o teres faz sentido pensar em investir.' },

    { type: 'h2', text: '6. Espera 48 horas antes das compras não essenciais' },
    { type: 'p', text: 'Muitas compras por impulso deixam de parecer necessárias passados dois dias. Antes de qualquer compra que não seja essencial acima de um valor que decidas (por exemplo, 50 €), põe-na numa lista e espera 48 horas. Se ainda a quiseres, compra-a sem culpa e dentro do limite da categoria.' },
    { type: 'p', text: 'Ajuda também desligar as notificações de promoções das lojas e não guardar os dados do cartão nos sites onde costumas comprar por impulso. Um passo a mais é muitas vezes o suficiente para desistires.' },

    { type: 'h2', text: 'O que fazer a seguir' },
    { type: 'p', text: 'Não precisas de aplicar os seis passos de uma vez. Começa pelo primeiro: regista os gastos durante um mês. Tudo o resto fica mais fácil quando sabes para onde vai o dinheiro.' },
    { type: 'p', text: 'Podes fazê-lo num caderno ou numa folha de cálculo. O que importa é manteres o registo. Se preferires uma app, o FinanceFlow foi feito para isto: registas um gasto em segundos e vês para onde vai o dinheiro, por categoria e por mês, no plano gratuito. Nos planos pagos, defines limites mensais por categoria e recebes um alerta antes de passares o limite.' },
  ],
}
