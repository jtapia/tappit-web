# License Endpoints Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stateless Stripe webhook in `workers/license-issuer/` with a KV-backed licensing service exposing `/webhook`, `/session/:id`, `/validate`, `/activate`, plus a `/success` page on the marketing site.

**Architecture:** Two Cloudflare Workers. `license-issuer` is refactored from one file into a router + per-endpoint handlers, backed by a `LICENSES` KV namespace storing primary records keyed by `sha256(rawLicenseKey)` and pointer records for session-id and signed-token lookups. Raw and signed license keys are stored only as SHA-256 hashes; plaintext lives only in the issuance email and the macOS keychain. The marketing site adds a static `/success` Next.js page that fetches a masked confirmation from `/session/:id` with polling fallback for the webhook race.

**Tech Stack:** TypeScript, Cloudflare Workers, Workers KV, `@noble/ed25519` + `@noble/hashes`, Stripe webhooks (manual HMAC verify), Next.js 15 static export, Resend.

**Reference spec:** `docs/superpowers/specs/2026-04-25-license-endpoints-design.md`

---

## File Structure

### `workers/license-issuer/` — refactored

| File | Responsibility |
|------|----------------|
| `src/index.ts` | Request router. Method + path → handler. CORS preflight. |
| `src/env.ts` | `Env` interface (bindings, secrets, vars). |
| `src/stripe.ts` | Stripe HMAC signature verification. |
| `src/license.ts` | Raw key generation, Ed25519 sign, hash, mask helpers. |
| `src/kv.ts` | Typed KV reads/writes for the three key schemas. |
| `src/email.ts` | Resend email send. |
| `src/handlers/webhook.ts` | `POST /webhook` (and legacy `/stripe-webhook`). |
| `src/handlers/session.ts` | `GET /session/:sessionId`. |
| `src/handlers/validate.ts` | `POST /validate`. |
| `src/handlers/activate.ts` | `POST /activate`. |
| `src/handlers/cors.ts` | CORS helpers shared across handlers. |
| `wrangler.toml` | Add `[[kv_namespaces]]` binding for `LICENSES`. |

### Marketing site

| File | Responsibility |
|------|----------------|
| `src/app/success/page.tsx` | Server-export-safe shell that renders the client component. |
| `src/app/success/SuccessClient.tsx` | Client component: parse `session_id`, fetch `/session/:id` with polling, render confirmation. |
| `src/app/success/success.module.css` | Page-scoped styling (matches existing site convention). |

### Stripe dashboard (manual, post-deploy)

- Webhook URL: change `…/stripe-webhook` → `…/webhook` after first deploy.
- Payment Link success URL: `https://gettappit.com/success?session_id={CHECKOUT_SESSION_ID}`.

---

## Task 0: Provision the KV namespace

**Files:**
- Modify: `workers/license-issuer/wrangler.toml`

- [ ] **Step 1: Create the production KV namespace**

Run from `workers/license-issuer/`:
```bash
npx wrangler kv namespace create LICENSES
```
Expected output includes a line like:
```
[[kv_namespaces]]
binding = "LICENSES"
id = "abc123def456..."
```
Copy the `id` value.

- [ ] **Step 2: Create the preview KV namespace (for `wrangler dev`)**

```bash
npx wrangler kv namespace create LICENSES --preview
```
Copy the `preview_id` value from the output.

- [ ] **Step 3: Add the binding to `wrangler.toml`**

Append to `workers/license-issuer/wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "LICENSES"
id = "<paste production id>"
preview_id = "<paste preview id>"
```

- [ ] **Step 4: Commit**

```bash
git add workers/license-issuer/wrangler.toml
git commit -m "chore(license-issuer): add LICENSES KV namespace binding"
```

---

## Task 1: Extract `Env` interface to its own module

**Files:**
- Create: `workers/license-issuer/src/env.ts`
- Modify: `workers/license-issuer/src/index.ts`

This is a no-behavior-change refactor that lets handlers import a typed `Env` without circular references back to `index.ts`.

- [ ] **Step 1: Create `src/env.ts`**

```ts
export interface Env {
  // Secrets
  LICENSE_SIGNING_PRIVATE_KEY: string; // base64, 32-byte Ed25519 seed
  STRIPE_WEBHOOK_SECRET: string;       // whsec_...
  RESEND_API_KEY: string;              // re_...

  // Vars
  FROM_EMAIL: string;
  SUPPORT_EMAIL: string;

  // Bindings
  LICENSES: KVNamespace;
}
```

- [ ] **Step 2: Replace the inline interface in `src/index.ts`**

In `workers/license-issuer/src/index.ts`, delete the current `export interface Env { ... }` block (lines 18–24) and add at the top of the file:
```ts
import type { Env } from "./env";
```

- [ ] **Step 3: Verify it still typechecks**

```bash
cd workers/license-issuer && npm run typecheck
```
Expected: exits 0 with no output.

- [ ] **Step 4: Commit**

```bash
git add workers/license-issuer/src/env.ts workers/license-issuer/src/index.ts
git commit -m "refactor(license-issuer): extract Env to its own module"
```

---

## Task 2: Extract Stripe verification to `stripe.ts`

**Files:**
- Create: `workers/license-issuer/src/stripe.ts`
- Modify: `workers/license-issuer/src/index.ts`

- [ ] **Step 1: Create `src/stripe.ts`**

