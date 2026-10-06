"""Hand-curated, sourced permit prices and fishing rules per canton / water (Petripass).

Data-honesty rules:
- Every value is copied from the official source linked in `src` (checked on CHECKED). Nothing is estimated.
- Missing values stay missing (None / absent) – the UI then says "nicht in unseren Daten".
- DE is authoritative; EN/FR by hand; IT machine-drafted (see STATUS.md).

Structure (per canton):
  {'checked', 'base': PROFILE, 'profiles': [PROFILE (+ 'match')], 'rulesUrl'}
PROFILE keys (all optional; a profile is merged over `base`):
  label   scope label (Localized)
  prices  {'rows': [{'label', 'res': {day,d2,week,d15,month,year}, 'non': {...}|None, 'note'}], 'note', 'src', 'asOf'}
          `non` = price for people living outside the canton (incl. abroad); None = same price for everybody per the source;
          missing key `non` = the source does not say.
  catch   [{'sp', 'day', 'year', 'note'}]   daily / yearly bag limits
  sizes   [{'sp', 'cm', 'where'}]           minimum sizes ('cm' may be a string like '34–40 / ab 50')
  closed  [{'sp', 'period', 'where'}]       closed seasons ('period' Localized or 'DD.MM.–DD.MM.')
  methods [Localized]                       allowed methods / bait / hooks
  night   Localized                          fishing hours / night fishing
  zones   Localized                          no-fishing zones in text form (the map overlay is separate, see build_zones.py)
  guest   Localized                          guest / non-resident / foreigner notes
  src     [{'label', 'url'}]                 sources for rules
match keys: ids (list of water ids), re (regex on water id), p (permit types), k (water kinds); all given keys must match.
"""

CHECKED = '2026-10-06'

def T(de, en, fr, it=None):
    return {'de': de, 'en': en, 'fr': fr, 'it': it or fr}

def S(label, url):
    return {'label': label, 'url': url}

def P(label, res, non='?', note=None):
    r = {'label': label, 'res': res}
    if non != '?':
        r['non'] = non
    if note:
        r['note'] = note
    return r

ALL = T('alle', 'all', 'tous', 'tutti')
YEARROUND = T('ganzjährig geschützt', 'protected all year', 'protégé toute l’année', 'protetto tutto l’anno')
NONE = T('keine', 'none', 'aucune', 'nessuna')
NOMIN = T('kein Mindestmass', 'no minimum size', 'pas de taille minimale', 'nessuna misura minima')

# ------------------------------------------------------------------ federal baseline (all cantons)
FED_SRC = [
    S('Tierschutzverordnung (TSchV, SR 455.1) Art. 23, 97, 100, 178', 'https://www.fedlex.admin.ch/eli/cc/2008/416/de'),
    S('Kanton ZH · Fischereivorschriften 2026, Auszug «Bundesvorschriften für alle Gewässer» (PDF)', 'https://www.zh.ch/content/dam/zhweb/bilder-dokumente/themen/umwelt-tiere/tiere/fischerei-und-jagd/fischerei/verf%C3%BCgungen/fischereivorschriften_auszug_fuer_die_angelfischerei_202603.pdf'),
]
FEDERAL = {
    'items': [
        T('Angeln mit der Absicht, die Fische wieder freizulassen, ist verboten (Catch & Release, TSchV Art. 23).',
          'Angling with the intention of releasing the fish is prohibited (catch & release, TSchV art. 23).',
          'Pêcher dans l’intention de relâcher le poisson est interdit (TSchV art. 23).',
          'È vietato pescare con l’intenzione di rilasciare il pesce (OPAn art. 23).'),
        T('Sachkundenachweis (SaNa) nötig – ausser wo kein Patent oder nur ein Kurzpatent bis zu einem Monat nötig ist (TSchV Art. 97).',
          'Proof of competence (SaNa) required – except where no permit or only a short-term permit of up to one month is needed (TSchV art. 97).',
          'Attestation de compétence (SaNa) requise – sauf sans permis ou avec un permis de courte durée d’un mois au plus (TSchV art. 97).',
          'Attestato di competenza (SaNa) richiesto – salvo senza patente o con patente di breve durata fino a un mese (OPAn art. 97).'),
        T('Zum Verzehr bestimmte Fische sofort betäuben und töten (TSchV Art. 100, 178).',
          'Fish kept for eating must be stunned and killed immediately (TSchV art. 100, 178).',
          'Les poissons destinés à la consommation doivent être étourdis et tués immédiatement (TSchV art. 100, 178).',
          'I pesci destinati al consumo vanno storditi e uccisi subito (OPAn art. 100, 178).'),
    ],
    'src': FED_SRC,
}

# ------------------------------------------------------------------ ZH
ZH_VORSCHR = 'https://www.zh.ch/content/dam/zhweb/bilder-dokumente/themen/umwelt-tiere/tiere/fischerei-und-jagd/fischerei/verf%C3%BCgungen/fischereivorschriften_auszug_fuer_die_angelfischerei_202603.pdf'
ZH_MERK = 'https://www.zh.ch/content/dam/zhweb/bilder-dokumente/themen/umwelt-tiere/tiere/fischerei-und-jagd/fischerei/merkblatt_fanglimiten_schonzeiten_2026.pdf'
ZH_PREIS = 'https://www.zh.ch/content/dam/zhweb/bilder-dokumente/themen/umwelt-tiere/tiere/fischerei-und-jagd/fischerei/fischereipatente-beziehen/preise_f%C3%BCr_fischereipatente_ab_2026.pdf'
ZH_FISCH = 'https://www.zh.ch/de/umwelt-tiere/tiere/fischerei.html'
ZH_SRC = [S('Kanton ZH · Fischereivorschriften gültig ab 1.1.2026 (Auszug Angelfischerei, PDF)', ZH_VORSCHR),
          S('Kanton ZH · Merkblatt Fanglimiten, Fangmindestmasse und Schonzeiten 2026 (PDF)', ZH_MERK)]
ZH_PRICE_SRC = S('Kanton ZH · Preise für Fischereipatente ab 1.1.2026 (PDF)', ZH_PREIS)
ZH_PRICE_NOTE = T('Preisliste ZH unterscheidet nicht nach Wohnsitz (Ausnahme Linthkanal). Papierpatente + CHF 10.',
                  'The ZH price list does not differ by residence (except Linth canal). Paper permits + CHF 10.',
                  'La liste de prix ZH ne distingue pas selon le domicile (sauf canal de la Linth). Permis papier + CHF 10.',
                  'Il listino ZH non distingue per domicilio (eccetto canale della Linth). Patenti cartacee + CHF 10.')
ZH_LAKE_PRICES = {'rows': [
    P(T('Seenpatent (Zürich-, Greifen-, Pfäffikersee, Ufer)', 'Lakes permit (Zurich, Greifensee, Pfäffikersee; shore)', 'Permis lacs (Zurich, Greifensee, Pfäffikersee ; rive)', 'Patente laghi (Zurigo, Greifensee, Pfäffikersee; riva)'), {'year': 160}, None),
    P(T('Einzelseepatent (Ufer)', 'Single-lake permit (shore)', 'Permis un lac (rive)', 'Patente singolo lago (riva)'), {'day': 30, 'year': 100}, None,
      T('Tagespatent: Ufer + Boot', 'Day permit: shore + boat', 'Journalier : rive + bateau', 'Giornaliera: riva + barca')),
    P(T('Zusatz Boot (zum Jahrespatent)', 'Boat add-on (to annual permit)', 'Supplément bateau (au permis annuel)', 'Supplemento barca (alla patente annuale)'), {'year': 160}, None),
    P(T('Zusatz Gast (zum Jahrespatent)', 'Guest add-on (to annual permit)', 'Supplément invité (au permis annuel)', 'Supplemento ospite (alla patente annuale)'), {'year': 60}, None),
], 'note': ZH_PRICE_NOTE, 'src': ZH_PRICE_SRC, 'asOf': '2026'}
ZH_RIVER_PRICES = {'rows': [
    P(T('Flusspatent (Rhein 32, Limmat 358)', 'River permit (Rhine 32, Limmat 358)', 'Permis rivière (Rhin 32, Limmat 358)', 'Patente fiume (Reno 32, Limmat 358)'), {'day': 30, 'year': 170}, None),
], 'note': ZH_PRICE_NOTE, 'src': ZH_PRICE_SRC, 'asOf': '2026'}
ZH_PACHT_PRICES = {'rows': [
    P(T('Tageskarte Pachtrevier (nur wo der Pachtvertrag sie vorsieht)', 'Day card, leased revier (only where the lease provides it)', 'Carte journalière lot affermé (seulement si prévue par le bail)', 'Carta giornaliera riserva affittata (solo se prevista dal contratto)'), {'day': 30}, None,
      T('Fischereireglement ZH § 2; Ausgabestelle kann CHF 5 Gebühr erheben. Jahres-/Gästekarten: beim Pächter.', 'ZH fishing regulation § 2; issuing office may charge CHF 5. Annual/guest cards: from the lessee.', 'Règlement ZH § 2 ; frais possibles CHF 5. Cartes annuelles/invités : auprès du fermier.', 'Regolamento ZH § 2; possibile tassa CHF 5. Carte annuali/ospiti: dall’affittuario.')),
], 'src': S('Kanton ZH · Fischereireglement 2025 § 2 (im Auszug Fischereivorschriften 2026, PDF)', ZH_VORSCHR), 'asOf': '2026'}

