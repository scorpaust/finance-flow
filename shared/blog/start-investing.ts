import type { BlogPost } from './index'

// Começar a investir com pouco dinheiro: junta dois rascunhos da Holo que
// repetiam o mesmo tema. Corrigido: risco de perda explícito, sem "retornos
// garantidos", e a carteira é registo manual (Premium), sem preços automáticos.
export const startInvestingPosts: BlogPost[] = [
  {
    key: 'start-investing',
    slug: 'como-comecar-a-investir-com-pouco-dinheiro',
    lang: 'pt',
    title: 'Como começar a investir com pouco dinheiro: guia para iniciantes',
    description: 'O que arrumar antes do primeiro euro, como escolher produtos simples, quanto investir por mês e os erros mais comuns de quem está a começar.',
    published: '2026-11-03',
    blocks: [
      { type: 'p', text: 'Investir não está reservado a quem tem muito dinheiro. Muitas plataformas aceitam valores baixos, e o que mais pesa no início é ter a base arrumada, perceber o que estás a comprar e manter o hábito.' },
      { type: 'tip', text: 'Este artigo é informativo e não é aconselhamento financeiro. Investir tem risco: o valor pode descer e podes perder parte do que investiste.' },

      { type: 'h2', text: 'Antes de investir: arruma a base' },
      { type: 'ul', items: [
        'Cria um fundo de emergência: o habitual é guardar três a seis meses de despesas essenciais, num sítio de onde o consigas levantar depressa.',
        'Trata das dívidas caras: os juros de um cartão de crédito ou de um crédito ao consumo são muitas vezes superiores ao que um investimento pode render.',
        'Conhece o teu orçamento: regista o que entra e sai durante um mês para saberes quanto podes investir sem apertar.',
        'Investe só dinheiro de que não vais precisar a curto prazo, para não seres obrigado a vender na pior altura.',
      ] },

      { type: 'h2', text: '1. Define para que estás a investir' },
      { type: 'p', text: 'A entrada de uma casa daqui a cinco anos e a reforma daqui a trinta pedem escolhas diferentes. Quanto mais perto precisares do dinheiro, menos oscilações podes aceitar. Um objetivo claro também te ajuda a não mexer no dinheiro ao primeiro susto.' },

      { type: 'h2', text: '2. Escolhe produtos simples e diversificados' },
      { type: 'p', text: 'Para quem começa, simplicidade é uma vantagem. Se não consegues explicar em duas frases onde estás a investir e que riscos corres, ainda não é o produto certo para ti. Os fundos e ETF diversificados repartem o dinheiro por muitas empresas, em vez de dependerem de uma só. A diversificação reduz o risco, mas não o elimina nem garante lucro.' },
      { type: 'p', text: 'Confirma também as comissões, porque pequenas diferenças pesam ao longo de muitos anos, e como são tributados os ganhos no teu caso. Em Portugal, podes verificar na CMVM e no Banco de Portugal se a entidade está autorizada a operar.' },

      { type: 'h2', text: '3. Investe com regularidade' },
      { type: 'p', text: 'Em vez de tentares adivinhar o melhor momento, investe o mesmo valor todos os meses. Compras mais unidades quando os preços estão baixos e menos quando estão altos, o que suaviza as oscilações, embora não evite perdas. Decide o valor e a data, e assim tiras a pressão de escolher quando comprar.' },
      { type: 'tip', text: 'Exemplo: 50 € por mês durante dez anos são 6000 € investidos, antes de ganhos, perdas, comissões e impostos. Podes começar com menos e aumentar o valor quando o teu orçamento permitir.' },

      { type: 'h2', text: 'Erros comuns de quem está a começar' },
      { type: 'ul', items: [
        'Esperar pelo momento perfeito e nunca começar.',
        'Investir dinheiro que faz falta no dia a dia.',
        'Mudar de estratégia a cada subida ou descida do mercado.',
        'Comprar por recomendação de terceiros algo que não percebes.',
        'Ignorar as comissões e os impostos.',
      ] },

      { type: 'h2', text: 'Como acompanhar o que investes' },
      { type: 'p', text: 'Um registo simples chega para saberes quanto investiste, quanto vale hoje e se o plano continua a fazer sentido. Pode ser uma folha de cálculo, desde que a mantenhas atualizada.' },
      { type: 'p', text: 'O FinanceFlow ajuda nas duas partes. No plano gratuito, registas receitas e despesas e vês quanto te sobra por mês. No plano Premium, registas cada investimento (valor inicial, reforços e situação atual), vês a rentabilidade por posição e no total e recebes dicas educativas adaptadas ao teu perfil de risco. Os valores são atualizados por ti, e a app não compra nem vende investimentos.' },
    ],
  },
  {
    key: 'start-investing',
    slug: 'how-to-start-investing-with-little-money',
    lang: 'en',
    title: 'How to start investing with little money: a beginner\'s guide',
    description: 'What to sort out before your first euro, how to choose simple products, how much to invest each month and the most common beginner mistakes.',
    published: '2026-11-03',
    blocks: [
      { type: 'p', text: 'Investing is not reserved for people with a lot of money. Many platforms accept small amounts, and what matters most at the start is having your basics in order, understanding what you are buying and keeping up the habit.' },
      { type: 'tip', text: 'This article is for information only and is not financial advice. Investing carries risk: values can fall and you may lose part of what you invest.' },

      { type: 'h2', text: 'Before you invest: sort out the basics' },
      { type: 'ul', items: [
        'Build an emergency fund: the usual target is three to six months of essential expenses, somewhere you can withdraw it quickly.',
        'Deal with expensive debt: interest on a credit card or consumer loan is often higher than what an investment may earn.',
        'Know your budget: track what comes in and goes out for a month, so you know how much you can invest without strain.',
        'Only invest money you will not need in the short term, so you are not forced to sell at the worst moment.',
      ] },

      { type: 'h2', text: '1. Decide what you are investing for' },
      { type: 'p', text: 'A house deposit in five years and retirement in thirty call for different choices. The sooner you need the money, the less fluctuation you can accept. A clear goal also helps you leave the money alone at the first scare.' },

      { type: 'h2', text: '2. Choose simple, diversified products' },
      { type: 'p', text: 'For a beginner, simplicity is an advantage. If you cannot explain in two sentences where you are investing and what the risks are, it is not the right product for you yet. Diversified funds and ETFs spread your money across many companies instead of relying on one. Diversification reduces risk, but it does not remove it or guarantee a profit.' },
      { type: 'p', text: 'Check the fees too, since small differences add up over many years, and how gains are taxed in your case. Your national financial regulator can usually confirm whether a provider is authorised to operate.' },

      { type: 'h2', text: '3. Invest regularly' },
      { type: 'p', text: 'Instead of trying to guess the best moment, invest the same amount every month. You buy more units when prices are low and fewer when they are high, which smooths out fluctuations, although it does not prevent losses. Decide the amount and the date, and the pressure of choosing when to buy goes away.' },
      { type: 'tip', text: 'Example: €50 a month for ten years is €6,000 invested, before gains, losses, fees and taxes. You can start with less and raise the amount when your budget allows.' },

      { type: 'h2', text: 'Common beginner mistakes' },
      { type: 'ul', items: [
        'Waiting for the perfect moment and never starting.',
        'Investing money you need for day-to-day life.',
        'Changing strategy with every rise or fall in the market.',
        'Buying something you do not understand because someone recommended it.',
        'Ignoring fees and taxes.',
      ] },

      { type: 'h2', text: 'How to keep track of your investments' },
      { type: 'p', text: 'A simple record is enough to know how much you invested, what it is worth today and whether the plan still makes sense. A spreadsheet will do, as long as you keep it up to date.' },
      { type: 'p', text: 'FinanceFlow helps with both sides. On the free plan, you log income and expenses and see how much is left each month. On the Premium plan, you record each investment (initial amount, top-ups and current value), see the return per position and overall, and get educational tips suited to your risk profile. You update the values yourself, and the app does not buy or sell investments.' },
    ],
  },
  {
    key: 'start-investing',
    slug: 'como-empezar-a-invertir-con-poco-dinero',
    lang: 'es',
    title: 'Cómo empezar a invertir con poco dinero: guía para principiantes',
    description: 'Qué ordenar antes del primer euro, cómo elegir productos sencillos, cuánto invertir al mes y los errores más comunes de quien está empezando.',
    published: '2026-11-03',
    blocks: [
      { type: 'p', text: 'Invertir no está reservado a quien tiene mucho dinero. Muchas plataformas aceptan importes bajos, y lo que más pesa al principio es tener la base en orden, entender lo que compras y mantener el hábito.' },
      { type: 'tip', text: 'Este artículo es informativo y no es asesoramiento financiero. Invertir tiene riesgo: el valor puede bajar y puedes perder parte de lo invertido.' },

      { type: 'h2', text: 'Antes de invertir: ordena la base' },
      { type: 'ul', items: [
        'Crea un fondo de emergencia: lo habitual es guardar de tres a seis meses de gastos esenciales, en un sitio del que puedas retirarlo rápido.',
        'Ocúpate de las deudas caras: los intereses de una tarjeta de crédito o de un préstamo al consumo suelen ser superiores a lo que puede rendir una inversión.',
        'Conoce tu presupuesto: registra lo que entra y sale durante un mes para saber cuánto puedes invertir sin apretarte.',
        'Invierte solo dinero que no vayas a necesitar a corto plazo, para no verte obligado a vender en el peor momento.',
      ] },

      { type: 'h2', text: '1. Define para qué inviertes' },
      { type: 'p', text: 'La entrada de una casa dentro de cinco años y la jubilación dentro de treinta piden decisiones distintas. Cuanto antes necesites el dinero, menos oscilaciones puedes aceptar. Un objetivo claro también te ayuda a no tocar el dinero al primer susto.' },

      { type: 'h2', text: '2. Elige productos sencillos y diversificados' },
      { type: 'p', text: 'Para quien empieza, la sencillez es una ventaja. Si no puedes explicar en dos frases dónde inviertes y qué riesgos corres, aún no es el producto adecuado para ti. Los fondos y ETF diversificados reparten el dinero entre muchas empresas en lugar de depender de una sola. La diversificación reduce el riesgo, pero no lo elimina ni garantiza beneficios.' },
      { type: 'p', text: 'Comprueba también las comisiones, porque las pequeñas diferencias pesan a lo largo de muchos años, y cómo tributan las ganancias en tu caso. El regulador financiero de tu país suele permitir confirmar si una entidad está autorizada a operar.' },

      { type: 'h2', text: '3. Invierte con regularidad' },
      { type: 'p', text: 'En lugar de intentar adivinar el mejor momento, invierte el mismo importe cada mes. Compras más participaciones cuando los precios están bajos y menos cuando están altos, lo que suaviza las oscilaciones, aunque no evita las pérdidas. Decide el importe y la fecha, y así te quitas la presión de elegir cuándo comprar.' },
      { type: 'tip', text: 'Ejemplo: 50 € al mes durante diez años son 6000 € invertidos, antes de ganancias, pérdidas, comisiones e impuestos. Puedes empezar con menos y aumentar el importe cuando tu presupuesto lo permita.' },

      { type: 'h2', text: 'Errores comunes de quien empieza' },
      { type: 'ul', items: [
        'Esperar el momento perfecto y no empezar nunca.',
        'Invertir dinero que hace falta en el día a día.',
        'Cambiar de estrategia con cada subida o bajada del mercado.',
        'Comprar por recomendación de otros algo que no entiendes.',
        'Ignorar las comisiones y los impuestos.',
      ] },

      { type: 'h2', text: 'Cómo seguir lo que inviertes' },
      { type: 'p', text: 'Un registro sencillo basta para saber cuánto has invertido, cuánto vale hoy y si el plan sigue teniendo sentido. Puede ser una hoja de cálculo, siempre que la mantengas al día.' },
      { type: 'p', text: 'FinanceFlow ayuda en las dos partes. En el plan gratuito, registras ingresos y gastos y ves cuánto te sobra al mes. En el plan Premium, registras cada inversión (importe inicial, aportaciones y situación actual), ves la rentabilidad por posición y en total y recibes consejos educativos adaptados a tu perfil de riesgo. Los valores los actualizas tú, y la app no compra ni vende inversiones.' },
    ],
  },
  {
    key: 'start-investing',
    slug: 'comment-commencer-a-investir-avec-peu-d-argent',
    lang: 'fr',
    title: 'Comment commencer à investir avec peu d\'argent : guide débutant',
    description: 'Ce qu\'il faut régler avant le premier euro, comment choisir des produits simples, combien investir par mois et les erreurs courantes des débutants.',
    published: '2026-11-03',
    blocks: [
      { type: 'p', text: 'Investir n\'est pas réservé à ceux qui ont beaucoup d\'argent. De nombreuses plateformes acceptent de petits montants, et ce qui compte le plus au début, c\'est d\'avoir des bases saines, de comprendre ce que vous achetez et de garder l\'habitude.' },
      { type: 'tip', text: 'Cet article est informatif et ne constitue pas un conseil financier. Investir comporte des risques : la valeur peut baisser et vous pouvez perdre une partie de ce que vous avez investi.' },

      { type: 'h2', text: 'Avant d\'investir : assainissez vos bases' },
      { type: 'ul', items: [
        'Constituez une épargne de précaution : l\'objectif habituel est de trois à six mois de dépenses essentielles, disponibles rapidement.',
        'Réglez les dettes coûteuses : les intérêts d\'une carte de crédit ou d\'un crédit à la consommation dépassent souvent ce qu\'un investissement peut rapporter.',
        'Connaissez votre budget : notez ce qui entre et sort pendant un mois pour savoir combien vous pouvez investir sans vous serrer.',
        'N\'investissez que l\'argent dont vous n\'aurez pas besoin à court terme, pour ne pas être obligé de vendre au pire moment.',
      ] },

      { type: 'h2', text: '1. Définissez pourquoi vous investissez' },
      { type: 'p', text: 'L\'apport pour un logement dans cinq ans et la retraite dans trente ans demandent des choix différents. Plus vous aurez besoin de l\'argent tôt, moins vous pouvez accepter de fluctuations. Un objectif clair vous aide aussi à ne pas toucher à l\'argent à la première frayeur.' },

      { type: 'h2', text: '2. Choisissez des produits simples et diversifiés' },
      { type: 'p', text: 'Pour un débutant, la simplicité est un avantage. Si vous ne pouvez pas expliquer en deux phrases où vous investissez et quels risques vous prenez, ce n\'est pas encore le bon produit pour vous. Les fonds et ETF diversifiés répartissent l\'argent entre de nombreuses entreprises au lieu de dépendre d\'une seule. La diversification réduit le risque, mais elle ne le supprime pas et ne garantit aucun gain.' },
      { type: 'p', text: 'Vérifiez aussi les frais, car de petites différences pèsent sur de nombreuses années, et la façon dont les gains sont imposés dans votre cas. Le régulateur financier de votre pays permet généralement de vérifier si un établissement est autorisé à opérer.' },

      { type: 'h2', text: '3. Investissez régulièrement' },
      { type: 'p', text: 'Au lieu d\'essayer de deviner le meilleur moment, investissez le même montant chaque mois. Vous achetez plus de parts quand les prix sont bas et moins quand ils sont hauts, ce qui lisse les fluctuations, sans pour autant éviter les pertes. Fixez le montant et la date, et la pression de choisir quand acheter disparaît.' },
      { type: 'tip', text: 'Exemple : 50 € par mois pendant dix ans font 6000 € investis, avant gains, pertes, frais et impôts. Vous pouvez commencer avec moins et augmenter le montant quand votre budget le permet.' },

      { type: 'h2', text: 'Erreurs courantes des débutants' },
      { type: 'ul', items: [
        'Attendre le moment parfait et ne jamais commencer.',
        'Investir de l\'argent nécessaire au quotidien.',
        'Changer de stratégie à chaque hausse ou baisse du marché.',
        'Acheter sur recommandation un produit que vous ne comprenez pas.',
        'Ignorer les frais et les impôts.',
      ] },

      { type: 'h2', text: 'Comment suivre vos investissements' },
      { type: 'p', text: 'Un suivi simple suffit pour savoir combien vous avez investi, ce que cela vaut aujourd\'hui et si le plan a toujours du sens. Un tableur convient, à condition de le tenir à jour.' },
      { type: 'p', text: 'FinanceFlow aide sur les deux plans. Avec le plan gratuit, vous saisissez revenus et dépenses et vous voyez ce qu\'il vous reste chaque mois. Avec le plan Premium, vous enregistrez chaque investissement (montant initial, versements et situation actuelle), vous voyez le rendement par position et au total et vous recevez des conseils éducatifs adaptés à votre profil de risque. C\'est vous qui mettez à jour les valeurs, et l\'application n\'achète ni ne vend d\'investissements.' },
    ],
  },
  {
    key: 'start-investing',
    slug: 'mit-wenig-geld-anfangen-zu-investieren',
    lang: 'de',
    title: 'Mit wenig Geld anfangen zu investieren: Leitfaden für Einsteiger',
    description: 'Was du vor dem ersten Euro klären solltest, wie du einfache Produkte wählst, wie viel du monatlich investierst und welche Anfängerfehler häufig sind.',
    published: '2026-11-03',
    blocks: [
      { type: 'p', text: 'Investieren ist nicht nur etwas für Menschen mit viel Geld. Viele Plattformen akzeptieren kleine Beträge, und am Anfang zählt vor allem, dass deine Basis stimmt, du verstehst, was du kaufst, und die Gewohnheit beibehältst.' },
      { type: 'tip', text: 'Dieser Artikel dient der Information und ist keine Finanzberatung. Investieren ist mit Risiken verbunden: Der Wert kann fallen, und du kannst einen Teil des investierten Geldes verlieren.' },

      { type: 'h2', text: 'Vor dem Investieren: Bring die Basis in Ordnung' },
      { type: 'ul', items: [
        'Lege einen Notgroschen an: Üblich sind drei bis sechs Monate an notwendigen Ausgaben, schnell verfügbar.',
        'Kümmere dich um teure Schulden: Die Zinsen einer Kreditkarte oder eines Konsumkredits liegen oft über dem, was eine Anlage einbringen kann.',
        'Kenne dein Budget: Erfasse einen Monat lang Einnahmen und Ausgaben, damit du weißt, wie viel du ohne Druck investieren kannst.',
        'Investiere nur Geld, das du kurzfristig nicht brauchst, damit du nicht im schlechtesten Moment verkaufen musst.',
      ] },

      { type: 'h2', text: '1. Lege fest, wofür du investierst' },
      { type: 'p', text: 'Das Eigenkapital für eine Wohnung in fünf Jahren und die Rente in dreißig Jahren verlangen unterschiedliche Entscheidungen. Je früher du das Geld brauchst, desto weniger Schwankungen kannst du hinnehmen. Ein klares Ziel hilft dir auch, das Geld beim ersten Schreck nicht anzurühren.' },

      { type: 'h2', text: '2. Wähle einfache, breit gestreute Produkte' },
      { type: 'p', text: 'Für Einsteiger ist Einfachheit ein Vorteil. Wenn du nicht in zwei Sätzen erklären kannst, worin du investierst und welche Risiken du eingehst, ist es noch nicht das richtige Produkt für dich. Breit gestreute Fonds und ETFs verteilen das Geld auf viele Unternehmen, statt von einem einzigen abzuhängen. Streuung verringert das Risiko, beseitigt es aber nicht und garantiert keinen Gewinn.' },
      { type: 'p', text: 'Prüfe auch die Gebühren, denn kleine Unterschiede wirken sich über viele Jahre aus, und wie Gewinne in deinem Fall besteuert werden. Bei der Finanzaufsicht deines Landes kannst du in der Regel prüfen, ob ein Anbieter zugelassen ist.' },

      { type: 'h2', text: '3. Investiere regelmäßig' },
      { type: 'p', text: 'Statt den besten Moment erraten zu wollen, investiere jeden Monat denselben Betrag. Du kaufst mehr Anteile, wenn die Kurse niedrig sind, und weniger, wenn sie hoch sind. Das glättet Schwankungen, verhindert aber keine Verluste. Lege Betrag und Datum fest, dann entfällt der Druck, den Kaufzeitpunkt zu wählen.' },
      { type: 'tip', text: 'Beispiel: 50 € im Monat über zehn Jahre sind 6000 € investiert, vor Gewinnen, Verlusten, Gebühren und Steuern. Du kannst mit weniger anfangen und den Betrag erhöhen, wenn dein Budget es erlaubt.' },

      { type: 'h2', text: 'Häufige Anfängerfehler' },
      { type: 'ul', items: [
        'Auf den perfekten Moment warten und nie anfangen.',
        'Geld investieren, das im Alltag gebraucht wird.',
        'Bei jedem Marktanstieg oder -rückgang die Strategie ändern.',
        'Auf Empfehlung etwas kaufen, das du nicht verstehst.',
        'Gebühren und Steuern ignorieren.',
      ] },

      { type: 'h2', text: 'So behältst du deine Anlagen im Blick' },
      { type: 'p', text: 'Eine einfache Übersicht reicht, um zu wissen, wie viel du investiert hast, was es heute wert ist und ob der Plan noch sinnvoll ist. Eine Tabelle genügt, solange du sie aktuell hältst.' },
      { type: 'p', text: 'FinanceFlow hilft bei beidem. Im kostenlosen Plan erfasst du Einnahmen und Ausgaben und siehst, wie viel dir pro Monat bleibt. Im Premium-Plan erfasst du jede Anlage (Anfangsbetrag, Aufstockungen und aktueller Wert), siehst die Rendite pro Position und insgesamt und erhältst Lerntipps passend zu deinem Risikoprofil. Die Werte aktualisierst du selbst, und die App kauft oder verkauft keine Anlagen.' },
    ],
  },
  {
    key: 'start-investing',
    slug: 'come-iniziare-a-investire-con-pochi-soldi',
    lang: 'it',
    title: 'Come iniziare a investire con pochi soldi: guida per principianti',
    description: 'Cosa sistemare prima del primo euro, come scegliere prodotti semplici, quanto investire al mese e gli errori più comuni di chi sta iniziando.',
    published: '2026-11-03',
    blocks: [
      { type: 'p', text: 'Investire non è riservato a chi ha molti soldi. Molte piattaforme accettano piccole somme, e all\'inizio ciò che conta di più è avere le basi in ordine, capire cosa stai comprando e mantenere l\'abitudine.' },
      { type: 'tip', text: 'Questo articolo è informativo e non costituisce consulenza finanziaria. Investire comporta rischi: il valore può scendere e puoi perdere parte di quanto hai investito.' },

      { type: 'h2', text: 'Prima di investire: sistema le basi' },
      { type: 'ul', items: [
        'Crea un fondo di emergenza: di solito si mettono da parte da tre a sei mesi di spese essenziali, in un posto da cui puoi prelevarli in fretta.',
        'Occupati dei debiti costosi: gli interessi di una carta di credito o di un prestito al consumo sono spesso superiori a quanto può rendere un investimento.',
        'Conosci il tuo budget: registra per un mese ciò che entra ed esce per sapere quanto puoi investire senza stringere troppo.',
        'Investi solo denaro che non ti servirà a breve, così non sarai costretto a vendere nel momento peggiore.',
      ] },

      { type: 'h2', text: '1. Stabilisci per cosa investi' },
      { type: 'p', text: 'L\'anticipo per una casa tra cinque anni e la pensione tra trenta richiedono scelte diverse. Prima ti serviranno i soldi, meno oscillazioni puoi accettare. Un obiettivo chiaro ti aiuta anche a non toccare il denaro al primo spavento.' },

      { type: 'h2', text: '2. Scegli prodotti semplici e diversificati' },
      { type: 'p', text: 'Per chi inizia, la semplicità è un vantaggio. Se non riesci a spiegare in due frasi dove stai investendo e quali rischi corri, non è ancora il prodotto giusto per te. I fondi e gli ETF diversificati distribuiscono il denaro tra molte aziende invece di dipendere da una sola. La diversificazione riduce il rischio, ma non lo elimina e non garantisce guadagni.' },
      { type: 'p', text: 'Controlla anche le commissioni, perché piccole differenze pesano nel corso di molti anni, e come vengono tassati i guadagni nel tuo caso. L\'autorità di vigilanza finanziaria del tuo paese permette di solito di verificare se un operatore è autorizzato.' },

      { type: 'h2', text: '3. Investi con regolarità' },
      { type: 'p', text: 'Invece di cercare di indovinare il momento migliore, investi la stessa somma ogni mese. Compri più quote quando i prezzi sono bassi e meno quando sono alti, il che attenua le oscillazioni, anche se non evita le perdite. Decidi l\'importo e la data, e la pressione di scegliere quando comprare sparisce.' },
      { type: 'tip', text: 'Esempio: 50 € al mese per dieci anni sono 6000 € investiti, prima di guadagni, perdite, commissioni e tasse. Puoi iniziare con meno e aumentare l\'importo quando il tuo budget lo consente.' },

      { type: 'h2', text: 'Errori comuni di chi inizia' },
      { type: 'ul', items: [
        'Aspettare il momento perfetto e non iniziare mai.',
        'Investire denaro che serve nella vita di ogni giorno.',
        'Cambiare strategia a ogni rialzo o ribasso del mercato.',
        'Comprare su consiglio altrui qualcosa che non capisci.',
        'Ignorare commissioni e tasse.',
      ] },

      { type: 'h2', text: 'Come seguire i tuoi investimenti' },
      { type: 'p', text: 'Un semplice registro basta per sapere quanto hai investito, quanto vale oggi e se il piano ha ancora senso. Va bene un foglio di calcolo, purché lo tenga aggiornato.' },
      { type: 'p', text: 'FinanceFlow aiuta su entrambi i fronti. Con il piano gratuito registri entrate e spese e vedi quanto ti resta ogni mese. Con il piano Premium registri ogni investimento (importo iniziale, versamenti e situazione attuale), vedi il rendimento per posizione e totale e ricevi suggerimenti educativi adatti al tuo profilo di rischio. I valori li aggiorni tu, e l\'app non compra né vende investimenti.' },
    ],
  },
]
