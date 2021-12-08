import { writeAllSync } from "./bytes.ts";

export function MkSource(name: string | [string], id?: bigint): [string] {
	const ids = id === undefined ? `` : ` ${id}`;
	const nms = typeof name === `string` ? name : name[0];
	return [nms + ids];
}

export function StyleSource(name: [string], code: string): [string] {
	return [StyleStr(name[0], code)];
}
export function StyleStr(text: string, code: string): string {
	if (Deno.noColor)
		return text;
	return `\x1b[${code}m${text}\x1b[0m`;
}

export function Log(source: [string], ...data: unknown[]) {
	LogRaw(`[${[source[0]]}]`, ...data);
}

export function LogRaw(...data: unknown[]) {
	const out = data.map(i => typeof i === `string` ? i : Deno.inspect(i, {
		colors: !Deno.noColor
	})).join(` `);
	writeAllSync(Deno.stderr, new TextEncoder().encode(out + `\n`));
}
