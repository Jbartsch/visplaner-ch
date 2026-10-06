"""Build all-Switzerland fishing data for Petripass (repo visplaner-ch).

Inputs (data-raw/, gitignored – see scripts/fetch_*.sh / fetch_ch.py and .github/workflows/fetch-geodata.yml):
  ch/            swisstopo canton polygons, VECTOR25 lakes, Gewässernetz 1:2 Mio
  zh_*.geojson   Kanton ZH OGD Fischereireviere
  be_official/   Kanton BE ANGFISCH (fetched in GitHub Actions; be.ch blocked from dev box)
  cantons/       SO, SH, VS, LU, TG, SZ official layers

Outputs:
  public/data/overview.geojson        simplified lakes + major rivers, all cantons (always loaded)
  public/data/cantons/XX.geojson      per-canton detail geometry (lazy-loaded at zoom >= 9)
  public/data/waters-index.json       compact attributes of every water (search, info panel)
  src/data/generated/{cantons,border,waters}.json   same data for SSR landing pages
  docs/COVERAGE.md                    coverage matrix (generated)

Quality tiers per water: official (regime from official cantonal geodata), derived (cantonal rule applied
to official/swisstopo geometry), stub (regime not determined).
"""
import json, re, sys, unicodedata
from collections import Counter, defaultdict
from pathlib import Path

import geopandas as gpd
import pandas as pd
from shapely.geometry import shape, mapping, box
from shapely.ops import linemerge as _lm, unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent / 'lib'))
from cantons_cfg import CANTONS, ORDER, BORDER, RIVER_BORDER, T  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / 'data-raw'
PUB = ROOT / 'public' / 'data'
GEN = ROOT / 'src' / 'data' / 'generated'
LV95 = 2056
(PUB / 'cantons').mkdir(parents=True, exist_ok=True)
GEN.mkdir(parents=True, exist_ok=True)
ASOF = pd.Timestamp.now(tz='Europe/Zurich').strftime('%Y-%m-%d')

def sv(v):
    if v is None or (isinstance(v, float) and v != v):
        return ''
    return str(v).strip()

def lm(g):
    return _lm(g) if g.geom_type == 'MultiLineString' else g

def slugify(s):
    s = s.replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue').replace('Ä', 'ae').replace('Ö', 'oe').replace('Ü', 'ue')
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:70] or 'gewaesser'

def lake_display(nm):
    return re.sub(r'(\w+er) See$', lambda m: m.group(1) + 'see', nm)

# ---------------------------------------------------------------- base geometry
def feats(path):
    return gpd.GeoDataFrame.from_features(json.load(open(path)), crs=4326).to_crs(LV95)

kant = feats(RAW / 'ch' / 'ch.swisstopo.swissboundaries3d-kanton-flaeche.fill.json')
print('canton cols', [c for c in kant.columns if c != 'geometry'])
abbr_col = next(c for c in ['ak', 'kanton', 'abbr', 'label'] if c in kant.columns)
KANT = {}
for _, r in kant.iterrows():
    code = str(r[abbr_col]).strip().upper()
    if code not in CANTONS:
        # map names to codes if needed
        continue
    KANT[code] = r.geometry if code not in KANT else KANT[code].union(r.geometry)
missing = set(ORDER) - set(KANT)
assert not missing, f'missing canton polygons {missing}; columns: {kant.columns.tolist()} sample {kant.iloc[0].to_dict()}'
KANT = {k: v.buffer(0) for k, v in KANT.items()}

lakes = feats(RAW / 'ch' / 'ch.bafu.vec25-seen.json')
riv = feats(RAW / 'ch' / 'ch.bafu.vec25-gewaessernetz_2000.json')
riv = riv[(riv.objectval != 'Seeachse') & riv['name'].notna() & (riv['name'].str.strip() != '')]
LAKES_ALL = unary_union(lakes.geometry.values).buffer(40)

# ---------------------------------------------------------------- collectors
WATERS = []          # compact attribute entries
GEOMS = defaultdict(list)   # canton -> list of (id, geom LV95, props-min)
SLUGS = set()

def new_slug(base):
    s, i = base, 2
    while s in SLUGS:
        s = f'{base}-{i}'; i += 1
    SLUGS.add(s)
    return s

