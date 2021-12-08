import { assertEquals, assertThrows } from "https://deno.land/std@0.116.0/testing/asserts.ts";
import {ParseConfig} from "./parser.ts";

Deno.test("parsing valid", () => {
	const parse = ParseConfig(`
		AlwaysSendHeader = false
		127.0.0.1:8081!52 < :8082
		# comment
		127.0.0.1:8081!52 > :8080
		:8080 > example.com:443!0
	`, false);
	assertEquals(parse, {
		alwaysSendHeader: false,
		conns: [
			{type: 0, lPort: 8082, rAddr: "127.0.0.1", rPort: 8081, rsp: 52n},
			{type: 1, lPort: 8080, rAddr: "127.0.0.1", rPort: 8081, rsp: 52n},
			{type: 0, lPort: 8080, rAddr: "example.com", rPort: 443, rsp: 0n},
		],
		dry: false
	})
});

Deno.test("parsing invalid line", () => {
	assertThrows(() => {
		ParseConfig(`
			AlwaysSendHeader = false
			127.0.0.1:8081!52 < :8082
			# comment
			this line is invalid
			127.0.0.1:8081!52 > :8080
			example.com:443!0 < :8080
		`, false);
	}, Error, `Failed to parse configuration, line 5: invalid content\nOffending line: this line is invalid`);
});

Deno.test("parsing invalid lPort", () => {
	assertThrows(() => {
		ParseConfig(`
			AlwaysSendHeader = false
			127.0.0.1:8081!52 < :8082
			# comment
			127.0.0.1:8081!52 > :8080
			example.com:443!0 < :99999
		`, false);
	}, Error, `Failed to parse configuration, line 6: lPort: expected 0-65535, got 99999\nOffending line: example.com:443!0 < :99999`);
});

Deno.test("parsing invalid rPort", () => {
	assertThrows(() => {
		ParseConfig(`
			AlwaysSendHeader = false
			127.0.0.1:8081!52 < :8082
			# comment
			127.0.0.1:8081!52 > :8080
			example.com:99999!0 < :8080
		`, false);
	}, Error, `Failed to parse configuration, line 6: rPort: expected 0-65535, got 99999\nOffending line: example.com:99999!0 < :8080`);
});

Deno.test("parsing invalid rsp", () => {
	assertThrows(() => {
		ParseConfig(`
			AlwaysSendHeader = false
			127.0.0.1:8081!52 < :8082
			# comment
			127.0.0.1:8081!52 > :8080
			example.com:443!99999999999999999999 < :8080
		`, false);
	}, Error, `Failed to parse configuration, line 6: rsp: expected 0-18446744073709551616, got 99999999999999999999\nOffending line: example.com:443!99999999999999999999 < :8080`);
});

Deno.test("parsing invalid config key", () => {
	assertThrows(() => {
		ParseConfig(`
			InvalidKey = false
			127.0.0.1:8081!52 < :8082
			# comment
			127.0.0.1:8081!52 > :8080
			example.com:443!0 < :8080
		`, false);
	}, Error, `Failed to parse configuration, line 2: invalid config key "InvalidKey"\nOffending line: InvalidKey = false`);
});

Deno.test("parsing invalid config value", () => {
	assertThrows(() => {
		ParseConfig(`
			Dry = InvalidValue
			127.0.0.1:8081!52 < :8082
			# comment
			127.0.0.1:8081!52 > :8080
			example.com:443!0 < :8080
		`, false);
	}, Error, `Failed to parse configuration, line 2: invalid config value "InvalidValue" for key "Dry"\nOffending line: Dry = InvalidValue`);
});
