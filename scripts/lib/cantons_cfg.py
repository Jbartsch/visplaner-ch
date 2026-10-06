"""Per-canton configuration: names, permit system, rule texts, buy/info links, sources.

Texts are short paraphrases of the cantonal pages linked in `links`/`sources`.
DE is authoritative; EN/FR written by hand; IT machine-drafted (review pending, see STATUS.md).
`verified`: True = URL checked on 2026-10-06 (HTTP 200 and the page is the expected cantonal/seller page;
checked from the build box, or via an external fetch where the box got a TLS reset, e.g. be.ch, ur.ch, ow.ch, nw.ch, gl.ch).
False = could not be confirmed (UR web shop: HTTP 500/timeout; fischerei.ai.ch: 403/TLS) – shown as "link not checked".
"""

def T(de, en, fr, it=None):
    return {'de': de, 'en': en, 'fr': fr, 'it': it or fr}

def link(kind, label, url, verified=True, applies=None):
    # kind: buy | app | prices | pacht | info | enquire | map
    return {'kind': kind, 'label': label, 'url': url, 'verified': verified, 'applies': applies or []}

PAT = ['patent', 'mixed', 'freiangel']
PACHT = ['pacht', 'mixed', 'unknown']

# ---------------------------------------------------------------- generic rule texts
def R_PATENT(extra=None):
    return {'permitType': 'patent', 'summary': extra or T(
        'Kantonales Patentgewässer: Fischereipatent beim Kanton kaufen (Webshop/App/Verkaufsstellen).',
        'Cantonal patent water: buy a fishing permit from the canton (web shop / app / sales points).',
        'Eaux à permis cantonal : acheter le permis de pêche auprès du canton (boutique en ligne / app / points de vente).',
        'Acque a patente cantonale: acquistare la patente di pesca dal Cantone (shop online / app / punti vendita).')}

def R_PACHT(extra=None):
    return {'permitType': 'pacht', 'summary': extra or T(
        'Das Fischereirecht ist verpachtet. Ein Kantonspatent berechtigt hier nicht zum Fischen. Ob du eine Karte erhalten kannst, klärst du beim zuständigen Pächter oder Fischereiverein.',
        'The fishing right is leased out. A cantonal permit does not entitle you to fish here. Whether you can get a card is up to the lessee or fishing club.',
        'Le droit de pêche est affermé. Un permis cantonal ne donne pas le droit de pêcher ici. Renseignez-vous auprès du détenteur du droit de pêche (fermier ou société de pêche) pour savoir si une autorisation est possible.',
        'Il diritto di pesca è dato in affitto. La patente cantonale non dà diritto a pescare qui. Se è possibile ottenere un permesso lo decide l\'affittuario o la società di pesca.')}

R_UNKNOWN = {'permitType': 'unknown', 'summary': T(
    'Regime für dieses Gewässer nicht in unseren Daten erfasst (Stub). Bitte bei der kantonalen Fischereiverwaltung nachfragen.',
    'Permit regime for this water is not in our data (stub). Please ask the cantonal fisheries office.',
    'Régime non saisi dans nos données (ébauche). Renseignez-vous auprès du service cantonal de la pêche.',
    'Regime non presente nei nostri dati (bozza). Chiedere all\'ufficio cantonale della pesca.')}

R_CLOSED = {'permitType': 'closed', 'summary': T(
    'Schongebiet / Reservat – Fischen nicht oder nur eingeschränkt erlaubt. Nichts zu kaufen.',
    'Protected area / reserve – fishing not allowed or restricted. Nothing to buy.',
    'Zone de protection / réserve – pêche interdite ou restreinte. Rien à acheter.',
    'Zona protetta / riserva – pesca vietata o limitata. Niente da acquistare.')}

R_PRIVATE = {'permitType': 'private', 'summary': T(
    'Privates Fischereirecht – Erlaubnis nur durch die Berechtigten.',
    'Private fishing right – permission only from the right holders.',
    'Droit de pêche privé – autorisation uniquement par les ayants droit.',
    'Diritto di pesca privato – permesso solo dai titolari.')}

R_FREI = {'permitType': 'freiangel', 'summary': T(
    'Freiangelrecht gemäss kantonalem Datensatz – Fischen ohne Patent erlaubt (Regeln/Schonzeiten gelten).',
    'Free angling right per cantonal dataset – fishing without a permit (rules/closed seasons apply).',
    'Droit de pêche libre selon les données cantonales – pêche sans permis (règles et périodes de protection applicables).',
    'Diritto di pesca libera secondo i dati cantonali – pesca senza patente (si applicano regole e periodi di protezione).')}

def base_rules():
    return {'patent': R_PATENT(), 'pacht': R_PACHT(), 'unknown': R_UNKNOWN, 'closed': R_CLOSED,
            'private': R_PRIVATE, 'freiangel': R_FREI}

def C(code, slug, name, lang, system, links, lake='patent', river='patent', rules=None, sources=None,
      notes=None, overlay=None, river_overrides=None, lake_overrides=None):
    r = base_rules()
    r['lake'] = dict(r[lake]) if isinstance(lake, str) else lake
    r['river'] = dict(r[river]) if isinstance(river, str) else river
    r.update(rules or {})
    return {'code': code, 'slug': slug, 'name': name, 'lang': lang, 'system': system, 'links': links,
            'rules': r, 'sources': sources or [], 'notes': notes, 'overlay': overlay,
            'riverOverrides': river_overrides or {}, 'lakeOverrides': lake_overrides or {}}

SWISSTOPO_GEOM = {'label': 'swisstopo/BAFU VECTOR25 Seen + Gewässernetz 1:2 Mio', 'url': 'https://api3.geo.admin.ch', 'kind': 'geometry', 'official': True}

CANTONS = {}
def add(c): CANTONS[c['code']] = c