ZH_GUEST = T('Tagespatente ohne SaNa (SaNa erst ab Patenten von mindestens einem Monat). Kein Aufpreis für Wohnsitz ausserhalb ZH/Ausland in der Preisliste. Freiangeln vom Ufer (Zürich-, Greifen-, Pfäffiker-, Türlersee) ohne Patent: 1 Rute, 1 Köder, Einfachhaken ohne Widerhaken, keine Köderfische.',
             'Day permits without SaNa (SaNa only for permits of one month or more). No surcharge for non-residents/foreigners in the price list. Free shore angling (Lake Zurich, Greifensee, Pfäffikersee, Türlersee) without permit: 1 rod, 1 bait, single barbless hook, no bait fish.',
             'Permis journaliers sans SaNa (SaNa dès un mois). Pas de supplément pour non-résidents/étrangers dans la liste de prix. Pêche libre depuis la rive (lac de Zurich, Greifensee, Pfäffikersee, Türlersee) sans permis : 1 canne, 1 appât, hameçon simple sans ardillon, pas de poissons-appâts.',
             'Patenti giornaliere senza SaNa (SaNa solo da un mese). Nessun sovrapprezzo per non residenti/stranieri nel listino. Pesca libera da riva (Zurigo, Greifensee, Pfäffikersee, Türlersee) senza patente: 1 canna, 1 esca, amo singolo senza ardiglione, niente pesci esca.')
ZH_GENERAL_METHODS = [
    T('Wo Waten erlaubt ist: nur Watschuhe ohne Filzsohlen; Wathosen/Kescher vor Gewässerwechsel trocknen.', 'Where wading is allowed: no felt soles; dry waders/nets before changing waters.', 'Où le passage à gué est permis : pas de semelles en feutre ; sécher bottes/épuisette avant de changer d’eau.', 'Dove è permesso guadare: niente suole in feltro; asciugare stivali/guadino prima di cambiare acqua.'),
    T('Nur tote Köderfische aus demselben Gewässer; Hälterung lebender Fische verboten.', 'Only dead bait fish from the same water; keeping live fish is prohibited.', 'Seulement des poissons-appâts morts du même plan d’eau ; garder des poissons vivants interdit.', 'Solo pesci esca morti della stessa acqua; vietato tenere pesci vivi.'),
]
ZH_FISHWAY = T('Fischaufstiegshilfen (Fischpässe, Umgehungsgewässer) sind Schongebiet (Fischereireglement § 25).', 'Fish passes and bypass channels are protected zones (§ 25).', 'Les passes à poissons sont des zones protégées (§ 25).', 'Le scale di risalita sono zone protette (§ 25).')