def add_water(canton, name, kind, rule, q, geom, src, ptype=None, x=None, idhint=None, names=None):
    if geom is None or geom.is_empty:
        return None
    cfg = CANTONS[canton]
    rl = cfg['rules'].get(rule)
    if rl is None:
        raise KeyError(f'{canton}: rule {rule}')
    p = ptype or rl['permitType']
    if p == 'unknown':
        q = 'stub'
    slug = new_slug(f"{slugify(re.sub(r'\s*\([A-Z]{2}\)$', '', name))}-{canton.lower()}")
    wid = slug
    n = {'de': name}
    if names:
        n.update({k: v for k, v in names.items() if v and v != name})
    e = {'id': wid, 'slug': slug, 'n': n, 'c': canton, 'k': kind, 'p': p, 'q': q, 'r': rule, 's': src}
    if x:
        e['x'] = {k: v for k, v in x.items() if v}
    WATERS.append(e)
    GEOMS[canton].append((wid, geom, {'id': wid, 'c': canton, 'p': p, 'q': q, 'k': kind}))
    return e

def L1(de, fr=None):
    d = {'de': de}
    if fr:
        d['fr'] = fr
    return d

# ---------------------------------------------------------------- ZH (official)
SRC = {}
def src(key, label, url):
    SRC[key] = {'label': label, 'url': url}
    return key

S_ZH = src('zh', 'Kanton Zürich OGD · Fischereireviere', CANTONS['ZH']['sources'][0]['url'])
still = gpd.read_file(RAW / 'zh_stillgewaesser_f.geojson').to_crs(LV95)
net = gpd.read_file(RAW / 'zh_gewaessernetz_l.geojson').to_crs(LV95)
ZH_LAKES = {1: ('Zürichsee', 'zuerichsee'), 2: ('Greifensee', None), 3: ('Pfäffikersee', None)}
for nr, (de, border) in ZH_LAKES.items():
    g = unary_union(still[still.reviernummer == nr].geometry)
    names = BORDER['Zürichsee']['name'] if border else None
    add_water('ZH', de + (' (ZH)' if border else ''), 'lake', 'see', 'official', g, S_ZH,
              x={'border': border, 'revier': str(nr)}, names={k: v + ' (ZH)' for k, v in names.items()} if names else None)

PV_MAP = {'Versteigerung': 'pacht', 'Freihändige Verpachtung': 'pacht', 'Privatrevier': 'private',
          'Schonrevier': 'closed', 'Patentrevier': 'patent'}
ZH_DS = 'https://maps.zh.ch/system/docs/aln_fjv/fischereireviere/Fischereidatenblatt_{nr}.pdf'

def zh_add(nr, row, kind, g):
    pv = row.get('pachtverfahren') or ''
    rule = PV_MAP.get(pv, 'unknown')
    name = sv(row.get('fischrevier')) or sv(row.get('gewaessername')) or f'Revier {nr}'
    if rule == 'closed' and name.lower().startswith('schon'):
        gn = sv(row.get('gewaessername'))
        name = f'Schongebiet {gn}'.strip() if gn else f'Schonrevier {nr}'
    tk = row.get('tageskarten_max') or ''
    x = {'revier': str(nr), 'dayTicket': 'yes' if tk == 'Ja' else 'no' if tk == 'Nein' else None,
         'conditions': L1(sv(row.get('bemerk_beding'))) if sv(row.get('bemerk_beding')) else None,
         'links': [{'kind': 'info', 'label': T(f'Datenblatt Revier {nr} (PDF)', f'Revier {nr} data sheet (PDF)', f'Fiche du lot {nr} (PDF)', f'Scheda riserva {nr} (PDF)'), 'url': ZH_DS.format(nr=nr)}]}
    if sv(row.get('gewaessername')) == 'Rhein':
        x['border'] = 'hochrhein'
    add_water('ZH', f'{name} (Revier {nr})' if not name.endswith(str(nr)) else name, kind, rule, 'official', g, S_ZH, x=x)

rv = net[net.art.isin(['Fliessgewässer', 'Kanal']) & (net.eingedolt_ueber_20m != 'eingedolt') & ~net.reviernummer.isin([1, 2, 3])]
rv = rv[rv.reviernummer.notna()]
for nr, grp in rv.groupby('reviernummer'):
    g = lm(unary_union(grp.geometry))
    if g.length < 150:
        continue
    zh_add(int(nr), grp.iloc[grp.geometry.length.argmax()].to_dict(), 'river', g)