ZH_L = {
    'patentPage': 'https://www.zh.ch/de/umwelt-tiere/tiere/fischerei/wie-und-wo-fischen-im-kanton-zuerich/fischereipatente-beziehen-2026.html',
    'app': 'https://www.zh.ch/de/umwelt-tiere/tiere/fischerei/efj2-app.html',
    'prices': 'https://www.zh.ch/content/dam/zhweb/bilder-dokumente/themen/umwelt-tiere/tiere/fischerei-und-jagd/fischerei/fischereipatente-beziehen/preise_f%C3%BCr_fischereipatente_ab_2026.pdf',
    'reviere': 'https://www.zh.ch/de/umwelt-tiere/tiere/fischerei/fischereireviere.html',
    'verzeichnis': 'https://www.zh.ch/content/dam/zhweb/bilder-dokumente/themen/umwelt-tiere/tiere/fischerei-und-jagd/fischerei/fischereireviere/Fischereirevierverzeichnis_20260922.pdf',
    'datasheet': 'https://maps.zh.ch/system/docs/aln_fjv/fischereireviere/Fischereidatenblatt_{nr}.pdf',
    'source': 'https://geolion.zh.ch/geodatensatz/386',
}
add(C('ZH', 'zuerich', T('Zürich', 'Zurich', 'Zurich', 'Zurigo'), 'de',
      T('Gemischt: Seen (Zürich-, Greifen-, Pfäffikersee) und Rhein/Limmat-Strecken mit Kantonspatent; übrige Fliessgewässer sind Pachtreviere.',
        'Mixed: lakes (Zurich, Greifensee, Pfäffikersee) and Rhine/Limmat reaches with cantonal permit; other rivers are leased reviers.',
        'Mixte : lacs (Zurich, Greifensee, Pfäffikersee) et tronçons du Rhin/de la Limmat sous permis cantonal ; les autres cours d\'eau sont affermés.',
        'Misto: laghi (Zurigo, Greifensee, Pfäffikersee) e tratti di Reno/Limmat con patente cantonale; gli altri corsi d\'acqua sono affittati.'),
      [link('app', T('Patent digital (eFJ2 App ZH)', 'Digital permit (eFJ2 app ZH)', 'Permis numérique (app eFJ2 ZH)', 'Patente digitale (app eFJ2 ZH)'), ZH_L['app'], applies=PAT),
       link('buy', T('Patente beziehen (ZH)', 'Get permits (ZH)', 'Obtenir un permis (ZH)', 'Ottenere la patente (ZH)'), ZH_L['patentPage'], applies=PAT),
       link('prices', T('Preisliste ZH 2026 (PDF)', 'ZH price list 2026 (PDF)', 'Tarifs ZH 2026 (PDF)', 'Tariffe ZH 2026 (PDF)'), ZH_L['prices'], applies=PAT),
       link('pacht', T('Revierverzeichnis mit Pächtern (PDF)', 'Revier directory with lessees (PDF)', 'Répertoire des lots et fermiers (PDF)', 'Elenco riserve e affittuari (PDF)'), ZH_L['verzeichnis'], applies=PACHT + ['private']),
       link('info', T('Fischereireviere ZH', 'ZH fishing reviers', 'Lots de pêche ZH', 'Riserve di pesca ZH'), ZH_L['reviere'])],
      rules={
          'see': {'permitType': 'patent', 'summary': T(
              'Kantonales Patentgewässer. Seenpatent (Zürich-, Greifen-, Pfäffikersee, Ufer) oder Einzelseepatent; Tagespatent See (Ufer + Boot). Boot mit Jahrespatent nur mit Zusatz «Boot».',
              'Cantonal patent water. Lakes permit (Zurich/Greifensee/Pfäffikersee, shore) or single-lake permit; day permit (shore + boat). Boat fishing on annual permit needs the "Boot" add-on.',
              'Eaux à permis cantonal. Permis lacs (Zurich, Greifensee, Pfäffikersee, rive) ou permis d\'un lac ; permis journalier lac (rive + bateau).',
              'Acque a patente cantonale. Patente laghi (Zurigo, Greifensee, Pfäffikersee, riva) o patente singolo lago; patente giornaliera lago (riva + barca).'),
              'priceHint': T('Jahr: Seenpatent CHF 160 · Einzelsee CHF 100 (Erwachsene, 2026)', 'Year: lakes permit CHF 160 · single lake CHF 100 (adults, 2026)', 'Année : permis lacs CHF 160 · un lac CHF 100 (adultes, 2026)', 'Anno: patente laghi CHF 160 · singolo lago CHF 100 (adulti, 2026)')},
          'patent': {'permitType': 'patent', 'summary': T(
              'Kantonales Patentrevier (Flusspatent ZH: Rhein + Limmat). Tagespatent Fluss erhältlich.',
              'Cantonal permit stretch (ZH river permit: Rhine + Limmat). Day permit available.',
              'Tronçon à permis cantonal (permis rivière ZH : Rhin + Limmat). Permis journalier disponible.',
              'Tratto a patente cantonale (patente fiume ZH: Reno + Limmat). Patente giornaliera disponibile.'),
              'priceHint': T('Jahr: Flusspatent CHF 170 (Erwachsene, 2026)', 'Year: river permit CHF 170 (adults, 2026)', 'Année : permis rivière CHF 170 (adultes, 2026)', 'Anno: patente fiume CHF 170 (adulti, 2026)')},
      },
      sources=[{'label': 'Kanton Zürich OGD · Fischereireviere (geolion 386)', 'url': ZH_L['source'], 'kind': 'geometry+rules', 'official': True}],
      notes=T('Regime laut OGD-Datensatz (Stand 2010) – die Pachtperiode 2026–2034 kann abweichen, Revierverzeichnis prüfen.', 'Regime per the open dataset (as of 2010) – the 2026–2034 lease period may differ; check the revier directory.', 'Régime selon le jeu de données ouvert (état 2010) – la période d’affermage 2026–2034 peut différer.', 'Regime secondo il dataset aperto (stato 2010) – il periodo d’affitto 2026–2034 può differire.')))

BE_L = {
    'buy': 'https://www.weu.be.ch/de/start/themen/jagd-fischerei/fischerei/fischen-kanton-bern/fischereipatent-beziehen.html',
    'app': 'https://www.weu.be.ch/de/start/themen/jagd-fischerei/fischerei/fischen-kanton-bern/fischerei-app.html',
    'prices': 'https://www.weu.be.ch/de/start/themen/jagd-fischerei/fischerei/fischen-kanton-bern/fischereipatente-preise.html',
    'bkfv': 'https://www.bkfv-fcbp.ch/',
}
add(C('BE', 'bern', T('Bern', 'Bern', 'Berne', 'Berna'), 'de',
      T('Gemischt: grosse Seen, Bergseen und definierte Flussstrecken mit Kantonspatent; viele Bäche/Weiher sind Pachtstrecken (Pachtvereinigungen).',
        'Mixed: large lakes, mountain lakes and defined river reaches with cantonal permit; many streams/ponds are leased (lessee associations).',
        'Mixte : grands lacs, lacs de montagne et tronçons définis sous permis cantonal ; de nombreux ruisseaux/étangs sont affermés.',
        'Misto: grandi laghi, laghi di montagna e tratti definiti con patente cantonale; molti ruscelli/stagni sono affittati.'),
      [link('buy', T('BE-Patent online bestellen', 'Order BE permit online', 'Commander le permis BE', 'Ordinare la patente BE'), BE_L['buy'], True, PAT),
       link('app', T('App «Fischen Bern»', '"Fischen Bern" app', 'App « Fischen Bern »', 'App «Fischen Bern»'), BE_L['app'], True, PAT),
       link('prices', T('Patente & Preise BE', 'BE permits & prices', 'Permis et prix BE', 'Patenti e prezzi BE'), BE_L['prices'], True, PAT),
       link('pacht', T('Pachtvereinigungen (BKFV)', 'Bern fishing federation – lessee associations (BKFV)', 'Fédération cantonale bernoise de la pêche (FCBP)', 'Associazioni affittuari (BKFV)'), BE_L['bkfv'], True, PACHT)],
      rules={'patent': R_PATENT(T(
          'Patentgewässer laut ANGFISCH-Datensatz Kanton Bern. Tages-/Wochenpatent ohne SaNa, Monats-/Jahrespatent nur mit SaNa.',
          'Bern patent water per the ANGFISCH dataset. Day/week permit without SaNa; month/annual permit requires SaNa.',
          'Eaux à permis selon le jeu de données ANGFISCH (BE). Permis jour/semaine sans SaNa ; mois/année avec SaNa.',
          'Acque a patente secondo il dataset ANGFISCH (BE). Patente giorno/settimana senza SaNa; mese/anno solo con SaNa.')) | {
          'priceHint': T('Tag CHF 32 · Woche CHF 100 · Jahr CHF 250 + CHF 50 Hegebeitrag', 'Day CHF 32 · week CHF 100 · year CHF 250 + CHF 50 levy', 'Jour CHF 32 · semaine CHF 100 · année CHF 250 + CHF 50', 'Giorno CHF 32 · settimana CHF 100 · anno CHF 250 + CHF 50')},
          'pacht': R_PACHT(T(
              'Pachtstrecke laut ANGFISCH-Datensatz Kanton Bern: Fischereipass/Gastkarte nur über die Pachtvereinigung (siehe Pachtblatt PDF).',
              'Bern leased reach per the ANGFISCH dataset: pass/guest card only via the lessee association (see lease sheet PDF).',
              'Lot affermé selon ANGFISCH (BE) : carte uniquement auprès de l\'association de fermiers (voir fiche PDF).',
              'Tratto affittato secondo ANGFISCH (BE): tessera solo tramite l\'associazione affittuari (vedi scheda PDF).'))},
      sources=[{'label': 'Kanton Bern · Geoprodukt ANGFISCH (Angelfischerei, OGD)', 'url': 'https://www.geo.apps.be.ch/de/geodaten/suche-nach-geodaten.html?view=sheet&preview=search_list&geoproduct=ANGFISCH', 'kind': 'geometry+rules', 'official': True}],
      notes=T('be.ch ist vom Build-Rechner nicht erreichbar – Daten via GitHub Actions geladen (fetch-geodata.yml).', 'be.ch is unreachable from the build box – data fetched via GitHub Actions.', 'be.ch inaccessible depuis la machine de build – données via GitHub Actions.', 'be.ch non raggiungibile dalla macchina di build – dati via GitHub Actions.'),
      overlay='be'))

