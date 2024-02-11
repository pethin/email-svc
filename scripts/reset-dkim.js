import { spawnSync } from 'node:child_process';
import { webcrypto } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import toml from 'toml';

const { publicKey, privateKey } = await webcrypto.subtle.generateKey(
	{
		name: 'RSASSA-PKCS1-v1_5',
		modulusLength: 2048,
		publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
		hash: 'SHA-256'
	},
	true,
	['sign', 'verify']
);

const publicKeyBuffer = await webcrypto.subtle.exportKey('spki', publicKey);
const privateKeyBuffer = await webcrypto.subtle.exportKey('pkcs8', privateKey);

const dkimPublicKey = Buffer.from(publicKeyBuffer).toString('base64');
const dkimPrivateKey = Buffer.from(privateKeyBuffer).toString('base64');

const wranglerTomlPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'wrangler.toml');
const wranglerToml = toml.parse(readFileSync(wranglerTomlPath, { encoding: 'utf-8' }));

const dkimDomain = wranglerToml['vars']['DKIM_DOMAIN'];
const dkimSelector = wranglerToml['vars']['DKIM_SELECTOR'];

const wrangler = spawnSync('npm', ['exec', '--', 'wrangler', 'secret', 'put', 'DKIM_PRIVATE_KEY'], {
	input: dkimPrivateKey,
	encoding: 'utf-8'
});
if (wrangler.status !== 0) {
	console.error(`Error setting private key secret.\n${wrangler.output[2]}`);
	process.exit(wrangler.status);
}

console.log(`Worker DKIM_PRIVATE_KEY has been updated.`);
console.log(`Add this DNS record to '${dkimDomain}':\n`);

console.log(`${dkimSelector}._domainkey IN TXT "v=DKIM1; k=rsa; p=${dkimPublicKey}"`);
