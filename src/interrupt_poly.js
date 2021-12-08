if (Deno.build.os === `windows`) {
	Deno.addSignalListener = function() {}
}
