import type { HelpSection } from '../helpContent'

export const helpFr: HelpSection[] = [
  {
    id: 'transactions',
    title: 'Transactions et catégories',
    items: [
      { id: 'add-transaction', q: 'Comment enregistrer une dépense ou un revenu ?', a: "Touche le bouton + (ou « Nouvelle transaction » sur le tableau de bord), choisis le type, le montant, la catégorie et la date. Avec les formules Pro et Premium, tu peux aussi prendre en photo un reçu ou une facture : l'IA remplit les champs et tu vérifies avant d'enregistrer." },
      { id: 'categories', q: 'Puis-je créer mes propres catégories ?', a: 'Oui, dans Paramètres → Catégories. Avec la formule Gratuite, tu peux avoir 2 catégories personnalisées en plus de celles fournies avec le compte ; avec Pro et Premium, elles sont illimitées.' },
      { id: 'free-limit', q: 'La formule Gratuite a-t-elle des limites ?', a: "Jusqu'à 50 transactions par mois et 2 catégories personnalisées. Le tableau de bord et les graphiques par catégorie sont inclus." },
      { id: 'currency', q: 'Puis-je voir les montants dans une autre devise ?', a: 'Oui, dans Paramètres → Devise tu choisis parmi plus de 100 devises. Les montants sont convertis au taux du jour ; tes données restent enregistrées en euros.' },
    ],
  },
  {
    id: 'budgets',
    title: 'Groupes et budgets',
    items: [
      { id: 'groups', q: 'À quoi servent les groupes ?', a: "Ils réunissent les transactions d'un thème (maison, vacances, un projet) et permettent un plafond mensuel ou hebdomadaire, avec une alerte quand tu atteins un pourcentage de ce plafond. Disponible avec les formules Pro et Premium." },
      { id: 'ai-budget', q: "Qu'est-ce que le budget suggéré par l'IA ?", a: "Avec Premium et au moins 3 mois complets de dépenses, l'app propose une limite mensuelle pour chaque catégorie et groupe, à partir de tes revenus, de tes dépenses fixes, du fonds de roulement et de ton objectif d'épargne. Tu vérifies, ajustes et appliques — et tu peux annuler." },
      { id: 'ai-budget-once', q: 'Pourquoi ne puis-je demander le budget qu’une fois par mois ?', a: "Chaque demande utilise l'IA et la proposition est gardée pour le reste du mois : tu peux l'appliquer et l'annuler autant de fois que tu veux. Le mois suivant, tu peux en demander une nouvelle." },
      { id: 'fixed-costs', q: 'Que sont les dépenses fixes et le fonds de roulement ?', a: "Les dépenses fixes sont des dépenses régulières qu'on ne réduit pas (loyer, factures, abonnements) : l'app ne baisse jamais leur limite. Le fonds de roulement est la part des revenus gardée libre pour les imprévus — 10 % par défaut." },
    ],
  },
  {
    id: 'ai',
    title: 'IA et confidentialité',
    items: [
      { id: 'ai-data', q: "Quelles données sont envoyées à l'IA ?", a: 'Seulement des totaux déjà calculés (par mois et par catégorie), les noms des catégories et, pour le budget suggéré, tes revenus attendus et les pourcentages que tu choisis. Les descriptions de tes transactions ne sont jamais envoyées.' },
      { id: 'scan-privacy', q: 'Que deviennent les photos des reçus ?', a: "L'image ou le PDF est envoyé à l'IA uniquement pour lire les champs, est traité en mémoire et n'est pas conservé. Évite les documents contenant des données personnelles inutiles." },
      { id: 'investment-tips', q: "Les conseils d'investissement sont-ils un conseil financier ?", a: 'Non. Ce sont des contenus éducatifs adaptés à ton profil de risque (Premium), qui peuvent contenir des erreurs. Les décisions et les risques t’appartiennent.' },
    ],
  },
  {
    id: 'forecasts',
    title: 'Prévisions',
    items: [
      { id: 'forecast-how', q: 'Comment fonctionnent les prévisions ?', a: "Avec Premium, un modèle d'IA apprend de tes mois complets et prévoit les revenus, les dépenses et le solde des 3 prochains mois. Il fonctionne sur ton appareil : tes données ne le quittent pas pour cela." },
      { id: 'forecast-simple', q: 'Pourquoi est-il écrit « prévision simple » ?', a: "Le modèle d'IA a besoin de 5 mois complets. Avec 2 à 4, l'app suit la tendance de tes mois. Le mois en cours ne compte jamais, car il est encore incomplet." },
    ],
  },
  {
    id: 'subscription',
    title: 'Abonnement et paiements',
    items: [
      { id: 'plans', q: 'Quelles formules existent ?', a: 'Gratuite, Pro et Premium. Consulte le contenu de chacune et les prix dans Abonnement.' },
      { id: 'payment-methods', q: 'Comment puis-je payer ?', a: "Sur le site : carte ou prélèvement (avec renouvellement automatique), MB WAY ou Multibanco (paiement unique pour 1, 3, 6 ou 12 mois). Dans l'app Android, via Google Play." },
      { id: 'cancel', q: 'Comment résilier mon abonnement ?', a: "Si tu as acheté sur le site, dans Paramètres → Abonnement ; tu gardes l'accès jusqu'à la fin de la période payée. Si tu as acheté dans l'app Android, résilie dans Google Play (Paiements et abonnements)." },
      { id: 'refund', q: 'Puis-je être remboursé ?', a: 'Oui, dans les 14 premiers jours et sans donner de motif (droit de rétractation) : écris-nous. Nous remboursons la totalité et le compte est supprimé — les détails sont dans les Conditions, point 4.' },
    ],
  },
  {
    id: 'account',
    title: 'Sécurité et compte',
    items: [
      { id: 'forgot-password', q: "J'ai oublié mon mot de passe. Que faire ?", a: "Sur l'écran de connexion, touche « Mot de passe oublié ? » : nous t'envoyons un lien, valable 30 minutes, pour en définir un nouveau." },
      { id: 'two-factor', q: "Comment activer l'authentification à deux facteurs ?", a: "Dans les Paramètres, à l'authentification à deux facteurs, scanne le code QR avec une app d'authentification et garde les codes de récupération. Ensuite, la connexion demande aussi le code de l'app." },
      { id: 'biometric', q: "Puis-je verrouiller l'app avec mon empreinte ?", a: "Oui, dans l'app Android, dans Paramètres → Verrouillage biométrique. Il faut une empreinte ou un visage enregistré sur le téléphone." },
      { id: 'export-delete', q: 'Comment exporter ou supprimer mes données ?', a: 'Dans Paramètres → Confidentialité et données, tu peux tout télécharger en JSON ou supprimer ton compte et toutes les données.' },
      { id: 'language', q: 'Comment changer de langue ?', a: "Sur l'écran de connexion ou dans Paramètres → Langue. Si tu n'en choisis pas, l'app suit la langue de ton téléphone." },
    ],
  },
]
