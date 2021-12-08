#!/bin/bash
function run {
	echo ">>" $@
	$@
}
run mkdir -pv out/
run rm out/*
run cp README.md tcpmux tcpmux_stop tcpmux.service config.txt out/
run deno bundle --unstable daemon.ts out/tcpmux.js
cat out/tcpmux.js >>out/tcpmux
run rm out/tcpmux.js
echo ">> # compile done"
