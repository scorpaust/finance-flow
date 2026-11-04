import type { BlogPost } from './index'

// Como organizar as finanças pessoais: visão geral, do retrato do mês ao futuro.
// A partir de um rascunho da Holo, corrigido: sem orçamentos partilhados, previsão
// dos próximos 3 meses (não do mês), carteira sem promessa de crescimento e o
// fundo de emergência e as dívidas caras antes de investir.
export const organizeFinancesPosts: BlogPost[] = [
  {
    key: 'organize-finances',
    slug: 'como-organizar-financas-pessoais',
    lang: 'pt',
    title: 'Como organizar as finanças pessoais: guia simples',
    description: 'Como organizar as finanças pessoais sem folhas complicadas: ver o que entra e sai, poupar primeiro, pôr limites e rever uma vez por semana.',
    published: '2026-11-04',
    blocks: [
      { type: 'p', text: 'Recebes o salário, pagas as contas e, quando dás por ti, o dinheiro desapareceu. Se isto te soa familiar, não estás sozinho. A boa notícia é que organizar as finanças pessoais não exige folhas de cálculo complicadas nem horas de trabalho. Exige um plano simples e a vontade de olhar para os números de frente.' },

      { type: 'h2', text: 'Porque é que o dinheiro parece desaparecer todos os meses' },
      { type: 'p', text: 'Quando as despesas estão espalhadas por várias contas, aplicações e cartões, é difícil ter uma visão real do teu dinheiro. Cada compra pequena parece inofensiva, mas ao fim do mês somam uma quantia que não estavas à espera. Muitas vezes, o problema é não veres o quadro completo a tempo de agir.' },

      { type: 'h2', text: 'Começa pelo retrato real: quanto entra e quanto sai' },
      { type: 'p', text: 'Antes de cortares qualquer despesa, precisas de saber de onde partes. Durante um mês, regista tudo o que entra e tudo o que sai. Não tem de ser perfeito: o objetivo é perceber padrões.' },
      { type: 'p', text: 'Junta as contas bancárias, os cartões e os pagamentos em dinheiro num único sítio. Com os movimentos lado a lado, vês logo que categorias pesam mais, e há sempre gastos que surpreendem, como subscrições de que já te tinhas esquecido.' },

      { type: 'h2', text: 'Um orçamento mensal simples em três passos' },
      { type: 'ol', items: [
        'Decide primeiro quanto queres guardar. Em vez de poupares o que sobra no fim do mês, define logo no início quanto vais pôr de parte e trata esse valor como uma despesa obrigatória. Mesmo que sejam 20 ou 50 euros, criar o hábito é o mais importante.',
        'Dá um limite a cada categoria. Depois de reservares a poupança, distribui o resto por categorias: habitação, alimentação, transportes, lazer. Quando sabes que tens 150 euros para lazer, decides com consciência, em vez de descobrires o problema no fim do mês.',
        'Revê uma vez por semana, não todos os dias. Acompanhar cada cêntimo todos os dias cansa. Uma revisão semanal de dez minutos chega para ajustares o rumo, e é mais fácil corrigir um desvio pequeno do que recuperar um mês inteiro.',
      ] },

      { type: 'h2', text: 'Olha também para o que vem a seguir' },
      { type: 'p', text: 'Um orçamento olha para o passado, mas é mais útil quando te ajuda a preparar o futuro. Começa por juntar um fundo de emergência, normalmente de três a seis meses de despesas essenciais, e trata das dívidas com juros altos. Só depois faz sentido pensar em investir, com dinheiro de que não vais precisar a curto prazo, sabendo que o valor pode descer.' },

      { type: 'h2', text: 'Como o FinanceFlow pode ajudar' },
      { type: 'p', text: 'O FinanceFlow funciona no browser e no Android. No plano gratuito, com até 50 transações por mês, registas receitas e despesas e vês estatísticas por categoria e por mês. O plano Pro acrescenta limites com alerta, leitura de talões e explicações da IA em linguagem simples. O Premium acrescenta previsões para os próximos 3 meses, a partir de pelo menos 2 meses completos de dados, e o registo dos teus investimentos, onde vês quanto investiste e como evoluiu, com valores atualizados por ti. Não liga às contas bancárias, e cada conta é individual, sem orçamentos partilhados.' },

      { type: 'h2', text: 'Começa hoje, com um plano simples' },
      { type: 'p', text: 'Não precisas de esperar pelo próximo aumento nem pelo próximo mês. Escolhe uma tarde, regista os movimentos dos últimos 30 dias e define dois valores: quanto queres poupar e quanto podes gastar em lazer. A partir daí, ajusta à medida que aprendes. As finanças pessoais não são um exame que se falha: são um plano que se melhora todos os meses.' },
    ],
  },
  {
    key: 'organize-finances',
    slug: 'how-to-organize-your-personal-finances',
    lang: 'en',
    title: 'How to organize your personal finances: a simple guide',
    description: 'How to organize your personal finances without complicated spreadsheets: see what comes in and goes out, save first, set limits and review weekly.',
    published: '2026-11-04',
    blocks: [
      { type: 'p', text: 'You get paid, you pay the bills and, before you know it, the money is gone. If that sounds familiar, you are not alone. The good news is that organizing your personal finances does not take complicated spreadsheets or hours of work. It takes a simple plan and the willingness to face the numbers.' },

      { type: 'h2', text: 'Why money seems to disappear every month' },
      { type: 'p', text: 'When your spending is scattered across several accounts, apps and cards, it is hard to get a real view of your money. Each small purchase seems harmless, but by the end of the month they add up to an amount you were not expecting. Often, the problem is not seeing the full picture in time to act.' },

      { type: 'h2', text: 'Start with the real picture: what comes in and what goes out' },
      { type: 'p', text: 'Before you cut any expense, you need to know where you are starting from. For one month, log everything that comes in and everything that goes out. It does not have to be perfect: the goal is to spot patterns.' },
      { type: 'p', text: 'Bring your bank accounts, cards and cash payments together in one place. With all the transactions side by side, you can see straight away which categories weigh the most, and there are always surprises, such as subscriptions you had forgotten about.' },

      { type: 'h2', text: 'A simple monthly budget in three steps' },
      { type: 'ol', items: [
        'Decide first how much you want to save. Instead of saving whatever is left at the end of the month, set the amount at the start and treat it as a required expense. Even if it is only 20 or 50 euros, building the habit is what matters most.',
        'Give each category a limit. Once your savings are set aside, divide the rest between categories: housing, food, transport, leisure. When you know you have 150 euros for leisure, you decide consciously, instead of finding out about the problem at the end of the month.',
        'Review once a week, not every day. Following every cent every day is tiring. A ten-minute weekly review is enough to adjust course, and a small slip is easier to correct than a whole month.',
      ] },

      { type: 'h2', text: 'Look at what comes next too' },
      { type: 'p', text: 'A budget looks at the past, but it is more useful when it helps you prepare for the future. Start by building an emergency fund, usually three to six months of essential expenses, and deal with high-interest debt. Only then does it make sense to think about investing, with money you will not need in the short term, knowing that its value can fall.' },

      { type: 'h2', text: 'How FinanceFlow can help' },
      { type: 'p', text: 'FinanceFlow works in the browser and on Android. On the free plan, with up to 50 transactions a month, you log income and expenses and see statistics by category and by month. The Pro plan adds limits with alerts, receipt scanning and AI explanations in plain language. Premium adds forecasts for the next 3 months, from at least 2 complete months of data, and a record of your investments, where you see how much you invested and how it has changed, with values you update yourself. It does not connect to bank accounts, and each account is individual, with no shared budgets.' },

      { type: 'h2', text: 'Start today, with a simple plan' },
      { type: 'p', text: 'You do not need to wait for your next raise or next month. Pick an afternoon, log your transactions from the last 30 days and set two amounts: how much you want to save and how much you can spend on leisure. From there, adjust as you learn. Personal finances are not an exam you fail: they are a plan you improve every month.' },
    ],
  },
  {
    key: 'organize-finances',
    slug: 'como-organizar-las-finanzas-personales',
    lang: 'es',
    title: 'Cómo organizar las finanzas personales: guía sencilla',
    description: 'Cómo organizar las finanzas personales sin hojas complicadas: ver lo que entra y sale, ahorrar primero, poner límites y revisar una vez por semana.',
    published: '2026-11-04',
    blocks: [
      { type: 'p', text: 'Cobras el sueldo, pagas las facturas y, cuando te das cuenta, el dinero ha desaparecido. Si te suena, no estás solo. La buena noticia es que organizar las finanzas personales no exige hojas de cálculo complicadas ni horas de trabajo. Exige un plan sencillo y ganas de mirar los números de frente.' },

      { type: 'h2', text: 'Por qué el dinero parece desaparecer cada mes' },
      { type: 'p', text: 'Cuando los gastos están repartidos entre varias cuentas, aplicaciones y tarjetas, es difícil tener una visión real de tu dinero. Cada compra pequeña parece inofensiva, pero a final de mes suman una cantidad que no esperabas. Muchas veces, el problema es no ver el cuadro completo a tiempo de actuar.' },

      { type: 'h2', text: 'Empieza por el retrato real: cuánto entra y cuánto sale' },
      { type: 'p', text: 'Antes de recortar ningún gasto, necesitas saber de dónde partes. Durante un mes, registra todo lo que entra y todo lo que sale. No tiene que ser perfecto: el objetivo es ver patrones.' },
      { type: 'p', text: 'Reúne las cuentas bancarias, las tarjetas y los pagos en efectivo en un único sitio. Con los movimientos uno al lado del otro, ves enseguida qué categorías pesan más, y siempre hay gastos que sorprenden, como suscripciones de las que ya te habías olvidado.' },

      { type: 'h2', text: 'Un presupuesto mensual sencillo en tres pasos' },
      { type: 'ol', items: [
        'Decide primero cuánto quieres guardar. En lugar de ahorrar lo que sobra a final de mes, define al principio cuánto vas a apartar y trátalo como un gasto obligatorio. Aunque sean 20 o 50 euros, crear el hábito es lo más importante.',
        'Pon un límite a cada categoría. Después de reservar el ahorro, reparte el resto entre categorías: vivienda, alimentación, transporte, ocio. Cuando sabes que tienes 150 euros para ocio, decides con conciencia, en lugar de descubrir el problema a final de mes.',
        'Revisa una vez por semana, no todos los días. Seguir cada céntimo todos los días cansa. Una revisión semanal de diez minutos basta para ajustar el rumbo, y es más fácil corregir una desviación pequeña que recuperar un mes entero.',
      ] },

      { type: 'h2', text: 'Mira también lo que viene después' },
      { type: 'p', text: 'Un presupuesto mira al pasado, pero es más útil cuando te ayuda a preparar el futuro. Empieza por reunir un fondo de emergencia, normalmente de tres a seis meses de gastos esenciales, y ocúpate de las deudas con intereses altos. Solo entonces tiene sentido pensar en invertir, con dinero que no vayas a necesitar a corto plazo, sabiendo que el valor puede bajar.' },

      { type: 'h2', text: 'Cómo puede ayudarte FinanceFlow' },
      { type: 'p', text: 'FinanceFlow funciona en el navegador y en Android. En el plan gratuito, con hasta 50 transacciones al mes, registras ingresos y gastos y ves estadísticas por categoría y por mes. El plan Pro añade límites con aviso, lectura de tiques y explicaciones de la IA en lenguaje sencillo. Premium añade previsiones para los próximos 3 meses, a partir de al menos 2 meses completos de datos, y el registro de tus inversiones, donde ves cuánto has invertido y cómo ha evolucionado, con valores que actualizas tú. No se conecta a las cuentas bancarias, y cada cuenta es individual, sin presupuestos compartidos.' },

      { type: 'h2', text: 'Empieza hoy, con un plan sencillo' },
      { type: 'p', text: 'No hace falta esperar al próximo aumento ni al mes que viene. Elige una tarde, registra los movimientos de los últimos 30 días y define dos importes: cuánto quieres ahorrar y cuánto puedes gastar en ocio. A partir de ahí, ajusta a medida que aprendes. Las finanzas personales no son un examen que se suspende: son un plan que se mejora cada mes.' },
    ],
  },
  {
    key: 'organize-finances',
    slug: 'comment-organiser-ses-finances-personnelles',
    lang: 'fr',
    title: 'Comment organiser ses finances personnelles : guide simple',
    description: 'Organiser ses finances personnelles sans tableur compliqué : voir ce qui entre et sort, épargner d\'abord, fixer des plafonds et faire le point chaque semaine.',
    published: '2026-11-04',
    blocks: [
      { type: 'p', text: 'Vous recevez votre salaire, vous payez les factures et, sans vous en rendre compte, l\'argent a disparu. Si cela vous parle, vous n\'êtes pas seul. La bonne nouvelle, c\'est qu\'organiser ses finances personnelles n\'exige ni tableur compliqué ni heures de travail. Il faut un plan simple et la volonté de regarder les chiffres en face.' },

      { type: 'h2', text: 'Pourquoi l\'argent semble disparaître chaque mois' },
      { type: 'p', text: 'Quand les dépenses sont réparties entre plusieurs comptes, applications et cartes, il est difficile d\'avoir une vision réelle de votre argent. Chaque petit achat semble anodin, mais à la fin du mois, l\'ensemble atteint une somme que vous n\'attendiez pas. Souvent, le problème est de ne pas voir le tableau complet à temps pour agir.' },

      { type: 'h2', text: 'Commencez par la réalité : ce qui entre et ce qui sort' },
      { type: 'p', text: 'Avant de réduire la moindre dépense, vous devez savoir d\'où vous partez. Pendant un mois, notez tout ce qui entre et tout ce qui sort. Inutile d\'être parfait : le but est de repérer des tendances.' },
      { type: 'p', text: 'Rassemblez vos comptes bancaires, vos cartes et vos paiements en espèces au même endroit. Avec tous les mouvements côte à côte, vous voyez tout de suite quelles catégories pèsent le plus, et il y a toujours des surprises, comme des abonnements que vous aviez oubliés.' },

      { type: 'h2', text: 'Un budget mensuel simple en trois étapes' },
      { type: 'ol', items: [
        'Décidez d\'abord combien vous voulez mettre de côté. Au lieu d\'épargner ce qui reste en fin de mois, fixez le montant dès le début et traitez-le comme une dépense obligatoire. Même s\'il ne s\'agit que de 20 ou 50 euros, créer l\'habitude est le plus important.',
        'Donnez un plafond à chaque catégorie. Une fois l\'épargne réservée, répartissez le reste entre les catégories : logement, alimentation, transports, loisirs. Quand vous savez que vous avez 150 euros pour les loisirs, vous décidez en connaissance de cause, au lieu de découvrir le problème en fin de mois.',
        'Faites le point une fois par semaine, pas tous les jours. Suivre chaque centime tous les jours est épuisant. Dix minutes par semaine suffisent pour ajuster le cap, et il est plus facile de corriger un petit écart que de rattraper un mois entier.',
      ] },

      { type: 'h2', text: 'Regardez aussi ce qui vient ensuite' },
      { type: 'p', text: 'Un budget regarde le passé, mais il est plus utile quand il vous aide à préparer l\'avenir. Commencez par constituer une épargne de précaution, en général de trois à six mois de dépenses essentielles, et réglez les dettes à taux élevé. Ce n\'est qu\'ensuite qu\'il est logique de penser à investir, avec de l\'argent dont vous n\'aurez pas besoin à court terme, en sachant que sa valeur peut baisser.' },

      { type: 'h2', text: 'Comment FinanceFlow peut vous aider' },
      { type: 'p', text: 'FinanceFlow fonctionne dans le navigateur et sur Android. Avec le plan gratuit, jusqu\'à 50 transactions par mois, vous saisissez revenus et dépenses et vous voyez des statistiques par catégorie et par mois. Le plan Pro ajoute les plafonds avec alerte, la lecture des tickets et les explications de l\'IA en langage simple. Premium ajoute des prévisions pour les 3 prochains mois, à partir d\'au moins 2 mois complets de données, et le suivi de vos investissements, où vous voyez combien vous avez investi et comment cela a évolué, avec des valeurs que vous mettez à jour vous-même. L\'application ne se connecte pas aux comptes bancaires, et chaque compte est individuel, sans budget partagé.' },

      { type: 'h2', text: 'Commencez aujourd\'hui, avec un plan simple' },
      { type: 'p', text: 'Inutile d\'attendre la prochaine augmentation ou le mois prochain. Choisissez un après-midi, notez vos mouvements des 30 derniers jours et fixez deux montants : combien vous voulez épargner et combien vous pouvez dépenser en loisirs. Ajustez ensuite au fil de ce que vous apprenez. Les finances personnelles ne sont pas un examen que l\'on rate : ce sont un plan que l\'on améliore chaque mois.' },
    ],
  },
  {
    key: 'organize-finances',
    slug: 'persoenliche-finanzen-organisieren',
    lang: 'de',
    title: 'Persönliche Finanzen organisieren: ein einfacher Leitfaden',
    description: 'Persönliche Finanzen ohne komplizierte Tabellen organisieren: Einnahmen und Ausgaben sehen, zuerst sparen, Limits setzen und einmal pro Woche prüfen.',
    published: '2026-11-04',
    blocks: [
      { type: 'p', text: 'Das Gehalt kommt, du bezahlst die Rechnungen, und ehe du dich versiehst, ist das Geld weg. Falls dir das bekannt vorkommt: Du bist nicht allein. Die gute Nachricht ist, dass du für deine Finanzen weder komplizierte Tabellen noch stundenlange Arbeit brauchst. Du brauchst einen einfachen Plan und die Bereitschaft, den Zahlen ins Auge zu sehen.' },

      { type: 'h2', text: 'Warum das Geld jeden Monat zu verschwinden scheint' },
      { type: 'p', text: 'Wenn sich deine Ausgaben auf mehrere Konten, Apps und Karten verteilen, ist es schwer, einen echten Überblick zu bekommen. Jeder kleine Kauf wirkt harmlos, aber am Monatsende ergibt das eine Summe, mit der du nicht gerechnet hast. Oft liegt das Problem darin, dass du das Gesamtbild nicht rechtzeitig siehst.' },

      { type: 'h2', text: 'Fang mit dem echten Bild an: Was kommt rein, was geht raus' },
      { type: 'p', text: 'Bevor du irgendwo kürzt, musst du wissen, wo du stehst. Erfasse einen Monat lang alles, was reinkommt und rausgeht. Es muss nicht perfekt sein: Es geht darum, Muster zu erkennen.' },
      { type: 'p', text: 'Führe Bankkonten, Karten und Barzahlungen an einem Ort zusammen. Stehen alle Buchungen nebeneinander, siehst du sofort, welche Kategorien am stärksten ins Gewicht fallen, und es gibt immer Überraschungen, etwa Abos, die du vergessen hattest.' },

      { type: 'h2', text: 'Ein einfaches Monatsbudget in drei Schritten' },
      { type: 'ol', items: [
        'Entscheide zuerst, wie viel du sparen willst. Statt zu sparen, was am Monatsende übrig bleibt, legst du den Betrag gleich zu Beginn fest und behandelst ihn wie eine feste Ausgabe. Auch wenn es nur 20 oder 50 Euro sind: Am wichtigsten ist die Gewohnheit.',
        'Gib jeder Kategorie ein Limit. Wenn das Sparen eingeplant ist, verteilst du den Rest auf Kategorien: Wohnen, Lebensmittel, Mobilität, Freizeit. Wenn du weißt, dass du 150 Euro für Freizeit hast, entscheidest du bewusst, statt das Problem erst am Monatsende zu entdecken.',
        'Prüfe einmal pro Woche, nicht jeden Tag. Jeden Cent täglich zu verfolgen ist ermüdend. Zehn Minuten pro Woche reichen, um den Kurs anzupassen, und eine kleine Abweichung lässt sich leichter korrigieren als ein ganzer Monat.',
      ] },

      { type: 'h2', text: 'Schau auch auf das, was danach kommt' },
      { type: 'p', text: 'Ein Budget blickt zurück, ist aber nützlicher, wenn es dir hilft, dich auf die Zukunft vorzubereiten. Leg zuerst einen Notgroschen an, meist drei bis sechs Monate an notwendigen Ausgaben, und kümmere dich um Schulden mit hohen Zinsen. Erst danach ist es sinnvoll, ans Investieren zu denken, mit Geld, das du kurzfristig nicht brauchst, und im Wissen, dass der Wert fallen kann.' },

      { type: 'h2', text: 'Wie FinanceFlow helfen kann' },
      { type: 'p', text: 'FinanceFlow funktioniert im Browser und auf Android. Im kostenlosen Plan mit bis zu 50 Transaktionen pro Monat erfasst du Einnahmen und Ausgaben und siehst Statistiken nach Kategorie und Monat. Der Pro-Plan ergänzt Limits mit Warnung, das Auslesen von Kassenbons und KI-Erklärungen in einfacher Sprache. Premium ergänzt Prognosen für die nächsten 3 Monate, ab mindestens 2 vollständigen Monaten an Daten, und die Erfassung deiner Anlagen, bei der du siehst, wie viel du investiert hast und wie es sich entwickelt hat, mit Werten, die du selbst aktualisierst. Die App verbindet sich nicht mit Bankkonten, und jedes Konto ist individuell, ohne gemeinsame Budgets.' },

      { type: 'h2', text: 'Fang heute an, mit einem einfachen Plan' },
      { type: 'p', text: 'Du musst weder auf die nächste Gehaltserhöhung noch auf den nächsten Monat warten. Nimm dir einen Nachmittag, erfasse die Buchungen der letzten 30 Tage und lege zwei Beträge fest: wie viel du sparen willst und wie viel du für Freizeit ausgeben kannst. Danach passt du an, was du dazulernst. Persönliche Finanzen sind keine Prüfung, durch die man fällt, sondern ein Plan, den man jeden Monat verbessert.' },
    ],
  },
  {
    key: 'organize-finances',
    slug: 'come-organizzare-le-finanze-personali',
    lang: 'it',
    title: 'Come organizzare le finanze personali: guida semplice',
    description: 'Come organizzare le finanze personali senza fogli complicati: vedere cosa entra ed esce, risparmiare prima, fissare limiti e controllare ogni settimana.',
    published: '2026-11-04',
    blocks: [
      { type: 'p', text: 'Ricevi lo stipendio, paghi le bollette e, quando te ne accorgi, i soldi sono spariti. Se ti suona familiare, non sei solo. La buona notizia è che organizzare le finanze personali non richiede fogli di calcolo complicati né ore di lavoro. Richiede un piano semplice e la voglia di guardare i numeri in faccia.' },

      { type: 'h2', text: 'Perché i soldi sembrano sparire ogni mese' },
      { type: 'p', text: 'Quando le spese sono sparse tra vari conti, app e carte, è difficile avere una visione reale dei tuoi soldi. Ogni piccolo acquisto sembra innocuo, ma a fine mese il totale è una cifra che non ti aspettavi. Spesso il problema è non vedere il quadro completo in tempo per agire.' },

      { type: 'h2', text: 'Parti dal quadro reale: quanto entra e quanto esce' },
      { type: 'p', text: 'Prima di tagliare qualsiasi spesa, devi sapere da dove parti. Per un mese, registra tutto ciò che entra e tutto ciò che esce. Non deve essere perfetto: l\'obiettivo è riconoscere gli schemi.' },
      { type: 'p', text: 'Riunisci i conti bancari, le carte e i pagamenti in contanti in un unico posto. Con i movimenti uno accanto all\'altro, vedi subito quali categorie pesano di più, e ci sono sempre spese che sorprendono, come abbonamenti che avevi dimenticato.' },

      { type: 'h2', text: 'Un budget mensile semplice in tre passi' },
      { type: 'ol', items: [
        'Decidi prima quanto vuoi mettere da parte. Invece di risparmiare quello che avanza a fine mese, stabilisci la cifra all\'inizio e trattala come una spesa obbligatoria. Anche se sono solo 20 o 50 euro, creare l\'abitudine è la cosa più importante.',
        'Dai un limite a ogni categoria. Dopo aver riservato il risparmio, distribuisci il resto tra le categorie: casa, alimentari, trasporti, tempo libero. Quando sai di avere 150 euro per il tempo libero, decidi con consapevolezza, invece di scoprire il problema a fine mese.',
        'Controlla una volta alla settimana, non ogni giorno. Seguire ogni centesimo tutti i giorni stanca. Una revisione settimanale di dieci minuti basta per correggere la rotta, ed è più facile rimediare a un piccolo scostamento che recuperare un mese intero.',
      ] },

      { type: 'h2', text: 'Guarda anche a ciò che viene dopo' },
      { type: 'p', text: 'Un budget guarda al passato, ma è più utile quando ti aiuta a preparare il futuro. Inizia a mettere da parte un fondo di emergenza, di solito da tre a sei mesi di spese essenziali, e occupati dei debiti con interessi alti. Solo dopo ha senso pensare a investire, con denaro che non ti servirà a breve, sapendo che il valore può scendere.' },

      { type: 'h2', text: 'Come può aiutarti FinanceFlow' },
      { type: 'p', text: 'FinanceFlow funziona nel browser e su Android. Con il piano gratuito, fino a 50 transazioni al mese, registri entrate e spese e vedi statistiche per categoria e per mese. Il piano Pro aggiunge limiti con avviso, lettura degli scontrini e spiegazioni dell\'IA in linguaggio semplice. Premium aggiunge previsioni per i prossimi 3 mesi, a partire da almeno 2 mesi completi di dati, e la registrazione dei tuoi investimenti, dove vedi quanto hai investito e come si è evoluto, con valori che aggiorni tu. Non si collega ai conti bancari, e ogni account è individuale, senza budget condivisi.' },

      { type: 'h2', text: 'Inizia oggi, con un piano semplice' },
      { type: 'p', text: 'Non serve aspettare il prossimo aumento né il mese prossimo. Scegli un pomeriggio, registra i movimenti degli ultimi 30 giorni e stabilisci due cifre: quanto vuoi risparmiare e quanto puoi spendere per il tempo libero. Da lì, correggi man mano che impari. Le finanze personali non sono un esame che si boccia: sono un piano che si migliora ogni mese.' },
    ],
  },
]
