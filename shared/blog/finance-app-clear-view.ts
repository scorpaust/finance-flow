import type { BlogPost } from './index'

// O que muda ao usar uma app de finanças. A partir de um rascunho da Holo,
// corrigido: sem orçamentos partilhados, a categoria é escolhida por quem regista
// e a previsão é dos próximos 3 meses (com meses completos), não do mês em curso.
export const financeAppClearViewPosts: BlogPost[] = [
  {
    key: 'finance-app-clear-view',
    slug: 'app-de-financas-pessoais-visao-clara-do-dinheiro',
    lang: 'pt',
    title: 'App de finanças pessoais: visão clara do teu dinheiro',
    description: 'Como uma app de finanças pessoais transforma despesas soltas em números claros, o que muda no dia a dia e como começar em cinco passos simples.',
    published: '2026-11-04',
    blocks: [
      { type: 'p', text: 'Para muitas pessoas, o dinheiro está espalhado por vários sítios: a conta do dia a dia, um cartão de crédito, a app do banco e uma folha de cálculo que ficou a meio. No fim do mês, a pergunta é sempre a mesma: para onde foi o dinheiro? Uma app de finanças pessoais ajuda a responder, sem teres de te tornar contabilista.' },

      { type: 'h2', text: 'Porque é que acompanhar as finanças parece complicado' },
      { type: 'p', text: 'O problema raramente é falta de vontade. Cada compra deixa um registo que se perde, as subscrições renovam-se em silêncio e aparecem despesas que não estavam previstas. Quando tentas reconstruir tudo no fim do mês, já só estás a olhar para o passado.' },

      { type: 'h2', text: 'Registas no momento, em segundos' },
      { type: 'p', text: 'A diferença está no esforço. Em vez de juntares a informação mais tarde, registas cada gasto quando o fazes, e os totais ficam feitos. Quanto mais rápido for, mais provável é manteres o hábito, e é o hábito que conta ao longo do ano. O objetivo não é controlar cada cêntimo, é ter uma imagem fiel e atualizada da tua situação.' },

      { type: 'h2', text: 'Os números passam a ter explicação' },
      { type: 'p', text: 'Uma tabela cheia de números ajuda pouco a decidir. O que ajuda é perceber onde gastaste mais do que no mês passado e que categorias estão a crescer. Algumas apps usam inteligência artificial para explicar estas conclusões em frases simples. Poupa trabalho, mas a explicação só é tão boa quanto os dados que registaste.' },

      { type: 'h2', text: 'Olhas para a frente, não só para trás' },
      { type: 'p', text: 'Saber quanto gastaste em outubro é útil, mas só permite reagir depois. Um limite por categoria, com um alerta quando te aproximas dele, dá-te margem para adiar uma compra ou cortar noutra categoria ainda a tempo. As previsões dos meses seguintes, feitas a partir do teu histórico, ajudam a planear, mas são estimativas, não certezas.' },

      { type: 'h2', text: 'Vês os investimentos ao lado do orçamento' },
      { type: 'p', text: 'Despesas e investimentos fazem parte da mesma história: o que sobra ao fim do mês é o que podes investir. Ver os dois no mesmo sítio ajuda a perceber como as decisões do dia a dia pesam nos teus objetivos. Não precisas de ser especialista em mercados, mas confirma se a app atualiza os valores sozinha ou se és tu que os registas.' },

      { type: 'h2', text: 'Como começar em cinco passos' },
      { type: 'ol', items: [
        'Escolhe uma ferramenta e mantém-na durante um mês inteiro, sem trocar.',
        'Regista todas as despesas e receitas, mesmo as pequenas, nas primeiras semanas.',
        'Usa categorias que façam sentido para a tua vida real.',
        'Define um valor mensal para cada categoria e compara-o com o que vais gastando.',
        'Revê os resultados no fim do mês e faz um ajuste de cada vez.',
      ] },
      { type: 'tip', text: 'Não precisas de fazer tudo de uma vez. A clareza financeira constrói-se com repetição, não com perfeição.' },

      { type: 'h2', text: 'O que uma app não resolve' },
      { type: 'p', text: 'Uma app não decide por ti nem muda hábitos sozinha: dá-te informação clara, e o resto continua a depender de ti. Se geres as contas com outra pessoa, confirma também se a app permite partilhá-las, porque muitas são individuais.' },

      { type: 'h2', text: 'Sobre o FinanceFlow' },
      { type: 'p', text: 'O FinanceFlow funciona no browser e no Android. No plano gratuito, com até 50 transações por mês, registas receitas e despesas e vês estatísticas por categoria e por mês. O plano Pro acrescenta limites com alerta, leitura de talões e explicações da IA. O Premium acrescenta previsões para os próximos 3 meses, a partir de pelo menos 2 meses completos de dados, e o registo dos teus investimentos, com valores atualizados por ti. Não liga às contas bancárias, e cada conta é individual, sem orçamentos partilhados.' },
    ],
  },
  {
    key: 'finance-app-clear-view',
    slug: 'personal-finance-app-clear-view-of-your-money',
    lang: 'en',
    title: 'Personal finance app: a clear view of your money',
    description: 'How a personal finance app turns scattered expenses into clear numbers, what changes day to day and how to get started in five simple steps.',
    published: '2026-11-04',
    blocks: [
      { type: 'p', text: 'For many people, money is scattered across several places: an everyday account, a credit card, a banking app and a spreadsheet that was left half finished. At the end of the month, the question is always the same: where did the money go? A personal finance app helps you answer it, without having to become an accountant.' },

      { type: 'h2', text: 'Why keeping track of your finances feels complicated' },
      { type: 'p', text: 'The problem is rarely a lack of willpower. Every purchase leaves a record that gets lost, subscriptions renew quietly and expenses you did not plan for keep turning up. By the time you try to piece it all together at the end of the month, you are only looking at the past.' },

      { type: 'h2', text: 'You log things as they happen, in seconds' },
      { type: 'p', text: 'The difference is effort. Instead of gathering information later, you log each purchase when you make it, and the totals are done for you. The quicker it is, the more likely you are to keep the habit, and it is the habit that counts over the year. The goal is not to control every cent, but to have an accurate, up-to-date picture of where you stand.' },

      { type: 'h2', text: 'The numbers come with an explanation' },
      { type: 'p', text: 'A table full of numbers does little to help you decide. What helps is seeing where you spent more than last month and which categories are growing. Some apps use artificial intelligence to explain these findings in simple sentences. It saves work, but the explanation is only as good as the data you logged.' },

      { type: 'h2', text: 'You look ahead, not just back' },
      { type: 'p', text: 'Knowing how much you spent in October is useful, but it only lets you react afterwards. A limit per category, with an alert as you get close to it, gives you room to postpone a purchase or cut back elsewhere while there is still time. Forecasts for the coming months, based on your history, help you plan, but they are estimates, not certainties.' },

      { type: 'h2', text: 'You see investments next to your budget' },
      { type: 'p', text: 'Spending and investing are part of the same story: what is left at the end of the month is what you can invest. Seeing both in one place helps you understand how everyday decisions affect your goals. You do not need to be a market expert, but check whether the app updates values by itself or whether you enter them.' },

      { type: 'h2', text: 'How to get started in five steps' },
      { type: 'ol', items: [
        'Choose one tool and stick with it for a whole month, without switching.',
        'Log all expenses and income, even small ones, for the first few weeks.',
        'Use categories that make sense for your real life.',
        'Set a monthly amount for each category and compare it with what you spend as you go.',
        'Review the results at the end of the month and make one adjustment at a time.',
      ] },
      { type: 'tip', text: 'You do not have to do everything at once. Financial clarity comes from repetition, not perfection.' },

      { type: 'h2', text: 'What an app will not solve' },
      { type: 'p', text: 'An app will not decide for you or change your habits by itself: it gives you clear information, and the rest is still up to you. If you manage money with someone else, also check whether the app lets you share it, because many are individual.' },

      { type: 'h2', text: 'About FinanceFlow' },
      { type: 'p', text: 'FinanceFlow works in the browser and on Android. On the free plan, with up to 50 transactions a month, you log income and expenses and see statistics by category and by month. The Pro plan adds limits with alerts, receipt scanning and AI explanations. Premium adds forecasts for the next 3 months, from at least 2 complete months of data, and a record of your investments, with values you update yourself. It does not connect to bank accounts, and each account is individual, with no shared budgets.' },
    ],
  },
  {
    key: 'finance-app-clear-view',
    slug: 'app-finanzas-personales-vision-clara-del-dinero',
    lang: 'es',
    title: 'App de finanzas personales: una visión clara de tu dinero',
    description: 'Cómo una app de finanzas personales convierte gastos sueltos en números claros, qué cambia en el día a día y cómo empezar en cinco pasos sencillos.',
    published: '2026-11-04',
    blocks: [
      { type: 'p', text: 'Para mucha gente, el dinero está repartido en varios sitios: la cuenta del día a día, una tarjeta de crédito, la app del banco y una hoja de cálculo que se quedó a medias. A final de mes, la pregunta es siempre la misma: ¿adónde ha ido el dinero? Una app de finanzas personales ayuda a responderla, sin que tengas que convertirte en contable.' },

      { type: 'h2', text: 'Por qué seguir tus finanzas parece complicado' },
      { type: 'p', text: 'El problema rara vez es la falta de voluntad. Cada compra deja un registro que se pierde, las suscripciones se renuevan en silencio y aparecen gastos que no estaban previstos. Cuando intentas reconstruirlo todo a final de mes, ya solo miras al pasado.' },

      { type: 'h2', text: 'Registras en el momento, en segundos' },
      { type: 'p', text: 'La diferencia está en el esfuerzo. En lugar de reunir la información más tarde, registras cada gasto cuando lo haces, y los totales quedan hechos. Cuanto más rápido sea, más probable es que mantengas el hábito, y es el hábito lo que cuenta a lo largo del año. El objetivo no es controlar cada céntimo, sino tener una imagen fiel y actualizada de tu situación.' },

      { type: 'h2', text: 'Los números pasan a tener explicación' },
      { type: 'p', text: 'Una tabla llena de números ayuda poco a decidir. Lo que ayuda es ver dónde has gastado más que el mes pasado y qué categorías están creciendo. Algunas apps usan inteligencia artificial para explicar estas conclusiones en frases sencillas. Ahorra trabajo, pero la explicación solo es tan buena como los datos que has registrado.' },

      { type: 'h2', text: 'Miras hacia delante, no solo hacia atrás' },
      { type: 'p', text: 'Saber cuánto gastaste en octubre es útil, pero solo permite reaccionar después. Un límite por categoría, con un aviso cuando te acercas a él, te da margen para aplazar una compra o recortar en otra categoría todavía a tiempo. Las previsiones de los meses siguientes, hechas a partir de tu historial, ayudan a planificar, pero son estimaciones, no certezas.' },

      { type: 'h2', text: 'Ves las inversiones junto al presupuesto' },
      { type: 'p', text: 'Los gastos y las inversiones forman parte de la misma historia: lo que sobra a final de mes es lo que puedes invertir. Ver ambos en el mismo sitio ayuda a entender cómo pesan las decisiones del día a día en tus objetivos. No hace falta ser experto en mercados, pero confirma si la app actualiza los valores sola o si los registras tú.' },

      { type: 'h2', text: 'Cómo empezar en cinco pasos' },
      { type: 'ol', items: [
        'Elige una herramienta y mantenla durante un mes entero, sin cambiar.',
        'Registra todos los gastos e ingresos, incluso los pequeños, durante las primeras semanas.',
        'Usa categorías que tengan sentido para tu vida real.',
        'Define un importe mensual para cada categoría y compáralo con lo que vas gastando.',
        'Revisa los resultados a final de mes y haz un ajuste cada vez.',
      ] },
      { type: 'tip', text: 'No hace falta hacerlo todo de golpe. La claridad financiera se construye con repetición, no con perfección.' },

      { type: 'h2', text: 'Lo que una app no resuelve' },
      { type: 'p', text: 'Una app no decide por ti ni cambia tus hábitos por sí sola: te da información clara, y el resto sigue dependiendo de ti. Si gestionas las cuentas con otra persona, confirma también si la app permite compartirlas, porque muchas son individuales.' },

      { type: 'h2', text: 'Sobre FinanceFlow' },
      { type: 'p', text: 'FinanceFlow funciona en el navegador y en Android. En el plan gratuito, con hasta 50 transacciones al mes, registras ingresos y gastos y ves estadísticas por categoría y por mes. El plan Pro añade límites con aviso, lectura de tiques y explicaciones de la IA. Premium añade previsiones para los próximos 3 meses, a partir de al menos 2 meses completos de datos, y el registro de tus inversiones, con valores que actualizas tú. No se conecta a las cuentas bancarias, y cada cuenta es individual, sin presupuestos compartidos.' },
    ],
  },
  {
    key: 'finance-app-clear-view',
    slug: 'application-finances-personnelles-vision-claire-argent',
    lang: 'fr',
    title: 'Application de finances personnelles : y voir clair',
    description: 'Comment une application de finances personnelles transforme des dépenses éparses en chiffres clairs, ce qui change au quotidien et comment commencer.',
    published: '2026-11-04',
    blocks: [
      { type: 'p', text: 'Pour beaucoup de gens, l\'argent est dispersé à plusieurs endroits : le compte courant, une carte de crédit, l\'application de la banque et un tableur resté à moitié rempli. À la fin du mois, la question est toujours la même : où est passé l\'argent ? Une application de finances personnelles aide à y répondre, sans avoir à devenir comptable.' },

      { type: 'h2', text: 'Pourquoi suivre ses finances semble compliqué' },
      { type: 'p', text: 'Le problème est rarement un manque de volonté. Chaque achat laisse une trace qui se perd, les abonnements se renouvellent en silence et des dépenses imprévues apparaissent. Quand vous essayez de tout reconstituer à la fin du mois, vous ne regardez déjà plus que le passé.' },

      { type: 'h2', text: 'Vous notez sur le moment, en quelques secondes' },
      { type: 'p', text: 'La différence tient à l\'effort. Au lieu de rassembler les informations plus tard, vous notez chaque dépense au moment où vous la faites, et les totaux se font tout seuls. Plus c\'est rapide, plus vous avez de chances de garder l\'habitude, et c\'est l\'habitude qui compte sur l\'année. Le but n\'est pas de contrôler chaque centime, mais d\'avoir une image fidèle et à jour de votre situation.' },

      { type: 'h2', text: 'Les chiffres sont enfin expliqués' },
      { type: 'p', text: 'Un tableau rempli de chiffres aide peu à décider. Ce qui aide, c\'est de voir où vous avez dépensé plus que le mois dernier et quelles catégories augmentent. Certaines applications utilisent l\'intelligence artificielle pour expliquer ces conclusions en phrases simples. Cela fait gagner du temps, mais l\'explication ne vaut que ce que valent les données saisies.' },

      { type: 'h2', text: 'Vous regardez devant, pas seulement derrière' },
      { type: 'p', text: 'Savoir combien vous avez dépensé en octobre est utile, mais ne permet de réagir qu\'après coup. Un plafond par catégorie, avec une alerte quand vous en approchez, vous laisse le temps de reporter un achat ou de réduire ailleurs. Les prévisions des mois suivants, établies à partir de votre historique, aident à planifier, mais ce sont des estimations, pas des certitudes.' },

      { type: 'h2', text: 'Vous voyez vos investissements à côté du budget' },
      { type: 'p', text: 'Dépenses et investissements font partie de la même histoire : ce qui reste en fin de mois est ce que vous pouvez investir. Voir les deux au même endroit aide à comprendre le poids des décisions quotidiennes sur vos objectifs. Pas besoin d\'être expert des marchés, mais vérifiez si l\'application met à jour les valeurs toute seule ou si c\'est à vous de les saisir.' },

      { type: 'h2', text: 'Comment commencer en cinq étapes' },
      { type: 'ol', items: [
        'Choisissez un outil et gardez-le pendant un mois entier, sans en changer.',
        'Notez toutes les dépenses et tous les revenus, même les petits, pendant les premières semaines.',
        'Utilisez des catégories qui ont du sens pour votre vie réelle.',
        'Fixez un montant mensuel par catégorie et comparez-le à vos dépenses au fil du mois.',
        'Faites le bilan à la fin du mois et apportez un ajustement à la fois.',
      ] },
      { type: 'tip', text: 'Inutile de tout faire d\'un coup. La clarté financière se construit par la répétition, pas par la perfection.' },

      { type: 'h2', text: 'Ce qu\'une application ne résout pas' },
      { type: 'p', text: 'Une application ne décide pas à votre place et ne change pas vos habitudes toute seule : elle vous donne une information claire, et le reste dépend toujours de vous. Si vous gérez vos comptes à deux, vérifiez aussi si l\'application permet de les partager, car beaucoup sont individuelles.' },

      { type: 'h2', text: 'À propos de FinanceFlow' },
      { type: 'p', text: 'FinanceFlow fonctionne dans le navigateur et sur Android. Avec le plan gratuit, jusqu\'à 50 transactions par mois, vous saisissez revenus et dépenses et vous voyez des statistiques par catégorie et par mois. Le plan Pro ajoute les plafonds avec alerte, la lecture des tickets et les explications de l\'IA. Premium ajoute des prévisions pour les 3 prochains mois, à partir d\'au moins 2 mois complets de données, et le suivi de vos investissements, avec des valeurs que vous mettez à jour vous-même. L\'application ne se connecte pas aux comptes bancaires, et chaque compte est individuel, sans budget partagé.' },
    ],
  },
  {
    key: 'finance-app-clear-view',
    slug: 'finanz-app-klarer-blick-auf-dein-geld',
    lang: 'de',
    title: 'Finanz-App: ein klarer Blick auf dein Geld',
    description: 'Wie eine Finanz-App aus verstreuten Ausgaben klare Zahlen macht, was sich im Alltag ändert und wie du in fünf einfachen Schritten anfängst.',
    published: '2026-11-04',
    blocks: [
      { type: 'p', text: 'Bei vielen Menschen ist das Geld über mehrere Orte verteilt: das Alltagskonto, eine Kreditkarte, die Banking-App und eine Tabelle, die halb fertig liegen geblieben ist. Am Monatsende stellt sich immer dieselbe Frage: Wo ist das Geld geblieben? Eine Finanz-App hilft dir, sie zu beantworten, ohne dass du Buchhalter werden musst.' },

      { type: 'h2', text: 'Warum der Überblick über die Finanzen so kompliziert wirkt' },
      { type: 'p', text: 'Am Willen liegt es selten. Jeder Kauf hinterlässt einen Beleg, der verloren geht, Abos verlängern sich still und leise, und es kommen Ausgaben dazu, die nicht geplant waren. Wenn du am Monatsende alles zusammensuchst, blickst du nur noch in die Vergangenheit.' },

      { type: 'h2', text: 'Du erfasst alles sofort, in Sekunden' },
      { type: 'p', text: 'Der Unterschied liegt im Aufwand. Statt die Informationen später zusammenzutragen, erfasst du jede Ausgabe direkt, und die Summen sind fertig. Je schneller das geht, desto eher bleibst du dabei, und über das Jahr zählt genau diese Gewohnheit. Es geht nicht darum, jeden Cent zu kontrollieren, sondern um ein genaues, aktuelles Bild deiner Lage.' },

      { type: 'h2', text: 'Die Zahlen werden verständlich' },
      { type: 'p', text: 'Eine Tabelle voller Zahlen hilft bei Entscheidungen wenig. Hilfreich ist zu sehen, wo du mehr ausgegeben hast als im Vormonat und welche Kategorien wachsen. Manche Apps erklären diese Erkenntnisse mit künstlicher Intelligenz in einfachen Sätzen. Das spart Arbeit, aber die Erklärung ist nur so gut wie die erfassten Daten.' },

      { type: 'h2', text: 'Du schaust nach vorn, nicht nur zurück' },
      { type: 'p', text: 'Zu wissen, wie viel du im Oktober ausgegeben hast, ist nützlich, aber du kannst erst danach reagieren. Ein Limit pro Kategorie mit einer Warnung, wenn du dich ihm näherst, lässt dir Spielraum, einen Kauf zu verschieben oder rechtzeitig anderswo zu kürzen. Prognosen für die nächsten Monate auf Basis deiner bisherigen Daten helfen beim Planen, sind aber Schätzungen und keine Gewissheiten.' },

      { type: 'h2', text: 'Du siehst Anlagen neben dem Budget' },
      { type: 'p', text: 'Ausgaben und Anlagen gehören zur selben Geschichte: Was am Monatsende übrig bleibt, kannst du investieren. Beides an einem Ort zu sehen hilft dir zu verstehen, wie sich Alltagsentscheidungen auf deine Ziele auswirken. Du musst kein Marktexperte sein, prüfe aber, ob die App die Werte selbst aktualisiert oder ob du sie eintragen musst.' },

      { type: 'h2', text: 'So fängst du in fünf Schritten an' },
      { type: 'ol', items: [
        'Wähle ein Werkzeug und bleib einen ganzen Monat dabei, ohne zu wechseln.',
        'Erfasse in den ersten Wochen alle Ausgaben und Einnahmen, auch die kleinen.',
        'Nutze Kategorien, die zu deinem echten Leben passen.',
        'Lege für jede Kategorie einen Monatsbetrag fest und vergleiche ihn mit deinen laufenden Ausgaben.',
        'Prüfe am Monatsende die Ergebnisse und ändere immer nur eine Sache.',
      ] },
      { type: 'tip', text: 'Du musst nicht alles auf einmal machen. Finanzielle Klarheit entsteht durch Wiederholung, nicht durch Perfektion.' },

      { type: 'h2', text: 'Was eine App nicht löst' },
      { type: 'p', text: 'Eine App entscheidet nicht für dich und ändert deine Gewohnheiten nicht von selbst: Sie liefert dir klare Informationen, der Rest liegt weiter bei dir. Wenn du deine Finanzen mit jemandem teilst, prüfe auch, ob die App das erlaubt, denn viele sind auf eine Person ausgelegt.' },

      { type: 'h2', text: 'Über FinanceFlow' },
      { type: 'p', text: 'FinanceFlow funktioniert im Browser und auf Android. Im kostenlosen Plan mit bis zu 50 Transaktionen pro Monat erfasst du Einnahmen und Ausgaben und siehst Statistiken nach Kategorie und Monat. Der Pro-Plan ergänzt Limits mit Warnung, das Auslesen von Kassenbons und KI-Erklärungen. Premium ergänzt Prognosen für die nächsten 3 Monate, ab mindestens 2 vollständigen Monaten an Daten, und die Erfassung deiner Anlagen, deren Werte du selbst aktualisierst. Die App verbindet sich nicht mit Bankkonten, und jedes Konto ist individuell, ohne gemeinsame Budgets.' },
    ],
  },
  {
    key: 'finance-app-clear-view',
    slug: 'app-finanze-personali-visione-chiara-dei-soldi',
    lang: 'it',
    title: 'App di finanza personale: una visione chiara dei tuoi soldi',
    description: 'Come un\'app di finanza personale trasforma spese sparse in numeri chiari, cosa cambia ogni giorno e come iniziare in cinque semplici passi.',
    published: '2026-11-04',
    blocks: [
      { type: 'p', text: 'Per molte persone il denaro è sparso in vari posti: il conto di tutti i giorni, una carta di credito, l\'app della banca e un foglio di calcolo rimasto a metà. A fine mese la domanda è sempre la stessa: dove sono finiti i soldi? Un\'app di finanza personale aiuta a rispondere, senza che tu debba diventare un contabile.' },

      { type: 'h2', text: 'Perché seguire le finanze sembra complicato' },
      { type: 'p', text: 'Il problema raramente è la mancanza di volontà. Ogni acquisto lascia una traccia che si perde, gli abbonamenti si rinnovano in silenzio e compaiono spese non previste. Quando provi a ricostruire tutto a fine mese, stai già guardando solo al passato.' },

      { type: 'h2', text: 'Registri sul momento, in pochi secondi' },
      { type: 'p', text: 'La differenza sta nello sforzo. Invece di raccogliere le informazioni più tardi, registri ogni spesa quando la fai, e i totali sono già pronti. Più è rapido, più è probabile che tu mantenga l\'abitudine, ed è l\'abitudine che conta nel corso dell\'anno. L\'obiettivo non è controllare ogni centesimo, ma avere un quadro fedele e aggiornato della tua situazione.' },

      { type: 'h2', text: 'I numeri diventano comprensibili' },
      { type: 'p', text: 'Una tabella piena di numeri aiuta poco a decidere. Ciò che aiuta è vedere dove hai speso più del mese scorso e quali categorie stanno crescendo. Alcune app usano l\'intelligenza artificiale per spiegare queste conclusioni con frasi semplici. Fa risparmiare lavoro, ma la spiegazione è buona solo quanto i dati che hai registrato.' },

      { type: 'h2', text: 'Guardi avanti, non solo indietro' },
      { type: 'p', text: 'Sapere quanto hai speso a ottobre è utile, ma permette di reagire solo dopo. Un limite per categoria, con un avviso quando ti avvicini, ti lascia margine per rimandare un acquisto o tagliare altrove ancora in tempo. Le previsioni dei mesi successivi, basate sul tuo storico, aiutano a pianificare, ma sono stime, non certezze.' },

      { type: 'h2', text: 'Vedi gli investimenti accanto al budget' },
      { type: 'p', text: 'Spese e investimenti fanno parte della stessa storia: ciò che resta a fine mese è ciò che puoi investire. Vederli nello stesso posto aiuta a capire quanto le decisioni di ogni giorno pesano sui tuoi obiettivi. Non serve essere esperti di mercati, ma controlla se l\'app aggiorna i valori da sola o se devi registrarli tu.' },

      { type: 'h2', text: 'Come iniziare in cinque passi' },
      { type: 'ol', items: [
        'Scegli uno strumento e tienilo per un mese intero, senza cambiarlo.',
        'Registra tutte le spese e le entrate, anche quelle piccole, nelle prime settimane.',
        'Usa categorie che abbiano senso per la tua vita reale.',
        'Fissa un importo mensile per ogni categoria e confrontalo con ciò che spendi man mano.',
        'Rivedi i risultati a fine mese e fai una correzione alla volta.',
      ] },
      { type: 'tip', text: 'Non devi fare tutto insieme. La chiarezza finanziaria si costruisce con la ripetizione, non con la perfezione.' },

      { type: 'h2', text: 'Cosa un\'app non risolve' },
      { type: 'p', text: 'Un\'app non decide per te e non cambia le abitudini da sola: ti dà informazioni chiare, e il resto dipende ancora da te. Se gestisci i conti con un\'altra persona, controlla anche se l\'app permette di condividerli, perché molte sono individuali.' },

      { type: 'h2', text: 'Su FinanceFlow' },
      { type: 'p', text: 'FinanceFlow funziona nel browser e su Android. Con il piano gratuito, fino a 50 transazioni al mese, registri entrate e spese e vedi statistiche per categoria e per mese. Il piano Pro aggiunge limiti con avviso, lettura degli scontrini e spiegazioni dell\'IA. Premium aggiunge previsioni per i prossimi 3 mesi, a partire da almeno 2 mesi completi di dati, e la registrazione dei tuoi investimenti, con valori che aggiorni tu. Non si collega ai conti bancari, e ogni account è individuale, senza budget condivisi.' },
    ],
  },
]
