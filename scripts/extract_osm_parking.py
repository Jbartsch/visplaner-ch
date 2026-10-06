"""Extract amenity=parking from a Geofabrik Switzerland extract into data-raw/osm/parking.json.

Overpass is unreachable from the build box, so we read the prebuilt extract instead:
  curl -L -o data-raw/osm/switzerland.osm.pbf https://download.geofabrik.de/europe/switzerland-latest.osm.pbf
  .venv/bin/python scripts/extract_osm_parking.py
Data © OpenStreetMap contributors (ODbL). Output: [{id, lon, lat, name, fee, access, cap, kind}]
"""
import json, sys
from pathlib import Path
import osmium

ROOT = Path(__file__).resolve().parent.parent
PBF = ROOT / 'data-raw' / 'osm' / 'switzerland.osm.pbf'
OUT = ROOT / 'data-raw' / 'osm' / 'parking.json'
SKIP_ACCESS = {'private', 'no', 'customers', 'delivery', 'permit', 'residents'}

def rec(kind, oid, lon, lat, tags):
    acc = tags.get('access', '')
    if acc in SKIP_ACCESS:
        return None
    if tags.get('parking') in ('underground',) and False:
        return None
    return {'id': f'{kind}{oid}', 'lon': round(lon, 6), 'lat': round(lat, 6), 'name': tags.get('name', ''),
            'fee': tags.get('fee', ''), 'access': acc, 'cap': tags.get('capacity', ''), 'kind': tags.get('parking', '')}

class H(osmium.SimpleHandler):
    def __init__(self):
        super().__init__(); self.out = []
    def node(self, n):
        if n.tags.get('amenity') == 'parking' and n.location.valid():
            r = rec('n', n.id, n.location.lon, n.location.lat, dict(n.tags))
            if r: self.out.append(r)
    def way(self, w):
        if w.tags.get('amenity') != 'parking':
            return
        try:
            pts = [(nd.lon, nd.lat) for nd in w.nodes if nd.location.valid()]
        except osmium.InvalidLocationError:
            return
        if not pts:
            return
        lon = sum(p[0] for p in pts) / len(pts); lat = sum(p[1] for p in pts) / len(pts)
        r = rec('w', w.id, lon, lat, dict(w.tags))
        if r: self.out.append(r)

h = H()
h.apply_file(str(PBF), locations=True, idx='flex_mem')
json.dump({'source': 'OpenStreetMap (Geofabrik switzerland-latest.osm.pbf)', 'file_mtime': PBF.stat().st_mtime, 'items': h.out}, open(OUT, 'w'))
print('parking', len(h.out), file=sys.stderr)
