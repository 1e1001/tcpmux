import { Log, MkSource, StyleSource } from "./log.ts";
const logSource = StyleSource(MkSource(`Conn`), `32;1`);

interface ConnectOptions {
	addr: string;
	port: number;
	id: bigint;
}
interface ListenOptions extends ConnectOptions {
	handle(conn: Deno.Conn): Promise<void>;
}
export interface Listener {
	close(): Promise<void>;
}
export interface Connector {
	conn: Deno.Conn;
	close(): void;
}

function MapAddr(addr: string) {
	if (addr === `*`)
		return undefined;
	else if (addr === ``)
		return `127.0.0.1`;
	return addr;
}

/** start a listener */
export function Listen(opts: ListenOptions): Listener {
	const mapAddr = MapAddr(opts.addr);
	const id = MkSource(logSource, opts.id);
	Log(id, `Listening on ${mapAddr ?? `*`}:${opts.port}`);
	const listener = Deno.listen({
		transport: `tcp`,
		hostname: mapAddr,
		port: opts.port
	});
	const tasks: Promise<void>[] = [];
	const conns: (Deno.Conn | null)[] = [];
	tasks.push((async () => {
		for await (const conn of listener) {
			const idx = conns.push(conn) - 1;
			while (conns[conns.length - 1] === null)
				conns.pop();
			tasks.push(opts.handle(conn).then(() => {
				conn.close();
				conns[idx] = null;
			}).catch(error => {
				Log(logSource, "Errored in handler");
				console.log(error);
				console.log();
			}));
		}
	})());
	return {
		async close() {
			Log(id, `Closing listener`);
			listener.close();
			Log(id, `Finishing tasks`);
			await Promise.all(tasks);
			Log(id, `Closing connections`);
			for (let i = 0; i < conns.length; i++)
				conns[i]?.close();
		}
	};
}

/** starts a connection */
export async function Connect(opts: ConnectOptions): Promise<Connector> {
	const mapAddr = MapAddr(opts.addr);
	const id = MkSource(logSource, opts.id);
	Log(id, `Connecting to ${mapAddr ?? `*`}:${opts.port}`);
	const conn = await Deno.connect({
		transport: `tcp`,
		hostname: mapAddr,
		port: opts.port
	});
	return {
		conn, close() {
			Log(id, `Closing connection`);
			conn.close();
		}
	};
}
