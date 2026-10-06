#!/usr/bin/env bash
# Downloads official geodata from hosts that are unreachable from our build box (TLS resets),
# e.g. geofiles.be.ch. Runs in GitHub Actions (.github/workflows/fetch-geodata.yml); the result is
# uploaded as an artifact and pulled with `gh run download`.
set -euo pipefail
mkdir -p out
B=https://geofiles.be.ch/geoportal/pub/download/ANGFISCH
for f in angfisch_patflgew angfisch_patstgew angfisch_pachtflg angfisch_pachtstg angfisch_schongeb; do
  curl -sSfL --retry 3 -o "out/$f.parquet" "$B/$f.parquet" || echo "WARN $f failed"
done
curl -sSfL --retry 3 -o out/angfisch.gpkg.zip "$B/angfisch.gpkg.zip" || echo "WARN gpkg failed"
ls -la out
