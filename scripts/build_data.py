"""Build public/data/waters.geojson from open government geodata in data-raw/.

Sources
- ZH: Kanton Zürich OGD "Fischereireviere" (geolion 314; WFS maps.zh.ch/wfs/OGDZHWFS), Datenstand Bonitierung 2009/10.
- BE: swisstopo/BAFU VECTOR25 lakes + Gewässernetz 1:2 Mio (api3.geo.admin.ch), clipped to BE (swissBOUNDARIES3D);
      permit regime from the official BE patent-water list (be.ch / BKFV). Official ANGFISCH map is overlaid as WMS in the app.

Run:  scripts/fetch_data.sh && .venv/bin/python scripts/build_data.py
Requires: geopandas, shapely
"""
import json
from pathlib import Path

import geopandas as gpd
import pandas as pd
from shapely.geometry import shape, mapping
from shapely.ops import linemerge as _linemerge, unary_union

def linemerge(g):
    if g.geom_type == 'MultiLineString':
        return _linemerge(g)
    return g

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / 'data-raw'
OUT = ROOT / 'public' / 'data' / 'waters.geojson'
LV95 = 2056

def L(de, en=None):
    return {'de': de, 'en': en if en is not None else de}

# ---------------------------------------------------------------- links
ZH = {
    'patentPage': 'https://www.zh.ch/de/umwelt-tiere/tiere/fischerei/wie-und-wo-fischen-im-kanton-zuerich/fischereipatente-beziehen-2026.html',
    'app': 'https://www.zh.ch/de/umwelt-tiere/tiere/fischerei/efj2-app.html',
    'prices': 'https://www.zh.ch/content/dam/zhweb/bilder-dokumente/themen/umwelt-tiere/tiere/fischerei-und-jagd/fischerei/fischereipatente-beziehen/preise_f%C3%BCr_fischereipatente_ab_2026.pdf',
    'reviere': 'https://www.zh.ch/de/umwelt-tiere/tiere/fischerei/fischereireviere.html',
    'verzeichnis': 'https://www.zh.ch/content/dam/zhweb/bilder-dokumente/themen/umwelt-tiere/tiere/fischerei-und-jagd/fischerei/fischereireviere/Fischereirevierverzeichnis_20260922.pdf',
    'howwhere': 'https://www.zh.ch/de/umwelt-tiere/tiere/fischerei/wie-und-wo-fischen-im-kanton-zuerich.html',
    'datasheet': 'https://maps.zh.ch/system/docs/aln_fjv/fischereireviere/Fischereidatenblatt_{nr}.pdf',
    'source': 'https://geolion.zh.ch/geodatensatz/386',
}
BE = {
    'buy': 'https://www.weu.be.ch/de/start/themen/jagd-fischerei/fischerei/fischen-kanton-bern/fischereipatent-beziehen.html',
    'app': 'https://www.weu.be.ch/de/start/themen/jagd-fischerei/fischerei/fischen-kanton-bern/fischerei-app.html',
    'prices': 'https://www.weu.be.ch/de/start/themen/jagd-fischerei/fischerei/fischen-kanton-bern/fischereipatente-preise.html',
    'patentWaters': 'https://www.weu.be.ch/de/start/themen/jagd-fischerei/fischerei/fischen-kanton-bern/patentgewaesser-kanton-bern.html',
    'bkfvWaters': 'https://www.bkfv-fcbp.ch/fischen-im-kanton-bern/patentgewaesser/',
    'pacht': 'https://www.bkfv-fcbp.ch/',
    'inspectorate': 'mailto:info.fi@be.ch',
    'source': 'https://opendata.swiss/de/dataset/angelfischerei',
}

SRC_ZH = {'label': 'Kanton Zürich OGD · Fischereireviere (Datenstand 2010)', 'url': ZH['source'], 'asOf': '2010-05-31'}
SRC_BE_LIST = {'label': 'Kanton Bern · Liste Patentgewässer + swisstopo VECTOR25 Geometrie', 'url': BE['patentWaters'], 'asOf': '2026'}

def a(kind, de, en, url):
    return {'kind': kind, 'label': L(de, en), 'url': url}