add(C('LU', 'luzern', T('Luzern', 'Lucerne', 'Lucerne', 'Lucerna'), 'de',
      T('Seen mit Kantonspatent (Vierwaldstätter-, Sempacher-, Baldeggersee u. a.); Fliessgewässer in Fischereireviere aufgeteilt und verpachtet.',
        'Lakes under cantonal permit (Lake Lucerne, Sempach, Baldegg etc.); rivers divided into leased fishing reviers.',
        'Lacs sous permis cantonal (Quatre-Cantons, Sempach, Baldegg, etc.) ; cours d\'eau divisés en lots affermés.',
        'Laghi con patente cantonale (Quattro Cantoni, Sempach, Baldegg ecc.); corsi d\'acqua suddivisi in riserve affittate.'),
      [link('app', T('Fischerei-App Luzern (Patent kaufen)', 'Lucerne fishing app (buy permit)', 'App pêche Lucerne', 'App pesca Lucerna'), 'https://lu.fischerapp.ch/', True, PAT),
       link('info', T('Fischereipatente LU (lawa)', 'LU fishing permits (lawa)', 'Permis LU (lawa)', 'Patenti LU (lawa)'), 'https://lawa.lu.ch/fischerei/fischereipatente', True, PAT + PACHT)],
      river=R_PACHT(T('Fischereirevier gemäss OGD-Revierdatensatz LU – Regime abgeleitet: Fliessgewässer sind in der Regel verpachtet; Karte beim Revierpächter.',
                      'Fishing revier per the LU open dataset – regime derived: rivers are generally leased; card from the revier lessee.',
                      'Lot de pêche selon les données ouvertes LU – régime déduit : cours d\'eau en général affermés.',
                      'Riserva secondo i dati aperti LU – regime dedotto: corsi d\'acqua generalmente affittati.')),
      rules={'river_free': R_UNKNOWN},
      sources=[{'label': 'Kanton Luzern OGD · Fischereireviere (FISCHREV_DS_V1)', 'url': 'https://public.geo.lu.ch/ogd/rest/services/managed/FISCHREV_DS_V1_MP/MapServer', 'kind': 'geometry', 'official': True}]))

add(C('UR', 'uri', T('Uri', 'Uri', 'Uri', 'Uri'), 'de',
      T('Patentkanton: 3-Tage-, Wochen- und Jahrespatent gelten für alle Seen und Fliessgewässer (ausser Privatgewässer Oberalp- und Arnisee); Tagespatent für Urner-, Seelisberger- und Göscheneralpsee.',
        'Permit canton: 3-day, week and annual permits cover all lakes and rivers (except private Oberalpsee and Arnisee); day permits for Urnersee, Seelisbergersee and Göscheneralpsee.',
        'Canton à permis : permis 3 jours, semaine et année pour tous les lacs et cours d\'eau (sauf lacs privés Oberalp et Arni) ; permis journalier pour Urnersee, Seelisberg et Göscheneralp.',
        'Cantone a patente: patenti 3 giorni, settimana e anno per tutti i laghi e corsi d\'acqua (eccetto i laghi privati Oberalp e Arni); patente giornaliera per Urnersee, Seelisberg e Göscheneralp.'),
      [link('buy', T('Webshop Fischereipatente Uri', 'Uri permit web shop', 'Boutique permis Uri', 'Shop patenti Uri'), 'https://fischereipatente.ur.ch/de/', False, PAT),
       link('info', T('Fischen in Uri (Verkaufsstellen)', 'Fishing in Uri (sales points)', 'Pêche à Uri', 'Pesca a Uri'), 'https://www.ur.ch/dienstleistungen/4912', True, PAT)],
      lake_overrides={'Oberalpsee': 'private', 'Arnisee': 'private'}))

add(C('SZ', 'schwyz', T('Schwyz', 'Schwyz', 'Schwyz', 'Svitto'), 'de',
      T('Patentkanton: Seen und Fliessgewässer mit kantonalem Patent (eFJ-Webshop); Freiangelkarten für einzelne Gewässer.',
        'Permit canton: lakes and rivers with cantonal permit (eFJ web shop); free-angling cards for some waters.',
        'Canton à permis : lacs et cours d\'eau sous permis cantonal (boutique eFJ).',
        'Cantone a patente: laghi e corsi d\'acqua con patente cantonale (shop eFJ).'),
      [link('buy', T('eFJ-Webshop Schwyz (nur Desktop-Browser)', 'eFJ web shop Schwyz (desktop browser only)', 'Boutique eFJ Schwyz (navigateur de bureau uniquement)', 'Shop eFJ Svitto (solo browser desktop)'), 'https://webshop.efj.sz.ch/', True, PAT),
       link('info', T('Fischerpatente SZ', 'SZ fishing permits', 'Permis SZ', 'Patenti SZ'), 'https://www.sz.ch/verwaltung/umweltdepartement/amt-fuer-gewaesser/fischerei/fischerpatente.html/8756-8758-8802-9447-9450-10713-10826', True, PAT)],
      sources=[{'label': 'Kanton Schwyz · Fischgewässer (WFS ch.sz.a049a)', 'url': 'https://map.geo.sz.ch', 'kind': 'geometry', 'official': True}]))

add(C('OW', 'obwalden', T('Obwalden', 'Obwalden', 'Obwald', 'Obvaldo'), 'de',
      T('Patentkanton: Jahres-, Monats-, Wochen- und Tagespatente (Patent-App Obwalden).', 'Permit canton: annual, month, week and day permits (Obwalden permit app).', 'Canton à permis : permis année, mois, semaine et jour (app Obwald).', 'Cantone a patente: patenti anno, mese, settimana e giorno (app Obvaldo).'),
      [link('app', T('Patent-App Obwalden', 'Obwalden permit app', 'App permis Obwald', 'App patenti Obvaldo'), 'https://ow.fischerapp.ch', True, PAT),
       link('info', T('Fischerpatente OW', 'OW permits', 'Permis OW', 'Patenti OW'), 'https://www.ow.ch/dienstleistungen/2051', True, PAT)]))

add(C('NW', 'nidwalden', T('Nidwalden', 'Nidwalden', 'Nidwald', 'Nidvaldo'), 'de',
      T('Patentkanton: Jahres-, Monats-, Wochen- und Tagespatente via Fischerei-App NW.', 'Permit canton: annual, month, week and day permits via the NW fishing app.', 'Canton à permis : permis via l\'app pêche NW.', 'Cantone a patente: patenti tramite l\'app pesca NW.'),
      [link('app', T('Fischerei-App Nidwalden', 'Nidwalden fishing app', 'App pêche Nidwald', 'App pesca Nidvaldo'), 'https://nw.fischerapp.ch', True, PAT),
       link('info', T('Fischerei NW', 'Fishing NW', 'Pêche NW', 'Pesca NW'), 'https://www.nw.ch/jagdhukodienste/1432', True, PAT)]))