st = still[~still.reviernummer.isin([1, 2, 3]) & still.reviernummer.notna()]
st = st[st.area >= 3000]
for nr, grp in st.groupby('reviernummer'):
    zh_add(int(nr), grp.iloc[grp.area.argmax()].to_dict(), 'pond', unary_union(grp.geometry))

# ---------------------------------------------------------------- BE (official ANGFISCH)
BED = RAW / 'be_official'
S_BE = src('be', 'Kanton Bern · ANGFISCH (OGD)', CANTONS['BE']['sources'][0]['url'])
be_ok = (BED / 'angfisch_patflgew.parquet').exists()
if be_ok:
    def rp(n):
        g = gpd.read_parquet(BED / f'angfisch_{n}.parquet')
        return g.drop(columns=[c for c in ['bbox'] if c in g.columns]).to_crs(LV95)
    pdfl = lambda de, en, fr, it, url: [{'kind': 'info', 'label': T(de, en, fr, it), 'url': url}] if url else None
    for _, r in rp('patstgew').iterrows():
        nm, nf = r['patstnt_name_de'], r['patstnt_name_fr']
        border = BORDER.get('Bieler See')['key'] if 'Biel' in nm else None
        add_water('BE', nm, 'lake', 'patent', 'official', r.geometry, S_BE, names={'fr': nf},
                  x={'border': border, 'notes': L1(r['patstypt_typ_de'], r['patstypt_typ_fr']),
                     'links': pdfl('Patentgewässer-Blatt (PDF)', 'Patent water sheet (PDF)', 'Fiche eaux à permis (PDF)', 'Scheda (PDF)', sv(r['url_de']))})
    for _, r in rp('patflgew').iterrows():
        nm, nf = r['patflnt_name_de'], r['patflnt_name_fr']
        d = sv(r['patflbt_beschr_de'])
        add_water('BE', nm, 'river', 'patent', 'official', lm(r.geometry), S_BE, names={'fr': nf},
                  x={'notes': L1(d, sv(r['patflbt_beschr_fr'])) if d and d != '-' else None,
                     'links': pdfl('Patentstrecke-Blatt (PDF)', 'Patent reach sheet (PDF)', 'Fiche du tronçon (PDF)', 'Scheda (PDF)', sv(r['url_de']))})
    for lay, kind in [('pachtflg', 'river'), ('pachtstg', 'pond')]:
        for _, r in rp(lay).iterrows():
            add_water('BE', f"{r['pacht_name']} (Pacht {r['pacht_code']})", kind, 'pacht', 'official', lm(r.geometry) if kind == 'river' else r.geometry, S_BE,
                      x={'revier': str(r['pacht_code']), 'links': pdfl('Pachtblatt mit Pächter (PDF)', 'Lease sheet with lessee (PDF)', 'Fiche du lot affermé (PDF)', 'Scheda affitto (PDF)', sv(r['url']))})
    for _, r in rp('schongeb').iterrows():
        d = sv(r['schonbt_beschr_de'])
        add_water('BE', f"Schongebiet {r['schonnt_name_de']}", 'reach', 'closed', 'official', r.geometry, S_BE, names={'fr': f"Zone protégée {r['schonnt_name_fr']}"},
                  x={'notes': L1(d, sv(r['schonbt_beschr_fr'])) if d else None,
                     'links': pdfl('Schongebiet-Blatt (PDF)', 'Protected area sheet (PDF)', 'Fiche zone protégée (PDF)', 'Scheda (PDF)', sv(r['url']))})
else:
    print('WARN: BE official data missing – BE falls back to generic derived layer')

# ---------------------------------------------------------------- SO (official)
CD = RAW / 'cantons'
S_SO = src('so', 'Kanton Solothurn · Fischereireviere (OGD)', CANTONS['SO']['sources'][0]['url'])
so = gpd.read_file(CD / 'so' / 'ch.so.awjf.gewaesser.fischerei.gpkg', layer='fischrevier').to_crs(LV95)
SO_MAP = {'Pacht': 'pacht', 'Patent': 'patent', 'Schon': 'closed', 'Privat': 'private'}
for _, r in so.iterrows():
    rule = SO_MAP.get(r['fischerei'], 'unknown')
    nm = sv(r['aname']) or f"Revier {r['revierid']}"
    d = sv(r['beschreibung'])
    x = {'revier': str(r['revierid']), 'notes': L1(d) if d and d != nm else None}
    if 'Aare' in nm or 'Rhein' in nm:
        pass
    add_water('SO', f"{nm} ({r['revierid']})", 'river', rule, 'official', lm(r.geometry), S_SO, x=x)

