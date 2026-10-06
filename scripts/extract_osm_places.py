"""Extract OSM place nodes (city/town/village/hamlet/suburb) from the Geofabrik Switzerland extract.
Used only to label parking spots with the nearest locality. Output: data-raw/osm/places.json"""
import json, osmium
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
KEEP = {'city', 'town', 'village', 'hamlet', 'suburb'}
class H(osmium.SimpleHandler):
    def __init__(self):
        super().__init__(); self.out = []
    def node(self, n):
        pl = n.tags.get('place')
        if pl in KEEP and n.tags.get('name'):
            self.out.append({'n': n.tags['name'], 't': pl, 'lon': round(n.location.lon, 6), 'lat': round(n.location.lat, 6)})
h = H(); h.apply_file(str(ROOT / 'data-raw/osm/switzerland.osm.pbf'))
json.dump(h.out, open(ROOT / 'data-raw/osm/places.json', 'w'), ensure_ascii=False)
print('places', len(h.out))