add(C('GL', 'glarus', T('Glarus', 'Glarus', 'Glaris', 'Glarona'), 'de',
      T('Patentkanton: Jahrespatent via Glarner FischerApp (SaNa), Tages-/Wochenpatent via Serviceportal; Walensee und Linthkanal separat geregelt.',
        'Permit canton: annual permit via Glarus fishing app (SaNa), day/week permit via service portal; Walensee and Linth canal regulated separately.',
        'Canton à permis : permis annuel via l\'app (SaNa), jour/semaine via le portail ; Walensee et canal de la Linth réglés séparément.',
        'Cantone a patente: patente annuale via app (SaNa), giorno/settimana via portale; Walensee e canale della Linth regolati separatamente.'),
      [link('app', T('Glarner FischerApp', 'Glarus fishing app', 'App pêche Glaris', 'App pesca Glarona'), 'https://gl.fischerapp.ch/', True, PAT),
       link('buy', T('Tages-/Wochenpatent (Serviceportal)', 'Day/week permit (service portal)', 'Permis jour/semaine (portail)', 'Patente giorno/settimana (portale)'), 'https://eforms.gl.ch/prod_sp/start.do?event=view&generalid=DBU_FP', True, PAT),
       link('info', T('Fischereipatente GL', 'GL permits', 'Permis GL', 'Patenti GL'), 'https://www.gl.ch/verwaltung/bau-und-umwelt/umwelt-wald-und-energie/jagd-und-fischerei/fischerei/fischereipatente.html/799', True, PAT)]))

add(C('ZG', 'zug', T('Zug', 'Zug', 'Zoug', 'Zugo'), 'de',
      T('Seen (Zuger-, Ägerisee) mit Kantonspatent; Fliessgewässer verpachtet oder privat.', 'Lakes (Zug, Ägeri) with cantonal permit; rivers leased or private.', 'Lacs (Zoug, Ägeri) sous permis cantonal ; cours d\'eau affermés ou privés.', 'Laghi (Zugo, Ägeri) con patente cantonale; corsi d\'acqua affittati o privati.'),
      [link('info', T('Fischen im Kanton Zug', 'Fishing in Zug', 'Pêche à Zoug', 'Pesca a Zugo'), 'https://zg.ch/de/natur-umwelt-tiere/wasser-und-gewaesser/fischen', True, PAT + PACHT)],
      river='pacht'))

add(C('FR', 'fribourg', T('Freiburg', 'Fribourg', 'Fribourg', 'Friburgo'), 'fr',
      T('Patentkanton (Pêche à permis); Murten- und Neuenburgersee per interkantonalem Konkordat.', 'Permit canton; Lake Murten and Lake Neuchâtel under intercantonal concordat.', 'Canton à permis ; lacs de Morat et de Neuchâtel régis par concordat intercantonal.', 'Cantone a patente; laghi di Morat e Neuchâtel regolati da concordato intercantonale.'),
      [link('info', T('Fischerei FR (Patente)', 'Fishing FR (permits)', 'Pêche FR (permis)', 'Pesca FR (patenti)'), 'https://www.fr.ch/energie-agriculture-et-environnement/faune-aquatique-et-faune-terrestre/section-faune-chasse-et-peche/peche', True, PAT)],
      notes=T('Kantonaler Datensatz «Pêche à permis» auf maps.fr.ch vom Build-Rechner nicht abrufbar (404) – Regime aus Kantonsregel abgeleitet.', 'Cantonal "Pêche à permis" dataset on maps.fr.ch not retrievable (404) – regime derived from canton rule.', 'Jeu « Pêche à permis » sur maps.fr.ch non accessible (404) – régime déduit.', 'Dataset «Pêche à permis» su maps.fr.ch non accessibile (404) – regime dedotto.')))

add(C('SO', 'solothurn', T('Solothurn', 'Solothurn', 'Soleure', 'Soletta'), 'de',
      T('Gemischt: Aare u. a. mit Kantonspatent, viele Reviere verpachtet, einzelne privat oder Schonreviere – Regime pro Revier laut Kantonsdatensatz.', 'Mixed: Aare etc. with cantonal permit, many reviers leased, some private or protected – regime per revier from the cantonal dataset.', 'Mixte : Aar etc. sous permis cantonal, nombreux lots affermés – régime par lot selon les données cantonales.', 'Misto: Aar ecc. con patente cantonale, molte riserve affittate – regime per riserva secondo i dati cantonali.'),
      [link('app', T('Fischerei-App SO (Patent kaufen)', 'SO fishing app (buy permit)', 'App pêche SO', 'App pesca SO'), 'https://mobile-efj.so.ch', True, PAT),
       link('info', T('Fischerei-App / Patente SO', 'SO app / permits', 'App / permis SO', 'App / patenti SO'), 'https://so.ch/verwaltung/volkswirtschaftsdepartement/amt-fuer-wald-jagd-und-fischerei/fischerei/fischerei-app/', True, PAT + PACHT)],
      sources=[{'label': 'Kanton Solothurn · Fischereireviere (ch.so.awjf.gewaesser.fischerei)', 'url': 'https://files.geo.so.ch/ch.so.awjf.gewaesser.fischerei/aktuell/', 'kind': 'geometry+rules', 'official': True}]))

add(C('BS', 'basel-stadt', T('Basel-Stadt', 'Basel-Stadt', 'Bâle-Ville', 'Basilea Città'), 'de',
      T('Rhein: staatliche Fischereikarte (App); Wiese und Birs: Pachtstrecken.', 'Rhine: state fishing card (app); Wiese and Birs: leased reaches.', 'Rhin : carte de pêche cantonale (app) ; Wiese et Birse : lots affermés.', 'Reno: tessera cantonale (app); Wiese e Birs: tratti affittati.'),
      [link('info', T('Fischen in Basel (Karten, App)', 'Fishing in Basel (cards, app)', 'Pêche à Bâle', 'Pesca a Basilea'), 'https://www.bs.ch/wsu/aue/abteilung-gewaesser-und-boden/fischen-basel', True, PAT + PACHT)],
      river='pacht', river_overrides={'Rhein': 'patent'}))

add(C('BL', 'basel-landschaft', T('Basel-Landschaft', 'Basel-Landschaft', 'Bâle-Campagne', 'Basilea Campagna'), 'de',
      T('Pachtsystem: Gemeinden verpachten die Fischereireviere; Karten bei den Pächtern (Amt für Wald und Wild beider Basel).', 'Lease system: municipalities lease the reviers; cards from the lessees.', 'Système d\'affermage : les communes louent les lots ; cartes auprès des fermiers.', 'Sistema di affitto: i comuni affittano le riserve; tessere dagli affittuari.'),
      [link('enquire', T('Jagd & Fischerei BL (E-Mail)', 'Hunting & fishing BL (email)', 'Chasse & pêche BL (e-mail)', 'Caccia & pesca BL (e-mail)'), 'mailto:jagdundfischerei@bl.ch', True, PACHT + PAT)],
      lake='pacht', river='pacht'))

