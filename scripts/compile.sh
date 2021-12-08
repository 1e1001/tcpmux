#!/bin/bash
function run {
	echo ">>" $@
	$@
}
run mkdir -pv out/
run rm out/*
run cp README.md scripts/tcpmux scripts/tcpmux_stop scripts/tcpmux.service src/config.txt out/
run deno bundle --unstable src/daemon.ts out/tcpmux.js
# basic minification
# TODO(1e1001): port this to compile.bat, i don't know enough batch to test this for myself
cat out/tcpmux.js | sed "s/\[\[TCPMUX_VERSION\]\]/"$(git log --format="%h" -n 1)"/g" | sed "s/^ *//g" | tr -d '\n' >>out/tcpmux
run rm out/tcpmux.js
echo ">> # compile done"
