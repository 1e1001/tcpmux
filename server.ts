import { Address, GlobalData, GlobalOpts, muxHeader, PrintAddr } from "./types.ts"
import { writeAll, copy, fromUInt, readStream, matchStream, toUInt } from "./bytes.ts";
import { Listen, Listener, Connect, Connector } from "./conn.ts";
import { Log, MkSource, StyleSource } from "./log.ts";
import { deadline } from "https://deno.land/std@0.116.0/async/deadline.ts";
import { TryAsync } from "./try.ts";
const logSource = StyleSource(MkSource(`Server`), `36;1`);

export function StartServers(opts: GlobalOpts, globalData: GlobalData) {
	const servers = new Map<string, Map<bigint | null, Address>>();
	// we do this to combine rsp's on the same address/port together
	for (let i = 0; i < opts.conns.length; i++) {
		const opt = opts.conns[i];
		Log(logSource, `${PrintAddr(opt.incoming)} > ${PrintAddr(opt.outgoing)}`);
		const key = `${opt.incoming.addr}:${opt.incoming.port}`;
		if (!servers.has(key))
			servers.set(key, new Map());
		servers.get(key)!.set(opt.incoming.subport, opt.outgoing);
	}
	if (opts.dry)
		return [];
	const listeners: Listener[] = [];
	for (const [key, table] of servers) {
		const [addr, portStr] = key.split(`:`);
		const port = parseInt(portStr);
		listeners.push(Listen({
			addr: addr,
			port: port,
			id: globalData.inc++,
			async handle(incoming) {
				const id = MkSource(logSource, globalData.inc++);
				Log(id, `New connection`);
				let conn: Connector | null = null;
				try {
					const headerMatchPromise = matchStream(incoming, muxHeader);
					const headerMatch = await TryAsync(
						() => deadline(headerMatchPromise, 1000),
						error => {
							Log(id, `Header read timed out, assuming default subport`);
							console.log(error);
							console.log();
							return new Uint8Array(0);
						}
					);
					let subport: bigint | null = null;
					if (headerMatch === null)
						subport = fromUInt(await readStream(incoming, 8));
					if (!table.has(subport)) {
						const subportStr = subport === null ? `default` : `!${subport};`
						Log(id, `Invalid subport ${subportStr}, closing`);
						return incoming.close();
					}
					const match = table.get(subport)!;
					Log(id, `Connecting on ${PrintAddr({addr, port, subport})}`);
					conn = await Connect({
						addr: match.addr,
						port: match.port,
						id: globalData.inc++
					});
					const outgoing = conn.conn;
					Log(id, `Connected to ${PrintAddr(match)}`);
					if (headerMatch !== null)
						await writeAll(outgoing, headerMatch);
					if (match.subport !== null) {
						await writeAll(outgoing, muxHeader);
						await writeAll(outgoing, toUInt(match.subport, 8));
					}
					await Promise.any([
						copy(incoming, outgoing),
						copy(outgoing, incoming)]);
					Log(id, `Closed`);
					conn.close();
				} catch (error) {
					Log(id, `Errored internally!`);
					try {
						conn?.close();
					} catch {
						Log(id, `Also failed to close connection`);
					}
					console.log(error);
					console.log();
				}
			}
		}))
	}
	return listeners;
}

// function hasDuplicates<T extends string | number | symbol>(arr: T[]) {
// 	const seen = Object.create(null);
// 	for (let i = 0; i < arr.length; i++) {
// 		const v = arr[i];
// 		if (v in seen)
// 			return v;
// 		seen[v] = true;
// 	}
// 	return null;
// }
