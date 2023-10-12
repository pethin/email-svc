import { spawn, spawnSync } from 'node:child_process';

const genKey = spawnSync('npm', ['run', '--silent', 'gen-key'], { encoding: 'utf-8' });
if (genKey.status !== 0) {
	console.error(`Error generating key. ${genKey.output[2]}`);
	process.exit(genKey.status);
}

const key = (genKey.output[1].trim());

const wrangler = spawn('npm', ['run', '--silent', 'update-key']);
wrangler.stdout.pipe(process.stdout);
wrangler.stderr.pipe(process.stderr);

wrangler.stdin.write(key);
wrangler.stdin.end();

await new Promise((resolve) => {
	wrangler.on('close', (code) => {
		resolve()
	})
});

console.log(`\nAPI_KEY: ${key}`);
