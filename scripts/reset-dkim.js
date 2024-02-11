import { spawnSync } from 'node:child_process';
import { generateKeyPairSync } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import toml from 'toml'

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
	modulusLength: 2048,
	publicKeyEncoding: {
		type: 'spki',
		format: 'der',
	},
	privateKeyEncoding: {
		type: 'pkcs8',
		format: 'der',
	},
});

const dkimPublicKey = publicKey.toString('base64');
const dkimPrivateKey = privateKey.toString('base64');

const wranglerTomlPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'wrangler.toml');
const wranglerToml = toml.parse(readFileSync(wranglerTomlPath, { encoding: 'utf-8' }));

const dkimDomain = wranglerToml['vars']['DKIM_DOMAIN']
const dkimSelector = wranglerToml['vars']['DKIM_SELECTOR']

const wrangler = spawnSync('npm', ['exec', '--', 'wrangler', 'secret', 'put', 'DKIM_PRIVATE_KEY'], {
	input: dkimPrivateKey,
	encoding: 'utf-8'
});
if (wrangler.status !== 0) {
	console.error(`Error setting private key secret.\n${wrangler.output[2]}`);
	process.exit(wrangler.status);
}

console.log(`Worker DKIM_PRIVATE_KEY has been updated.`)
console.log(`Add this DNS record to '${dkimDomain}':\n`)

console.log(`${dkimSelector}._domainkey IN TXT "v=DKIM1; k=rsa; p=${dkimPublicKey}"`);
