// Generate a throwaway Ed25519 keypair and mint a license for local testing.
//
// Usage:
//   cd /Users/kaifan11/Development/personal/tappitx/workers/license-issuer
//   node scripts/mint-test-license.mjs test@example.com
//
// Prints:
//   PUBLIC KEY  (base64) — paste into TappitX/LicenseManager.swift signingPublicKeyBase64
//   LICENSE KEY (token)  — paste into the app's License field
//
// The keypair is generated fresh each run. The matching public key is only valid
// for licenses minted in the same run, so re-running gives you new credentials.

import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";

ed.etc.sha512Sync = (...msgs) => sha512(ed.etc.concatBytes(...msgs));

const email = (process.argv[2] || "test@example.com").toLowerCase();

const seed = ed.utils.randomPrivateKey();           // 32 bytes
const pubKey = await ed.getPublicKeyAsync(seed);    // 32 bytes

const issuedAt = Math.floor(Date.now() / 1000);
const rawLicenseKey = "tap_TESTKEY" + Date.now().toString(36).toUpperCase();
const payload = `${email}|${issuedAt}|${rawLicenseKey}`;
const payloadBytes = new TextEncoder().encode(payload);
const signature = await ed.signAsync(payloadBytes, seed);

const b64u = (bytes) =>
  Buffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64 = (bytes) => Buffer.from(bytes).toString("base64");

const token = `${b64u(payloadBytes)}.${b64u(signature)}`;

console.log("=== TEST LICENSE ===");
console.log("Email           :", email);
console.log("Issued at       :", new Date(issuedAt * 1000).toISOString());
console.log("Raw license key :", rawLicenseKey);
console.log("Payload         :", payload);
console.log();
console.log("--- Paste into LicenseManager.swift line 39 (signingPublicKeyBase64) ---");
console.log(`"${b64(pubKey)}"`);
console.log();
console.log("--- Paste into the app's License Key field ---");
console.log(token);
console.log();
console.log("--- Email to enter in the app ---");
console.log(email);
