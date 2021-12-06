#!/bin/bash
rm -r out
mkdir -pv out/tcpmux/
cp tcpmux tcpmux_start tcpmux_stop tcpmux.service out/tcpmux/
deno bundle --unstable daemon.ts out/tcpmux/tcpmux.compiled.js
cat out/tcpmux/tcpmux.compiled.js | terser/node_modules/terser/bin/terser --module -m reserved=['_'] -c >>out/tcpmux/tcpmux_start
rm out/tcpmux/tcpmux.compiled.js
cd out
tar czvf release.tar.gz tcpmux
cd ..