Move the Stripe-related helpers out of `index.ts`. Create `workers/license-issuer/src/stripe.ts`:
```ts
export interface StripeEvent {
  type: string;
  data: { object: unknown };
}

export interface CheckoutSession {
  id: string;
  customer_details?: { email?: string | null };
}

const REPLAY_WINDOW_SEC = 300;

export async function verifyStripeWebhook(
  body: string,
  header: string,
  secret: string,
): Promise<StripeEvent | null> {
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const [k, ...rest] = p.split("=");
      return [k?.trim() ?? "", rest.join("=").trim()];
    }),
  );
  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return null;

  const eventAgeSec = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (!Number.isFinite(eventAgeSec) || eventAgeSec > REPLAY_WINDOW_SEC || eventAgeSec < -60) {
    return null;
  }

  const signedPayload = `${timestamp}.${body}`;
  const expected = await hmacSha256Hex(secret, signedPayload);
  if (!timingSafeEqualHex(expected, signature)) return null;

  try {
    return JSON.parse(body) as StripeEvent;
  } catch {
    return null;
  }
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return bytesToHex(new Uint8Array(sig));
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}
```

- [ ] **Step 2: Remove the moved code from `index.ts` and import from `stripe.ts`**

In `workers/license-issuer/src/index.ts`:
- Delete the `MARK: - Stripe webhook verification` section (the `interface StripeEvent`, `interface CheckoutSession`, `verifyStripeWebhook`, `hmacSha256Hex`, `timingSafeEqualHex`, `bytesToHex` definitions).
- Keep `base64ToBytes` and `base64url` for now (still used by signing code that hasn't moved yet).
- Add at the top of `index.ts`:
```ts
import { verifyStripeWebhook, type CheckoutSession } from "./stripe";
```

- [ ] **Step 3: Typecheck**

```bash
cd workers/license-issuer && npm run typecheck
```
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add workers/license-issuer/src/stripe.ts workers/license-issuer/src/index.ts
git commit -m "refactor(license-issuer): extract Stripe verification to stripe.ts"
```

---

## Task 3: Build `license.ts` (key generation, signing, hashing, masking)

**Files:**
- Create: `workers/license-issuer/src/license.ts`

This module is new — it adds raw key generation and hashing while taking over the signing logic currently inlined in `index.ts`.

- [ ] **Step 1: Create `src/license.ts`**

```ts
import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";

// @noble/ed25519 v2 needs a synchronous SHA-512 implementation at startup.
ed.etc.sha512Sync = (...msgs) => sha512(ed.etc.concatBytes(...msgs));

export const KEY_PREFIX = "tap_";
const RAW_KEY_BODY_LEN = 24;
const CROCKFORD_BASE32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // no I L O U

export function generateRawLicenseKey(): string {
  const bytes = new Uint8Array(RAW_KEY_BODY_LEN);
  crypto.getRandomValues(bytes);
  let body = "";
  for (const b of bytes) body += CROCKFORD_BASE32[b % 32];
  return `${KEY_PREFIX}${body}`;
}

export interface SignedLicense {
  signedToken: string;     // <base64url(payload)>.<base64url(sig)>
  payload: string;         // email|issuedAt|rawLicenseKey
  issuedAt: number;        // unix seconds
}

export async function signLicense(
  email: string,
  rawLicenseKey: string,
  privateKeyB64: string,
): Promise<SignedLicense> {
  const seed = base64ToBytes(privateKeyB64);
  if (seed.length !== 32) {
    throw new Error(`Expected 32-byte Ed25519 seed, got ${seed.length} bytes`);
  }
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = `${email}|${issuedAt}|${rawLicenseKey}`;
  const payloadBytes = new TextEncoder().encode(payload);
  const signature = await ed.signAsync(payloadBytes, seed);
  const signedToken = `${base64url(payloadBytes)}.${base64url(signature)}`;
  return { signedToken, payload, issuedAt };
}

export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return bytesToHex(new Uint8Array(digest));
}

export function maskRawKey(rawKey: string): string {
  // tap_••••••••<last 4 chars of body>
  const body = rawKey.slice(KEY_PREFIX.length);
  const tail = body.slice(-4);
  return `${KEY_PREFIX}••••••••${tail}`;
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function base64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}
```

- [ ] **Step 2: Typecheck**

```bash
cd workers/license-issuer && npm run typecheck
```
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add workers/license-issuer/src/license.ts
git commit -m "feat(license-issuer): add license module (generate, sign, hash, mask)"
```

---

## Task 4: Build `kv.ts` (typed KV access)

**Files:**
- Create: `workers/license-issuer/src/kv.ts`

- [ ] **Step 1: Create `src/kv.ts`**

```ts
export interface Activation {
  deviceId: string;
  activatedAt: number;
  lastSeenAt: number;
}

export type LicenseStatus = "active" | "revoked";

export interface LicenseRecord {
  email: string;
  sessionId: string;
  rawKeyHash: string;
  signedKeyHash: string;
  maskedKey: string;
  issuedAt: number;
  status: LicenseStatus;
  activations: Activation[];
  maxDevices: number;
}

export interface SessionPointer {
  rawKeyHash: string;
  signedKeyHash: string;
}

export interface SignedPointer {
  rawKeyHash: string;
}

export const MAX_DEVICES = 3;

const licKey = (rawKeyHash: string) => `lic:${rawKeyHash}`;
const sessionKey = (sessionId: string) => `session:${sessionId}`;
const signedKey = (signedKeyHash: string) => `signed:${signedKeyHash}`;

export async function getLicense(
  kv: KVNamespace,
  rawKeyHash: string,
): Promise<LicenseRecord | null> {
  return kv.get<LicenseRecord>(licKey(rawKeyHash), "json");
}

export async function putLicense(
  kv: KVNamespace,
  record: LicenseRecord,
): Promise<void> {
  await kv.put(licKey(record.rawKeyHash), JSON.stringify(record));
}

export async function getSessionPointer(
  kv: KVNamespace,
  sessionId: string,
): Promise<SessionPointer | null> {
  return kv.get<SessionPointer>(sessionKey(sessionId), "json");
}

export async function putSessionPointer(
  kv: KVNamespace,
  sessionId: string,
  pointer: SessionPointer,
): Promise<void> {
  await kv.put(sessionKey(sessionId), JSON.stringify(pointer));
}

export async function getSignedPointer(
  kv: KVNamespace,
  signedKeyHash: string,
): Promise<SignedPointer | null> {
  return kv.get<SignedPointer>(signedKey(signedKeyHash), "json");
}

export async function putSignedPointer(
  kv: KVNamespace,
  signedKeyHash: string,
  pointer: SignedPointer,
): Promise<void> {
  await kv.put(signedKey(signedKeyHash), JSON.stringify(pointer));
}
```

