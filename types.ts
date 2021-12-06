export interface Address {
	addr: string;
	port: number;
	subport: bigint | null;
}

export function PrintAddr(a: Address) {
	const sp = a.subport === null ? `` : `!${a.subport}`;
	return `${a.addr}:${a.port}${sp}`;
}

export interface ConnectionOpts {
	incoming: Address;
	outgoing: Address;
}

export interface GlobalOpts {
	dry: boolean;
	conns: ConnectionOpts[];
}

export interface GlobalData {
	inc: bigint;
	configPath: string;
	killTimeout: number;
}

export const muxHeader = new Uint8Array([0, 116, 90, 112, 109, 117, 120, 0]);
