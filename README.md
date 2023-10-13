Cloudflare Email Service
========================

This service provides a worker that sends emails via Cloudflare's integration
with MailChannels. This allows your other workers (local and deployed) or
external services to send emails via HTTP.

Getting Started
---------------

1. Run `npm install`
2. Update the custom domain route in `wrangler.toml` to the domain you wish
to use for the email service.
3. Update the `DKIM_DOMAIN` and `DKIM_SELECTOR` (if needed) vars in `wrangler.toml`
4. Run `npm run deploy`
5. Run `npm run reset-dkim` and create or update your DKIM TXT DNS record
6. Run `npm run reset-key` and save the `X-API-Key`
7. Create or update an existing SPF TXT record to contain `include:relay.mailchannels.net`.
For example `v=spf1 include:relay.mailchannels.net include:_spf.mx.cloudflare.net ~all`.
Multiple SPF records is invalid.

Using the Service
-----------------

You can use the service by adding a service binding to your client worker
and remove the custom domain route. This will be the most secure method,
since the service will only be accessible from the bound workers.

However, using bindings will not work when developing locally, since the email
service will not be running on Cloudflare's network. Therefore, I would recommend
using a custom domain route which allows for local development of other workers.

`workers.dev` domains can be used, however, DKIM and SPF will not be available,
and your emails more likely to be flagged as spam.

You can call the email service with a `POST` using the same body content as the
[MailChannels Transactional API](https://api.mailchannels.net/tx/v1/documentation)
and a `X-API-Key` header set to the generated API key from [Getting Started](#getting-started).
