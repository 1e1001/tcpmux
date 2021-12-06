import { Listen, Connect } from "./conn.ts";
import { delay } from "https://deno.land/std@0.116.0/async/delay.ts"

Deno.test("listener", async () => {
	const listener = Listen({
		addr: `0.0.0.0`,
		port: 12345,
		async handle() {
			await delay(1000);
		}
	});
	await delay(200);
	const conn = await Connect({
		addr: `127.0.0.1`,
		port: 12345
	});
	await delay(200);
	await listener.close();
	conn.close();
});
