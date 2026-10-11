import type { HelpSection } from '../helpContent'

export const helpDe: HelpSection[] = [
  {
    id: 'transactions',
    title: 'Transaktionen und Kategorien',
    items: [
      { id: 'add-transaction', q: 'Wie erfasse ich eine Ausgabe oder Einnahme?', a: 'Tippe auf + (oder „Neue Transaktion“ in der Übersicht) und wähle Art, Betrag, Kategorie und Datum. In den Plänen Pro und Premium kannst du auch einen Beleg oder eine Rechnung fotografieren: Die KI füllt die Felder aus und du prüfst sie vor dem Speichern.' },
      { id: 'categories', q: 'Kann ich eigene Kategorien anlegen?', a: 'Ja, unter Einstellungen → Kategorien. Im kostenlosen Plan kannst du neben den mitgelieferten 2 eigene Kategorien haben; in Pro und Premium unbegrenzt viele.' },
      { id: 'free-limit', q: 'Hat der kostenlose Plan Grenzen?', a: 'Bis zu 50 Transaktionen pro Monat und 2 eigene Kategorien. Übersicht und Diagramme nach Kategorie sind enthalten.' },
      { id: 'currency', q: 'Kann ich Beträge in einer anderen Währung sehen?', a: 'Ja, unter Einstellungen → Währung wählst du aus über 100 Währungen. Die Beträge werden zum Tageskurs umgerechnet; deine Daten bleiben in Euro gespeichert.' },
    ],
  },
  {
    id: 'budgets',
    title: 'Gruppen und Budgets',
    items: [
      { id: 'groups', q: 'Wofür sind Gruppen da?', a: 'Sie fassen die Transaktionen eines Themas zusammen (Zuhause, Urlaub, ein Projekt) und erlauben ein Monats- oder Wochenlimit mit einer Warnung, wenn du einen bestimmten Prozentsatz erreichst. Verfügbar in den Plänen Pro und Premium.' },
      { id: 'ai-budget', q: 'Was ist der KI-Budgetvorschlag?', a: 'In Premium schlägt die App ab mindestens 3 vollständigen Monaten mit Ausgaben ein Monatslimit für jede Kategorie und Gruppe vor — auf Basis deiner Einnahmen, Fixkosten, Liquiditätsreserve und deines Sparziels. Du prüfst, passt an und übernimmst — und kannst es rückgängig machen.' },
      { id: 'ai-budget-once', q: 'Warum kann ich das Budget nur einmal im Monat anfordern?', a: 'Jede Anfrage nutzt die KI, und der Vorschlag bleibt für den Rest des Monats gespeichert: Du kannst ihn beliebig oft übernehmen und rückgängig machen. Im nächsten Monat kannst du einen neuen anfordern.' },
      { id: 'fixed-costs', q: 'Was sind Fixkosten und Liquiditätsreserve?', a: 'Fixkosten sind regelmäßige Ausgaben, die man nicht kürzt (Miete, Rechnungen, Abos): Die App senkt ihr Limit nie. Die Liquiditätsreserve ist der Teil der Einnahmen, der für Unvorhergesehenes frei bleibt — standardmäßig 10 %.' },
    ],
  },
  {
    id: 'ai',
    title: 'KI und Datenschutz',
    items: [
      { id: 'ai-data', q: 'Welche Daten gehen an die KI?', a: 'Nur bereits berechnete Summen (pro Monat und Kategorie), Kategorienamen und beim Budgetvorschlag deine erwarteten Einnahmen und die gewählten Prozentsätze. Die Beschreibungen deiner Transaktionen werden nie gesendet.' },
      { id: 'scan-privacy', q: 'Was passiert mit den Fotos der Belege?', a: 'Das Bild oder PDF wird nur zum Auslesen der Felder an die KI gesendet, im Arbeitsspeicher verarbeitet und nicht gespeichert. Lade möglichst keine Dokumente mit unnötigen persönlichen Daten hoch.' },
      { id: 'investment-tips', q: 'Sind die Anlagetipps eine Finanzberatung?', a: 'Nein. Es sind Bildungsinhalte passend zu deinem Risikoprofil (Premium), die Fehler enthalten können. Entscheidungen und Risiken liegen bei dir.' },
    ],
  },
  {
    id: 'forecasts',
    title: 'Prognosen',
    items: [
      { id: 'forecast-how', q: 'Wie funktionieren die Prognosen?', a: 'In Premium lernt ein KI-Modell aus deinen vollständigen Monaten und prognostiziert Einnahmen, Ausgaben und Saldo für die nächsten 3 Monate. Es läuft auf deinem Gerät: Deine Daten verlassen es dafür nicht.' },
      { id: 'forecast-simple', q: 'Warum steht dort „einfache Prognose“?', a: 'Das KI-Modell braucht 5 vollständige Monate. Mit 2 bis 4 folgt die App dem Trend deiner Monate. Der laufende Monat zählt nie, weil er noch unvollständig ist.' },
    ],
  },
  {
    id: 'subscription',
    title: 'Abo und Zahlungen',
    items: [
      { id: 'plans', q: 'Welche Pläne gibt es?', a: 'Kostenlos, Pro und Premium. Was jeder enthält und die Preise siehst du unter Abonnement.' },
      { id: 'payment-methods', q: 'Wie kann ich bezahlen?', a: 'Auf der Website: Karte oder Lastschrift (mit automatischer Verlängerung), MB WAY oder Multibanco (Einmalzahlung für 1, 3, 6 oder 12 Monate). In der Android-App über Google Play.' },
      { id: 'cancel', q: 'Wie kündige ich mein Abo?', a: 'Bei Kauf auf der Website unter Einstellungen → Abonnement; der Zugang bleibt bis zum Ende des bezahlten Zeitraums. Bei Kauf in der Android-App kündigst du in Google Play (Zahlungen & Abos).' },
      { id: 'refund', q: 'Kann ich eine Erstattung bekommen?', a: 'Ja, innerhalb der ersten 14 Tage ohne Angabe von Gründen (Widerrufsrecht): Schreib uns. Wir erstatten den vollen Betrag und das Konto wird gelöscht — Details in den Nutzungsbedingungen, Abschnitt 4.' },
    ],
  },
  {
    id: 'account',
    title: 'Sicherheit und Konto',
    items: [
      { id: 'forgot-password', q: 'Ich habe mein Passwort vergessen. Was nun?', a: 'Tippe auf dem Anmeldebildschirm auf „Passwort vergessen?“: Wir senden dir einen Link, 30 Minuten gültig, um ein neues festzulegen.' },
      { id: 'two-factor', q: 'Wie aktiviere ich die Zwei-Faktor-Authentifizierung?', a: 'In den Einstellungen unter Zwei-Faktor-Authentifizierung scannst du den QR-Code mit einer Authenticator-App und bewahrst die Wiederherstellungscodes auf. Danach fragt die Anmeldung zusätzlich nach dem Code der App.' },
      { id: 'biometric', q: 'Kann ich die App mit meinem Fingerabdruck sperren?', a: 'Ja, in der Android-App unter Einstellungen → Biometrische Sperre. Auf dem Telefon muss ein Fingerabdruck oder Gesicht registriert sein.' },
      { id: 'export-delete', q: 'Wie exportiere oder lösche ich meine Daten?', a: 'Unter Einstellungen → Datenschutz und Daten kannst du alles als JSON herunterladen oder dein Konto mit allen Daten löschen.' },
      { id: 'language', q: 'Wie ändere ich die Sprache?', a: 'Auf dem Anmeldebildschirm oder unter Einstellungen → Sprache. Wählst du keine, folgt die App der Sprache deines Telefons.' },
    ],
  },
]
