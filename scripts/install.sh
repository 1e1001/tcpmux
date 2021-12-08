#!/bin/bash
function run {
	echo ">>" $@
	$@
}
run mkdir -pv /etc/tcpmux/
run cp out/tcpmux /etc/tcpmux/
run cp out/tcpmux_stop /etc/tcpmux/
run cp out/tcpmux.service /etc/systemd/system/
# copy the config if it doesn't exist
if ! [ -f /etc/tcpmux/config.txt ]; then
	run cp out/config.txt /etc/tcpmux/
fi
echo ">> # install done"
