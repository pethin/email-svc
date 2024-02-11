Cloudflare Email Service
========================

This service provides a worker that sends emails via Cloudflare's integration
with MailChannels. This allows your other workers (local and deployed) or
external services to send emails via HTTP.

Requirements
------------
* Cloudflare account
* Wrangler CLI authenticated
* OpenSSL

Getting Started
---------------
1. Run `npm install`
2. Update the custom domain route in `wrangler.toml` to the domain you wish
to use for the email service.
3. Update the `DKIM_DOMAIN` and `DKIM_SELECTOR` vars in `wrangler.toml`
4. Run `npm run deploy` to deploy the worker
5. Run `npm run reset-dkim` and create or update your DKIM TXT DNS record
6. Run `npm run reset-key` and save the `X-API-Key`
7. Create or update an existing SPF TXT record to contain `include:relay.mailchannels.net`.
For example `v=spf1 include:relay.mailchannels.net include:_spf.mx.cloudflare.net ~all`.
Having multiple TXT SPF records is invalid.

Using the Service
-----------------
You can use the service by adding a service binding to your client worker
and remove the custom domain route. This will be the most secure method,
since the service will only be accessible from the bound workers.

However, using bindings will not work when developing other workers locally.
Therefore, it's recommend using a custom domain route which allows for local
development of other workers.

When submitting requests, you can add the query parameter `/?dry-run=true`.
This will test the API and can be used for testing without sending emails.

`workers.dev` domains can be used, however, DKIM and SPF will not be available,
and your emails are likely to be flagged as spam.

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

{
  "from": {
    "email": "test@example.com”,
    "name": “Test Sender”
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
      ],
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