ZH = {
    'checked': CHECKED, 'rulesUrl': ZH_FISCH,
    'base': {'src': ZH_SRC, 'guest': ZH_GUEST},
    'profiles': [
        {'match': {'ids': ['zuerichsee-zh']},
         'label': T('Zürichsee und Obersee (Ausführungsbestimmungen 2025)', 'Lake Zurich and Obersee (2025 implementing rules)', 'Lac de Zurich et Obersee (dispositions 2025)', 'Lago di Zurigo e Obersee (disposizioni 2025)'),
         'prices': ZH_LAKE_PRICES,
         'catch': [{'sp': 'trout', 'day': 4}, {'sp': 'whitefish', 'day': 10}, {'sp': 'char', 'day': 5}, {'sp': 'pike', 'day': 5}, {'sp': 'perch', 'day': 50}, {'sp': 'zander', 'day': NONE}],
         'sizes': [{'sp': 'trout', 'cm': 40}, {'sp': 'whitefish', 'cm': 25}, {'sp': 'char', 'cm': 25}, {'sp': 'grayling', 'cm': 32}, {'sp': 'pike', 'cm': NOMIN}, {'sp': 'zander', 'cm': NOMIN}],
         'closed': [{'sp': 'trout', 'period': '01.10.–25.12.'}, {'sp': 'char', 'period': '01.10.–25.12.'}, {'sp': 'whitefish', 'period': '20.11.–31.12.'}, {'sp': 'grayling', 'period': YEARROUND}, {'sp': 'pike', 'period': NONE}, {'sp': 'zander', 'period': NONE}],
         'methods': [
             T('Patent: Ufer 2 Ruten; stehendes Boot 3 Ruten; Schleppangel bis 10 Köder.', 'Permit: shore 2 rods; anchored boat 3 rods; trolling up to 10 lures.', 'Permis : rive 2 cannes ; bateau à l’arrêt 3 cannes ; traîne jusqu’à 10 leurres.', 'Patente: riva 2 canne; barca ferma 3 canne; traina fino a 10 esche.'),
             T('Bis 5 Köder pro Schnur; Mehrfachhaken ohne Widerhaken; Einfachhaken mit Widerhaken nur mit SaNa.', 'Up to 5 baits per line; treble/double hooks barbless; barbed single hooks only with SaNa.', 'Jusqu’à 5 appâts par ligne ; hameçons multiples sans ardillon ; simple avec ardillon seulement avec SaNa.', 'Fino a 5 esche per lenza; ami multipli senza ardiglione; amo singolo con ardiglione solo con SaNa.'),
             T('Lebende Köderfische verboten; tote Köderfische nur aus Zürichsee/Obersee.', 'Live bait fish prohibited; dead bait fish only from Lake Zurich/Obersee.', 'Poissons-appâts vivants interdits ; morts seulement du lac de Zurich/Obersee.', 'Pesci esca vivi vietati; morti solo dal lago di Zurigo/Obersee.'),
             T('50 m Abstand zu Berufsfischer-Netzen.', 'Keep 50 m from commercial nets.', 'Distance de 50 m des filets professionnels.', 'Distanza di 50 m dalle reti professionali.'),
         ],
         'night': T('Fischen verboten: Sommerzeit 23–04 Uhr, übrige Zeit 22–05 Uhr.', 'No fishing: summer time 23:00–04:00, otherwise 22:00–05:00.', 'Pêche interdite : heure d’été 23 h–4 h, sinon 22 h–5 h.', 'Pesca vietata: ora legale 23–04, altrimenti 22–05.'),
         'zones': T('Fischereiverbot 16.11.–31.1. im Radius von 100 m um die Mündungen von Hornbach/Wehrenbach, Dorfbach Küsnacht, Erlenbach, Meilen, Aabach und Meilibach Horgen, Feldbach, Linthkanal, Jona, Wagnerbach, Aabach Schmerikon, Spreitenbach, Sarenbach. Schon-/Netzsperrgebiete Stadt Zürich und Linthkanalmündung (Anhang I/II). Stadt Zürich: kein Fischen von der Quaibrücke; Bürkliplatz und Utoquai Uferfischerei nur bis 09:00.',
                    'No fishing 16 Nov–31 Jan within 100 m of the mouths of Hornbach/Wehrenbach, Dorfbach Küsnacht, Erlenbach, Meilen, Aabach and Meilibach Horgen, Feldbach, Linth canal, Jona, Wagnerbach, Aabach Schmerikon, Spreitenbach, Sarenbach. Protected/net-free zones City of Zurich and Linth canal mouth (annex I/II). City of Zurich: no fishing from the Quaibrücke; Bürkliplatz and Utoquai shore fishing only until 09:00.',
                    'Pêche interdite du 16.11 au 31.1 dans un rayon de 100 m autour des embouchures (Hornbach, Küsnacht, Erlenbach, Meilen, Horgen, Feldbach, canal de la Linth, Jona, Wagnerbach, Schmerikon, Spreitenbach, Sarenbach). Zones protégées ville de Zurich et embouchure de la Linth (annexes I/II). Ville de Zurich : pas de pêche depuis le Quaibrücke ; Bürkliplatz et Utoquai seulement jusqu’à 9 h.',
                    'Pesca vietata dal 16.11 al 31.1 entro 100 m dalle foci (Hornbach, Küsnacht, Erlenbach, Meilen, Horgen, Feldbach, canale della Linth, Jona, Wagnerbach, Schmerikon, Spreitenbach, Sarenbach). Zone protette città di Zurigo e foce della Linth (allegati I/II). Città di Zurigo: vietato pescare dal Quaibrücke; Bürkliplatz e Utoquai solo fino alle 09.')},
        {'match': {'ids': ['greifensee-zh', 'pfaeffikersee-zh']},
         'label': T('Greifensee / Pfäffikersee (Fischereireglement 2025)', 'Greifensee / Pfäffikersee (2025 regulation)', 'Greifensee / Pfäffikersee (règlement 2025)', 'Greifensee / Pfäffikersee (regolamento 2025)'),
         'prices': ZH_LAKE_PRICES,
         'catch': [{'sp': 'trout', 'day': 2}, {'sp': 'whitefish', 'day': 10}, {'sp': 'pike', 'day': 5}, {'sp': 'perch', 'day': 50}, {'sp': 'zander', 'day': NONE}],
         'sizes': [{'sp': 'trout', 'cm': 40}, {'sp': 'whitefish', 'cm': 25}, {'sp': 'pike', 'cm': 45}, {'sp': 'zander', 'cm': 40}, {'sp': 'crayfish', 'cm': 12}],
         'closed': [{'sp': 'trout', 'period': '01.10.–25.12.'}, {'sp': 'whitefish', 'period': '20.11.–31.12.'}, {'sp': 'pike', 'period': '01.03.–30.04.'}, {'sp': 'zander', 'period': '01.04.–31.05.'}, {'sp': 'crayfish', 'period': '01.10.–15.07.'}],
         'methods': [
             T('Ufer: höchstens 2 Ruten, nur vom trockenen Ufer; stehendes Boot 3 Ruten; Schleppangel bis 6 Köder.', 'Shore: max 2 rods, from dry shore only; anchored boat 3 rods; trolling up to 6 lures.', 'Rive : 2 cannes max., depuis la rive sèche ; bateau à l’arrêt 3 cannes ; traîne jusqu’à 6 leurres.', 'Riva: max 2 canne, solo da riva asciutta; barca ferma 3 canne; traina fino a 6 esche.'),
             T('Widerhaken (Einzelhaken) nur mit SaNa; sonst ohne Widerhaken.', 'Barbed single hooks only with SaNa; otherwise barbless.', 'Hameçon simple avec ardillon seulement avec SaNa ; sinon sans ardillon.', 'Amo singolo con ardiglione solo con SaNa; altrimenti senza.'),
         ] + ZH_GENERAL_METHODS,
         'night': T('Keine Zeitbeschränkung (Merkblatt ZH 2026).', 'No time restriction (ZH leaflet 2026).', 'Pas de restriction horaire (fiche ZH 2026).', 'Nessuna restrizione oraria (scheda ZH 2026).'),
         'zones': T('Schutzverordnungen Greifensee (1994) und Pfäffikersee (1999): in den Schutzzonen u. a. Lagern, Zelten und Campieren verboten. Fischaufstiegshilfen sind Schongebiet.',
                    'Protection ordinances Greifensee (1994) and Pfäffikersee (1999): camping etc. prohibited in the protected zones. Fish passes are protected.',
                    'Ordonnances de protection Greifensee (1994) et Pfäffikersee (1999) : camper etc. interdit dans les zones protégées. Passes à poissons protégées.',
                    'Ordinanze di protezione Greifensee (1994) e Pfäffikersee (1999): campeggio ecc. vietato nelle zone protette. Scale di risalita protette.')},
        {'match': {'ids': ['rhein-32-zh', 'limmat-358-zh']},
         'label': T('Patentreviere Rhein 32 / Limmat 358', 'Permit reaches Rhine 32 / Limmat 358', 'Lots à permis Rhin 32 / Limmat 358', 'Tratti a patente Reno 32 / Limmat 358'),
         'prices': ZH_RIVER_PRICES,
         'catch': [{'sp': 'all', 'day': None, 'note': T('Keine Tagesfanglimite im Reglementsauszug genannt.', 'No daily limit stated in the regulation extract.', 'Pas de limite journalière indiquée dans l’extrait.', 'Nessun limite giornaliero indicato nell’estratto.')}],
         'sizes': [{'sp': 'trout', 'cm': '35 (Rhein) / 28 (F-Revier)'}, {'sp': 'grayling', 'cm': 35}, {'sp': 'whitefish', 'cm': 25}, {'sp': 'pike', 'cm': 45}, {'sp': 'zander', 'cm': 40}, {'sp': 'barbel', 'cm': 30}],
         'closed': [{'sp': 'trout', 'period': '16.10.–15.03.'}, {'sp': 'grayling', 'period': T('befristetes Äschenfangverbot bis Sept. 2029 (zh.ch); Schonzeit 01.02.–30.04.', 'temporary grayling ban until Sept 2029 (zh.ch); closed 01.02.–30.04.', 'interdiction temporaire de l’ombre jusqu’en sept. 2029 (zh.ch) ; fermeture 01.02.–30.04.', 'divieto temporaneo temolo fino a sett. 2029 (zh.ch); chiusura 01.02.–30.04.')}, {'sp': 'whitefish', 'period': '20.11.–31.12.'}, {'sp': 'pike', 'period': '01.03.–30.04.'}, {'sp': 'zander', 'period': '01.04.–31.05.'}],
         'methods': [T('Im Rhein und in der Limmat 2 Ruten erlaubt (sonst 1 Rute, 1 Köder; Fliegen/Nymphen 2 Köder).', 'Rhine and Limmat: 2 rods allowed (otherwise 1 rod, 1 bait; flies/nymphs 2).', 'Rhin et Limmat : 2 cannes (sinon 1 canne, 1 appât ; mouches 2).', 'Reno e Limmat: 2 canne (altrimenti 1 canna, 1 esca; mosche 2).')] + ZH_GENERAL_METHODS,
         'night': T('Keine Fangzeit-Regel im Reglementsauszug genannt – nicht in unseren Daten.', 'No fishing-hours rule stated in the extract – not in our data.', 'Pas de règle horaire dans l’extrait – pas dans nos données.', 'Nessuna regola oraria nell’estratto – non nei nostri dati.'),
         'zones': ZH_FISHWAY},
        {'match': {'p': ['pacht', 'private', 'mixed', 'unknown']},
         'label': T('Pacht- und Privatgewässer ZH (Fischereireglement 2025)', 'Leased and private waters ZH (2025 regulation)', 'Eaux affermées et privées ZH (règlement 2025)', 'Acque affittate e private ZH (regolamento 2025)'),
         'prices': ZH_PACHT_PRICES,
         'catch': [{'sp': 'all', 'day': None, 'note': T('Kantonal keine Tagesfanglimite im Auszug; Pächter können strengere Regeln erlassen (§ 28) – Revierbedingungen prüfen.', 'No cantonal daily limit in the extract; lessees may set stricter rules (§ 28) – check the revier conditions.', 'Pas de limite cantonale dans l’extrait ; les fermiers peuvent durcir (§ 28).', 'Nessun limite cantonale nell’estratto; gli affittuari possono inasprire (§ 28).')}],
         'sizes': [{'sp': 'trout', 'cm': '28 (F) / 25 (G, B)'}, {'sp': 'grayling', 'cm': 35}, {'sp': 'whitefish', 'cm': 25}, {'sp': 'pike', 'cm': 45}, {'sp': 'zander', 'cm': 40}, {'sp': 'barbel', 'cm': 30}, {'sp': 'crayfish', 'cm': 12}],
         'closed': [{'sp': 'trout', 'period': '16.10.–15.03.'}, {'sp': 'grayling', 'period': '01.02.–30.04.'}, {'sp': 'whitefish', 'period': '20.11.–31.12.'}, {'sp': 'pike', 'period': '01.03.–30.04.'}, {'sp': 'zander', 'period': '01.04.–31.05.'}, {'sp': 'crayfish', 'period': '01.10.–15.07.'}],
         'methods': [
             T('1 Rute, 1 Köder (Fliegen/Nymphen: 2), vom Ufer, watend oder vom Boot. Bäche der Kategorien G/B nur während der Forellensaison; Weiher ganzjährig.', '1 rod, 1 bait (flies/nymphs: 2), from shore, wading or boat. Streams of category G/B only during trout season; ponds all year.', '1 canne, 1 appât (mouches : 2). Ruisseaux G/B seulement pendant la saison de la truite ; étangs toute l’année.', '1 canna, 1 esca (mosche: 2). Ruscelli G/B solo nella stagione della trota; stagni tutto l’anno.'),
         ] + ZH_GENERAL_METHODS,
         'night': T('Keine Fangzeit-Regel im Reglementsauszug genannt – Revierbedingungen prüfen.', 'No fishing-hours rule in the extract – check revier conditions.', 'Pas de règle horaire dans l’extrait – vérifier les conditions du lot.', 'Nessuna regola oraria nell’estratto – verificare le condizioni.'),
         'zones': ZH_FISHWAY,
         'guest': T('Gästekarten und Tageskarten gibt der Pächter ab (Tageskarte CHF 30, nur wenn im Pachtvertrag vorgesehen). Tageskarten für Pachtgewässer nur bei Patentausgabestellen.', 'Guest and day cards are issued by the lessee (day card CHF 30, only if the lease provides it). Day cards for leased rivers only at permit sales points.', 'Cartes invité/journalières délivrées par le fermier (CHF 30, si prévu par le bail).', 'Carte ospite/giornaliere rilasciate dall’affittuario (CHF 30, se previsto).')},
    ],
}