ZH_PATENT_ACTIONS = [
    a('buy', 'Patent digital kaufen (eFJ2 App ZH)', 'Buy digital permit (eFJ2 app ZH)', ZH['app']),
    a('buy', 'Tages-/Jahrespatent ZH beziehen', 'Get ZH day/annual permit', ZH['patentPage']),
    a('info', 'Preisliste ZH 2026 (PDF)', 'ZH price list 2026 (PDF)', ZH['prices']),
]
BE_PATENT_ACTIONS = [
    a('buy', 'BE-Patent online bestellen', 'Order BE permit online', BE['buy']),
    a('buy', 'App «Fischen Bern» (digitales Patent)', '"Fischen Bern" app (digital permit)', BE['app']),
    a('info', 'Patente & Preise BE', 'BE permits & prices', BE['prices']),
]

SPECIES = {
    'Zürichsee': L('Felchen, Egli, Hecht, Seeforelle, Zander', 'Whitefish, perch, pike, lake trout, zander'),
    'Greifensee': L('Hecht, Egli, Karpfen, Zander, Wels', 'Pike, perch, carp, zander, catfish'),
    'Pfäffikersee': L('Hecht, Egli, Karpfen, Schleie', 'Pike, perch, carp, tench'),
    'Thunersee': L('Felchen, Seeforelle, Hecht, Egli, Seesaibling', 'Whitefish, lake trout, pike, perch, char'),
    'Brienzersee': L('Felchen, Seeforelle, Seesaibling', 'Whitefish, lake trout, char'),
    'Bielersee': L('Egli, Hecht, Zander, Felchen, Wels', 'Perch, pike, zander, whitefish, catfish'),
    'Wohlensee': L('Hecht, Egli, Karpfen, Brachsmen', 'Pike, perch, carp, bream'),
    'Aare': L('Äsche, Bachforelle, Barbe, Alet', 'Grayling, brown trout, barbel, chub'),
    'Limmat': L('Äsche, Forelle, Barbe, Alet', 'Grayling, trout, barbel, chub'),
    'Rhein': L('Äsche, Forelle, Barbe, Hecht', 'Grayling, trout, barbel, pike'),
    'Emme': L('Bachforelle, Äsche', 'Brown trout, grayling'),
    'Kander': L('Bachforelle, Seeforelle (Laichaufstieg)', 'Brown trout, lake trout (spawning run)'),
    'Simme': L('Bachforelle', 'Brown trout'),
    'Saane': L('Bachforelle, Äsche', 'Brown trout, grayling'),
    'Sense': L('Bachforelle', 'Brown trout'),
    'Birs': L('Bachforelle, Äsche', 'Brown trout, grayling'),
}
SEASON_GENERIC = L(
    'Schonzeiten & Fangmindestmasse gemäss kantonaler Fischereiverordnung — z. B. Forellen meist ab Herbst bis Frühling geschont, Äsche im Frühjahr. Vor Ort und im Reglement prüfen.',
    'Closed seasons & minimum sizes per cantonal fishing ordinance — e.g. trout usually protected autumn to spring, grayling in spring. Check on site and in the regulations.',
)

features = []

def add(geom, props):
    if geom is None or geom.is_empty:
        return
    gj = mapping(geom)
    features.append({'type': 'Feature', 'properties': props, 'geometry': gj})

def to_wgs(geom):
    return gpd.GeoSeries([geom], crs=LV95).to_crs(4326).iloc[0]

# ---------------------------------------------------------------- ZH
still = gpd.read_file(RAW / 'zh_stillgewaesser_f.geojson').to_crs(LV95)
net = gpd.read_file(RAW / 'zh_gewaessernetz_l.geojson').to_crs(LV95)

ZH_LAKES = {1: ('Zürichsee (Zürcher Teil)', 'Lake Zurich (Zurich part)', 'Zürichsee'),
            2: ('Greifensee', 'Lake Greifensee', 'Greifensee'),
            3: ('Pfäffikersee', 'Lake Pfäffikon', 'Pfäffikersee')}
