import type { HelpSection } from '../helpContent'

export const helpIt: HelpSection[] = [
  {
    id: 'transactions',
    title: 'Transazioni e categorie',
    items: [
      { id: 'add-transaction', q: 'Come registro una spesa o un’entrata?', a: "Tocca il pulsante + (o «Nuova transazione» nel pannello), scegli il tipo, l'importo, la categoria e la data. Con i piani Pro e Premium puoi anche fotografare uno scontrino o una fattura: l'IA compila i campi e tu li controlli prima di salvare." },
      { id: 'categories', q: 'Posso creare le mie categorie?', a: "Sì, in Impostazioni → Categorie. Con il piano Gratuito puoi avere 2 categorie personalizzate oltre a quelle incluse nell'account; con Pro e Premium sono illimitate." },
      { id: 'free-limit', q: 'Il piano Gratuito ha dei limiti?', a: 'Fino a 50 transazioni al mese e 2 categorie personalizzate. Il pannello e i grafici per categoria sono inclusi.' },
      { id: 'currency', q: 'Posso vedere gli importi in un’altra valuta?', a: 'Sì, in Impostazioni → Valuta scegli tra oltre 100 valute. Gli importi sono convertiti al cambio del giorno; i tuoi dati restano salvati in euro.' },
    ],
  },
  {
    id: 'budgets',
    title: 'Gruppi e budget',
    items: [
      { id: 'groups', q: 'A cosa servono i gruppi?', a: 'Riuniscono le transazioni di un tema (casa, vacanze, un progetto) e permettono un tetto mensile o settimanale, con un avviso quando raggiungi una percentuale. Disponibile con i piani Pro e Premium.' },
      { id: 'ai-budget', q: "Cos'è il budget suggerito dall'IA?", a: "Con Premium e almeno 3 mesi completi di spese, l'app propone un limite mensile per ogni categoria e gruppo, in base a entrate, spese fisse, fondo di cassa e obiettivo di risparmio. Controlli, modifichi e applichi — e puoi annullare." },
      { id: 'ai-budget-once', q: 'Perché posso chiedere il budget solo una volta al mese?', a: "Ogni richiesta usa l'IA e la proposta resta salvata per il resto del mese: puoi applicarla e annullarla quante volte vuoi. Il mese successivo puoi chiederne una nuova." },
      { id: 'fixed-costs', q: 'Cosa sono le spese fisse e il fondo di cassa?', a: "Le spese fisse sono spese regolari che non si tagliano (affitto, bollette, abbonamenti): l'app non ne riduce mai il limite. Il fondo di cassa è la parte delle entrate lasciata libera per gli imprevisti — 10% di default." },
    ],
  },
  {
    id: 'ai',
    title: 'IA e privacy',
    items: [
      { id: 'ai-data', q: "Quali dati arrivano all'IA?", a: 'Solo totali già calcolati (per mese e per categoria), nomi delle categorie e, per il budget suggerito, le entrate previste e le percentuali che scegli. Le descrizioni delle tue transazioni non vengono mai inviate.' },
      { id: 'scan-privacy', q: 'Cosa succede alle foto degli scontrini?', a: "L'immagine o il PDF viene inviato all'IA solo per leggere i campi, è elaborato in memoria e non viene conservato. Evita documenti con dati personali non necessari." },
      { id: 'investment-tips', q: 'I consigli di investimento sono consulenza finanziaria?', a: 'No. Sono contenuti educativi adatti al tuo profilo di rischio (Premium) e possono contenere errori. Decisioni e rischi sono tuoi.' },
    ],
  },
  {
    id: 'forecasts',
    title: 'Previsioni',
    items: [
      { id: 'forecast-how', q: 'Come funzionano le previsioni?', a: 'Con Premium, un modello di IA impara dai tuoi mesi completi e prevede entrate, spese e saldo dei prossimi 3 mesi. Funziona sul tuo dispositivo: i tuoi dati non escono per questo.' },
      { id: 'forecast-simple', q: 'Perché compare «previsione semplice»?', a: "Il modello di IA ha bisogno di 5 mesi completi. Con 2-4 mesi, l'app segue l'andamento dei tuoi mesi. Il mese in corso non conta mai, perché è ancora incompleto." },
    ],
  },
  {
    id: 'subscription',
    title: 'Abbonamento e pagamenti',
    items: [
      { id: 'plans', q: 'Quali piani esistono?', a: 'Gratuito, Pro e Premium. Vedi cosa include ciascuno e i prezzi in Abbonamento.' },
      { id: 'payment-methods', q: 'Come posso pagare?', a: "Sul sito: carta o addebito diretto (con rinnovo automatico), MB WAY o Multibanco (pagamento unico per 1, 3, 6 o 12 mesi). Nell'app Android, tramite Google Play." },
      { id: 'cancel', q: "Come annullo l'abbonamento?", a: "Se hai acquistato sul sito, in Impostazioni → Abbonamento; mantieni l'accesso fino alla fine del periodo pagato. Se hai acquistato nell'app Android, annulla in Google Play (Pagamenti e abbonamenti)." },
      { id: 'refund', q: 'Posso chiedere un rimborso?', a: "Sì, nei primi 14 giorni e senza indicare il motivo (diritto di recesso): scrivici. Rimborsiamo l'intero importo e l'account viene eliminato — i dettagli sono nei Termini, punto 4." },
    ],
  },
  {
    id: 'account',
    title: 'Sicurezza e account',
    items: [
      { id: 'forgot-password', q: 'Ho dimenticato la password. E ora?', a: 'Nella schermata di accesso, tocca «Password dimenticata?»: ti inviamo un link, valido 30 minuti, per impostarne una nuova.' },
      { id: 'two-factor', q: "Come attivo l'autenticazione a due fattori?", a: "Nelle Impostazioni, all'autenticazione a due fattori, inquadra il codice QR con un'app di autenticazione e conserva i codici di recupero. Da quel momento l'accesso chiede anche il codice dell'app." },
      { id: 'biometric', q: "Posso bloccare l'app con l'impronta?", a: "Sì, nell'app Android, in Impostazioni → Blocco biometrico. Serve un'impronta o un volto registrato sul telefono." },
      { id: 'export-delete', q: 'Come esporto o elimino i miei dati?', a: "In Impostazioni → Privacy e dati puoi scaricare tutto in JSON o eliminare l'account e tutti i dati." },
      { id: 'language', q: 'Come cambio lingua?', a: "Nella schermata di accesso o in Impostazioni → Lingua. Se non ne scegli una, l'app segue la lingua del telefono." },
    ],
  },
]
