#!/bin/bash
function run {
	echo ">>" $@
	$@
}
run mkdir -pv out/
run rm out/*
run cp README.md tcpmux.cfg tcpmux tcpmux_start tcpmux_stop tcpmux.service out/
run deno bundle --unstable daemon.ts out/tcpmux.compiled.js
run terser/node_modules/terser/bin/terser --module -m reserved=['_'] out/tcpmux.compiled.js -c -o out/tcpmux.min.js
cat out/tcpmux.min.js >>out/tcpmux_start
run rm out/tcpmux.compiled.js out/tcpmux.min.js
echo ">> # compile done"