for nr, (de, en, key) in ZH_LAKES.items():
    g = unary_union(still[still.reviernummer == nr].geometry).simplify(15)
    add(to_wgs(g), {
        'id': f'zh-see-{nr}', 'canton': 'ZH', 'waterKind': 'lake', 'permitType': 'patent',
        'name': L(de, en),
        'summary': L(
            'Kantonales Patentgewässer. Seenpatent (Zürich-, Greifen-, Pfäffikersee, Ufer) oder Einzelseepatent; Tagespatent See (Ufer + Boot). Bootsfischerei mit Jahrespatent nur mit Zusatz «Boot».',
            'Cantonal patent water. "Seenpatent" (Zurich/Greifen/Pfäffikon, shore) or single-lake permit; day permit (shore + boat). Boat fishing on annual permit needs the "Boot" add-on.'),
        'priceHint': L('Jahr: Seenpatent CHF 160 · Einzelsee CHF 100 (Erwachsene, 2026)', 'Year: lakes permit CHF 160 · single lake CHF 100 (adults, 2026)'),
        'sana': 'annual', 'dayTicket': 'yes', 'actions': ZH_PATENT_ACTIONS,
        'species': SPECIES[key], 'season': SEASON_GENERIC,
        'notes': L('Schongebiete, Naturschutzzonen und Uferabschnitte mit Fischereiverbot beachten.', 'Observe protected zones, nature reserves and shore sections closed to fishing.'),
        'source': SRC_ZH, 'confidence': 'official', 'search': f'{de} {en} zürich zh see lake patent',
    })

PV_MAP = {'Versteigerung': 'pacht', 'Freihändige Verpachtung': 'pacht', 'Privatrevier': 'private',
          'Schonrevier': 'closed', 'Patentrevier': 'patent', 'Kanton Zug': 'unknown', '': 'unknown', None: 'unknown'}

def zh_props(nr, row, kind):
    pv = row.get('pachtverfahren') or ''
    ptype = PV_MAP.get(pv, 'unknown')
    name = (row.get('fischrevier') or '').strip() or (row.get('gewaessername') or '').strip() or f'Revier {nr}'
    if ptype == 'closed' and name.lower().startswith('schon'):
        gn = (row.get('gewaessername') or '').strip()
        name = f'Schongebiet {gn}'.strip() if gn else f'Schonrevier {nr}'
    cond = (row.get('bemerk_beding') or '').strip()
    tk = row.get('tageskarten_max') or ''
    day = 'yes' if tk == 'Ja' else 'no' if tk == 'Nein' else 'unknown'
    datasheet = ZH['datasheet'].format(nr=nr)
    p = {'id': f'zh-r{nr}', 'canton': 'ZH', 'waterKind': kind, 'permitType': ptype,
         'name': L(name), 'revier': str(nr), 'source': SRC_ZH, 'confidence': 'official', 'dayTicket': day}
    if cond:
        p['conditions'] = L(cond)
    if ptype == 'patent':
        p.update(summary=L('Kantonales Patentrevier (Flusspatent ZH: Rhein 32 + Limmat 358). Tagespatent Fluss erhältlich.',
                           'Cantonal patent reach (ZH river permit: Rhine 32 + Limmat 358). Day permit available.'),
                 priceHint=L('Jahr: Flusspatent CHF 170 (Erwachsene, 2026)', 'Year: river permit CHF 170 (adults, 2026)'),
                 sana='annual', dayTicket='yes', actions=ZH_PATENT_ACTIONS)
    elif ptype == 'pacht':
        p.update(summary=L('Pachtrevier: Das Fischereirecht ist an eine Pachtgesellschaft vergeben. Kein Kantonspatent — Fischereikarte (Jahres-/Tageskarte) nur über die Pächter.',
                           'Leased reach (Pacht): fishing rights belong to a lessee group. No cantonal patent — cards (annual/day) only via the lessees.'), sana='ask', actions=[
                     a('enquire', 'Pächter-Kontakt im Revierverzeichnis (PDF)', 'Lessee contact in revier directory (PDF)', ZH['verzeichnis']),
                     a('info', f'Datenblatt Revier {nr} (PDF)', f'Revier {nr} data sheet (PDF)', datasheet),
                 ])
        if day == 'yes':
            p['notes'] = L('Laut kantonalem Datensatz werden hier Tageskarten abgegeben — beim Pächter anfragen.', 'Per cantonal dataset, day cards are issued here — ask the lessee.')
        elif day == 'no':
            p['notes'] = L('Laut kantonalem Datensatz keine Tageskarten — meist nur Jahreskarten für Mitglieder/Pächter.', 'Per cantonal dataset no day cards — usually annual cards for members/lessees only.')
    elif ptype == 'private':
        p.update(summary=L('Privates Fischereirecht (Privatrevier). Erlaubnis nur durch die Berechtigten.',
                           'Private fishing right. Permission only from the right holders.'), sana='ask',
                 actions=[a('enquire', 'Kanton ZH Fischereiverwaltung anfragen', 'Ask ZH fisheries administration', ZH['reviere']),
                          a('info', f'Datenblatt Revier {nr} (PDF)', f'Revier {nr} data sheet (PDF)', datasheet)])
    elif ptype == 'closed':
        p.update(summary=L('Schonrevier — Fischerei nicht erlaubt (ganz oder saisonal). Es gibt nichts zu kaufen.',
                           'Protected reach — fishing not permitted (fully or seasonally). Nothing to buy.'), sana='none', dayTicket='no',
                 actions=[a('info', 'Infos Kanton ZH', 'ZH info', ZH['howwhere'])])
    else:
        p.update(summary=L('Zuständigkeit unklar (z. B. Grenzgewässer / anderer Kanton). Bitte nachfragen.',
                           'Responsibility unclear (e.g. border water / other canton). Please enquire.'), sana='ask',
                 actions=[a('enquire', 'Kanton ZH Fischereiverwaltung anfragen', 'Ask ZH fisheries administration', ZH['reviere'])])
    gn = (row.get('gewaessername') or '').strip()
    for k in SPECIES:
        if k == gn or name.startswith(k):
            p['species'] = SPECIES[k]
    if ptype != 'closed':
        p['season'] = SEASON_GENERIC
    p['search'] = f"{name} {gn} {nr} zürich zh"
    return p

