import type { LegalDoc } from "../legalContent";

// Política de Privacidade e Termos em francês — tradução da versão EN de
// utils/legalContent.ts. Mudar um texto legal é mudá-lo nas 6 línguas.
export function legalFr(updated: string): { privacy: LegalDoc; terms: LegalDoc } {
  return {
    privacy: {
      title: "Politique de confidentialité",
      sections: [
        {
          h: "1. Qui est responsable de tes données",
          p: [
            "Le responsable du traitement est Dinis Miguel da Silva Costa, numéro fiscal (NIF) : 176280340. Pour toute question relative à la confidentialité : dinismiguelcosta@gmail.com.",
          ],
        },
        {
          h: "2. Quelles données nous traitons",
          p: [
            "Compte : nom, e-mail et un hachage de ton mot de passe (nous ne conservons jamais le mot de passe lui-même). Si tu actives l'authentification à deux facteurs, nous conservons le secret de l'authentificateur chiffré et uniquement des hachages des codes de récupération.",
            "Données financières que tu saisis : transactions, catégories, groupes et budgets, ainsi que ton registre d'investissements. Si tu remplis le questionnaire de profil d'investisseur, nous conservons tes réponses.",
            "Abonnement : formule, statut et références de paiement. Les données de carte, d'IBAN ou de téléphone MB WAY sont collectées directement par EasyPay et ne passent jamais par nos serveurs. Pour les achats effectués dans l'app Android, le paiement a lieu sur Google Play : nous ne conservons que l'identifiant de l'achat, le produit et le statut de l'abonnement que Google nous communique.",
            "Préférences : langue de l'interface et, sur Android, si tu as activé le verrouillage biométrique (conservé uniquement sur ton téléphone ; l'app ne reçoit jamais ton empreinte digitale ni ton visage).",
            "Données techniques : ton adresse IP sert à déduire ton pays (au moyen d'une base de données locale, sans l'envoyer à des tiers) et à limiter les tentatives abusives ; nous conservons des journaux de sécurité (par exemple les tentatives de connexion échouées) sans mots de passe, codes ni contenu de tes données.",
          ],
        },
        {
          h: "3. Pourquoi nous utilisons les données et sur quelle base légale",
          p: [
            "Fournir le service que tu as demandé (gestion des finances, abonnements, prévisions et statistiques) : exécution du contrat.",
            "Sécurité du compte et prévention des abus (limites de tentatives, journaux de sécurité, 2FA) : intérêt légitime.",
            "Respecter les obligations légales applicables, par exemple fiscales et de facturation : obligation légale.",
            "Les fonctionnalités d'intelligence artificielle n'envoient des données que lorsque tu les utilises (voir le point 5).",
          ],
        },
        {
          h: "4. Avec qui nous partageons les données (sous-traitants)",
          p: [
            "MongoDB Atlas — hébergement de la base de données où sont conservées tes données.",
            "Netlify — hébergement de l'application ; traite les requêtes adressées à l'app, y compris l'adresse IP.",
            "EasyPay — traitement des paiements (carte, prélèvement, MB WAY, Multibanco).",
            "Google (Google Play) — distribution de l'app Android et paiement des abonnements achetés dans celle-ci. Google traite ces paiements en tant que vendeur, selon sa propre politique de confidentialité ; pour associer l'achat à ton compte, nous ne lui envoyons qu'un identifiant de compte chiffré (jamais ton nom, ton e-mail ni les données financières de l'app).",
            "Anthropic — fournisseur du modèle d'IA utilisé pour les fonctionnalités décrites au point 5.",
            "Twelve Data — données de marché et taux de change. Ne reçoit que des symboles de marché et des paires de devises, jamais de données personnelles ni tes montants.",
            "Sentry — surveillance des erreurs techniques, configurée pour ne pas envoyer le contenu des requêtes, les cookies ni les en-têtes.",
            "Certains de ces fournisseurs peuvent avoir des sous-traitants ou une infrastructure en dehors de l'Espace économique européen ; dans ce cas, les garanties prévues par le RGPD s'appliquent, notamment les clauses contractuelles types de la Commission européenne.",
          ],
        },
        {
          h: "5. Intelligence artificielle — ce qui est envoyé",
          p: [
            "Interprétation des statistiques (formules Pro et Premium) : nous envoyons des montants agrégés (totaux par mois et par catégorie) et les noms des catégories — jamais les descriptions de tes transactions.",
            "Conseils d'investissement (formule Premium) : nous envoyons les réponses de ton profil d'investisseur, un résumé agrégé de tes finances et le contexte de marché du jour. Pour l'instant, nous n'envoyons aucune donnée de ton registre d'investissements (portefeuille) ; si cela devait changer, cette politique serait mise à jour avant.",
            "Budget suggéré (formule Premium) : pour chaque catégorie de dépenses, nous envoyons son nom et ses totaux mensuels déjà calculés (moyenne, minimum, maximum), tes revenus mensuels attendus et les pourcentages de fonds de roulement et d'épargne que tu choisis — jamais les descriptions de tes transactions. Uniquement lorsque tu demandes une proposition, au maximum une fois par mois.",
            "Numérisation de documents (formules Pro et Premium) : l'image ou le PDF que tu importes est envoyé à Anthropic pour en extraire les champs, est traité en mémoire et n'est pas conservé par nous. Évite d'importer des documents contenant des données personnelles inutiles (par exemple le numéro fiscal ou l'adresse sur une fiche de paie).",
            "Le contenu généré par l'IA est fourni à titre d'information uniquement, peut contenir des erreurs et ne constitue pas un conseil financier.",
          ],
        },
        {
          h: "6. Combien de temps nous conservons les données",
          p: [
            "Tant que ton compte existe. Lorsque tu supprimes ton compte (Paramètres → Confidentialité et données), nous supprimons tes données de la base de données. Les sauvegardes peuvent conserver les données jusqu'à 3 ans avant d'être remplacées.",
            "Nous pouvons conserver uniquement ce qui est strictement nécessaire au respect des obligations légales (par exemple les registres de facturation) pendant la durée exigée par la loi.",
          ],
        },
        {
          h: "7. Tes droits",
          p: [
            "Accès et portabilité : dans Paramètres → Confidentialité et données, tu peux télécharger toutes tes données au format JSON.",
            "Effacement : dans la même section, tu peux supprimer ton compte et toutes les données associées. Si tu as un abonnement à renouvellement automatique, il est d'abord résilié. Si tu n'as plus accès à l'app, demande la suppression par e-mail à dinismiguelcosta@gmail.com depuis l'adresse associée au compte.",
            "Supprimer des données sans supprimer le compte : tu peux supprimer à tout moment, dans l'app, des transactions, catégories, groupes et investissements un par un. Pour demander la suppression d'autres données précises sans supprimer ton compte, écris à dinismiguelcosta@gmail.com depuis l'adresse associée au compte.",
            "Rectification : tu peux corriger tes données directement dans l'app. Tu as aussi le droit à la limitation et à l'opposition au traitement ; contacte-nous à dinismiguelcosta@gmail.com.",
            "Tu peux introduire une réclamation auprès de l'autorité portugaise de protection des données (CNPD), www.cnpd.pt, ou de l'autorité de ton pays.",
          ],
        },
        {
          h: "8. Cookies et stockage local",
          p: [
            "Nous utilisons uniquement des cookies strictement nécessaires : « session » (te garde connecté, jusqu'à 30 jours), « pending_2fa » (10 minutes, uniquement pendant la vérification à deux facteurs) et « financeflow_locale » (ta langue). Nous conservons aussi ta préférence de verrouillage biométrique dans le stockage local de ton téléphone. Nous n'utilisons pas de cookies publicitaires ni d'analyse comportementale.",
          ],
        },
        {
          h: "9. Sécurité",
          p: [
            "Mots de passe conservés sous forme de hachage (scrypt), sessions signées, limitation des tentatives, authentification à deux facteurs facultative, secrets 2FA chiffrés au repos et connexions chiffrées (HTTPS). Aucun système n'est infaillible ; en cas de violation de données te concernant, nous t'en informerons, ainsi que l'autorité, conformément à la loi.",
          ],
        },
        {
          h: "10. Modifications",
          p: [
            "Si nous modifions cette politique de manière importante, nous te prévenons dans l'app. Dernière mise à jour : " + updated + ".",
          ],
        },
      ],
    },
    terms: {
      title: "Conditions d'utilisation",
      sections: [
        {
          h: "1. Acceptation",
          p: [
            "En créant un compte ou en utilisant FinanceFlow, tu acceptes ces conditions et la Politique de confidentialité. Le service est fourni par Dinis Miguel da Silva Costa, numéro fiscal (NIF) : 176280340, contact dinismiguelcosta@gmail.com.",
          ],
        },
        {
          h: "2. Le service",
          p: [
            "FinanceFlow est une application de gestion des finances personnelles (suivi des transactions, budgets, statistiques, prévisions et registre d'investissements), disponible sur le web et sur Android.",
          ],
        },
        {
          h: "3. Ton compte",
          p: [
            "Tu es responsable de la sécurité de ton mot de passe et de ton authentificateur, ainsi que de toute activité sur ton compte. Nous te recommandons d'activer l'authentification à deux facteurs et de conserver tes codes de récupération. Préviens-nous immédiatement si tu soupçonnes un accès non autorisé.",
            "Tu dois fournir des informations exactes et avoir la capacité juridique de conclure ce contrat.",
          ],
        },
        {
          h: "4. Formules et paiements",
          p: [
            "Il existe une formule Gratuite avec des limites et des formules payantes (Pro et Premium) avec davantage de fonctionnalités, au prix indiqué dans l'app au moment de l'abonnement. Sur le site, les paiements sont traités par EasyPay ; dans l'app Android, par Google Play. La formule est associée à ton compte et vaut pour les deux versions.",
            "Carte et prélèvement : abonnement à renouvellement automatique jusqu'à ce que tu le résilies (Paramètres → Abonnement) ; tu gardes l'accès jusqu'à la fin de la période déjà payée.",
            "MB WAY et Multibanco : paiement unique pour une période fixe (1, 3, 6 ou 12 mois), sans renouvellement automatique ; l'accès prend fin à la fin de la période payée, sauf si tu paies à nouveau. Une référence non payée ne donne pas accès à la formule.",
            "Google Play (app Android) : la facturation, le renouvellement automatique et la résiliation sont gérés par Google Play, selon les conditions de Google ; le paiement unique pour une période fixe est aussi disponible. Une formule achetée sur Google Play se gère sur Google Play, et une formule achetée sur le site se gère sur le site ; il n'est pas possible d'avoir les deux actives en même temps.",
            "Droit de rétractation et remboursements : si tu es consommateur, tu peux te rétracter du contrat dans un délai de 14 jours à compter de sa conclusion, sans donner de motif, en nous contactant à dinismiguelcosta@gmail.com. Nous ne déduisons aucun montant pour le service déjà utilisé pendant ce délai : nous remboursons l'intégralité du montant payé, dans un délai de 14 jours à compter du moment où nous avons connaissance de ta décision, par le même moyen de paiement que celui de l'achat lorsque c'est possible. En contrepartie du remboursement intégral, ton compte est supprimé et tu ne peux pas créer de nouveau compte avec le même e-mail pendant les 6 mois suivants ; ce blocage ne s'applique qu'à ce cas, et non à une suppression de compte dans d'autres circonstances (voir le point 8). Si le service ne fonctionne pas comme convenu, tu as droit à sa mise en conformité et, si elle est impossible ou disproportionnée, à une réduction du prix ou à la résolution du contrat avec remboursement, conformément à la loi.",
          ],
        },
        {
          h: "5. Contenu généré par l'IA et informations financières",
          p: [
            "Les interprétations des statistiques, les conseils d'investissement, les prévisions, le budget suggéré et la lecture automatique de documents sont produits par des systèmes automatisés, sont fournis à titre d'information et d'éducation uniquement et peuvent contenir des erreurs.",
            "Rien dans l'app ne constitue un conseil financier, d'investissement, fiscal ou juridique, ni une recommandation personnalisée d'acheter ou de vendre un produit financier. Les décisions et les risques t'appartiennent. Vérifie toujours les données extraites d'un document avant de les enregistrer.",
          ],
        },
        {
          h: "6. Utilisation acceptable",
          p: [
            "Tu ne peux pas utiliser le service à des fins illicites, tenter d'accéder aux comptes ou aux données d'autres personnes, contourner les limites ou les mesures de sécurité, surcharger le service ou en faire de l'ingénierie inverse au-delà de ce que la loi permet.",
          ],
        },
        {
          h: "7. Disponibilité et limitation de responsabilité",
          p: [
            "Nous faisons en sorte que le service reste disponible, mais l'app est fournie « telle quelle » et « selon disponibilité », sans garantie expresse ou implicite, notamment quant à l'exactitude des données, au fonctionnement ininterrompu, à l'absence d'erreurs, à l'adéquation à un usage particulier ou à l'absence de violation des droits de tiers.",
            "Nous ne garantissons pas que les analyses, prévisions, interprétations des statistiques ou catégorisations des revenus et dépenses produites par l'app soient exemptes d'erreurs. L'app est un outil d'aide à l'organisation de tes finances personnelles et ne constitue pas un conseil professionnel financier, fiscal, juridique ou d'investissement (voir aussi le point 5). Toute décision financière prise sur la base des informations de l'app relève entièrement de ta responsabilité.",
            "Conformément au décret-loi portugais n° 446/85 (clauses contractuelles générales) et au Code civil portugais, notre responsabilité civile pour les dommages qui te sont causés est limitée aux cas de faute intentionnelle ou de faute lourde.",
            "Sauf lorsque la loi applicable l'interdit, nous ne répondons pas : des dommages indirects, accessoires, punitifs ou consécutifs ; de la perte de bénéfices, de revenus, de données ou d'opportunités commerciales ; ni des dommages résultant de pannes de réseau, d'interruptions du service ou d'un accès non autorisé par des tiers dû à ta propre négligence dans la garde de tes identifiants.",
            "Dans toute la mesure permise par la loi portugaise, notre responsabilité totale cumulée pour toute réclamation liée à l'utilisation de l'app est limitée au montant total des frais d'abonnement que tu as effectivement payés au cours des 12 mois précédant immédiatement l'événement à l'origine de la responsabilité. Si tu étais sur la formule Gratuite, ou en période d'essai gratuite, au moment de l'événement, notre responsabilité maximale est limitée à 50,00 €. Rien dans cette clause ne limite les droits que la loi portugaise te garantit de manière impérative, notamment ceux du point 4 (droit de rétractation et conformité du service).",
          ],
        },
        {
          h: "8. Résiliation et fermeture du compte",
          p: [
            "Tu peux résilier ton abonnement et supprimer ton compte à tout moment dans les Paramètres ; la suppression efface tes données (voir la Politique de confidentialité) et n'empêche pas la création d'un nouveau compte. La seule exception est la suppression résultant de l'exercice du droit de rétractation (point 4), qui entraîne un blocage de 6 mois. Nous pouvons suspendre les comptes qui enfreignent ces conditions ou sont utilisés de manière abusive.",
          ],
        },
        {
          h: "9. Modifications, droit applicable et litiges",
          p: [
            "Nous pouvons modifier ces conditions et te prévenons dans l'app avant l'entrée en vigueur des modifications importantes. Droit applicable : ces conditions et tout litige lié à l'utilisation de l'app sont régis par le droit portugais ; si tu es un consommateur résidant dans un autre État membre de l'Union européenne, ce choix ne te prive pas de la protection des règles impératives de ton pays de résidence. Juridiction : en cas de procédure judiciaire, en tant que consommateur, tu peux saisir les tribunaux portugais ou ceux de l'État membre de l'Union européenne où tu résides.",
            "Règlement extrajudiciaire des litiges : conformément à la loi portugaise n° 144/2015, en cas de litige de consommation que nous ne parvenons pas à résoudre directement avec toi, tu peux t'adresser au Centre d'arbitrage des litiges de consommation de Lisbonne (Centro de Arbitragem de Conflitos de Consumo de Lisboa, CACCL) — Rua dos Douradores, n.º 112, 2.º, 1100-207 Lisbonne, Portugal ; e-mail juridico@centroarbitragemlisboa.pt ; téléphone (+351) 218 80 70 30 ; www.centroarbitragemlisboa.pt — ou au centre d'arbitrage de ta région de résidence.",
            "Livre de réclamations électronique : conformément à la loi portugaise, nous mettons à disposition un Livre de réclamations électronique (Livro de Reclamações Eletrónico), accessible depuis le lien en bas de la page de connexion.",
            "Dernière mise à jour : " + updated + ".",
          ],
        },
      ],
    },
  };
}
