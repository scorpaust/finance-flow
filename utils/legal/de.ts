import type { LegalDoc } from "../legalContent";

// Política de Privacidade e Termos em alemão — tradução da versão EN de
// utils/legalContent.ts. Mudar um texto legal é mudá-lo nas 6 línguas.
export function legalDe(updated: string): { privacy: LegalDoc; terms: LegalDoc } {
  return {
    privacy: {
      title: "Datenschutzerklärung",
      sections: [
        {
          h: "1. Wer für deine Daten verantwortlich ist",
          p: [
            "Verantwortlicher ist Dinis Miguel da Silva Costa, Steuernummer (NIF): 176280340. Für alle Fragen zum Datenschutz: dinismiguelcosta@gmail.com.",
          ],
        },
        {
          h: "2. Welche Daten wir verarbeiten",
          p: [
            "Konto: Name, E-Mail und ein Hash deines Passworts (das Passwort selbst speichern wir nie). Wenn du die Zwei-Faktor-Authentifizierung aktivierst, speichern wir das Authenticator-Geheimnis verschlüsselt und von den Wiederherstellungscodes nur Hashes.",
            "Finanzdaten, die du eingibst: Transaktionen, Kategorien, Gruppen und Budgets sowie deine Investitionsaufzeichnungen. Wenn du den Fragebogen zum Anlegerprofil ausfüllst, speichern wir deine Antworten.",
            "Abonnement: Plan, Status und Zahlungsreferenzen. Karten-, IBAN- oder MB-WAY-Telefondaten werden direkt von EasyPay erhoben und laufen nie über unsere Server. Bei Käufen in der Android-App erfolgt die Zahlung über Google Play: Wir speichern nur die Kaufkennung, das Produkt und den Abostatus, den Google uns mitteilt.",
            "Einstellungen: Sprache der Oberfläche und unter Android, ob du die biometrische Sperre aktiviert hast (nur auf deinem Telefon gespeichert; die App erhält nie deinen Fingerabdruck oder dein Gesicht).",
            "Technische Daten: Deine IP-Adresse wird verwendet, um dein Land zu ermitteln (über eine lokale Datenbank, ohne sie an Dritte zu senden) und um missbräuchliche Versuche zu begrenzen; wir führen Sicherheitsprotokolle (zum Beispiel fehlgeschlagene Anmeldeversuche) ohne Passwörter, Codes oder den Inhalt deiner Daten.",
          ],
        },
        {
          h: "3. Wofür wir die Daten nutzen und auf welcher Rechtsgrundlage",
          p: [
            "Erbringung des von dir angeforderten Dienstes (Verwaltung der Finanzen, Abonnements, Prognosen und Statistiken): Vertragserfüllung.",
            "Kontosicherheit und Missbrauchsverhinderung (Versuchslimits, Sicherheitsprotokolle, 2FA): berechtigtes Interesse.",
            "Erfüllung geltender rechtlicher Pflichten, etwa steuerlicher und rechnungsbezogener: rechtliche Verpflichtung.",
            "Funktionen mit künstlicher Intelligenz senden nur Daten, wenn du sie nutzt (siehe Abschnitt 5).",
          ],
        },
        {
          h: "4. Mit wem wir Daten teilen (Auftragsverarbeiter)",
          p: [
            "MongoDB Atlas — Hosting der Datenbank, in der deine Daten gespeichert sind.",
            "Netlify — Hosting der Anwendung; verarbeitet die Anfragen an die App, einschließlich der IP-Adresse.",
            "EasyPay — Zahlungsabwicklung (Karte, Lastschrift, MB WAY, Multibanco).",
            "Google (Google Play) — Vertrieb der Android-App und Bezahlung der darin gekauften Abonnements. Google wickelt diese Zahlungen als Verkäufer nach seiner eigenen Datenschutzerklärung ab; um den Kauf mit deinem Konto zu verknüpfen, senden wir Google nur eine verschlüsselte Kontokennung (nie deinen Namen, deine E-Mail oder Finanzdaten aus der App).",
            "Anthropic — Anbieter des KI-Modells, das für die in Abschnitt 5 beschriebenen Funktionen verwendet wird.",
            "Resend — Versand der Konto-E-Mails (zum Beispiel des Links zum Festlegen eines neuen Passworts). Erhält nur deine E-Mail-Adresse und den Inhalt dieser Nachrichten.",
            "Twelve Data — Marktdaten und Wechselkurse. Erhält nur Marktsymbole und Währungspaare, nie personenbezogene Daten oder deine Beträge.",
            "Sentry — Überwachung technischer Fehler, so konfiguriert, dass weder Anfrageinhalte noch Cookies oder Header gesendet werden.",
            "Einige dieser Anbieter können Unterauftragsverarbeiter oder Infrastruktur außerhalb des Europäischen Wirtschaftsraums haben; in diesem Fall gelten die von der DSGVO vorgesehenen Garantien, insbesondere die Standardvertragsklauseln der Europäischen Kommission.",
          ],
        },
        {
          h: "5. Künstliche Intelligenz — was gesendet wird",
          p: [
            "Interpretation der Statistiken (Pläne Pro und Premium): Wir senden aggregierte Werte (Summen pro Monat und Kategorie) und Kategorienamen — nie die Beschreibungen deiner Transaktionen.",
            "Anlagetipps (Plan Premium): Wir senden die Antworten deines Anlegerprofils, eine aggregierte Zusammenfassung deiner Finanzen und den Marktkontext des Tages. Derzeit senden wir keine Daten aus deinen Investitionsaufzeichnungen (Portfolio); sollte sich das ändern, wird diese Erklärung vorher aktualisiert.",
            "Budgetvorschlag (Plan Premium): Für jede Ausgabenkategorie senden wir den Namen und die bereits berechneten Monatssummen (Durchschnitt, Minimum, Maximum), deine erwarteten monatlichen Einnahmen sowie die von dir gewählten Prozentsätze für Liquiditätsreserve und Sparen — nie die Beschreibungen deiner Transaktionen. Nur wenn du einen Vorschlag anforderst, höchstens einmal im Monat.",
            "Scannen von Dokumenten (Pläne Pro und Premium): Das Bild oder PDF, das du hochlädst, wird an Anthropic gesendet, um die Felder auszulesen, im Arbeitsspeicher verarbeitet und von uns nicht gespeichert. Lade möglichst keine Dokumente mit unnötigen personenbezogenen Daten hoch (zum Beispiel Steuernummer oder Adresse auf einer Gehaltsabrechnung).",
            "KI-generierte Inhalte dienen nur der Information, können Fehler enthalten und sind keine Finanzberatung.",
          ],
        },
        {
          h: "6. Wie lange wir die Daten aufbewahren",
          p: [
            "Solange dein Konto besteht. Wenn du dein Konto löschst (Einstellungen → Datenschutz und Daten), löschen wir deine Daten aus der Datenbank. Sicherungskopien können die Daten bis zu 3 Jahre aufbewahren, bevor sie überschrieben werden.",
            "Wir dürfen nur das unbedingt Notwendige aufbewahren, um rechtliche Pflichten zu erfüllen (zum Beispiel Rechnungsunterlagen), und zwar für die gesetzlich vorgeschriebene Dauer.",
          ],
        },
        {
          h: "7. Deine Rechte",
          p: [
            "Auskunft und Übertragbarkeit: Unter Einstellungen → Datenschutz und Daten kannst du alle deine Daten als JSON herunterladen.",
            "Löschung: Im selben Bereich kannst du dein Konto und alle zugehörigen Daten löschen. Wenn du ein Abonnement mit automatischer Verlängerung hast, wird es vorher gekündigt. Wenn du keinen Zugang mehr zur App hast, beantrage die Löschung per E-Mail an dinismiguelcosta@gmail.com von der mit dem Konto verknüpften Adresse.",
            "Daten löschen, ohne das Konto zu löschen: Du kannst Transaktionen, Kategorien, Gruppen und Investitionen jederzeit einzeln in der App löschen. Um die Löschung anderer bestimmter Daten zu beantragen, ohne dein Konto zu löschen, schreib an dinismiguelcosta@gmail.com von der mit dem Konto verknüpften Adresse.",
            "Berichtigung: Du kannst deine Daten direkt in der App korrigieren. Außerdem hast du das Recht auf Einschränkung der Verarbeitung und auf Widerspruch; kontaktiere uns unter dinismiguelcosta@gmail.com.",
            "Du kannst eine Beschwerde bei der portugiesischen Datenschutzbehörde (CNPD), www.cnpd.pt, oder bei der Behörde deines Landes einreichen.",
          ],
        },
        {
          h: "8. Cookies und lokaler Speicher",
          p: [
            "Wir verwenden nur unbedingt notwendige Cookies: „session“ (hält dich angemeldet, bis zu 30 Tage), „pending_2fa“ (10 Minuten, nur während der Zwei-Faktor-Prüfung) und „financeflow_locale“ (deine Sprache). Außerdem speichern wir deine Einstellung zur biometrischen Sperre im lokalen Speicher deines Telefons. Wir verwenden keine Werbe- oder Verhaltensanalyse-Cookies.",
          ],
        },
        {
          h: "9. Sicherheit",
          p: [
            "Passwörter als Hash gespeichert (scrypt), signierte Sitzungen, Begrenzung der Versuche, optionale Zwei-Faktor-Authentifizierung, 2FA-Geheimnisse verschlüsselt gespeichert und verschlüsselte Verbindungen (HTTPS). Kein System ist unfehlbar; kommt es zu einer Datenschutzverletzung, die dich betrifft, benachrichtigen wir dich und die Behörde nach den gesetzlichen Vorgaben.",
          ],
        },
        {
          h: "10. Änderungen",
          p: [
            "Wenn wir diese Erklärung wesentlich ändern, informieren wir dich in der App. Zuletzt aktualisiert: " + updated + ".",
          ],
        },
      ],
    },
    terms: {
      title: "Nutzungsbedingungen",
      sections: [
        {
          h: "1. Annahme",
          p: [
            "Mit der Erstellung eines Kontos oder der Nutzung von FinanceFlow akzeptierst du diese Bedingungen und die Datenschutzerklärung. Der Dienst wird von Dinis Miguel da Silva Costa, Steuernummer (NIF): 176280340, Kontakt dinismiguelcosta@gmail.com, erbracht.",
          ],
        },
        {
          h: "2. Der Dienst",
          p: [
            "FinanceFlow ist eine App für persönliche Finanzen (Erfassung von Transaktionen, Budgets, Statistiken, Prognosen und Investitionsaufzeichnungen), verfügbar im Web und unter Android.",
          ],
        },
        {
          h: "3. Dein Konto",
          p: [
            "Du bist dafür verantwortlich, dein Passwort und deinen Authenticator sicher aufzubewahren, und für alle Aktivitäten in deinem Konto. Wir empfehlen, die Zwei-Faktor-Authentifizierung zu aktivieren und die Wiederherstellungscodes aufzubewahren. Informiere uns sofort, wenn du einen unbefugten Zugriff vermutest.",
            "Du musst zutreffende Angaben machen und geschäftsfähig sein, um diesen Vertrag zu schließen.",
          ],
        },
        {
          h: "4. Pläne und Zahlungen",
          p: [
            "Es gibt einen kostenlosen Plan mit Einschränkungen und kostenpflichtige Pläne (Pro und Premium) mit mehr Funktionen, zu dem Preis, der zum Zeitpunkt des Abschlusses in der App angezeigt wird. Auf der Website werden Zahlungen von EasyPay abgewickelt, in der Android-App von Google Play. Der Plan ist mit deinem Konto verknüpft und gilt in beiden Versionen.",
            "Karte und Lastschrift: Abonnement mit automatischer Verlängerung, bis du es kündigst (Einstellungen → Abonnement); du behältst den Zugang bis zum Ende des bereits bezahlten Zeitraums.",
            "MB WAY und Multibanco: Einmalzahlung für einen festen Zeitraum (1, 3, 6 oder 12 Monate), ohne automatische Verlängerung; der Zugang endet mit dem bezahlten Zeitraum, sofern du nicht erneut zahlst. Eine unbezahlte Referenz gewährt keinen Zugang zum Plan.",
            "Google Play (Android-App): Abrechnung, automatische Verlängerung und Kündigung erfolgen über Google Play zu den Bedingungen von Google; die Einmalzahlung für einen festen Zeitraum ist ebenfalls verfügbar. Ein bei Google Play gekaufter Plan wird bei Google Play verwaltet, ein auf der Website gekaufter Plan auf der Website; beide können nicht gleichzeitig aktiv sein.",
            "Widerrufsrecht und Erstattungen: Als Verbraucher kannst du innerhalb von 14 Tagen ab Vertragsschluss ohne Angabe von Gründen vom Vertrag zurücktreten, indem du uns unter dinismiguelcosta@gmail.com kontaktierst. Für die in diesem Zeitraum bereits genutzte Leistung ziehen wir nichts ab: Wir erstatten den gesamten gezahlten Betrag innerhalb von 14 Tagen, nachdem wir von deiner Entscheidung erfahren haben, nach Möglichkeit über dasselbe Zahlungsmittel wie beim Kauf. Als Gegenleistung für die vollständige Erstattung wird dein Konto gelöscht, und du kannst in den folgenden 6 Monaten kein neues Konto mit derselben E-Mail erstellen; diese Sperre gilt nur in diesem Fall, nicht bei einer Kontolöschung unter anderen Umständen (siehe Abschnitt 8). Funktioniert der Dienst nicht wie vereinbart, hast du Anspruch auf Herstellung des vertragsgemäßen Zustands und, wenn das unmöglich oder unverhältnismäßig ist, auf Preisminderung oder Vertragsbeendigung mit Erstattung nach den gesetzlichen Vorgaben.",
          ],
        },
        {
          h: "5. KI-generierte Inhalte und Finanzinformationen",
          p: [
            "Interpretationen der Statistiken, Anlagetipps, Prognosen, der Budgetvorschlag und das automatische Auslesen von Dokumenten werden von automatisierten Systemen erstellt, dienen nur der Information und Bildung und können Fehler enthalten.",
            "Nichts in der App ist Finanz-, Anlage-, Steuer- oder Rechtsberatung oder eine persönliche Empfehlung, ein Finanzprodukt zu kaufen oder zu verkaufen. Entscheidungen und Risiken liegen bei dir. Prüfe die aus einem Dokument ausgelesenen Daten immer, bevor du sie speicherst.",
          ],
        },
        {
          h: "6. Zulässige Nutzung",
          p: [
            "Du darfst den Dienst nicht für rechtswidrige Zwecke nutzen, nicht versuchen, auf Konten oder Daten anderer zuzugreifen, Limits oder Sicherheitsmaßnahmen zu umgehen, den Dienst zu überlasten oder ihn über das gesetzlich Erlaubte hinaus zurückzuentwickeln.",
          ],
        },
        {
          h: "7. Verfügbarkeit und Haftungsbeschränkung",
          p: [
            "Wir bemühen uns, den Dienst verfügbar zu halten, aber die App wird „wie besehen“ und „wie verfügbar“ bereitgestellt, ohne ausdrückliche oder stillschweigende Gewährleistung, insbesondere hinsichtlich der Richtigkeit der Daten, eines unterbrechungsfreien Betriebs, der Fehlerfreiheit, der Eignung für einen bestimmten Zweck oder der Nichtverletzung von Rechten Dritter.",
            "Wir garantieren nicht, dass die von der App erstellten Analysen, Prognosen, Interpretationen der Statistiken oder Kategorisierungen von Einnahmen und Ausgaben fehlerfrei sind. Die App ist ein Hilfsmittel für die Organisation deiner persönlichen Finanzen und keine professionelle Finanz-, Steuer-, Rechts- oder Anlageberatung (siehe auch Abschnitt 5). Jede finanzielle Entscheidung auf Grundlage der Informationen der App liegt vollständig in deiner Verantwortung.",
            "Nach dem portugiesischen Gesetzesdekret Nr. 446/85 (Allgemeine Geschäftsbedingungen) und dem portugiesischen Zivilgesetzbuch ist unsere zivilrechtliche Haftung für dir entstandene Schäden auf Fälle von Vorsatz oder grober Fahrlässigkeit beschränkt.",
            "Soweit das anwendbare Recht es nicht verbietet, haften wir nicht für: indirekte, zufällige, Straf- oder Folgeschäden; entgangenen Gewinn, Einnahmen, Daten oder Geschäftschancen; oder Schäden durch Netzwerkausfälle, Dienstunterbrechungen oder unbefugten Zugriff Dritter infolge deiner eigenen Nachlässigkeit beim Schutz deiner Zugangsdaten.",
            "Im größtmöglichen nach portugiesischem Recht zulässigen Umfang ist unsere gesamte kumulierte Haftung für alle Ansprüche aus der Nutzung der App auf die Summe der Abonnementgebühren beschränkt, die du in den 12 Monaten unmittelbar vor dem haftungsbegründenden Ereignis tatsächlich gezahlt hast. Warst du zum Zeitpunkt des Ereignisses im kostenlosen Plan oder in einer kostenlosen Testphase, ist unsere Haftung auf höchstens 50,00 € beschränkt. Nichts in dieser Klausel beschränkt Rechte, die dir das portugiesische Recht zwingend gewährt, insbesondere die aus Abschnitt 4 (Widerrufsrecht und Vertragsmäßigkeit des Dienstes).",
          ],
        },
        {
          h: "8. Kündigung und Schließung des Kontos",
          p: [
            "Du kannst dein Abonnement jederzeit in den Einstellungen kündigen und dein Konto löschen; die Löschung entfernt deine Daten (siehe Datenschutzerklärung) und verhindert nicht die Erstellung eines neuen Kontos. Die einzige Ausnahme ist die Löschung infolge der Ausübung des Widerrufsrechts (Abschnitt 4), die mit einer Sperre von 6 Monaten verbunden ist. Wir können Konten sperren, die gegen diese Bedingungen verstoßen oder missbräuchlich genutzt werden.",
          ],
        },
        {
          h: "9. Änderungen, anwendbares Recht und Streitigkeiten",
          p: [
            "Wir können diese Bedingungen ändern und informieren dich in der App, bevor wesentliche Änderungen in Kraft treten. Anwendbares Recht: Diese Bedingungen und alle Streitigkeiten aus der Nutzung der App unterliegen portugiesischem Recht; bist du Verbraucher mit Wohnsitz in einem anderen EU-Mitgliedstaat, entzieht dir diese Rechtswahl nicht den Schutz der zwingenden Vorschriften deines Wohnsitzlandes. Gerichtsstand: Bei einem Gerichtsverfahren kannst du als Verbraucher vor den portugiesischen Gerichten oder vor den Gerichten des EU-Mitgliedstaats klagen, in dem du wohnst.",
            "Alternative Streitbeilegung: Nach dem portugiesischen Gesetz Nr. 144/2015 kannst du dich bei einer Verbraucherstreitigkeit, die wir nicht direkt mit dir lösen können, an das Schiedszentrum für Verbraucherstreitigkeiten Lissabon (Centro de Arbitragem de Conflitos de Consumo de Lisboa, CACCL) wenden — Rua dos Douradores, n.º 112, 2.º, 1100-207 Lissabon, Portugal; E-Mail juridico@centroarbitragemlisboa.pt; Telefon (+351) 218 80 70 30; www.centroarbitragemlisboa.pt — oder an das Schiedszentrum deines Wohnortes.",
            "Elektronisches Beschwerdebuch: Gemäß portugiesischem Recht stellen wir ein elektronisches Beschwerdebuch (Livro de Reclamações Eletrónico) bereit, erreichbar über den Link in der Fußzeile der Anmeldeseite.",
            "Zuletzt aktualisiert: " + updated + ".",
          ],
        },
      ],
    },
  };
}