# rivers per revier
rivers = net[net.art.isin(['Fliessgewässer', 'Kanal']) & (net.eingedolt_ueber_20m != 'eingedolt') & ~net.reviernummer.isin([1, 2, 3])]
rivers = rivers[rivers.reviernummer.notna()]
for nr, grp in rivers.groupby('reviernummer'):
    nr = int(nr)
    merged = linemerge(unary_union(grp.geometry))
    g = merged.simplify(12)
    if g.length < 150:
        continue
    row = grp.iloc[grp.geometry.length.argmax()].to_dict()
    add(to_wgs(g), zh_props(nr, row, 'river'))

# still waters per revier (>= 0.3 ha)
st = still[~still.reviernummer.isin([1, 2, 3]) & still.reviernummer.notna()].copy()
st = st[st.area >= 3000]
for nr, grp in st.groupby('reviernummer'):
    nr = int(nr)
    g = unary_union(grp.geometry).simplify(5)
    row = grp.iloc[grp.area.argmax()].to_dict()
    add(to_wgs(g), zh_props(nr, row, 'pond'))

# ---------------------------------------------------------------- BE
be_shape = shape(json.load(open(RAW / 'be_kanton.json'))['results'][0]['geometry'])
be = gpd.GeoSeries([be_shape], crs=4326).to_crs(LV95).iloc[0]
lakes = gpd.GeoDataFrame.from_features(json.load(open(RAW / 'ch.bafu.vec25-seen.json')), crs=4326).to_crs(LV95)
riv = gpd.GeoDataFrame.from_features(json.load(open(RAW / 'ch.bafu.vec25-gewaessernetz_2000.json')), crs=4326).to_crs(LV95)

BE_PATENT_LAKES = {  # vec25 name -> (display, en, group)
    'Thuner See': ('Thunersee', 'Lake Thun', 'big'), 'Brienzer See': ('Brienzersee', 'Lake Brienz', 'big'),
    'Bieler See': ('Bielersee (BE-Teil)', 'Lake Biel (BE part)', 'big'),
    'Arnensee': ('Arnensee', 'Lake Arnen', 'mountain'), 'Engstlensee': ('Engstlensee', 'Lake Engstlen', 'mountain'),
    'Gelmersee': ('Gelmersee', 'Lake Gelmer', 'mountain'), 'Mattenalpsee': ('Mattenalpsee', 'Lake Mattenalp', 'mountain'),
    'Oeschinensee': ('Oeschinensee', 'Lake Oeschinen', 'mountain'), 'Räterichsbodensee': ('Räterichsbodensee', 'Lake Räterichsboden', 'mountain'),
    'Stausee Niederried': ('Niederriedsee (Stausee)', 'Niederried reservoir', 'reservoir'), 'Wohlensee': ('Wohlensee (Stausee)', 'Lake Wohlen (reservoir)', 'reservoir'),
}
GROUP_TXT = {
    'big': L('Einer der drei grossen Berner Patentseen.', 'One of the three large Bernese patent lakes.'),
    'mountain': L('Berner Bergsee im Patentgebiet — Saison durch Eis/Schnee begrenzt.', 'Bernese mountain lake under patent — season limited by ice/snow.'),
    'reservoir': L('Berner Stausee im Patentgebiet.', 'Bernese reservoir under patent.'),
}

