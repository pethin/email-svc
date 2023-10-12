import { webcrypto } from 'node:crypto';

const chars = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';

function toBase(input, base = 94) {
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

export function genKey(bytes = 128) {
	const keyBytes = new Uint8Array(bytes);
	webcrypto.getRandomValues(keyBytes);

	return toBase(keyBytes);
}

console.log(genKey());
