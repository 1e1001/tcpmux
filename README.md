# TCPmux
TCP multiplexer / proxy daemon

## Installing
0. Make sure you have `deno` installed on your system
1. Clone the repository
```sh
$ git clone https://github.com/1e1001/tcpmux
$ cd tcpmux
```
2. Run the tests (optional)
```sh
$ deno test
```
> *Note: tests aren't complete yet, you can fix them if you want.*
3. Run the update script, you can run this every time you want to upgrade
```sh
$ scripts/compile.sh
$ sudo scripts/install.sh # optional
```
Or, if you're on Windows:
```bat
[tcpmux directory]>scripts\compile.bat
```
(it will complain about a missing file on first run, this is normal)

## Starting
If you're using the systemd service, use `systemctl` commands to start it like any other service. Otherwise run `/etc/tcpmux/tcpmux` (or `tcpmux` in the `out` directory if using portable/on Windows) to start it.

If you have incoming ports under 1024, you need to run `tcpmux` as root. Note that this does not apply to subports or outgoing ports

## Config Format
The configuration format is made up of lines separated by \n, where each line is parsed separately, with the following rules:
- any starting or ending whitespace is ignored
- if the line is entirely whitespace, it's ignored
- if the first character of the line is a `#`, it's treated as a comment
- any line with the format *key* `=` *value* is treated as a global configuration options
	- key must match `/[A-Za-z0-9]+/`, and is case-insensitive
	- example: `Dry = true`
	- [List of Config Keys](#list-of-config-keys)
- any line with the format *addr* `>` *addr* is treated as a proxy config
	- addr is *hostname* `:` *port* [ `!` *subport* ]
		- addr: `*` binds to all ports, empty addr is localhost
		- if subport isn't specified and it's on the incoming side, it's the address for a non-tcpmux connection
		- if subport isn't specified and it's on the outgoing side, no mux header will be sent (connecting to a non-tcpmux address)
- anything else will throw an error

### List of Config Keys
- `dry` (boolean) if true, doesn't start any listeners

## Infrequently Asked Questions

- What permissions does this use?

	as seen in `tcpmux` TCPmux uses `--allow-read=[your config path]` and `--allow-net`