- [ ] **Step 2: Typecheck**

```bash
cd workers/license-issuer && npm run typecheck
```
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add workers/license-issuer/src/kv.ts
git commit -m "feat(license-issuer): add typed KV access for license records and pointers"
```

---

## Task 5: Extract `email.ts` and update template

**Files:**
- Create: `workers/license-issuer/src/email.ts`
- Modify: `workers/license-issuer/src/index.ts`

The email now contains both the raw license key (for the user to type/copy) and the signed token (for the macOS app).

- [ ] **Step 1: Create `src/email.ts`**

```ts
import type { Env } from "./env";

export interface LicenseEmailPayload {
  to: string;
  rawLicenseKey: string;
  signedLicenseToken: string;
}

export async function sendLicenseEmail(
  payload: LicenseEmailPayload,
  env: Env,
): Promise<void> {
  const { to, rawLicenseKey, signedLicenseToken } = payload;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to,
      subject: "Your TappitX license",
      text:
        `Thanks for buying TappitX!\n\n` +
        `Email:        ${to}\n` +
        `License key:  ${rawLicenseKey}\n` +
        `Activation:   ${signedLicenseToken}\n\n` +
        `To activate:\n` +
        `  1. Open TappitX → Preferences → License\n` +
        `  2. Enter your email and license key above\n` +
        `  3. Click Activate (the app uses the activation token automatically)\n\n` +
        `You can activate TappitX on up to 3 devices with this license.\n` +
        `Keep this email — it's your proof of purchase.\n` +
        `Questions? Reply to this email or write to ${env.SUPPORT_EMAIL}.`,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "<unreadable>");
    throw new Error(`Resend ${res.status}: ${body}`);
  }
}
```

- [ ] **Step 2: Remove the moved code from `index.ts`**

In `workers/license-issuer/src/index.ts`:
- Delete the `MARK: - Email` section (the existing `sendLicenseEmail` function).
- The `index.ts` will be fully rewritten in Task 7, so leave it temporarily broken — but make sure typecheck still passes by removing only the `sendLicenseEmail` definition and any remaining call to it (the old call site will be replaced in Task 7).

For now, since `index.ts` still calls the old `sendLicenseEmail`, also update the import in `index.ts` to use the new module:
```ts
import { sendLicenseEmail } from "./email";
```
And update the call site (currently `sendLicenseEmail(email, licenseKey, env)`) to the new signature — but since the full handler rewrite happens in Task 7, **temporarily** leave the old call site commented out:
```ts
// ctx.waitUntil(sendLicenseEmail(email, licenseKey, env)); // replaced in Task 7
```
Replace it with a placeholder no-op so typecheck passes:
```ts
ctx.waitUntil(Promise.resolve());
```

- [ ] **Step 3: Typecheck**

```bash
cd workers/license-issuer && npm run typecheck
```
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add workers/license-issuer/src/email.ts workers/license-issuer/src/index.ts
git commit -m "refactor(license-issuer): extract email send to email.ts and add raw key to template"
```

---

## Task 6: Build `cors.ts` helper

**Files:**
- Create: `workers/license-issuer/src/handlers/cors.ts`

- [ ] **Step 1: Create the handlers directory and CORS helper**

```bash
mkdir -p workers/license-issuer/src/handlers
```

Create `workers/license-issuer/src/handlers/cors.ts`:
```ts
const SITE_ORIGIN = "https://gettappit.com";

export type CorsMode = "site" | "wildcard";

export function corsHeaders(mode: CorsMode): Record<string, string> {
  const origin = mode === "site" ? SITE_ORIGIN : "*";
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
  };
}

export function preflight(mode: CorsMode): Response {
  return new Response(null, { status: 204, headers: corsHeaders(mode) });
}

export function jsonResponse(
  body: unknown,
  status: number,
  mode: CorsMode,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      ...corsHeaders(mode),
      ...extraHeaders,
    },
  });
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
  mode: CorsMode,
): Response {
  return jsonResponse({ error: code, message }, status, mode);
}
```

- [ ] **Step 2: Typecheck**

```bash
cd workers/license-issuer && npm run typecheck
```
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add workers/license-issuer/src/handlers/cors.ts
git commit -m "feat(license-issuer): add CORS helpers for handler responses"
```

---

## Task 7: Webhook handler (with KV writes and idempotency)

**Files:**
- Create: `workers/license-issuer/src/handlers/webhook.ts`

This handler is the big behavior change: webhook now generates a raw key, writes three KV records, and emails both keys.

- [ ] **Step 1: Create `src/handlers/webhook.ts`**

```ts
import type { Env } from "../env";
import { verifyStripeWebhook, type CheckoutSession } from "../stripe";
import {
  generateRawLicenseKey,
  signLicense,
  sha256Hex,
  maskRawKey,
} from "../license";
import {
  getSessionPointer,
  putLicense,
  putSessionPointer,
  putSignedPointer,
  MAX_DEVICES,
  type LicenseRecord,
} from "../kv";
import { sendLicenseEmail } from "../email";

