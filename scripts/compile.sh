#!/bin/bash
function run {
	echo ">>" $@
	$@
}
run mkdir -pv out/
run rm out/*
run cp README.md scripts/tcpmux scripts/tcpmux_stop scripts/tcpmux.service src/config.txt out/
run deno bundle --unstable src/daemon.ts out/tcpmux.js
cat out/tcpmux.js >>out/tcpmux
run rm out/tcpmux.js
echo ">> # compile done"
