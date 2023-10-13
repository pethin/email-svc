import { spawn, spawnSync } from 'node:child_process';

const genrsa = spawnSync('openssl', ['genrsa', '2048']);
if (genrsa.status !== 0) {
	console.error(`Error generating private key. ${genrsa.output[2].toString()}`);
	process.exit(genrsa.status);
}

const rsapem = (genrsa.output[1].toString());

const privder = spawnSync('openssl', ['rsa', '-outform', 'der'], {
	input: rsapem
});
if (privder.status !== 0) {
	console.error(`Error generating private key. ${privder.output[2].toString()}`);
	process.exit(privder.status);
}

const privkeybase64 = spawnSync('openssl', ['base64', '-A'], {
	input: privder.output[1],
	encoding: 'utf-8'
});
if (privkeybase64.status !== 0) {
	console.error(`Error generating private key. ${privkeybase64.output[2]}`);
	process.exit(privkeybase64.status);
}

const dkimPrivateKey = privkeybase64.output[1];

const pubder = spawnSync('openssl', ['rsa', '-pubout', '-outform', 'der'], {
	input: rsapem
});
if (pubder.status !== 0) {
	console.error(`Error generating public key. ${pubder.output[2].toString()}`);
	process.exit(pubder.status);
}

const pubkeybase64 = spawnSync('openssl', ['base64', '-A'], {
	input: pubder.output[1],
	encoding: 'utf-8'
});
if (pubkeybase64.status !== 0) {
	console.error(`Error generating public key. ${pubkeybase64.output[2]}`);
	process.exit(pubkeybase64.status);
}

const dkimPublicKey = pubkeybase64.output[1];

const wrangler = spawnSync('npm', ['exec', 'wrangler', 'secret', 'put', 'DKIM_PRIVATE_KEY'], {
	input: dkimPrivateKey,
	encoding: 'utf-8'
});
if (wrangler.status !== 0) {
	console.error(`Error setting private key secret. ${wrangler.output[2]}`);
	process.exit(wrangler.status);
}

console.log(`\nDKIM_PRIVATE_KEY: ${dkimPrivateKey}`);
console.log(`\nDKIM_SELECTOR._domainkey IN TXT "v=DKIM1; k=rsa; p=${dkimPublicKey}"`);
