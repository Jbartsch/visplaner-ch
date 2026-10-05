import json, urllib.request, urllib.parse
A='https://api3.geo.admin.ch/rest/services/api/MapServer'
def get(path, **p):
    u=f'{A}/{path}?'+urllib.parse.urlencode(p)
    return json.load(urllib.request.urlopen(u, timeout=120))
# canton BE
r=get('find', layer='ch.swisstopo.swissboundaries3d-kanton-flaeche.fill', searchText='Bern', searchField='name', geometryFormat='geojson', sr=4326, returnGeometry='true', contains='false')
print('kanton', [(x['properties'].get('name'), x['id']) for x in r['results']])
json.dump(r, open('data-raw/be_kanton.json','w'))
bbox='6.85,46.32,8.48,47.35'
out={}
for layer in ['ch.bafu.vec25-seen','ch.bafu.vec25-gewaessernetz_2000']:
    feats=[]; off=0
    while True:
        r=get('identify', geometryType='esriGeometryEnvelope', geometry=bbox, imageDisplay='1000,1000,96', mapExtent=bbox, tolerance=0, layers=f'all:{layer}', geometryFormat='geojson', sr=4326, returnGeometry='true', limit=200, offset=off)
        res=r['results']; feats+=res
        if len(res)<200: break
        off+=200
    print(layer, len(feats))
    json.dump(feats, open('data-raw/'+layer+'.json','w'))
