# License Issuer — Server Options

The license issuer receives a Stripe `checkout.session.completed` webhook,
signs a license key with Ed25519, and delivers it to the customer.

Two deployment paths are documented here: **Cloudflare Worker** (recommended)
and **Local Machine + Cloudflare Tunnel**.

---

## Option A — Cloudflare Worker (recommended)

No server to maintain. Runs on Cloudflare's global edge, free tier covers
100k requests/day — several orders of magnitude above what a $2.99 indie app
will ever hit.

### Email delivery

You need a transactional email provider to send the license key. Options:

| Provider | Free tier | Setup effort |
|---|---|---|
| [Resend](https://resend.com) | 3k emails/month | Low — API key only |
| [SendGrid](https://sendgrid.com) | 100 emails/day | Low — API key only |
| [Mailgun](https://mailgun.com) | 1k emails/month (trial) | Low — API key only |

**Resend is the default** in this Worker (`src/index.ts`). Swap the
`sendLicenseEmail` function to switch providers.

### Secrets

Three secrets must be set via `wrangler secret put` before deploying.

#### 1. `LICENSE_SIGNING_PRIVATE_KEY`

Generate the Ed25519 keypair (one-time):

```bash
node -e "
const { generateKeyPairSync } = require('crypto');
const { publicKey, privateKey } = generateKeyPairSync('ed25519');
const pub  = publicKey.export({ type: 'spki',  format: 'der' }).subarray(-32);
const priv = privateKey.export({ type: 'pkcs8', format: 'der' }).subarray(-32);
console.log('PUBLIC  (paste into LicenseManager.swift):', pub.toString('base64'));
console.log('PRIVATE (wrangler secret):', priv.toString('base64'));
"
```

- Paste the **PUBLIC** value into `LicenseManager.swift` → `signingPublicKeyBase64`
- Use the **PRIVATE** value as this secret
- Store both somewhere safe (1Password, etc.) — losing the private key means
  you cannot reissue licenses without also shipping a new public key in the app

#### 2. `STRIPE_WEBHOOK_SECRET`

1. Stripe Dashboard → Developers → Webhooks → **Add endpoint**
2. URL: `https://license-issuer.<your-subdomain>.workers.dev/stripe-webhook`
3. Event: `checkout.session.completed`
4. After saving → click the endpoint → **Signing secret** → Reveal
5. Starts with `whsec_`

For local dev (`wrangler dev`), run `stripe listen` instead:
```bash
stripe listen --forward-to localhost:8787/stripe-webhook
# prints a whsec_... to use in .dev.vars
```

#### 3. `RESEND_API_KEY`

1. Sign up at [resend.com](https://resend.com)
2. Dashboard → API Keys → Create API Key
3. Starts with `re_`
4. Verify your sending domain (e.g. `gettappit.com`) under Domains —
   required before emails deliver to real inboxes

### Deploy

```bash
cd workers/license-issuer
npm install

npx wrangler login
npx wrangler secret put LICENSE_SIGNING_PRIVATE_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put RESEND_API_KEY

npx wrangler deploy
```

### Local development

Create `.dev.vars` (gitignored) with dummy values:

```
LICENSE_SIGNING_PRIVATE_KEY=<base64 private key>
STRIPE_WEBHOOK_SECRET=<whsec_... from stripe listen>
RESEND_API_KEY=<re_...>
FROM_EMAIL=TappitX <support@gettappit.com>
SUPPORT_EMAIL=support@gettappit.com
```

```bash
npx wrangler dev          # starts Worker on :8787
stripe listen --forward-to localhost:8787/stripe-webhook
stripe trigger checkout.session.completed
```

---

## Option B — Local Machine + Cloudflare Tunnel

Run a Node.js server on your own machine and expose it publicly via
Cloudflare Tunnel (free, no port forwarding or static IP required).

> **Reliability warning:** if your machine sleeps or restarts, the webhook
> endpoint goes offline. Stripe will retry failed webhooks for 72 hours, but
> customers won't receive their key until your machine is back up.

### Expose the local server

Install `cloudflared`:
```bash
brew install cloudflare/cloudflare/cloudflared
```

Quick ephemeral tunnel (URL changes on restart — fine for testing):
```bash
cloudflared tunnel --url http://localhost:3000
```

Persistent named tunnel (same URL every time — needed for production):
```bash
cloudflared login
cloudflared tunnel create license-issuer
cloudflared tunnel route dns license-issuer licenses.gettappit.com
cloudflared tunnel run license-issuer
```

### Email delivery from a local server

Use **Nodemailer** with your existing email account — no new service required.

#### Gmail SMTP (simplest)

1. Google Account → Security → **App Passwords** → create one for "Mail"
2. Install Nodemailer: `npm install nodemailer`
3. Send with:

```ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "support@gettappit.com",
    pass: "<app password>",   // not your real password
  },
});

await transporter.sendMail({
  from: '"TappitX" <support@gettappit.com>',
  to: customerEmail,
  subject: "Your TappitX license",
  text: `License key: ${licenseKey}`,
});
```

Gmail free tier allows ~500 emails/day — far more than needed.

#### Other SMTP options

| Provider | Free SMTP | Notes |
|---|---|---|
| iCloud Mail | Yes | Use an app-specific password |
| Zoho Mail | Yes | Free business email, custom domain |
| [Postal](https://postal.atech.media) | Self-hosted | Full mail server, heavy to run |
| [Stalwart](https://stalw.art) | Self-hosted | Modern, lighter than Postal |
| [Mailpit](https://mailpit.axllent.org) | Local only | Dev inbox UI, not for production |

### Self-hosted vs. managed trade-off

| | Cloudflare Worker | Local Machine |
|---|---|---|
| Uptime | 99.99% (Cloudflare SLA) | Depends on your machine |
| Cost | Free | Free (electricity) |
| Maintenance | None | OS updates, tunnel restarts |
| Email | Requires provider account | Can use existing Gmail |
| Setup time | ~30 min | ~1–2 hours |

For a solo indie app, the Cloudflare Worker path has significantly less
operational overhead. The local machine path makes sense if you already
have infrastructure running 24/7 or want full data control.
