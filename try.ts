
export async function TryAsync<T, R>(fn: () => T | Promise<T>, ct: (e: unknown) => R | Promise<R>) {
	try {
		return await fn();
	} catch (e) {
		return await ct(e);
	}
}

export function Try<T, R>(fn: () => T, ct: (e: unknown) => R) {
	try {
		return fn();
	} catch (e) {
		return ct(e);
	}
}