# ---------------------------------------------------------------- VS (official)
S_VS = src('vs', 'Canton du Valais · Carte piscicole SCPF', CANTONS['VS']['sources'][0]['url'])
vsr = feats(CD / 'vs_reseau.json')
VS_R = {0: ('patent', None), 1: ('patent', None), 2: ('patent', None), 3: ('closed', None), 4: ('patent', 'canal'),
        5: ('patent', None), 7: ('patent', 'part'), 8: ('patent', 'part'), 9: ('patent', 'part'), 10: ('closed', 'tmp')}
VS_NOTE = {
    'canal': T('Kanal – Kanalpatent bzw. Patentbestimmungen VS beachten.', 'Canal – VS canal permit rules apply.', 'Canal – permis canaux VS.', 'Canale – patente canali VS.'),
    'part': T('Teilreservat: Abschnitte mit Fischereiverbot – amtliche Karte prüfen.', 'Partial reserve: sections closed to fishing – check the official map.', 'Réserve partielle : secteurs interdits – consulter la carte officielle.', 'Riserva parziale: tratti vietati – consultare la carta ufficiale.'),
    'tmp': T('Provisorisch für die Fischerei gesperrt.', 'Temporarily closed to fishing.', 'Provisoirement interdit à la pêche.', 'Temporaneamente vietato alla pesca.'),
}
for _, r in vsr.iterrows():
    rule, note = VS_R.get(int(r['COULEUR'] or 0), ('unknown', None))
    nm = sv(r['NOM']) or f"Cours d'eau {r['NUMERO']}"
    cond = L1(sv(r['TEXT_DE']), sv(r['TEXT_FR']) or None) if sv(r.get('TEXT_DE')) else None
    border = 'leman' if 'Léman' in nm else None
    add_water('VS', nm, 'canal' if note == 'canal' else 'river', rule, 'official', lm(r.geometry), S_VS,
              x={'notes': VS_NOTE.get(note), 'conditions': cond, 'revier': str(r['NUMERO']), 'border': border})
vsl = feats(CD / 'vs_lac.json')
VS_L = {0: ('patent', None), 8: ('closed', None), 9: ('patent', None), 10: ('patent', None), 7: ('patent', 'part'), 11: ('pacht', None)}
for _, r in vsl.iterrows():
    rule, note = VS_L.get(int(r['TYPE'] or 0), ('unknown', None))
    nm = sv(r['NOM']) or f"Lac {r['NO_CARTE']}"
    cond = L1(sv(r['TEXT_DE']), sv(r['TEXT_FR']) or None) if sv(r.get('TEXT_DE')) else None
    add_water('VS', nm, 'pond' if int(r['TYPE'] or 0) == 10 else 'lake', rule, 'official', r.geometry, S_VS,
              x={'notes': VS_NOTE.get(note), 'conditions': cond, 'border': 'leman' if 'Léman' in nm else None})

# ---------------------------------------------------------------- LU (official geometry, derived regime)
S_LU = src('lu', 'Kanton Luzern OGD · Fischereireviere (Regime abgeleitet)', CANTONS['LU']['sources'][0]['url'])
lul = feats(CD / 'lu_lin.json')
LU_REV = []
for nm, grp in lul.groupby('FR_NAME'):
    g = lm(unary_union(grp.geometry))
    LU_REV.append(g)
    add_water('LU', f'{nm}', 'river', 'river', 'derived', g, S_LU, x={'revier': str(grp.iloc[0]['FR_ID'])})
luf = feats(CD / 'lu_fl.json')
names_by_id = dict(zip(lul.FR_ID, lul.FR_NAME))
for _, r in luf.iterrows():
    add_water('LU', f"{names_by_id.get(r['FR_ID'], 'Revier')} (Fläche {r['FR_ID']})", 'pond', 'river', 'derived', r.geometry, S_LU, x={'revier': str(r['FR_ID'])})
