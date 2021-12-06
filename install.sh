mkdir -pv /etc/tcpmux/
cp out/tcpmux /etc/tcpmux/
cp out/tcpmux_start /etc/tcpmux/
cp out/tcpmux_stop /etc/tcpmux/
cp out/tcpmux.service /usr/lib/systemd/
# copy the config if it doesn't exist
if ! [ -f /etc/tcpmux/tcpmux.cfg ]; then
	cp out/tcpmux.cfg /usr/lib/systemd/
fi
