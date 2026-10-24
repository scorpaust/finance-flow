import type { BlogPost } from './index'

// Métodos de orçamento (de cabeça, envelopes, caderno, folha de cálculo, app)
// e uma análise SWOT das finanças pessoais.
export const budgetingMethodsPosts: BlogPost[] = [
  {
    key: 'budgeting-methods',
    slug: 'metodos-de-orcamento',
    lang: 'pt',
    title: 'Envelopes, folha de cálculo ou app: que método de orçamento escolher',
    description: 'Vantagens e limites de cada forma de fazer orçamento e uma análise SWOT simples para perceberes por onde começar a melhorar as tuas finanças.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'O melhor método de orçamento é o que continuas a usar daqui a seis meses. Não há um certo para toda a gente: depende de quanto tempo queres dedicar, de como pagas as coisas e de quantas pessoas partilham as despesas.' },

      { type: 'h2', text: 'De cabeça' },
      { type: 'p', text: 'Sabes mais ou menos quanto tens e quanto podes gastar. Funciona com rendimentos baixos e poucas despesas, mas falha à primeira semana atribulada: ninguém se lembra de tudo, e os pequenos gastos são os primeiros a escapar.' },

      { type: 'h2', text: 'Envelopes' },
      { type: 'p', text: 'Divides o dinheiro do mês por envelopes, um por categoria: alimentação, transportes, lazer. Quando o envelope fica vazio, acabou. É muito visual e trava os excessos, mas é pouco prático com cartões e pagamentos online. A versão digital do mesmo princípio são as contas ou categorias com um limite fixo.' },

      { type: 'h2', text: 'Caderno' },
      { type: 'p', text: 'Uma coluna com o planeado e outra com o real, por categoria e por mês. Simples e barato, e o simples facto de escreveres torna-te mais consciente. O ponto fraco são as contas, que tens de fazer à mão, e o caderno nem sempre está contigo.' },

      { type: 'h2', text: 'Folha de cálculo' },
      { type: 'p', text: 'Totalmente personalizável, faz as contas sozinha e permite gráficos. Exige algum jeito e disciplina para lançar cada movimento, normalmente ao fim do dia ou da semana, o que já é tarde para te lembrares de tudo.' },

      { type: 'h2', text: 'App' },
      { type: 'p', text: 'Está sempre no bolso, regista no momento e faz as contas e os gráficos por ti. Compara funcionalidades, custo e privacidade antes de escolher, e confirma que consegues exportar os teus dados se um dia quiseres mudar.' },

      { type: 'h2', text: 'Antes de escolher: uma análise SWOT das tuas finanças' },
      { type: 'p', text: 'As empresas usam a análise SWOT (forças, fraquezas, oportunidades e ameaças) para planear. Também serve para as finanças pessoais. Pega numa folha e preenche os quatro quadrantes:' },
      { type: 'ul', items: [
        'Forças (internas): já poupas todos os meses, não tens dívidas de cartão, tens um emprego estável.',
        'Fraquezas (internas): não tens fundo de emergência, gastas muito em refeições fora, não sabes quanto gastas por mês.',
        'Oportunidades (externas): podes fazer horas extra ou um trabalho por conta própria, há contas sem comissões, um aumento previsto.',
        'Ameaças (externas): a renda pode subir, os preços estão a aumentar, há risco de cortes no trabalho.',
      ] },
      { type: 'p', text: 'Depois escolhe uma ação para cada quadrante: usar uma força, corrigir uma fraqueza, aproveitar uma oportunidade e proteger-te de uma ameaça. Muitas vezes a primeira fraqueza a corrigir é "não sei quanto gasto", e é aí que o método de orçamento entra.' },

      { type: 'h2', text: 'Sobre o FinanceFlow' },
      { type: 'p', text: 'Se escolheres uma app, o FinanceFlow funciona no browser e no Android, em seis línguas. No plano gratuito registas receitas e despesas por categoria e vês o resumo do mês. Nos planos pagos, os grupos funcionam como envelopes digitais, com um limite mensal ou semanal e um alerta quando te aproximas dele. Também podes fotografar recibos para não teres de escrever nada e exportar tudo para CSV.' },
    ],
  },
  {
    key: 'budgeting-methods',
    slug: 'budgeting-methods',
    lang: 'en',
    title: 'Envelopes, spreadsheet or app: which budgeting method to choose',
    description: 'The pros and cons of each way to budget, plus a simple SWOT analysis to see where to start improving your finances.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'The best budgeting method is the one you are still using six months from now. There is no single right one for everybody: it depends on how much time you want to spend, how you pay for things and how many people share the expenses.' },

      { type: 'h2', text: 'In your head' },
      { type: 'p', text: 'You roughly know how much you have and how much you can spend. It works with a low income and few expenses, but it fails at the first busy week: nobody remembers everything, and small purchases are the first to slip through.' },

      { type: 'h2', text: 'Envelopes' },
      { type: 'p', text: 'You split the month\'s money into envelopes, one per category: food, transport, leisure. When an envelope is empty, that\'s it. It is very visual and stops overspending, but it is impractical with cards and online payments. The digital version of the same idea is accounts or categories with a fixed limit.' },

      { type: 'h2', text: 'Notebook' },
      { type: 'p', text: 'One column for what you planned and another for what actually happened, by category and month. Simple and cheap, and the act of writing makes you more aware. The weak points are the sums, which you do by hand, and the fact that the notebook isn\'t always with you.' },

      { type: 'h2', text: 'Spreadsheet' },
      { type: 'p', text: 'Fully customisable, it does the maths for you and can make charts. It takes some skill and discipline to enter every transaction, usually at the end of the day or week, which is already too late to remember everything.' },

      { type: 'h2', text: 'App' },
      { type: 'p', text: 'It is always in your pocket, records spending on the spot and does the sums and charts for you. Compare features, cost and privacy before you choose, and check that you can export your data if you ever want to switch.' },

      { type: 'h2', text: 'Before you choose: a SWOT analysis of your finances' },
      { type: 'p', text: 'Companies use SWOT analysis (strengths, weaknesses, opportunities and threats) to plan. It works for personal finances too. Take a sheet of paper and fill in the four boxes:' },
      { type: 'ul', items: [
        'Strengths (internal): you already save every month, you have no credit card debt, your job is stable.',
        'Weaknesses (internal): no emergency fund, a lot spent on eating out, no idea how much you spend each month.',
        'Opportunities (external): overtime or freelance work, fee-free bank accounts, an expected pay rise.',
        'Threats (external): your rent might go up, prices are rising, there is a risk of reduced hours at work.',
      ] },
      { type: 'p', text: 'Then choose one action for each box: use a strength, fix a weakness, take an opportunity and protect yourself from a threat. Very often the first weakness to fix is "I don\'t know how much I spend", and that is where a budgeting method comes in.' },

      { type: 'h2', text: 'About FinanceFlow' },
      { type: 'p', text: 'If you choose an app, FinanceFlow works in the browser and on Android, in six languages. On the free plan you record income and expenses by category and see the month\'s summary. On paid plans, groups work like digital envelopes, with a monthly or weekly limit and an alert as you get close. You can also snap receipts so you don\'t have to type anything, and export everything to CSV.' },
    ],
  },
  {
    key: 'budgeting-methods',
    slug: 'metodos-de-presupuesto',
    lang: 'es',
    title: 'Sobres, hoja de cálculo o app: qué método de presupuesto elegir',
    description: 'Ventajas y límites de cada forma de hacer un presupuesto y un análisis DAFO sencillo para saber por dónde empezar a mejorar tus finanzas.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'El mejor método de presupuesto es el que sigues usando dentro de seis meses. No hay uno correcto para todo el mundo: depende de cuánto tiempo quieras dedicarle, de cómo pagas las cosas y de cuántas personas comparten los gastos.' },

      { type: 'h2', text: 'De cabeza' },
      { type: 'p', text: 'Sabes más o menos cuánto tienes y cuánto puedes gastar. Funciona con ingresos bajos y pocos gastos, pero falla en la primera semana complicada: nadie se acuerda de todo, y los gastos pequeños son los primeros en escaparse.' },

      { type: 'h2', text: 'Sobres' },
      { type: 'p', text: 'Repartes el dinero del mes en sobres, uno por categoría: comida, transporte, ocio. Cuando un sobre se vacía, se acabó. Es muy visual y frena los excesos, pero resulta poco práctico con tarjetas y pagos online. La versión digital de la misma idea son cuentas o categorías con un límite fijo.' },

      { type: 'h2', text: 'Libreta' },
      { type: 'p', text: 'Una columna con lo previsto y otra con lo real, por categoría y por mes. Sencillo y barato, y el simple hecho de escribir te hace más consciente. Los puntos débiles son las cuentas, que haces a mano, y que la libreta no siempre va contigo.' },

      { type: 'h2', text: 'Hoja de cálculo' },
      { type: 'p', text: 'Totalmente personalizable, hace las cuentas sola y permite gráficos. Exige algo de soltura y disciplina para apuntar cada movimiento, normalmente al final del día o de la semana, cuando ya es tarde para acordarse de todo.' },

      { type: 'h2', text: 'App' },
      { type: 'p', text: 'Siempre la llevas en el bolsillo, registra en el momento y hace las cuentas y los gráficos por ti. Compara funciones, precio y privacidad antes de elegir, y comprueba que puedes exportar tus datos si algún día quieres cambiar.' },

      { type: 'h2', text: 'Antes de elegir: un análisis DAFO de tus finanzas' },
      { type: 'p', text: 'Las empresas usan el análisis DAFO (debilidades, amenazas, fortalezas y oportunidades) para planificar. También sirve para las finanzas personales. Coge una hoja y rellena los cuatro cuadrantes:' },
      { type: 'ul', items: [
        'Fortalezas (internas): ya ahorras cada mes, no tienes deuda de tarjeta, tu empleo es estable.',
        'Debilidades (internas): no tienes fondo de emergencia, gastas mucho en comer fuera, no sabes cuánto gastas al mes.',
        'Oportunidades (externas): horas extra o trabajos por tu cuenta, cuentas sin comisiones, una subida de sueldo prevista.',
        'Amenazas (externas): el alquiler puede subir, los precios aumentan, hay riesgo de recortes en el trabajo.',
      ] },
      { type: 'p', text: 'Después elige una acción para cada cuadrante: aprovechar una fortaleza, corregir una debilidad, aprovechar una oportunidad y protegerte de una amenaza. Muchas veces la primera debilidad que corregir es "no sé cuánto gasto", y ahí es donde entra el método de presupuesto.' },

      { type: 'h2', text: 'Sobre FinanceFlow' },
      { type: 'p', text: 'Si eliges una app, FinanceFlow funciona en el navegador y en Android, en seis idiomas. Con el plan gratuito registras ingresos y gastos por categoría y ves el resumen del mes. En los planes de pago, los grupos funcionan como sobres digitales, con un límite mensual o semanal y un aviso cuando te acercas. También puedes fotografiar los tickets para no tener que escribir nada y exportarlo todo a CSV.' },
    ],
  },
  {
    key: 'budgeting-methods',
    slug: 'methodes-de-budget',
    lang: 'fr',
    title: 'Enveloppes, tableur ou appli : quelle méthode de budget choisir',
    description: 'Avantages et limites de chaque façon de faire un budget, et une analyse SWOT simple pour savoir par où commencer à améliorer vos finances.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'La meilleure méthode de budget est celle que vous utiliserez encore dans six mois. Il n\'y en a pas une qui convienne à tout le monde : tout dépend du temps que vous voulez y consacrer, de votre façon de payer et du nombre de personnes qui partagent les dépenses.' },

      { type: 'h2', text: 'De tête' },
      { type: 'p', text: 'Vous savez à peu près combien vous avez et combien vous pouvez dépenser. Cela marche avec de petits revenus et peu de dépenses, mais cela lâche à la première semaine chargée : personne ne se souvient de tout, et les petites dépenses sont les premières à échapper.' },

      { type: 'h2', text: 'Les enveloppes' },
      { type: 'p', text: 'Vous répartissez l\'argent du mois dans des enveloppes, une par catégorie : alimentation, transports, loisirs. Quand une enveloppe est vide, c\'est fini. C\'est très visuel et cela freine les excès, mais c\'est peu pratique avec la carte bancaire et les paiements en ligne. La version numérique du même principe, ce sont des comptes ou des catégories avec un plafond fixe.' },

      { type: 'h2', text: 'Le carnet' },
      { type: 'p', text: 'Une colonne pour le prévu, une autre pour le réel, par catégorie et par mois. Simple et peu coûteux, et le simple fait d\'écrire rend plus attentif. Les points faibles : les calculs à faire à la main, et le carnet qu\'on n\'a pas toujours sur soi.' },

      { type: 'h2', text: 'Le tableur' },
      { type: 'p', text: 'Entièrement personnalisable, il fait les calculs tout seul et produit des graphiques. Il demande un peu d\'aisance et de discipline pour saisir chaque opération, souvent en fin de journée ou de semaine, ce qui est déjà trop tard pour se souvenir de tout.' },

      { type: 'h2', text: 'L\'application' },
      { type: 'p', text: 'Elle est toujours dans votre poche, enregistre la dépense sur le moment et fait les calculs et les graphiques pour vous. Comparez fonctions, prix et confidentialité avant de choisir, et vérifiez que vous pouvez exporter vos données si un jour vous voulez changer.' },

      { type: 'h2', text: 'Avant de choisir : une analyse SWOT de vos finances' },
      { type: 'p', text: 'Les entreprises utilisent l\'analyse SWOT (forces, faiblesses, opportunités et menaces) pour planifier. Elle fonctionne aussi pour les finances personnelles. Prenez une feuille et remplissez les quatre cases :' },
      { type: 'ul', items: [
        'Forces (internes) : vous épargnez déjà chaque mois, vous n\'avez pas de dette de carte de crédit, votre emploi est stable.',
        'Faiblesses (internes) : pas d\'épargne de précaution, beaucoup de dépenses au restaurant, aucune idée de ce que vous dépensez par mois.',
        'Opportunités (externes) : heures supplémentaires ou missions en indépendant, comptes sans frais, une augmentation prévue.',
        'Menaces (externes) : le loyer peut augmenter, les prix montent, risque de baisse d\'heures au travail.',
      ] },
      { type: 'p', text: 'Choisissez ensuite une action par case : vous appuyer sur une force, corriger une faiblesse, saisir une opportunité et vous protéger d\'une menace. Très souvent, la première faiblesse à corriger est « je ne sais pas combien je dépense », et c\'est là qu\'intervient la méthode de budget.' },

      { type: 'h2', text: 'À propos de FinanceFlow' },
      { type: 'p', text: 'Si vous choisissez une application, FinanceFlow fonctionne dans le navigateur et sur Android, en six langues. Avec la formule gratuite, vous enregistrez revenus et dépenses par catégorie et voyez le bilan du mois. Avec les formules payantes, les groupes fonctionnent comme des enveloppes numériques, avec un plafond mensuel ou hebdomadaire et une alerte quand vous en approchez. Vous pouvez aussi photographier vos tickets pour ne rien saisir et tout exporter en CSV.' },
    ],
  },
  {
    key: 'budgeting-methods',
    slug: 'budget-methoden',
    lang: 'de',
    title: 'Umschläge, Tabelle oder App: Welche Budget-Methode passt zu dir?',
    description: 'Vor- und Nachteile jeder Art zu budgetieren und eine einfache SWOT-Analyse, mit der du siehst, wo du bei deinen Finanzen ansetzen solltest.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'Die beste Budget-Methode ist die, die du in sechs Monaten noch nutzt. Es gibt keine, die für alle richtig ist: Es hängt davon ab, wie viel Zeit du investieren willst, wie du bezahlst und wie viele Personen sich die Ausgaben teilen.' },

      { type: 'h2', text: 'Im Kopf' },
      { type: 'p', text: 'Du weißt ungefähr, wie viel du hast und ausgeben kannst. Das klappt bei geringem Einkommen und wenigen Ausgaben, scheitert aber an der ersten hektischen Woche: Niemand behält alles im Kopf, und kleine Ausgaben rutschen zuerst durch.' },

      { type: 'h2', text: 'Umschläge' },
      { type: 'p', text: 'Du verteilst das Geld des Monats auf Umschläge, einen pro Kategorie: Essen, Mobilität, Freizeit. Ist ein Umschlag leer, ist Schluss. Das ist sehr anschaulich und bremst Überausgaben, aber mit Karte und Onlinezahlungen unpraktisch. Die digitale Variante desselben Prinzips sind Konten oder Kategorien mit festem Limit.' },

      { type: 'h2', text: 'Notizbuch' },
      { type: 'p', text: 'Eine Spalte für den Plan, eine für die tatsächlichen Ausgaben, nach Kategorie und Monat. Einfach und günstig, und schon das Aufschreiben macht dich bewusster. Schwachpunkte sind das Rechnen von Hand und dass das Notizbuch nicht immer dabei ist.' },

      { type: 'h2', text: 'Tabellenkalkulation' },
      { type: 'p', text: 'Völlig anpassbar, rechnet von selbst und erstellt Diagramme. Sie erfordert etwas Übung und Disziplin, um jede Buchung einzutragen, meist am Ende des Tages oder der Woche, wenn man sich schon nicht mehr an alles erinnert.' },

      { type: 'h2', text: 'App' },
      { type: 'p', text: 'Sie ist immer in der Tasche, erfasst Ausgaben sofort und übernimmt Rechnungen und Diagramme. Vergleiche Funktionen, Kosten und Datenschutz, bevor du dich entscheidest, und prüfe, ob du deine Daten exportieren kannst, falls du einmal wechseln willst.' },

      { type: 'h2', text: 'Bevor du wählst: eine SWOT-Analyse deiner Finanzen' },
      { type: 'p', text: 'Unternehmen planen mit der SWOT-Analyse (Stärken, Schwächen, Chancen und Risiken). Sie funktioniert auch für die privaten Finanzen. Nimm ein Blatt und füll die vier Felder aus:' },
      { type: 'ul', items: [
        'Stärken (intern): Du sparst schon jeden Monat, hast keine Kreditkartenschulden, dein Job ist sicher.',
        'Schwächen (intern): kein Notgroschen, viel Geld fürs Essengehen, keine Ahnung, wie viel du im Monat ausgibst.',
        'Chancen (extern): Überstunden oder freiberufliche Aufträge, kostenlose Konten, eine geplante Gehaltserhöhung.',
        'Risiken (extern): Die Miete könnte steigen, die Preise ziehen an, im Job drohen Kürzungen.',
      ] },
      { type: 'p', text: 'Wähle dann für jedes Feld eine Maßnahme: eine Stärke nutzen, eine Schwäche beheben, eine Chance ergreifen und dich gegen ein Risiko absichern. Sehr oft ist die erste Schwäche „“, und genau da kommt die Budget-Methode ins Spiel.' },

      { type: 'h2', text: 'Über FinanceFlow' },
      { type: 'p', text: 'Wenn du dich für eine App entscheidest: FinanceFlow läuft im Browser und auf Android, in sechs Sprachen. Im kostenlosen Tarif erfasst du Einnahmen und Ausgaben nach Kategorie und siehst die Monatsübersicht. In den bezahlten Tarifen funktionieren Gruppen wie digitale Umschläge, mit einem Monats- oder Wochenlimit und einer Warnung, wenn du dich ihm näherst. Außerdem kannst du Belege fotografieren, statt zu tippen, und alles als CSV exportieren.' },
    ],
  },
  {
    key: 'budgeting-methods',
    slug: 'metodi-di-budget',
    lang: 'it',
    title: 'Buste, foglio di calcolo o app: quale metodo di budget scegliere',
    description: 'Vantaggi e limiti di ogni modo di fare un budget e una semplice analisi SWOT per capire da dove iniziare a migliorare le tue finanze.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'Il metodo di budget migliore è quello che userai ancora fra sei mesi. Non ne esiste uno giusto per tutti: dipende da quanto tempo vuoi dedicarci, da come paghi e da quante persone condividono le spese.' },

      { type: 'h2', text: 'A mente' },
      { type: 'p', text: 'Sai più o meno quanto hai e quanto puoi spendere. Funziona con un reddito basso e poche spese, ma crolla alla prima settimana intensa: nessuno ricorda tutto, e le piccole spese sono le prime a sfuggire.' },

      { type: 'h2', text: 'Buste' },
      { type: 'p', text: 'Dividi i soldi del mese in buste, una per categoria: cibo, trasporti, tempo libero. Quando una busta è vuota, è finita. È molto visivo e frena gli eccessi, ma è poco pratico con carte e pagamenti online. La versione digitale dello stesso principio sono conti o categorie con un limite fisso.' },

      { type: 'h2', text: 'Quaderno' },
      { type: 'p', text: 'Una colonna per il previsto e una per il reale, per categoria e per mese. Semplice ed economico, e il solo fatto di scrivere ti rende più consapevole. I punti deboli sono i calcoli a mano e il fatto che il quaderno non è sempre con te.' },

      { type: 'h2', text: 'Foglio di calcolo' },
      { type: 'p', text: 'Completamente personalizzabile, fa i conti da solo e crea grafici. Richiede un po\' di pratica e disciplina per inserire ogni movimento, di solito a fine giornata o settimana, quando è già tardi per ricordarsi tutto.' },

      { type: 'h2', text: 'App' },
      { type: 'p', text: 'È sempre in tasca, registra la spesa sul momento e fa conti e grafici al posto tuo. Confronta funzioni, costo e privacy prima di scegliere, e verifica di poter esportare i tuoi dati se un giorno vorrai cambiare.' },

      { type: 'h2', text: 'Prima di scegliere: un\'analisi SWOT delle tue finanze' },
      { type: 'p', text: 'Le aziende usano l\'analisi SWOT (punti di forza, punti deboli, opportunità e minacce) per pianificare. Funziona anche per le finanze personali. Prendi un foglio e compila i quattro riquadri:' },
      { type: 'ul', items: [
        'Punti di forza (interni): risparmi già ogni mese, non hai debiti sulla carta, il tuo lavoro è stabile.',
        'Punti deboli (interni): nessun fondo di emergenza, molte spese al ristorante, nessuna idea di quanto spendi al mese.',
        'Opportunità (esterne): straordinari o lavori da freelance, conti senza commissioni, un aumento previsto.',
        'Minacce (esterne): l\'affitto potrebbe salire, i prezzi aumentano, c\'è il rischio di riduzioni d\'orario al lavoro.',
      ] },
      { type: 'p', text: 'Poi scegli un\'azione per ogni riquadro: sfruttare un punto di forza, correggere un punto debole, cogliere un\'opportunità e proteggerti da una minaccia. Molto spesso il primo punto debole da correggere è "non so quanto spendo", ed è lì che entra in gioco il metodo di budget.' },

      { type: 'h2', text: 'Su FinanceFlow' },
      { type: 'p', text: 'Se scegli un\'app, FinanceFlow funziona nel browser e su Android, in sei lingue. Con il piano gratuito registri entrate e spese per categoria e vedi il riepilogo del mese. Nei piani a pagamento i gruppi funzionano come buste digitali, con un limite mensile o settimanale e un avviso quando ti avvicini. Puoi anche fotografare gli scontrini per non dover scrivere nulla ed esportare tutto in CSV.' },
    ],
  },
]