def be_patent_props(pid, de, en, kind, extra):
    key = de.split(' ')[0]
    p = {'id': pid, 'canton': 'BE', 'waterKind': kind, 'permitType': 'patent', 'name': L(de, en),
         'summary': L('Kantonales Berner Patentgewässer. ' + extra['de'] + ' Tages- und Wochenpatent ohne SaNa; Monats-/Jahrespatent nur mit SaNa.',
                      'Cantonal Bern patent water. ' + extra['en'] + ' Day and week permits without SaNa; month/annual permits require SaNa.'),
         'priceHint': L('Tag CHF 32 · Woche CHF 100 · Jahr CHF 250 + CHF 50 Hegebeitrag (Erwachsene)', 'Day CHF 32 · week CHF 100 · year CHF 250 + CHF 50 levy (adults)'),
         'sana': 'annual', 'dayTicket': 'yes', 'actions': BE_PATENT_ACTIONS, 'season': SEASON_GENERIC,
         'notes': L('Schongebiete nach FiDV und einzelne Pachtstrecken möglich — offizielle BE-Karte (Layer «Offizielle Karte BE») prüfen.',
                    'Protected zones (FiDV) and individual leased stretches possible — check the official BE map (toggle "Official BE map").'),
         'source': SRC_BE_LIST, 'confidence': 'derived', 'search': f'{de} {en} bern be patent'}
    if key in SPECIES:
        p['species'] = SPECIES[key]
    return p

lake_union = []
for _, r in lakes.iterrows():
    nm = (r['name'] or '').strip()
    g = r.geometry.intersection(be)
    if g.is_empty or g.area < 0.2 * r.geometry.area:
        continue
    lake_union.append(r.geometry)
    g = g.simplify(15)
    if nm in BE_PATENT_LAKES:
        de, en, grp = BE_PATENT_LAKES[nm]
        add(to_wgs(g), be_patent_props(f'be-see-{r["gewaesserkennzahl"] or nm}', de, en, 'lake', GROUP_TXT[grp]))
    elif nm:
        border = g.area < 0.9 * r.geometry.area
        add(to_wgs(g), {
            'id': f'be-see-{r["gewaesserkennzahl"] or nm}', 'canton': 'BE', 'waterKind': 'lake',
            'permitType': 'mixed' if border else 'unknown', 'name': L(nm),
            'summary': L('Nicht auf der Berner Patentliste. Kleine Seen im Kanton Bern sind meist Pachtgewässer (Fischereipass/Gastkarte beim Pächter) oder privat.' + (' Grenzgewässer: Teil liegt in einem Nachbarkanton.' if border else ''),
                         'Not on the Bern patent list. Small lakes in Bern are usually leased (pass/guest card from the lessee) or private.' + (' Border water: part lies in a neighbouring canton.' if border else '')),
            'sana': 'ask', 'dayTicket': 'unknown',
            'actions': [a('enquire', 'Fischereiinspektorat BE fragen', 'Ask BE fisheries inspectorate', BE['inspectorate']),
                        a('enquire', 'Pachtvereinigungen (BKFV)', 'Lessee associations (BKFV)', BE['pacht'])],
            'season': SEASON_GENERIC, 'source': {'label': 'swisstopo VECTOR25 · Regime abgeleitet', 'url': BE['source'], 'asOf': '2026'},
            'confidence': 'derived', 'search': f'{nm} bern be see',
        })

lakes_be = unary_union(lake_union).buffer(30)
BE_PATENT_RIVERS = {'Aare', 'Birs', 'Emme', 'Engstligen', 'Ilfis', 'Kander', 'Simme', 'Lütschine', 'Schwarze Lütschine',
                    'Weisse Lütschine', 'Saane', 'Sense', 'Suze'}