export async function handleWebhook(
  req: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  const event = await verifyStripeWebhook(body, sig, env.STRIPE_WEBHOOK_SECRET);
  if (!event) return new Response("Bad signature", { status: 400 });

  if (event.type !== "checkout.session.completed") {
    return new Response("Ignored", { status: 200 });
  }

  const session = event.data.object as CheckoutSession;
  const email = session.customer_details?.email?.toLowerCase().trim();
  const sessionId = session.id;
  if (!email) return new Response("No customer email", { status: 400 });

  // Idempotency: Stripe retries on non-2xx and occasionally on success.
  // If we've already issued for this session, return 200 without re-issuing.
  const existing = await getSessionPointer(env.LICENSES, sessionId);
  if (existing) {
    return new Response("Already issued", { status: 200 });
  }

  try {
    const rawLicenseKey = generateRawLicenseKey();
    const signed = await signLicense(email, rawLicenseKey, env.LICENSE_SIGNING_PRIVATE_KEY);
    const rawKeyHash = await sha256Hex(rawLicenseKey);
    const signedKeyHash = await sha256Hex(signed.signedToken);
    const maskedKey = maskRawKey(rawLicenseKey);

    const record: LicenseRecord = {
      email,
      sessionId,
      rawKeyHash,
      signedKeyHash,
      maskedKey,
      issuedAt: signed.issuedAt,
      status: "active",
      activations: [],
      maxDevices: MAX_DEVICES,
    };

    // Write primary record first, then pointers. If a pointer write fails,
    // the primary record exists but is unreachable by session/signed lookup —
    // support can recover via direct rawKeyHash if needed. We accept this
    // over a partial state where a pointer exists without a primary.
    await putLicense(env.LICENSES, record);
    await putSessionPointer(env.LICENSES, sessionId, { rawKeyHash, signedKeyHash });
    await putSignedPointer(env.LICENSES, signedKeyHash, { rawKeyHash });

    ctx.waitUntil(
      sendLicenseEmail(
        { to: email, rawLicenseKey, signedLicenseToken: signed.signedToken },
        env,
      ),
    );
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("issueLicense failed", err);
    return new Response("Internal error", { status: 500 });
  }
}
```

- [ ] **Step 2: Typecheck**

```bash
cd workers/license-issuer && npm run typecheck
```
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add workers/license-issuer/src/handlers/webhook.ts
git commit -m "feat(license-issuer): webhook handler writes KV records and emails both keys"
```

---

## Task 8: Session lookup handler

**Files:**
- Create: `workers/license-issuer/src/handlers/session.ts`

- [ ] **Step 1: Create `src/handlers/session.ts`**

```ts
import type { Env } from "../env";
import { getSessionPointer, getLicense } from "../kv";
import { jsonResponse, errorResponse, preflight } from "./cors";

export async function handleSession(
  req: Request,
  env: Env,
  sessionId: string,
): Promise<Response> {
  if (req.method === "OPTIONS") return preflight("site");
  if (req.method !== "GET") {
    return errorResponse("method_not_allowed", "Use GET", 405, "site");
  }

  const pointer = await getSessionPointer(env.LICENSES, sessionId);
  if (!pointer) {
    return errorResponse("not_found", "License not yet issued", 404, "site");
  }

  const record = await getLicense(env.LICENSES, pointer.rawKeyHash);
  if (!record) {
    // Pointer without primary — corrupt state. Treat as not found.
    return errorResponse("not_found", "License record missing", 404, "site");
  }

  return jsonResponse(
    {
      email: record.email,
      maskedKey: record.maskedKey,
      issuedAt: record.issuedAt,
      status: record.status,
    },
    200,
    "site",
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd workers/license-issuer && npm run typecheck
```
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add workers/license-issuer/src/handlers/session.ts
git commit -m "feat(license-issuer): /session/:id handler returning masked confirmation"
```

---

## Task 9: Validate handler

**Files:**
- Create: `workers/license-issuer/src/handlers/validate.ts`

- [ ] **Step 1: Create `src/handlers/validate.ts`**

```ts
import type { Env } from "../env";
import { sha256Hex } from "../license";
import { getLicense, getSignedPointer, putLicense } from "../kv";
import { jsonResponse, errorResponse, preflight } from "./cors";

interface ValidateBody {
  rawLicenseKey?: string;
  signedLicenseToken?: string;
  deviceId?: string;
  email?: string;
}

export async function handleValidate(req: Request, env: Env): Promise<Response> {
  if (req.method === "OPTIONS") return preflight("wildcard");
  if (req.method !== "POST") {
    return errorResponse("method_not_allowed", "Use POST", 405, "wildcard");
  }

  let body: ValidateBody;
  try {
    body = (await req.json()) as ValidateBody;
  } catch {
    return errorResponse("bad_request", "Invalid JSON body", 400, "wildcard");
  }

  const { rawLicenseKey, signedLicenseToken, deviceId, email } = body;
  if (!deviceId || !email) {
    return errorResponse("bad_request", "deviceId and email are required", 400, "wildcard");
  }
  if (!rawLicenseKey && !signedLicenseToken) {
    return errorResponse(
      "bad_request",
      "rawLicenseKey or signedLicenseToken required",
      400,
      "wildcard",
    );
  }

  const rawKeyHash = await resolveRawKeyHash(env, rawLicenseKey, signedLicenseToken);
  if (!rawKeyHash) {
    return errorResponse("unknown", "License not found", 404, "wildcard");
  }

  const record = await getLicense(env.LICENSES, rawKeyHash);
  if (!record) {
    return errorResponse("unknown", "License not found", 404, "wildcard");
  }

  if (record.email !== email.toLowerCase().trim()) {
    return errorResponse("email_mismatch", "Email does not match license", 403, "wildcard");
  }

  if (record.status === "revoked") {
    return jsonResponse(
      {
        status: "revoked",
        maxDevices: record.maxDevices,
        activeDevices: record.activations.length,
      },
      200,
      "wildcard",
    );
  }

  // Update lastSeenAt for the calling device if it's already activated.
  // /validate does not auto-activate; that's /activate's job.
  const now = Math.floor(Date.now() / 1000);
  const activation = record.activations.find((a) => a.deviceId === deviceId);
  if (activation) {
    activation.lastSeenAt = now;
    await putLicense(env.LICENSES, record);
  }

  return jsonResponse(
    {
      status: "active",
      maxDevices: record.maxDevices,
      activeDevices: record.activations.length,
      deviceActivated: activation !== undefined,
    },
    200,
    "wildcard",
  );
}

