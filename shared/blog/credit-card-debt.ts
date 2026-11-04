import type { BlogPost } from './index'

// Sair das dívidas de cartão de crédito. A partir de um rascunho da Holo, corrigido:
// previsão dos próximos 3 meses (não do mês) e pagar o mínimo em todos os cartões.
// O PERSI e os subsídios só existem na versão portuguesa: noutros países as regras
// são outras, por isso essas versões remetem para o regulador de cada um.
export const creditCardDebtPosts: BlogPost[] = [
  {
    key: 'credit-card-debt',
    slug: 'como-sair-das-dividas-de-cartao-de-credito',
    lang: 'pt',
    title: 'Como sair das dívidas de cartão de crédito: guia em 5 passos',
    description: 'Como sair das dívidas de cartão de crédito: vê o valor real, para de usar o cartão, paga acima do mínimo, liberta dinheiro e procura alternativas.',
    published: '2026-11-04',
    blocks: [
      { type: 'p', text: 'O cartão de crédito é prático até ao dia em que o extrato chega e só consegues pagar o mínimo. A partir daí, a dívida desce muito devagar e os juros acumulam-se. Sair desta situação não depende de sorte nem de um aumento inesperado. Depende de uma ordem de passos e de alguma disciplina.' },
      { type: 'tip', text: 'Este artigo é informativo e não substitui aconselhamento financeiro ou jurídico. As condições variam de contrato para contrato.' },

      { type: 'h2', text: '1. Vê o valor real da dívida' },
      { type: 'p', text: 'Soma tudo: o saldo em dívida de cada cartão, o pagamento mínimo e o juro que cada um cobra (a TAEG). Escreve numa folha ou numa nota do telemóvel. É normal evitar olhar para este número, mas é difícil resolver o que não está medido.' },
      { type: 'p', text: 'Se tens mais do que um cartão, ordena-os do mais caro para o mais barato. É essa ordem que vai definir por onde começas.' },

      { type: 'h2', text: '2. Para de usar os cartões, sem os cortar todos' },
      { type: 'p', text: 'Cada compra nova anula parte do esforço que estás a fazer. Guarda os cartões numa gaveta ou remove-os da carteira digital, e passa para outro meio de pagamento as subscrições que estejam no cartão. Não precisas de os cancelar todos: nesta fase, a regra é simplesmente não acrescentar dívida.' },
      { type: 'p', text: 'Se usas o cartão por causa de benefícios ou cashback, só compensa se pagares o total do extrato todos os meses. Caso contrário, o que ganhas em benefícios é quase sempre menor do que o que pagas em juros.' },

      { type: 'h2', text: '3. Paga o mínimo em todos e mais no cartão mais caro' },
      { type: 'p', text: 'Paga sempre pelo menos o mínimo em todos os cartões, porque falhar um pagamento traz custos e fica registado. O que conseguires pagar a mais vai para o cartão com o juro mais alto, mesmo que sejam 20 ou 30 euros. Quando esse ficar a zero, passa esse valor para o seguinte.' },
      { type: 'p', text: 'Se receberes subsídio de férias ou de Natal, um reembolso ou um trabalho extra, usa uma parte para abater ao cartão mais caro.' },

      { type: 'h2', text: '4. Liberta dinheiro no orçamento' },
      { type: 'p', text: 'Para pagares mais do que o mínimo, precisas de espaço no mês:' },
      { type: 'ul', items: [
        'Corta o que não usas: subscrições esquecidas, tarifários antigos, entregas frequentes.',
        'Renegocia os contratos fixos uma vez por ano: telecomunicações, seguros e energia.',
        'Define um valor mensal só para a dívida e trata-o como uma despesa obrigatória, tal como a renda.',
      ] },
      { type: 'p', text: 'Não esperes pelo mês perfeito para começar. Começa com o valor que consegues manter.' },

      { type: 'h2', text: '5. Se não consegues avançar, procura alternativas' },
      { type: 'p', text: 'Se os juros consomem quase tudo o que pagas, há outros caminhos:' },
      { type: 'ul', items: [
        'Transferir o saldo para um cartão com condições promocionais. Confirma as comissões e a data em que o juro normal volta.',
        'Consolidar a dívida num crédito pessoal com taxa mais baixa. Só ajuda se não voltares a usar o cartão.',
        'Falar com o banco sobre um plano de pagamento, de preferência antes de falhares uma prestação.',
      ] },
      { type: 'p', text: 'Compara sempre o custo total, não só a prestação mensal: pagar menos por mês durante mais anos pode sair muito mais caro.' },
      { type: 'p', text: 'Se já estás em incumprimento, em Portugal os bancos têm de seguir um procedimento de negociação, o PERSI. O incumprimento é também comunicado à Central de Responsabilidades de Crédito do Banco de Portugal. Em situações de sobre-endividamento, procura uma entidade de apoio ao consumidor endividado. Pedir ajuda cedo dá-te mais opções.' },

      { type: 'h2', text: 'Como evitar voltar ao mesmo sítio' },
      { type: 'p', text: 'Depois de limpares o cartão, três hábitos fazem a diferença: pagar o total do extrato todos os meses, ter uma reserva de emergência para imprevistos e saber quanto podes gastar antes de gastar.' },
      { type: 'p', text: 'O FinanceFlow pode ajudar nesta parte. No plano gratuito, com até 50 transações por mês, registas receitas e despesas e vês para onde vai o dinheiro. O plano Pro acrescenta limites com alerta e explicações da IA. O Premium acrescenta previsões para os próximos 3 meses e uma proposta de orçamento feita pela IA. A app não liga às contas bancárias nem paga dívidas por ti: serve para veres quanto sobra para as abater.' },

      { type: 'h2', text: 'O plano em resumo' },
      { type: 'ol', items: [
        'Soma tudo e ordena as dívidas da mais cara para a mais barata.',
        'Para de fazer compras com o cartão até teres o saldo a zero.',
        'Paga o mínimo em todos e o que puderes a mais no cartão mais caro.',
        'Liberta espaço no orçamento e trata o pagamento da dívida como despesa fixa.',
        'Se os juros te ultrapassarem, procura alternativas e compara sempre o custo total.',
      ] },
      { type: 'p', text: 'Sair do vermelho é uma sequência de meses certos. Começa hoje pelo primeiro passo: soma o valor real da dívida.' },
    ],
  },
  {
    key: 'credit-card-debt',
    slug: 'how-to-get-out-of-credit-card-debt',
    lang: 'en',
    title: 'How to get out of credit card debt: a 5-step guide',
    description: 'How to get out of credit card debt: see the real amount, stop using the card, pay above the minimum, free up money and look at other options.',
    published: '2026-11-04',
    blocks: [
      { type: 'p', text: 'A credit card is convenient until the day the statement arrives and you can only pay the minimum. From then on, the debt falls very slowly and the interest piles up. Getting out of this does not depend on luck or an unexpected raise. It depends on doing things in the right order, with some discipline.' },
      { type: 'tip', text: 'This article is for information only and does not replace financial or legal advice. Terms vary from contract to contract, and rules vary from country to country.' },

      { type: 'h2', text: '1. See the real amount you owe' },
      { type: 'p', text: 'Add it all up: the balance on each card, the minimum payment and the interest rate each one charges (the APR). Write it on paper or in a note on your phone. It is normal to avoid looking at this number, but it is hard to solve something you have not measured.' },
      { type: 'p', text: 'If you have more than one card, rank them from most expensive to cheapest. That order decides where you start.' },

      { type: 'h2', text: '2. Stop using the cards, without cutting them all up' },
      { type: 'p', text: 'Every new purchase undoes part of your effort. Put the cards in a drawer or remove them from your digital wallet, and move any subscriptions on the card to another payment method. You do not have to cancel them all: at this stage, the rule is simply not to add any more debt.' },
      { type: 'p', text: 'If you use the card for rewards or cashback, it only pays off if you clear the full statement every month. Otherwise, what you earn in rewards is almost always less than what you pay in interest.' },

      { type: 'h2', text: '3. Pay the minimum on all, and more on the most expensive' },
      { type: 'p', text: 'Always pay at least the minimum on every card, because a missed payment brings costs and may go on your credit record. Whatever extra you can pay goes to the card with the highest interest rate, even if it is only 20 or 30 euros. Once that card reaches zero, move that amount to the next one.' },
      { type: 'p', text: 'If you get a bonus, a refund or extra work, use part of it to pay down the most expensive card.' },

      { type: 'h2', text: '4. Free up money in your budget' },
      { type: 'p', text: 'To pay more than the minimum, you need room in your month:' },
      { type: 'ul', items: [
        'Cut what you do not use: forgotten subscriptions, old phone plans, frequent deliveries.',
        'Renegotiate your fixed contracts once a year: phone and internet, insurance and energy.',
        'Set a monthly amount just for the debt and treat it as a required expense, like rent.',
      ] },
      { type: 'p', text: 'Do not wait for the perfect month to start. Start with the amount you can keep up.' },

      { type: 'h2', text: '5. If you are not making progress, look at other options' },
      { type: 'p', text: 'If interest eats up almost everything you pay, there are other routes:' },
      { type: 'ul', items: [
        'Transfer the balance to a card with promotional terms. Check the fees and the date when normal interest returns.',
        'Consolidate the debt into a personal loan at a lower rate. It only helps if you do not go back to using the card.',
        'Talk to your bank about a payment plan, ideally before you miss a payment.',
      ] },
      { type: 'p', text: 'Always compare the total cost, not just the monthly payment: paying less each month over more years can cost far more.' },
      { type: 'p', text: 'What happens after a missed payment, and what protections you have, depends on the country you live in. Your national financial regulator or a debt advice service can tell you what applies to you. Asking for help early gives you more options.' },

      { type: 'h2', text: 'How to avoid ending up here again' },
      { type: 'p', text: 'Once the card is clear, three habits make the difference: paying the full statement every month, having an emergency fund for the unexpected and knowing how much you can spend before you spend it.' },
      { type: 'p', text: 'FinanceFlow can help with this part. On the free plan, with up to 50 transactions a month, you log income and expenses and see where your money goes. The Pro plan adds limits with alerts and AI explanations. Premium adds forecasts for the next 3 months and a budget proposal from the AI. The app does not connect to bank accounts or pay debts for you: it shows you how much is left to pay them down.' },

      { type: 'h2', text: 'The plan in short' },
      { type: 'ol', items: [
        'Add it all up and rank your debts from most expensive to cheapest.',
        'Stop buying with the card until the balance is zero.',
        'Pay the minimum on all of them and whatever extra you can on the most expensive.',
        'Free up room in your budget and treat the debt payment as a fixed expense.',
        'If the interest gets ahead of you, look at other options and always compare the total cost.',
      ] },
      { type: 'p', text: 'Getting out of the red is a series of good months. Start today with the first step: add up what you really owe.' },
    ],
  },
  {
    key: 'credit-card-debt',
    slug: 'como-salir-de-las-deudas-de-tarjeta-de-credito',
    lang: 'es',
    title: 'Cómo salir de las deudas de tarjeta de crédito: guía en 5 pasos',
    description: 'Cómo salir de las deudas de tarjeta de crédito: ve el importe real, deja de usar la tarjeta, paga más del mínimo, libera dinero y busca alternativas.',
    published: '2026-11-04',
    blocks: [
      { type: 'p', text: 'La tarjeta de crédito es práctica hasta el día en que llega el extracto y solo puedes pagar el mínimo. A partir de ahí, la deuda baja muy despacio y los intereses se acumulan. Salir de esta situación no depende de la suerte ni de un aumento inesperado. Depende de un orden de pasos y de algo de disciplina.' },
      { type: 'tip', text: 'Este artículo es informativo y no sustituye el asesoramiento financiero o jurídico. Las condiciones varían de un contrato a otro, y las normas, de un país a otro.' },

      { type: 'h2', text: '1. Mira el importe real de la deuda' },
      { type: 'p', text: 'Súmalo todo: el saldo pendiente de cada tarjeta, el pago mínimo y el interés que cobra cada una (la TAE). Escríbelo en una hoja o en una nota del móvil. Es normal evitar mirar este número, pero es difícil resolver lo que no se ha medido.' },
      { type: 'p', text: 'Si tienes más de una tarjeta, ordénalas de la más cara a la más barata. Ese orden decide por dónde empiezas.' },

      { type: 'h2', text: '2. Deja de usar las tarjetas, sin cortarlas todas' },
      { type: 'p', text: 'Cada compra nueva anula parte de tu esfuerzo. Guarda las tarjetas en un cajón o quítalas de la cartera digital, y pasa a otro medio de pago las suscripciones que tengas en la tarjeta. No hace falta cancelarlas todas: en esta fase, la regla es simplemente no añadir más deuda.' },
      { type: 'p', text: 'Si usas la tarjeta por sus ventajas o por el cashback, solo compensa si pagas el total del extracto cada mes. Si no, lo que ganas en ventajas es casi siempre menos de lo que pagas en intereses.' },

      { type: 'h2', text: '3. Paga el mínimo en todas y más en la tarjeta más cara' },
      { type: 'p', text: 'Paga siempre al menos el mínimo en todas las tarjetas, porque un impago trae costes y puede quedar registrado. Lo que puedas pagar de más va a la tarjeta con el interés más alto, aunque sean 20 o 30 euros. Cuando esa llegue a cero, pasa ese importe a la siguiente.' },
      { type: 'p', text: 'Si recibes una prima, un reembolso o un trabajo extra, usa una parte para reducir la tarjeta más cara.' },

      { type: 'h2', text: '4. Libera dinero en el presupuesto' },
      { type: 'p', text: 'Para pagar más del mínimo, necesitas margen en el mes:' },
      { type: 'ul', items: [
        'Recorta lo que no usas: suscripciones olvidadas, tarifas antiguas, pedidos a domicilio frecuentes.',
        'Renegocia los contratos fijos una vez al año: telecomunicaciones, seguros y energía.',
        'Define un importe mensual solo para la deuda y trátalo como un gasto obligatorio, igual que el alquiler.',
      ] },
      { type: 'p', text: 'No esperes al mes perfecto para empezar. Empieza con el importe que puedas mantener.' },

      { type: 'h2', text: '5. Si no consigues avanzar, busca alternativas' },
      { type: 'p', text: 'Si los intereses se comen casi todo lo que pagas, hay otros caminos:' },
      { type: 'ul', items: [
        'Transferir el saldo a una tarjeta con condiciones promocionales. Comprueba las comisiones y la fecha en que vuelve el interés normal.',
        'Consolidar la deuda en un préstamo personal con un tipo más bajo. Solo ayuda si no vuelves a usar la tarjeta.',
        'Hablar con el banco sobre un plan de pagos, preferiblemente antes de que falles un pago.',
      ] },
      { type: 'p', text: 'Compara siempre el coste total, no solo la cuota mensual: pagar menos al mes durante más años puede salir mucho más caro.' },
      { type: 'p', text: 'Lo que ocurre tras un impago, y las protecciones que tienes, dependen del país en el que vives. El regulador financiero de tu país o un servicio de asesoramiento sobre deudas pueden decirte qué se aplica en tu caso. Pedir ayuda pronto te da más opciones.' },

      { type: 'h2', text: 'Cómo evitar volver al mismo sitio' },
      { type: 'p', text: 'Después de dejar la tarjeta a cero, tres hábitos marcan la diferencia: pagar el total del extracto cada mes, tener un fondo de emergencia para imprevistos y saber cuánto puedes gastar antes de gastarlo.' },
      { type: 'p', text: 'FinanceFlow puede ayudar en esta parte. En el plan gratuito, con hasta 50 transacciones al mes, registras ingresos y gastos y ves adónde va el dinero. El plan Pro añade límites con aviso y explicaciones de la IA. Premium añade previsiones para los próximos 3 meses y una propuesta de presupuesto hecha por la IA. La app no se conecta a las cuentas bancarias ni paga deudas por ti: sirve para ver cuánto queda para reducirlas.' },

      { type: 'h2', text: 'El plan en resumen' },
      { type: 'ol', items: [
        'Súmalo todo y ordena las deudas de la más cara a la más barata.',
        'Deja de comprar con la tarjeta hasta tener el saldo a cero.',
        'Paga el mínimo en todas y lo que puedas de más en la tarjeta más cara.',
        'Libera margen en el presupuesto y trata el pago de la deuda como un gasto fijo.',
        'Si los intereses te superan, busca alternativas y compara siempre el coste total.',
      ] },
      { type: 'p', text: 'Salir de los números rojos es una sucesión de meses bien hechos. Empieza hoy por el primer paso: suma el importe real de la deuda.' },
    ],
  },
  {
    key: 'credit-card-debt',
    slug: 'comment-sortir-des-dettes-de-carte-de-credit',
    lang: 'fr',
    title: 'Comment sortir des dettes de carte de crédit : guide en 5 étapes',
    description: 'Sortir des dettes de carte de crédit : voir le montant réel, cesser d\'utiliser la carte, payer plus que le minimum, libérer de l\'argent, chercher des solutions.',
    published: '2026-11-04',
    blocks: [
      { type: 'p', text: 'La carte de crédit est pratique jusqu\'au jour où le relevé arrive et où vous ne pouvez payer que le minimum. À partir de là, la dette baisse très lentement et les intérêts s\'accumulent. S\'en sortir ne dépend ni de la chance ni d\'une augmentation inattendue. Cela dépend d\'un ordre d\'étapes et d\'un peu de discipline.' },
      { type: 'tip', text: 'Cet article est informatif et ne remplace pas un conseil financier ou juridique. Les conditions varient d\'un contrat à l\'autre, et les règles d\'un pays à l\'autre.' },

      { type: 'h2', text: '1. Regardez le montant réel de la dette' },
      { type: 'p', text: 'Additionnez tout : le solde dû sur chaque carte, le paiement minimum et le taux que chacune applique (le TAEG). Notez-le sur une feuille ou dans votre téléphone. Il est normal d\'éviter de regarder ce chiffre, mais il est difficile de résoudre ce qu\'on n\'a pas mesuré.' },
      { type: 'p', text: 'Si vous avez plusieurs cartes, classez-les de la plus chère à la moins chère. C\'est cet ordre qui décide par où commencer.' },

      { type: 'h2', text: '2. Cessez d\'utiliser les cartes, sans toutes les couper' },
      { type: 'p', text: 'Chaque nouvel achat annule une partie de votre effort. Rangez les cartes dans un tiroir ou retirez-les de votre portefeuille numérique, et passez sur un autre moyen de paiement les abonnements réglés par carte. Inutile de toutes les résilier : à ce stade, la règle est simplement de ne plus ajouter de dette.' },
      { type: 'p', text: 'Si vous utilisez la carte pour ses avantages ou son cashback, cela n\'est rentable que si vous réglez la totalité du relevé chaque mois. Sinon, ce que vous gagnez en avantages est presque toujours inférieur à ce que vous payez en intérêts.' },

      { type: 'h2', text: '3. Payez le minimum partout, et plus sur la carte la plus chère' },
      { type: 'p', text: 'Payez toujours au moins le minimum sur toutes les cartes, car un paiement manqué entraîne des frais et peut être enregistré. Ce que vous pouvez payer en plus va à la carte au taux le plus élevé, même s\'il ne s\'agit que de 20 ou 30 euros. Quand elle arrive à zéro, reportez ce montant sur la suivante.' },
      { type: 'p', text: 'Si vous recevez une prime, un remboursement ou un revenu ponctuel, utilisez-en une partie pour réduire la carte la plus chère.' },

      { type: 'h2', text: '4. Libérez de l\'argent dans votre budget' },
      { type: 'p', text: 'Pour payer plus que le minimum, il vous faut de la marge dans le mois :' },
      { type: 'ul', items: [
        'Supprimez ce que vous n\'utilisez pas : abonnements oubliés, anciens forfaits, livraisons fréquentes.',
        'Renégociez vos contrats fixes une fois par an : télécoms, assurances et énergie.',
        'Fixez un montant mensuel réservé à la dette et traitez-le comme une dépense obligatoire, au même titre que le loyer.',
      ] },
      { type: 'p', text: 'N\'attendez pas le mois parfait pour commencer. Commencez avec le montant que vous pouvez tenir.' },

      { type: 'h2', text: '5. Si vous n\'avancez pas, cherchez d\'autres solutions' },
      { type: 'p', text: 'Si les intérêts absorbent presque tout ce que vous payez, il existe d\'autres voies :' },
      { type: 'ul', items: [
        'Transférer le solde vers une carte à conditions promotionnelles. Vérifiez les frais et la date à laquelle le taux normal revient.',
        'Regrouper la dette dans un prêt personnel à taux plus bas. Cela n\'aide que si vous ne réutilisez pas la carte.',
        'Parler à votre banque d\'un plan de paiement, de préférence avant de manquer une échéance.',
      ] },
      { type: 'p', text: 'Comparez toujours le coût total, pas seulement la mensualité : payer moins chaque mois pendant plus d\'années peut coûter beaucoup plus cher.' },
      { type: 'p', text: 'Ce qui se passe après un paiement manqué, et les protections dont vous bénéficiez, dépendent du pays où vous vivez. Le régulateur financier de votre pays ou un service de conseil en matière de dettes peut vous dire ce qui s\'applique à votre cas. Demander de l\'aide tôt vous donne plus d\'options.' },

      { type: 'h2', text: 'Comment éviter de revenir au même point' },
      { type: 'p', text: 'Une fois la carte soldée, trois habitudes font la différence : régler la totalité du relevé chaque mois, avoir une épargne de précaution pour les imprévus et savoir combien vous pouvez dépenser avant de dépenser.' },
      { type: 'p', text: 'FinanceFlow peut vous aider sur ce point. Avec le plan gratuit, jusqu\'à 50 transactions par mois, vous saisissez revenus et dépenses et vous voyez où va l\'argent. Le plan Pro ajoute les plafonds avec alerte et les explications de l\'IA. Premium ajoute des prévisions pour les 3 prochains mois et une proposition de budget faite par l\'IA. L\'application ne se connecte pas aux comptes bancaires et ne paie pas les dettes à votre place : elle vous montre ce qui reste pour les réduire.' },

      { type: 'h2', text: 'Le plan en résumé' },
      { type: 'ol', items: [
        'Additionnez tout et classez les dettes de la plus chère à la moins chère.',
        'Cessez d\'acheter avec la carte jusqu\'à ce que le solde soit à zéro.',
        'Payez le minimum partout et ce que vous pouvez en plus sur la carte la plus chère.',
        'Libérez de la marge dans votre budget et traitez le paiement de la dette comme une dépense fixe.',
        'Si les intérêts vous dépassent, cherchez d\'autres solutions et comparez toujours le coût total.',
      ] },
      { type: 'p', text: 'Sortir du rouge, c\'est une suite de mois bien tenus. Commencez aujourd\'hui par la première étape : additionnez le montant réel de la dette.' },
    ],
  },
  {
    key: 'credit-card-debt',
    slug: 'kreditkartenschulden-loswerden',
    lang: 'de',
    title: 'Kreditkartenschulden loswerden: Anleitung in 5 Schritten',
    description: 'Kreditkartenschulden loswerden: den echten Betrag sehen, die Karte nicht mehr nutzen, mehr als das Minimum zahlen, Geld freimachen und Alternativen prüfen.',
    published: '2026-11-04',
    blocks: [
      { type: 'p', text: 'Die Kreditkarte ist praktisch, bis die Abrechnung kommt und du nur noch das Minimum zahlen kannst. Ab dann sinkt die Schuld sehr langsam, und die Zinsen summieren sich. Aus dieser Lage herauszukommen, hängt nicht von Glück oder einer unerwarteten Gehaltserhöhung ab. Es hängt von der richtigen Reihenfolge und etwas Disziplin ab.' },
      { type: 'tip', text: 'Dieser Artikel dient der Information und ersetzt keine Finanz- oder Rechtsberatung. Die Bedingungen unterscheiden sich von Vertrag zu Vertrag, die Regeln von Land zu Land.' },

      { type: 'h2', text: '1. Sieh dir den echten Schuldenbetrag an' },
      { type: 'p', text: 'Rechne alles zusammen: den offenen Betrag jeder Karte, die Mindestzahlung und den Zinssatz jeder Karte (den effektiven Jahreszins). Schreib es auf einen Zettel oder ins Handy. Es ist normal, diese Zahl zu meiden, aber was du nicht gemessen hast, lässt sich schwer lösen.' },
      { type: 'p', text: 'Wenn du mehrere Karten hast, sortiere sie von der teuersten zur günstigsten. Diese Reihenfolge entscheidet, wo du anfängst.' },

      { type: 'h2', text: '2. Nutze die Karten nicht mehr, ohne alle zu zerschneiden' },
      { type: 'p', text: 'Jeder neue Kauf macht einen Teil deiner Mühe zunichte. Leg die Karten in eine Schublade oder entferne sie aus der digitalen Geldbörse, und stell Abos, die über die Karte laufen, auf eine andere Zahlungsart um. Du musst nicht alle kündigen: In dieser Phase lautet die Regel einfach, keine neuen Schulden zu machen.' },
      { type: 'p', text: 'Wenn du die Karte wegen Vorteilen oder Cashback nutzt, lohnt sich das nur, wenn du jeden Monat die gesamte Abrechnung begleichst. Sonst ist das, was du an Vorteilen bekommst, fast immer weniger, als du an Zinsen zahlst.' },

      { type: 'h2', text: '3. Zahl überall das Minimum und mehr auf die teuerste Karte' },
      { type: 'p', text: 'Zahl immer mindestens das Minimum auf allen Karten, denn eine versäumte Zahlung verursacht Kosten und kann gespeichert werden. Was du darüber hinaus zahlen kannst, geht an die Karte mit dem höchsten Zins, auch wenn es nur 20 oder 30 Euro sind. Ist sie bei null, geht dieser Betrag an die nächste.' },
      { type: 'p', text: 'Wenn du einen Bonus, eine Rückzahlung oder einen Nebenverdienst bekommst, nutze einen Teil davon für die teuerste Karte.' },

      { type: 'h2', text: '4. Mach im Budget Geld frei' },
      { type: 'p', text: 'Um mehr als das Minimum zu zahlen, brauchst du Spielraum im Monat:' },
      { type: 'ul', items: [
        'Streich, was du nicht nutzt: vergessene Abos, alte Tarife, häufige Lieferungen.',
        'Verhandle deine festen Verträge einmal im Jahr neu: Telefon und Internet, Versicherungen und Energie.',
        'Leg einen Monatsbetrag nur für die Schulden fest und behandle ihn wie eine Pflichtausgabe, genau wie die Miete.',
      ] },
      { type: 'p', text: 'Warte nicht auf den perfekten Monat. Fang mit dem Betrag an, den du durchhalten kannst.' },

      { type: 'h2', text: '5. Wenn du nicht vorankommst, such nach Alternativen' },
      { type: 'p', text: 'Wenn die Zinsen fast alles auffressen, was du zahlst, gibt es andere Wege:' },
      { type: 'ul', items: [
        'Den Saldo auf eine Karte mit Aktionskonditionen übertragen. Prüfe die Gebühren und das Datum, ab dem wieder der normale Zins gilt.',
        'Die Schulden in einem Privatkredit mit niedrigerem Zins bündeln. Das hilft nur, wenn du die Karte nicht wieder nutzt.',
        'Mit der Bank über einen Zahlungsplan sprechen, am besten bevor du eine Zahlung versäumst.',
      ] },
      { type: 'p', text: 'Vergleiche immer die Gesamtkosten, nicht nur die Monatsrate: Weniger pro Monat über mehr Jahre kann deutlich teurer werden.' },
      { type: 'p', text: 'Was nach einer versäumten Zahlung passiert und welchen Schutz du hast, hängt von dem Land ab, in dem du lebst. Die Finanzaufsicht deines Landes oder eine Schuldnerberatung kann dir sagen, was für dich gilt. Wer früh um Hilfe bittet, hat mehr Möglichkeiten.' },

      { type: 'h2', text: 'So landest du nicht wieder am selben Punkt' },
      { type: 'p', text: 'Wenn die Karte ausgeglichen ist, machen drei Gewohnheiten den Unterschied: jeden Monat die gesamte Abrechnung begleichen, einen Notgroschen für Unvorhergesehenes haben und wissen, wie viel du ausgeben kannst, bevor du es ausgibst.' },
      { type: 'p', text: 'FinanceFlow kann dabei helfen. Im kostenlosen Plan mit bis zu 50 Transaktionen pro Monat erfasst du Einnahmen und Ausgaben und siehst, wohin dein Geld geht. Der Pro-Plan ergänzt Limits mit Warnung und KI-Erklärungen. Premium ergänzt Prognosen für die nächsten 3 Monate und einen Budgetvorschlag der KI. Die App verbindet sich nicht mit Bankkonten und zahlt keine Schulden für dich: Sie zeigt dir, wie viel übrig bleibt, um sie abzubauen.' },

      { type: 'h2', text: 'Der Plan in Kürze' },
      { type: 'ol', items: [
        'Rechne alles zusammen und sortiere die Schulden von der teuersten zur günstigsten.',
        'Kauf nicht mehr mit der Karte, bis der Saldo bei null ist.',
        'Zahl überall das Minimum und so viel mehr wie möglich auf die teuerste Karte.',
        'Schaff Spielraum im Budget und behandle die Schuldenzahlung wie eine Fixausgabe.',
        'Wenn dir die Zinsen davonlaufen, such nach Alternativen und vergleiche immer die Gesamtkosten.',
      ] },
      { type: 'p', text: 'Aus den roten Zahlen kommst du mit einer Reihe guter Monate. Fang heute mit dem ersten Schritt an: Rechne zusammen, was du wirklich schuldest.' },
    ],
  },
  {
    key: 'credit-card-debt',
    slug: 'come-uscire-dai-debiti-della-carta-di-credito',
    lang: 'it',
    title: 'Come uscire dai debiti della carta di credito: guida in 5 passi',
    description: 'Come uscire dai debiti della carta di credito: vedi l\'importo reale, smetti di usarla, paga più del minimo, libera denaro e cerca alternative.',
    published: '2026-11-04',
    blocks: [
      { type: 'p', text: 'La carta di credito è comoda fino al giorno in cui arriva l\'estratto conto e riesci a pagare solo il minimo. Da lì in poi il debito scende molto lentamente e gli interessi si accumulano. Uscirne non dipende dalla fortuna né da un aumento inatteso. Dipende da un ordine di passi e da un po\' di disciplina.' },
      { type: 'tip', text: 'Questo articolo è informativo e non sostituisce una consulenza finanziaria o legale. Le condizioni variano da contratto a contratto, e le regole da paese a paese.' },

      { type: 'h2', text: '1. Guarda l\'importo reale del debito' },
      { type: 'p', text: 'Somma tutto: il saldo dovuto su ogni carta, il pagamento minimo e il tasso che ciascuna applica (il TAEG). Scrivilo su un foglio o in una nota sul telefono. È normale evitare di guardare questo numero, ma è difficile risolvere ciò che non hai misurato.' },
      { type: 'p', text: 'Se hai più di una carta, ordinale dalla più cara alla meno cara. È quest\'ordine a decidere da dove iniziare.' },

      { type: 'h2', text: '2. Smetti di usare le carte, senza tagliarle tutte' },
      { type: 'p', text: 'Ogni nuovo acquisto annulla parte del tuo sforzo. Metti le carte in un cassetto o toglile dal portafoglio digitale, e sposta su un altro metodo di pagamento gli abbonamenti che hai sulla carta. Non devi chiuderle tutte: in questa fase la regola è semplicemente non aggiungere altro debito.' },
      { type: 'p', text: 'Se usi la carta per i vantaggi o il cashback, conviene solo se paghi l\'intero estratto conto ogni mese. Altrimenti, ciò che guadagni in vantaggi è quasi sempre meno di ciò che paghi in interessi.' },

      { type: 'h2', text: '3. Paga il minimo su tutte e di più sulla carta più cara' },
      { type: 'p', text: 'Paga sempre almeno il minimo su tutte le carte, perché un pagamento saltato comporta costi e può essere registrato. Ciò che riesci a pagare in più va alla carta con il tasso più alto, anche se sono solo 20 o 30 euro. Quando arriva a zero, sposta quell\'importo sulla successiva.' },
      { type: 'p', text: 'Se ricevi un premio, un rimborso o un guadagno extra, usane una parte per ridurre la carta più cara.' },

      { type: 'h2', text: '4. Libera denaro nel budget' },
      { type: 'p', text: 'Per pagare più del minimo, ti serve margine nel mese:' },
      { type: 'ul', items: [
        'Taglia ciò che non usi: abbonamenti dimenticati, vecchie tariffe, consegne frequenti.',
        'Rinegozia i contratti fissi una volta all\'anno: telefonia e internet, assicurazioni ed energia.',
        'Fissa un importo mensile solo per il debito e trattalo come una spesa obbligatoria, come l\'affitto.',
      ] },
      { type: 'p', text: 'Non aspettare il mese perfetto per iniziare. Parti dall\'importo che riesci a mantenere.' },

      { type: 'h2', text: '5. Se non riesci ad andare avanti, cerca alternative' },
      { type: 'p', text: 'Se gli interessi si mangiano quasi tutto ciò che paghi, ci sono altre strade:' },
      { type: 'ul', items: [
        'Trasferire il saldo su una carta con condizioni promozionali. Controlla le commissioni e la data in cui torna il tasso normale.',
        'Consolidare il debito in un prestito personale a tasso più basso. Serve solo se non torni a usare la carta.',
        'Parlare con la banca di un piano di pagamento, preferibilmente prima di saltare una rata.',
      ] },
      { type: 'p', text: 'Confronta sempre il costo totale, non solo la rata mensile: pagare meno al mese per più anni può costare molto di più.' },
      { type: 'p', text: 'Ciò che succede dopo un pagamento saltato, e le tutele che hai, dipendono dal paese in cui vivi. L\'autorità di vigilanza finanziaria del tuo paese o un servizio di consulenza sui debiti possono dirti cosa si applica al tuo caso. Chiedere aiuto presto ti dà più opzioni.' },

      { type: 'h2', text: 'Come evitare di tornare allo stesso punto' },
      { type: 'p', text: 'Una volta azzerata la carta, tre abitudini fanno la differenza: pagare l\'intero estratto conto ogni mese, avere un fondo di emergenza per gli imprevisti e sapere quanto puoi spendere prima di spenderlo.' },
      { type: 'p', text: 'FinanceFlow può aiutare in questa parte. Con il piano gratuito, fino a 50 transazioni al mese, registri entrate e spese e vedi dove vanno i soldi. Il piano Pro aggiunge limiti con avviso e spiegazioni dell\'IA. Premium aggiunge previsioni per i prossimi 3 mesi e una proposta di budget fatta dall\'IA. L\'app non si collega ai conti bancari e non paga i debiti al posto tuo: ti mostra quanto resta per ridurli.' },

      { type: 'h2', text: 'Il piano in sintesi' },
      { type: 'ol', items: [
        'Somma tutto e ordina i debiti dal più caro al meno caro.',
        'Smetti di comprare con la carta finché il saldo non è a zero.',
        'Paga il minimo su tutte e ciò che puoi in più sulla carta più cara.',
        'Libera margine nel budget e tratta il pagamento del debito come una spesa fissa.',
        'Se gli interessi ti superano, cerca alternative e confronta sempre il costo totale.',
      ] },
      { type: 'p', text: 'Uscire dal rosso è una serie di mesi fatti bene. Inizia oggi dal primo passo: somma l\'importo reale del debito.' },
    ],
  },
]
