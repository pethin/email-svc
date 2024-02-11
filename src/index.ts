export interface Env {
	API_KEY?: string;
	DKIM_DOMAIN?: string;
	DKIM_SELECTOR?: string;
	DKIM_PRIVATE_KEY?: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (!env.API_KEY) {
			throw new Error('Missing API_KEY configuration');
		}

		if (!env.DKIM_DOMAIN) {
			throw new Error('Missing DKIM_DOMAIN configuration');
		}

		if (!env.DKIM_SELECTOR) {
			throw new Error('Missing DKIM_SELECTOR configuration');
		}

		if (!env.DKIM_PRIVATE_KEY) {
			throw new Error('Missing DKIM_PRIVATE_KEY configuration');
		}

		const encoder = new TextEncoder();
		const expected = encoder.encode(env.API_KEY);

		if (expected.length < 32) {
			throw new Error('Invalid API_KEY configuration');
		}

		if (request.method !== 'POST') {
			return new Response(JSON.stringify({
				'errors': [
					'not found'
				]
			}), {
				status: 404
			});
		}

		const apiKey = request.headers.get('X-API-Key');
		if (apiKey == null) {
			return new Response(JSON.stringify({
				'errors': [
					'Missing X-API-Key header'
				]
			}), {
				status: 401
			});
		}

		const actual = encoder.encode(apiKey);

		let equal = false;
		try {
			// @ts-ignore
			equal = crypto.subtle.timingSafeEqual(expected, actual);
		} catch {
		}

		if (!equal) {
			return new Response(JSON.stringify({
				'errors': [
					'Invalid X-API-Key'
				]
			}), {
				status: 401
			});
		}

		const sourceUrl = new URL(request.url);
		const queryParams = sourceUrl.searchParams;

		const payload = await request.json() as unknown as any;
		if (payload['personalizations'] != null) {
			for (const personalization of payload['personalizations']) {
				personalization['dkim_domain'] ??= env.DKIM_DOMAIN;
				personalization['dkim_selector'] ??= env.DKIM_SELECTOR;
				personalization['dkim_private_key'] ??= env.DKIM_PRIVATE_KEY;
			}
		}

		const sendEmailRequest = new Request(`https://api.mailchannels.net/tx/v1/send?${queryParams.toString()}`, {
			'method': 'POST',
			'headers': {
				'content-type': 'application/json'
			},
			'body': JSON.stringify(payload)
		});

		const response = await fetch(sendEmailRequest);
		if (response.status === 202) {
			return new Response(JSON.stringify({
				data: null
			}), {
				status: 202
			});
		}

		return response;
	}
};
