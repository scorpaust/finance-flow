import type { BlogPost } from './index'

// Fluxo de caixa pessoal: entradas, saídas fixas e variáveis, excedente ou défice.
export const cashFlowPosts: BlogPost[] = [
  {
    key: 'cash-flow',
    slug: 'fluxo-de-caixa-pessoal',
    lang: 'pt',
    title: 'Fluxo de caixa pessoal: descobre para onde vai o teu dinheiro',
    description: 'Como registar o dinheiro que entra e sai num mês, separar despesas fixas e variáveis e perceber se tens excedente ou défice.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'Um orçamento diz o que planeias fazer com o dinheiro. O fluxo de caixa diz o que aconteceu de facto. É o registo de tudo o que entrou e saiu num período, normalmente um mês. Sem ele, qualquer orçamento é um palpite, porque não sabes quanto gastas realmente em cada coisa.' },

      { type: 'h2', text: '1. Regista o dinheiro que entra' },
      { type: 'p', text: 'Conta apenas o que chega de facto à tua conta: o salário líquido, depois de impostos e contribuições, e não o bruto. Junta as outras entradas do mês, como trabalhos extra, juros de poupanças, a renda de um quarto ou apoios sociais.' },
      { type: 'p', text: 'Se o teu rendimento varia de mês para mês, por exemplo com comissões ou trabalho por conta própria, usa como referência o valor mais baixo dos últimos meses. É preferível ser surpreendido pela positiva.' },

      { type: 'h2', text: '2. Separa as despesas fixas' },
      { type: 'p', text: 'São os pagamentos que se repetem com o mesmo valor: renda ou prestação da casa, créditos, seguros, internet e telemóvel, passe de transportes, ginásio. Inclui também as despesas anuais divididas por 12. Um seguro do carro de 360 € por ano corresponde a 30 € por mês que devias pôr de parte.' },

      { type: 'h2', text: '3. Regista as despesas variáveis' },
      { type: 'p', text: 'Supermercado, refeições fora, combustível, eletricidade, roupa, lazer, prendas, saúde. É aqui que o dinheiro costuma desaparecer sem dares por isso, e é aqui que tens mais margem para mudar. Regista cada gasto no momento, porque ninguém se lembra de tudo no fim do mês.' },

      { type: 'h2', text: '4. Calcula o excedente ou o défice' },
      { type: 'p', text: 'Subtrai todas as saídas às entradas. Se o resultado for positivo, tens um excedente. Se for negativo, tens um défice, que foi pago com poupanças ou com crédito, mesmo que não tenhas reparado.' },
      { type: 'tip', text: 'Exemplo: 1500 € de salário líquido, 780 € de despesas fixas e 560 € de variáveis dão um excedente de 160 €. Se as variáveis tivessem sido 760 €, o mês fechava com um défice de 40 €.' },
      { type: 'p', text: 'Vale a pena olhar também para o rendimento discricionário: o que sobra depois de pagares casa, alimentação e outras necessidades. É esse valor que decides livremente, e é dele que sai a poupança.' },

      { type: 'h2', text: '5. Decide o destino do excedente' },
      { type: 'p', text: 'Um excedente que fica parado na conta à ordem acaba gasto. Dá-lhe um destino logo no fim do mês:' },
      { type: 'ul', items: [
        'Fundo de emergência, até cobrir três a seis meses de despesas essenciais.',
        'Objetivos de curto prazo, como férias, um curso ou trocar de carro.',
        'Objetivos de longo prazo, como a reforma ou a entrada para uma casa.',
        'Amortizar dívidas com juros altos, como o saldo do cartão de crédito.',
      ] },

      { type: 'h2', text: 'Repete todos os meses' },
      { type: 'p', text: 'Um mês isolado engana: há meses com prendas, seguros ou reparações. Ao fim de três meses começas a ver padrões, e é a partir daí que um orçamento faz sentido.' },
      { type: 'p', text: 'No FinanceFlow, o plano gratuito já faz este registo: separas receitas e despesas por categoria, marcas as despesas fixas como recorrentes e o painel mostra o saldo do mês e as categorias onde gastas mais. Nos planos pagos podes também fotografar um recibo e a app preenche os dados por ti.' },
    ],
  },
  {
    key: 'cash-flow',
    slug: 'personal-cash-flow',
    lang: 'en',
    title: 'Personal cash flow: find out where your money really goes',
    description: 'How to track the money coming in and going out each month, separate fixed and variable expenses and see whether you have a surplus or a deficit.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'A budget says what you plan to do with your money. Cash flow says what actually happened. It is the record of everything that came in and went out over a period, usually a month. Without it, any budget is a guess, because you don\'t know how much you really spend on each thing.' },

      { type: 'h2', text: '1. Record the money coming in' },
      { type: 'p', text: 'Count only what actually reaches your account: your take-home pay after taxes and contributions, not your gross salary. Add the month\'s other income, such as side work, interest on savings, rent from a room or benefits.' },
      { type: 'p', text: 'If your income varies from month to month, for example with commissions or self-employment, use the lowest amount of recent months as your reference. It is better to be surprised on the upside.' },

      { type: 'h2', text: '2. Separate your fixed expenses' },
      { type: 'p', text: 'These are the payments that repeat with the same amount: rent or mortgage, loans, insurance, internet and phone, a transport pass, the gym. Also include annual bills divided by 12. Car insurance of €360 a year means €30 a month you should set aside.' },

      { type: 'h2', text: '3. Record your variable expenses' },
      { type: 'p', text: 'Groceries, eating out, fuel, electricity, clothes, leisure, gifts, health. This is where money tends to vanish without you noticing, and it is also where you have the most room to change. Log each expense as it happens, because nobody remembers everything at the end of the month.' },

      { type: 'h2', text: '4. Work out your surplus or deficit' },
      { type: 'p', text: 'Subtract everything that went out from everything that came in. A positive result is a surplus. A negative one is a deficit, which was paid for with savings or credit, even if you didn\'t notice.' },
      { type: 'tip', text: 'Example: €1,500 of take-home pay, €780 of fixed expenses and €560 of variable ones leave a €160 surplus. If variable expenses had been €760, the month would have closed with a €40 deficit.' },
      { type: 'p', text: 'It is also worth looking at your discretionary income: what is left after paying for housing, food and other necessities. That is the money you decide on freely, and it is where your savings come from.' },

      { type: 'h2', text: '5. Decide where the surplus goes' },
      { type: 'p', text: 'A surplus left sitting in your current account gets spent. Give it a job as soon as the month ends:' },
      { type: 'ul', items: [
        'An emergency fund, until it covers three to six months of essential expenses.',
        'Short-term goals, such as a holiday, a course or a new car.',
        'Long-term goals, such as retirement or a deposit for a home.',
        'Paying down high-interest debt, such as a credit card balance.',
      ] },

      { type: 'h2', text: 'Repeat it every month' },
      { type: 'p', text: 'A single month can be misleading: some months bring gifts, insurance renewals or repairs. After three months you start to see patterns, and that is when a budget starts to make sense.' },
      { type: 'p', text: 'In FinanceFlow, the free plan already does this: you split income and expenses by category, mark fixed expenses as recurring, and the dashboard shows the month\'s balance and your biggest spending categories. On paid plans you can also snap a receipt and the app fills in the details for you.' },
    ],
  },
  {
    key: 'cash-flow',
    slug: 'flujo-de-caja-personal',
    lang: 'es',
    title: 'Flujo de caja personal: descubre adónde va tu dinero',
    description: 'Cómo registrar el dinero que entra y sale cada mes, separar gastos fijos y variables y saber si tienes superávit o déficit.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'Un presupuesto dice lo que piensas hacer con el dinero. El flujo de caja dice lo que pasó de verdad. Es el registro de todo lo que entró y salió en un periodo, normalmente un mes. Sin él, cualquier presupuesto es una suposición, porque no sabes cuánto gastas realmente en cada cosa.' },

      { type: 'h2', text: '1. Registra el dinero que entra' },
      { type: 'p', text: 'Cuenta solo lo que llega de verdad a tu cuenta: el sueldo neto, después de impuestos y cotizaciones, no el bruto. Suma los demás ingresos del mes, como trabajos extra, intereses de tus ahorros, el alquiler de una habitación o ayudas públicas.' },
      { type: 'p', text: 'Si tus ingresos cambian de un mes a otro, por ejemplo con comisiones o trabajo por cuenta propia, usa como referencia la cantidad más baja de los últimos meses. Es mejor llevarse una sorpresa positiva.' },

      { type: 'h2', text: '2. Separa los gastos fijos' },
      { type: 'p', text: 'Son los pagos que se repiten con la misma cantidad: alquiler o hipoteca, préstamos, seguros, internet y móvil, abono de transporte, gimnasio. Incluye también los gastos anuales divididos entre 12. Un seguro del coche de 360 € al año son 30 € al mes que deberías apartar.' },

      { type: 'h2', text: '3. Registra los gastos variables' },
      { type: 'p', text: 'Supermercado, comidas fuera, gasolina, electricidad, ropa, ocio, regalos, salud. Aquí es donde el dinero suele desaparecer sin que te des cuenta, y también donde tienes más margen para cambiar. Apunta cada gasto en el momento, porque nadie se acuerda de todo a final de mes.' },

      { type: 'h2', text: '4. Calcula el superávit o el déficit' },
      { type: 'p', text: 'Resta todas las salidas a las entradas. Si el resultado es positivo, tienes superávit. Si es negativo, tienes déficit, que se pagó con ahorros o con crédito, aunque no lo hayas notado.' },
      { type: 'tip', text: 'Ejemplo: 1500 € de sueldo neto, 780 € de gastos fijos y 560 € de variables dejan un superávit de 160 €. Si los variables hubieran sido 760 €, el mes cerraría con un déficit de 40 €.' },
      { type: 'p', text: 'También conviene mirar la renta discrecional: lo que queda después de pagar vivienda, alimentación y demás necesidades. Ese es el dinero que decides libremente, y de ahí sale el ahorro.' },

      { type: 'h2', text: '5. Decide el destino del superávit' },
      { type: 'p', text: 'Un superávit que se queda en la cuenta corriente acaba gastado. Dale un destino nada más acabar el mes:' },
      { type: 'ul', items: [
        'Fondo de emergencia, hasta cubrir de tres a seis meses de gastos esenciales.',
        'Objetivos a corto plazo, como un viaje, un curso o cambiar de coche.',
        'Objetivos a largo plazo, como la jubilación o la entrada de una vivienda.',
        'Amortizar deudas con intereses altos, como el saldo de la tarjeta de crédito.',
      ] },

      { type: 'h2', text: 'Repítelo cada mes' },
      { type: 'p', text: 'Un mes aislado engaña: hay meses con regalos, seguros o reparaciones. Al cabo de tres meses empiezas a ver patrones, y a partir de ahí un presupuesto tiene sentido.' },
      { type: 'p', text: 'En FinanceFlow, el plan gratuito ya hace este registro: separas ingresos y gastos por categoría, marcas los gastos fijos como recurrentes y el panel muestra el saldo del mes y las categorías en las que más gastas. En los planes de pago también puedes fotografiar un recibo y la app rellena los datos por ti.' },
    ],
  },
  {
    key: 'cash-flow',
    slug: 'flux-de-tresorerie-personnel',
    lang: 'fr',
    title: 'Flux de trésorerie personnel : découvrez où va votre argent',
    description: 'Comment noter l\'argent qui entre et qui sort chaque mois, séparer dépenses fixes et variables et savoir si vous êtes en excédent ou en déficit.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'Un budget dit ce que vous prévoyez de faire de votre argent. Le flux de trésorerie dit ce qui s\'est réellement passé. C\'est le relevé de tout ce qui est entré et sorti sur une période, en général un mois. Sans lui, un budget n\'est qu\'une supposition, car vous ne savez pas combien vous dépensez vraiment pour chaque chose.' },

      { type: 'h2', text: '1. Notez l\'argent qui entre' },
      { type: 'p', text: 'Ne comptez que ce qui arrive réellement sur votre compte : le salaire net, après impôts et cotisations, pas le brut. Ajoutez les autres revenus du mois, comme des missions ponctuelles, les intérêts de votre épargne, le loyer d\'une chambre ou des aides sociales.' },
      { type: 'p', text: 'Si vos revenus varient d\'un mois à l\'autre, par exemple avec des commissions ou une activité indépendante, prenez comme référence le montant le plus bas des derniers mois. Mieux vaut une bonne surprise qu\'une mauvaise.' },

      { type: 'h2', text: '2. Isolez les dépenses fixes' },
      { type: 'p', text: 'Ce sont les paiements qui reviennent avec le même montant : loyer ou mensualité de prêt immobilier, crédits, assurances, internet et téléphone, abonnement de transport, salle de sport. Ajoutez aussi les dépenses annuelles divisées par 12. Une assurance auto de 360 € par an représente 30 € par mois à mettre de côté.' },

      { type: 'h2', text: '3. Notez les dépenses variables' },
      { type: 'p', text: 'Courses, restaurants, carburant, électricité, vêtements, loisirs, cadeaux, santé. C\'est là que l\'argent disparaît sans qu\'on s\'en aperçoive, et c\'est aussi là que vous avez le plus de marge pour changer. Notez chaque dépense sur le moment : personne ne se souvient de tout en fin de mois.' },

      { type: 'h2', text: '4. Calculez l\'excédent ou le déficit' },
      { type: 'p', text: 'Soustrayez toutes les sorties des entrées. Un résultat positif est un excédent. Un résultat négatif est un déficit, qui a été financé par votre épargne ou par du crédit, même si vous ne l\'avez pas remarqué.' },
      { type: 'tip', text: 'Exemple : 1 500 € de salaire net, 780 € de dépenses fixes et 560 € de dépenses variables laissent un excédent de 160 €. Si les dépenses variables avaient atteint 760 €, le mois se serait terminé avec un déficit de 40 €.' },
      { type: 'p', text: 'Regardez aussi votre revenu discrétionnaire : ce qui reste après avoir payé le logement, l\'alimentation et les autres besoins. C\'est l\'argent dont vous décidez librement, et c\'est de là que vient l\'épargne.' },

      { type: 'h2', text: '5. Décidez où va l\'excédent' },
      { type: 'p', text: 'Un excédent qui dort sur le compte courant finit par être dépensé. Donnez-lui une destination dès la fin du mois :' },
      { type: 'ul', items: [
        'Une épargne de précaution, jusqu\'à couvrir trois à six mois de dépenses essentielles.',
        'Des objectifs à court terme, comme des vacances, une formation ou une nouvelle voiture.',
        'Des objectifs à long terme, comme la retraite ou l\'apport pour un logement.',
        'Le remboursement des dettes à taux élevé, comme le solde d\'une carte de crédit.',
      ] },

      { type: 'h2', text: 'Recommencez chaque mois' },
      { type: 'p', text: 'Un mois isolé peut tromper : certains mois apportent des cadeaux, des assurances ou des réparations. Au bout de trois mois, des tendances apparaissent, et c\'est à partir de là qu\'un budget a du sens.' },
      { type: 'p', text: 'Dans FinanceFlow, la formule gratuite fait déjà ce suivi : vous classez revenus et dépenses par catégorie, marquez les dépenses fixes comme récurrentes, et le tableau de bord affiche le solde du mois et vos plus grosses catégories de dépenses. Les formules payantes permettent aussi de photographier un ticket pour que l\'application remplisse les informations.' },
    ],
  },
  {
    key: 'cash-flow',
    slug: 'persoenlicher-cashflow',
    lang: 'de',
    title: 'Persönlicher Cashflow: So siehst du, wohin dein Geld geht',
    description: 'Wie du festhältst, was jeden Monat rein- und rausgeht, Fixkosten und variable Ausgaben trennst und erkennst, ob du Überschuss oder Defizit hast.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'Ein Budget sagt, was du mit deinem Geld vorhast. Der Cashflow sagt, was tatsächlich passiert ist. Er ist die Aufstellung von allem, was in einem Zeitraum hereinkam und hinausging, meist in einem Monat. Ohne ihn ist jedes Budget nur geraten, denn du weißt nicht, wie viel du wirklich wofür ausgibst.' },

      { type: 'h2', text: '1. Erfasse, was hereinkommt' },
      { type: 'p', text: 'Zähl nur, was wirklich auf deinem Konto landet: das Nettogehalt nach Steuern und Abgaben, nicht das Brutto. Rechne die übrigen Einnahmen des Monats dazu, etwa Nebenjobs, Zinsen auf Erspartes, die Miete für ein Zimmer oder Sozialleistungen.' },
      { type: 'p', text: 'Wenn dein Einkommen von Monat zu Monat schwankt, zum Beispiel durch Provisionen oder Selbstständigkeit, nimm den niedrigsten Wert der letzten Monate als Grundlage. Eine positive Überraschung ist besser als eine negative.' },

      { type: 'h2', text: '2. Trenne die Fixkosten ab' },
      { type: 'p', text: 'Das sind Zahlungen, die sich mit gleichem Betrag wiederholen: Miete oder Hausrate, Kredite, Versicherungen, Internet und Handy, Monatskarte, Fitnessstudio. Nimm auch jährliche Kosten geteilt durch 12 dazu. Eine Kfz-Versicherung von 360 € im Jahr bedeutet 30 € im Monat, die du zurücklegen solltest.' },

      { type: 'h2', text: '3. Erfasse die variablen Ausgaben' },
      { type: 'p', text: 'Lebensmittel, Essen gehen, Sprit, Strom, Kleidung, Freizeit, Geschenke, Gesundheit. Hier verschwindet das Geld meist unbemerkt, und hier hast du auch den größten Spielraum. Notiere jede Ausgabe sofort, denn am Monatsende erinnert sich niemand an alles.' },

      { type: 'h2', text: '4. Berechne Überschuss oder Defizit' },
      { type: 'p', text: 'Zieh alle Ausgaben von den Einnahmen ab. Ist das Ergebnis positiv, hast du einen Überschuss. Ist es negativ, hast du ein Defizit, das mit Erspartem oder Krediten bezahlt wurde, auch wenn du es nicht bemerkt hast.' },
      { type: 'tip', text: 'Beispiel: 1.500 € netto, 780 € Fixkosten und 560 € variable Ausgaben ergeben einen Überschuss von 160 €. Wären die variablen Ausgaben 760 € gewesen, hätte der Monat mit einem Defizit von 40 € geendet.' },
      { type: 'p', text: 'Schau dir auch dein frei verfügbares Einkommen an: was nach Wohnen, Essen und anderen Notwendigkeiten übrig bleibt. Über dieses Geld entscheidest du frei, und daraus entsteht deine Sparquote.' },

      { type: 'h2', text: '5. Gib dem Überschuss ein Ziel' },
      { type: 'p', text: 'Ein Überschuss, der auf dem Girokonto liegen bleibt, wird ausgegeben. Gib ihm direkt am Monatsende eine Aufgabe:' },
      { type: 'ul', items: [
        'Ein Notgroschen, bis er drei bis sechs Monate an notwendigen Ausgaben abdeckt.',
        'Kurzfristige Ziele wie Urlaub, eine Weiterbildung oder ein neues Auto.',
        'Langfristige Ziele wie die Altersvorsorge oder Eigenkapital für eine Wohnung.',
        'Teure Schulden tilgen, etwa einen Kreditkartensaldo.',
      ] },

      { type: 'h2', text: 'Jeden Monat wiederholen' },
      { type: 'p', text: 'Ein einzelner Monat täuscht: Mal kommen Geschenke, Versicherungen oder Reparaturen dazu. Nach drei Monaten erkennst du Muster, und ab dann ergibt ein Budget Sinn.' },
      { type: 'p', text: 'In FinanceFlow erledigt das schon der kostenlose Tarif: Du ordnest Einnahmen und Ausgaben Kategorien zu, markierst Fixkosten als wiederkehrend, und das Dashboard zeigt den Monatssaldo und deine größten Ausgabenkategorien. In den bezahlten Tarifen fotografierst du außerdem einen Beleg, und die App füllt die Daten für dich aus.' },
    ],
  },
  {
    key: 'cash-flow',
    slug: 'flusso-di-cassa-personale',
    lang: 'it',
    title: 'Flusso di cassa personale: scopri dove vanno i tuoi soldi',
    description: 'Come registrare i soldi che entrano ed escono ogni mese, separare spese fisse e variabili e capire se chiudi in avanzo o in disavanzo.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'Un budget dice cosa pensi di fare con i tuoi soldi. Il flusso di cassa dice cosa è successo davvero. È il registro di tutto ciò che è entrato e uscito in un periodo, di solito un mese. Senza, qualsiasi budget è un\'ipotesi, perché non sai quanto spendi davvero per ogni cosa.' },

      { type: 'h2', text: '1. Registra i soldi che entrano' },
      { type: 'p', text: 'Conta solo ciò che arriva davvero sul conto: lo stipendio netto, dopo tasse e contributi, non il lordo. Aggiungi le altre entrate del mese, come lavori extra, interessi sui risparmi, l\'affitto di una stanza o sussidi.' },
      { type: 'p', text: 'Se il tuo reddito cambia da un mese all\'altro, per esempio con provvigioni o lavoro autonomo, usa come riferimento la cifra più bassa degli ultimi mesi. Meglio una sorpresa positiva.' },

      { type: 'h2', text: '2. Separa le spese fisse' },
      { type: 'p', text: 'Sono i pagamenti che si ripetono con la stessa cifra: affitto o rata del mutuo, prestiti, assicurazioni, internet e telefono, abbonamento ai trasporti, palestra. Includi anche le spese annuali divise per 12. Un\'assicurazione auto da 360 € l\'anno vale 30 € al mese da mettere da parte.' },

      { type: 'h2', text: '3. Registra le spese variabili' },
      { type: 'p', text: 'Spesa alimentare, ristoranti, carburante, elettricità, vestiti, tempo libero, regali, salute. È qui che i soldi spariscono senza che te ne accorga, ed è anche qui che hai più margine per cambiare. Annota ogni spesa subito, perché a fine mese nessuno si ricorda tutto.' },

      { type: 'h2', text: '4. Calcola l\'avanzo o il disavanzo' },
      { type: 'p', text: 'Sottrai tutte le uscite dalle entrate. Se il risultato è positivo, hai un avanzo. Se è negativo, hai un disavanzo, che è stato pagato con i risparmi o con il credito, anche se non te ne sei accorto.' },
      { type: 'tip', text: 'Esempio: 1500 € di stipendio netto, 780 € di spese fisse e 560 € di variabili lasciano un avanzo di 160 €. Se le variabili fossero state 760 €, il mese si sarebbe chiuso con un disavanzo di 40 €.' },
      { type: 'p', text: 'Conviene guardare anche il reddito discrezionale: ciò che resta dopo aver pagato casa, cibo e le altre necessità. Sono i soldi su cui decidi liberamente, ed è da lì che nasce il risparmio.' },

      { type: 'h2', text: '5. Decidi dove va l\'avanzo' },
      { type: 'p', text: 'Un avanzo lasciato sul conto corrente finisce speso. Dagli una destinazione appena finisce il mese:' },
      { type: 'ul', items: [
        'Un fondo di emergenza, fino a coprire da tre a sei mesi di spese essenziali.',
        'Obiettivi a breve termine, come una vacanza, un corso o cambiare auto.',
        'Obiettivi a lungo termine, come la pensione o l\'anticipo per una casa.',
        'Ridurre i debiti con interessi alti, come il saldo della carta di credito.',
      ] },

      { type: 'h2', text: 'Ripetilo ogni mese' },
      { type: 'p', text: 'Un mese da solo inganna: ci sono mesi con regali, assicurazioni o riparazioni. Dopo tre mesi inizi a vedere degli schemi, ed è da lì che un budget ha senso.' },
      { type: 'p', text: 'In FinanceFlow il piano gratuito fa già questo: dividi entrate e spese per categoria, segni le spese fisse come ricorrenti e il pannello mostra il saldo del mese e le categorie in cui spendi di più. Nei piani a pagamento puoi anche fotografare uno scontrino e l\'app compila i dati per te.' },
    ],
  },
]
