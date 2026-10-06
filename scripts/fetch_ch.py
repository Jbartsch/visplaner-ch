"""Fetch CH-wide base geometry from api3.geo.admin.ch (swisstopo / BAFU, open data) into data-raw/ch/.
- 26 canton polygons (swissBOUNDARIES3D)
- VECTOR25 lakes (ch.bafu.vec25-seen)
- Gewässernetz 1:2 Mio (ch.bafu.vec25-gewaessernetz_2000)
"""
import json, urllib.request, urllib.parse
from pathlib import Path

A = 'https://api3.geo.admin.ch/rest/services/api/MapServer'
OUT = Path(__file__).resolve().parent.parent / 'data-raw' / 'ch'
OUT.mkdir(parents=True, exist_ok=True)

def get(path, **p):
    u = f'{A}/{path}?' + urllib.parse.urlencode(p)
    return json.load(urllib.request.urlopen(u, timeout=180))

def identify(layer, bbox):
    feats, off = [], 0
    while True:
        r = get('identify', geometryType='esriGeometryEnvelope', geometry=bbox, imageDisplay='1000,1000,96', mapExtent=bbox,
                tolerance=0, layers=f'all:{layer}', geometryFormat='geojson', sr=4326, returnGeometry='true', limit=200, offset=off)
        res = r['results']; feats += res
        if len(res) < 200: break
        off += 200
    return feats

CH = '5.95,45.8,10.5,47.82'
# tile the bbox so identify doesn't cap
tiles = []
xs = [5.95, 7.1, 8.25, 9.4, 10.5]; ys = [45.8, 46.5, 47.2, 47.82]
for i in range(len(xs) - 1):
    for j in range(len(ys) - 1):
        tiles.append(f'{xs[i]},{ys[j]},{xs[i+1]},{ys[j+1]}')
for layer in ['ch.swisstopo.swissboundaries3d-kanton-flaeche.fill', 'ch.bafu.vec25-seen', 'ch.bafu.vec25-gewaessernetz_2000']:
    seen = {}
    for t in tiles:
        for f in identify(layer, t):
            seen[(f['id'], json.dumps(f['properties'], sort_keys=True)[:200])] = f
    feats = list(seen.values())
    print(layer, len(feats))
    (OUT / f'{layer}.json').write_text(json.dumps(feats))
