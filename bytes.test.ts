import { assertEquals, assertThrows } from "https://deno.land/std@0.116.0/testing/asserts.ts";
import { StringReader } from "https://deno.land/std@0.116.0/io/readers.ts";
import * as Bytes from "./bytes.ts";

Deno.test(`toUInt valid`, () => {
	const res = Bytes.toUInt(0x123456789ABCDEFn, 8);
	assertEquals(res, new Uint8Array([0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF]));
});

Deno.test(`toUInt invalid`, () => {
	assertThrows(() => {
		Bytes.toUInt(0x123456789ABCDEFn, 7);
	}, Error, `81985529216486895 is too large to fit into 7 byte(s) as requested`);
});

Deno.test(`fromUInt`, () => {
	const res = Bytes.fromUInt(new Uint8Array([0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF]));
	assertEquals(res, 0x123456789ABCDEFn);
});
Deno.test(`readStream full`, async () => {
	const test = new StringReader("asdasdasd");
	const read = await Bytes.readStream(test, 8);
	assertEquals(read, new Uint8Array([0x61, 0x73, 0x64, 0x61, 0x73, 0x64, 0x61, 0x73]));
});
Deno.test(`readStream early-cut`, async () => {
	const test = new StringReader("asdasd");
	const read = await Bytes.readStream(test, 8);
	assertEquals(read, new Uint8Array([0x61, 0x73, 0x64, 0x61, 0x73, 0x64]));
});
Deno.test(`matchStream match`, async () => {
	const test = new StringReader("asdasdasd");
	const read = await Bytes.matchStream(test, new Uint8Array([0x61, 0x73, 0x64, 0x61, 0x73, 0x64, 0x61, 0x73]));
	assertEquals(read, null);
});
Deno.test(`matchStream mismatch`, async () => {
	const test = new StringReader("asdaddasd");
	const read = await Bytes.matchStream(test, new Uint8Array([0x61, 0x73, 0x64, 0x61, 0x73, 0x64, 0x61, 0x73]));
	assertEquals(read, new Uint8Array([0x61, 0x73, 0x64, 0x61, 0x64, 0x64, 0x61, 0x73]));
});
Deno.test(`matchStream early-cut match`, async () => {
	const test = new StringReader("asdasd");
	const read = await Bytes.matchStream(test, new Uint8Array([0x61, 0x73, 0x64, 0x61, 0x73, 0x64, 0x61, 0x73]));
	assertEquals(read, new Uint8Array([0x61, 0x73, 0x64, 0x61, 0x73, 0x64]));
});
Deno.test(`matchStream early-cut mismatch`, async () => {
	const test = new StringReader("asdadd");
	const read = await Bytes.matchStream(test, new Uint8Array([0x61, 0x73, 0x64, 0x61, 0x73, 0x64, 0x61, 0x73]));
	assertEquals(read, new Uint8Array([0x61, 0x73, 0x64, 0x61, 0x64, 0x64]));
});
