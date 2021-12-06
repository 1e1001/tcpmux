#!/bin/bash
function run {
	echo $@
	$@
}
run mkdir -pv /etc/tcpmux/
run cp out/tcpmux /etc/tcpmux/
run cp out/tcpmux_start /etc/tcpmux/
run cp out/tcpmux_stop /etc/tcpmux/
run cp out/tcpmux.service /usr/lib/systemd/
# copy the config if it doesn't exist
if ! [ -f /etc/tcpmux/tcpmux.cfg ]; then
	run cp out/tcpmux.cfg /usr/lib/systemd/
fi
