import type { BlogPost } from './index'

// App ou Excel: o que cada um faz bem, onde custa tempo e como decidir.
// A partir de um rascunho da Holo, corrigido: a app não faz registo automático
// nem tem orçamentos partilhados.
export const appOrExcelPosts: BlogPost[] = [
  {
    key: 'app-or-excel',
    slug: 'aplicacao-de-financas-pessoais-ou-excel',
    lang: 'pt',
    title: 'Aplicação de finanças pessoais ou Excel: qual escolher?',
    description: 'O que o Excel faz bem, onde começa a custar tempo e o que muda numa app. Três perguntas para escolheres o que encaixa no teu dia a dia.',
    published: '2026-11-03',
    blocks: [
      { type: 'p', text: 'Escolher como vais controlar o dinheiro parece uma decisão pequena, mas define quanto tempo gastas todos os meses a olhar para números. A questão não é qual das opções é mais moderna: é qual vais conseguir manter.' },

      { type: 'h2', text: 'O que o Excel faz bem' },
      { type: 'p', text: 'Uma folha de cálculo tem custo baixo ou nulo e dá-te controlo total. Podes separar despesas por projeto, por viagem ou por pessoa, e criar as fórmulas que quiseres. Nenhuma app te dá tanta liberdade para desenhar o sistema à tua maneira.' },
      { type: 'p', text: 'Se gostas de mexer em números e já tens o hábito, não precisas de mudar.' },

      { type: 'h2', text: 'Onde o Excel começa a custar tempo' },
      { type: 'ul', items: [
        'Registar no telemóvel é pouco prático, por isso os gastos ficam para depois e os mais pequenos acabam esquecidos.',
        'Uma coluna nova obriga a rever somas e referências, e um erro numa célula pode estragar o mês sem dares por isso.',
        'A folha só avisa de um limite ultrapassado se construíres esse aviso e a abrires para o ver.',
        'Os gráficos e as comparações entre meses também ficam a teu cargo.',
      ] },

      { type: 'h2', text: 'O que muda numa app' },
      { type: 'p', text: 'Numa app, escolhes o valor e a categoria e está feito, no telemóvel, no momento em que pagas. Os totais e os gráficos por categoria e por mês aparecem sem fórmulas. Muitas apps também avisam quando te aproximas de um limite.' },
      { type: 'p', text: 'Também tem limites. Tens menos liberdade do que numa folha, as funcionalidades mais avançadas costumam ser pagas e, a não ser que a app ligue ao banco, o registo continua a ser um gesto teu, embora mais rápido.' },

      { type: 'h2', text: 'Três perguntas para decidir' },
      { type: 'ol', items: [
        'Vais mesmo registar os gastos numa folha? Se costumas desistir ao fim de uma semana, a rapidez de uma app pesa mais do que a flexibilidade.',
        'Partilhas as contas com alguém? Uma folha na nuvem é uma boa solução, e nem todas as apps permitem partilhar orçamentos.',
        'Queres só totais ou também ajuda a interpretá-los? Para totais, a folha chega. Para alertas e explicações, uma app dá menos trabalho.',
      ] },
      { type: 'tip', text: 'Faz o teste do mês ocupado: usa o método que escolheres durante um mês cheio de trabalho. O que ainda estiver atualizado no fim é o método certo para ti.' },

      { type: 'h2', text: 'Sobre o FinanceFlow' },
      { type: 'p', text: 'O FinanceFlow funciona no browser e no Android. No plano gratuito registas receitas e despesas em segundos e vês para onde vai o dinheiro, por categoria e por mês. Nos planos pagos, podes fotografar talões, pôr limites com alerta, pedir à IA que explique as estatísticas e exportar os dados para CSV, se quiseres continuar a analisá-los numa folha. Duas coisas que não faz: não liga às contas bancárias, e cada conta é individual, sem orçamentos partilhados.' },
    ],
  },
  {
    key: 'app-or-excel',
    slug: 'personal-finance-app-or-excel',
    lang: 'en',
    title: 'Personal finance app or Excel: which should you choose?',
    description: 'What Excel does well, where it starts costing you time and what changes with an app. Three questions to pick what fits your day-to-day life.',
    published: '2026-11-03',
    blocks: [
      { type: 'p', text: 'Choosing how to track your money seems like a small decision, but it sets how much time you spend on numbers every month. The question is not which option is more modern: it is which one you will actually keep up.' },

      { type: 'h2', text: 'What Excel does well' },
      { type: 'p', text: 'A spreadsheet costs little or nothing and gives you total control. You can split spending by project, trip or person, and write any formula you like. No app gives you as much freedom to design the system your way.' },
      { type: 'p', text: 'If you enjoy working with numbers and already have the habit, you do not need to change.' },

      { type: 'h2', text: 'Where Excel starts costing you time' },
      { type: 'ul', items: [
        'Logging on a phone is awkward, so purchases get left for later and the smallest ones are forgotten.',
        'A new column means checking sums and references, and one wrong cell can spoil the month without you noticing.',
        'A sheet only warns you about a limit if you build that warning and open the file to see it.',
        'Charts and month-to-month comparisons are also up to you.',
      ] },

      { type: 'h2', text: 'What changes with an app' },
      { type: 'p', text: 'In an app, you pick the amount and the category and you are done, on your phone, at the moment you pay. Totals and charts by category and month appear without formulas. Many apps also warn you when you get close to a limit.' },
      { type: 'p', text: 'There are downsides too. You have less freedom than in a sheet, the more advanced features are often paid and, unless the app connects to your bank, logging is still something you do yourself, only faster.' },

      { type: 'h2', text: 'Three questions to decide' },
      { type: 'ol', items: [
        'Will you really log your spending in a sheet? If you tend to give up after a week, the speed of an app matters more than flexibility.',
        'Do you share your money with someone? A cloud spreadsheet works well here, and not every app lets you share budgets.',
        'Do you only want totals, or help understanding them too? For totals, a sheet is enough. For alerts and explanations, an app is less work.',
      ] },
      { type: 'tip', text: 'Try the busy month test: use your chosen method during a month full of work. Whatever is still up to date at the end is the right method for you.' },

      { type: 'h2', text: 'About FinanceFlow' },
      { type: 'p', text: 'FinanceFlow works in the browser and on Android. On the free plan you log income and expenses in seconds and see where your money goes, by category and by month. Paid plans let you scan receipts, set limits with alerts, ask AI to explain your statistics and export your data to CSV if you want to keep analysing it in a sheet. Two things it does not do: it does not connect to bank accounts, and each account is individual, with no shared budgets.' },
    ],
  },
  {
    key: 'app-or-excel',
    slug: 'app-de-finanzas-personales-o-excel',
    lang: 'es',
    title: 'App de finanzas personales o Excel: ¿cuál elegir?',
    description: 'Lo que Excel hace bien, dónde empieza a costar tiempo y qué cambia con una app. Tres preguntas para elegir lo que encaja en tu día a día.',
    published: '2026-11-03',
    blocks: [
      { type: 'p', text: 'Elegir cómo vas a controlar el dinero parece una decisión pequeña, pero define cuánto tiempo dedicas cada mes a mirar números. La cuestión no es qué opción es más moderna: es cuál vas a ser capaz de mantener.' },

      { type: 'h2', text: 'Lo que Excel hace bien' },
      { type: 'p', text: 'Una hoja de cálculo cuesta poco o nada y te da control total. Puedes separar los gastos por proyecto, viaje o persona, y crear las fórmulas que quieras. Ninguna app te da tanta libertad para diseñar el sistema a tu manera.' },
      { type: 'p', text: 'Si te gusta trabajar con números y ya tienes el hábito, no necesitas cambiar.' },

      { type: 'h2', text: 'Dónde Excel empieza a costar tiempo' },
      { type: 'ul', items: [
        'Registrar en el móvil es poco práctico, así que los gastos se dejan para después y los más pequeños se olvidan.',
        'Una columna nueva obliga a revisar sumas y referencias, y un error en una celda puede estropear el mes sin que te des cuenta.',
        'La hoja solo avisa de un límite superado si construyes ese aviso y la abres para verlo.',
        'Los gráficos y las comparaciones entre meses también corren de tu cuenta.',
      ] },

      { type: 'h2', text: 'Qué cambia con una app' },
      { type: 'p', text: 'En una app, eliges el importe y la categoría y ya está, en el móvil, en el momento de pagar. Los totales y los gráficos por categoría y por mes aparecen sin fórmulas. Muchas apps también avisan cuando te acercas a un límite.' },
      { type: 'p', text: 'También tiene límites. Tienes menos libertad que en una hoja, las funciones más avanzadas suelen ser de pago y, salvo que la app se conecte al banco, el registro sigue siendo cosa tuya, aunque más rápido.' },

      { type: 'h2', text: 'Tres preguntas para decidir' },
      { type: 'ol', items: [
        '¿De verdad vas a registrar los gastos en una hoja? Si sueles abandonar al cabo de una semana, la rapidez de una app pesa más que la flexibilidad.',
        '¿Compartes las cuentas con alguien? Una hoja en la nube es una buena solución, y no todas las apps permiten compartir presupuestos.',
        '¿Quieres solo totales o también ayuda para interpretarlos? Para totales, basta la hoja. Para alertas y explicaciones, una app da menos trabajo.',
      ] },
      { type: 'tip', text: 'Haz la prueba del mes ocupado: usa el método que elijas durante un mes lleno de trabajo. El que siga al día al final es el método adecuado para ti.' },

      { type: 'h2', text: 'Sobre FinanceFlow' },
      { type: 'p', text: 'FinanceFlow funciona en el navegador y en Android. En el plan gratuito registras ingresos y gastos en segundos y ves adónde va el dinero, por categoría y por mes. Con los planes de pago puedes fotografiar tiques, poner límites con alerta, pedir a la IA que explique las estadísticas y exportar los datos a CSV, si quieres seguir analizándolos en una hoja. Dos cosas que no hace: no se conecta a cuentas bancarias, y cada cuenta es individual, sin presupuestos compartidos.' },
    ],
  },
  {
    key: 'app-or-excel',
    slug: 'application-finances-personnelles-ou-excel',
    lang: 'fr',
    title: 'Application de finances personnelles ou Excel : que choisir ?',
    description: 'Ce qu\'Excel fait bien, où il commence à coûter du temps et ce qui change avec une application. Trois questions pour choisir ce qui vous convient.',
    published: '2026-11-03',
    blocks: [
      { type: 'p', text: 'Choisir comment suivre votre argent semble une petite décision, mais elle détermine le temps que vous passez chaque mois sur vos chiffres. La question n\'est pas de savoir quelle option est la plus moderne : c\'est de savoir laquelle vous arriverez à tenir.' },

      { type: 'h2', text: 'Ce qu\'Excel fait bien' },
      { type: 'p', text: 'Un tableur coûte peu ou rien et vous donne un contrôle total. Vous pouvez séparer les dépenses par projet, par voyage ou par personne, et créer toutes les formules que vous voulez. Aucune application ne laisse autant de liberté pour concevoir le système à votre façon.' },
      { type: 'p', text: 'Si vous aimez manier les chiffres et avez déjà l\'habitude, inutile de changer.' },

      { type: 'h2', text: 'Où Excel commence à coûter du temps' },
      { type: 'ul', items: [
        'La saisie sur téléphone est peu pratique : les dépenses sont remises à plus tard et les plus petites finissent oubliées.',
        'Une nouvelle colonne oblige à revoir les sommes et les références, et une erreur dans une cellule peut fausser le mois sans que vous le voyiez.',
        'Le tableur ne signale un plafond dépassé que si vous construisez cette alerte et ouvrez le fichier pour la voir.',
        'Les graphiques et les comparaisons entre mois restent aussi à votre charge.',
      ] },

      { type: 'h2', text: 'Ce qui change avec une application' },
      { type: 'p', text: 'Dans une application, vous choisissez le montant et la catégorie et c\'est fait, sur votre téléphone, au moment de payer. Les totaux et les graphiques par catégorie et par mois apparaissent sans formules. Beaucoup d\'applications préviennent aussi quand vous approchez d\'un plafond.' },
      { type: 'p', text: 'Il y a aussi des limites. Vous avez moins de liberté que dans un tableur, les fonctions les plus avancées sont souvent payantes et, sauf si l\'application se connecte à la banque, la saisie reste un geste de votre part, simplement plus rapide.' },

      { type: 'h2', text: 'Trois questions pour décider' },
      { type: 'ol', items: [
        'Allez-vous vraiment noter vos dépenses dans un tableur ? Si vous abandonnez souvent au bout d\'une semaine, la rapidité d\'une application compte plus que la souplesse.',
        'Partagez-vous vos comptes avec quelqu\'un ? Un tableur dans le cloud est une bonne solution, et toutes les applications ne permettent pas de partager un budget.',
        'Voulez-vous seulement des totaux ou aussi de l\'aide pour les interpréter ? Pour des totaux, le tableur suffit. Pour des alertes et des explications, une application demande moins de travail.',
      ] },
      { type: 'tip', text: 'Faites le test du mois chargé : utilisez la méthode choisie pendant un mois rempli de travail. Celle qui est encore à jour à la fin est la bonne pour vous.' },

      { type: 'h2', text: 'À propos de FinanceFlow' },
      { type: 'p', text: 'FinanceFlow fonctionne dans le navigateur et sur Android. Avec le plan gratuit, vous saisissez revenus et dépenses en quelques secondes et vous voyez où va votre argent, par catégorie et par mois. Les plans payants permettent de photographier vos tickets, de fixer des plafonds avec alerte, de demander à l\'IA d\'expliquer vos statistiques et d\'exporter vos données en CSV pour continuer à les analyser dans un tableur. Deux choses qu\'elle ne fait pas : elle ne se connecte pas aux comptes bancaires, et chaque compte est individuel, sans budget partagé.' },
    ],
  },
  {
    key: 'app-or-excel',
    slug: 'finanz-app-oder-excel',
    lang: 'de',
    title: 'Finanz-App oder Excel: Was solltest du wählen?',
    description: 'Was Excel gut kann, wo es anfängt, Zeit zu kosten, und was sich mit einer App ändert. Drei Fragen helfen dir, das Passende für deinen Alltag zu wählen.',
    published: '2026-11-03',
    blocks: [
      { type: 'p', text: 'Wie du dein Geld im Blick behältst, wirkt wie eine kleine Entscheidung, bestimmt aber, wie viel Zeit du jeden Monat mit Zahlen verbringst. Die Frage ist nicht, welche Option moderner ist, sondern welche du wirklich durchhältst.' },

      { type: 'h2', text: 'Was Excel gut kann' },
      { type: 'p', text: 'Eine Tabelle kostet wenig oder nichts und gibt dir volle Kontrolle. Du kannst Ausgaben nach Projekt, Reise oder Person trennen und beliebige Formeln anlegen. Keine App lässt dir so viel Freiheit, das System nach deinen Vorstellungen zu gestalten.' },
      { type: 'p', text: 'Wenn du gern mit Zahlen arbeitest und die Gewohnheit schon hast, musst du nichts ändern.' },

      { type: 'h2', text: 'Wo Excel anfängt, Zeit zu kosten' },
      { type: 'ul', items: [
        'Auf dem Handy ist das Erfassen umständlich, also bleiben Ausgaben liegen und die kleinsten werden vergessen.',
        'Eine neue Spalte bedeutet, Summen und Bezüge zu prüfen, und ein Fehler in einer Zelle kann den Monat verfälschen, ohne dass du es merkst.',
        'Die Tabelle warnt dich nur vor einem überschrittenen Limit, wenn du diese Warnung selbst baust und die Datei öffnest.',
        'Auch Diagramme und Vergleiche zwischen Monaten bleiben an dir hängen.',
      ] },

      { type: 'h2', text: 'Was sich mit einer App ändert' },
      { type: 'p', text: 'In einer App wählst du Betrag und Kategorie und bist fertig, auf dem Handy, im Moment des Bezahlens. Summen und Diagramme nach Kategorie und Monat erscheinen ohne Formeln. Viele Apps warnen dich auch, wenn du dich einem Limit näherst.' },
      { type: 'p', text: 'Es gibt auch Grenzen. Du hast weniger Freiheit als in einer Tabelle, die fortgeschrittenen Funktionen kosten oft Geld, und wenn die App nicht mit der Bank verbunden ist, erfasst du weiterhin selbst, nur schneller.' },

      { type: 'h2', text: 'Drei Fragen für die Entscheidung' },
      { type: 'ol', items: [
        'Wirst du deine Ausgaben wirklich in eine Tabelle eintragen? Wenn du oft nach einer Woche aufgibst, zählt die Schnelligkeit einer App mehr als die Flexibilität.',
        'Teilst du deine Finanzen mit jemandem? Eine Tabelle in der Cloud ist dafür eine gute Lösung, und nicht jede App erlaubt geteilte Budgets.',
        'Willst du nur Summen oder auch Hilfe beim Verstehen? Für Summen reicht die Tabelle. Für Warnungen und Erklärungen macht eine App weniger Arbeit.',
      ] },
      { type: 'tip', text: 'Mach den Test mit einem vollen Monat: Nutze die gewählte Methode in einem Monat mit viel Arbeit. Was am Ende noch aktuell ist, ist die richtige Methode für dich.' },

      { type: 'h2', text: 'Über FinanceFlow' },
      { type: 'p', text: 'FinanceFlow läuft im Browser und auf Android. Im kostenlosen Plan erfasst du Einnahmen und Ausgaben in Sekunden und siehst, wohin dein Geld geht, nach Kategorie und Monat. In den kostenpflichtigen Plänen kannst du Kassenbons fotografieren, Limits mit Warnung setzen, dir die Statistiken von der KI erklären lassen und deine Daten als CSV exportieren, falls du sie in einer Tabelle weiter auswerten willst. Zwei Dinge kann die App nicht: Sie verbindet sich nicht mit Bankkonten, und jedes Konto ist individuell, ohne geteilte Budgets.' },
    ],
  },
  {
    key: 'app-or-excel',
    slug: 'app-finanze-personali-o-excel',
    lang: 'it',
    title: 'App di finanza personale o Excel: quale scegliere?',
    description: 'Cosa fa bene Excel, dove inizia a costare tempo e cosa cambia con un\'app. Tre domande per scegliere ciò che si adatta alla tua vita di ogni giorno.',
    published: '2026-11-03',
    blocks: [
      { type: 'p', text: 'Scegliere come controllare i soldi sembra una decisione piccola, ma stabilisce quanto tempo passi ogni mese sui numeri. La domanda non è quale opzione sia più moderna: è quale riuscirai a mantenere.' },

      { type: 'h2', text: 'Cosa fa bene Excel' },
      { type: 'p', text: 'Un foglio di calcolo costa poco o nulla e ti dà il controllo totale. Puoi separare le spese per progetto, viaggio o persona e creare tutte le formule che vuoi. Nessuna app ti lascia altrettanta libertà di costruire il sistema a modo tuo.' },
      { type: 'p', text: 'Se ti piace lavorare con i numeri e hai già l\'abitudine, non serve cambiare.' },

      { type: 'h2', text: 'Dove Excel inizia a costare tempo' },
      { type: 'ul', items: [
        'Registrare sul telefono è scomodo, così le spese restano per dopo e le più piccole vengono dimenticate.',
        'Una colonna nuova obbliga a controllare somme e riferimenti, e un errore in una cella può rovinare il mese senza che te ne accorga.',
        'Il foglio segnala un limite superato solo se costruisci tu l\'avviso e apri il file per vederlo.',
        'Anche i grafici e i confronti tra mesi restano a tuo carico.',
      ] },

      { type: 'h2', text: 'Cosa cambia con un\'app' },
      { type: 'p', text: 'In un\'app scegli l\'importo e la categoria ed è fatta, sul telefono, nel momento in cui paghi. I totali e i grafici per categoria e per mese compaiono senza formule. Molte app avvisano anche quando ti avvicini a un limite.' },
      { type: 'p', text: 'Ci sono anche dei limiti. Hai meno libertà che in un foglio, le funzioni più avanzate sono spesso a pagamento e, a meno che l\'app non si colleghi alla banca, la registrazione resta un gesto tuo, solo più rapido.' },

      { type: 'h2', text: 'Tre domande per decidere' },
      { type: 'ol', items: [
        'Registrerai davvero le spese in un foglio? Se di solito molli dopo una settimana, la rapidità di un\'app conta più della flessibilità.',
        'Condividi i conti con qualcuno? Un foglio nel cloud è una buona soluzione, e non tutte le app permettono di condividere i budget.',
        'Vuoi solo i totali o anche un aiuto per interpretarli? Per i totali basta il foglio. Per avvisi e spiegazioni, un\'app richiede meno lavoro.',
      ] },
      { type: 'tip', text: 'Fai la prova del mese pieno: usa il metodo scelto durante un mese carico di lavoro. Quello ancora aggiornato alla fine è il metodo giusto per te.' },

      { type: 'h2', text: 'Su FinanceFlow' },
      { type: 'p', text: 'FinanceFlow funziona nel browser e su Android. Con il piano gratuito registri entrate e spese in pochi secondi e vedi dove vanno i soldi, per categoria e per mese. Con i piani a pagamento puoi fotografare gli scontrini, impostare limiti con avviso, chiedere all\'IA di spiegare le statistiche ed esportare i dati in CSV, se vuoi continuare ad analizzarli in un foglio. Due cose che non fa: non si collega ai conti bancari e ogni account è individuale, senza budget condivisi.' },
    ],
  },
]
