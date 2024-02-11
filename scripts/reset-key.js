import { spawnSync } from 'node:child_process';
import { genKey } from './gen-key.js';
const key = genKey()

const wrangler = spawnSync('npm', ['exec', '--', 'wrangler', 'secret', 'put', 'API_KEY'], {
	input: key,
	encoding: 'utf-8'
});
if (wrangler.status !== 0) {
	console.error(`Error setting private key secret.\n${wrangler.output[2]}`);
	process.exit(wrangler.status);
}

console.log('Worker API_KEY has been updated.\n')
console.log(`X-API-Key: ${key}`);
