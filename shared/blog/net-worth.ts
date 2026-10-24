import type { BlogPost } from './index'

// Património líquido: ativos menos passivos, como calcular e como fazer crescer.
export const netWorthPosts: BlogPost[] = [
  {
    key: 'net-worth',
    slug: 'patrimonio-liquido',
    lang: 'pt',
    title: 'Património líquido: o número que mostra a tua saúde financeira',
    description: 'O que tens menos o que deves: como calcular o teu património líquido, o que contar e não contar e quatro formas de o fazer crescer.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'O saldo da conta diz quanto tens hoje para gastar. O património líquido diz onde estás no conjunto: tudo o que tens, menos tudo o que deves. É a fotografia mais honesta das tuas finanças, e calculá-la leva menos de meia hora.' },

      { type: 'h2', text: 'O que tens: os ativos' },
      { type: 'p', text: 'Agrupa os ativos em quatro tipos:' },
      { type: 'ul', items: [
        'Liquidez: contas à ordem, contas poupança e dinheiro que consegues usar em poucos dias.',
        'Imóveis: a tua casa ou outros imóveis, pelo valor por que se venderiam hoje.',
        'Bens pessoais: carro, eletrodomésticos, equipamento. Conta o valor atual, não o que pagaste: um carro com cinco anos vale bem menos do que custou.',
        'Investimentos: fundos, ações, obrigações, planos de poupança-reforma, pelo valor à data do cálculo.',
      ] },

      { type: 'h2', text: 'O que deves: os passivos' },
      { type: 'p', text: 'Separa as dívidas de curto prazo, que tens de pagar no próximo ano (saldo do cartão de crédito, contas em atraso, pequenos empréstimos), das de longo prazo (crédito à habitação, crédito automóvel, empréstimo de estudos). Conta só o que deves hoje: o capital em dívida, não os juros que ainda vais pagar.' },

      { type: 'h2', text: 'A conta' },
      { type: 'p', text: 'Património líquido = ativos − passivos.' },
      { type: 'tip', text: 'Exemplo: 1200 € na conta à ordem, 3000 € de poupança, um carro que vale 6000 € e 2500 € num fundo dão 12 700 € de ativos. Com 400 € no cartão de crédito e 4800 € por pagar do carro, os passivos são 5200 €. O património líquido é de 7500 €.' },

      { type: 'h2', text: 'Como ler o resultado' },
      { type: 'p', text: 'Um valor negativo não é motivo para pânico, sobretudo no início da vida ativa, com um empréstimo de estudos ou um crédito à habitação recente. O que importa é a tendência: se o número sobe de cada vez que o calculas, estás no bom caminho. Refaz a conta a cada três ou seis meses.' },
      { type: 'p', text: 'Atenção também à liquidez. Podes ter um património alto e mesmo assim não conseguir pagar as contas, se quase tudo estiver numa casa ou num investimento difícil de vender. Quando as dívidas que vencem ultrapassam o dinheiro disponível, há um problema de solvência, mesmo com património positivo.' },

      { type: 'h2', text: 'Quatro formas de o fazer crescer' },
      { type: 'ol', items: [
        'Poupar mais: cada euro poupado aumenta os ativos.',
        'Gastar menos: menos despesas significa mais margem para poupar ou amortizar.',
        'Valorizar o que tens: investimentos que crescem e bens bem conservados.',
        'Pagar dívidas: cada euro amortizado reduz os passivos, a começar pelas de juros mais altos.',
      ] },

      { type: 'h2', text: 'Acompanhar sem esforço' },
      { type: 'p', text: 'O património líquido não é dinheiro para gastar. É um indicador para veres se as tuas decisões do dia a dia estão a resultar. No FinanceFlow, o painel mostra a evolução do saldo e, no plano Premium, o registo de investimentos guarda o valor atual de cada posição e calcula a rentabilidade de cada uma e da carteira inteira, o que ajuda a manter esta conta atualizada.' },
    ],
  },
  {
    key: 'net-worth',
    slug: 'net-worth',
    lang: 'en',
    title: 'Net worth: the number that shows your financial health',
    description: 'What you own minus what you owe: how to calculate your net worth, what to count and leave out, and four ways to grow it.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'Your account balance tells you how much you can spend today. Your net worth tells you where you stand overall: everything you own, minus everything you owe. It is the most honest snapshot of your finances, and working it out takes less than half an hour.' },

      { type: 'h2', text: 'What you own: assets' },
      { type: 'p', text: 'Group your assets into four types:' },
      { type: 'ul', items: [
        'Liquid assets: current accounts, savings accounts and money you can use within a few days.',
        'Property: your home or other real estate, at what it would sell for today.',
        'Personal possessions: car, appliances, equipment. Count their current value, not what you paid: a five-year-old car is worth far less than it cost.',
        'Investments: funds, shares, bonds and pension plans, at their value on the day you calculate.',
      ] },

      { type: 'h2', text: 'What you owe: liabilities' },
      { type: 'p', text: 'Separate short-term debts, due within the next year (credit card balance, overdue bills, small loans), from long-term ones (mortgage, car loan, student loan). Count only what you owe today: the outstanding balance, not the interest you will still pay.' },

      { type: 'h2', text: 'The calculation' },
      { type: 'p', text: 'Net worth = assets − liabilities.' },
      { type: 'tip', text: 'Example: €1,200 in a current account, €3,000 of savings, a car worth €6,000 and €2,500 in a fund add up to €12,700 of assets. With €400 on a credit card and €4,800 still owed on the car, liabilities are €5,200. Net worth is €7,500.' },

      { type: 'h2', text: 'How to read the result' },
      { type: 'p', text: 'A negative figure is no reason to panic, especially early in your working life, with a student loan or a recent mortgage. What matters is the trend: if the number rises every time you calculate it, you are on the right track. Redo it every three or six months.' },
      { type: 'p', text: 'Watch your liquidity too. You can have a high net worth and still be unable to pay your bills if almost everything is tied up in a house or an investment that is hard to sell. When debts falling due exceed the money available, you have a solvency problem, even with a positive net worth.' },

      { type: 'h2', text: 'Four ways to grow it' },
      { type: 'ol', items: [
        'Save more: every euro saved increases your assets.',
        'Spend less: lower expenses leave more room to save or pay down debt.',
        'Grow what you own: investments that rise in value and possessions kept in good condition.',
        'Pay off debt: every euro repaid reduces your liabilities, starting with the highest-interest debt.',
      ] },

      { type: 'h2', text: 'Tracking it without effort' },
      { type: 'p', text: 'Net worth is not money to spend. It is an indicator that shows whether your day-to-day decisions are working. In FinanceFlow, the dashboard shows how your balance evolves and, on the Premium plan, the investment tracker keeps the current value of each holding and works out the return of each one and of the whole portfolio, which makes this calculation easier to keep up to date.' },
    ],
  },
  {
    key: 'net-worth',
    slug: 'patrimonio-neto',
    lang: 'es',
    title: 'Patrimonio neto: la cifra que muestra tu salud financiera',
    description: 'Lo que tienes menos lo que debes: cómo calcular tu patrimonio neto, qué contar y qué no, y cuatro formas de hacerlo crecer.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'El saldo de la cuenta dice cuánto puedes gastar hoy. El patrimonio neto dice dónde estás en conjunto: todo lo que tienes, menos todo lo que debes. Es la foto más honesta de tus finanzas, y calcularla lleva menos de media hora.' },

      { type: 'h2', text: 'Lo que tienes: los activos' },
      { type: 'p', text: 'Agrupa los activos en cuatro tipos:' },
      { type: 'ul', items: [
        'Liquidez: cuentas corrientes, cuentas de ahorro y dinero que puedes usar en pocos días.',
        'Inmuebles: tu vivienda u otros inmuebles, por lo que valdrían si los vendieras hoy.',
        'Bienes personales: coche, electrodomésticos, equipos. Cuenta su valor actual, no lo que pagaste: un coche de cinco años vale mucho menos de lo que costó.',
        'Inversiones: fondos, acciones, bonos y planes de pensiones, por su valor en la fecha del cálculo.',
      ] },

      { type: 'h2', text: 'Lo que debes: los pasivos' },
      { type: 'p', text: 'Separa las deudas a corto plazo, que vencen en el próximo año (saldo de la tarjeta, facturas pendientes, préstamos pequeños), de las de largo plazo (hipoteca, préstamo del coche, préstamo de estudios). Cuenta solo lo que debes hoy: el capital pendiente, no los intereses que todavía pagarás.' },

      { type: 'h2', text: 'La cuenta' },
      { type: 'p', text: 'Patrimonio neto = activos − pasivos.' },
      { type: 'tip', text: 'Ejemplo: 1200 € en la cuenta corriente, 3000 € de ahorros, un coche que vale 6000 € y 2500 € en un fondo suman 12 700 € de activos. Con 400 € en la tarjeta y 4800 € pendientes del coche, los pasivos son 5200 €. El patrimonio neto es de 7500 €.' },

      { type: 'h2', text: 'Cómo leer el resultado' },
      { type: 'p', text: 'Un valor negativo no es motivo de pánico, sobre todo al principio de la vida laboral, con un préstamo de estudios o una hipoteca reciente. Lo que importa es la tendencia: si la cifra sube cada vez que la calculas, vas por buen camino. Repite la cuenta cada tres o seis meses.' },
      { type: 'p', text: 'Vigila también la liquidez. Puedes tener un patrimonio alto y aun así no poder pagar las facturas, si casi todo está en una vivienda o en una inversión difícil de vender. Cuando las deudas que vencen superan el dinero disponible, hay un problema de solvencia, aunque el patrimonio sea positivo.' },

      { type: 'h2', text: 'Cuatro formas de hacerlo crecer' },
      { type: 'ol', items: [
        'Ahorrar más: cada euro ahorrado aumenta los activos.',
        'Gastar menos: menos gastos dejan más margen para ahorrar o amortizar.',
        'Revalorizar lo que tienes: inversiones que crecen y bienes bien cuidados.',
        'Pagar deudas: cada euro amortizado reduce los pasivos, empezando por las de intereses más altos.',
      ] },

      { type: 'h2', text: 'Seguirlo sin esfuerzo' },
      { type: 'p', text: 'El patrimonio neto no es dinero para gastar. Es un indicador para ver si tus decisiones del día a día funcionan. En FinanceFlow, el panel muestra la evolución del saldo y, en el plan Premium, el registro de inversiones guarda el valor actual de cada posición y calcula la rentabilidad de cada una y de toda la cartera, lo que ayuda a mantener esta cuenta al día.' },
    ],
  },
  {
    key: 'net-worth',
    slug: 'patrimoine-net',
    lang: 'fr',
    title: 'Patrimoine net : le chiffre qui révèle votre santé financière',
    description: 'Ce que vous possédez moins ce que vous devez : comment calculer votre patrimoine net, quoi compter ou non, et quatre façons de le faire grandir.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'Le solde de votre compte indique combien vous pouvez dépenser aujourd\'hui. Le patrimoine net indique où vous en êtes globalement : tout ce que vous possédez, moins tout ce que vous devez. C\'est la photographie la plus honnête de vos finances, et la calculer prend moins d\'une demi-heure.' },

      { type: 'h2', text: 'Ce que vous possédez : les actifs' },
      { type: 'p', text: 'Classez vos actifs en quatre types :' },
      { type: 'ul', items: [
        'Liquidités : comptes courants, livrets d\'épargne et argent disponible en quelques jours.',
        'Immobilier : votre logement ou d\'autres biens, au prix auquel ils se vendraient aujourd\'hui.',
        'Biens personnels : voiture, électroménager, équipements. Comptez leur valeur actuelle, pas le prix payé : une voiture de cinq ans vaut bien moins que son prix d\'achat.',
        'Placements : fonds, actions, obligations, épargne retraite, à leur valeur le jour du calcul.',
      ] },

      { type: 'h2', text: 'Ce que vous devez : les passifs' },
      { type: 'p', text: 'Séparez les dettes à court terme, à payer dans l\'année (solde de carte de crédit, factures en retard, petits prêts), de celles à long terme (crédit immobilier, crédit auto, prêt étudiant). Ne comptez que ce que vous devez aujourd\'hui : le capital restant dû, pas les intérêts encore à payer.' },

      { type: 'h2', text: 'Le calcul' },
      { type: 'p', text: 'Patrimoine net = actifs − passifs.' },
      { type: 'tip', text: 'Exemple : 1 200 € sur le compte courant, 3 000 € d\'épargne, une voiture qui vaut 6 000 € et 2 500 € dans un fonds font 12 700 € d\'actifs. Avec 400 € sur la carte de crédit et 4 800 € restant dus sur la voiture, les passifs s\'élèvent à 5 200 €. Le patrimoine net est de 7 500 €.' },

      { type: 'h2', text: 'Comment lire le résultat' },
      { type: 'p', text: 'Un chiffre négatif n\'est pas une raison de paniquer, surtout en début de vie active, avec un prêt étudiant ou un crédit immobilier récent. Ce qui compte, c\'est la tendance : si le chiffre augmente à chaque calcul, vous êtes sur la bonne voie. Refaites-le tous les trois ou six mois.' },
      { type: 'p', text: 'Surveillez aussi vos liquidités. On peut avoir un patrimoine élevé et ne pas réussir à payer ses factures, si presque tout est immobilisé dans un logement ou un placement difficile à vendre. Quand les dettes exigibles dépassent l\'argent disponible, il y a un problème de solvabilité, même avec un patrimoine positif.' },

      { type: 'h2', text: 'Quatre façons de le faire grandir' },
      { type: 'ol', items: [
        'Épargner davantage : chaque euro épargné augmente les actifs.',
        'Dépenser moins : moins de dépenses laissent plus de marge pour épargner ou rembourser.',
        'Valoriser ce que vous possédez : des placements qui progressent et des biens bien entretenus.',
        'Rembourser vos dettes : chaque euro remboursé réduit les passifs, en commençant par les taux les plus élevés.',
      ] },

      { type: 'h2', text: 'Le suivre sans effort' },
      { type: 'p', text: 'Le patrimoine net n\'est pas de l\'argent à dépenser. C\'est un indicateur qui montre si vos décisions quotidiennes portent leurs fruits. Dans FinanceFlow, le tableau de bord montre l\'évolution de votre solde et, avec la formule Premium, le suivi des placements conserve la valeur actuelle de chaque position et calcule le rendement de chacune et du portefeuille entier, ce qui facilite la mise à jour de ce calcul.' },
    ],
  },
  {
    key: 'net-worth',
    slug: 'nettovermoegen',
    lang: 'de',
    title: 'Nettovermögen: die Zahl, die deine finanzielle Gesundheit zeigt',
    description: 'Was du besitzt minus was du schuldest: wie du dein Nettovermögen berechnest, was zählt und was nicht, und vier Wege, es zu steigern.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'Dein Kontostand zeigt, wie viel du heute ausgeben kannst. Dein Nettovermögen zeigt, wo du insgesamt stehst: alles, was du besitzt, minus alles, was du schuldest. Es ist der ehrlichste Blick auf deine Finanzen, und die Rechnung dauert weniger als eine halbe Stunde.' },

      { type: 'h2', text: 'Was du besitzt: Vermögenswerte' },
      { type: 'p', text: 'Teile dein Vermögen in vier Gruppen ein:' },
      { type: 'ul', items: [
        'Liquide Mittel: Girokonto, Tagesgeld und Geld, an das du in wenigen Tagen kommst.',
        'Immobilien: deine Wohnung oder andere Immobilien, zu dem Preis, den sie heute erzielen würden.',
        'Persönlicher Besitz: Auto, Haushaltsgeräte, Ausstattung. Zähl den heutigen Wert, nicht den Kaufpreis: Ein fünf Jahre altes Auto ist deutlich weniger wert, als es gekostet hat.',
        'Geldanlagen: Fonds, Aktien, Anleihen und Altersvorsorge, zum Wert am Tag der Berechnung.',
      ] },

      { type: 'h2', text: 'Was du schuldest: Verbindlichkeiten' },
      { type: 'p', text: 'Trenne kurzfristige Schulden, die im nächsten Jahr fällig werden (Kreditkartensaldo, offene Rechnungen, kleine Kredite), von langfristigen (Baufinanzierung, Autokredit, Studienkredit). Zähl nur, was du heute schuldest: die Restschuld, nicht die Zinsen, die noch kommen.' },

      { type: 'h2', text: 'Die Rechnung' },
      { type: 'p', text: 'Nettovermögen = Vermögenswerte − Verbindlichkeiten.' },
      { type: 'tip', text: 'Beispiel: 1.200 € auf dem Girokonto, 3.000 € Erspartes, ein Auto im Wert von 6.000 € und 2.500 € in einem Fonds ergeben 12.700 € Vermögen. Mit 400 € auf der Kreditkarte und 4.800 € Restschuld fürs Auto betragen die Verbindlichkeiten 5.200 €. Das Nettovermögen liegt bei 7.500 €.' },

      { type: 'h2', text: 'So liest du das Ergebnis' },
      { type: 'p', text: 'Ein negativer Wert ist kein Grund zur Panik, vor allem am Anfang des Berufslebens, mit Studienkredit oder frischer Baufinanzierung. Entscheidend ist der Trend: Steigt die Zahl bei jeder Berechnung, bist du auf dem richtigen Weg. Rechne alle drei bis sechs Monate neu.' },
      { type: 'p', text: 'Achte auch auf die Liquidität. Man kann ein hohes Vermögen haben und trotzdem die Rechnungen nicht bezahlen, wenn fast alles in einer Wohnung oder einer schwer verkäuflichen Anlage steckt. Wenn die fälligen Schulden das verfügbare Geld übersteigen, hast du ein Zahlungsproblem, selbst mit positivem Nettovermögen.' },

      { type: 'h2', text: 'Vier Wege, es zu steigern' },
      { type: 'ol', items: [
        'Mehr sparen: Jeder gesparte Euro erhöht dein Vermögen.',
        'Weniger ausgeben: Geringere Ausgaben schaffen Spielraum zum Sparen oder Tilgen.',
        'Werte steigern: Anlagen, die wachsen, und Besitz, der gut gepflegt wird.',
        'Schulden tilgen: Jeder getilgte Euro senkt die Verbindlichkeiten, angefangen mit den teuersten.',
      ] },

      { type: 'h2', text: 'Ohne Aufwand im Blick behalten' },
      { type: 'p', text: 'Nettovermögen ist kein Geld zum Ausgeben. Es ist ein Messwert, der zeigt, ob deine täglichen Entscheidungen wirken. In FinanceFlow zeigt das Dashboard die Entwicklung deines Saldos, und im Premium-Tarif speichert das Depot-Tracking den aktuellen Wert jeder Position und berechnet die Rendite jeder einzelnen und des ganzen Portfolios, damit diese Rechnung leichter aktuell bleibt.' },
    ],
  },
  {
    key: 'net-worth',
    slug: 'patrimonio-netto',
    lang: 'it',
    title: 'Patrimonio netto: il numero che mostra la tua salute finanziaria',
    description: 'Ciò che possiedi meno ciò che devi: come calcolare il patrimonio netto, cosa contare e cosa no, e quattro modi per farlo crescere.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'Il saldo del conto dice quanto puoi spendere oggi. Il patrimonio netto dice dove ti trovi nel complesso: tutto ciò che possiedi, meno tutto ciò che devi. È la fotografia più onesta delle tue finanze, e calcolarla richiede meno di mezz\'ora.' },

      { type: 'h2', text: 'Ciò che possiedi: le attività' },
      { type: 'p', text: 'Raggruppa le attività in quattro tipi:' },
      { type: 'ul', items: [
        'Liquidità: conti correnti, conti deposito e denaro che puoi usare in pochi giorni.',
        'Immobili: la tua casa o altri immobili, al prezzo a cui si venderebbero oggi.',
        'Beni personali: auto, elettrodomestici, attrezzature. Conta il valore attuale, non quanto hai pagato: un\'auto di cinque anni vale molto meno di quanto è costata.',
        'Investimenti: fondi, azioni, obbligazioni e fondi pensione, al valore del giorno del calcolo.',
      ] },

      { type: 'h2', text: 'Ciò che devi: le passività' },
      { type: 'p', text: 'Separa i debiti a breve termine, da pagare entro un anno (saldo della carta di credito, bollette arretrate, piccoli prestiti), da quelli a lungo termine (mutuo, finanziamento dell\'auto, prestito per gli studi). Conta solo ciò che devi oggi: il capitale residuo, non gli interessi che pagherai ancora.' },

      { type: 'h2', text: 'Il calcolo' },
      { type: 'p', text: 'Patrimonio netto = attività − passività.' },
      { type: 'tip', text: 'Esempio: 1200 € sul conto corrente, 3000 € di risparmi, un\'auto che vale 6000 € e 2500 € in un fondo fanno 12 700 € di attività. Con 400 € sulla carta di credito e 4800 € ancora da pagare per l\'auto, le passività sono 5200 €. Il patrimonio netto è di 7500 €.' },

      { type: 'h2', text: 'Come leggere il risultato' },
      { type: 'p', text: 'Un valore negativo non è motivo di panico, soprattutto all\'inizio della vita lavorativa, con un prestito per gli studi o un mutuo recente. Quello che conta è la tendenza: se il numero sale ogni volta che lo calcoli, sei sulla strada giusta. Rifai il calcolo ogni tre o sei mesi.' },
      { type: 'p', text: 'Tieni d\'occhio anche la liquidità. Puoi avere un patrimonio alto e comunque non riuscire a pagare le bollette, se quasi tutto è in una casa o in un investimento difficile da vendere. Quando i debiti in scadenza superano il denaro disponibile c\'è un problema di solvibilità, anche con un patrimonio positivo.' },

      { type: 'h2', text: 'Quattro modi per farlo crescere' },
      { type: 'ol', items: [
        'Risparmiare di più: ogni euro risparmiato aumenta le attività.',
        'Spendere meno: meno spese lasciano più margine per risparmiare o rimborsare.',
        'Valorizzare ciò che hai: investimenti che crescono e beni tenuti bene.',
        'Ridurre i debiti: ogni euro rimborsato riduce le passività, a partire da quelle con gli interessi più alti.',
      ] },

      { type: 'h2', text: 'Seguirlo senza fatica' },
      { type: 'p', text: 'Il patrimonio netto non è denaro da spendere. È un indicatore che mostra se le tue decisioni quotidiane funzionano. In FinanceFlow il pannello mostra l\'andamento del saldo e, nel piano Premium, il registro degli investimenti conserva il valore attuale di ogni posizione e calcola il rendimento di ciascuna e dell\'intero portafoglio, così è più facile tenere aggiornato questo calcolo.' },
    ],
  },
]
