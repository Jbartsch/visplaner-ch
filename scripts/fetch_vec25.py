"""Fetch the swisstopo VECTOR25 river network (ch.swisstopo.vec25-gewaessernetz_referenz) for cantons
without an official vector fisheries layer, into data-raw/ch/vec25_rivers.json (named segments only).
Uses api3.geo.admin.ch identify, tiled 0.1° and paged; ~1–3 min with 8 threads."""
import json, sys, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'data-raw' / 'ch' / 'vec25_rivers.json'
A = 'https://api3.geo.admin.ch/rest/services/api/MapServer/identify'
LAYER = 'ch.swisstopo.vec25-gewaessernetz_referenz'
SKIP = {'ZH', 'BE', 'SO', 'VS', 'SZ'}

kant = json.load(open(ROOT / 'data-raw' / 'ch' / 'ch.swisstopo.swissboundaries3d-kanton-flaeche.fill.json'))
tiles = set()
for f in kant:
    if f['properties']['ak'] in SKIP:
        continue
    x0, y0, x1, y1 = f['bbox']
    x = int(x0 * 10)
    while x / 10 < x1:
        y = int(y0 * 10)
        while y / 10 < y1:
            tiles.add((x, y)); y += 1
        x += 1

def fetch(t):
    x, y = t
    bb = f'{x/10},{y/10},{(x+1)/10},{(y+1)/10}'
    out, off = [], 0
    while True:
        q = urllib.parse.urlencode(dict(geometryType='esriGeometryEnvelope', geometry=bb, imageDisplay='1000,1000,96', mapExtent=bb,
                                        tolerance=0, layers=f'all:{LAYER}', geometryFormat='geojson', sr=4326, returnGeometry='true', limit=200, offset=off))
        for attempt in range(4):
            try:
                r = json.load(urllib.request.urlopen(f'{A}?{q}', timeout=120)); break
            except Exception as e:
                if attempt == 3:
                    print('ERR', bb, e, file=sys.stderr); return out
        res = r['results']
        out += [{'type': 'Feature', 'id': f['id'], 'geometry': f['geometry'],
                 'properties': {'name': f['properties']['name'].strip(), 'gewissnr': f['properties'].get('gewissnr'), 'objectval': f['properties'].get('objectval')}}
                for f in res if (f['properties'].get('name') or '').strip()]
        if len(res) < 200:
            return out
        off += 200

seen = {}
with ThreadPoolExecutor(8) as ex:
    for i, fs in enumerate(ex.map(fetch, sorted(tiles))):
        for f in fs:
            seen[f['id']] = f
print(len(tiles), 'tiles', len(seen), 'named segments')
OUT.write_text(json.dumps({'type': 'FeatureCollection', 'features': list(seen.values())}))
