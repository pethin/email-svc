Cloudflare Email Service
========================

This service provides a worker that sends emails via Cloudflare's integration
with MailChannels. This allows your other workers (local and deployed) or
external services to send emails.

Getting Started
---------------

1. Run `npm install`
2. Update the custom domain route in `wrangler.toml` to the domain you wish
to use for the email service.
3. Update the `DKIM_DOMAIN` and `DKIM_SELECTOR` (if needed) vars in `wrangler.toml`
4. Run `npm run deploy`
5. Run `npm run reset-dkim` and create or update your DKIM TXT DNS record
6. Run `npm run reset-key` and copy the `X-API-Key`