LU_REV_U = unary_union(LU_REV).buffer(80) if LU_REV else None

# ---------------------------------------------------------------- SZ (official geometry, canton-wide patent rule)
S_SZ = src('sz', 'Kanton Schwyz · Fischgewässer (WFS) + Patentregel', 'https://map.geo.sz.ch')
sz = gpd.read_file(CD / 'sz_fg.gml')
sz = sz.set_crs(LV95, allow_override=True)
sz = sz[sz.name_fliessgewaesser.notna() & ~sz.name_fliessgewaesser.str.contains('- - -')]
for nm, grp in sz.groupby('name_fliessgewaesser'):
    g = lm(unary_union(grp.geometry))
    if g.length < 300:
        continue
    pot = (grp.eignung_fischgewaesser == 'potentiell geeignet').all()
    add_water('SZ', nm.strip(), 'river', 'river', 'derived', g, S_SZ,
              x={'notes': T('Laut Kanton nur «potenziell geeignetes» Fischgewässer.', 'Per canton only a "potentially suitable" fish water.', 'Selon le canton, eaux « potentiellement favorables ».', 'Secondo il Cantone acqua «potenzialmente idonea».') if pot else None})

# ---------------------------------------------------------------- SH (official geometry, regime unknown)
S_SH = src('sh', 'Kanton Schaffhausen OGD · Fischereireviere', 'https://data.geo.sh.ch/ogd/fischereireviere.zip')
shf = next((CD / 'sh').rglob('*.gpkg'))
sh = gpd.read_file(shf).to_crs(LV95)
for _, r in sh.iterrows():
    nm = sv(r['name'])
    rule = 'closed' if 'verbot' in nm.lower() else 'unknown'
    add_water('SH', nm, 'reach', rule, 'official' if rule == 'closed' else 'stub', r.geometry, S_SH, x={'border': 'hochrhein'})
SH_REV_U = unary_union(sh.geometry.values).buffer(50)

# ---------------------------------------------------------------- TG official polygons
S_TG = src('tg', 'Kanton Thurgau · Freiangelrecht/Fischenzen/Schongebiete (WFS)', CANTONS['TG']['sources'][0]['url'])
for fn, rule in [('tg_freiangelrecht.json', 'freiangel'), ('tg_schongebiete.json', 'closed'), ('tg_fischenzen.json', 'private')]:
    g = feats(CD / fn)
    for i, r in g.iterrows():
        nm = sv(r.get('gewaessername')) or sv(r.get('name')) or sv(r.get('bezeichnung'))
        label = {'freiangel': 'Freiangelrecht', 'closed': 'Schongebiet', 'private': 'Fischenz (privat)'}[rule]
        d = sv(r.get('beschreibung')) if rule != 'private' else ''
        add_water('TG', f'{label} {nm}'.strip() if nm else f'{label} {i + 1}', 'reach', rule, 'official', r.geometry, S_TG,
                  x={'notes': L1(d) if d else None})

# ---------------------------------------------------------------- generic lakes / rivers (all cantons)
S_GEN = src('gen', 'swisstopo/BAFU Geometrie · Regime aus kantonaler Regel abgeleitet', 'https://api3.geo.admin.ch')
SKIP_LAKES = {'ZH'} | ({'BE'} if be_ok else set())
SKIP_RIVERS = {'ZH', 'SO', 'VS', 'SZ'} | ({'BE'} if be_ok else set())
VS_LAKE_NAMES = {sv(n) for n in vsl['NOM']}
VS_LAKES_U = unary_union(vsl.geometry.values).buffer(0)

for _, r in lakes.iterrows():
    nm = sv(r['name'])
    if not nm:
        continue
    parts = {}
    for cc, poly in KANT.items():
        if not r.geometry.intersects(poly):
            continue
        g = r.geometry.intersection(poly)
        if g.area < 20000 or g.area < 0.01 * r.geometry.area:
            continue
        parts[cc] = g
    if not parts:
        continue
    bd = BORDER.get(nm)
    multi = len(parts) > 1 or (bd and bd['countries'])
    disp = lake_display(nm)
    for cc, g in parts.items():
        if cc in SKIP_LAKES:
            continue
        if cc == 'VS' and (nm in VS_LAKE_NAMES or g.intersection(VS_LAKES_U).area > 0.5 * g.area):
            continue
        cfg = CANTONS[cc]
        rule = cfg['lakeOverrides'].get(nm) or cfg['lakeOverrides'].get(disp) or 'lake'
        nmap = bd['name'] if bd else None
        name = (nmap['de'] if nmap else disp) + (f' ({cc})' if multi else '')
        names = {k: v + (f' ({cc})' if multi else '') for k, v in nmap.items()} if nmap else None
        if bd and rule == 'lake' and cfg['rules']['lake']['permitType'] in ('patent',):
            rule = 'lake'
        add_water(cc, name, 'lake', rule, 'derived', g, S_GEN, names=names,
                  x={'border': bd['key'] if bd else ('multi' if multi else None)})

