Cloudflare Email Service
========================

This service provides a worker that sends emails via Cloudflare's integration
with MailChannels. This allows your other workers (local and deployed) or
external services to send emails via HTTP.

Requirements
------------
* Cloudflare account
* Wrangler CLI authenticated

Getting Started
---------------
1. Run `npm install`
2. (Optional) Add a custom domain route in `wrangler.toml` to the a domain you wish
to use for the email service.
   - This domain is for the worker service and can be different than your outgoing email address domain.
3. Update the `DKIM_DOMAIN` and `DKIM_SELECTOR` vars in `wrangler.toml`
   - `DKIM_DOMAIN` is the outgoing email domain
   - `DKIM_SELECTOR` will be the prefix to your `_domainkey` TXT record
   - The TXT DKIM DNS record will be at `[DKIM_SELECTOR]._domainkey.[DKIM_DOMAIN].`
4. Run `npm run deploy` to deploy the worker
5. Run `npm run reset-dkim` and create or update your DKIM TXT DNS record
6. Run `npm run reset-key` and save the `X-API-Key`
7. Create or update an existing SPF TXT record to contain `include:relay.mailchannels.net`.
   - For example `[DKIM_DOMAIN]. 1 IN TXT "v=spf1 include:relay.mailchannels.net include:_spf.mx.cloudflare.net ~all"`.
   - Having multiple TXT SPF records is invalid. You must combine an existing SPF record using multiple `include:`.
8. Create a `_mailchannels` TXT [DomainLockdown Record](https://support.mailchannels.com/hc/en-us/articles/16918954360845-Secure-your-domain-name-against-spoofing-with-Domain-Lockdown)
   - **NOTE**: the `cfid` is the domain that your worker is running under. It can be different than the DKIM and SPF domain, which is the domain of outgoing emails.
   - For example `_mailchannels.[DKIM_DOMAIN]. 1 IN TXT "v=mc1 cfid=[YOUR_WORKERS_DEV_DOMAIN].workers.dev"`
   - The `cfid` does not include the subdomain of the worker.

Using the Service
-----------------
When submitting requests, you can add the query parameter `/?dry-run=true`.
This will test the API and can be used for testing without sending emails.

`workers.dev` domains can be used to host your worker. However, you can not use that domain for your outgoing email
address since DKIM and SPF will not be available.

You can call the email service with a `POST` using the same body content as the
[MailChannels Transactional API](https://api.mailchannels.net/tx/v1/documentation)
and a `X-API-Key` header set to the generated API key from [Getting Started](#getting-started).
DKIM parameters will automatically be added.

Example Request
---------------
```http request
POST /?dry-run=false
Host: mailchannels.example.com
Content-Type: application/json
X-API-Key: YOURGENERATEDKEY

{
  "from": {
    "email": "test@example.com",
    "name": "Test Sender"
  },
  "replyTo": {
    "email": "support@example.com",
    "name": "Example Support"
  },
  "personalizations": [
    {
      "to": [
        {
          "email": "recipient@example.com",
          "name": "Test Recipient"
        }
      ],
      "bcc": [
        {
          "email": "bccrecipient@example.com",
          "name": "Test BCC Recipient"
        }
      ],
      "cc": [
        {
          "email": "ccrecipient@example.com",
          "name": "Test CC Recipient"
        }
      ]
    }
  ],
  "subject": "Example Email",
  "content": [
    {
      "type": "text/plain",
      "value": "Text message content"
    }
  ]
}
```