add(C('SH', 'schaffhausen', T('Schaffhausen', 'Schaffhausen', 'Schaffhouse', 'Sciaffusa'), 'de',
      T('Rheinreviere im Kantonsdatensatz erfasst; Angelpatent bzw. Fischereikarte je nach Revier – Regime pro Revier nicht im Datensatz.', 'Rhine reviers mapped in the cantonal dataset; angling permit or fishing card depending on revier – regime per revier not in the dataset.', 'Lots du Rhin cartographiés ; permis ou carte selon le lot – régime non indiqué.', 'Riserve del Reno cartografate; patente o tessera secondo la riserva – regime non indicato.'),
      [link('info', T('Jagd und Fischerei SH', 'Hunting & fishing SH', 'Chasse et pêche SH', 'Caccia e pesca SH'), 'https://sh.ch/CMS/Webseite/Kanton-Schaffhausen/Beh-rde/Verwaltung/Departement-des-Innern/Jagd-und-Fischerei-1242278-DE.html', True, PAT + PACHT)],
      lake='unknown', river='unknown',
      sources=[{'label': 'Kanton Schaffhausen OGD · Fischereireviere', 'url': 'https://data.geo.sh.ch/ogd/fischereireviere.zip', 'kind': 'geometry', 'official': True}]))

add(C('AR', 'appenzell-ausserrhoden', T('Appenzell Ausserrhoden', 'Appenzell Outer Rhodes', 'Appenzell Rhodes-Extérieures', 'Appenzello Esterno'), 'de',
      T('Reines Pachtsystem: 26 Reviere, Tages-/Jahreskarten beim Revierpächter; vier Grenzgewässer von Nachbarkantonen verwaltet.', 'Pure lease system: 26 reviers, day/annual cards from the lessee; four border waters managed by neighbours.', 'Affermage uniquement : 26 lots, cartes auprès du fermier.', 'Solo affitto: 26 riserve, tessere dall\'affittuario.'),
      [link('pacht', T('Fischereireviere AR (PDF)', 'AR reviers (PDF)', 'Lots AR (PDF)', 'Riserve AR (PDF)'), 'https://ar.ch/fileadmin/user_upload/Departement_Bau_Volkswirtschaft/Amt_fuer_Umwelt/Umwelt/Publikationen/Formular/Fischerei/Fischerei_Fischereireviere.pdf', True, PACHT),
       link('info', T('Fischen in AR', 'Fishing in AR', 'Pêche AR', 'Pesca AR'), 'https://ar.ch/verwaltung/departement-bau-und-volkswirtschaft/amt-fuer-umwelt/fischerei/fischen-in-appenzell-ausserrhoden/', True, PACHT)],
      lake='pacht', river='pacht'))

add(C('AI', 'appenzell-innerrhoden', T('Appenzell Innerrhoden', 'Appenzell Inner Rhodes', 'Appenzell Rhodes-Intérieures', 'Appenzello Interno'), 'de',
      T('Patentkanton (kein Pachtsystem): Wochenpatent für Gäste, Tagespatent Bergseen (Seealp-, Sämtiser-, Fählensee); Saisonpatent nur für Einwohner.', 'Permit canton (no lease system): week permit for visitors, day permit for mountain lakes; season permit residents only.', 'Canton à permis : permis semaine pour visiteurs, journalier lacs de montagne ; saison réservé aux résidents.', 'Cantone a patente: settimanale per ospiti, giornaliera laghi di montagna; stagionale solo residenti.'),
      [link('buy', T('Patent online (fischerei.ai.ch)', 'Permit online (fischerei.ai.ch)', 'Permis en ligne', 'Patente online'), 'https://fischerei.ai.ch', False, PAT),
       link('info', T('Ausgabestelle Patente AI', 'AI permit office', 'Guichet permis AI', 'Ufficio patenti AI'), 'https://ai.ch/themen/natur-und-umwelt/fischerei/ausgabestelle-fischereipatente', True, PAT)]))

add(C('SG', 'st-gallen', T('St. Gallen', 'St. Gallen', 'Saint-Gall', 'San Gallo'), 'de',
      T('Patentgewässer: Bodensee, Walensee, Zürichsee/Obersee, Alpenrhein. Alle übrigen Bäche, Flüsse und Weiher sind Pachtgewässer (Pachtperiode 2025–2032).', 'Patent waters: Lake Constance, Walensee, Lake Zurich/Obersee, Alpine Rhine. All other streams, rivers and ponds are leased (2025–2032).', 'Eaux à permis : Constance, Walensee, Zurich/Obersee, Rhin alpin. Tous les autres cours d\'eau et étangs sont affermés.', 'Acque a patente: Costanza, Walensee, Zurigo/Obersee, Reno alpino. Tutte le altre acque sono affittate.'),
      [link('buy', T('eFJ-Webshop St. Gallen', 'eFJ web shop St. Gallen', 'Boutique eFJ Saint-Gall', 'Shop eFJ San Gallo'), 'https://webshop.efj.sg.ch/', True, PAT),
       link('info', T('Patentgewässer SG', 'SG patent waters', 'Eaux à permis SG', 'Acque a patente SG'), 'https://www.sg.ch/umwelt-natur/jagd-fischerei/fischerei/fischereipatente/patentgewaesser-kanton-st-gallen.html', True, PAT),
       link('pacht', T('Pachtgewässer SG (Pächter finden)', 'SG leased waters (find lessee)', 'Eaux affermées SG', 'Acque affittate SG'), 'https://www.sg.ch/umwelt-natur/jagd-fischerei/fischerei/fischereipatente/pachtgewaesser-kanton-st--gallen.html', True, PACHT)],
      lake='pacht', river='pacht', river_overrides={'Rhein': 'patent'},
      lake_overrides={'Bodensee': 'patent', 'Walensee': 'patent', 'Zürichsee': 'patent'}))

add(C('GR', 'graubuenden', T('Graubünden', 'Grisons', 'Grisons', 'Grigioni'), 'de',
      T('Patentkanton: Saison- und Kurzzeitpatente im Online-Shop des Amts für Jagd und Fischerei.', 'Permit canton: season and short-term permits in the AJF online shop.', 'Canton à permis : permis saison et courte durée dans la boutique AJF.', 'Cantone a patente: patenti stagionali e di breve durata nello shop UCP.'),
      [link('buy', T('Online-Shop AJF Graubünden', 'AJF Grisons online shop', 'Boutique AJF Grisons', 'Shop UCP Grigioni'), 'https://shop-ajf.gr.ch/de/', True, PAT),
       link('info', T('Fischereipatente GR', 'GR permits', 'Permis GR', 'Patenti GR'), 'https://www.gr.ch/DE/institutionen/verwaltung/diem/ajf/fischerei/Fischen-in-Graubuenden/Seiten/Fischereipatente.aspx', True, PAT),
       link('prices', T('Preisliste 2026 (PDF)', 'Price list 2026 (PDF)', 'Tarifs 2026 (PDF)', 'Tariffe 2026 (PDF)'), 'https://www.gr.ch/DE/institutionen/verwaltung/diem/ajf/fischerei/Documents/Fischen%20in%20Graub%c3%bcnden/Fischereipatente/Preisliste%20Fischereipatente%202026.pdf', True, PAT)]))