DISPLAY = {'Suze': ('Schüss (Suze)', 'Schüss (Suze)')}
for nm, grp in riv.groupby('name'):
    nm = (nm or '').strip()
    if not nm:
        continue
    g = unary_union(grp.geometry).intersection(be).difference(lakes_be)
    if g.is_empty or g.length < 2000:
        continue
    g = linemerge(g)
    parts = list(g.geoms) if hasattr(g, 'geoms') else [g]
    parts = [p_ for p_ in parts if p_.length > 1500]
    if not parts:
        continue
    de, en = DISPLAY.get(nm, (nm, nm))
    if nm in BE_PATENT_RIVERS:
        if nm == 'Aare':
            # split along the river into the reaches the BE list uses
            segs = {}
            for part in parts:
                c = to_wgs(part.centroid)
                if c.y < 46.72 and c.x > 7.8:
                    seg = ('Aare oberhalb Brienzersee', 'Aare above Lake Brienz', 'aare-ob') if c.x > 8.0 else ('Aare Interlaken', 'Aare Interlaken', 'aare-il')
                elif c.y < 47.0 and c.x > 7.4:
                    seg = ('Aare Thun – Bern – Wohlensee', 'Aare Thun – Bern – Wohlen', 'aare-thun-bern')
                elif c.x < 7.45:
                    seg = ('Aare Niederried – Aarberg – Hagneck', 'Aare Niederried – Aarberg – Hagneck', 'aare-aarberg')
                else:
                    seg = ('Aare Büren – Grenze SO/AG (inkl. Stau Bannwil/Wynau)', 'Aare Büren – SO/AG border (incl. Bannwil/Wynau)', 'aare-unten')
                segs.setdefault(seg, []).append(part)
            for seg, ps in segs.items():
                add(to_wgs(unary_union(ps).simplify(30)), be_patent_props(f'be-{seg[2]}', seg[0], seg[1], 'river', L('Patentstrecke der Aare.', 'Aare patent reach.')))
        else:
            g2 = unary_union(parts).simplify(30)
            add(to_wgs(g2), be_patent_props(f'be-fl-{nm.lower().replace(" ", "-")}', de + ' (BE)', en + ' (BE)', 'river',
                                            L('Auf der BE-Liste der Patent-Fliessgewässer (Strecke gemäss offizieller Karte).', 'On the BE list of patent rivers (exact reach per official map).')))
    else:
        g2 = unary_union(parts).simplify(30)
        add(to_wgs(g2), {
            'id': f'be-fl-{nm.lower().replace(" ", "-")}', 'canton': 'BE', 'waterKind': 'river', 'permitType': 'unknown',
            'name': L(de + ' (BE)', en + ' (BE)'),
            'summary': L('Nicht als Berner Patent-Fliessgewässer gelistet — vermutlich Pachtstrecke(n). Fischereipass/Gastkarte bei der Pachtvereinigung.',
                         'Not listed as a Bern patent river — probably leased reach(es). Pass/guest card from the lessee association.'),
            'sana': 'ask', 'dayTicket': 'unknown',
            'actions': [a('enquire', 'Pachtvereinigungen (BKFV)', 'Lessee associations (BKFV)', BE['pacht']),
                        a('enquire', 'Fischereiinspektorat BE fragen', 'Ask BE fisheries inspectorate', BE['inspectorate'])],
            'season': SEASON_GENERIC, 'source': {'label': 'swisstopo Gewässernetz 1:2 Mio · Regime abgeleitet', 'url': BE['source'], 'asOf': '2026'},
            'confidence': 'derived', 'search': f'{nm} bern be fluss river',
        })

# ---------------------------------------------------------------- write
def rnd(c):
    if isinstance(c, (list, tuple)):
        if c and isinstance(c[0], (int, float)):
            return [round(c[0], 5), round(c[1], 5)]
        return [rnd(x) for x in c]
    return c
for f in features:
    f['geometry']['coordinates'] = rnd(f['geometry']['coordinates'])

fc = {'type': 'FeatureCollection',
      'meta': {'generated': pd.Timestamp.now(tz='Europe/Zurich').isoformat(timespec='minutes'),
               'sources': [SRC_ZH, SRC_BE_LIST]},
      'features': features}
OUT.write_text(json.dumps(fc, ensure_ascii=False, separators=(',', ':')))
from collections import Counter
print(len(features), 'features', len({f['properties']['id'] for f in features}), 'ids', OUT.stat().st_size // 1024, 'KB')
print(Counter((f['properties']['canton'], f['properties']['permitType']) for f in features))
