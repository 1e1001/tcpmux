#!/bin/bash
rm -r out
mkdir -pv out/
cp README.md tcpmux.cfg tcpmux tcpmux_start tcpmux_stop tcpmux.service out/
deno bundle --unstable daemon.ts out/tcpmux.compiled.js
cat out/tcpmux.compiled.js | terser/node_modules/terser/bin/terser --module -m reserved=['_'] -c >>out/tcpmux_start
rm out/tcpmux.compiled.js
# cd out
# tar czvf release.tar.gz tcpmux
# cd ..