add(C('AG', 'aargau', T('Aargau', 'Aargau', 'Argovie', 'Argovia'), 'de',
      T('Pachtsystem: Staatsreviere verpachtet (2026–2033); Karten beim Pächter. Freianglerkarte (CHF 50, online) für bestimmte Abschnitte von Rhein, Aare, Reuss, Limmat und Hallwilersee.', 'Lease system: state reviers leased (2026–2033); cards from lessees. Free-angler card (CHF 50, online) for certain stretches of Rhine, Aare, Reuss, Limmat and Hallwilersee.', 'Affermage : lots affermés (2026–2033) ; carte « Freiangler » (CHF 50) pour certains tronçons du Rhin, de l\'Aar, de la Reuss, de la Limmat et du Hallwilersee.', 'Affitto: riserve affittate (2026–2033); tessera «Freiangler» (CHF 50) per alcuni tratti di Reno, Aar, Reuss, Limmat e Hallwilersee.'),
      [link('buy', T('Fischerkarten / Freianglerkarte bestellen', 'Order fishing / free-angler cards', 'Commander cartes', 'Ordinare tessere'), 'https://www.ag.ch/de/themen/landwirtschaft-tiere/wild-wassertiere/fischerei/bestellung-fischerkarten', True, PAT + PACHT),
       link('info', T('Angeln im Kanton Aargau', 'Angling in Aargau', 'Pêche en Argovie', 'Pesca in Argovia'), 'https://www.ag.ch/de/themen/landwirtschaft-tiere/wild-wassertiere/fischerei/informationen-fuer-fischerinnen-und-fischer/angeln-im-kanton-aargau', True, PAT + PACHT)],
      lake='pacht', river='pacht',
      rules={'ag_big': {'permitType': 'mixed', 'summary': T(
          'Pachtreviere; auf bestimmten Abschnitten gilt die kantonale Freianglerkarte (CHF 50, online). Abschnitt in der Kantonskarte AG prüfen.',
          'Leased reviers; on certain stretches the cantonal free-angler card applies (CHF 50, online). Check the stretch on the cantonal AG map.',
          'Lots affermés ; sur certains tronçons la carte cantonale « Freiangler » s\'applique (CHF 50).',
          'Riserve affittate; su alcuni tratti vale la tessera cantonale «Freiangler» (CHF 50).')}},
      river_overrides={'Rhein': 'ag_big', 'Aare': 'ag_big', 'Reuss': 'ag_big', 'Limmat': 'ag_big'},
      lake_overrides={'Hallwiler See': 'ag_big'},
      sources=[{'label': 'Kanton Aargau · Fischereireviere (WMS ch_ag_geo_aw_fish, nur Karte)', 'url': 'https://wms.geo.ag.ch/public/ch_ag_geo_aw_fish/wms?service=wms&request=GetCapabilities', 'kind': 'map', 'official': True}],
      notes=T('Revierdaten nur als WMS/Bestellportal – als Kartenebene des Kantons eingeblendet, nicht als Vektor.', 'Revier data only as WMS/order portal – shown as the canton\'s map overlay, not as vectors.', 'Données des lots uniquement en WMS – affichées en superposition.', 'Dati delle riserve solo WMS – mostrati come sovrapposizione.'),
      overlay='ag'))

add(C('TG', 'thurgau', T('Thurgau', 'Thurgau', 'Thurgovie', 'Turgovia'), 'de',
      T('Uferfischerei am Bodensee, Untersee und Rhein frei (Freiangelrecht), ausser in Fischenzen/Schongebieten; Boots-/Schleppfischerei mit Patent (eFJ-Webshop). Thur, Murg, Sitter und Bäche: Pachtreviere.', 'Shore fishing on Lake Constance, Untersee and the Rhine is free (free angling right) except in private fisheries/protected zones; boat fishing needs a permit (eFJ shop). Thur, Murg, Sitter and streams: leased.', 'Pêche depuis la rive libre sur le lac de Constance, l\'Untersee et le Rhin (sauf pêcheries privées/réserves) ; bateau avec permis. Thur, Murg, Sitter : affermés.', 'Pesca da riva libera su Costanza, Untersee e Reno (salvo peschiere private/riserve); barca con patente. Thur, Murg, Sitter: affittati.'),
      [link('buy', T('eFJ-Webshop Thurgau', 'eFJ web shop Thurgau', 'Boutique eFJ Thurgovie', 'Shop eFJ Turgovia'), 'https://webshop-efj.tg.ch/', True, PAT),
       link('info', T('Jagd- und Fischereiverwaltung TG', 'TG hunting & fishing office', 'Chasse et pêche TG', 'Caccia e pesca TG'), 'https://jfv.tg.ch/', True, PAT + PACHT)],
      lake='unknown', river='pacht',
      rules={'tg_shore': {'permitType': 'mixed', 'summary': T(
          'Vom Ufer: Freiangelrecht (ohne Patent, Regeln gelten) – ausser in Fischenzen und Schongebieten. Vom Boot / Schleppangel: Kantonspatent (eFJ-Webshop).',
          'From the shore: free angling (no permit, rules apply) – except in private fisheries and protected zones. From a boat / trolling: cantonal permit (eFJ shop).',
          'Depuis la rive : pêche libre (règles applicables) – sauf pêcheries privées et réserves. En bateau : permis cantonal.',
          'Da riva: pesca libera (regole applicabili) – salvo peschiere private e riserve. In barca: patente cantonale.')}},
      river_overrides={'Rhein': 'tg_shore'}, lake_overrides={'Bodensee': 'tg_shore', 'Untersee': 'tg_shore'},
      sources=[{'label': 'Kanton Thurgau · Fischereiverbote/Freiangelrecht/Fischenzen (WFS)', 'url': 'https://ows.geo.tg.ch/geofy_access_proxy/fischereiverbote', 'kind': 'geometry+rules', 'official': True}]))

add(C('TI', 'ticino', T('Tessin', 'Ticino', 'Tessin', 'Ticino'), 'it',
      T('Patentkanton (digitale Patente); Lago Maggiore und Luganersee per Fischereiabkommen Schweiz–Italien.', 'Permit canton (digital permits); Lake Maggiore and Lake Lugano under the Swiss–Italian fishing convention.', 'Canton à permis (permis numériques) ; lacs Majeur et de Lugano régis par la convention italo-suisse.', 'Cantone a patente (patente digitale); Lago Maggiore e Lago di Lugano regolati dalla convenzione italo-svizzera sulla pesca.'),
      [link('buy', T('Patente digitale (TI)', 'Digital permit (TI)', 'Permis numérique (TI)', 'Patente digitale (TI)'), 'https://www4.ti.ch/dt/da/ucp/temi/pesca/sportello/patente-digitale', True, PAT)]))

add(C('VD', 'vaud', T('Waadt', 'Vaud', 'Vaud', 'Vaud'), 'fr',
      T('Patentkanton: Flusspatent sowie eigene Patente für Genfer-, Neuenburger-, Murten- und Lac de Joux.', 'Permit canton: river permit plus separate permits for Lake Geneva, Neuchâtel, Murten and Lac de Joux.', 'Canton à permis : permis rivières et permis spécifiques Léman, Neuchâtel, Morat et lac de Joux.', 'Cantone a patente: patente fiumi e patenti specifiche per Lemano, Neuchâtel, Morat e lac de Joux.'),
      [link('buy', T('Fischereipatent bestellen (VD)', 'Order fishing permit (VD)', 'Commander un permis de pêche (VD)', 'Ordinare la patente (VD)'), 'https://www.vd.ch/prestation/commander-un-permis-de-peche-de-loisir-courte-duree', True, PAT)]))

