// import { StartClients } from "./client.ts";
import { StartServers } from "./server.ts";
import { ParseConfig } from "./parser.ts";
import { GlobalData } from "./types.ts";
import { Listener } from "./conn.ts";
import { Try, TryAsync } from "./try.ts";
import { Log, MkSource, StyleSource, StyleStr } from "./log.ts";
import Interrupt from "./interrupt_poly.ts";

const logSource = StyleSource(MkSource(`Daemon`), `33;1`);
const configPath = Deno.args[0];
if (!configPath)
	throw new Error(`No config path specified`);
console.log();
// this gets replaced with the git commit id during compilation
const version = ` [[TCPMUX_VERSION]]`;
Log(logSource, `${StyleStr(`TCPmux`, `1`)}${version[1] === `[` ? `` : version} starting`);

const globalData: GlobalData = {
	inc: 0n,
	configPath,
	killTimeout: 1000
};
const listeners: Listener[] = [];
Log(logSource, `Loading configuration`);
const watcher = Try(
	() => Deno.watchFs(globalData.configPath),
	FailedToLoadConfigError
);
Main();
async function Main() {
	if (watcher !== null) {
		let lastUpdateTimeout = -1;
		await Run(false);
		Interrupt(`SIGINT`, async () => {
			console.log();
			Log(logSource, `Shutting down`);
			setTimeout(() => {
				const timeoutSeconds = globalData.killTimeout / 1000;
				Log(logSource, `Waiting`, timeoutSeconds, `second${timeoutSeconds === 1 ? `` : `s`} for existing connections`);
			}, globalData.killTimeout / 10);
			const timeout = setTimeout(() => {
				Log(logSource, `Connections did not close! Force quitting`);
				Deno.exit(0);
			}, globalData.killTimeout);
			await Kill();
			clearTimeout(timeout);
			Log(logSource, `All done`);
			Deno.exit(0);
		});
		for await (const _ of watcher) {
			if (lastUpdateTimeout >= 0)
				clearTimeout(lastUpdateTimeout);
			else
				Log(logSource, `Configuration updated! Will reload shortly`);
			lastUpdateTimeout = setTimeout(async () => {
				lastUpdateTimeout = -1;
				await Run(true);
			}, 100);
		}
	}
}
function FailedToLoadConfigError(error: unknown) {
	Log(logSource, `Failed to load configuration from ${globalData.configPath}`);
	console.log(error);
	console.log();
	return null;
}
async function Kill() {
	if (listeners.length > 0) {
		Log(logSource, `Closing listeners`);
		try {
			await Promise.all(listeners.map(i => i.close()));
		} catch (error) {
			Log(logSource, `Failed to close listeners`);
			console.log(error);
			console.log();
		}
		listeners.splice(0, listeners.length);
	}
}
async function Run(reload: boolean) {
	if (reload)
		Log(logSource, `Reloading configuration`);
	const content = await TryAsync(
		() => Deno.readTextFile(globalData.configPath),
		FailedToLoadConfigError
	);
	// console.log([content]);
	await Kill();
	if (content === null)
		return;
	const config = Try(
		() => ParseConfig(content, true),
		error => {
			Log(logSource, `Failed to parse configuration file from ${globalData.configPath}`);
			console.log(error);
			console.log();
			return null;
		});
	if (config === null)
		return;
	listeners.push(
		...StartServers(config, globalData)
		// ...StartClients(config, globalData)
	);
	Log(logSource, `Configuration loaded,`, listeners.length, `listener${listeners.length === 1 ? `` : `s`} running`);
}