# ------------------------------------------------------------------ BE
BE_FIDV = 'https://www.belex.sites.be.ch/api/de/versions/3323/pdf_file_with_annexes'
BE_FIV = 'https://www.belex.sites.be.ch/app/de/texts_of_law/923.111'
BE_SCHON = 'https://www.weu.be.ch/de/start/themen/jagd-fischerei/fischerei/fischen-kanton-bern/schonmassse-schonzeiten.html'
BE_PREIS = 'https://www.weu.be.ch/de/start/themen/jagd-fischerei/fischerei/fischen-kanton-bern/fischereipatente-preise.html'
BE_SRC = [S('Kanton BE · Direktionsverordnung über die Fischerei (FiDV, BSG 923.111.1), Stand 1.1.2026', BE_FIDV),
          S('Kanton BE · Verordnung über die Fischerei (FiV, BSG 923.111), Stand 1.1.2026', BE_FIV),
          S('Kanton BE · Schonmasse und Schonzeiten (ab 1.1.2026)', BE_SCHON)]
BE_PRICES = {'rows': [
    P(T('Tagespatent', 'Day permit', 'Permis journalier', 'Patente giornaliera'), {'day': 32}, {'day': 32}),
    P(T('Wochenpatent (7 Tage)', 'Week permit (7 days)', 'Permis semaine (7 jours)', 'Patente settimanale (7 giorni)'), {'week': 100}, {'week': 100}),
    P(T('Monatspatent (30 Tage, SaNa)', 'Month permit (30 days, SaNa)', 'Permis mensuel (30 jours, SaNa)', 'Patente mensile (30 giorni, SaNa)'), {'month': 180}, {'month': 360}),
    P(T('Jahrespatent (SaNa) + CHF 50 Hegebeitrag', 'Annual permit (SaNa) + CHF 50 levy', 'Permis annuel (SaNa) + CHF 50', 'Patente annuale (SaNa) + CHF 50'), {'year': 250}, {'year': 500}),
    P(T('Gastpatent (nur mit Jahrespatent-Inhaber)', 'Guest permit (only with an annual-permit holder)', 'Permis invité (avec titulaire d’un permis annuel)', 'Patente ospite (solo con titolare annuale)'), {'year': 85}, {'year': 85}),
], 'note': T('«Auswärtig» = Wohnsitz ausserhalb Kanton Bern (inkl. Ausland). Jugendliche/Auszubildende günstiger.', '"Non-resident" = residence outside canton Bern (incl. abroad). Reduced rates for youth/students.', '« Non-résident » = domicile hors canton de Berne (y c. étranger). Tarifs réduits jeunes/étudiants.', '«Non residente» = domicilio fuori dal Canton Berna (anche estero). Tariffe ridotte giovani/studenti.'),
    'src': S('Kanton BE · Fischereipatente und Preise', BE_PREIS), 'asOf': '2026'}
BE_PACHT_PRICES = {'rows': [
    P(T('Gastkarte Pachtstrecke (1 Tag, beim Pächter)', 'Guest card, leased reach (1 day, from lessee)', 'Carte invité lot affermé (1 jour, auprès du fermier)', 'Carta ospite tratto affittato (1 giorno, dall’affittuario)'), {'day': T('max. 30', 'max. 30', 'max. 30', 'max. 30')}, None,
      T('Höchstpreis laut FiDV Art. 42; Fischereipass (Jahr) beim Pächter, nur mit SaNa.', 'Maximum price per FiDV art. 42; annual pass from the lessee, SaNa required.', 'Prix maximal selon FiDV art. 42 ; passeport annuel auprès du fermier, avec SaNa.', 'Prezzo massimo secondo FiDV art. 42; tessera annuale dall’affittuario, con SaNa.')),
], 'src': S('Kanton BE · FiDV Art. 41–42 (Gastkarte, zulässiger Preis)', BE_FIDV), 'asOf': '2026'}
BE_CATCH = [
    {'sp': 'trout_char', 'day': 6, 'year': 150, 'note': T('davon max. 3/Tag und 30/Jahr Forellen aus Brienzer-, Thuner-, Bielersee; max. 50 Bachforellen/Jahr', 'of which max 3/day and 30/year trout from Lakes Brienz, Thun, Biel; max 50 brown trout/year', 'dont max. 3/jour et 30/an truites des lacs de Brienz, Thoune, Bienne ; max. 50 truites fario/an', 'di cui max 3/giorno e 30/anno trote dai laghi di Brienz, Thun, Bienne; max 50 trote fario/anno')},
    {'sp': 'pike', 'day': 5}, {'sp': 'whitefish', 'day': 25, 'note': T('Bielersee max. 20, Thunersee max. 15', 'Lake Biel max 20, Lake Thun max 15', 'lac de Bienne max. 20, lac de Thoune max. 15', 'lago di Bienne max 20, lago di Thun max 15')},
    {'sp': 'perch', 'day': 100}, {'sp': 'zander', 'day': 5},
    {'sp': 'grayling', 'day': 1, 'year': 5, 'note': T('nur mit Sonderbewilligung Äsche (Jahrespatent)', 'only with the grayling special permit (annual permit)', 'seulement avec autorisation spéciale ombre', 'solo con autorizzazione speciale temolo')},
]
BE_NIGHT = T('Angeln verboten: Sommerzeit 24–05 Uhr, Winterzeit 20–06 Uhr (FiV Art. 13). Aare unterhalb Bielersee und Aarestauseen dort: keine tageszeitliche Beschränkung.',
             'No angling: summer time 00:00–05:00, winter time 20:00–06:00 (FiV art. 13). Aare below Lake Biel and its reservoirs: no time restriction.',
             'Pêche interdite : heure d’été 0 h–5 h, heure d’hiver 20 h–6 h (FiV art. 13). Aar en aval du lac de Bienne : pas de restriction.',
             'Pesca vietata: ora legale 00–05, ora solare 20–06 (FiV art. 13). Aar a valle del lago di Bienne: nessuna restrizione.')
