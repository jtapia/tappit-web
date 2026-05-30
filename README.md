# TappitX

Tap-to-click for Apple Magic Mouse. A lightweight macOS menu bar utility that converts surface taps into real mouse clicks — with pressure-sensitive right-clicks, configurable zones, haptic feedback, and per-app rules.

**Website**: Built with Next.js 16, Tailwind CSS 4, and Framer Motion. Static export for Cloudflare Pages.

## Features

**Core**: Tap-to-click (single & double), zone-based right-click, configurable sensitivity, battery monitoring, start on login.

**Pro**: Pressure-based right-click, middle-click center zone, per-app right-click rules, haptic & sound feedback, visual tap overlay, scroll customization, palm rejection.

## Tech Stack

- **Next.js 16** with App Router and static export (`output: "export"`)
- **React 19** + **TypeScript 5**
- **Tailwind CSS 4** with CSS custom properties for dark/light theming
- **Framer Motion 12** for scroll-triggered animations
- **Stripe Payment Links** for checkout (no backend required)

## Getting Started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # Static output in /out
```

## Deployment

Configured for Cloudflare Pages via `wrangler.toml`:

```bash
npm run build && npx wrangler pages deploy out
```

Or connect the repo in the Cloudflare Pages dashboard with:
- Build command: `npm run build`
- Output directory: `out`

## Stripe Setup

1. Create a Payment Link at [dashboard.stripe.com/payment-links](https://dashboard.stripe.com/payment-links)
2. Set `PURCHASE_URL` in `wrangler.toml`:
   ```toml
   [vars]
   PURCHASE_URL = "https://buy.stripe.com/your_link_here"
   ```
3. Deploy: `wrangler deploy`

The `useCtaHref()` hook reads `PURCHASE_URL` from the Worker at runtime — no rebuild needed to update the link.

## License Issuer Worker

A separate Cloudflare Worker at `license.gettappit.com` handles post-purchase license delivery and activation. Source lives in `workers/license-issuer/`.

**Endpoints:**

| Route | Description |
|-------|-------------|
| `POST /webhook` | Stripe webhook — creates and emails a license on successful payment |
| `GET /session/:id` | Returns masked purchase confirmation for the `/success` page |
| `POST /validate` | Validates a license key |
| `POST /activate` | Activates a license key against a device fingerprint |

**Required secrets** (set via `wrangler secret put` inside `workers/license-issuer/`):

| Secret | Description |
|--------|-------------|
| `LICENSE_SIGNING_PRIVATE_KEY` | Base64-encoded 32-byte Ed25519 seed |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
| `RESEND_API_KEY` | Resend API key for transactional email |

Deploy the worker separately:

```bash
cd workers/license-issuer
wrangler deploy
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout, metadata, theme anti-flash
│   ├── page.tsx            # Section composition with dynamic imports
│   ├── success/            # Post-purchase confirmation page (polls /session/:id)
│   └── globals.css         # Tailwind theme, animations, dark mode
├── components/
│   ├── Nav.tsx             # Fixed nav with mobile menu, theme toggle
│   ├── Hero.tsx            # Hero with Magic Mouse 2 SVG + floating card
│   ├── HowItWorks.tsx      # 3-step process explanation
│   ├── Comparison.tsx      # 3 differentiators vs physical clicking
│   ├── Signature.tsx       # Zone vs pressure right-click comparison
│   ├── UseCases.tsx        # 6 audience persona cards
│   ├── Features.tsx        # 12 capability cards (3-col grid)
│   ├── Lightweight.tsx     # Performance stats + compatibility matrix
│   ├── Privacy.tsx         # Zero data collection
│   ├── Pricing.tsx         # Free/Pro tiers with Stripe Payment Link
│   ├── FAQ.tsx             # 11 accordion items
│   ├── Download.tsx        # Final CTA
│   └── Footer.tsx          # Navigation + copyright
└── context/
    └── ThemeContext.tsx     # Light/dark toggle with localStorage

workers/
├── license-issuer/         # License delivery & activation Worker (license.gettappit.com)
│   └── src/
│       ├── index.ts        # Request router
│       └── handlers/
│           ├── webhook.ts  # Stripe webhook → license creation + email
│           ├── session.ts  # Masked session data for /success page
│           ├── validate.ts # License key validation
│           ├── activate.ts # Device activation
│           ├── shared.ts   # Shared request utilities
│           └── cors.ts     # CORS helper
└── tappit/                 # Main site Worker (gettappit.com)
```

## Environment Variables

**Main site Worker** (`wrangler.toml [vars]`):

| Variable | Description | Default |
|----------|-------------|---------|
| `PURCHASE_URL` | Stripe Payment Link URL; drives all buy/CTA buttons | `#pricing` |

**License-issuer Worker** (`workers/license-issuer/wrangler.toml [vars]`):

| Variable | Description |
|----------|-------------|
| `FROM_EMAIL` | Sender address for license emails |
| `SUPPORT_EMAIL` | Support address shown in license emails |

Secrets are never stored in `wrangler.toml` — set them with `wrangler secret put <NAME>`.

## License

All rights reserved.
