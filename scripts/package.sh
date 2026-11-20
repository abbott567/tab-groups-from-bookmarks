#!/bin/sh
# Build a Chrome Web Store upload: dist/tab-groups-from-bookmarks-<version>.zip
# Only the files the extension needs are included.
set -eu
cd "$(dirname "$0")/.."

version=$(python3 -c 'import json; print(json.load(open("manifest.json"))["version"])')
out="dist/tab-groups-from-bookmarks-$version.zip"

mkdir -p dist
rm -f "$out"
zip -q -r "$out" \
  manifest.json background.js popup.html popup.css popup.js \
  icons/icon-16.png icons/icon-32.png icons/icon-48.png icons/icon-128.png \
  fonts/ibm-plex-sans-latin-wght-normal.woff2 fonts/OFL.txt \
  -x '.*'

echo "Built $out"
unzip -l "$out"
