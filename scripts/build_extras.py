"""Build Petripass extras: rules/prices, no-fishing zone overlay, nearest OSM parking per water.

Inputs:
  scripts/lib/rules_cfg.py                      hand-curated sourced prices + rules
  public/data/cantons/XX.geojson               water geometry (output of build_all.py)
  data-raw/be_official/angfisch_schongeb.parquet  Kanton BE ANGFISCH Schongebiete (OGD)
  data-raw/cantons/tg_schongebiete.json        Kanton TG Fischereiverbote (WFS)
  data-raw/zones/wzvv/*.shp                    BAFU Wasser- und Zugvogelreservate (data.geo.admin.ch)
  data-raw/osm/parking.json                    scripts/extract_osm_parking.py (Geofabrik extract)
Outputs:
  public/data/rules.json, src/data/generated/rules.json
  public/data/zones.geojson                    overlay (simplified, WGS84)
  public/data/extra/XX.json                    per water: pk (parking), z (zone ids)
  src/data/generated/extra.json                same for SSR (all cantons)
"""
import glob, json, math, sys
from pathlib import Path
import geopandas as gpd
from shapely.geometry import shape, Point, mapping
from shapely.strtree import STRtree
from pyproj import Transformer

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts' / 'lib'))
from rules_cfg import RULES, FEDERAL, CHECKED  # noqa: E402
from cantons_cfg import ORDER  # noqa: E402

RAW, PUB, GEN = ROOT / 'data-raw', ROOT / 'public' / 'data', ROOT / 'src' / 'data' / 'generated'
(PUB / 'extra').mkdir(parents=True, exist_ok=True)
to95 = Transformer.from_crs(4326, 2056, always_xy=True).transform

def proj(g):
    from shapely.ops import transform
    return transform(to95, g)

# ------------------------------------------------------------------ rules
rules = {'checked': CHECKED, 'federal': FEDERAL, 'cantons': RULES}
for p in (PUB / 'rules.json', GEN / 'rules.json'):
    json.dump(rules, open(p, 'w'), ensure_ascii=False, separators=(',', ':'))
print('rules', len(RULES), 'cantons', (PUB / 'rules.json').stat().st_size, 'bytes')

# ------------------------------------------------------------------ zones
Z = []  # (props, geom LV95)
be = gpd.read_parquet(RAW / 'be_official' / 'angfisch_schongeb.parquet').to_crs(2056)
for _, r in be.iterrows():
    Z.append(({'k': 'fish', 'c': 'BE', 'n': f"{r['schonnt_name_de']} ({r['sg_code']})", 'nf': f"{r['schonnt_name_fr']} ({r['sg_code']})",
               'd': r['schonbt_beschr_de'], 'df': r['schonbt_beschr_fr'], 'u': r['url'], 's': 'be'}, r.geometry))
tg = gpd.read_file(RAW / 'cantons' / 'tg_schongebiete.json')
tg = tg.set_crs(2056, allow_override=True) if tg.crs is None and tg.total_bounds[0] > 1e6 else tg.to_crs(2056) if tg.crs else tg.set_crs(4326).to_crs(2056)
for _, r in tg.iterrows():
    per = f"{r.get('gueltig_von') or ''} – {r.get('gueltig_bis') or ''}".strip(' –')
    Z.append(({'k': 'fish', 'c': 'TG', 'n': r['gebietsname'], 'd': f"{r.get('fischereiregelung') or ''}" + (f" ({per})" if per else ''),
               'u': 'https://jfv.tg.ch/', 's': 'tg'}, r.geometry))
wz = gpd.read_file(glob.glob(str(RAW / 'zones' / 'wzvv' / '*.shp'))[0]).to_crs(2056)
wz = wz.dissolve(by=['ObjNummer', 'Name', 'RefObjBlat'], as_index=False)
for _, r in wz.iterrows():
    Z.append(({'k': 'wzvv', 'n': r['Name'], 'u': r['RefObjBlat'], 's': 'wzvv'}, r.geometry))
for i, (p, g) in enumerate(Z):
    p['id'] = i
feats = []
to84 = Transformer.from_crs(2056, 4326, always_xy=True).transform
from shapely.ops import transform as tf
def rnd(o):
    if isinstance(o, (list, tuple)):
        return [rnd(x) for x in o]
    return round(o, 5)
for p, g in Z:
    s = tf(to84, g.simplify(8 if p['k'] == 'fish' else 25, preserve_topology=True))
    m = mapping(s)
    feats.append({'type': 'Feature', 'properties': {k: v for k, v in p.items() if v not in (None, '')}, 'geometry': {'type': m['type'], 'coordinates': rnd(m['coordinates'])}})
zfc = {'type': 'FeatureCollection', 'meta': {'checked': CHECKED, 'sources': {
    'be': {'label': 'Kanton Bern · ANGFISCH Schongebiete (OGD)', 'url': 'https://www.geo.apps.be.ch/de/geodaten/suche-nach-geodaten.html?view=sheet&preview=search_list&geoproduct=ANGFISCH'},
    'tg': {'label': 'Kanton Thurgau · Fischereiverbote (WFS)', 'url': 'https://ows.geo.tg.ch/geofy_access_proxy/fischereiverbote'},
    'wzvv': {'label': 'BAFU · Wasser- und Zugvogelreservate (WZVV, geo.admin.ch)', 'url': 'https://map.geo.admin.ch/?layers=ch.bafu.bundesinventare-vogelreservate'}}},
    'features': feats}
json.dump(zfc, open(PUB / 'zones.geojson', 'w'), ensure_ascii=False, separators=(',', ':'))
print('zones', len(feats), (PUB / 'zones.geojson').stat().st_size, 'bytes')
ZG = [g for _, g in Z]
ztree = STRtree(ZG)

