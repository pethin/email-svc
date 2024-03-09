import { spawnSync } from 'node:child_process';
import { genKey } from './gen-key.js';
import { createRequire } from 'node:module';
const key = genKey()

const require = createRequire(import.meta.url)
const wrangler = require.resolve('wrangler/bin/wrangler.js')
const wranglerResult = spawnSync(process.argv[0], [wrangler, 'secret', 'put', 'API_KEY'], {
	input: key,
	encoding: 'utf-8'
});
if (wranglerResult.status !== 0) {
	console.error(`Error setting private key secret.\n${wranglerResult.output[2]}`);
	process.exit(wranglerResult.status);
}

console.log('Worker API_KEY has been updated.\n')
console.log(`X-API-Key: ${key}`);
