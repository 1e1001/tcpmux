#!/bin/bash
function run {
	echo ">>" $@
	$@
}
run git pull
run bash ./compile.sh
run sudo bash ./install.sh
echo ">> # update done"