# ------------------------------------------------------------------ parking
pk = json.load(open(RAW / 'osm' / 'parking.json'))
items = pk['items']
P95 = [Point(to95(i['lon'], i['lat'])) for i in items]
ptree = STRtree(P95)
PL = json.load(open(RAW / 'osm' / 'places.json'))
PL95 = [Point(to95(i['lon'], i['lat'])) for i in PL]
pltree = STRtree(PL95)
W = {'city': 0, 'town': 0, 'suburb': 300, 'village': 200, 'hamlet': 800}

def locality(pt):
    idx = pltree.query(pt.buffer(3000))
    best = min(((pt.distance(PL95[i]) + W[PL[i]['t']], i) for i in idx), default=None)
    return PL[best[1]]['n'] if best else None

def pick(geom, kind):
    big = geom.length > 4000 or geom.area > 2e6
    radius = 400 if big else 1500
    idx = ptree.query(geom.buffer(radius))
    cand = sorted(((geom.distance(P95[i]), i) for i in idx), key=lambda t: t[0] + (150 if items[t[1]].get('kind') in ('street_side', 'lane', 'underground', 'multi-storey', 'rooftop') else 0))
    cand = [c for c in cand if c[0] <= radius]
    per = geom.length if geom.geom_type.endswith('LineString') else geom.boundary.length
    sep = max(300.0, per / 14) if big else 150.0
    nmax = 6 if big else 4
    out = []
    for d, i in cand:
        if all(P95[i].distance(P95[j]) >= sep for _, j in out):
            out.append((d, i))
        if len(out) >= nmax:
            break
    res = []
    for d, i in out:
        it = items[i]
        r = {'lon': it['lon'], 'lat': it['lat'], 'm': int(round(d / 10) * 10), 'id': it['id']}
        loc = locality(P95[i])
        if loc:
            r['loc'] = loc
        for k in ('name', 'fee', 'cap', 'kind'):
            if it.get(k):
                r[k] = it[k]
        res.append(r)
    return res

allx = {}
stats = {}
for c in ORDER:
    fc = json.load(open(PUB / 'cantons' / f'{c}.geojson'))
    geoms = {}
    for f in fc['features']:
        wid = f['properties']['id']
        g = proj(shape(f['geometry']))
        geoms[wid] = g if wid not in geoms else geoms[wid].union(g)
    out = {}
    npk = nz = 0
    for wid, g in geoms.items():
        e = {}
        p = pick(g, None)
        if p:
            e['pk'] = p; npk += 1
        zi = [int(i) for i in ztree.query(g.buffer(150))]
        zi = [i for i in zi if ZG[i].distance(g) <= 150]
        if zi:
            e['z'] = [{k: v for k, v in Z[i][0].items() if k in ('k', 'n', 'nf', 'u', 's', 'd', 'df') and v not in (None, '')} for i in sorted(zi)]
            nz += 1
        if e:
            out[wid] = e
    json.dump(out, open(PUB / 'extra' / f'{c}.json', 'w'), ensure_ascii=False, separators=(',', ':'))
    allx.update(out)
    stats[c] = {'waters': len(geoms), 'parking': npk, 'zones': nz}
json.dump({'waters': allx, 'zoneSources': zfc['meta']['sources'], 'osm': {'source': pk['source'], 'asOf': '2026-10-04'}, 'stats': stats},
          open(GEN / 'extra.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(json.dumps(stats))
print('extra.json', (GEN / 'extra.json').stat().st_size)

# ------------------------------------------------------------------ coverage table (docs/COVERAGE-ANSWERS.md)
ZG_C = {'BE', 'TG'}  # cantonal zone geodata
WZ_C = set()
for p_, g in Z:
    if p_['k'] == 'wzvv':
        import re as _re
        m = _re.search(r'\(([A-Z ,]+)\)\s*$', p_['n'])
        if m:
            WZ_C.update(x.strip() for x in m.group(1).split(','))
lines = ['# Coverage – the five questions', '',
         f'Generated by `scripts/build_extras.py` · rules checked {CHECKED} · OSM parking as of 2026-10-04.', '',
         '| Canton | Price (sourced) | Rules (closed seasons / sizes) | Catch limits | Sperrzonen | Parking (OSM) |',
         '|---|---|---|---|---|---|']
for c in ORDER:
    r = RULES.get(c)
    profs = ([r['base']] + r['profiles']) if r else []
    price = [p_.get('label', {}).get('de', 'Kanton') for p_ in profs if p_.get('prices')]
    def has(k):
        return any(p_.get(k) for p_ in profs)
    st = stats[c]
    zone = []
    if c in ZG_C:
        zone.append('cantonal geodata')
    if c in WZ_C:
        zone.append('WZVV (federal)')
    if has('zones'):
        zone.append('text')
    lines.append(f"| {c} | {'yes – ' + str(len(price)) + ' scope(s)' if price else '—'} | {'yes' if has('closed') or has('sizes') else '—'} | {'yes' if has('catch') else '—'} | "
                 f"{', '.join(zone) or '—'} ({st['zones']} waters) | {st['parking']}/{st['waters']} waters |")
lines += ['', '— = not in our data (shown as «nicht in unseren Daten» in the UI).', '',
          'Sources: `scripts/lib/rules_cfg.py` (every price/rule has a source URL), Kanton BE ANGFISCH Schongebiete, Kanton TG Fischereiverbote, BAFU WZVV, OpenStreetMap (ODbL) via Geofabrik.', '']
(ROOT / 'docs' / 'COVERAGE-ANSWERS.md').write_text('\n'.join(lines))
print('docs/COVERAGE-ANSWERS.md')
