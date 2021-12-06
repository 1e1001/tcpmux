# TCPmux
TCP multiplexer / proxy daemon

## Installing
tcpmux consists of 4 main files, downloadable from the [Releases](https://github.com/1e1001/tcpmux/releases/) as a tarball.
- `tcpmux` - main TCPmux script
- `tcpmux_start` - starts `tcpmux`, don't call this directly
- `tcpmux_stop` - stops `tcpmux`
- `tcpmux.service` - a systemd service for TCPmux
> *Note: this expects tcpmux to be installed in* `/etc/tcpmux/` *such that* `/etc/tcpmux/tcpmux` is the main script
- `tcpmux.cfg` - example config file (see [Config Format](#config-format))

## Starting
If you're using the systemd service, use `systemctl` commands to start it like any other service. Otherwise run `./tcpmux` (in the TCPmux folder) to start TCPmux.

If you have incoming ports under 1024, you need to run `tcpmux` as root. Note that this does not apply to subports

## Building from Source
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
3. Install terser for compilation
```sh
$ cd terser
$ npm install
$ cd ..
```
4. Run the compile script
```sh
$ bash compile.sh
```
5. The compiled program is now available in the `out/tcpmux/` directory, a tarball is also available at `out/release.tar.gz`
6. if you're using the systemd service: copy the `out/tcpmux/ ` dir to `/etc/tcpmux/` (so that the `tcpmux` script exists in `/etc/tcpmux/tcpmux`) You should also copy the systemd service (`tcpmux.service`) to `/usr/lib/systemd/`

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
		- if subport isn't specified and it's on the incoming side, it's the address for a non-tcpmux connection
		- if subport isn't specified and it's on the outgoing side, no mux header will be sent (connecting to a non-tcpmux address)
- anything else will throw an error

### List of Config Keys
- `dry` (boolean) if true, doesn't start any listeners

## Infrequently Asked Questions

- What permissions does this use?

	as seen in `tcpmux_start` TCPmux uses `--allow-read=[your config path]` and `--allow-net`