async function resolveRawKeyHash(
  env: Env,
  rawLicenseKey: string | undefined,
  signedLicenseToken: string | undefined,
): Promise<string | null> {
  if (rawLicenseKey) {
    return sha256Hex(rawLicenseKey);
  }
  if (signedLicenseToken) {
    const signedHash = await sha256Hex(signedLicenseToken);
    const pointer = await getSignedPointer(env.LICENSES, signedHash);
    return pointer?.rawKeyHash ?? null;
  }
  return null;
}
```

- [ ] **Step 2: Typecheck**

```bash
cd workers/license-issuer && npm run typecheck
```
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add workers/license-issuer/src/handlers/validate.ts
git commit -m "feat(license-issuer): /validate handler with email check and lastSeenAt update"
```

---

## Task 10: Activate handler

**Files:**
- Create: `workers/license-issuer/src/handlers/activate.ts`

- [ ] **Step 1: Create `src/handlers/activate.ts`**

```ts
import type { Env } from "../env";
import { sha256Hex } from "../license";
import { getLicense, getSignedPointer, putLicense, type Activation } from "../kv";
import { jsonResponse, errorResponse, preflight } from "./cors";

interface ActivateBody {
  rawLicenseKey?: string;
  signedLicenseToken?: string;
  deviceId?: string;
  email?: string;
}

export async function handleActivate(req: Request, env: Env): Promise<Response> {
  if (req.method === "OPTIONS") return preflight("wildcard");
  if (req.method !== "POST") {
    return errorResponse("method_not_allowed", "Use POST", 405, "wildcard");
  }

  let body: ActivateBody;
  try {
    body = (await req.json()) as ActivateBody;
  } catch {
    return errorResponse("bad_request", "Invalid JSON body", 400, "wildcard");
  }

  const { rawLicenseKey, signedLicenseToken, deviceId, email } = body;
  if (!deviceId || !email) {
    return errorResponse("bad_request", "deviceId and email are required", 400, "wildcard");
  }
  if (!rawLicenseKey && !signedLicenseToken) {
    return errorResponse(
      "bad_request",
      "rawLicenseKey or signedLicenseToken required",
      400,
      "wildcard",
    );
  }

  const rawKeyHash = await resolveRawKeyHash(env, rawLicenseKey, signedLicenseToken);
  if (!rawKeyHash) {
    return errorResponse("unknown", "License not found", 404, "wildcard");
  }

  const record = await getLicense(env.LICENSES, rawKeyHash);
  if (!record) {
    return errorResponse("unknown", "License not found", 404, "wildcard");
  }

  if (record.email !== email.toLowerCase().trim()) {
    return errorResponse("email_mismatch", "Email does not match license", 403, "wildcard");
  }

  if (record.status === "revoked") {
    return errorResponse("revoked", "License has been revoked", 403, "wildcard");
  }

  const now = Math.floor(Date.now() / 1000);
  const existing = record.activations.find((a) => a.deviceId === deviceId);
  if (existing) {
    existing.lastSeenAt = now;
    await putLicense(env.LICENSES, record);
    return jsonResponse(
      {
        status: "active",
        reactivated: true,
        maxDevices: record.maxDevices,
        activeDevices: record.activations.length,
      },
      200,
      "wildcard",
    );
  }

  if (record.activations.length >= record.maxDevices) {
    return jsonResponse(
      {
        error: "device_limit_reached",
        message: `License is already activated on ${record.maxDevices} devices`,
        activeDevices: record.activations.length,
        maxDevices: record.maxDevices,
      },
      409,
      "wildcard",
    );
  }

  const activation: Activation = { deviceId, activatedAt: now, lastSeenAt: now };
  record.activations.push(activation);
  await putLicense(env.LICENSES, record);

  return jsonResponse(
    {
      status: "active",
      reactivated: false,
      maxDevices: record.maxDevices,
      activeDevices: record.activations.length,
    },
    200,
    "wildcard",
  );
}

async function resolveRawKeyHash(
  env: Env,
  rawLicenseKey: string | undefined,
  signedLicenseToken: string | undefined,
): Promise<string | null> {
  if (rawLicenseKey) {
    return sha256Hex(rawLicenseKey);
  }
  if (signedLicenseToken) {
    const signedHash = await sha256Hex(signedLicenseToken);
    const pointer = await getSignedPointer(env.LICENSES, signedHash);
    return pointer?.rawKeyHash ?? null;
  }
  return null;
}
```

- [ ] **Step 2: Typecheck**

