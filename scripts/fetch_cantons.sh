#!/usr/bin/env bash
# Fetch official cantonal fisheries geodata (open data) into data-raw/cantons/.
# Hosts that are unreachable from the dev box (e.g. *.be.ch) are fetched by
# .github/workflows/fetch-geodata.yml (scripts/fetch_blocked.sh) instead.
set -euo pipefail
cd "$(dirname "$0")/.."
D=data-raw/cantons; mkdir -p "$D"; cd "$D"
c() { curl -sSL --retry 3 -m 180 -o "$1" "$2" && echo "ok  $1 ($(stat -c %s "$1") B)" || echo "ERR $1  $2"; }

# SO – Amt für Wald, Jagd und Fischerei: Fischereireviere incl. regime (Pacht/Patent/Schon/Privat)
c so.gpkg.zip https://files.geo.so.ch/ch.so.awjf.gewaesser.fischerei/aktuell/ch.so.awjf.gewaesser.fischerei.gpkg.zip
unzip -oq so.gpkg.zip -d so
# SH – Fischereireviere (Rhein) OGD
c sh.zip https://data.geo.sh.ch/ogd/fischereireviere.zip
unzip -oq sh.zip -d sh
# VS – Carte piscicole (SCPF) ArcGIS FeatureServer: 2 = réseau, 3 = lacs
VS=https://services1.arcgis.com/rMlsWo8szOzlrpCq/ArcGIS/rest/services/Peche/FeatureServer
c vs_reseau.json "$VS/2/query?where=1%3D1&outFields=*&outSR=4326&f=geojson"
c vs_lac.json "$VS/3/query?where=1%3D1&outFields=*&outSR=4326&f=geojson"
# LU – Fischereireviere (lawa) OGD MapServer: 1 = Linien, 2 = Flächen
LU=https://public.geo.lu.ch/ogd/rest/services/managed/FISCHREV_DS_V1_MP/MapServer
c lu_lin.json "$LU/1/query?where=1%3D1&outFields=*&outSR=4326&f=geojson"
c lu_fl.json "$LU/2/query?where=1%3D1&outFields=*&outSR=4326&f=geojson"
# TG – Fischereiverbote / Freiangelrecht / Schongebiete (WFS)
TG="https://ows.geo.tg.ch/geofy_access_proxy/fischereiverbote?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&OUTPUTFORMAT=geojson&SRSNAME=EPSG:4326&TYPENAMES=ms:"
for t in freiangelrecht schongebiete fischenzen; do c "tg_$t.json" "$TG$t"; done
# SZ – Fischgewässer (habitat layer; regime is canton-wide patent)
c sz_fg.gml "https://map.geo.sz.ch/mapserv_proxy?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=ms:ch.sz.a049a.fischerei.fischgewaesser"