BE_GUEST = T('Tages- und Wochenpatent ohne SaNa (Sachkunde-Information lesen); Monats-/Jahrespatent nur mit SaNa – ein gleichwertiger ausländischer Ausweis wird bei Wohnsitz im Ausland anerkannt (FiDV Anhang 6). Wohnsitz ausserhalb BE: Monat/Jahr doppelter Tarif, Tag/Woche gleicher Preis. 16.–31. März gelten Tages-/Wochenkarten nur in den Seen (FiV Art. 7).',
             'Day and week permits without SaNa (read the competence information); month/annual permits need SaNa – an equivalent foreign certificate is accepted for residents abroad (FiDV annex 6). Residence outside BE: month/year double price, day/week same price. 16–31 March day/week permits are valid on the lakes only (FiV art. 7).',
             'Permis jour/semaine sans SaNa ; mois/année avec SaNa – une attestation étrangère équivalente est reconnue pour les personnes domiciliées à l’étranger (FiDV annexe 6). Hors BE : mois/année tarif double, jour/semaine même prix. Du 16 au 31 mars, cartes jour/semaine valables seulement sur les lacs.',
             'Patenti giorno/settimana senza SaNa; mese/anno con SaNa – un attestato estero equivalente è riconosciuto per chi risiede all’estero (FiDV allegato 6). Fuori BE: mese/anno prezzo doppio, giorno/settimana uguale. Dal 16 al 31 marzo valide solo sui laghi.')
BE_METHODS = [
    T('Widerhaken verboten; in stehenden Gewässern mit SaNa erlaubt. Lebende Köderfische und Anfüttern verboten.', 'Barbed hooks prohibited; allowed in standing waters with SaNa. Live bait fish and groundbaiting prohibited.', 'Ardillon interdit ; permis en eaux stagnantes avec SaNa. Poissons-appâts vivants et amorçage interdits.', 'Ardiglione vietato; consentito in acque ferme con SaNa. Pesci esca vivi e pasturazione vietati.'),
]
BE_LAKE_METHODS = [T('2 Ruten mit je max. 2 Ködern (Hegene max. 5); Schleppangel max. 6 Köder pro Patent (10 pro Boot).', '2 rods with max 2 baits each (Hegene max 5); trolling max 6 lures per permit (10 per boat).', '2 cannes, 2 appâts max. chacune (gambe 5) ; traîne 6 leurres par permis (10 par bateau).', '2 canne con max 2 esche (camoliera 5); traina max 6 esche per patente (10 per barca).'),
                   T('Freiangelei vom Ufer ohne Patent: 1 Rute, einfacher Haken ohne Widerhaken, keine Köderfische (FiDV Art. 12).', 'Free shore angling without permit: 1 rod, single barbless hook, no bait fish (FiDV art. 12).', 'Pêche libre depuis la rive sans permis : 1 canne, hameçon simple sans ardillon, pas de poissons-appâts.', 'Pesca libera da riva senza patente: 1 canna, amo singolo senza ardiglione, niente pesci esca.')] + BE_METHODS

def be_lake(ids, label, sizes, closed, zones):
    return {'match': {'ids': ids}, 'label': label, 'prices': BE_PRICES, 'catch': BE_CATCH, 'sizes': sizes, 'closed': closed,
            'methods': BE_LAKE_METHODS, 'night': BE_NIGHT, 'zones': zones}

BE_COMMON_CLOSED = [{'sp': 'pike', 'period': '01.03.–30.04.'}, {'sp': 'zander', 'period': '01.04.–31.05.'}]
BE_COMMON_SIZES = [{'sp': 'perch', 'cm': 15}, {'sp': 'pike', 'cm': 45}, {'sp': 'zander', 'cm': NOMIN}]
BE_LAKE_TROUT = {'sp': 'trout', 'cm': 45}
BE_LAKE_TROUT_C = {'sp': 'trout', 'period': '01.09.–31.01.'}
BE_PROTECTED = T('Ganzjährig geschützt: Dohlen- und Steinkrebs, Bachneunauge, Strömer, Bitterling, Nase, Moorgrundel, Aal.', 'Protected all year: white-clawed and stone crayfish, brook lamprey, souffia, bitterling, nase, weatherfish, eel.', 'Protégés toute l’année : écrevisses à pattes blanches et des torrents, lamproie, blageon, bouvière, nase, loche d’étang, anguille.', 'Protetti tutto l’anno: gamberi di fiume, lampreda, vairone, rodeo, naso, cobite, anguilla.')

