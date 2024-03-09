import { webcrypto } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';

function toBase(input, base = chars.length) {
	const outData = [];

	const inData = BigInt(input.join(''));
	let d = inData % BigInt(base);
	let r = inData / BigInt(base);
	outData.push(chars[d]);
	while (r) {
		d = r % BigInt(base);
		r = r / BigInt(base);
		outData.push(chars[d]);
	}

	return outData.join('');
}

export function genKey(bytes = 256) {
	const keyBytes = new Uint8Array(bytes);
	webcrypto.getRandomValues(keyBytes);

	return toBase(keyBytes);
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
	console.log(`X-API-Key: ${genKey()}`);
}
