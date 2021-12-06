#!/bin/bash
function run {
	echo ">>" $@
	$@
}
run git pull
run cd terser
run npm install
run cd ..
run bash ./compile.sh
run sudo bash ./install.sh