BE = {
    'checked': CHECKED, 'rulesUrl': BE_SCHON,
    'base': {'src': BE_SRC, 'guest': BE_GUEST, 'night': BE_NIGHT},
    'profiles': [
        be_lake(['thunersee-be'], T('Thunersee', 'Lake Thun', 'Lac de Thoune', 'Lago di Thun'),
                [BE_LAKE_TROUT, {'sp': 'whitefish', 'cm': 25}, {'sp': 'char', 'cm': 22}] + BE_COMMON_SIZES,
                [BE_LAKE_TROUT_C, {'sp': 'whitefish', 'period': '01.10.–31.12.'}, {'sp': 'char', 'period': '01.10.–31.12.'}] + BE_COMMON_CLOSED,
                T('Schongebiete (FiDV Anhang 2): Aare-/Kanaleinmündung, Werkkanal Spiez und Kandermündung je 200 m (1.9.–31.12.); Weissenau bis Sturmwarnung Neuhaus; Gwattlischenmoos (Naturschutzreservat). Siehe Kartenebene.',
                  'Protected zones (FiDV annex 2): Aare/canal inflow, Spiez power canal and Kander mouth 200 m each (1 Sep–31 Dec); Weissenau to Neuhaus storm warning; Gwattlischenmoos (nature reserve). See map layer.',
                  'Zones protégées (FiDV annexe 2) : embouchures Aar/canal, canal de Spiez et Kander 200 m (1.9–31.12) ; Weissenau ; Gwattlischenmoos. Voir la couche carte.',
                  'Zone protette (FiDV allegato 2): foci Aar/canale, canale di Spiez e Kander 200 m (1.9–31.12); Weissenau; Gwattlischenmoos. Vedi livello mappa.')),
        be_lake(['brienzersee-be'], T('Brienzersee', 'Lake Brienz', 'Lac de Brienz', 'Lago di Brienz'),
                [BE_LAKE_TROUT, {'sp': 'whitefish', 'cm': 18}, {'sp': 'char', 'cm': 22}] + BE_COMMON_SIZES,
                [BE_LAKE_TROUT_C, {'sp': 'whitefish', 'period': '01.11.–31.12.'}, {'sp': 'char', 'period': '01.11.–31.12.'}] + BE_COMMON_CLOSED,
                T('Schongebiete (FiDV Anhang 2): Aare- und Lütschineneinmündung je 200 m, 1.9.–31.12. (Trüschenfischerei ganzjährig zulässig). Siehe Kartenebene.',
                  'Protected zones (FiDV annex 2): Aare and Lütschine inflows 200 m each, 1 Sep–31 Dec (burbot fishing allowed all year). See map layer.',
                  'Zones protégées : embouchures de l’Aar et de la Lütschine 200 m, 1.9–31.12. Voir la couche carte.',
                  'Zone protette: foci Aar e Lütschine 200 m, 1.9–31.12. Vedi livello mappa.')),
        be_lake(['bielersee-be'], T('Bielersee (BE-Teil)', 'Lake Biel (BE part)', 'Lac de Bienne (partie BE)', 'Lago di Bienne (parte BE)'),
                [BE_LAKE_TROUT, {'sp': 'whitefish', 'cm': 23}, {'sp': 'char', 'cm': 22}] + BE_COMMON_SIZES,
                [BE_LAKE_TROUT_C, {'sp': 'whitefish', 'period': '01.11.–31.12.'}, {'sp': 'char', 'period': '01.11.–31.12.'}] + BE_COMMON_CLOSED,
                T('Schongebiet Twannbach-Mündung (markierter Umkreis) und Aare bei Hagneck bis zu den Markierungstafeln (FiDV Anhang 2). Siehe Kartenebene.',
                  'Protected zones: Twannbach mouth (marked area) and Aare at Hagneck up to the marker boards (FiDV annex 2). See map layer.',
                  'Zones protégées : embouchure du ruisseau de Douanne et Aar à Hagneck (FiDV annexe 2). Voir la couche carte.',
                  'Zone protette: foce del Twannbach e Aar a Hagneck (FiDV allegato 2). Vedi livello mappa.')),
        {'match': {'re': '^aare-(?!.*pacht)', 'p': ['patent']},
         'label': T('Aare (Patentstrecken) – Masse je nach Abschnitt', 'Aare (permit reaches) – sizes depend on the stretch', 'Aar (tronçons à permis) – tailles selon le tronçon', 'Aar (tratti a patente) – misure secondo il tratto'),
         'prices': BE_PRICES, 'catch': BE_CATCH,
         'sizes': [
             {'sp': 'trout', 'cm': 30, 'where': T('Brienzersee–Thunersee inkl. Schifffahrtskanal; Wohlensee–Bielersee', 'Lake Brienz–Lake Thun incl. canal; Wohlensee–Lake Biel', 'Brienz–Thoune ; Wohlensee–Bienne', 'Brienz–Thun; Wohlensee–Bienne')},
             {'sp': 'trout', 'cm': 34, 'where': T('Thunersee–Wohlensee (Fangfenster 34–40 cm und ab 50 cm bis Engehalde, 16.3.–30.9.)', 'Lake Thun–Wohlensee (slot 34–40 cm and from 50 cm down to Engehalde, 16 Mar–30 Sep)', 'Thoune–Wohlensee (fenêtre 34–40 et dès 50 cm jusqu’à Engehalde)', 'Thun–Wohlensee (finestra 34–40 e da 50 cm fino a Engehalde)')},
             {'sp': 'trout', 'cm': 38, 'where': T('unterhalb Bielersee bis Murgenthal', 'below Lake Biel to Murgenthal', 'en aval du lac de Bienne', 'a valle del lago di Bienne')},
             {'sp': 'grayling', 'cm': 36, 'where': T('Thunersee–Bielersee (nur mit Sonderbewilligung); Interlaken 40 cm', 'Lake Thun–Lake Biel (special permit only); Interlaken 40 cm', 'Thoune–Bienne (autorisation spéciale) ; Interlaken 40 cm', 'Thun–Bienne (autorizzazione speciale); Interlaken 40 cm')},
             {'sp': 'pike', 'cm': T('kein Mindestmass bis Neubrücke Bern, sonst 45', 'no minimum down to Neubrücke Bern, else 45', 'pas de minimum jusqu’au Neubrücke, sinon 45', 'nessun minimo fino a Neubrücke, altrimenti 45')},
             {'sp': 'perch', 'cm': 15}],
         'closed': [{'sp': 'trout', 'period': '01.10.–15.03.'}, {'sp': 'grayling', 'period': T('01.01.–30.09. (Fang nur 1.10.–31.12. mit Sonderbewilligung)', '01.01.–30.09. (only 1 Oct–31 Dec with special permit)', '01.01–30.09 (seulement 1.10–31.12 avec autorisation)', '01.01–30.09 (solo 1.10–31.12 con autorizzazione)')}] + BE_COMMON_CLOSED,
         'methods': [T('Aare ganzjährig befischbar (FiDV Art. 23); 2 Ruten mit je max. 2 Ködern (Hegene 5); Widerhaken verboten.', 'Aare open all year (FiDV art. 23); 2 rods with max 2 baits (Hegene 5); barbed hooks prohibited.', 'Aar ouverte toute l’année ; 2 cannes, 2 appâts max. ; ardillon interdit.', 'Aar aperta tutto l’anno; 2 canne, max 2 esche; ardiglione vietato.')] + [T('Lebende Köderfische und Anfüttern verboten.', 'Live bait fish and groundbaiting prohibited.', 'Poissons-appâts vivants et amorçage interdits.', 'Pesci esca vivi e pasturazione vietati.')],
         'zones': T('Schongebiete u. a. Interlaken (Nadelwehr, Kleine Aare), Thun (Schadau–Mühleschleusen, Stauwehr), Bern (Marzili–Dalmazibrücke, Schwellenmätteli, Engehalde je 100 m), Hagneck, Port, Bannwil, Wynau (FiDV Anhang 2). Siehe Kartenebene.',
                    'Protected zones incl. Interlaken (needle weir, Kleine Aare), Thun (Schadau–Mühleschleusen, weir), Bern (Marzili–Dalmazibrücke, Schwellenmätteli, Engehalde 100 m each), Hagneck, Port, Bannwil, Wynau (FiDV annex 2). See map layer.',
                    'Zones protégées notamment Interlaken, Thoune, Berne (Marzili, Schwellenmätteli, Engehalde), Hagneck, Port, Bannwil, Wynau (FiDV annexe 2). Voir la couche carte.',
                    'Zone protette tra cui Interlaken, Thun, Berna (Marzili, Schwellenmätteli, Engehalde), Hagneck, Port, Bannwil, Wynau. Vedi livello mappa.')},
        {'match': {'p': ['patent', 'mixed', 'freiangel']},
         'label': T('Übrige Berner Patentgewässer (Bergseen, Stauseen, Fliessgewässer)', 'Other Bern permit waters (mountain lakes, reservoirs, rivers)', 'Autres eaux à permis BE', 'Altre acque a patente BE'),
         'prices': BE_PRICES, 'catch': BE_CATCH,
         'sizes': [{'sp': 'trout', 'cm': T('24 (meiste Gewässer; je nach Gewässer 22–38)', '24 (most waters; 22–38 depending on water)', '24 (la plupart ; 22–38 selon le cours d’eau)', '24 (perlopiù; 22–38 secondo l’acqua)')}, {'sp': 'char', 'cm': 22}, {'sp': 'whitefish', 'cm': 25}] + BE_COMMON_SIZES,
         'closed': [{'sp': 'trout', 'period': '01.10.–15.03.'}, {'sp': 'char', 'period': '01.11.–31.12.'}, {'sp': 'whitefish', 'period': '01.11.–31.12.'}, {'sp': 'grayling', 'period': T('in übrigen Patentgewässern nicht erlaubt (ganzjährig)', 'not allowed in other permit waters (all year)', 'interdit dans les autres eaux à permis', 'vietato nelle altre acque a patente')}] + BE_COMMON_CLOSED,
         'methods': [T('Bergseen/Stauseen: 2 Ruten (je 2 Köder, Hegene 5) oder Schleppangel max. 2 Köder. Edelfisch-Fliessgewässer: 1 Rute, max. 2 Köder, nach 6 Edelfischen aufhören; einige nur Mo/Mi/Sa (FiDV Art. 21–24).', 'Mountain lakes/reservoirs: 2 rods (2 baits each, Hegene 5) or trolling max 2 lures. Trout streams: 1 rod, max 2 baits, stop after 6 salmonids; some only Mon/Wed/Sat (FiDV art. 21–24).', 'Lacs de montagne/retenues : 2 cannes ou traîne 2 leurres. Cours d’eau à salmonidés : 1 canne, 2 appâts, arrêt après 6 salmonidés ; certains seulement lu/me/sa.', 'Laghi alpini/bacini: 2 canne o traina 2 esche. Corsi d’acqua a salmonidi: 1 canna, 2 esche, stop dopo 6 salmonidi; alcuni solo lu/me/sa.')] + BE_METHODS,
         'zones': T('Schongebiete laut FiDV Anhang 2 (u. a. Gürbe-Oberlauf, Kander/Simme im September, Schüss). Fischaufstiegshilfen ganzjährig gesperrt. Siehe Kartenebene.', 'Protected zones per FiDV annex 2 (e.g. upper Gürbe, Kander/Simme in September, Schüss). Fish passes closed all year. See map layer.', 'Zones protégées selon FiDV annexe 2. Passes à poissons fermées toute l’année. Voir la couche carte.', 'Zone protette secondo FiDV allegato 2. Scale di risalita chiuse tutto l’anno. Vedi livello mappa.')},
        {'match': {'p': ['pacht', 'private', 'unknown']},
         'label': T('Berner Pachtstrecken', 'Bern leased reaches', 'Lots affermés BE', 'Tratti affittati BE'),
         'prices': BE_PACHT_PRICES, 'catch': BE_CATCH,
         'sizes': [{'sp': 'trout', 'cm': T('22 (Oberland/Berner Jura) bzw. 24 (übrige)', '22 (Oberland/Bernese Jura) or 24 (others)', '22 (Oberland/Jura bernois) ou 24', '22 (Oberland/Giura bernese) o 24')}, {'sp': 'grayling', 'cm': 30}] + BE_COMMON_SIZES,
         'closed': [{'sp': 'trout', 'period': '01.10.–15.03.'}, {'sp': 'grayling', 'period': '01.01.–30.09.'}] + BE_COMMON_CLOSED,
         'methods': BE_METHODS + [T('Pachtvereinigungen können zusätzliche Regeln haben (Pachtblatt).', 'Lessee associations may have extra rules (lease sheet).', 'Les associations de fermiers peuvent avoir des règles supplémentaires.', 'Le associazioni possono avere regole aggiuntive.')],
         'zones': T('Schongebiete laut FiDV Anhang 2; Fischaufstiegshilfen ganzjährig gesperrt. Siehe Kartenebene.', 'Protected zones per FiDV annex 2; fish passes closed all year. See map layer.', 'Zones protégées selon FiDV annexe 2. Voir la couche carte.', 'Zone protette secondo FiDV allegato 2. Vedi livello mappa.'),
         'guest': T('Gastkarte (1 Tag, max. CHF 30) beim Pächter – mit Sachkunde-Information, ohne SaNa. Fischereipass nur mit SaNa.', 'Guest card (1 day, max CHF 30) from the lessee – with competence information, no SaNa. Annual pass only with SaNa.', 'Carte invité (1 jour, max. CHF 30) auprès du fermier – sans SaNa. Passeport annuel avec SaNa.', 'Carta ospite (1 giorno, max CHF 30) dall’affittuario – senza SaNa. Tessera annuale con SaNa.')},
    ],
}

