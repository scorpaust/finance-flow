import type { BlogPost } from './index'

// Orçamento mensal em 7 passos: objetivos, rendimento, poupança primeiro,
// fixas, variáveis, registo e desvios, revisão.
export const budgetStepsPosts: BlogPost[] = [
  {
    key: 'budget-steps',
    slug: 'como-fazer-um-orcamento',
    lang: 'pt',
    title: 'Como fazer um orçamento mensal em 7 passos',
    description: 'Do objetivo à revisão do mês: um método simples para fazer um orçamento realista, com poupança incluída e sem deixar de viver.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'Um orçamento não serve para te proibir coisas. Serve para decidires antes para onde vai o dinheiro, em vez de descobrires depois. Estes sete passos funcionam para quem vive sozinho, em casal ou com filhos.' },

      { type: 'h2', text: '1. Define objetivos concretos' },
      { type: 'p', text: '"Poupar mais" não é um objetivo, é um desejo. Um objetivo diz o quê, quanto e até quando: "juntar 1800 € para um fundo de emergência em 12 meses" ou "pagar o cartão de crédito até junho". Com um valor e um prazo, sabes quanto precisas de pôr de parte por mês.' },

      { type: 'h2', text: '2. Estima o rendimento com prudência' },
      { type: 'p', text: 'Usa o rendimento líquido que tens a certeza de receber. Prémios, subsídios extra ou prendas só entram quando chegarem à conta. Se o rendimento varia, parte do valor mais baixo dos últimos meses.' },

      { type: 'h2', text: '3. Põe primeiro a poupança e o fundo de emergência' },
      { type: 'p', text: 'O erro mais comum é poupar o que sobra no fim do mês. Trata a poupança como uma despesa fixa: o primeiro valor a sair quando recebes. O fundo de emergência deve chegar a três a seis meses de despesas essenciais, e mais se o teu rendimento for irregular.' },

      { type: 'h2', text: '4. Lista as despesas fixas' },
      { type: 'p', text: 'Renda ou prestação, créditos, seguros, telecomunicações, transportes. Não esqueças as despesas anuais ou semestrais, como o seguro do carro ou o IMI: divide-as pelos meses e põe esse valor de parte todos os meses.' },

      { type: 'h2', text: '5. Dá um limite às despesas variáveis' },
      { type: 'p', text: 'Alimentação, restaurantes, combustível, lazer, roupa. Parte do que gastaste em média nos últimos meses e ajusta onde quiseres cortar. Conta com a subida dos preços: o que custava 300 € há dois anos dificilmente custa o mesmo hoje.' },

      { type: 'h2', text: '6. Regista os gastos e compara com o plano' },
      { type: 'p', text: 'A diferença entre o que planeaste e o que gastaste chama-se desvio. Se gastaste menos, tens um excedente nessa categoria. Se gastaste mais, tens um défice que tem de sair de outra categoria ou da poupança.' },
      { type: 'tip', text: 'Exemplo: previste 380 € para supermercado e gastaste 406 €. O desvio é de 26 € a mais. Se no lazer previste 120 € e gastaste 90 €, os 30 € que sobram cobrem a diferença.' },

      { type: 'h2', text: '7. Revê o mês e ajusta' },
      { type: 'p', text: 'No fim de cada mês, olha para as categorias com desvios. Uma categoria que rebenta todos os meses tem um limite irrealista: sobe-o e tira a diferença de outra. Revê também os objetivos, porque a vida muda e o orçamento tem de mudar com ela.' },

      { type: 'h2', text: 'O que faz um orçamento resultar' },
      { type: 'ul', items: [
        'Realista: um orçamento demasiado apertado é abandonado ao fim de duas semanas.',
        'Flexível: tem de aguentar imprevistos e mudanças de vida.',
        'Escrito: um orçamento só de cabeça esquece-se com facilidade.',
        'Partilhado: se vives com alguém, decidam juntos.',
      ] },
      { type: 'p', text: 'No FinanceFlow, a partir do plano Pro, cada categoria ou grupo de despesas pode ter um limite mensal ou semanal, e a app avisa-te quando te aproximas dele. No Premium, a IA propõe limites para cada categoria a partir das tuas receitas, das despesas fixas e da meta de poupança, e tu ajustas o que quiseres antes de aplicar.' },
    ],
  },
  {
    key: 'budget-steps',
    slug: 'how-to-make-a-budget',
    lang: 'en',
    title: 'How to make a monthly budget in 7 steps',
    description: 'From setting a goal to reviewing the month: a simple method for a realistic budget that includes savings and still lets you live.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'A budget is not there to forbid things. It is there so you decide in advance where your money goes, instead of finding out afterwards. These seven steps work whether you live alone, as a couple or with children.' },

      { type: 'h2', text: '1. Set concrete goals' },
      { type: 'p', text: '"Save more" is not a goal, it is a wish. A goal says what, how much and by when: "build a €1,800 emergency fund in 12 months" or "pay off the credit card by June". With an amount and a deadline, you know how much to set aside each month.' },

      { type: 'h2', text: '2. Estimate your income cautiously' },
      { type: 'p', text: 'Use the take-home pay you are certain to receive. Bonuses, extra payments or gifts only count once they reach your account. If your income varies, start from the lowest amount of recent months.' },

      { type: 'h2', text: '3. Put savings and your emergency fund first' },
      { type: 'p', text: 'The most common mistake is saving whatever is left at the end of the month. Treat savings as a fixed expense: the first payment to leave when you get paid. Your emergency fund should reach three to six months of essential expenses, and more if your income is irregular.' },

      { type: 'h2', text: '4. List your fixed expenses' },
      { type: 'p', text: 'Rent or mortgage, loans, insurance, phone and internet, transport. Don\'t forget annual or twice-yearly bills, such as car insurance or property tax: divide them across the months and set that amount aside every month.' },

      { type: 'h2', text: '5. Give your variable expenses a limit' },
      { type: 'p', text: 'Food, eating out, fuel, leisure, clothes. Start from your average spending over recent months and adjust where you want to cut back. Allow for rising prices: what cost €300 two years ago probably doesn\'t cost the same today.' },

      { type: 'h2', text: '6. Track spending and compare it with the plan' },
      { type: 'p', text: 'The difference between what you planned and what you spent is called a variance. If you spent less, that category has a surplus. If you spent more, it has a deficit that has to come from another category or from savings.' },
      { type: 'tip', text: 'Example: you planned €380 for groceries and spent €406. The variance is €26 over. If you planned €120 for leisure and spent €90, the €30 left over covers the difference.' },

      { type: 'h2', text: '7. Review the month and adjust' },
      { type: 'p', text: 'At the end of each month, look at the categories with variances. A category that goes over every month has an unrealistic limit: raise it and take the difference from another. Review your goals too, because life changes and your budget has to change with it.' },

      { type: 'h2', text: 'What makes a budget work' },
      { type: 'ul', items: [
        'Realistic: a budget that is too tight gets abandoned within two weeks.',
        'Flexible: it has to cope with surprises and life changes.',
        'Written down: a budget kept only in your head is easily forgotten.',
        'Shared: if you live with someone, decide together.',
      ] },
      { type: 'p', text: 'In FinanceFlow, from the Pro plan up, each category or group of expenses can have a monthly or weekly limit, and the app warns you as you get close to it. On Premium, the AI suggests a limit for each category based on your income, fixed expenses and savings goal, and you adjust whatever you like before applying it.' },
    ],
  },
  {
    key: 'budget-steps',
    slug: 'como-hacer-un-presupuesto',
    lang: 'es',
    title: 'Cómo hacer un presupuesto mensual en 7 pasos',
    description: 'Del objetivo a la revisión del mes: un método sencillo para un presupuesto realista, con el ahorro incluido y sin dejar de vivir.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'Un presupuesto no sirve para prohibirte cosas. Sirve para decidir antes adónde va el dinero, en lugar de descubrirlo después. Estos siete pasos funcionan tanto si vives solo como en pareja o con hijos.' },

      { type: 'h2', text: '1. Define objetivos concretos' },
      { type: 'p', text: '"Ahorrar más" no es un objetivo, es un deseo. Un objetivo dice qué, cuánto y para cuándo: "reunir 1800 € para un fondo de emergencia en 12 meses" o "liquidar la tarjeta de crédito antes de junio". Con una cantidad y un plazo sabes cuánto apartar cada mes.' },

      { type: 'h2', text: '2. Calcula los ingresos con prudencia' },
      { type: 'p', text: 'Usa los ingresos netos que estás seguro de cobrar. Las primas, pagas extra o regalos solo cuentan cuando lleguen a la cuenta. Si tus ingresos varían, parte de la cantidad más baja de los últimos meses.' },

      { type: 'h2', text: '3. Pon primero el ahorro y el fondo de emergencia' },
      { type: 'p', text: 'El error más habitual es ahorrar lo que sobra a final de mes. Trata el ahorro como un gasto fijo: el primer pago que sale cuando cobras. El fondo de emergencia debería llegar a entre tres y seis meses de gastos esenciales, y más si tus ingresos son irregulares.' },

      { type: 'h2', text: '4. Haz la lista de gastos fijos' },
      { type: 'p', text: 'Alquiler o hipoteca, préstamos, seguros, telecomunicaciones, transporte. No olvides los gastos anuales o semestrales, como el seguro del coche o el IBI: repártelos entre los meses y aparta esa cantidad cada mes.' },

      { type: 'h2', text: '5. Pon un límite a los gastos variables' },
      { type: 'p', text: 'Alimentación, restaurantes, gasolina, ocio, ropa. Parte de lo que gastaste de media en los últimos meses y ajusta donde quieras recortar. Ten en cuenta la subida de precios: lo que costaba 300 € hace dos años difícilmente cuesta lo mismo hoy.' },

      { type: 'h2', text: '6. Registra los gastos y compáralos con el plan' },
      { type: 'p', text: 'La diferencia entre lo que planeaste y lo que gastaste se llama desviación. Si gastaste menos, esa categoría tiene superávit. Si gastaste más, tiene un déficit que debe salir de otra categoría o del ahorro.' },
      { type: 'tip', text: 'Ejemplo: previste 380 € para el supermercado y gastaste 406 €. La desviación es de 26 € de más. Si en ocio previste 120 € y gastaste 90 €, los 30 € que sobran cubren la diferencia.' },

      { type: 'h2', text: '7. Revisa el mes y ajusta' },
      { type: 'p', text: 'Al final de cada mes, mira las categorías con desviaciones. Una categoría que se pasa todos los meses tiene un límite poco realista: súbelo y saca la diferencia de otra. Revisa también los objetivos, porque la vida cambia y el presupuesto tiene que cambiar con ella.' },

      { type: 'h2', text: 'Qué hace que un presupuesto funcione' },
      { type: 'ul', items: [
        'Realista: un presupuesto demasiado ajustado se abandona en dos semanas.',
        'Flexible: tiene que aguantar imprevistos y cambios de vida.',
        'Por escrito: un presupuesto solo en la cabeza se olvida con facilidad.',
        'Compartido: si vives con alguien, decidid juntos.',
      ] },
      { type: 'p', text: 'En FinanceFlow, a partir del plan Pro, cada categoría o grupo de gastos puede tener un límite mensual o semanal, y la app te avisa cuando te acercas. En Premium, la IA propone un límite para cada categoría a partir de tus ingresos, los gastos fijos y la meta de ahorro, y tú ajustas lo que quieras antes de aplicarlo.' },
    ],
  },
  {
    key: 'budget-steps',
    slug: 'comment-faire-un-budget',
    lang: 'fr',
    title: 'Comment faire un budget mensuel en 7 étapes',
    description: 'De l\'objectif au bilan du mois : une méthode simple pour un budget réaliste, épargne comprise, qui vous laisse quand même vivre.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'Un budget n\'est pas là pour vous interdire des choses. Il sert à décider à l\'avance où va votre argent, au lieu de le découvrir après coup. Ces sept étapes fonctionnent que vous viviez seul, en couple ou avec des enfants.' },

      { type: 'h2', text: '1. Fixez des objectifs concrets' },
      { type: 'p', text: '« Épargner plus » n\'est pas un objectif, c\'est un souhait. Un objectif dit quoi, combien et pour quand : « constituer 1 800 € d\'épargne de précaution en 12 mois » ou « solder la carte de crédit d\'ici juin ». Avec un montant et une échéance, vous savez combien mettre de côté chaque mois.' },

      { type: 'h2', text: '2. Estimez vos revenus avec prudence' },
      { type: 'p', text: 'Retenez le revenu net que vous êtes certain de toucher. Primes, treizième mois ou cadeaux ne comptent qu\'une fois arrivés sur le compte. Si vos revenus varient, partez du montant le plus bas des derniers mois.' },

      { type: 'h2', text: '3. Placez l\'épargne et la réserve de précaution en premier' },
      { type: 'p', text: 'L\'erreur la plus fréquente est d\'épargner ce qui reste en fin de mois. Traitez l\'épargne comme une dépense fixe : le premier paiement qui part le jour de la paie. L\'épargne de précaution devrait atteindre trois à six mois de dépenses essentielles, davantage si vos revenus sont irréguliers.' },

      { type: 'h2', text: '4. Listez les dépenses fixes' },
      { type: 'p', text: 'Loyer ou crédit immobilier, autres crédits, assurances, télécoms, transports. N\'oubliez pas les dépenses annuelles ou semestrielles, comme l\'assurance auto ou la taxe foncière : répartissez-les sur les mois et mettez ce montant de côté chaque mois.' },

      { type: 'h2', text: '5. Plafonnez les dépenses variables' },
      { type: 'p', text: 'Alimentation, restaurants, carburant, loisirs, vêtements. Partez de votre dépense moyenne des derniers mois et ajustez là où vous voulez réduire. Tenez compte de la hausse des prix : ce qui coûtait 300 € il y a deux ans ne coûte sans doute plus la même chose aujourd\'hui.' },

      { type: 'h2', text: '6. Notez vos dépenses et comparez-les au plan' },
      { type: 'p', text: 'La différence entre ce que vous aviez prévu et ce que vous avez dépensé s\'appelle un écart. Si vous avez dépensé moins, la catégorie est en excédent. Si vous avez dépensé plus, elle est en déficit, et la différence doit venir d\'une autre catégorie ou de l\'épargne.' },
      { type: 'tip', text: 'Exemple : vous aviez prévu 380 € de courses et vous en avez dépensé 406 €. L\'écart est de 26 € en trop. Si vous aviez prévu 120 € de loisirs et dépensé 90 €, les 30 € restants couvrent la différence.' },

      { type: 'h2', text: '7. Faites le bilan du mois et ajustez' },
      { type: 'p', text: 'À la fin de chaque mois, regardez les catégories qui présentent des écarts. Une catégorie qui dépasse tous les mois a un plafond irréaliste : relevez-le et prenez la différence ailleurs. Revoyez aussi vos objectifs, car la vie change et le budget doit suivre.' },

      { type: 'h2', text: 'Ce qui fait qu\'un budget fonctionne' },
      { type: 'ul', items: [
        'Réaliste : un budget trop serré est abandonné au bout de deux semaines.',
        'Souple : il doit encaisser les imprévus et les changements de vie.',
        'Écrit : un budget gardé en tête s\'oublie facilement.',
        'Partagé : si vous vivez à deux, décidez ensemble.',
      ] },
      { type: 'p', text: 'Dans FinanceFlow, à partir de la formule Pro, chaque catégorie ou groupe de dépenses peut avoir un plafond mensuel ou hebdomadaire, et l\'application vous prévient quand vous en approchez. Avec Premium, l\'IA propose un plafond par catégorie à partir de vos revenus, de vos dépenses fixes et de votre objectif d\'épargne, et vous ajustez ce que vous voulez avant de l\'appliquer.' },
    ],
  },
  {
    key: 'budget-steps',
    slug: 'budget-erstellen',
    lang: 'de',
    title: 'Ein Monatsbudget erstellen: in 7 Schritten',
    description: 'Vom Ziel bis zum Monatsrückblick: eine einfache Methode für ein realistisches Budget, das Sparen einplant und trotzdem Luft zum Leben lässt.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'Ein Budget ist nicht dazu da, dir etwas zu verbieten. Es hilft dir, vorher zu entscheiden, wohin dein Geld geht, statt es hinterher festzustellen. Diese sieben Schritte funktionieren für Singles, Paare und Familien.' },

      { type: 'h2', text: '1. Setz dir konkrete Ziele' },
      { type: 'p', text: '„“ ist kein Ziel, sondern ein Wunsch. Ein Ziel sagt, was, wie viel und bis wann: „“ oder „“. Mit Betrag und Frist weißt du, wie viel du jeden Monat zurücklegen musst.' },

      { type: 'h2', text: '2. Schätz dein Einkommen vorsichtig' },
      { type: 'p', text: 'Plane mit dem Nettoeinkommen, das sicher kommt. Boni, Sonderzahlungen oder Geschenke zählen erst, wenn sie auf dem Konto sind. Wenn dein Einkommen schwankt, geh vom niedrigsten Wert der letzten Monate aus.' },

      { type: 'h2', text: '3. Spar zuerst, auch für den Notgroschen' },
      { type: 'p', text: 'Der häufigste Fehler ist, zu sparen, was am Monatsende übrig bleibt. Behandle das Sparen wie eine Fixausgabe: die erste Zahlung, die nach dem Gehaltseingang rausgeht. Der Notgroschen sollte drei bis sechs Monate an notwendigen Ausgaben abdecken, bei unregelmäßigem Einkommen mehr.' },

      { type: 'h2', text: '4. Liste deine Fixkosten auf' },
      { type: 'p', text: 'Miete oder Hausrate, Kredite, Versicherungen, Handy und Internet, Mobilität. Vergiss jährliche oder halbjährliche Zahlungen wie Kfz-Versicherung oder Grundsteuer nicht: Verteil sie auf die Monate und leg den Betrag jeden Monat zurück.' },

      { type: 'h2', text: '5. Gib den variablen Ausgaben ein Limit' },
      { type: 'p', text: 'Lebensmittel, Restaurants, Sprit, Freizeit, Kleidung. Geh von deinem Durchschnitt der letzten Monate aus und kürze dort, wo du willst. Rechne mit steigenden Preisen: Was vor zwei Jahren 300 € gekostet hat, kostet heute kaum noch dasselbe.' },

      { type: 'h2', text: '6. Erfasse die Ausgaben und vergleiche mit dem Plan' },
      { type: 'p', text: 'Der Unterschied zwischen Plan und tatsächlichen Ausgaben heißt Abweichung. Hast du weniger ausgegeben, hat die Kategorie einen Überschuss. Hast du mehr ausgegeben, entsteht ein Defizit, das aus einer anderen Kategorie oder aus dem Ersparten kommen muss.' },
      { type: 'tip', text: 'Beispiel: Du hast 380 € für Lebensmittel geplant und 406 € ausgegeben. Die Abweichung beträgt 26 € zu viel. Hast du für Freizeit 120 € geplant und 90 € ausgegeben, decken die übrigen 30 € die Differenz.' },

      { type: 'h2', text: '7. Schau auf den Monat zurück und passe an' },
      { type: 'p', text: 'Sieh dir am Monatsende die Kategorien mit Abweichungen an. Eine Kategorie, die jeden Monat überzogen wird, hat ein unrealistisches Limit: Erhöhe es und nimm die Differenz aus einer anderen. Überprüfe auch deine Ziele, denn das Leben ändert sich und das Budget muss mitziehen.' },

      { type: 'h2', text: 'Was ein Budget erfolgreich macht' },
      { type: 'ul', items: [
        'Realistisch: Ein zu knappes Budget wird nach zwei Wochen aufgegeben.',
        'Flexibel: Es muss Überraschungen und Lebensveränderungen aushalten.',
        'Schriftlich: Ein Budget nur im Kopf wird leicht vergessen.',
        'Gemeinsam: Wenn du mit jemandem zusammenlebst, entscheidet zusammen.',
      ] },
      { type: 'p', text: 'In FinanceFlow kann ab dem Pro-Tarif jede Kategorie oder Ausgabengruppe ein Monats- oder Wochenlimit haben, und die App warnt dich, wenn du dich ihm näherst. Im Premium-Tarif schlägt die KI für jede Kategorie ein Limit vor, basierend auf deinen Einnahmen, Fixkosten und deinem Sparziel, und du passt vor dem Übernehmen an, was du willst.' },
    ],
  },
  {
    key: 'budget-steps',
    slug: 'come-fare-un-budget',
    lang: 'it',
    title: 'Come fare un budget mensile in 7 passi',
    description: 'Dall\'obiettivo alla revisione del mese: un metodo semplice per un budget realistico, con il risparmio incluso e senza smettere di vivere.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'Un budget non serve a vietarti le cose. Serve a decidere prima dove vanno i soldi, invece di scoprirlo dopo. Questi sette passi funzionano sia se vivi da solo, sia in coppia o con figli.' },

      { type: 'h2', text: '1. Fissa obiettivi concreti' },
      { type: 'p', text: '"Risparmiare di più" non è un obiettivo, è un desiderio. Un obiettivo dice cosa, quanto ed entro quando: "mettere da parte 1800 € per un fondo di emergenza in 12 mesi" o "saldare la carta di credito entro giugno". Con una cifra e una scadenza sai quanto accantonare ogni mese.' },

      { type: 'h2', text: '2. Stima il reddito con prudenza' },
      { type: 'p', text: 'Usa il reddito netto che sei certo di ricevere. Premi, mensilità aggiuntive o regali contano solo quando arrivano sul conto. Se il reddito varia, parti dalla cifra più bassa degli ultimi mesi.' },

      { type: 'h2', text: '3. Metti prima il risparmio e il fondo di emergenza' },
      { type: 'p', text: 'L\'errore più comune è risparmiare quello che avanza a fine mese. Tratta il risparmio come una spesa fissa: il primo pagamento che esce quando arriva lo stipendio. Il fondo di emergenza dovrebbe arrivare a tre-sei mesi di spese essenziali, e di più se il reddito è irregolare.' },

      { type: 'h2', text: '4. Elenca le spese fisse' },
      { type: 'p', text: 'Affitto o rata del mutuo, prestiti, assicurazioni, telefonia e internet, trasporti. Non dimenticare le spese annuali o semestrali, come l\'assicurazione auto o l\'IMU: dividile per i mesi e metti da parte quella cifra ogni mese.' },

      { type: 'h2', text: '5. Dai un limite alle spese variabili' },
      { type: 'p', text: 'Alimentari, ristoranti, carburante, tempo libero, vestiti. Parti da quanto hai speso in media negli ultimi mesi e correggi dove vuoi tagliare. Tieni conto dell\'aumento dei prezzi: ciò che costava 300 € due anni fa difficilmente costa lo stesso oggi.' },

      { type: 'h2', text: '6. Registra le spese e confrontale con il piano' },
      { type: 'p', text: 'La differenza tra quanto avevi previsto e quanto hai speso si chiama scostamento. Se hai speso meno, la categoria è in avanzo. Se hai speso di più, è in disavanzo, e la differenza deve uscire da un\'altra categoria o dai risparmi.' },
      { type: 'tip', text: 'Esempio: avevi previsto 380 € di spesa alimentare e ne hai spesi 406. Lo scostamento è di 26 € in più. Se per il tempo libero avevi previsto 120 € e ne hai spesi 90, i 30 € avanzati coprono la differenza.' },

      { type: 'h2', text: '7. Rivedi il mese e correggi' },
      { type: 'p', text: 'A fine mese guarda le categorie con scostamenti. Una categoria che sfora ogni mese ha un limite irrealistico: alzalo e prendi la differenza da un\'altra. Rivedi anche gli obiettivi, perché la vita cambia e il budget deve cambiare con lei.' },

      { type: 'h2', text: 'Cosa fa funzionare un budget' },
      { type: 'ul', items: [
        'Realistico: un budget troppo stretto si abbandona dopo due settimane.',
        'Flessibile: deve reggere imprevisti e cambiamenti di vita.',
        'Scritto: un budget solo in testa si dimentica facilmente.',
        'Condiviso: se vivi con qualcuno, decidete insieme.',
      ] },
      { type: 'p', text: 'In FinanceFlow, dal piano Pro in su, ogni categoria o gruppo di spese può avere un limite mensile o settimanale, e l\'app ti avvisa quando ti avvicini. Con Premium l\'IA propone un limite per ogni categoria in base a entrate, spese fisse e obiettivo di risparmio, e tu correggi ciò che vuoi prima di applicarlo.' },
    ],
  },
]
