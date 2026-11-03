import type { BlogPost } from './index'

// Organizar as despesas mensais em 5 passos: juntar tudo, categorias, registo
// diário, leitura do mês, ajuste. A partir de um rascunho da Holo, corrigido:
// a app não liga a contas bancárias nem tem orçamentos partilhados.
export const monthlyExpensesPosts: BlogPost[] = [
  {
    key: 'monthly-expenses',
    slug: 'como-organizar-despesas-mensais-5-passos',
    lang: 'pt',
    title: 'Como organizar as despesas mensais em 5 passos simples',
    description: 'Junta as contas, categoriza os gastos, regista o dia a dia, lê os números do mês e ajusta o plano: um método simples para organizar as despesas mensais.',
    published: '2026-11-03',
    blocks: [
      { type: 'p', text: 'Organizar as despesas mensais não exige folhas de cálculo intermináveis. Na maioria das vezes, o problema não é gastar demasiado: é não conseguir ver para onde vai o dinheiro. Estes cinco passos ajudam-te a pôr as contas em ordem e a planear o mês seguinte com base em números reais.' },

      { type: 'h2', text: 'Porque é que as despesas parecem sempre fugir ao controlo' },
      { type: 'p', text: 'Os gastos pequenos e frequentes passam quase sempre despercebidos: o café a caminho do trabalho, a subscrição que já não usas, a compra rápida no supermercado. Somados no fim do mês, transformam-se numa surpresa desagradável.' },
      { type: 'p', text: 'Quando os números estão espalhados por extratos, cartões e talões, juntar tudo dá trabalho. E quando dá trabalho, deixamos de olhar. A solução não é mais disciplina: é tornar a consulta tão simples que passe a ser natural.' },

      { type: 'h2', text: '1. Junta tudo o que entra e sai num só lugar' },
      { type: 'p', text: 'Reúne o que recebes e o que gastas: salário e outras receitas, despesas fixas (renda, luz, internet, seguros), gastos variáveis e poupança. Os extratos dos últimos dois ou três meses são um bom ponto de partida. Não precisa de estar perfeito, precisa de estar visível.' },
      { type: 'p', text: 'Pode ser um caderno, uma folha de cálculo ou uma app. O importante é ser um único sítio, para não teres de andar à procura da informação.' },

      { type: 'h2', text: '2. Categoriza os gastos' },
      { type: 'p', text: 'Agrupa os gastos em categorias que façam sentido para a tua vida: casa, alimentação, transportes, lazer, saúde, subscrições. Poucas categorias claras revelam padrões que, de outra forma, ficam escondidos.' },
      { type: 'p', text: 'É aqui que percebes, por exemplo, quanto pesam as refeições fora de casa no total do mês. Não é para te culpares, é para decidires com informação.' },

      { type: 'h2', text: '3. Regista os gastos no dia a dia' },
      { type: 'p', text: 'A organização só funciona se for fácil de manter. Regista cada gasto no momento, enquanto pagas ou logo a seguir. Assim, deixas de acumular talões para o fim do mês e sabes sempre quanto já gastaste e quanto ainda podes gastar.' },
      { type: 'tip', text: 'Liga o registo a algo que já fazes, como guardar o cartão depois de pagar. Quanto menos tiveres de te lembrar, mais fácil é manter o hábito.' },

      { type: 'h2', text: '4. Lê os números no fim do mês' },
      { type: 'p', text: 'Reserva dez minutos no fim de cada mês para comparar com o mês anterior. Que categoria subiu? Foi um gasto pontual ou um hábito novo? Os números sozinhos dizem pouco: o que muda comportamentos é perceberes o que está por trás deles.' },

      { type: 'h2', text: '5. Ajusta o plano do mês seguinte' },
      { type: 'p', text: 'Usa o que aprendeste para definir um valor realista por categoria, com base no que costumas gastar. Ajusta, não recomeces: pequenas correções todos os meses duram mais do que mudanças radicais. Se geres as contas com alguém, decidam os valores em conjunto.' },
      { type: 'tip', text: 'Exemplo: se gastaste 120 € em restaurantes em setembro e 180 € em outubro, não precisas de um plano novo. Basta decidires um limite para novembro, por exemplo 140 €, e veres como corre.' },

      { type: 'h2', text: 'Começa hoje' },
      { type: 'p', text: 'Não precisas de fazer tudo de uma vez. Começa por juntar os extratos do último mês e por registar os gastos de hoje.' },
      { type: 'p', text: 'Se preferires uma app, o FinanceFlow foi feito para isto: registas receitas e despesas em segundos e vês para onde vai o dinheiro, por categoria e por mês, no plano gratuito. Nos planos pagos, também podes fotografar talões, pôr limites com alerta e pedir à IA que explique as tuas estatísticas em linguagem simples.' },
    ],
  },
  {
    key: 'monthly-expenses',
    slug: 'how-to-organize-monthly-expenses',
    lang: 'en',
    title: 'How to organize your monthly expenses in 5 simple steps',
    description: 'Gather your accounts, categorize your spending, log it daily, read the month\'s numbers and adjust the plan: a simple way to organize your monthly expenses.',
    published: '2026-11-03',
    blocks: [
      { type: 'p', text: 'Organizing your monthly expenses does not take endless spreadsheets. Most of the time, the problem is not spending too much: it is not being able to see where the money goes. These five steps help you put your finances in order and plan next month from real numbers.' },

      { type: 'h2', text: 'Why expenses always seem to get out of control' },
      { type: 'p', text: 'Small, frequent purchases almost always go unnoticed: the coffee on the way to work, the subscription you no longer use, the quick trip to the supermarket. Added up at the end of the month, they become an unpleasant surprise.' },
      { type: 'p', text: 'When your numbers are scattered across statements, cards and receipts, pulling them together takes effort. And when it takes effort, we stop looking. The answer is not more discipline: it is making the numbers so easy to check that checking becomes natural.' },

      { type: 'h2', text: '1. Gather everything coming in and going out in one place' },
      { type: 'p', text: 'Collect what you earn and what you spend: salary and other income, fixed costs (rent, electricity, internet, insurance), variable spending and savings. Your statements from the last two or three months are a good starting point. It does not have to be perfect, it has to be visible.' },
      { type: 'p', text: 'A notebook, a spreadsheet or an app will all do. What matters is having one single place, so you never have to go looking for the information.' },

      { type: 'h2', text: '2. Categorize your spending' },
      { type: 'p', text: 'Group your spending into categories that make sense for your life: home, food, transport, leisure, health, subscriptions. A few clear categories reveal patterns that would otherwise stay hidden.' },
      { type: 'p', text: 'This is where you find out, for example, how much eating out weighs in the monthly total. Not to feel guilty, but to decide with the facts in front of you.' },

      { type: 'h2', text: '3. Log your spending day to day' },
      { type: 'p', text: 'Getting organized only works if it is easy to keep up. Log each purchase on the spot, as you pay or right after. That way receipts stop piling up until the end of the month, and you always know how much you have spent and how much you have left.' },
      { type: 'tip', text: 'Tie logging to something you already do, like putting your card away after paying. The less you have to remember, the easier the habit is to keep.' },

      { type: 'h2', text: '4. Read the numbers at the end of the month' },
      { type: 'p', text: 'Set aside ten minutes at the end of each month to compare with the month before. Which category went up? Was it a one-off or a new habit? Numbers alone say little: what changes behavior is understanding what is behind them.' },

      { type: 'h2', text: '5. Adjust the plan for next month' },
      { type: 'p', text: 'Use what you learned to set a realistic amount for each category, based on what you usually spend. Adjust rather than start over: small corrections every month last longer than radical changes. If you manage your money with someone else, decide the amounts together.' },
      { type: 'tip', text: 'Example: if you spent €120 on restaurants in September and €180 in October, you do not need a new plan. Just pick a limit for November, say €140, and see how it goes.' },

      { type: 'h2', text: 'Start today' },
      { type: 'p', text: 'You do not have to do everything at once. Start by gathering last month\'s statements and logging today\'s spending.' },
      { type: 'p', text: 'If you prefer an app, FinanceFlow was built for this: you log income and expenses in seconds and see where your money goes, by category and by month, on the free plan. Paid plans also let you scan receipts, set limits with alerts and ask AI to explain your statistics in plain language.' },
    ],
  },
  {
    key: 'monthly-expenses',
    slug: 'como-organizar-gastos-mensuales',
    lang: 'es',
    title: 'Cómo organizar tus gastos mensuales en 5 pasos sencillos',
    description: 'Reúne tus cuentas, clasifica los gastos, regístralos a diario, lee los números del mes y ajusta el plan: un método sencillo para organizar tus gastos mensuales.',
    published: '2026-11-03',
    blocks: [
      { type: 'p', text: 'Organizar los gastos mensuales no exige hojas de cálculo interminables. La mayoría de las veces, el problema no es gastar demasiado: es no poder ver adónde va el dinero. Estos cinco pasos te ayudan a poner tus cuentas en orden y a planificar el mes siguiente con números reales.' },

      { type: 'h2', text: 'Por qué los gastos siempre parecen descontrolarse' },
      { type: 'p', text: 'Los gastos pequeños y frecuentes casi siempre pasan desapercibidos: el café de camino al trabajo, la suscripción que ya no usas, la compra rápida en el supermercado. Sumados a final de mes, se convierten en una sorpresa desagradable.' },
      { type: 'p', text: 'Cuando los números están repartidos entre extractos, tarjetas y tiques, reunirlos cuesta trabajo. Y cuando cuesta trabajo, dejamos de mirar. La solución no es más disciplina: es hacer que consultarlos sea tan sencillo que resulte natural.' },

      { type: 'h2', text: '1. Reúne en un solo lugar todo lo que entra y sale' },
      { type: 'p', text: 'Junta lo que ingresas y lo que gastas: sueldo y otros ingresos, gastos fijos (alquiler, luz, internet, seguros), gastos variables y ahorro. Los extractos de los últimos dos o tres meses son un buen punto de partida. No tiene que ser perfecto, tiene que estar a la vista.' },
      { type: 'p', text: 'Puede ser un cuaderno, una hoja de cálculo o una app. Lo importante es que sea un único sitio, para no tener que andar buscando la información.' },

      { type: 'h2', text: '2. Clasifica los gastos' },
      { type: 'p', text: 'Agrupa los gastos en categorías que tengan sentido para tu vida: hogar, alimentación, transporte, ocio, salud, suscripciones. Unas pocas categorías claras revelan patrones que, de otro modo, quedan ocultos.' },
      { type: 'p', text: 'Aquí es donde descubres, por ejemplo, cuánto pesan las comidas fuera de casa en el total del mes. No para culparte, sino para decidir con información.' },

      { type: 'h2', text: '3. Registra los gastos en el día a día' },
      { type: 'p', text: 'La organización solo funciona si es fácil de mantener. Registra cada gasto en el momento, mientras pagas o justo después. Así dejas de acumular tiques hasta final de mes y siempre sabes cuánto has gastado y cuánto te queda.' },
      { type: 'tip', text: 'Vincula el registro a algo que ya haces, como guardar la tarjeta después de pagar. Cuanto menos tengas que recordar, más fácil es mantener el hábito.' },

      { type: 'h2', text: '4. Lee los números a final de mes' },
      { type: 'p', text: 'Reserva diez minutos a final de cada mes para comparar con el mes anterior. ¿Qué categoría ha subido? ¿Fue un gasto puntual o un hábito nuevo? Los números por sí solos dicen poco: lo que cambia los comportamientos es entender qué hay detrás de ellos.' },

      { type: 'h2', text: '5. Ajusta el plan del mes siguiente' },
      { type: 'p', text: 'Usa lo que has aprendido para fijar un importe realista por categoría, según lo que sueles gastar. Ajusta, no empieces de cero: las pequeñas correcciones mensuales duran más que los cambios radicales. Si gestionas las cuentas con alguien, decidid los importes juntos.' },
      { type: 'tip', text: 'Ejemplo: si gastaste 120 € en restaurantes en septiembre y 180 € en octubre, no necesitas un plan nuevo. Basta con fijar un límite para noviembre, por ejemplo 140 €, y ver cómo va.' },

      { type: 'h2', text: 'Empieza hoy' },
      { type: 'p', text: 'No tienes que hacerlo todo de golpe. Empieza por reunir los extractos del último mes y por registrar los gastos de hoy.' },
      { type: 'p', text: 'Si prefieres una app, FinanceFlow está hecha para esto: registras ingresos y gastos en segundos y ves adónde va el dinero, por categoría y por mes, en el plan gratuito. Con los planes de pago también puedes fotografiar tiques, poner límites con alerta y pedir a la IA que te explique tus estadísticas en un lenguaje sencillo.' },
    ],
  },
  {
    key: 'monthly-expenses',
    slug: 'comment-organiser-ses-depenses-mensuelles',
    lang: 'fr',
    title: 'Comment organiser vos dépenses mensuelles en 5 étapes simples',
    description: 'Rassemblez vos comptes, classez vos dépenses, notez-les au quotidien, lisez les chiffres du mois et ajustez le plan : une méthode simple et concrète.',
    published: '2026-11-03',
    blocks: [
      { type: 'p', text: 'Organiser ses dépenses mensuelles ne demande pas des tableurs interminables. Le plus souvent, le problème n\'est pas de trop dépenser : c\'est de ne pas voir où va l\'argent. Ces cinq étapes vous aident à remettre vos comptes en ordre et à préparer le mois suivant à partir de chiffres réels.' },

      { type: 'h2', text: 'Pourquoi les dépenses semblent toujours nous échapper' },
      { type: 'p', text: 'Les petites dépenses fréquentes passent presque toujours inaperçues : le café en allant au travail, l\'abonnement que vous n\'utilisez plus, le passage rapide au supermarché. Additionnées en fin de mois, elles deviennent une mauvaise surprise.' },
      { type: 'p', text: 'Quand les chiffres sont éparpillés entre relevés, cartes et tickets, tout rassembler demande un effort. Et quand cela demande un effort, on cesse de regarder. La solution n\'est pas plus de discipline : c\'est de rendre la consultation si simple qu\'elle devienne naturelle.' },

      { type: 'h2', text: '1. Rassemblez au même endroit tout ce qui entre et sort' },
      { type: 'p', text: 'Réunissez ce que vous gagnez et ce que vous dépensez : salaire et autres revenus, charges fixes (loyer, électricité, internet, assurances), dépenses variables et épargne. Les relevés des deux ou trois derniers mois sont un bon point de départ. Inutile que ce soit parfait, il faut que ce soit visible.' },
      { type: 'p', text: 'Un carnet, un tableur ou une application conviennent. L\'important est d\'avoir un seul endroit, pour ne plus avoir à chercher l\'information.' },

      { type: 'h2', text: '2. Classez vos dépenses par catégorie' },
      { type: 'p', text: 'Regroupez vos dépenses en catégories adaptées à votre vie : logement, alimentation, transports, loisirs, santé, abonnements. Quelques catégories claires révèlent des habitudes qui resteraient sinon cachées.' },
      { type: 'p', text: 'C\'est là que vous découvrez, par exemple, le poids des repas à l\'extérieur dans le total du mois. Non pas pour culpabiliser, mais pour décider en connaissance de cause.' },

      { type: 'h2', text: '3. Notez vos dépenses au quotidien' },
      { type: 'p', text: 'L\'organisation ne fonctionne que si elle est facile à tenir. Notez chaque dépense sur le moment, en payant ou juste après. Vous cessez ainsi d\'accumuler les tickets jusqu\'à la fin du mois, et vous savez toujours combien vous avez dépensé et ce qu\'il vous reste.' },
      { type: 'tip', text: 'Associez la saisie à un geste que vous faites déjà, comme ranger votre carte après avoir payé. Moins vous avez à y penser, plus l\'habitude est facile à garder.' },

      { type: 'h2', text: '4. Lisez les chiffres en fin de mois' },
      { type: 'p', text: 'Réservez dix minutes à la fin de chaque mois pour comparer avec le mois précédent. Quelle catégorie a augmenté ? Était-ce ponctuel ou une nouvelle habitude ? Les chiffres seuls disent peu de choses : ce qui change les comportements, c\'est de comprendre ce qu\'il y a derrière.' },

      { type: 'h2', text: '5. Ajustez le plan du mois suivant' },
      { type: 'p', text: 'Servez-vous de ce que vous avez appris pour fixer un montant réaliste par catégorie, selon ce que vous dépensez d\'habitude. Ajustez au lieu de tout recommencer : de petites corrections chaque mois durent plus longtemps que des changements radicaux. Si vous gérez les comptes à deux, décidez des montants ensemble.' },
      { type: 'tip', text: 'Exemple : si vous avez dépensé 120 € au restaurant en septembre et 180 € en octobre, inutile de refaire un plan. Il suffit de fixer une limite pour novembre, par exemple 140 €, et de voir ce que cela donne.' },

      { type: 'h2', text: 'Commencez aujourd\'hui' },
      { type: 'p', text: 'Inutile de tout faire d\'un coup. Commencez par rassembler les relevés du mois dernier et par noter les dépenses d\'aujourd\'hui.' },
      { type: 'p', text: 'Si vous préférez une application, FinanceFlow est faite pour cela : vous saisissez revenus et dépenses en quelques secondes et vous voyez où va votre argent, par catégorie et par mois, avec le plan gratuit. Les plans payants permettent aussi de photographier vos tickets, de fixer des limites avec alerte et de demander à l\'IA d\'expliquer vos statistiques en langage simple.' },
    ],
  },
  {
    key: 'monthly-expenses',
    slug: 'monatliche-ausgaben-organisieren',
    lang: 'de',
    title: 'Monatliche Ausgaben organisieren: 5 einfache Schritte',
    description: 'Konten zusammenführen, Ausgaben einteilen, täglich erfassen, die Zahlen des Monats lesen und den Plan anpassen: eine einfache Methode für deine Ausgaben.',
    published: '2026-11-03',
    blocks: [
      { type: 'p', text: 'Um deine monatlichen Ausgaben zu organisieren, brauchst du keine endlosen Tabellen. Meist ist das Problem nicht, dass du zu viel ausgibst, sondern dass du nicht siehst, wohin das Geld geht. Diese fünf Schritte helfen dir, Ordnung in deine Finanzen zu bringen und den nächsten Monat mit echten Zahlen zu planen.' },

      { type: 'h2', text: 'Warum die Ausgaben immer aus dem Ruder zu laufen scheinen' },
      { type: 'p', text: 'Kleine, häufige Ausgaben fallen fast nie auf: der Kaffee auf dem Weg zur Arbeit, das Abo, das du nicht mehr nutzt, der schnelle Einkauf im Supermarkt. Am Monatsende zusammengerechnet werden sie zur unangenehmen Überraschung.' },
      { type: 'p', text: 'Wenn die Zahlen auf Kontoauszüge, Karten und Kassenbons verteilt sind, ist es mühsam, alles zusammenzutragen. Und wenn es mühsam ist, schauen wir nicht mehr hin. Die Lösung ist nicht mehr Disziplin, sondern der Überblick muss so einfach sein, dass der Blick darauf selbstverständlich wird.' },

      { type: 'h2', text: '1. Führe alle Einnahmen und Ausgaben an einem Ort zusammen' },
      { type: 'p', text: 'Sammle, was du einnimmst und ausgibst: Gehalt und andere Einnahmen, Fixkosten (Miete, Strom, Internet, Versicherungen), variable Ausgaben und Sparen. Die Kontoauszüge der letzten zwei oder drei Monate sind ein guter Ausgangspunkt. Es muss nicht perfekt sein, aber sichtbar.' },
      { type: 'p', text: 'Ein Notizbuch, eine Tabelle oder eine App reichen aus. Wichtig ist, dass es nur einen Ort gibt, damit du nicht nach den Informationen suchen musst.' },

      { type: 'h2', text: '2. Teile deine Ausgaben in Kategorien ein' },
      { type: 'p', text: 'Ordne deine Ausgaben Kategorien zu, die zu deinem Leben passen: Wohnen, Lebensmittel, Verkehr, Freizeit, Gesundheit, Abos. Wenige klare Kategorien zeigen Muster, die sonst verborgen bleiben.' },
      { type: 'p', text: 'Hier siehst du zum Beispiel, wie stark Essen außer Haus im Monat ins Gewicht fällt. Nicht um dir Vorwürfe zu machen, sondern um informiert zu entscheiden.' },

      { type: 'h2', text: '3. Erfasse deine Ausgaben im Alltag' },
      { type: 'p', text: 'Organisation funktioniert nur, wenn sie sich leicht durchhalten lässt. Erfasse jede Ausgabe sofort, beim Bezahlen oder direkt danach. So sammeln sich keine Kassenbons bis zum Monatsende an, und du weißt immer, wie viel du ausgegeben hast und wie viel noch übrig ist.' },
      { type: 'tip', text: 'Verknüpfe das Erfassen mit etwas, das du schon tust, zum Beispiel die Karte nach dem Bezahlen wegzustecken. Je weniger du daran denken musst, desto leichter bleibt die Gewohnheit.' },

      { type: 'h2', text: '4. Lies die Zahlen am Monatsende' },
      { type: 'p', text: 'Nimm dir am Ende jedes Monats zehn Minuten für den Vergleich mit dem Vormonat. Welche Kategorie ist gestiegen? War es einmalig oder eine neue Gewohnheit? Zahlen allein sagen wenig: Das Verhalten ändert sich erst, wenn du verstehst, was dahintersteckt.' },

      { type: 'h2', text: '5. Passe den Plan für den nächsten Monat an' },
      { type: 'p', text: 'Lege mit dem, was du gelernt hast, einen realistischen Betrag pro Kategorie fest, ausgehend von deinen üblichen Ausgaben. Passe an, statt neu anzufangen: Kleine Korrekturen jeden Monat halten länger als radikale Änderungen. Wenn du die Finanzen mit jemandem teilst, legt die Beträge gemeinsam fest.' },
      { type: 'tip', text: 'Beispiel: Wenn du im September 120 € und im Oktober 180 € für Restaurants ausgegeben hast, brauchst du keinen neuen Plan. Leg einfach ein Limit für November fest, zum Beispiel 140 €, und schau, wie es läuft.' },

      { type: 'h2', text: 'Fang heute an' },
      { type: 'p', text: 'Du musst nicht alles auf einmal machen. Sammle zuerst die Kontoauszüge des letzten Monats und erfasse die Ausgaben von heute.' },
      { type: 'p', text: 'Wenn dir eine App lieber ist: FinanceFlow wurde genau dafür gemacht. Du erfasst Einnahmen und Ausgaben in Sekunden und siehst im kostenlosen Plan, wohin dein Geld geht, nach Kategorie und Monat. In den kostenpflichtigen Plänen kannst du außerdem Kassenbons fotografieren, Limits mit Warnung setzen und dir deine Statistiken von der KI in einfacher Sprache erklären lassen.' },
    ],
  },
  {
    key: 'monthly-expenses',
    slug: 'come-organizzare-le-spese-mensili',
    lang: 'it',
    title: 'Come organizzare le spese mensili in 5 semplici passi',
    description: 'Riunisci i conti, dividi le spese per categoria, registrale ogni giorno, leggi i numeri del mese e correggi il piano: un metodo semplice per le spese mensili.',
    published: '2026-11-03',
    blocks: [
      { type: 'p', text: 'Organizzare le spese mensili non richiede fogli di calcolo interminabili. Il più delle volte il problema non è spendere troppo: è non riuscire a vedere dove vanno i soldi. Questi cinque passi ti aiutano a mettere in ordine i conti e a pianificare il mese successivo partendo da numeri reali.' },

      { type: 'h2', text: 'Perché le spese sembrano sempre sfuggire di mano' },
      { type: 'p', text: 'Le spese piccole e frequenti passano quasi sempre inosservate: il caffè andando al lavoro, l\'abbonamento che non usi più, la spesa veloce al supermercato. Sommate a fine mese, diventano una brutta sorpresa.' },
      { type: 'p', text: 'Quando i numeri sono sparsi tra estratti conto, carte e scontrini, riunirli costa fatica. E quando costa fatica, smettiamo di guardare. La soluzione non è più disciplina: è rendere la consultazione così semplice da diventare naturale.' },

      { type: 'h2', text: '1. Riunisci in un solo posto tutto ciò che entra ed esce' },
      { type: 'p', text: 'Raccogli ciò che guadagni e ciò che spendi: stipendio e altre entrate, spese fisse (affitto, luce, internet, assicurazioni), spese variabili e risparmio. Gli estratti conto degli ultimi due o tre mesi sono un buon punto di partenza. Non deve essere perfetto, deve essere visibile.' },
      { type: 'p', text: 'Va bene un quaderno, un foglio di calcolo o un\'app. L\'importante è che sia un unico posto, così non devi andare a cercare le informazioni.' },

      { type: 'h2', text: '2. Dividi le spese per categoria' },
      { type: 'p', text: 'Raggruppa le spese in categorie adatte alla tua vita: casa, alimentari, trasporti, tempo libero, salute, abbonamenti. Poche categorie chiare rivelano abitudini che altrimenti resterebbero nascoste.' },
      { type: 'p', text: 'È qui che scopri, per esempio, quanto pesano i pasti fuori casa sul totale del mese. Non per sentirti in colpa, ma per decidere con cognizione di causa.' },

      { type: 'h2', text: '3. Registra le spese ogni giorno' },
      { type: 'p', text: 'L\'organizzazione funziona solo se è facile da mantenere. Registra ogni spesa sul momento, mentre paghi o subito dopo. Così non accumuli scontrini fino a fine mese e sai sempre quanto hai speso e quanto ti resta.' },
      { type: 'tip', text: 'Collega la registrazione a un gesto che fai già, come riporre la carta dopo aver pagato. Meno devi ricordare, più è facile mantenere l\'abitudine.' },

      { type: 'h2', text: '4. Leggi i numeri a fine mese' },
      { type: 'p', text: 'Riserva dieci minuti alla fine di ogni mese per il confronto con il mese precedente. Quale categoria è aumentata? È stata una spesa isolata o una nuova abitudine? I numeri da soli dicono poco: a cambiare i comportamenti è capire cosa c\'è dietro.' },

      { type: 'h2', text: '5. Correggi il piano del mese successivo' },
      { type: 'p', text: 'Usa ciò che hai imparato per fissare un importo realistico per categoria, in base a quanto spendi di solito. Correggi invece di ricominciare: piccoli aggiustamenti ogni mese durano più dei cambiamenti radicali. Se gestisci i conti con qualcuno, decidete insieme gli importi.' },
      { type: 'tip', text: 'Esempio: se hai speso 120 € al ristorante a settembre e 180 € a ottobre, non ti serve un piano nuovo. Basta fissare un limite per novembre, per esempio 140 €, e vedere come va.' },

      { type: 'h2', text: 'Inizia oggi' },
      { type: 'p', text: 'Non devi fare tutto in una volta. Inizia riunendo gli estratti conto dell\'ultimo mese e registrando le spese di oggi.' },
      { type: 'p', text: 'Se preferisci un\'app, FinanceFlow è fatta per questo: registri entrate e spese in pochi secondi e vedi dove vanno i soldi, per categoria e per mese, con il piano gratuito. Con i piani a pagamento puoi anche fotografare gli scontrini, impostare limiti con avviso e chiedere all\'IA di spiegarti le statistiche in parole semplici.' },
    ],
  },
]