```bash
cd workers/license-issuer && npm run typecheck
```
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add workers/license-issuer/src/handlers/activate.ts
git commit -m "feat(license-issuer): /activate handler enforcing 3-device cap"
```

---

## Task 11: Replace `index.ts` with the router

**Files:**
- Modify: `workers/license-issuer/src/index.ts` (full rewrite)

- [ ] **Step 1: Replace `src/index.ts` entirely**

Rewrite `workers/license-issuer/src/index.ts`:
```ts
/**
 * TappitX license issuer.
 *
 * Routes:
 *   POST /webhook           Stripe checkout.session.completed → issue license
 *   POST /stripe-webhook    legacy alias for /webhook (one deploy cycle)
 *   GET  /session/:id       masked confirmation for the /success page
 *   POST /validate          periodic license check from the macOS app
 *   POST /activate          bind license to a device (max 3)
 */

import type { Env } from "./env";
import { handleWebhook } from "./handlers/webhook";
import { handleSession } from "./handlers/session";
import { handleValidate } from "./handlers/validate";
import { handleActivate } from "./handlers/activate";

export type { Env };

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === "/webhook" || path === "/stripe-webhook") {
      return handleWebhook(req, env, ctx);
    }

    if (path === "/validate") {
      return handleValidate(req, env);
    }

    if (path === "/activate") {
      return handleActivate(req, env);
    }

    if (path.startsWith("/session/")) {
      const sessionId = path.slice("/session/".length);
      if (!sessionId) {
        return new Response("Bad request", { status: 400 });
      }
      return handleSession(req, env, sessionId);
    }

    return new Response("Not found", { status: 404 });
  },
};
```

- [ ] **Step 2: Typecheck**

```bash
cd workers/license-issuer && npm run typecheck
```
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add workers/license-issuer/src/index.ts
git commit -m "feat(license-issuer): route requests across webhook/session/validate/activate"
```

---

## Task 12: Smoke test the worker locally

**Files:** none (manual verification)

- [ ] **Step 1: Run `wrangler dev`**

In one terminal:
```bash
cd workers/license-issuer && npx wrangler dev
```
Expected: server listening on `http://localhost:8787` with `[wrangler:info]` lines.

- [ ] **Step 2: Verify unknown routes return 404**

In another terminal:
```bash
curl -i http://localhost:8787/nope
```
Expected: `HTTP/1.1 404 Not Found` with body `Not found`.

- [ ] **Step 3: Verify `/session/:id` returns 404 for unknown session**

```bash
curl -i http://localhost:8787/session/cs_test_unknown
```
Expected: `HTTP/1.1 404 Not Found` with body `{"error":"not_found","message":"License not yet issued"}`.

- [ ] **Step 4: Verify `/validate` rejects bad input**

```bash
curl -i -X POST http://localhost:8787/validate \
  -H 'content-type: application/json' \
  -d '{}'
```
Expected: `HTTP/1.1 400 Bad Request` with body `{"error":"bad_request","message":"deviceId and email are required"}`.

- [ ] **Step 5: Trigger a Stripe webhook event**

Set required secrets locally first (use a `.dev.vars` file in `workers/license-issuer/`):
```
LICENSE_SIGNING_PRIVATE_KEY=<32-byte base64 seed used in production or a dev seed>
STRIPE_WEBHOOK_SECRET=<whsec_... from `stripe listen` output>
RESEND_API_KEY=<re_... or any string if you don't want to actually send>
```

Restart `wrangler dev`. Then in a third terminal:
```bash
stripe listen --forward-to localhost:8787/webhook
```
And in a fourth:
```bash
stripe trigger checkout.session.completed
```
Expected in `wrangler dev` logs: a `POST /webhook` log line with status 200. The Resend call may fail with 401 if you used a fake API key — that's fine, the license should still be in KV.

- [ ] **Step 6: Confirm the license is in KV**

```bash
cd workers/license-issuer && npx wrangler kv key list --binding LICENSES --preview
```
Expected: three keys — one `lic:<hash>`, one `session:cs_test_...`, one `signed:<hash>`.

- [ ] **Step 7: Re-fetch the session**

Pick the session id from the previous step:
```bash
curl -i http://localhost:8787/session/<session-id-from-kv>
```
Expected: `HTTP/1.1 200 OK` with JSON body containing `email`, `maskedKey`, `issuedAt`, `status: "active"`.

- [ ] **Step 8: Smoke `/activate`**

Get the raw license key from the Resend logs (or from the worker logs if you printed it for testing — remove any debug prints before commit). Then:
```bash
curl -i -X POST http://localhost:8787/activate \
  -H 'content-type: application/json' \
  -d '{"rawLicenseKey":"tap_...","email":"<email>","deviceId":"dev-1"}'
```
Expected: `HTTP/1.1 200 OK` with `"reactivated":false`. Re-running it returns `"reactivated":true`. Running with three different `deviceId`s succeeds; the fourth returns `409` with `"error":"device_limit_reached"`.

- [ ] **Step 9: Stop wrangler dev**

`Ctrl-C` in the wrangler terminal. No commit — manual testing only.

---

## Task 13: Add the `/success` page (Next.js)

**Files:**
- Create: `src/app/success/page.tsx`
- Create: `src/app/success/SuccessClient.tsx`
- Create: `src/app/success/success.module.css`

The marketing site is statically exported. `page.tsx` is a server component that just renders the client component. All logic lives in the client component.

- [ ] **Step 1: Create `src/app/success/page.tsx`**

```tsx
import type { Metadata } from "next";
import SuccessClient from "./SuccessClient";

export const metadata: Metadata = {
  title: "Payment confirmed — TappitX",
  robots: { index: false, follow: false },
};

export default function SuccessPage() {
  return <SuccessClient />;
}
```

- [ ] **Step 2: Create `src/app/success/SuccessClient.tsx`**

The license-issuer worker URL needs to be configurable. We'll add `NEXT_PUBLIC_LICENSE_ISSUER_URL` (set in the build env / `wrangler.toml` of the marketing site if needed).

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./success.module.css";

