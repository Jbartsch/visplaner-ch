#!/usr/bin/env bash
# Fetch raw open government geodata into data-raw/ (gitignored).
# ZH: Kanton Zürich OGD WFS "Fischereireviere" (dataset 314)
# BE: swisstopo/BAFU VECTOR25 lakes + rivers via api3.geo.admin.ch, BE canton boundary (swissBOUNDARIES3D)
#     (The official BE ANGFISCH vector download at geofiles.be.ch is not reachable from our build box;
#      the app overlays the official BE ANGFISCH WMS in the browser instead.)
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p data-raw
B="https://maps.zh.ch/wfs/OGDZHWFS?service=WFS&version=2.0.0&request=GetFeature&outputFormat=geojson&srsName=EPSG:4326&typeNames=ms:ogd-0314_giszhpub_fischrevier_"
for l in stillgewaesser_f gewaessernetz_l bereiche_f; do
  curl -sSf -o "data-raw/zh_$l.geojson" "${B}$l"
done
python3 scripts/fetch_be.py
