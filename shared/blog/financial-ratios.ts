import type { BlogPost } from './index'

// Cinco indicadores da saúde financeira pessoal, com um exemplo calculado.
export const financialRatiosPosts: BlogPost[] = [
  {
    key: 'financial-ratios',
    slug: 'indicadores-de-saude-financeira',
    lang: 'pt',
    title: '5 indicadores para medir a tua saúde financeira',
    description: 'Endividamento, liquidez, meses de reserva, peso das prestações e taxa de poupança: como calcular cada um e que valores procurar.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'Sentir que "o dinheiro não chega" não diz onde está o problema. Cinco divisões simples dizem. Para as fazeres precisas de quatro números: o que tens, o que deves, quanto ganhas e quanto gastas por mês.' },
      { type: 'tip', text: 'Vamos usar sempre o mesmo exemplo: 50 000 € de ativos (incluindo 3000 € em contas), 15 000 € de dívidas (750 € a pagar nos próximos meses), 2000 € de salário bruto e 1500 € líquido, 1500 € de despesas mensais, 180 € de prestações de crédito (sem contar a casa) e 150 € poupados por mês.' },

      { type: 'h2', text: '1. Rácio de endividamento' },
      { type: 'p', text: 'Dívidas a dividir por ativos. No exemplo, 15 000 / 50 000 = 0,30: por cada euro que tens, deves 30 cêntimos. Quanto mais baixo, melhor. Um valor que sobe de ano para ano é sinal de alerta.' },

      { type: 'h2', text: '2. Rácio de liquidez imediata' },
      { type: 'p', text: 'Dinheiro disponível a dividir pelas dívidas de curto prazo. No exemplo, 3000 / 750 = 4: tens 4 € disponíveis por cada euro que vence em breve. Abaixo de 1, não consegues pagar o que vence sem vender algo ou pedir crédito.' },

      { type: 'h2', text: '3. Meses de reserva' },
      { type: 'p', text: 'Dinheiro disponível a dividir pelas despesas mensais. No exemplo, 3000 / 1500 = 2 meses. É quanto tempo aguentarias sem rendimento. A referência habitual é de três a seis meses, por isso este exemplo ainda tem trabalho pela frente.' },

      { type: 'h2', text: '4. Peso das prestações' },
      { type: 'p', text: 'Prestações de crédito (sem contar a casa) a dividir pelo rendimento líquido. No exemplo, 180 / 1500 = 12 %. Uma referência comum é ficar abaixo de 20 %. Para o crédito à habitação, os bancos aplicam os seus próprios critérios de taxa de esforço, que incluem todas as prestações.' },

      { type: 'h2', text: '5. Taxa de poupança' },
      { type: 'p', text: 'Valor poupado por mês a dividir pelo rendimento bruto. No exemplo, 150 / 2000 = 7,5 %. Poupar entre 5 % e 10 % é um bom começo, e mais é melhor. Se este número for zero, é por aqui que deves começar.' },

      { type: 'h2', text: 'Como usar estes números' },
      { type: 'ul', items: [
        'Calcula-os duas vezes por ano e compara com a última vez: a direção importa mais do que o valor.',
        'Escolhe um indicador para melhorar de cada vez. No exemplo, seria aumentar a reserva até três meses.',
        'Lembra-te de que são referências, não regras. A tua situação, a estabilidade do emprego e a família contam.',
      ] },
      { type: 'p', text: 'A parte mais difícil é saber quanto gastas por mês. No FinanceFlow, o plano gratuito já mostra as despesas do mês por categoria. Nos planos pagos tens estatísticas avançadas, com totais por período, e podes exportar as transações para CSV e fazer estas contas numa folha de cálculo.' },
    ],
  },
  {
    key: 'financial-ratios',
    slug: 'financial-health-ratios',
    lang: 'en',
    title: '5 ratios to measure your financial health',
    description: 'Debt, liquidity, months of reserves, loan payments and savings rate: how to work out each ratio and what values to aim for.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'Feeling that "the money never stretches" doesn\'t tell you where the problem is. Five simple divisions do. You need four figures: what you own, what you owe, what you earn and what you spend each month.' },
      { type: 'tip', text: 'We\'ll use the same example throughout: €50,000 of assets (including €3,000 in accounts), €15,000 of debt (€750 due in the coming months), €2,000 gross and €1,500 take-home pay, €1,500 of monthly expenses, €180 of loan payments (not counting the mortgage) and €150 saved each month.' },

      { type: 'h2', text: '1. Debt ratio' },
      { type: 'p', text: 'Debts divided by assets. In the example, 15,000 / 50,000 = 0.30: for every euro you own, you owe 30 cents. Lower is better. A figure that rises year after year is a warning sign.' },

      { type: 'h2', text: '2. Current ratio' },
      { type: 'p', text: 'Available cash divided by short-term debts. In the example, 3,000 / 750 = 4: you have €4 available for every euro falling due soon. Below 1, you can\'t pay what is due without selling something or borrowing.' },

      { type: 'h2', text: '3. Months of reserves' },
      { type: 'p', text: 'Available cash divided by monthly expenses. In the example, 3,000 / 1,500 = 2 months. That is how long you could last without income. The usual guideline is three to six months, so this example still has some way to go.' },

      { type: 'h2', text: '4. Debt payments ratio' },
      { type: 'p', text: 'Loan payments (not counting the mortgage) divided by take-home pay. In the example, 180 / 1,500 = 12%. A common guideline is to stay below 20%. For mortgages, banks apply their own affordability criteria, which include all repayments.' },

      { type: 'h2', text: '5. Savings rate' },
      { type: 'p', text: 'Monthly savings divided by gross income. In the example, 150 / 2,000 = 7.5%. Saving 5% to 10% is a good start, and more is better. If this figure is zero, this is where to begin.' },

      { type: 'h2', text: 'How to use these numbers' },
      { type: 'ul', items: [
        'Work them out twice a year and compare with last time: the direction matters more than the value.',
        'Pick one ratio to improve at a time. In the example, it would be building reserves to three months.',
        'Remember they are guidelines, not rules. Your situation, job stability and family all matter.',
      ] },
      { type: 'p', text: 'The hardest part is knowing what you spend each month. In FinanceFlow, the free plan already shows the month\'s expenses by category. Paid plans add advanced statistics with totals by period, and let you export your transactions to CSV to do these calculations in a spreadsheet.' },
    ],
  },
  {
    key: 'financial-ratios',
    slug: 'indicadores-de-salud-financiera',
    lang: 'es',
    title: '5 indicadores para medir tu salud financiera',
    description: 'Endeudamiento, liquidez, meses de reserva, peso de las cuotas y tasa de ahorro: cómo calcular cada uno y qué valores buscar.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'Sentir que "el dinero no llega" no dice dónde está el problema. Cinco divisiones sencillas sí. Para hacerlas necesitas cuatro cifras: lo que tienes, lo que debes, lo que ganas y lo que gastas al mes.' },
      { type: 'tip', text: 'Usaremos siempre el mismo ejemplo: 50 000 € de activos (de ellos 3000 € en cuentas), 15 000 € de deudas (750 € a pagar en los próximos meses), 2000 € de sueldo bruto y 1500 € neto, 1500 € de gastos mensuales, 180 € de cuotas de préstamos (sin contar la hipoteca) y 150 € ahorrados al mes.' },

      { type: 'h2', text: '1. Ratio de endeudamiento' },
      { type: 'p', text: 'Deudas entre activos. En el ejemplo, 15 000 / 50 000 = 0,30: por cada euro que tienes, debes 30 céntimos. Cuanto más bajo, mejor. Un valor que sube año tras año es una señal de alerta.' },

      { type: 'h2', text: '2. Ratio de liquidez inmediata' },
      { type: 'p', text: 'Dinero disponible entre deudas a corto plazo. En el ejemplo, 3000 / 750 = 4: tienes 4 € disponibles por cada euro que vence pronto. Por debajo de 1, no puedes pagar lo que vence sin vender algo o pedir prestado.' },

      { type: 'h2', text: '3. Meses de reserva' },
      { type: 'p', text: 'Dinero disponible entre gastos mensuales. En el ejemplo, 3000 / 1500 = 2 meses. Es el tiempo que aguantarías sin ingresos. La referencia habitual es de tres a seis meses, así que este ejemplo aún tiene camino por delante.' },

      { type: 'h2', text: '4. Peso de las cuotas' },
      { type: 'p', text: 'Cuotas de préstamos (sin contar la hipoteca) entre ingresos netos. En el ejemplo, 180 / 1500 = 12 %. Una referencia común es quedarse por debajo del 20 %. Para la hipoteca, los bancos aplican sus propios criterios de endeudamiento, que incluyen todas las cuotas.' },

      { type: 'h2', text: '5. Tasa de ahorro' },
      { type: 'p', text: 'Ahorro mensual entre ingresos brutos. En el ejemplo, 150 / 2000 = 7,5 %. Ahorrar entre el 5 % y el 10 % es un buen comienzo, y más es mejor. Si esta cifra es cero, es por aquí por donde debes empezar.' },

      { type: 'h2', text: 'Cómo usar estas cifras' },
      { type: 'ul', items: [
        'Calcúlalas dos veces al año y compáralas con la última vez: la dirección importa más que el valor.',
        'Elige un indicador para mejorar cada vez. En el ejemplo, sería subir la reserva hasta tres meses.',
        'Recuerda que son referencias, no reglas. Tu situación, la estabilidad del empleo y la familia cuentan.',
      ] },
      { type: 'p', text: 'Lo más difícil es saber cuánto gastas al mes. En FinanceFlow, el plan gratuito ya muestra los gastos del mes por categoría. Los planes de pago añaden estadísticas avanzadas con totales por periodo y te permiten exportar las transacciones a CSV para hacer estas cuentas en una hoja de cálculo.' },
    ],
  },
  {
    key: 'financial-ratios',
    slug: 'indicateurs-de-sante-financiere',
    lang: 'fr',
    title: '5 indicateurs pour mesurer votre santé financière',
    description: 'Endettement, liquidité, mois de réserve, poids des mensualités et taux d\'épargne : comment calculer chaque indicateur et quelles valeurs viser.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'Avoir l\'impression que « l\'argent ne suffit pas » ne dit pas où se trouve le problème. Cinq divisions simples, si. Il vous faut quatre chiffres : ce que vous possédez, ce que vous devez, ce que vous gagnez et ce que vous dépensez chaque mois.' },
      { type: 'tip', text: 'Nous utiliserons toujours le même exemple : 50 000 € d\'actifs (dont 3 000 € sur des comptes), 15 000 € de dettes (dont 750 € à payer dans les prochains mois), 2 000 € de salaire brut et 1 500 € net, 1 500 € de dépenses mensuelles, 180 € de mensualités de crédit (hors logement) et 150 € épargnés par mois.' },

      { type: 'h2', text: '1. Taux d\'endettement global' },
      { type: 'p', text: 'Dettes divisées par actifs. Dans l\'exemple, 15 000 / 50 000 = 0,30 : pour chaque euro possédé, vous devez 30 centimes. Plus c\'est bas, mieux c\'est. Un chiffre qui augmente d\'année en année est un signal d\'alerte.' },

      { type: 'h2', text: '2. Ratio de liquidité immédiate' },
      { type: 'p', text: 'Argent disponible divisé par les dettes à court terme. Dans l\'exemple, 3 000 / 750 = 4 : vous disposez de 4 € pour chaque euro bientôt exigible. En dessous de 1, vous ne pouvez pas payer ce qui arrive à échéance sans vendre quelque chose ou emprunter.' },

      { type: 'h2', text: '3. Mois de réserve' },
      { type: 'p', text: 'Argent disponible divisé par les dépenses mensuelles. Dans l\'exemple, 3 000 / 1 500 = 2 mois. C\'est le temps que vous tiendriez sans revenus. La référence habituelle est de trois à six mois : cet exemple a donc encore du chemin à faire.' },

      { type: 'h2', text: '4. Poids des mensualités' },
      { type: 'p', text: 'Mensualités de crédit (hors logement) divisées par le revenu net. Dans l\'exemple, 180 / 1 500 = 12 %. Une référence courante consiste à rester sous 20 %. Pour un crédit immobilier, les banques appliquent leurs propres critères de taux d\'effort, qui incluent toutes les mensualités.' },

      { type: 'h2', text: '5. Taux d\'épargne' },
      { type: 'p', text: 'Épargne mensuelle divisée par le revenu brut. Dans l\'exemple, 150 / 2 000 = 7,5 %. Épargner entre 5 % et 10 % est un bon début, et davantage, c\'est mieux. Si ce chiffre est à zéro, c\'est par là qu\'il faut commencer.' },

      { type: 'h2', text: 'Comment utiliser ces chiffres' },
      { type: 'ul', items: [
        'Calculez-les deux fois par an et comparez avec la fois précédente : la direction compte plus que la valeur.',
        'Choisissez un seul indicateur à améliorer à la fois. Dans l\'exemple, ce serait porter la réserve à trois mois.',
        'Gardez en tête que ce sont des repères, pas des règles. Votre situation, la stabilité de votre emploi et votre famille comptent.',
      ] },
      { type: 'p', text: 'Le plus difficile est de savoir combien vous dépensez chaque mois. Dans FinanceFlow, la formule gratuite affiche déjà les dépenses du mois par catégorie. Les formules payantes ajoutent des statistiques avancées avec des totaux par période et permettent d\'exporter vos transactions en CSV pour faire ces calculs dans un tableur.' },
    ],
  },
  {
    key: 'financial-ratios',
    slug: 'finanzkennzahlen',
    lang: 'de',
    title: '5 Kennzahlen, die deine finanzielle Gesundheit messen',
    description: 'Verschuldung, Liquidität, Monate an Reserve, Kreditraten und Sparquote: wie du jede Kennzahl berechnest und welche Werte du anstreben solltest.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'Das Gefühl, dass „“, verrät nicht, wo das Problem liegt. Fünf einfache Divisionen schon. Du brauchst dafür vier Zahlen: was du besitzt, was du schuldest, was du verdienst und was du im Monat ausgibst.' },
      { type: 'tip', text: 'Wir nutzen durchgehend dasselbe Beispiel: 50.000 € Vermögen (davon 3.000 € auf Konten), 15.000 € Schulden (davon 750 € in den nächsten Monaten fällig), 2.000 € brutto und 1.500 € netto, 1.500 € monatliche Ausgaben, 180 € Kreditraten (ohne Baufinanzierung) und 150 € Sparbetrag pro Monat.' },

      { type: 'h2', text: '1. Verschuldungsquote' },
      { type: 'p', text: 'Schulden geteilt durch Vermögen. Im Beispiel 15.000 / 50.000 = 0,30: Für jeden Euro, den du besitzt, schuldest du 30 Cent. Je niedriger, desto besser. Ein Wert, der Jahr für Jahr steigt, ist ein Warnsignal.' },

      { type: 'h2', text: '2. Liquiditätsgrad' },
      { type: 'p', text: 'Verfügbares Geld geteilt durch kurzfristige Schulden. Im Beispiel 3.000 / 750 = 4: Für jeden bald fälligen Euro hast du 4 € verfügbar. Unter 1 kannst du das Fällige nicht bezahlen, ohne etwas zu verkaufen oder dir Geld zu leihen.' },

      { type: 'h2', text: '3. Monate an Reserve' },
      { type: 'p', text: 'Verfügbares Geld geteilt durch die monatlichen Ausgaben. Im Beispiel 3.000 / 1.500 = 2 Monate. So lange kämst du ohne Einkommen aus. Üblich sind drei bis sechs Monate, das Beispiel hat also noch etwas vor sich.' },

      { type: 'h2', text: '4. Anteil der Kreditraten' },
      { type: 'p', text: 'Kreditraten (ohne Baufinanzierung) geteilt durch das Nettoeinkommen. Im Beispiel 180 / 1.500 = 12 %. Eine gängige Faustregel ist, unter 20 % zu bleiben. Bei Baufinanzierungen wenden Banken ihre eigenen Kriterien für die Belastungsquote an, die alle Raten einschließen.' },

      { type: 'h2', text: '5. Sparquote' },
      { type: 'p', text: 'Monatlicher Sparbetrag geteilt durch das Bruttoeinkommen. Im Beispiel 150 / 2.000 = 7,5 %. 5 bis 10 % zu sparen ist ein guter Anfang, mehr ist besser. Liegt dieser Wert bei null, solltest du hier anfangen.' },

      { type: 'h2', text: 'So nutzt du diese Zahlen' },
      { type: 'ul', items: [
        'Berechne sie zweimal im Jahr und vergleiche mit dem letzten Mal: Die Richtung zählt mehr als der Wert.',
        'Nimm dir immer nur eine Kennzahl vor. Im Beispiel wäre das, die Reserve auf drei Monate aufzustocken.',
        'Denk daran, dass es Richtwerte sind, keine Regeln. Deine Lage, die Sicherheit deines Jobs und deine Familie zählen mit.',
      ] },
      { type: 'p', text: 'Am schwierigsten ist es zu wissen, wie viel du im Monat ausgibst. In FinanceFlow zeigt schon der kostenlose Tarif die Ausgaben des Monats nach Kategorie. Die bezahlten Tarife bieten erweiterte Statistiken mit Summen pro Zeitraum und den CSV-Export deiner Buchungen, damit du diese Rechnungen in einer Tabelle machen kannst.' },
    ],
  },
  {
    key: 'financial-ratios',
    slug: 'indicatori-di-salute-finanziaria',
    lang: 'it',
    title: '5 indicatori per misurare la tua salute finanziaria',
    description: 'Indebitamento, liquidità, mesi di riserva, peso delle rate e tasso di risparmio: come calcolare ciascun indicatore e quali valori puntare.',
    published: '2026-10-24',
    blocks: [
      { type: 'p', text: 'Sentire che "i soldi non bastano mai" non dice dov\'è il problema. Cinque semplici divisioni sì. Ti servono quattro numeri: ciò che possiedi, ciò che devi, quanto guadagni e quanto spendi al mese.' },
      { type: 'tip', text: 'Useremo sempre lo stesso esempio: 50 000 € di attività (di cui 3000 € sui conti), 15 000 € di debiti (di cui 750 € da pagare nei prossimi mesi), 2000 € di stipendio lordo e 1500 € netto, 1500 € di spese mensili, 180 € di rate di prestiti (escluso il mutuo) e 150 € risparmiati al mese.' },

      { type: 'h2', text: '1. Rapporto di indebitamento' },
      { type: 'p', text: 'Debiti diviso attività. Nell\'esempio, 15 000 / 50 000 = 0,30: per ogni euro che possiedi, ne devi 30 centesimi. Più è basso, meglio è. Un valore che sale di anno in anno è un campanello d\'allarme.' },

      { type: 'h2', text: '2. Indice di liquidità immediata' },
      { type: 'p', text: 'Denaro disponibile diviso debiti a breve termine. Nell\'esempio, 3000 / 750 = 4: hai 4 € disponibili per ogni euro in scadenza a breve. Sotto 1 non riesci a pagare ciò che scade senza vendere qualcosa o chiedere un prestito.' },

      { type: 'h2', text: '3. Mesi di riserva' },
      { type: 'p', text: 'Denaro disponibile diviso spese mensili. Nell\'esempio, 3000 / 1500 = 2 mesi. È il tempo che resisteresti senza reddito. Il riferimento abituale è da tre a sei mesi, quindi l\'esempio ha ancora strada da fare.' },

      { type: 'h2', text: '4. Peso delle rate' },
      { type: 'p', text: 'Rate dei prestiti (escluso il mutuo) diviso reddito netto. Nell\'esempio, 180 / 1500 = 12 %. Un riferimento comune è restare sotto il 20 %. Per il mutuo, le banche applicano i propri criteri sul rapporto rata/reddito, che includono tutte le rate.' },

      { type: 'h2', text: '5. Tasso di risparmio' },
      { type: 'p', text: 'Risparmio mensile diviso reddito lordo. Nell\'esempio, 150 / 2000 = 7,5 %. Risparmiare tra il 5 % e il 10 % è un buon inizio, e di più è meglio. Se questo numero è zero, è da qui che devi partire.' },

      { type: 'h2', text: 'Come usare questi numeri' },
      { type: 'ul', items: [
        'Calcolali due volte l\'anno e confrontali con l\'ultima volta: la direzione conta più del valore.',
        'Scegli un indicatore da migliorare alla volta. Nell\'esempio, sarebbe portare la riserva a tre mesi.',
        'Ricorda che sono riferimenti, non regole. La tua situazione, la stabilità del lavoro e la famiglia contano.',
      ] },
      { type: 'p', text: 'La parte più difficile è sapere quanto spendi al mese. In FinanceFlow il piano gratuito mostra già le spese del mese per categoria. I piani a pagamento aggiungono statistiche avanzate con i totali per periodo e l\'esportazione delle transazioni in CSV, per fare questi calcoli in un foglio di calcolo.' },
    ],
  },
]