const LICENSE_ISSUER_URL =
  process.env.NEXT_PUBLIC_LICENSE_ISSUER_URL ?? "https://license.gettappit.com";
const POLL_INTERVAL_MS = 1500;
const MAX_ATTEMPTS = 8;

interface SessionInfo {
  email: string;
  maskedKey: string;
  issuedAt: number;
  status: string;
}

type State =
  | { kind: "loading"; attempt: number }
  | { kind: "missingSessionId" }
  | { kind: "ready"; info: SessionInfo }
  | { kind: "timeout" }
  | { kind: "error"; message: string };

export default function SuccessClient() {
  const [state, setState] = useState<State>({ kind: "loading", attempt: 0 });
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setState({ kind: "missingSessionId" });
      return;
    }

    void poll(sessionId, 0);

    return () => {
      cancelled.current = true;
    };

    async function poll(id: string, attempt: number): Promise<void> {
      if (cancelled.current) return;
      try {
        const res = await fetch(`${LICENSE_ISSUER_URL}/session/${encodeURIComponent(id)}`);
        if (res.status === 404) {
          if (attempt + 1 >= MAX_ATTEMPTS) {
            setState({ kind: "timeout" });
            return;
          }
          setState({ kind: "loading", attempt: attempt + 1 });
          setTimeout(() => void poll(id, attempt + 1), POLL_INTERVAL_MS);
          return;
        }
        if (!res.ok) {
          setState({ kind: "error", message: `Server returned ${res.status}` });
          return;
        }
        const info = (await res.json()) as SessionInfo;
        setState({ kind: "ready", info });
      } catch (err) {
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "Network error",
        });
      }
    }
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Payment confirmed</h1>
        {renderBody(state)}
        <p className={styles.support}>
          Need help? Email{" "}
          <a href="mailto:support@gettappit.com">support@gettappit.com</a>.
        </p>
      </div>
    </main>
  );
}

function renderBody(state: State) {
  switch (state.kind) {
    case "loading":
      return (
        <p className={styles.body}>
          Issuing your license… (attempt {state.attempt + 1})
        </p>
      );
    case "missingSessionId":
      return (
        <p className={styles.body}>
          Thanks for your purchase. Your license has been emailed to you — check
          your inbox (and spam folder).
        </p>
      );
    case "ready":
      return (
        <>
          <dl className={styles.details}>
            <dt>Email</dt>
            <dd>{state.info.email}</dd>
            <dt>License</dt>
            <dd className={styles.key}>{state.info.maskedKey}</dd>
          </dl>
          <p className={styles.body}>
            Your full license key has been emailed to{" "}
            <strong>{state.info.email}</strong>. Open the email on the Mac you
            want to activate.
          </p>
        </>
      );
    case "timeout":
      return (
        <p className={styles.body}>
          Your license is being issued. Check your email in a few minutes — if
          it doesn&apos;t arrive, contact support.
        </p>
      );
    case "error":
      return (
        <p className={styles.body}>
          Something went wrong loading your confirmation ({state.message}). Your
          license has still been emailed — check your inbox.
        </p>
      );
  }
}
```

- [ ] **Step 3: Create `src/app/success/success.module.css`**

```css
.page {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 1.5rem;
}

