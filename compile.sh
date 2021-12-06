#!/bin/bash
function run {
	echo $@
	$@
}
run rm -r out
run mkdir -pv out/
run cp README.md tcpmux.cfg tcpmux tcpmux_start tcpmux_stop tcpmux.service out/
run deno bundle --unstable daemon.ts out/tcpmux.compiled.js
run cat out/tcpmux.compiled.js | terser/node_modules/terser/bin/terser --module -m reserved=['_'] -c >>out/tcpmux_start
run rm out/tcpmux.compiled.js
# cd out
# tar czvf release.tar.gz tcpmux
# cd ..
