export { copy, writeAll, writeAllSync } from "https://deno.land/std@0.116.0/streams/conversion.ts";

/** convert a uint to a length n byte array, big endian */
export function toUInt(v: bigint, n: number): Uint8Array {
	const out = new Uint8Array(n);
	let mv = v;
	for (let i = out.length - 1; i >= 0; i--) {
		out[i] = Number(mv & 0xFFn);
		mv >>= 8n;
	}
	if (mv != 0n)
		throw new Error(`${v} is too large to fit into ${n} byte(s) as requested`);
	return out;
}

/** convert a byte array to a uint, big endian */
export function fromUInt(b: Uint8Array): bigint {
	let out = 0n;
	for (let i = 0; i < b.length; i++)
		out <<= 8n, out |= BigInt(b[i]);
	return out;
}

/** read `count` bytes from `stream`, and returns them in an array */
export async function readStream(stream: Deno.Reader, count: number) {
	const out = new Uint8Array(count);
	let n = 0;
	while (n < count) {
		const read = await stream.read(out.subarray(n));
		if (read === null)
			return out.slice(0, n);
		n += read;
	}
	return out;
}
/** like readStream, but stops as soon as the stream doesn't match target, and returns null if it finishes and matches */
export async function matchStream(stream: Deno.Reader, target: Uint8Array) {
	const out = new Uint8Array(target.length);
	let n = 0;
	while (n < target.length) {
		const read = await stream.read(out.subarray(n));
		if (read === null)
			return out.slice(0, n);
		n += read;
		for (let i = n - read; i < n; i++)
			if (out[i] !== target[i])
				return out.slice(0, n);
	}
	return null;
}