# rivers: swisstopo VECTOR25 network (scripts/fetch_vec25.py) grouped per canton + water id; 1:2 Mio as fallback
V25 = RAW / 'ch' / 'vec25_rivers.json'
if V25.exists():
    v = gpd.read_file(V25).to_crs(LV95)
    v = v[v.objectval.isin(['Fluss', 'Bach', 'Fluss_U', 'Bach_U']) | v.objectval.isna()]
    pts = gpd.GeoDataFrame(geometry=v.geometry.interpolate(0.5, normalized=True), crs=LV95)
    kg = gpd.GeoDataFrame({'cc': list(KANT)}, geometry=list(KANT.values()), crs=LV95)
    j = gpd.sjoin(pts, kg, predicate='within', how='left')
    v = v.assign(cc=j.groupby(level=0).cc.first())
    v = v[v.cc.notna() & ~v.cc.isin(list(SKIP_RIVERS))]
    v['gk'] = v.gewissnr.fillna(-1).astype(int).astype(str) + '|' + v['name']
    big = set(v[v.objectval.str.startswith('Fluss', na=False)].gk)
    river_src = []
    for (cc, gk), grp in v.groupby(['cc', 'gk']):
        nm = gk.split('|', 1)[1]
        g = unary_union(grp.geometry.values)
        if cc == 'LU' and LU_REV_U is not None:
            g = g.difference(LU_REV_U)
        if cc == 'SH':
            g = g.difference(SH_REV_U)
        g = g.difference(LAKES_ALL)
        if g.is_empty:
            continue
        L = g.length
        if L < (1500 if gk in big else 3000):
            continue
        river_src.append((cc, nm, lm(g)))
    print('vec25 rivers', len(river_src))
else:
    print('WARN: vec25_rivers.json missing – using Gewässernetz 1:2 Mio')
    river_src = []
    for nm, grp in riv.groupby('name'):
        nm = nm.strip()
        full = unary_union(grp.geometry.values)
        for cc, poly in KANT.items():
            if cc in SKIP_RIVERS or not full.intersects(poly):
                continue
            g = full.intersection(poly).difference(LAKES_ALL)
            if cc == 'LU' and LU_REV_U is not None:
                g = g.difference(LU_REV_U)
            if cc == 'SH':
                g = g.difference(SH_REV_U)
            if g.is_empty or g.length < 2500:
                continue
            river_src.append((cc, nm, lm(g)))

for cc, nm, g in river_src:
    cfg = CANTONS[cc]
    rule = cfg['riverOverrides'].get(nm, 'river_free' if cc == 'LU' else 'river')
    border = RIVER_BORDER.get((nm, cc)) or ('hochrhein' if nm == 'Rhein' and cc in ('SH', 'ZH', 'AG', 'BL', 'BS', 'TG') else None)
    add_water(cc, f'{nm} ({cc})', 'river', rule, 'derived', g, S_GEN, x={'border': border})

# ---------------------------------------------------------------- write geometry
def to_wgs_many(items):
    s = gpd.GeoSeries([g for _, g, _ in items], crs=LV95).to_crs(4326)
    return list(s)

def rnd(c, nd=5):
    if isinstance(c, (list, tuple)):
        if c and isinstance(c[0], (int, float)):
            return [round(c[0], nd), round(c[1], nd)]
        return [rnd(x, nd) for x in c]
    return c

def simp(g, kind, tol_line, tol_poly):
    if g.geom_type in ('Polygon', 'MultiPolygon'):
        return g.simplify(tol_poly, preserve_topology=True)
    return g.simplify(tol_line)

