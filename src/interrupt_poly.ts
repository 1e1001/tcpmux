export default function Listener(f: Deno.Signal, c: () => void) {
	if (Deno.build.os !== `windows`)
		Deno.addSignalListener(f, c);
}
