import type { LegalDoc } from "../legalContent";

// Política de Privacidade e Termos em italiano — tradução da versão EN de
// utils/legalContent.ts. Mudar um texto legal é mudá-lo nas 6 línguas.
export function legalIt(updated: string): { privacy: LegalDoc; terms: LegalDoc } {
  return {
    privacy: {
      title: "Informativa sulla privacy",
      sections: [
        {
          h: "1. Chi è responsabile dei tuoi dati",
          p: [
            "Il titolare del trattamento è Dinis Miguel da Silva Costa, codice fiscale portoghese (NIF): 176280340. Per qualsiasi domanda sulla privacy: dinismiguelcosta@gmail.com.",
          ],
        },
        {
          h: "2. Quali dati trattiamo",
          p: [
            "Account: nome, e-mail e un hash della tua password (non conserviamo mai la password in chiaro). Se attivi l'autenticazione a due fattori, conserviamo il segreto dell'autenticatore cifrato e solo gli hash dei codici di recupero.",
            "Dati finanziari che inserisci: transazioni, categorie, gruppi e budget, e il registro degli investimenti. Se compili il questionario del profilo di investitore, conserviamo le tue risposte.",
            "Abbonamento: piano, stato e riferimenti di pagamento. I dati di carta, IBAN o telefono MB WAY sono raccolti direttamente da EasyPay e non passano mai dai nostri server. Per gli acquisti fatti nell'app Android, il pagamento avviene su Google Play: conserviamo solo l'identificativo dell'acquisto, il prodotto e lo stato dell'abbonamento che Google ci comunica.",
            "Preferenze: lingua dell'interfaccia e, su Android, se hai attivato il blocco biometrico (salvato solo sul tuo telefono; l'app non riceve mai la tua impronta digitale o il tuo volto).",
            "Dati tecnici: il tuo indirizzo IP serve a dedurre il tuo paese (con un database locale, senza inviarlo a terzi) e a limitare i tentativi abusivi; conserviamo registri di sicurezza (ad esempio tentativi di accesso falliti) senza password, codici né il contenuto dei tuoi dati.",
          ],
        },
        {
          h: "3. Per cosa usiamo i dati e su quale base giuridica",
          p: [
            "Fornire il servizio che hai richiesto (gestione delle finanze, abbonamenti, previsioni e statistiche): esecuzione del contratto.",
            "Sicurezza dell'account e prevenzione degli abusi (limiti di tentativi, registri di sicurezza, 2FA): interesse legittimo.",
            "Adempiere agli obblighi di legge applicabili, ad esempio fiscali e di fatturazione: obbligo legale.",
            "Le funzionalità di intelligenza artificiale inviano dati solo quando le usi (vedi il punto 5).",
          ],
        },
        {
          h: "4. Con chi condividiamo i dati (responsabili del trattamento)",
          p: [
            "MongoDB Atlas — hosting del database in cui sono conservati i tuoi dati.",
            "Netlify — hosting dell'applicazione; elabora le richieste fatte all'app, compreso l'indirizzo IP.",
            "EasyPay — elaborazione dei pagamenti (carta, addebito diretto, MB WAY, Multibanco).",
            "Google (Google Play) — distribuzione dell'app Android e pagamento degli abbonamenti acquistati al suo interno. Google gestisce questi pagamenti come venditore, secondo la propria informativa sulla privacy; per collegare l'acquisto al tuo account le inviamo solo un identificativo dell'account cifrato (mai il tuo nome, la tua e-mail o i dati finanziari dell'app).",
            "Anthropic — fornitore del modello di IA usato per le funzionalità descritte al punto 5.",
            "Twelve Data — dati di mercato e tassi di cambio. Riceve solo simboli di mercato e coppie di valute, mai dati personali né i tuoi importi.",
            "Sentry — monitoraggio degli errori tecnici, configurato per non inviare il contenuto delle richieste, i cookie né le intestazioni.",
            "Alcuni di questi fornitori possono avere sub-responsabili o infrastrutture al di fuori dello Spazio economico europeo; in tal caso si applicano le garanzie previste dal GDPR, in particolare le clausole contrattuali tipo approvate dalla Commissione europea.",
          ],
        },
        {
          h: "5. Intelligenza artificiale — cosa viene inviato",
          p: [
            "Interpretazione delle statistiche (piani Pro e Premium): inviamo valori aggregati (totali per mese e per categoria) e nomi delle categorie — mai le descrizioni delle tue transazioni.",
            "Consigli di investimento (piano Premium): inviamo le risposte del tuo profilo di investitore, un riepilogo aggregato delle tue finanze e il contesto di mercato del giorno. Al momento non inviamo alcun dato del tuo registro degli investimenti (portafoglio); se questo dovesse cambiare, l'informativa verrà aggiornata prima.",
            "Budget suggerito (piano Premium): per ogni categoria di spesa inviamo il nome e i totali mensili già calcolati (media, minimo, massimo), le entrate mensili previste e le percentuali di fondo di cassa e di risparmio che scegli — mai le descrizioni delle tue transazioni. Solo quando chiedi una proposta, al massimo una volta al mese.",
            "Scansione di documenti (piani Pro e Premium): l'immagine o il PDF che carichi viene inviato ad Anthropic per estrarne i campi, viene elaborato in memoria e non viene conservato da noi. Evita di caricare documenti con dati personali non necessari (ad esempio codice fiscale o indirizzo su una busta paga).",
            "Il contenuto generato dall'IA ha solo carattere informativo, può contenere errori e non costituisce consulenza finanziaria.",
          ],
        },
        {
          h: "6. Per quanto tempo conserviamo i dati",
          p: [
            "Finché esiste il tuo account. Quando elimini l'account (Impostazioni → Privacy e dati), cancelliamo i tuoi dati dal database. Le copie di backup possono conservare i dati fino a 3 anni prima di essere sovrascritte.",
            "Possiamo conservare solo quanto strettamente necessario per adempiere agli obblighi di legge (ad esempio i registri di fatturazione) per il periodo richiesto dalla legge.",
          ],
        },
        {
          h: "7. I tuoi diritti",
          p: [
            "Accesso e portabilità: in Impostazioni → Privacy e dati puoi scaricare tutti i tuoi dati in formato JSON.",
            "Cancellazione: nella stessa sezione puoi eliminare il tuo account e tutti i dati associati. Se hai un abbonamento con rinnovo automatico, viene prima annullato. Se non hai più accesso all'app, chiedi la cancellazione via e-mail a dinismiguelcosta@gmail.com dall'indirizzo associato all'account.",
            "Eliminare dati senza eliminare l'account: puoi eliminare in qualsiasi momento nell'app transazioni, categorie, gruppi e investimenti singolarmente. Per chiedere la cancellazione di altri dati specifici senza eliminare l'account, scrivi a dinismiguelcosta@gmail.com dall'indirizzo associato all'account.",
            "Rettifica: puoi correggere i tuoi dati direttamente nell'app. Hai inoltre diritto alla limitazione e all'opposizione al trattamento; contattaci a dinismiguelcosta@gmail.com.",
            "Puoi presentare reclamo all'autorità portoghese per la protezione dei dati (CNPD), www.cnpd.pt, o all'autorità del tuo paese.",
          ],
        },
        {
          h: "8. Cookie e archiviazione locale",
          p: [
            "Usiamo solo cookie strettamente necessari: \"session\" (mantiene l'accesso, fino a 30 giorni), \"pending_2fa\" (10 minuti, solo durante la verifica a due fattori) e \"financeflow_locale\" (la tua lingua). Conserviamo inoltre la tua preferenza di blocco biometrico nella memoria locale del telefono. Non usiamo cookie pubblicitari né di analisi del comportamento.",
          ],
        },
        {
          h: "9. Sicurezza",
          p: [
            "Password conservate come hash (scrypt), sessioni firmate, limitazione dei tentativi, autenticazione a due fattori facoltativa, segreti 2FA cifrati a riposo e connessioni cifrate (HTTPS). Nessun sistema è infallibile; in caso di violazione dei dati che ti riguardi, informeremo te e l'autorità come previsto dalla legge.",
          ],
        },
        {
          h: "10. Modifiche",
          p: [
            "Se modifichiamo questa informativa in modo rilevante, ti avvisiamo nell'app. Ultimo aggiornamento: " + updated + ".",
          ],
        },
      ],
    },
    terms: {
      title: "Termini di servizio",
      sections: [
        {
          h: "1. Accettazione",
          p: [
            "Creando un account o usando FinanceFlow accetti questi termini e l'Informativa sulla privacy. Il servizio è fornito da Dinis Miguel da Silva Costa, codice fiscale portoghese (NIF): 176280340, contatto dinismiguelcosta@gmail.com.",
          ],
        },
        {
          h: "2. Il servizio",
          p: [
            "FinanceFlow è un'app per la gestione delle finanze personali (registrazione delle transazioni, budget, statistiche, previsioni e registro degli investimenti), disponibile sul web e su Android.",
          ],
        },
        {
          h: "3. Il tuo account",
          p: [
            "Sei responsabile di custodire in modo sicuro la password e l'autenticatore e di tutte le attività sul tuo account. Ti consigliamo di attivare l'autenticazione a due fattori e di conservare i codici di recupero. Avvisaci subito se sospetti un accesso non autorizzato.",
            "Devi fornire informazioni veritiere e avere la capacità giuridica di concludere questo contratto.",
          ],
        },
        {
          h: "4. Piani e pagamenti",
          p: [
            "Esiste un piano Gratuito con limiti e piani a pagamento (Pro e Premium) con più funzionalità, al prezzo indicato nell'app al momento dell'abbonamento. Sul sito i pagamenti sono gestiti da EasyPay; nell'app Android da Google Play. Il piano è associato al tuo account e vale in entrambe le versioni.",
            "Carta e addebito diretto: abbonamento con rinnovo automatico fino a quando non lo annulli (Impostazioni → Abbonamento); mantieni l'accesso fino alla fine del periodo già pagato.",
            "MB WAY e Multibanco: pagamento unico per un periodo fisso (1, 3, 6 o 12 mesi), senza rinnovo automatico; l'accesso termina alla fine del periodo pagato, salvo nuovo pagamento. Un riferimento non pagato non dà accesso al piano.",
            "Google Play (app Android): addebito, rinnovo automatico e annullamento sono gestiti da Google Play, alle condizioni di Google; è disponibile anche il pagamento unico per un periodo fisso. Un piano acquistato su Google Play si gestisce su Google Play e un piano acquistato sul sito si gestisce sul sito; non è possibile averli attivi entrambi contemporaneamente.",
            "Diritto di recesso e rimborsi: se sei un consumatore, puoi recedere dal contratto entro 14 giorni dalla sua conclusione, senza indicarne il motivo, contattandoci a dinismiguelcosta@gmail.com. Non tratteniamo alcun importo per il servizio già usato in quel periodo: rimborsiamo l'intero importo pagato entro 14 giorni da quando veniamo a conoscenza della tua decisione, con lo stesso mezzo di pagamento usato per l'acquisto quando possibile. In cambio del rimborso totale, il tuo account viene eliminato e non puoi creare un nuovo account con la stessa e-mail nei 6 mesi successivi; questo blocco si applica solo a questo caso, non all'eliminazione dell'account in altre circostanze (vedi il punto 8). Se il servizio non funziona come concordato, hai diritto al ripristino della conformità e, se impossibile o sproporzionato, alla riduzione del prezzo o alla risoluzione del contratto con rimborso, come previsto dalla legge.",
          ],
        },
        {
          h: "5. Contenuti generati dall'IA e informazioni finanziarie",
          p: [
            "Le interpretazioni delle statistiche, i consigli di investimento, le previsioni, il budget suggerito e la lettura automatica dei documenti sono prodotti da sistemi automatici, hanno solo carattere informativo ed educativo e possono contenere errori.",
            "Nulla nell'app costituisce consulenza finanziaria, di investimento, fiscale o legale, né una raccomandazione personalizzata di acquistare o vendere alcun prodotto finanziario. Le decisioni e i rischi sono tuoi. Controlla sempre i dati estratti da un documento prima di salvarli.",
          ],
        },
        {
          h: "6. Uso consentito",
          p: [
            "Non puoi usare il servizio per scopi illeciti, tentare di accedere ad account o dati di altre persone, aggirare limiti o misure di sicurezza, sovraccaricare il servizio o decompilarlo oltre quanto consentito dalla legge.",
          ],
        },
        {
          h: "7. Disponibilità e limitazione di responsabilità",
          p: [
            "Ci impegniamo a mantenere il servizio disponibile, ma l'app è fornita \"così com'è\" e \"secondo disponibilità\", senza garanzie espresse o implicite, comprese quelle di esattezza dei dati, funzionamento ininterrotto, assenza di errori, idoneità a uno scopo specifico o non violazione dei diritti di terzi.",
            "Non garantiamo che le analisi, le previsioni, le interpretazioni delle statistiche o le categorizzazioni di entrate e spese prodotte dall'app siano prive di errori. L'app è uno strumento di supporto all'organizzazione delle tue finanze personali e non costituisce consulenza professionale finanziaria, fiscale, legale o di investimento (vedi anche il punto 5). Qualsiasi decisione finanziaria presa sulla base delle informazioni dell'app è interamente sotto la tua responsabilità.",
            "Ai sensi del Decreto-legge portoghese n. 446/85 (clausole contrattuali generali) e del Codice civile portoghese, la nostra responsabilità civile per i danni che ti vengano causati è limitata ai casi di dolo o colpa grave.",
            "Salvo quando la legge applicabile lo vieti, non rispondiamo di: danni indiretti, incidentali, punitivi o consequenziali; perdita di profitti, ricavi, dati o opportunità commerciali; o danni derivanti da guasti di rete, interruzioni del servizio o accessi non autorizzati di terzi dovuti alla tua negligenza nella custodia delle credenziali.",
            "Nella misura massima consentita dalla legge portoghese, la nostra responsabilità complessiva cumulata per qualsiasi reclamo derivante dall'uso dell'app è limitata all'importo totale delle quote di abbonamento che hai effettivamente pagato nei 12 mesi immediatamente precedenti l'evento che ha dato origine alla responsabilità. Se al momento dell'evento eri sul piano Gratuito o in un periodo di prova gratuito, la nostra responsabilità massima è limitata a 50,00 €. Nulla in questa clausola limita i diritti che la legge portoghese ti garantisce in modo inderogabile, in particolare quelli del punto 4 (diritto di recesso e conformità del servizio).",
          ],
        },
        {
          h: "8. Annullamento e chiusura dell'account",
          p: [
            "Puoi annullare l'abbonamento ed eliminare l'account in qualsiasi momento nelle Impostazioni; l'eliminazione cancella i tuoi dati (vedi l'Informativa sulla privacy) e non impedisce di creare un nuovo account. L'unica eccezione è l'eliminazione derivante dall'esercizio del diritto di recesso (punto 4), che comporta un blocco di 6 mesi. Possiamo sospendere gli account che violano questi termini o sono usati in modo abusivo.",
          ],
        },
        {
          h: "9. Modifiche, legge applicabile e controversie",
          p: [
            "Possiamo modificare questi termini e ti avvisiamo nell'app prima che le modifiche rilevanti entrino in vigore. Legge applicabile: questi termini e qualsiasi controversia derivante dall'uso dell'app sono regolati dalla legge portoghese; se sei un consumatore residente in un altro Stato membro dell'Unione europea, questa scelta non ti priva della tutela delle norme imperative del tuo paese di residenza. Foro: in caso di procedimento giudiziario, come consumatore puoi agire davanti ai tribunali portoghesi o a quelli dello Stato membro dell'Unione europea in cui risiedi.",
            "Risoluzione alternativa delle controversie: ai sensi della Legge portoghese n. 144/2015, in caso di controversia di consumo che non riusciamo a risolvere direttamente con te, puoi rivolgerti al Centro di arbitrato dei conflitti di consumo di Lisbona (Centro de Arbitragem de Conflitos de Consumo de Lisboa, CACCL) — Rua dos Douradores, n.º 112, 2.º, 1100-207 Lisbona, Portogallo; e-mail juridico@centroarbitragemlisboa.pt; telefono (+351) 218 80 70 30; www.centroarbitragemlisboa.pt — o al centro di arbitrato della tua zona di residenza.",
            "Libro dei reclami elettronico: ai sensi della legge portoghese, mettiamo a disposizione un Libro dei reclami elettronico (Livro de Reclamações Eletrónico), accessibile dal link a piè di pagina della pagina di accesso.",
            "Ultimo aggiornamento: " + updated + ".",
          ],
        },
      ],
    },
  };
}