BBOX = {}
overview = []
sizes = {}
for cc in ORDER:
    items = GEOMS.get(cc, [])
    fc = []
    if items:
        simp_items = [(wid, simp(g, p['k'], 12, 8), p) for wid, g, p in items]
        wgs = to_wgs_many(simp_items)
        for (wid, g, p), gw in zip(simp_items, wgs):
            if gw.is_empty:
                continue
            BBOX[wid] = [round(v, 5) for v in gw.bounds]
            fc.append({'type': 'Feature', 'properties': p, 'geometry': {'type': mapping(gw)['type'], 'coordinates': rnd(mapping(gw)['coordinates'])}})
        # overview: big lakes + long rivers
        ov = []
        for wid, g, p in items:
            if g.geom_type in ('Polygon', 'MultiPolygon') and g.area > 800_000 and p['k'] == 'lake':
                ov.append((wid, g.simplify(120, preserve_topology=True), p))
            elif g.geom_type in ('LineString', 'MultiLineString') and g.length > 20_000 and p['k'] in ('river', 'canal'):
                ov.append((wid, g.simplify(350), p))
        if ov:
            for (wid, g, p), gw in zip(ov, to_wgs_many(ov)):
                if not gw.is_empty:
                    overview.append({'type': 'Feature', 'properties': p, 'geometry': {'type': mapping(gw)['type'], 'coordinates': rnd(mapping(gw)['coordinates'], 4)}})
    out = PUB / 'cantons' / f'{cc}.geojson'
    out.write_text(json.dumps({'type': 'FeatureCollection', 'features': fc}, separators=(',', ':')))
    sizes[cc] = out.stat().st_size
(PUB / 'overview.geojson').write_text(json.dumps({'type': 'FeatureCollection', 'features': overview}, separators=(',', ':')))

# drop waters whose geometry vanished
WATERS = [w for w in WATERS if w['id'] in BBOX]
for w in WATERS:
    w['b'] = BBOX[w['id']]

# ---------------------------------------------------------------- canton summaries / coverage
kb = gpd.GeoSeries(list(KANT.values()), index=list(KANT.keys()), crs=LV95).to_crs(4326)
OFFICIAL_REGIME = {'ZH', 'SO', 'VS'} | ({'BE'} if be_ok else set())
cantons_out = {}
for cc in ORDER:
    cfg = CANTONS[cc]
    ws = [w for w in WATERS if w['c'] == cc]
    qc = Counter(w['q'] for w in ws)
    pc = Counter(w['p'] for w in ws)
    n = len(ws)
    if cc in OFFICIAL_REGIME and qc['official'] >= 0.5 * n:
        tier = 'official'
    elif n < 3 or qc['stub'] > 0.5 * n:
        tier = 'stub'
    else:
        tier = 'derived'
    geom_src = [s for s in cfg['sources'] if 'geometry' in s['kind']]
    gs = geom_src[0]['label'] if geom_src else 'swisstopo VECTOR25 + Gewässernetz 1:2 Mio'
    if cc in ('LU', 'SH') or (cc in ('TG',)):
        gs += ' + swisstopo'
    rules_src = 'amtlicher Datensatz (Regime pro Gewässer)' if cc in OFFICIAL_REGIME else ('amtl. Datensatz (Teil) + Kantonsregel' if cc == 'TG' else 'Kantonsregel (offizielle Kantonsseite) → abgeleitet')
    buy = [l for l in cfg['links'] if l['kind'] in ('buy', 'app')]
    cantons_out[cc] = {
        'code': cc, 'slug': cfg['slug'], 'name': cfg['name'], 'lang': cfg['lang'], 'system': cfg['system'],
        'links': cfg['links'], 'rules': cfg['rules'], 'notes': cfg['notes'], 'overlay': cfg['overlay'],
        'sources': cfg['sources'] + ([] if cc in OFFICIAL_REGIME else [{'label': 'swisstopo/BAFU VECTOR25 + Gewässernetz 1:2 Mio', 'url': 'https://api3.geo.admin.ch', 'kind': 'geometry', 'official': True}]),
        'quality': tier, 'count': n, 'byQuality': dict(qc), 'byPermit': dict(pc),
        'bbox': [round(v, 4) for v in kb[cc].bounds], 'geomBytes': sizes.get(cc, 0),
        'coverage': {'geometry': gs, 'rules': rules_src,
                     'buy': ('offizieller Shop/App' if buy else 'nur Info-/Kontaktseite') + ('' if all(l['verified'] for l in cfg['links']) else ' (teils nicht vom Build-Rechner geprüft)')},
    }