# ------------------------------------------------------------------ price-only cantons (rules: not in our data yet)
GR_PDF = 'https://www.gr.ch/DE/institutionen/verwaltung/diem/ajf/fischerei/Documents/Fischen%20in%20Graub%c3%bcnden/Fischereipatente/Preisliste%20Fischereipatente%202026.pdf'
GR = {'checked': CHECKED, 'rulesUrl': 'https://www.gr.ch/DE/institutionen/verwaltung/diem/ajf/fischerei/Fischen-in-Graubuenden/Seiten/Fischereipatente.aspx',
      'base': {'prices': {'rows': [
          P(T('Tagespatent', 'Day permit', 'Permis journalier', 'Patente giornaliera'), {'day': 36}, {'day': 46}),
          P(T('Wochenpatent (7 Tage)', 'Week permit (7 days)', 'Permis semaine', 'Patente settimanale'), {'week': 98}, {'week': 141}),
          P(T('Halbmonatspatent (15 Tage)', 'Half-month permit (15 days)', 'Permis 15 jours', 'Patente 15 giorni'), {'d15': 149}, {'d15': 235}),
          P(T('Monatspatent (30 Tage, Kenntnisnachweis)', 'Month permit (30 days, proof of knowledge)', 'Permis mensuel (attestation)', 'Patente mensile (attestato)'), {'month': 181}, {'month': 342}),
          P(T('Saisonpatent (Kenntnisnachweis)', 'Season permit (proof of knowledge)', 'Permis saison (attestation)', 'Patente stagionale (attestato)'), {'year': 235}, {'year': 449}),
      ], 'note': T('Totalpreise inkl. Kanzleigebühr. «Auswärtig» = ohne steuerrechtlichen Wohnsitz in GR.', 'Total incl. office fee. "Non-resident" = no tax residence in GR.', 'Prix totaux, frais inclus. « Non-résident » = sans domicile fiscal GR.', 'Prezzi totali incl. tassa. «Non residente» = senza domicilio fiscale GR.'),
          'src': S('Amt für Jagd und Fischerei GR · Fischereipatentpreise 2026 (PDF)', GR_PDF), 'asOf': '2026'}}, 'profiles': [{'match': {'p': ['patent', 'mixed', 'freiangel']}}]}

LU_URL = 'https://lawa.lu.ch/fischerei/fischereipatente'
LU_SRC = S('Kanton LU (lawa) · Fischereipatente – Preise', LU_URL)
LU_NOTE = T('Inkl. Bearbeitungsgebühr und MWST. Jahrespatent nur mit SaNa; Tages-/Wochen-/Monatspatent ohne SaNa.', 'Incl. processing fee and VAT. Annual permit needs SaNa; day/week/month without SaNa.', 'Frais et TVA inclus. Permis annuel avec SaNa ; jour/semaine/mois sans SaNa.', 'Tasse e IVA incluse. Annuale con SaNa; giorno/settimana/mese senza SaNa.')
LU = {'checked': CHECKED, 'rulesUrl': LU_URL, 'base': {}, 'profiles': [
    {'match': {'ids': ['sempachersee-lu']}, 'label': T('Sempachersee', 'Lake Sempach', 'Lac de Sempach', 'Lago di Sempach'),
     'prices': {'rows': [
         P(T('Flug-, Spinn-, Grund-, Hegenenfischerei', 'Fly, spin, ledger, Hegene fishing', 'Mouche, lancer, fond, gambe', 'Mosca, spinning, fondo, camoliera'), {'day': 25, 'week': 30, 'month': 75, 'year': 125}, {'day': 37.5, 'week': 45, 'month': 105, 'year': 180}),
         P(T('Schleppfischerei', 'Trolling', 'Traîne', 'Traina'), {'year': 185}, {'year': 270})], 'note': LU_NOTE, 'src': LU_SRC, 'asOf': '2026'}},
    {'match': {'ids': ['vierwaldstaettersee-lu']}, 'label': T('Vierwaldstättersee (LU, Zone 14 ohne Horwerbucht)', 'Lake Lucerne (LU, zone 14 excl. Horw bay)', 'Lac des Quatre-Cantons (LU, zone 14)', 'Lago dei Quattro Cantoni (LU, zona 14)'),
     'prices': {'rows': [
         P(T('Flug-, Spinn-, Grund-, Hegenen- und Schleppfischerei', 'Fly, spin, ledger, Hegene and trolling', 'Mouche, lancer, fond, gambe et traîne', 'Mosca, spinning, fondo, camoliera e traina'), {'year': 165}, {'year': 240}),
         P(T('Horwerbucht (Zone 12)', 'Horw bay (zone 12)', 'Baie de Horw (zone 12)', 'Baia di Horw (zona 12)'), {'year': 85}, {'year': 120})],
      'note': T('Tagespatente für den Vierwaldstättersee: nicht in unseren Daten.', 'Day permits for Lake Lucerne: not in our data.', 'Permis journaliers : pas dans nos données.', 'Patenti giornaliere: non nei nostri dati.'), 'src': LU_SRC, 'asOf': '2026'}},
]}

SZ_URL = 'https://www.sz.ch/public/upload/assets/63319/Gesuch_um_Erteilung_eines_Fischerpatents.pdf?fp=6'
SZ_SRC = S('Kanton SZ · Gesuch um Erteilung eines Fischerpatents (Gebühren, PDF)', SZ_URL)
SZ_NOTE = T('Plus CHF 25 Ausfertigungsgebühr (entfällt im Webshop/App). «Auswärtig» = ausserkantonal.', 'Plus CHF 25 issuing fee (not in web shop/app). "Non-resident" = outside canton SZ.', 'Plus CHF 25 de frais (pas en ligne/app).', 'Più CHF 25 di tassa (non nello shop/app).')
SZ = {'checked': CHECKED, 'rulesUrl': 'https://www.sz.ch/verwaltung/umweltdepartement/amt-fuer-gewaesser/fischerei/fischerpatente.html/8756-8758-8802-9447-9450-10713-10826', 'base': {}, 'profiles': [
    {'match': {'k': ['lake'], 'p': ['patent', 'mixed', 'freiangel']}, 'label': T('Seepatente SZ', 'SZ lake permits', 'Permis lacs SZ', 'Patenti laghi SZ'),
     'prices': {'rows': [
         P(T('Patent Ia – See vom Ufer', 'Permit Ia – lake from shore', 'Permis Ia – lac depuis la rive', 'Patente Ia – lago da riva'), {'day': 18, 'month': 37, 'year': 96}, {'day': 18, 'month': 70, 'year': 183}),
         P(T('Patent Ib – See mit Boot', 'Permit Ib – lake with boat', 'Permis Ib – lac en bateau', 'Patente Ib – lago in barca'), {'day': 27, 'month': 90, 'year': 203}, {'day': 27, 'month': 179, 'year': 405}),
     ], 'note': SZ_NOTE, 'src': SZ_SRC, 'asOf': T('Formular (ohne Datum), geprüft 2026-10-06', 'form (undated), checked 2026-10-06', 'formulaire (non daté), vérifié 2026-10-06', 'modulo (senza data), verificato 2026-10-06')}},
    {'match': {'p': ['patent', 'mixed', 'freiangel']}, 'label': T('Bachpatent SZ (Saison 1.4.–15.9.)', 'SZ stream permit (season 1 Apr–15 Sep)', 'Permis ruisseaux SZ', 'Patente ruscelli SZ'),
     'prices': {'rows': [
         P(T('Patent II – Bach', 'Permit II – stream', 'Permis II – ruisseau', 'Patente II – ruscello'), {'day': 33, 'month': 90, 'year': 185}, {'day': 45, 'month': 252, 'year': 450}, T('Tagespatent ab 15. Mai', 'Day permit from 15 May', 'Journalier dès le 15 mai', 'Giornaliera dal 15 maggio')),
     ], 'note': SZ_NOTE, 'src': SZ_SRC, 'asOf': T('Formular (ohne Datum), geprüft 2026-10-06', 'form (undated), checked 2026-10-06', 'formulaire (non daté), vérifié 2026-10-06', 'modulo (senza data), verificato 2026-10-06')}},
]}

