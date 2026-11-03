import type { BlogPost } from './index'

// Como escolher uma app de finanças: critérios, com o que o FinanceFlow tem e
// não tem. Nasceu de um rascunho "Melhores apps de 2026" da Holo que não
// comparava nenhuma app e prometia orçamentos partilhados, que não existem.
export const chooseFinanceAppPosts: BlogPost[] = [
  {
    key: 'choose-finance-app',
    slug: 'como-escolher-app-financas-pessoais',
    lang: 'pt',
    title: 'Como escolher uma app de finanças pessoais: 6 critérios',
    description: 'Registo rápido, ligação ao banco, limites, partilha, preço e privacidade: o que comparar antes de escolheres uma app de finanças pessoais.',
    published: '2026-11-03',
    blocks: [
      { type: 'p', text: 'A melhor app de finanças pessoais não é a que tem mais funcionalidades: é a que ainda estás a usar passados três meses. Estes seis critérios ajudam-te a comparar as opções e a descobrir qual encaixa na tua rotina.' },

      { type: 'h2', text: '1. Rapidez a registar' },
      { type: 'p', text: 'Se registar um gasto demora muito, deixas de o fazer. Experimenta registar três despesas seguidas, com a app acabada de abrir. Conta os toques e vê se precisas de preencher campos desnecessários.' },

      { type: 'h2', text: '2. Ligação ao banco ou registo manual' },
      { type: 'p', text: 'Com ligação ao banco, os movimentos entram sozinhos, mas muitas vezes é preciso corrigir categorias e dar a um terceiro acesso aos teus dados bancários. O registo manual dá mais trabalho, mas obriga-te a olhar para cada gasto e não exige esse acesso. Nenhuma das opções é melhor para toda a gente, por isso decide qual preferes antes de comparar.' },

      { type: 'h2', text: '3. Limites e alertas' },
      { type: 'p', text: 'Ver o que já gastaste é útil, mas saber a tempo é melhor. Confirma se podes definir limites por categoria e se a app te avisa antes de os ultrapassares, e não só depois.' },

      { type: 'h2', text: '4. Clareza dos números' },
      { type: 'p', text: 'Faz este teste: em menos de um minuto, consegues saber quanto gastaste este mês e em que categorias? Se a app oferece previsões ou explicações com IA, vê de quantos meses de dados precisa e em que plano estão incluídas.' },

      { type: 'h2', text: '5. Partilha com outras pessoas' },
      { type: 'p', text: 'Se geres as contas com alguém, este critério pode decidir tudo. Muitas apps são individuais, por isso confirma se duas pessoas podem ver e editar o mesmo orçamento.' },

      { type: 'h2', text: '6. Preço e privacidade' },
      { type: 'ul', items: [
        'Vê o que fica no plano gratuito e se o que precisas está no plano mais barato.',
        'Confirma quanto custa ao fim do período de teste e como se cancela.',
        'Lê como os teus dados são usados, se são vendidos e se podes exportá-los ou apagá-los.',
        'Procura autenticação de dois fatores ou bloqueio biométrico.',
      ] },
      { type: 'tip', text: 'Escolhe os dois critérios que mais importam para ti e testa duas ou três apps durante uma semana cada, com as tuas despesas reais. Uma semana diz-te mais do que qualquer lista de funcionalidades.' },

      { type: 'h2', text: 'Onde fica o FinanceFlow' },
      { type: 'p', text: 'Como somos nós a fazer o FinanceFlow, deixamos aqui os factos para comparares. Funciona no browser e no Android, em seis línguas, e tem um plano gratuito sem cartão, com até 50 transações por mês, onde registas receitas e despesas e vês estatísticas por categoria e por mês. O plano Pro acrescenta limites com alerta, leitura de talões e explicações da IA. O Premium acrescenta previsões, orçamento sugerido por IA e registo de investimentos. Tem autenticação de dois fatores e os teus dados nunca são vendidos.' },
      { type: 'p', text: 'Não liga às contas bancárias nem tem orçamentos partilhados. Se um destes dois pontos for essencial para ti, é melhor procurares outra app.' },
    ],
  },
  {
    key: 'choose-finance-app',
    slug: 'how-to-choose-a-personal-finance-app',
    lang: 'en',
    title: 'How to choose a personal finance app: 6 criteria',
    description: 'Fast logging, bank connection, limits, sharing, price and privacy: what to compare before you choose a personal finance app.',
    published: '2026-11-03',
    blocks: [
      { type: 'p', text: 'The best personal finance app is not the one with the most features: it is the one you are still using three months later. These six criteria help you compare the options and find out which one fits your routine.' },

      { type: 'h2', text: '1. Logging speed' },
      { type: 'p', text: 'If logging a purchase takes too long, you stop doing it. Try logging three expenses in a row, starting with the app freshly opened. Count the taps and see whether you have to fill in unnecessary fields.' },

      { type: 'h2', text: '2. Bank connection or manual logging' },
      { type: 'p', text: 'With a bank connection, transactions arrive on their own, but you often have to fix categories and give a third party access to your banking data. Manual logging takes more work, but it makes you look at every purchase and does not require that access. Neither is better for everyone, so decide which you prefer before you compare.' },

      { type: 'h2', text: '3. Limits and alerts' },
      { type: 'p', text: 'Seeing what you have spent is useful, but knowing in time is better. Check whether you can set limits per category and whether the app warns you before you go over, not only afterwards.' },

      { type: 'h2', text: '4. Clear numbers' },
      { type: 'p', text: 'Try this test: in under a minute, can you tell how much you have spent this month and in which categories? If the app offers forecasts or AI explanations, check how many months of data it needs and which plan includes them.' },

      { type: 'h2', text: '5. Sharing with other people' },
      { type: 'p', text: 'If you manage money with someone else, this criterion may decide everything. Many apps are individual, so check whether two people can see and edit the same budget.' },

      { type: 'h2', text: '6. Price and privacy' },
      { type: 'ul', items: [
        'See what stays on the free plan and whether what you need is on the cheapest plan.',
        'Check what it costs after the trial period and how to cancel.',
        'Read how your data is used, whether it is sold and whether you can export or delete it.',
        'Look for two-factor authentication or a biometric lock.',
      ] },
      { type: 'tip', text: 'Pick the two criteria that matter most to you and try two or three apps for a week each, with your real expenses. A week tells you more than any feature list.' },

      { type: 'h2', text: 'Where FinanceFlow stands' },
      { type: 'p', text: 'Since we make FinanceFlow, here are the facts so you can compare. It works in the browser and on Android, in six languages, with a free plan and no card needed (up to 50 transactions a month), where you log income and expenses and see statistics by category and month. The Pro plan adds limits with alerts, receipt scanning and AI explanations. Premium adds forecasts, an AI-suggested budget and an investment tracker. It has two-factor authentication and your data is never sold.' },
      { type: 'p', text: 'It does not connect to bank accounts and has no shared budgets. If either of those is essential for you, you are better off looking for another app.' },
    ],
  },
  {
    key: 'choose-finance-app',
    slug: 'como-elegir-una-app-de-finanzas-personales',
    lang: 'es',
    title: 'Cómo elegir una app de finanzas personales: 6 criterios',
    description: 'Registro rápido, conexión al banco, límites, uso compartido, precio y privacidad: qué comparar antes de elegir una app de finanzas personales.',
    published: '2026-11-03',
    blocks: [
      { type: 'p', text: 'La mejor app de finanzas personales no es la que tiene más funciones: es la que sigues usando tres meses después. Estos seis criterios te ayudan a comparar las opciones y a descubrir cuál encaja en tu rutina.' },

      { type: 'h2', text: '1. Rapidez de registro' },
      { type: 'p', text: 'Si registrar un gasto cuesta demasiado, dejas de hacerlo. Prueba a registrar tres gastos seguidos, con la app recién abierta. Cuenta los toques y mira si tienes que rellenar campos innecesarios.' },

      { type: 'h2', text: '2. Conexión al banco o registro manual' },
      { type: 'p', text: 'Con conexión al banco, los movimientos entran solos, pero a menudo hay que corregir categorías y dar a un tercero acceso a tus datos bancarios. El registro manual da más trabajo, pero te obliga a mirar cada gasto y no exige ese acceso. Ninguna opción es mejor para todo el mundo, así que decide cuál prefieres antes de comparar.' },

      { type: 'h2', text: '3. Límites y alertas' },
      { type: 'p', text: 'Ver lo que has gastado es útil, pero saberlo a tiempo es mejor. Comprueba si puedes fijar límites por categoría y si la app te avisa antes de superarlos, y no solo después.' },

      { type: 'h2', text: '4. Claridad de los números' },
      { type: 'p', text: 'Haz esta prueba: en menos de un minuto, ¿puedes saber cuánto has gastado este mes y en qué categorías? Si la app ofrece previsiones o explicaciones con IA, mira cuántos meses de datos necesita y en qué plan están incluidas.' },

      { type: 'h2', text: '5. Uso compartido con otras personas' },
      { type: 'p', text: 'Si gestionas las cuentas con alguien, este criterio puede decidirlo todo. Muchas apps son individuales, así que comprueba si dos personas pueden ver y editar el mismo presupuesto.' },

      { type: 'h2', text: '6. Precio y privacidad' },
      { type: 'ul', items: [
        'Mira qué queda en el plan gratuito y si lo que necesitas está en el plan más barato.',
        'Comprueba cuánto cuesta al acabar el periodo de prueba y cómo se cancela.',
        'Lee cómo se usan tus datos, si se venden y si puedes exportarlos o borrarlos.',
        'Busca autenticación en dos pasos o bloqueo biométrico.',
      ] },
      { type: 'tip', text: 'Elige los dos criterios que más te importan y prueba dos o tres apps durante una semana cada una, con tus gastos reales. Una semana te dice más que cualquier lista de funciones.' },

      { type: 'h2', text: 'Dónde queda FinanceFlow' },
      { type: 'p', text: 'Como FinanceFlow lo hacemos nosotros, aquí tienes los hechos para que compares. Funciona en el navegador y en Android, en seis idiomas, con un plan gratuito sin tarjeta (hasta 50 transacciones al mes) en el que registras ingresos y gastos y ves estadísticas por categoría y por mes. El plan Pro añade límites con alerta, lectura de tiques y explicaciones de la IA. Premium añade previsiones, presupuesto sugerido por IA y registro de inversiones. Tiene autenticación en dos pasos y tus datos nunca se venden.' },
      { type: 'p', text: 'No se conecta a cuentas bancarias ni tiene presupuestos compartidos. Si alguno de estos dos puntos es esencial para ti, es mejor que busques otra app.' },
    ],
  },
  {
    key: 'choose-finance-app',
    slug: 'comment-choisir-une-application-de-finances-personnelles',
    lang: 'fr',
    title: 'Comment choisir une application de finances personnelles',
    description: 'Saisie rapide, connexion bancaire, plafonds, partage, prix et confidentialité : six critères à comparer avant de choisir votre application.',
    published: '2026-11-03',
    blocks: [
      { type: 'p', text: 'La meilleure application de finances personnelles n\'est pas celle qui a le plus de fonctions : c\'est celle que vous utilisez encore trois mois plus tard. Ces six critères vous aident à comparer les options et à trouver celle qui convient à votre routine.' },

      { type: 'h2', text: '1. Rapidité de saisie' },
      { type: 'p', text: 'Si noter une dépense prend trop de temps, vous arrêtez de le faire. Essayez de saisir trois dépenses de suite, en partant de l\'application tout juste ouverte. Comptez les gestes et voyez si vous devez remplir des champs inutiles.' },

      { type: 'h2', text: '2. Connexion bancaire ou saisie manuelle' },
      { type: 'p', text: 'Avec une connexion bancaire, les opérations arrivent seules, mais il faut souvent corriger les catégories et donner à un tiers l\'accès à vos données bancaires. La saisie manuelle demande plus de travail, mais elle vous oblige à regarder chaque dépense et n\'exige pas cet accès. Aucune option ne convient à tout le monde, alors décidez laquelle vous préférez avant de comparer.' },

      { type: 'h2', text: '3. Plafonds et alertes' },
      { type: 'p', text: 'Voir ce que vous avez dépensé est utile, mais le savoir à temps est mieux. Vérifiez si vous pouvez fixer des plafonds par catégorie et si l\'application vous prévient avant de les dépasser, et pas seulement après.' },

      { type: 'h2', text: '4. Clarté des chiffres' },
      { type: 'p', text: 'Faites ce test : en moins d\'une minute, pouvez-vous savoir combien vous avez dépensé ce mois-ci et dans quelles catégories ? Si l\'application propose des prévisions ou des explications par IA, regardez de combien de mois de données elle a besoin et dans quel plan elles sont incluses.' },

      { type: 'h2', text: '5. Partage avec d\'autres personnes' },
      { type: 'p', text: 'Si vous gérez vos comptes à deux, ce critère peut tout décider. Beaucoup d\'applications sont individuelles, alors vérifiez si deux personnes peuvent voir et modifier le même budget.' },

      { type: 'h2', text: '6. Prix et confidentialité' },
      { type: 'ul', items: [
        'Regardez ce qui reste dans le plan gratuit et si ce dont vous avez besoin figure dans le plan le moins cher.',
        'Vérifiez le prix après la période d\'essai et la façon de résilier.',
        'Lisez comment vos données sont utilisées, si elles sont vendues et si vous pouvez les exporter ou les supprimer.',
        'Cherchez l\'authentification à deux facteurs ou le verrouillage biométrique.',
      ] },
      { type: 'tip', text: 'Choisissez les deux critères qui comptent le plus pour vous et testez deux ou trois applications pendant une semaine chacune, avec vos vraies dépenses. Une semaine en dit plus que n\'importe quelle liste de fonctions.' },

      { type: 'h2', text: 'Où se situe FinanceFlow' },
      { type: 'p', text: 'Comme c\'est nous qui faisons FinanceFlow, voici les faits pour que vous puissiez comparer. L\'application fonctionne dans le navigateur et sur Android, en six langues, avec un plan gratuit sans carte (jusqu\'à 50 opérations par mois) où vous saisissez revenus et dépenses et voyez des statistiques par catégorie et par mois. Le plan Pro ajoute les plafonds avec alerte, la lecture des tickets et les explications de l\'IA. Premium ajoute les prévisions, le budget suggéré par l\'IA et le suivi des investissements. Elle propose l\'authentification à deux facteurs et vos données ne sont jamais vendues.' },
      { type: 'p', text: 'Elle ne se connecte pas aux comptes bancaires et n\'a pas de budgets partagés. Si l\'un de ces deux points est essentiel pour vous, mieux vaut chercher une autre application.' },
    ],
  },
  {
    key: 'choose-finance-app',
    slug: 'finanz-app-auswaehlen',
    lang: 'de',
    title: 'Die richtige Finanz-App auswählen: 6 Kriterien',
    description: 'Schnelles Erfassen, Bankanbindung, Limits, Teilen, Preis und Datenschutz: Das solltest du vergleichen, bevor du dich für eine Finanz-App entscheidest.',
    published: '2026-11-03',
    blocks: [
      { type: 'p', text: 'Die beste Finanz-App ist nicht die mit den meisten Funktionen, sondern die, die du nach drei Monaten noch nutzt. Diese sechs Kriterien helfen dir, die Optionen zu vergleichen und herauszufinden, welche zu deinem Alltag passt.' },

      { type: 'h2', text: '1. Schnelles Erfassen' },
      { type: 'p', text: 'Wenn das Erfassen einer Ausgabe zu lange dauert, hörst du damit auf. Erfasse drei Ausgaben hintereinander, beginnend mit der frisch geöffneten App. Zähle die Klicks und achte darauf, ob du unnötige Felder ausfüllen musst.' },

      { type: 'h2', text: '2. Bankanbindung oder manuelles Erfassen' },
      { type: 'p', text: 'Mit Bankanbindung kommen die Umsätze von selbst, aber oft musst du Kategorien korrigieren und einem Dritten Zugriff auf deine Bankdaten geben. Manuelles Erfassen macht mehr Arbeit, lässt dich aber jede Ausgabe ansehen und braucht diesen Zugriff nicht. Keine Variante ist für alle besser, also entscheide vor dem Vergleich, was du bevorzugst.' },

      { type: 'h2', text: '3. Limits und Warnungen' },
      { type: 'p', text: 'Zu sehen, was du ausgegeben hast, ist nützlich, es rechtzeitig zu wissen ist besser. Prüfe, ob du Limits pro Kategorie setzen kannst und ob die App dich warnt, bevor du sie überschreitest, und nicht erst danach.' },

      { type: 'h2', text: '4. Klare Zahlen' },
      { type: 'p', text: 'Mach diesen Test: Kannst du in unter einer Minute sagen, wie viel du diesen Monat ausgegeben hast und in welchen Kategorien? Wenn die App Prognosen oder KI-Erklärungen bietet, prüfe, wie viele Monate an Daten sie braucht und in welchem Plan sie enthalten sind.' },

      { type: 'h2', text: '5. Teilen mit anderen' },
      { type: 'p', text: 'Wenn du deine Finanzen mit jemandem teilst, kann dieses Kriterium alles entscheiden. Viele Apps sind für Einzelpersonen gedacht, also prüfe, ob zwei Personen dasselbe Budget sehen und bearbeiten können.' },

      { type: 'h2', text: '6. Preis und Datenschutz' },
      { type: 'ul', items: [
        'Sieh nach, was im kostenlosen Plan bleibt und ob das, was du brauchst, im günstigsten Plan enthalten ist.',
        'Prüfe, was es nach der Testphase kostet und wie du kündigst.',
        'Lies nach, wie deine Daten verwendet werden, ob sie verkauft werden und ob du sie exportieren oder löschen kannst.',
        'Achte auf Zwei-Faktor-Authentifizierung oder eine biometrische Sperre.',
      ] },
      { type: 'tip', text: 'Wähle die zwei Kriterien, die dir am wichtigsten sind, und teste zwei oder drei Apps jeweils eine Woche lang mit deinen echten Ausgaben. Eine Woche sagt dir mehr als jede Funktionsliste.' },

      { type: 'h2', text: 'Wo FinanceFlow steht' },
      { type: 'p', text: 'Da wir FinanceFlow selbst entwickeln, hier die Fakten zum Vergleichen. Die App läuft im Browser und auf Android, in sechs Sprachen, mit einem kostenlosen Plan ohne Karte (bis zu 50 Transaktionen pro Monat), in dem du Einnahmen und Ausgaben erfasst und Statistiken nach Kategorie und Monat siehst. Der Pro-Plan ergänzt Limits mit Warnung, das Auslesen von Kassenbons und KI-Erklärungen. Premium ergänzt Prognosen, ein von der KI vorgeschlagenes Budget und die Erfassung von Anlagen. Sie bietet Zwei-Faktor-Authentifizierung, und deine Daten werden nie verkauft.' },
      { type: 'p', text: 'Sie verbindet sich nicht mit Bankkonten und hat keine geteilten Budgets. Wenn einer dieser beiden Punkte für dich unverzichtbar ist, suchst du besser nach einer anderen App.' },
    ],
  },
  {
    key: 'choose-finance-app',
    slug: 'come-scegliere-un-app-di-finanza-personale',
    lang: 'it',
    title: 'Come scegliere un\'app di finanza personale: 6 criteri',
    description: 'Registrazione rapida, collegamento alla banca, limiti, condivisione, prezzo e privacy: cosa confrontare prima di scegliere un\'app di finanza personale.',
    published: '2026-11-03',
    blocks: [
      { type: 'p', text: 'La migliore app di finanza personale non è quella con più funzioni: è quella che usi ancora dopo tre mesi. Questi sei criteri ti aiutano a confrontare le opzioni e a scoprire quale si adatta alla tua routine.' },

      { type: 'h2', text: '1. Rapidità di registrazione' },
      { type: 'p', text: 'Se registrare una spesa richiede troppo tempo, smetti di farlo. Prova a registrare tre spese di seguito, partendo dall\'app appena aperta. Conta i tocchi e guarda se devi compilare campi inutili.' },

      { type: 'h2', text: '2. Collegamento alla banca o registrazione manuale' },
      { type: 'p', text: 'Con il collegamento alla banca i movimenti arrivano da soli, ma spesso bisogna correggere le categorie e dare a terzi l\'accesso ai tuoi dati bancari. La registrazione manuale richiede più lavoro, ma ti obbliga a guardare ogni spesa e non richiede quell\'accesso. Nessuna delle due è migliore per tutti, quindi decidi quale preferisci prima di confrontare.' },

      { type: 'h2', text: '3. Limiti e avvisi' },
      { type: 'p', text: 'Vedere quanto hai speso è utile, ma saperlo in tempo è meglio. Controlla se puoi impostare limiti per categoria e se l\'app ti avvisa prima di superarli, e non solo dopo.' },

      { type: 'h2', text: '4. Chiarezza dei numeri' },
      { type: 'p', text: 'Fai questa prova: in meno di un minuto, riesci a sapere quanto hai speso questo mese e in quali categorie? Se l\'app offre previsioni o spiegazioni con l\'IA, guarda di quanti mesi di dati ha bisogno e in quale piano sono incluse.' },

      { type: 'h2', text: '5. Condivisione con altre persone' },
      { type: 'p', text: 'Se gestisci i conti con qualcuno, questo criterio può decidere tutto. Molte app sono individuali, quindi controlla se due persone possono vedere e modificare lo stesso budget.' },

      { type: 'h2', text: '6. Prezzo e privacy' },
      { type: 'ul', items: [
        'Guarda cosa resta nel piano gratuito e se ciò che ti serve è nel piano più economico.',
        'Controlla quanto costa dopo il periodo di prova e come si disdice.',
        'Leggi come vengono usati i tuoi dati, se vengono venduti e se puoi esportarli o cancellarli.',
        'Cerca l\'autenticazione a due fattori o il blocco biometrico.',
      ] },
      { type: 'tip', text: 'Scegli i due criteri che contano di più per te e prova due o tre app per una settimana ciascuna, con le tue spese reali. Una settimana ti dice più di qualsiasi elenco di funzioni.' },

      { type: 'h2', text: 'Dove si colloca FinanceFlow' },
      { type: 'p', text: 'Dato che FinanceFlow lo facciamo noi, ecco i fatti per confrontare. Funziona nel browser e su Android, in sei lingue, con un piano gratuito senza carta (fino a 50 transazioni al mese) in cui registri entrate e spese e vedi statistiche per categoria e per mese. Il piano Pro aggiunge limiti con avviso, lettura degli scontrini e spiegazioni dell\'IA. Premium aggiunge previsioni, budget suggerito dall\'IA e registro degli investimenti. Ha l\'autenticazione a due fattori e i tuoi dati non vengono mai venduti.' },
      { type: 'p', text: 'Non si collega ai conti bancari e non ha budget condivisi. Se uno di questi due punti è essenziale per te, è meglio cercare un\'altra app.' },
    ],
  },
]
