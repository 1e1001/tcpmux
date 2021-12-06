#!/bin/bash
rm -r out
mkdir out
cp tcpmux tcpmux_start tcpmux_stop tcpmux.service out
deno bundle --unstable daemon.ts out/tcpmux.compiled.js
cat out/tcpmux.compiled.js | terser/node_modules/terser/bin/terser --module -m reserved=['_'] -c >>out/tcpmux_start
rm out/tcpmux.compiled.js
