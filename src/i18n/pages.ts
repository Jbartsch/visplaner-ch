import type { Lang } from '@/types/water'

// Copy for static landing pages. IT machine-drafted – review pending (STATUS.md).
type L4 = Record<Lang, string>
const f = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '')

const P = {
  home: { de: 'Startseite', en: 'Home', fr: 'Accueil', it: 'Home' },
  openMap: { de: 'Auf der Karte öffnen', en: 'Open on the map', fr: 'Ouvrir sur la carte', it: 'Apri sulla mappa' },
  openMapAll: { de: 'Interaktive Karte öffnen', en: 'Open the interactive map', fr: 'Ouvrir la carte interactive', it: 'Apri la mappa interattiva' },
  shortAnswer: { de: 'Kurzantwort', en: 'Short answer', fr: 'Réponse courte', it: 'Risposta breve' },
  faq: { de: 'Häufige Fragen', en: 'Frequently asked questions', fr: 'Questions fréquentes', it: 'Domande frequenti' },
  waterTitle: { de: '{name}: Fischereipatent & wo kaufen', en: '{name}: fishing permit & where to buy', fr: '{name} : permis de pêche et où l’acheter', it: '{name}: patente di pesca e dove acquistarla' },
  waterDesc: {
    de: 'Fischen am {name} (Kanton {canton}): {permit}. {where}. Datenqualität: {quality}. Nur Information.',
    en: 'Fishing at {name} (canton {canton}): {permit}. {where}. Data quality: {quality}. Informational only.',
    fr: 'Pêcher à {name} (canton {canton}) : {permit}. {where}. Qualité des données : {quality}. Information seulement.',
    it: 'Pescare a {name} (Cantone {canton}): {permit}. {where}. Qualità dei dati: {quality}. Solo informazione.',
  },
  answerWater: {
    de: 'Der Eintrag «{name}» (Kanton {canton}) ist als «{permit}» erfasst. Prüfe vor dem Kauf den Geltungsbereich für deinen geplanten Angelplatz.',
    en: 'The entry “{name}” (canton {canton}) is classified as “{permit}”. Before buying, check that this covers the spot where you plan to fish.',
    fr: 'L’entrée « {name} » (canton {canton}) est classée « {permit} ». Avant d’acheter, vérifiez que cela couvre l’endroit où vous comptez pêcher.',
    it: 'La voce «{name}» (Cantone {canton}) è classificata come «{permit}». Prima di acquistare verifica che copra il luogo dove intendi pescare.',
  },
  answerStub: {
    de: 'Für {name} (Kanton {canton}) ist der Bewilligungstyp in unseren Daten nicht bestimmt (unvollständig). Bitte vor dem Fischen beim Kanton nachfragen.',
    en: 'For {name} (canton {canton}) the permit type is not determined in our data (stub). Please check with the canton before fishing.',
    fr: 'Pour {name} (canton {canton}), le type de permis n’est pas déterminé dans nos données (incomplet). Renseignez-vous auprès du canton.',
    it: 'Per {name} (Cantone {canton}) il tipo di patente non è determinato nei nostri dati (incompleto). Informarsi presso il Cantone.',
  },
  buyAt: { de: 'Kaufen / beziehen', en: 'Buy / obtain', fr: 'Acheter / obtenir', it: 'Acquistare / ottenere' },
  qWhich: { de: 'Welche Bewilligung brauche ich zum Fischen am {name}?', en: 'Which permit do I need to fish at {name}?', fr: 'Quel permis faut-il pour pêcher à {name} ?', it: 'Quale permesso serve per pescare a {name}?' },
  qWhere: { de: 'Wo kann ich die Bewilligung für {name} kaufen?', en: 'Where can I buy the permit for {name}?', fr: 'Où acheter le permis pour {name} ?', it: 'Dove posso acquistare il permesso per {name}?' },
  qBorder: { de: 'Ist {name} ein Grenz- oder interkantonales Gewässer?', en: 'Is {name} a border or intercantonal water?', fr: '{name} est-il un plan d’eau frontalier ou intercantonal ?', it: '{name} è un’acqua di confine o intercantonale?' },
  qReliable: { de: 'Wie zuverlässig ist diese Angabe?', en: 'How reliable is this information?', fr: 'Quelle est la fiabilité de cette information ?', it: 'Quanto è affidabile questa informazione?' },
  qCanton: { de: 'Wie ist die Angelfischerei im Kanton {canton} geregelt?', en: 'How is angling regulated in the canton of {canton}?', fr: 'Comment la pêche est-elle réglée dans le canton de {canton} ?', it: 'Come è regolata la pesca nel Cantone {canton}?' },
  qWhereCanton: { de: 'Wo kaufe ich ein Fischereipatent im Kanton {canton}?', en: 'Where do I buy a fishing permit in the canton of {canton}?', fr: 'Où acheter un permis de pêche dans le canton de {canton} ?', it: 'Dove acquisto una patente di pesca nel Cantone {canton}?' },
  qFree: { de: 'Kann man im Kanton {canton} ohne Patent fischen?', en: 'Can you fish without a permit in the canton of {canton}?', fr: 'Peut-on pêcher sans permis dans le canton de {canton} ?', it: 'Si può pescare senza patente nel Cantone {canton}?' },
  aFreeYes: {
    de: 'Unsere Daten enthalten {n} Gewässer bzw. Abschnitte mit Freiangelrecht oder freier Uferfischerei in {canton}. Regeln, Schonzeiten und Mindestmasse gelten trotzdem – Details auf der Gewässerseite und beim Kanton.',
    en: 'Our data lists {n} waters or sections with free angling or free shore fishing in {canton}. Rules, closed seasons and minimum sizes still apply – see the water page and the canton.',
    fr: 'Nos données recensent {n} plans d’eau ou secteurs en pêche libre dans le canton de {canton}. Règles, périodes de protection et tailles minimales restent applicables.',
    it: 'I nostri dati elencano {n} acque o tratti con pesca libera nel Cantone {canton}. Regole, periodi di protezione e misure minime valgono comunque.',
  },
  aFreeNo: {
    de: 'In unseren Daten ist für {canton} kein Gewässer als Freiangel-Gewässer erfasst. Das heisst nicht, dass es keine gibt – einige Kantone erlauben z. B. Uferfischerei an grossen Seen ohne Patent. Bitte die kantonalen Regeln prüfen.',
    en: 'Our data has no water marked as free angling for {canton}. That does not mean there are none – some cantons allow e.g. shore fishing on large lakes without a permit. Please check the cantonal rules.',
    fr: 'Nos données ne recensent aucune eau en pêche libre pour {canton}. Cela ne signifie pas qu’il n’y en a pas – vérifiez les règles cantonales.',
    it: 'Nei nostri dati nessuna acqua è segnata come pesca libera per {canton}. Ciò non significa che non ce ne siano – verificare le regole cantonali.',
  },
  aWhereNone: {
    de: 'Für diesen Gewässertyp ist kein Online-Kauf beim Kanton hinterlegt: {where}.',
    en: 'No online purchase from the canton is on file for this type of water: {where}.',
    fr: 'Aucun achat en ligne du canton n’est répertorié pour ce type d’eau : {where}.',
    it: 'Nessun acquisto online del Cantone registrato per questo tipo di acqua: {where}.',
  },
  aReliable: {
    de: 'Datenqualität «{quality}»: {help} Quelle: {source}. Massgebend sind immer die kantonalen Vorschriften.',
    en: 'Data quality "{quality}": {help} Source: {source}. Cantonal regulations always prevail.',
    fr: 'Qualité « {quality} » : {help} Source : {source}. Les prescriptions cantonales font toujours foi.',
    it: 'Qualità «{quality}»: {help} Fonte: {source}. Fanno sempre fede le prescrizioni cantonali.',
  },
  cantonTitle: { de: 'Fischen im Kanton {canton}: Patent, Pacht & wo kaufen', en: 'Fishing in the canton of {canton}: permits, leases & where to buy', fr: 'Pêche dans le canton de {canton} : permis, affermage et où acheter', it: 'Pesca nel Cantone {canton}: patenti, affitti e dove acquistare' },
  cantonDesc: {
    de: 'Fischereipatent im Kanton {canton}: {system} {n} Gewässer kartiert, Datenqualität {quality}. Nur Information.',
    en: 'Fishing permits in the canton of {canton}: {system} {n} waters mapped, data quality {quality}. Informational only.',
    fr: 'Permis de pêche dans le canton de {canton} : {system} {n} plans d’eau, qualité {quality}. Information seulement.',
    it: 'Patenti di pesca nel Cantone {canton}: {system} {n} acque, qualità {quality}. Solo informazione.',
  },
  coverageTitle: { de: 'Datenabdeckung', en: 'Data coverage', fr: 'Couverture des données', it: 'Copertura dei dati' },
  geometry: { de: 'Geometrie', en: 'Geometry', fr: 'Géométrie', it: 'Geometria' },
  rules: { de: 'Regeln', en: 'Rules', fr: 'Règles', it: 'Regole' },
  buyLinks: { de: 'Kauf-Links', en: 'Buy links', fr: 'Liens d’achat', it: 'Link d’acquisto' },
  watersIn: { de: 'Gewässer im Kanton {canton}', en: 'Waters in the canton of {canton}', fr: 'Plans d’eau du canton de {canton}', it: 'Acque nel Cantone {canton}' },
  borderIn: { de: 'Grenz- und interkantonale Gewässer', en: 'Border and intercantonal waters', fr: 'Eaux frontalières et intercantonales', it: 'Acque di confine e intercantonali' },
  moreWaters: { de: '… und {n} weitere auf der Karte', en: '… and {n} more on the map', fr: '… et {n} autres sur la carte', it: '… e altre {n} sulla mappa' },
  sameCanton: { de: 'Weitere Gewässer im Kanton {canton}', en: 'More waters in the canton of {canton}', fr: 'Autres plans d’eau du canton de {canton}', it: 'Altre acque nel Cantone {canton}' },
  homeTitle: { de: 'Fischereipatente in der Schweiz – alle 26 Kantone', en: 'Fishing permits in Switzerland – all 26 cantons', fr: 'Permis de pêche en Suisse – les 26 cantons', it: 'Patenti di pesca in Svizzera – tutti i 26 cantoni' },
  homeDesc: {
    de: 'Welches Fischereipatent brauche ich wo in der Schweiz – Patent, Pacht oder Freiangel – und wo kaufe ich es? Übersicht aller 26 Kantone mit Datenqualität. Nur Information.',
    en: 'Which fishing permit do I need where in Switzerland – cantonal permit, lease or free angling – and where do I buy it? All 26 cantons with data quality. Informational only.',
    fr: 'Quel permis de pêche faut-il en Suisse – permis cantonal, affermage ou pêche libre – et où l’acheter ? Les 26 cantons avec qualité des données.',
    it: 'Quale patente di pesca serve in Svizzera – patente cantonale, affitto o pesca libera – e dove acquistarla? Tutti i 26 cantoni con qualità dei dati.',
  },
  homeAnswer: {
    de: 'In der Schweiz regelt jeder Kanton die Angelfischerei selbst – es gibt keinen nationalen Fischerpass. Je nach Gewässer brauchst du ein Kantonspatent, eine Karte vom Pächter – oder du darfst im Rahmen des Freiangelrechts unter bestimmten Bedingungen ohne Patent fischen. Wähle deinen Kanton:',
    en: 'In Switzerland each canton regulates angling itself – there is no national fishing licence. Depending on the water you need a cantonal permit, a card from the lessee – or, under a free-angling right, you may fish without a permit under specific conditions. Pick your canton:',
    fr: 'En Suisse, chaque canton règle la pêche – il n’existe pas de permis national. Selon le plan d’eau, il faut un permis cantonal, l’autorisation du détenteur du droit de pêche, ou vous pouvez pêcher sans permis dans le cadre du droit de pêche libre, sous conditions. Choisissez votre canton :',
    it: 'In Svizzera ogni cantone regola la pesca – non esiste una patente nazionale. A seconda dell’acqua serve una patente cantonale, una tessera dell’affittuario – oppure, dove vige il diritto di pesca libera, si può pescare senza patente a determinate condizioni. Scegli il tuo cantone:',
  },
  qNational: { de: 'Gibt es ein Fischereipatent für die ganze Schweiz?', en: 'Is there a fishing permit for all of Switzerland?', fr: 'Existe-t-il un permis de pêche pour toute la Suisse ?', it: 'Esiste una patente di pesca per tutta la Svizzera?' },
  aNational: {
    de: 'Nein. Die Fischerei ist kantonal geregelt. Für interkantonale Seen (z. B. Vierwaldstättersee, Zürichsee, Neuenburgersee) und Grenzgewässer (Genfersee, Bodensee, Lago Maggiore, Luganersee, Doubs, Hochrhein) gelten Konkordate oder Staatsverträge – das passende Patent hängt vom Ufer bzw. Kanton ab.',
    en: 'No. Fishing is regulated by the cantons. For intercantonal lakes (e.g. Lake Lucerne, Lake Zurich, Lake Neuchâtel) and border waters (Lake Geneva, Lake Constance, Lake Maggiore, Lake Lugano, Doubs, High Rhine) concordats or treaties apply – the right permit depends on the shore / canton.',
    fr: 'Non. La pêche est cantonale. Pour les lacs intercantonaux (Quatre-Cantons, Zurich, Neuchâtel) et frontaliers (Léman, Constance, Majeur, Lugano, Doubs, Haut-Rhin), des concordats ou traités s’appliquent – le permis dépend de la rive / du canton.',
    it: 'No. La pesca è regolata dai cantoni. Per i laghi intercantonali (Quattro Cantoni, Zurigo, Neuchâtel) e di confine (Lemano, Costanza, Maggiore, Lugano, Doubs, Alto Reno) valgono concordati o trattati – la patente dipende dalla riva / dal cantone.',
  },
  qPatentPacht: { de: 'Was ist der Unterschied zwischen Patent und Pacht?', en: 'What is the difference between a permit (Patent) and a lease (Pacht)?', fr: 'Quelle différence entre permis et affermage ?', it: 'Qual è la differenza tra patente e affitto?' },
  aPatentPacht: {
    de: 'Patentgewässer: Der Kanton verkauft das Fischereirecht direkt (Webshop, App, Verkaufsstellen). Pachtgewässer: Das Fischereirecht ist an Vereine oder Personen verpachtet; Karten gibt es nur bei diesen Pächtern. Daneben gibt es private Fischereirechte und Schongebiete.',
    en: 'Patent waters: the canton sells the fishing right directly (web shop, app, sales points). Leased waters (Pacht): the right is leased to clubs or individuals; cards only from these lessees. There are also private fishing rights and protected areas.',
    fr: 'Eaux à permis : le canton vend directement le droit de pêche. Eaux affermées : le droit est loué à des sociétés ou personnes ; cartes uniquement auprès d’elles. Il existe aussi des droits privés et des réserves.',
    it: 'Acque a patente: il cantone vende direttamente il diritto di pesca. Acque affittate: il diritto è affittato a società o persone; tessere solo da loro. Esistono anche diritti privati e riserve.',
  },
  table: { de: 'Kanton', en: 'Canton', fr: 'Canton', it: 'Cantone' },
  system: { de: 'System', en: 'System', fr: 'Système', it: 'Sistema' },
} satisfies Record<string, L4>

export type PKey = keyof typeof P
export function p(key: PKey, lang: Lang, vars: Record<string, string> = {}): string {
  return f(P[key][lang] ?? P[key].de, vars)
}