.card {
  max-width: 32rem;
  width: 100%;
  padding: 2.5rem;
  border-radius: 1rem;
  background: var(--card-bg, #fff);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.04);
}

.title {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 0 1.5rem;
}

.body {
  font-size: 1rem;
  line-height: 1.6;
  margin: 1rem 0;
}

.details {
  margin: 1.5rem 0;
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.5rem 1rem;
  font-size: 0.95rem;
}

.details dt {
  color: var(--muted, #666);
}

.details dd {
  margin: 0;
  font-weight: 500;
}

.key {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  letter-spacing: 0.02em;
}

.support {
  margin-top: 2rem;
  font-size: 0.9rem;
  color: var(--muted, #666);
}
```

- [ ] **Step 4: Verify the page builds**

```bash
npm run build
```
Expected: build succeeds, output includes `out/success/index.html` (or equivalent).

- [ ] **Step 5: Smoke the page locally**

```bash
npm run dev
```
Open `http://localhost:3000/success?session_id=cs_test_anything` in a browser.

Expected: page renders the loading state, then either the timeout or error state (depending on whether `LICENSE_ISSUER_URL` is reachable). The shape and styling should match the rest of the site.

Open `http://localhost:3000/success` (no query string).

Expected: shows the "missingSessionId" generic message.

- [ ] **Step 6: Stop dev server, commit**

```bash
git add src/app/success/page.tsx src/app/success/SuccessClient.tsx src/app/success/success.module.css
git commit -m "feat(success): add /success page that polls /session/:id for masked confirmation"
```

---

## Task 14: Wire up the license-issuer URL for the marketing site

**Files:**
- Modify: `wrangler.toml` (root, the marketing site config)

The marketing site is built statically; the URL has to be baked in at build time via `NEXT_PUBLIC_LICENSE_ISSUER_URL`. There are two reasonable hosting choices for the license issuer:

1. **Workers default subdomain** — `https://license-issuer.<account>.workers.dev`. Zero config, but the URL is your account-specific subdomain.
2. **Custom subdomain** — `https://license.gettappit.com` via a Cloudflare custom domain on the worker. Chosen.

This task assumes the custom subdomain. Adjust if you go the other way.

- [ ] **Step 1: Add a `[vars]` entry exposing the issuer URL to the marketing site build**

Wrangler does not inject `[vars]` into the Next.js static build — that's a Next.js build step. Instead, add the variable to the build environment used by `npm run build`. The simplest path is a `.env.production` file at the repo root:

Create or update `.env.production` (NOT committed if it contains secrets — `NEXT_PUBLIC_*` is public by definition, so committing is fine):
```
NEXT_PUBLIC_LICENSE_ISSUER_URL=https://license.gettappit.com
```

- [ ] **Step 2: Add `.env.production` to git if appropriate**

```bash
git status
```
If `.env.production` is in `.gitignore`, override for this file by appending an entry (or just commit explicitly with `git add -f`). Confirm there are no other secrets in the file before committing.

```bash
git add -f .env.production
```

- [ ] **Step 3: Configure the custom domain on the license-issuer worker**

In `workers/license-issuer/wrangler.toml`, add at the bottom:
```toml
routes = [
  { pattern = "license.gettappit.com", custom_domain = true, zone_name = "gettappit.com" }
]
```

- [ ] **Step 4: Rebuild and confirm the URL is baked in**

```bash
npm run build
grep -r "license-issuer" out/ | head -n 3
```
Expected: at least one match showing the URL embedded in the static JS.

- [ ] **Step 5: Commit**

```bash
git add .env.production workers/license-issuer/wrangler.toml
git commit -m "chore: route license-issuer at license.gettappit.com and bake URL into site"
```

---

## Task 15: Deploy and end-to-end smoke test

**Files:** none (deploy + manual verification)

- [ ] **Step 1: Verify all secrets are set on the license-issuer worker**

```bash
cd workers/license-issuer && npx wrangler secret list
```
Expected: `LICENSE_SIGNING_PRIVATE_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`. If any are missing:
```bash
npx wrangler secret put <NAME>
```

- [ ] **Step 2: Deploy the license-issuer worker**

```bash
cd workers/license-issuer && npx wrangler deploy
```
Expected: deploy succeeds, prints the routes including `license.gettappit.com`.

- [ ] **Step 3: Deploy the marketing site**

```bash
cd ../.. && npm run build && npx wrangler deploy
```
Expected: deploy succeeds.

- [ ] **Step 4: Confirm `/success` is reachable**

```bash
curl -i https://gettappit.com/success
```
Expected: `200 OK`, HTML body with the page shell.

- [ ] **Step 5: Update the Stripe dashboard**

In the Stripe dashboard:
- Webhooks → edit the existing endpoint → URL: `https://license.gettappit.com/webhook` (was `…/stripe-webhook`).
- Payment Links → edit your live (or test) link → "After payment" → "Don't show confirmation page" → "Redirect customers to your website" → URL:
  `https://gettappit.com/success?session_id={CHECKOUT_SESSION_ID}`.

- [ ] **Step 6: End-to-end test**

Make a real Stripe test purchase using the Payment Link in test mode. Use a test card (`4242 4242 4242 4242`).

Expected:
1. After paying, Stripe redirects to `gettappit.com/success?session_id=cs_test_...`.
2. Within ~3 seconds, the page shows the masked license + email.
3. Within ~30 seconds, an email arrives at the address used during checkout containing both the raw license key and the activation token.
4. `curl -X POST https://license.gettappit.com/activate -H 'content-type: application/json' -d '{"rawLicenseKey":"<raw>","email":"<email>","deviceId":"smoke-1"}'` returns `200` with `"reactivated":false`.
5. Re-running the same `/activate` call returns `200` with `"reactivated":true`.
6. `/validate` with the same payload returns `"status":"active"` and `"deviceActivated":true`.

If any step fails, debug before continuing. No commit — deploy verification only.

- [ ] **Step 7: After 24–48 hours of confidence, remove the legacy alias**

Once you're sure no Stripe events are still hitting `/stripe-webhook`, edit `workers/license-issuer/src/index.ts` and remove the `path === "/stripe-webhook"` branch from the router. Deploy and commit:

```bash
git commit -am "chore(license-issuer): drop legacy /stripe-webhook alias"
cd workers/license-issuer && npx wrangler deploy
```

---

## Self-Review

**Spec coverage:**
- `/webhook` with KV writes → Task 7. ✓
- `/session/:id` with masked key → Task 8. ✓
- `/validate` with email check + lastSeenAt → Task 9. ✓
- `/activate` with 3-device cap → Task 10. ✓
- `/success` page with polling → Task 13. ✓
- KV namespace + bindings → Task 0. ✓
- Three KV key schemas (`lic:`, `session:`, `signed:`) → Tasks 4, 7. ✓
- Hash-only storage → Task 7 writes hashes; plaintext only in Task 5 email. ✓
- Idempotency on webhook → Task 7 step 1 checks `getSessionPointer`. ✓
- Stripe dashboard config + custom domain → Tasks 14, 15. ✓
- Legacy `/stripe-webhook` alias kept for one cycle → Task 11 router; removed in Task 15 step 7. ✓

**Placeholder scan:** No "TBD", "TODO", or "implement later" in any task. The `<paste production id>` and `<email>` style markers are concrete inputs the engineer fills from the previous step's output — those are fine.

**Type consistency:** `LicenseRecord`, `Activation`, `SessionPointer`, `SignedPointer` are defined in Task 4 and used unchanged in Tasks 7, 8, 9, 10. `MAX_DEVICES` exported from `kv.ts` in Task 4, used in Task 7. `Env` defined in Task 1, imported across Tasks 5, 7, 8, 9, 10. `corsHeaders`, `preflight`, `jsonResponse`, `errorResponse` defined in Task 6, used in Tasks 8, 9, 10. `sha256Hex`, `signLicense`, `generateRawLicenseKey`, `maskRawKey` defined in Task 3, used in Task 7. `verifyStripeWebhook`, `CheckoutSession` defined in Task 2, used in Task 7. ✓

**Phase scope:** No automated tests in any task. Phase 1 deliberately ends at deploy + manual smoke. Phase 2 (tests) is a separate plan. ✓

No issues found.