# simplified canton shapes for the coverage choropleth
cs = gpd.GeoSeries([KANT[c].simplify(250, preserve_topology=True) for c in ORDER], index=ORDER, crs=LV95).to_crs(4326)
(PUB / 'cantons-shape.geojson').write_text(json.dumps({'type': 'FeatureCollection', 'features': [
    {'type': 'Feature', 'properties': {'c': c, 'q': cantons_out[c]['quality']}, 'geometry': {'type': mapping(cs[c])['type'], 'coordinates': rnd(mapping(cs[c])['coordinates'], 4)}}
    for c in ORDER]}, separators=(',', ':')))
border_out = {v['key']: v for k, v in BORDER.items()}
meta = {'generated': ASOF, 'sources': SRC}
(GEN / 'cantons.json').write_text(json.dumps({'meta': meta, 'order': ORDER, 'cantons': cantons_out}, ensure_ascii=False, separators=(',', ':')))
(GEN / 'border.json').write_text(json.dumps(border_out, ensure_ascii=False, separators=(',', ':')))
for fn in ('cantons.json', 'border.json'):
    (PUB / fn).write_text((GEN / fn).read_text())
(GEN / 'waters.json').write_text(json.dumps(WATERS, ensure_ascii=False, separators=(',', ':')))
(PUB / 'waters-index.json').write_text(json.dumps({'meta': meta, 'waters': WATERS}, ensure_ascii=False, separators=(',', ':')))
old = PUB / 'waters.geojson'
if old.exists():
    old.unlink()

# ---------------------------------------------------------------- COVERAGE.md
tiers = Counter(c['quality'] for c in cantons_out.values())
lines = ['# Coverage matrix – Petripass (repo visplaner-ch)', '',
         f'_Generated by `scripts/build_all.py` on {ASOF}. Do not edit by hand._', '',
         '**Quality tiers.** Canton level: **official** means the permit regime comes per water from an official cantonal geodataset. '
         '**derived** means the regime is inferred from the canton\'s published rules and applied to official or swisstopo geometry. '
         '**stub** means the regime is mostly undetermined or almost no waters are mapped. '
         'Each water carries its own badge (official / derived / stub).', '',
         f"**Summary:** official {tiers['official']} · derived {tiers['derived']} · stub {tiers['stub']} · total waters {len(WATERS)}", '',
         '| Canton | Waters | official / derived / stub | Geometry source | Permit-rules source | Buy-link source | Quality | Notes / blockers |',
         '|---|---:|---|---|---|---|---|---|']
for cc in ORDER:
    c = cantons_out[cc]
    q = c['byQuality']
    note = (c['notes'] or {}).get('de', '') if c['notes'] else ''
    unver = [l['url'] for l in c['links'] if not l['verified']]
    if unver:
        note = (note + ' ' if note else '') + 'Nicht vom Build-Rechner erreichbar: ' + ', '.join(unver)
    lines.append(f"| {cc} {c['name']['de']} | {c['count']} | {q.get('official', 0)} / {q.get('derived', 0)} / {q.get('stub', 0)} | {c['coverage']['geometry']} | {c['coverage']['rules']} | {c['coverage']['buy']} | **{c['quality']}** | {note} |")
lines += ['', '## Border / intercantonal waters', '', '| Water | Cantons | Countries | Authority | Permit hint |', '|---|---|---|---|---|']
for b in border_out.values():
    lines.append(f"| {b['name']['de']} | {', '.join(b['cantons'])} | {', '.join(b['countries']) or '–'} | {b['authority']['de']} | {b['hint']['de']} |")
(ROOT / 'docs' / 'COVERAGE.md').write_text('\n'.join(lines) + '\n')

print(len(WATERS), 'waters;', 'overview', (PUB / 'overview.geojson').stat().st_size // 1024, 'KB; index', (PUB / 'waters-index.json').stat().st_size // 1024, 'KB')
print('tiers', dict(tiers))
for cc in ORDER:
    c = cantons_out[cc]
    print(cc, c['quality'], c['count'], c['byQuality'], c['byPermit'], c['geomBytes'] // 1024, 'KB')