add(C('VS', 'valais', T('Wallis', 'Valais', 'Valais', 'Vallese'), 'fr',
      T('Patentkanton: Patent für Rhône, Flüsse, Gouilles und Bergseen (ePêche); viele Seen verpachtet; Reservate und Teilreservate im Kantonsdatensatz kartiert.', 'Permit canton: permit for Rhône, rivers, ponds and mountain lakes (ePêche); many lakes leased; reserves mapped in the cantonal dataset.', 'Canton à permis : permis Rhône, rivières, gouilles et lacs de montagne (ePêche) ; nombreux lacs affermés ; réserves cartographiées.', 'Cantone a patente: patente per Rodano, fiumi, pozze e laghi di montagna (ePêche); molti laghi affittati; riserve cartografate.'),
      [link('buy', T('ePêche – Patent online', 'ePêche – permit online', 'ePêche – permis en ligne', 'ePêche – patente online'), 'https://epeche.apps.vs.ch/shop', True, PAT),
       link('info', T('Permis de pêche VS', 'VS fishing permits', 'Permis de pêche VS', 'Patenti VS'), 'https://www.vs.ch/web/scpf/permis-de-peche-epeche-', True, PAT + PACHT)],
      sources=[{'label': 'Canton du Valais · Carte piscicole (SCPF, ArcGIS FeatureServer)', 'url': 'https://services1.arcgis.com/rMlsWo8szOzlrpCq/ArcGIS/rest/services/Peche/FeatureServer', 'kind': 'geometry+rules', 'official': True}]))

add(C('NE', 'neuchatel', T('Neuenburg', 'Neuchâtel', 'Neuchâtel', 'Neuchâtel'), 'fr',
      T('Patentkanton; Neuenburgersee per Konkordat (NE/VD/FR), Doubs als Grenzgewässer mit Frankreich.', 'Permit canton; Lake Neuchâtel under concordat (NE/VD/FR), Doubs is a border river with France.', 'Canton à permis ; lac de Neuchâtel (concordat NE/VD/FR), Doubs frontière avec la France.', 'Cantone a patente; lago di Neuchâtel (concordato), Doubs confine con la Francia.'),
      [link('buy', T('Temporäres Patent online (Guichet unique)', 'Temporary permit online', 'Permis temporaire en ligne (Guichet unique)', 'Patente temporanea online'), 'https://www.guichetunique.ch/public/SFFN/PERPETMP/PermisPecheTemporaire.aspx', True, PAT),
       link('info', T('Fischerei NE', 'Fishing NE', 'Pêche NE', 'Pesca NE'), 'https://www.ne.ch/themes/energie-et-environnement/faune/peche', True, PAT)]))

add(C('GE', 'geneve', T('Genf', 'Geneva', 'Genève', 'Ginevra'), 'fr',
      T('Patentkanton: Fischereipatente für Rhône, Arve und Genfersee beim Kanton.', 'Permit canton: permits for Rhône, Arve and Lake Geneva from the canton.', 'Canton à permis : permis pour le Rhône, l\'Arve et le Léman.', 'Cantone a patente: patenti per Rodano, Arve e Lemano.'),
      [link('buy', T('Permis de pêche GE', 'GE fishing permit', 'Permis de pêche GE', 'Patente GE'), 'https://www.ge.ch/permis-peche', True, PAT)]))

add(C('JU', 'jura', T('Jura', 'Jura', 'Jura', 'Giura'), 'fr',
      T('Patentkanton; Doubs als Grenzgewässer (Abkommen Schweiz–Frankreich).', 'Permit canton; Doubs is a border river (Swiss–French agreement).', 'Canton à permis ; Doubs frontière (convention franco-suisse).', 'Cantone a patente; Doubs fiume di confine (convenzione franco-svizzera).'),
      [link('info', T('Exercice de la pêche (JU)', 'Fishing in Jura', 'Exercice de la pêche (JU)', 'Esercizio della pesca (JU)'), 'https://www.jura.ch/fr/Autorites/Administration/DEC/ENV/Peche-et-faune-aquatique/Exercice-de-la-peche/Exercice-de-la-peche.html', True, PAT)]))

ORDER = ['ZH', 'BE', 'LU', 'UR', 'SZ', 'OW', 'NW', 'GL', 'ZG', 'FR', 'SO', 'BS', 'BL', 'SH', 'AR', 'AI', 'SG', 'GR', 'AG', 'TG', 'TI', 'VD', 'VS', 'NE', 'GE', 'JU']
assert sorted(ORDER) == sorted(CANTONS), set(ORDER) ^ set(CANTONS)

# ---------------------------------------------------------------- border / intercantonal waters
def B(key, name, cantons, countries, authority, hint):
    return {'key': key, 'name': name, 'cantons': cantons, 'countries': countries, 'authority': authority, 'hint': hint}