SG_BS = 'https://www.sg.ch/umwelt-natur/jagd-fischerei/fischerei/fischereipatente/ausfuehrungsbestimmungen-patentgewaesser/_jcr_content/Par/sgch_downloadlist_1528502077/DownloadListPar/sgch_download_1175186621.ocFile/Fischereibestimmungen%20Bodensee%202026.pdf'
SG = {'checked': CHECKED, 'rulesUrl': 'https://www.sg.ch/umwelt-natur/jagd-fischerei/fischerei/fischereipatente/patentgewaesser-kanton-st-gallen.html', 'base': {}, 'profiles': [
    {'match': {'ids': ['bodensee-sg']}, 'label': T('Bodensee (SG-Patent)', 'Lake Constance (SG permit)', 'Lac de Constance (permis SG)', 'Lago di Costanza (patente SG)'),
     'prices': {'rows': [
         P(T('Uferpatent (ganzes Schweizer Ufer)', 'Shore permit (whole Swiss shore)', 'Permis rive (toute la rive suisse)', 'Patente riva (tutta la riva svizzera)'), {'month': 45, 'year': 90}, {'month': 90, 'year': 180}),
         P(T('Bootspatent (inkl. Ufer, Halde, Hoher See)', 'Boat permit (incl. shore, Halde, open lake)', 'Permis bateau', 'Patente barca'), {'week': 30, 'month': 90, 'year': 180}, {'week': 60, 'month': 180, 'year': 360}),
     ], 'note': T('Monats-/Jahrespatent nur mit SaNa. Doppelte Taxe bei Wohnsitz ausserhalb SG und ZH. Ein Tagespatent ist nicht aufgeführt.', 'Month/annual permits need SaNa. Double fee for residence outside SG and ZH. No day permit listed.', 'Permis mois/année avec SaNa. Taxe double hors SG et ZH. Pas de permis journalier indiqué.', 'Mese/anno con SaNa. Tassa doppia fuori SG e ZH. Nessuna giornaliera indicata.'),
      'src': S('Kanton SG · Fischereibestimmungen Bodensee-Obersee 2026 (PDF)', SG_BS), 'asOf': '2026'}},
]}

VS_ARR = 'https://valais-peche.ch/wp-content/uploads/2024/02/Arrete-cantonal-2024-2028.pdf'
VS = {'checked': CHECKED, 'rulesUrl': 'https://www.vs.ch/web/scpf/permis-de-peche-pour-le-rhone-les-rivieres-les-gouilles-et-lacs-de-montagne', 'base': {}, 'profiles': [
    {'match': {'re': '^(?!.*leman)', 'p': ['patent', 'mixed', 'freiangel']}, 'label': T('Rhone, Flüsse, Bergseen und Gouilles (Kantonspatent VS)', 'Rhône, rivers, mountain lakes and ponds (VS permit)', 'Rhône, rivières, lacs de montagne et gouilles', 'Rodano, fiumi, laghi alpini e pozze'),
     'prices': {'rows': [
         P(T('Tagespatent', 'Day permit', 'Permis journalier', 'Patente giornaliera'), {'day': 25}, None, T('+ max. CHF 5 Ausgabegebühr', '+ max CHF 5 issuing fee', '+ max. CHF 5 de frais', '+ max CHF 5 di tassa')),
         P(T('2-Tage-Patent', '2-day permit', 'Permis deux jours', 'Patente due giorni'), {'d2': 45}, None),
         P(T('Jahrespatent (SaNa)', 'Annual permit (SaNa)', 'Permis annuel (SaNa)', 'Patente annuale (SaNa)'), {'year': 196}, {'year': 346}),
     ], 'note': T('Halbmonatspatent: Preis nicht in unseren Daten. Ausländer mit Wohnsitz im Wallis zahlen den Walliser Tarif.', 'Half-month permit: price not in our data. Foreigners resident in Valais pay the Valais rate.', 'Permis mi-mensuel : prix pas dans nos données. Étrangers domiciliés en Valais : tarif valaisan.', 'Patente 15 giorni: prezzo non nei nostri dati. Stranieri domiciliati in Vallese: tariffa vallesana.'),
      'src': S('Kanton VS · Arrêté quinquennal sur l’exercice de la pêche 2024–2028 (RS/VS 923.170), Art. 15 (PDF via FCVPA)', VS_ARR), 'asOf': '2024–2028'}},
]}

TI_LAW = 'https://www3.ti.ch/CAN/RLeggi/public/raccolta-leggi/legge/numero/8.5.2.1'
TI = {'checked': CHECKED, 'rulesUrl': 'https://www4.ti.ch/dt/da/ucp/temi/pesca/per-saperne-di-piu/domande-frequenti/', 'base': {}, 'profiles': [
    {'match': {'p': ['patent', 'mixed', 'freiangel']}, 'label': T('Kantonspatent TI', 'Ticino permit', 'Permis TI', 'Patente TI'),
     'prices': {'rows': [
         P(T('T1 Touristenpatent (alle Gewässer, ohne Äsche)', 'T1 tourist permit (all waters, no grayling)', 'T1 touristique (toutes eaux, sans ombre)', 'T1 turistica (tutte le acque, escluso temolo)'), {'d2': 60, 'week': 120}, None, T('7 Tage', '7 days', '7 jours', '7 giorni')),
         P(T('T2 Touristenpatent (Ufer Lago Maggiore/Luganersee)', 'T2 tourist permit (shore of Lakes Maggiore/Lugano)', 'T2 (rive Majeur/Lugano)', 'T2 (riva Verbano/Ceresio)'), {'d2': 30, 'week': 50}, None),
         P(T('D1 Jahrespatent (SaNa) + CHF 60 Zuschlag', 'D1 annual permit (SaNa) + CHF 60 surcharge', 'D1 annuel (SaNa) + CHF 60', 'D1 annuale (SaNa) + CHF 60'), {'year': 170}, {'year': T('350 (andere Kantone) / 600 (Ausland)', '350 (other cantons) / 600 (abroad)', '350 (autres cantons) / 600 (étranger)', '350 (altri cantoni) / 600 (estero)')}),
         P(T('D2 Jahrespatent Ufer Maggiore/Lugano', 'D2 annual shore Maggiore/Lugano', 'D2 annuel rive Majeur/Lugano', 'D2 annuale riva Verbano/Ceresio'), {'year': 80}, {'year': 100}),
     ], 'note': T('Touristenpatente (T1/T2) ohne SaNa; Jahrespatente nur mit SaNa.', 'Tourist permits (T1/T2) without SaNa; annual permits need SaNa.', 'Permis touristiques sans SaNa ; annuels avec SaNa.', 'Patenti turistiche senza SaNa; annuali con SaNa.'),
      'src': S('Kanton TI · Legge sulla pesca (8.5.2.1), Art. 16 Tasse', TI_LAW), 'asOf': '2026'}},
]}

RULES = {'ZH': ZH, 'BE': BE, 'GR': GR, 'LU': LU, 'SZ': SZ, 'SG': SG, 'VS': VS, 'TI': TI}
