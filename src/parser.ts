import {ConnectionOpts, GlobalOpts} from "./types.ts"
import { Log, MkSource, StyleSource } from "./log.ts";

const logSource = StyleSource(MkSource(`Parser`), `35;1`);

// addr:port!rsp <> :port
/*
 * addr 1,5 (.*)
 * port 2,6 :([0-9]{1,5})
 * subp 3,7 (?:!([0-9]{1,20}))?
 * dir 4
 */
const configRegex = /^(.*):([0-9]{1,5})(?:!([0-9]{1,20}))?\W*(>|<)\W*(.*):([0-9]{1,5})(?:!([0-9]{1,20}))?$/;
// key = value
const setting = /^([A-Za-z0-9]+)\W*=\W*(.+)$/;

type Option<T> = [T] | [];
type MappingFunction = (v: string) => Option<unknown>;
type ConfigKeyType = "dry";

const configKeyMapping: Record<ConfigKeyType, MappingFunction> = {
	"dry": MapConfigValueBool
}

function MapConfigKey(value: string): Option<[ConfigKeyType, MappingFunction]> {
	const entries = Object.entries(configKeyMapping) as [ConfigKeyType, MappingFunction][];
	const found = entries.find(i => i[0].toLowerCase() === value.toLowerCase());
	if (found)
		return [found];
	return [];
}

function MapConfigValueBool(value: string): Option<boolean> {
	if ([`yes`, `y`, `true`, `on`].includes(value))
		return [true];
	if ([`no`, `n`, `false`, `off`].includes(value))
		return [false];
	return [];
}

export function ParseConfig(text: string, log: boolean) {
	const lines = text.split(`\n`);
	const opts: GlobalOpts = {
		dry: false,
		conns: [],
	};
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (line === `` || line.startsWith("#"))
			continue;
		const prefix = `Failed to parse configuration, line ${i + 1}: `;
		const suffix = `\nOffending line: ${line}`;
		const exec1 = configRegex.exec(line);
		if (exec1 !== null) {
			if ((exec1[1] + exec1[5]).split(`:`).length > 1)
				throw new Error(prefix + `invalid character ':' in addr` + suffix);
			const conn: ConnectionOpts = {
				incoming: {
					port: parseInt(exec1[2]),
					addr: exec1[1],
					subport: exec1[3] ? BigInt(exec1[3]) : null
				},
				outgoing: {
					port: parseInt(exec1[6]),
					addr: exec1[5],
					subport: exec1[7] ? BigInt(exec1[7]) : null
				},
			};
			if (isNaN(conn.incoming.port))
				throw new Error(prefix + `in port: invalid number ${exec1[2]}` + suffix);
			if (isNaN(conn.outgoing.port))
				throw new Error(prefix + `out port: invalid number ${exec1[6]}` + suffix);
			if (conn.incoming.port < 0 || conn.incoming.port > 65535)
				throw new Error(prefix + `in port: expected 0-65535, got ${conn.incoming.port}` + suffix);
			if (conn.outgoing.port < 0 || conn.outgoing.port > 65535)
				throw new Error(prefix + `out port: expected 0-65535, got ${conn.outgoing.port}` + suffix);
			if ((conn.incoming.subport ?? 0n) < 0n || (conn.incoming.subport ?? 0n) > 18446744073709551615n)
				throw new Error(prefix + `in subport: expected 0-18446744073709551615, got ${conn.incoming.subport}` + suffix);
			if ((conn.outgoing.subport ?? 0n) < 0n || (conn.outgoing.subport ?? 0n) > 18446744073709551615n)
				throw new Error(prefix + `out subport: expected 0-18446744073709551615, got ${conn.incoming.subport}` + suffix);
			opts.conns.push(conn);
			continue;
		}
		const exec2 = setting.exec(line);
		if (exec2 !== null) {
			const key = exec2[1];
			const value = exec2[2];
			const mappedKey = MapConfigKey(key);
			if (mappedKey.length === 0)
				throw new Error(prefix + `invalid config key ${JSON.stringify(key)}` + suffix);
			const mappedValue = mappedKey[0][1](value);
			if (mappedValue.length === 0)
				throw new Error(prefix + `invalid config value ${JSON.stringify(value)} for key ${JSON.stringify(key)}` + suffix);
			(opts as unknown as Record<string, unknown>)[mappedKey[0][0]] = mappedValue[0];
			if (log)
				Log(logSource, mappedKey[0][0], `=`, mappedValue[0]);
			continue;
		}
		throw new Error(prefix + `invalid content` + suffix);
	}
	return opts;
}