BORDER = {
    'Le Léman': B('leman', T('Genfersee', 'Lake Geneva', 'Lac Léman', 'Lago Lemano'), ['VD', 'VS', 'GE'], ['FR'],
                  T('Internationale Kommission (CIPL) Schweiz–Frankreich', 'International commission (CIPL) Switzerland–France', 'Commission internationale pour la pêche dans le Léman (CIPL)', 'Commissione internazionale (CIPL) Svizzera–Francia'),
                  T('Léman-Patent des Uferkantons (VD, VS oder GE); französische Seite: französischer Permis.', 'Léman permit of the shore canton (VD, VS or GE); French side: French permit.', 'Permis Léman du canton riverain (VD, VS ou GE) ; rive française : permis français.', 'Patente Lemano del cantone rivierasco (VD, VS o GE); lato francese: permesso francese.')),
    'Bodensee': B('bodensee', T('Bodensee', 'Lake Constance', 'Lac de Constance', 'Lago di Costanza'), ['TG', 'SG'], ['DE', 'AT'],
                  T('Internationale Bevollmächtigtenkonferenz für die Bodenseefischerei (IBKF)', 'International Conference of Plenipotentiaries for Lake Constance fisheries (IBKF)', 'Conférence internationale pour la pêche dans le lac de Constance (IBKF)', 'Conferenza internazionale per la pesca nel Lago di Costanza (IBKF)'),
                  T('Bodensee-Patent über TG oder SG; TG-Ufer: Freiangelrecht (ausser Fischenzen).', 'Lake Constance permit via TG or SG; TG shore: free angling (except private fisheries).', 'Permis via TG ou SG ; rive TG : pêche libre (sauf pêcheries privées).', 'Patente tramite TG o SG; riva TG: pesca libera (salvo peschiere private).')),
    'Untersee': B('untersee', T('Untersee / Rhein', 'Untersee / Rhine', 'Untersee / Rhin', 'Untersee / Reno'), ['TG', 'SH'], ['DE'],
                  T('Staatsvertrag Schweiz–Deutschland (Untersee und Rhein)', 'Swiss–German treaty (Untersee and Rhine)', 'Traité Suisse–Allemagne (Untersee et Rhin)', 'Trattato Svizzera–Germania (Untersee e Reno)'),
                  T('TG-Ufer: Freiangelrecht; Boot: Untersee-Patent (TG).', 'TG shore: free angling; boat: Untersee permit (TG).', 'Rive TG : pêche libre ; bateau : permis Untersee (TG).', 'Riva TG: pesca libera; barca: patente Untersee (TG).')),
    'Lac de Neuchâtel': B('neuchatel', T('Neuenburgersee', 'Lake Neuchâtel', 'Lac de Neuchâtel', 'Lago di Neuchâtel'), ['NE', 'VD', 'FR', 'BE'], [],
                          T('Interkantonales Konkordat (NE, VD, FR)', 'Intercantonal concordat (NE, VD, FR)', 'Concordat intercantonal (NE, VD, FR)', 'Concordato intercantonale (NE, VD, FR)'),
                          T('Konkordatspatent «Lac de Neuchâtel» über NE, VD oder FR.', 'Concordat permit "Lac de Neuchâtel" via NE, VD or FR.', 'Permis concordataire via NE, VD ou FR.', 'Patente concordataria tramite NE, VD o FR.')),
    'Lac de Morat': B('morat', T('Murtensee', 'Lake Murten', 'Lac de Morat', 'Lago di Morat'), ['FR', 'VD'], [],
                      T('Interkantonales Konkordat (FR, VD)', 'Intercantonal concordat (FR, VD)', 'Concordat intercantonal (FR, VD)', 'Concordato intercantonale (FR, VD)'),
                      T('Murtensee-Patent über FR oder VD.', 'Lake Murten permit via FR or VD.', 'Permis lac de Morat via FR ou VD.', 'Patente lago di Morat tramite FR o VD.')),
    'Bieler See': B('biel', T('Bielersee', 'Lake Biel', 'Lac de Bienne', 'Lago di Bienne'), ['BE', 'NE'], [],
                    T('Kantone Bern und Neuenburg', 'Cantons of Bern and Neuchâtel', 'Cantons de Berne et Neuchâtel', 'Cantoni Berna e Neuchâtel'),
                    T('Patent des Kantons, an dessen Ufer gefischt wird (BE-Patent im BE-Teil).', 'Permit of the shore canton (BE permit in the BE part).', 'Permis du canton riverain.', 'Patente del cantone rivierasco.')),
    'Lago Maggiore': B('maggiore', T('Lago Maggiore', 'Lake Maggiore', 'Lac Majeur', 'Lago Maggiore'), ['TI'], ['IT'],
                       T('Fischereiabkommen Schweiz–Italien (CISPP)', 'Swiss–Italian fishing convention (CISPP)', 'Convention italo-suisse (CISPP)', 'Convenzione italo-svizzera per la pesca (CISPP)'),
                       T('Schweizer Teil: Tessiner Patent; italienischer Teil: italienische Lizenz.', 'Swiss part: Ticino permit; Italian part: Italian licence.', 'Partie suisse : permis tessinois.', 'Parte svizzera: patente ticinese; parte italiana: licenza italiana.')),
    'Lago di Lugano': B('lugano', T('Luganersee', 'Lake Lugano', 'Lac de Lugano', 'Lago di Lugano'), ['TI'], ['IT'],
                        T('Fischereiabkommen Schweiz–Italien (CISPP)', 'Swiss–Italian fishing convention (CISPP)', 'Convention italo-suisse (CISPP)', 'Convenzione italo-svizzera per la pesca (CISPP)'),
                        T('Schweizer Teil: Tessiner Patent; italienischer Teil: italienische Lizenz.', 'Swiss part: Ticino permit; Italian part: Italian licence.', 'Partie suisse : permis tessinois.', 'Parte svizzera: patente ticinese; parte italiana: licenza italiana.')),
    'Zürichsee': B('zuerichsee', T('Zürichsee', 'Lake Zurich', 'Lac de Zurich', 'Lago di Zurigo'), ['ZH', 'SZ', 'SG'], [],
                   T('Interkantonale Vereinbarung ZH/SZ/SG', 'Intercantonal agreement ZH/SZ/SG', 'Accord intercantonal ZH/SZ/SG', 'Accordo intercantonale ZH/SZ/SG'),
                   T('Patent des jeweiligen Uferkantons; Geltungsbereich gemäss Vereinbarung prüfen.', 'Permit of the respective shore canton; check scope per agreement.', 'Permis du canton riverain ; vérifier la portée selon l\'accord.', 'Patente del cantone rivierasco; verificare la validità.')),
    'Vierwaldstättersee': B('vierwaldstaettersee', T('Vierwaldstättersee', 'Lake Lucerne', 'Lac des Quatre-Cantons', 'Lago dei Quattro Cantoni'), ['LU', 'UR', 'SZ', 'OW', 'NW'], [],
                            T('Konkordat der Uferkantone LU, UR, SZ, OW, NW', 'Concordat of shore cantons LU, UR, SZ, OW, NW', 'Concordat des cantons riverains', 'Concordato dei cantoni rivieraschi'),
                            T('Patent eines Uferkantons; Gültigkeit für Seeteile anderer Kantone gemäss Konkordat prüfen.', 'Permit of a shore canton; check validity for other cantons\' parts per concordat.', 'Permis d\'un canton riverain ; validité selon concordat.', 'Patente di un cantone rivierasco; validità secondo concordato.')),
    'Zuger See': B('zugersee', T('Zugersee', 'Lake Zug', 'Lac de Zoug', 'Lago di Zugo'), ['ZG', 'SZ', 'LU'], [],
                   T('Konkordat ZG/SZ/LU', 'Concordat ZG/SZ/LU', 'Concordat ZG/SZ/LU', 'Concordato ZG/SZ/LU'),
                   T('Zugersee-Patent eines Konkordatskantons.', 'Lake Zug permit of a concordat canton.', 'Permis d\'un canton concordataire.', 'Patente di un cantone concordatario.')),
    'Walensee': B('walensee', T('Walensee', 'Lake Walen', 'Lac de Walenstadt', 'Lago di Walenstadt'), ['SG', 'GL'], [],
                  T('Vereinbarung SG/GL (Walensee, Linthkanal)', 'Agreement SG/GL (Walensee, Linth canal)', 'Accord SG/GL', 'Accordo SG/GL'),
                  T('Walensee-Patent über SG oder GL (nicht im GL-Tagespatent enthalten).', 'Walensee permit via SG or GL (not in the GL day permit).', 'Permis Walensee via SG ou GL.', 'Patente Walensee tramite SG o GL.')),
    'Hallwiler See': B('hallwilersee', T('Hallwilersee', 'Lake Hallwil', 'Lac de Hallwil', 'Lago di Hallwil'), ['AG', 'LU'], [],
                       T('Übereinkunft AG/LU', 'Agreement AG/LU', 'Accord AG/LU', 'Accordo AG/LU'),
                       T('Aargauer Teil: Freianglerkarte/Pacht gemäss AG; Luzerner Teil: LU-Regelung.', 'AG part: free-angler card/lease per AG; LU part: LU rules.', 'Partie AG : règles AG ; partie LU : règles LU.', 'Parte AG: regole AG; parte LU: regole LU.')),
    'Lac des Brenets': B('doubs', T('Doubs / Lac des Brenets', 'Doubs / Lac des Brenets', 'Doubs / Lac des Brenets', 'Doubs / Lac des Brenets'), ['NE', 'JU'], ['FR'],
                         T('Abkommen Schweiz–Frankreich (Doubs-Grenzstrecke)', 'Swiss–French agreement (Doubs border reach)', 'Convention franco-suisse (Doubs frontière)', 'Convenzione franco-svizzera (Doubs)'),
                         T('Grenzstrecke: Patent gemäss franko-schweizerischer Regelung (NE/JU bzw. Frankreich).', 'Border reach: permit per Franco-Swiss rules (NE/JU or France).', 'Tronçon frontière : permis selon la réglementation franco-suisse.', 'Tratto di confine: patente secondo norme franco-svizzere.')),
}
RIVER_BORDER = {('Doubs', 'NE'): 'doubs', ('Doubs', 'JU'): 'doubs'}
HOCHRHEIN = B('hochrhein', T('Hochrhein', 'High Rhine', 'Haut-Rhin', 'Alto Reno'), ['SH', 'ZH', 'AG', 'BL', 'BS', 'TG'], ['DE'],
              T('Grenzgewässer Schweiz–Deutschland (kantonale Regelung + Staatsverträge)', 'Swiss–German border water (cantonal rules + treaties)', 'Eaux frontalières Suisse–Allemagne', 'Acque di confine Svizzera–Germania'),
              T('Schweizer Ufer: Regelung des Uferkantons; deutsches Ufer: deutsche Fischereierlaubnis.', 'Swiss bank: rules of the shore canton; German bank: German permit.', 'Rive suisse : règles du canton ; rive allemande : permis allemand.', 'Riva svizzera: regole del cantone; riva tedesca: permesso tedesco.'))
BORDER['_hochrhein'] = HOCHRHEIN
