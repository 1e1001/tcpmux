mkdir -pv /etc/tcpmux/
cp out/tcpmux/tcpmux /etc/tcpmux/
cp out/tcpmux/tcpmux_start /etc/tcpmux/
cp out/tcpmux/tcpmux_stop /etc/tcpmux/
cp out/tcpmux/tcpmux.service /usr/lib/systemd/
# copy the config if it doesn't exist
if ! [ -f /etc/tcpmux/tcpmux.cfg ]; then
	cp out/tcpmux/tcpmux.cfg /usr/lib/systemd/
fi
