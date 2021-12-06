import { writeAllSync } from "./bytes.ts";

export function MkSource(name: string | [string], id?: bigint): [string] {
	const ids = id === undefined ? `` : ` ${id}`;
	const nms = typeof name === `string` ? name : name[0];
	return [nms + ids];
}

export function StyleSource(name: string[], code: string): [string] {
	return [`\x1b[${code}m${name[0]}\x1b[0m`];
}

export function Log(source: [string], ...data: unknown[]) {
	LogRaw(`${[source[0]]}`, ...data);
}

export function LogRaw(...data: unknown[]) {
	const out = data.map(i => typeof i === `string` ? i : Deno.inspect(i, {
		colors: !(Deno.noColor ?? false)
	})).join(` `);
	writeAllSync(Deno.stderr, new TextEncoder().encode(out + `\n`));
}
