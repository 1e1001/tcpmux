#!/bin/bash
function run {
	echo ">>" $@
	$@
}
run mkdir -pv out/
run rm out/*
run cp README.md tcpmux tcpmux_start tcpmux_stop tcpmux.service config.txt out/
run deno bundle --unstable daemon.ts out/tcpmux.compiled.js
run terser/node_modules/terser/bin/terser --module -m reserved=['_'] out/tcpmux.compiled.js -c -o out/tcpmux.js
cat out/tcpmux.js >>out/tcpmux_start
run rm out/tcpmux.compiled.js out/tcpmux.js
echo ">> # compile done"
