import type { BlogPost } from './index'

export const geldSparen: BlogPost = {
  key: 'save-money',
  slug: 'geld-sparen',
  lang: 'de',
  title: 'Geld sparen: 6 Schritte, die wirklich funktionieren',
  description: 'Eine einfache Methode, jeden Monat zu sparen: wissen, wohin das Geld geht, zuerst sparen, Limits pro Kategorie setzen und einen Notgroschen aufbauen.',
  published: '2026-10-24',
  blocks: [
    { type: 'p', text: 'Fast jeder möchte mehr sparen, und fast jeder hat es schon versucht. Das Problem ist selten fehlende Willenskraft, sondern der Versuch, Ausgaben zu kürzen, ohne zu wissen, welche es sind. Diese sechs Schritte folgen einer Reihenfolge, die genau dafür gedacht ist. Zuerst findest du heraus, wohin dein Geld geht, dann entscheidest du, was du änderst.' },

    { type: 'h2', text: '1. Schreib zwei Monate lang alle Ausgaben auf' },
    { type: 'p', text: 'Bevor du etwas änderst, notiere alles, was du ausgibst: Supermarkt, Kaffee, Tanken, Essenslieferungen, Abos, das Geburtstagsgeschenk für eine Kollegin. Streich noch nichts. Das Ziel ist ein echtes Bild deiner Ausgaben, nicht das in deinem Kopf.' },
    { type: 'p', text: 'Am Ende des ersten Monats ordnest du die Ausgaben nach Kategorien. Die meisten sind überrascht von den kleinen, wiederkehrenden Beträgen: drei Euro am Tag für Kaffee und Snacks sind rund 90 € im Monat, mehr als 1.000 € im Jahr.' },
    { type: 'tip', text: 'Erfasse jede Ausgabe sofort, auf dem Handy. Wer es auf den Abend verschiebt, vergisst die Hälfte, und wer es auf das Wochenende verschiebt, gibt auf.' },

    { type: 'h2', text: '2. Zuerst sparen, dann ausgeben' },
    { type: 'p', text: 'Wenn du das sparst, was am Monatsende übrig bleibt, sparst du wenig oder nichts, denn meistens bleibt nichts übrig. Dreh die Reihenfolge um: Am Zahltag überweist du sofort einen festen Betrag auf ein separates Konto und fängst erst danach an, Geld auszugeben.' },
    { type: 'p', text: 'Fang mit einem Betrag an, der nicht wehtut, auch wenn es nur 5 % deines Gehalts sind. Es ist leichter, eine bestehende Sparrate zu erhöhen, als groß anzufangen. Wenn deine Bank es erlaubt, richte einen Dauerauftrag für den Tag nach dem Gehaltseingang ein: Dann musst du nicht einmal daran denken.' },

    { type: 'h2', text: '3. Gib jeder Kategorie ein Monatslimit' },
    { type: 'p', text: 'Mit den Daten aus Schritt 1 legst du fest, wie viel du pro Monat in jeder Kategorie ausgeben willst: Lebensmittel, Restaurants, Mobilität, Freizeit, Shopping. Es muss nicht perfekt sein. Starte mit deinem Durchschnitt und kürze ein wenig bei den Kategorien, die dich überrascht haben.' },
    { type: 'p', text: 'Ein einfacher Einstieg ist die 50/30/20-Regel: etwa 50 % des Einkommens für Notwendiges (Wohnen, Rechnungen, Lebensmittel, Mobilität), 30 % für Wünsche und 20 % zum Sparen. Das ist kein Gesetz, sondern ein Ausgangspunkt, den du an deine Situation anpasst.' },
    { type: 'tip', text: 'Beispiel: Bei einem Nettogehalt von 1.200 € wären das rund 600 € für Notwendiges, 360 € für Wünsche und 240 € zum Sparen. Wenn die Miete schon 550 € kostet, ändern sich die Zahlen, und das ist in Ordnung: Wichtig ist, die Limits festzulegen, bevor der Monat beginnt.' },
    { type: 'p', text: 'Wenn das Limit einer Kategorie aufgebraucht ist, ist es bis zum nächsten Monat aufgebraucht. Wenn eine Kategorie jeden Monat überzogen wird, war das Limit unrealistisch: Pass es an und nimm die Differenz aus einer anderen.' },

    { type: 'h2', text: '4. Überprüfe Abos und Lastschriften' },
    { type: 'p', text: 'Streaming, Fitnessstudio, Cloud-Speicher, Apps, Zeitschriften, Versicherungen, die keinen Sinn mehr ergeben. Jedes für sich wirkt günstig, zusammen kommen schnell 50 € oder 100 € im Monat zusammen.' },
    { type: 'ul', items: [
      'Öffne die Kontoauszüge der letzten drei Monate und liste alle wiederkehrenden Zahlungen auf.',
      'Kündige alles, was du im letzten Monat nicht genutzt hast. Wenn es dir fehlt, kannst du es wieder abonnieren.',
      'Prüfe bei den Diensten, die du behältst, ob es einen günstigeren oder geteilten Tarif gibt.',
      'Wiederhole diese Prüfung zweimal im Jahr.',
    ] },

    { type: 'h2', text: '5. Bau einen Notgroschen auf, bevor du investierst' },
    { type: 'p', text: 'Ein Notgroschen ist Geld, das nur für Unvorhergesehenes reserviert ist: eine Autopanne, eine Zahnarztrechnung, ein Monat ohne Einkommen. Üblich sind drei bis sechs Monate an notwendigen Ausgaben, an einem Ort, an dem du schnell darauf zugreifen kannst.' },
    { type: 'p', text: 'Ohne diese Reserve landet eine unerwartete Ausgabe auf der Kreditkarte oder im Dispo, und die Zinsen fressen auf, was du gespart hast. Mit ihr ist ein schlechter Monat nur ein schlechter Monat. Erst wenn du sie hast, lohnt es sich, ans Investieren zu denken.' },

    { type: 'h2', text: '6. Warte 48 Stunden vor nicht notwendigen Käufen' },
    { type: 'p', text: 'Viele Spontankäufe wirken nach zwei Tagen nicht mehr nötig. Setz jeden nicht notwendigen Kauf über einem Betrag, den du festlegst (zum Beispiel 50 €), auf eine Liste und warte 48 Stunden. Wenn du ihn dann noch willst, kauf ihn ohne schlechtes Gewissen und innerhalb des Kategorielimits.' },
    { type: 'p', text: 'Es hilft auch, Werbebenachrichtigungen von Shops abzuschalten und deine Kartendaten nicht auf den Seiten zu speichern, auf denen du gern spontan kaufst. Ein zusätzlicher Schritt reicht oft schon, damit du es dir anders überlegst.' },

    { type: 'h2', text: 'Wie es weitergeht' },
    { type: 'p', text: 'Du musst nicht alle sechs Schritte auf einmal umsetzen. Fang mit dem ersten an: Schreib einen Monat lang deine Ausgaben auf. Alles andere wird leichter, wenn du weißt, wohin dein Geld geht.' },
    { type: 'p', text: 'Das geht mit einem Notizbuch oder einer Tabelle. Wichtig ist, dranzubleiben. Wenn du lieber eine App nutzt: Dafür wurde FinanceFlow gemacht. Im kostenlosen Tarif erfasst du eine Ausgabe in Sekunden und siehst, wohin dein Geld geht, nach Kategorie und Monat. In den bezahlten Tarifen legst du zusätzlich Monatslimits pro Kategorie fest und bekommst eine Warnung, bevor du sie überschreitest.' },
  ],
}
