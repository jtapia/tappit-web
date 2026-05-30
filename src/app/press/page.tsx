import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Press Kit | TappitX",
  description: "Assets, copy, and fact sheet for writing about TappitX.",
  alternates: {
    canonical: "/press",
  },
};

const facts: { label: string; value: string }[] = [
  { label: "Product", value: "TappitX" },
  { label: "Category", value: "macOS utility · input / accessibility" },
  { label: "Platform", value: "macOS 12.0 or later (Apple Silicon + Intel)" },
  { label: "Hardware", value: "Apple Magic Mouse (1st and 2nd generation)" },
  { label: "Price", value: "US $2.99 · one-time" },
  { label: "Refund", value: "30 days, no questions asked" },
  { label: "Privacy", value: "Zero network requests; no analytics; no telemetry" },
  { label: "Footprint", value: "~5 MB RAM, menu bar only (no Dock icon)" },
  { label: "Tech", value: "Native Swift + SwiftUI + AppKit · Sparkle auto-update" },
  { label: "Distribution", value: "Direct download (Developer ID signed + notarized)" },
  { label: "Launched", value: "2026" },
  { label: "Website", value: "gettappit.com" },
  { label: "Support", value: "support@gettappit.com" },
];

const boilerplates: { length: "One-liner" | "Short" | "Long"; body: string }[] = [
  {
    length: "One-liner",
    body: "TappitX brings tap-to-click to the Apple Magic Mouse: the feature macOS gives trackpads but not mice.",
  },
  {
    length: "Short",
    body:
      "TappitX is a lightweight macOS menu-bar app that turns light surface taps on the Apple Magic Mouse into real clicks. It adds zone- and pressure-based right-click, middle-click, tap-to-drag, multi-finger taps, haptic and sound feedback, and per-app rules: the polish macOS has always given trackpads. One-time purchase, zero network requests.",
  },
  {
    length: "Long",
    body:
      "Every MacBook trackpad has tap-to-click. The Apple Magic Mouse doesn't, and pressing the mouse body hundreds of times a day is tiring and loud. TappitX fixes that by reading raw multitouch data from the Magic Mouse at 60–120 Hz and injecting synthetic clicks at the HID level, indistinguishable from a real press. Beyond tap-to-click, TappitX delivers zone-based and pressure-based right-click, a configurable middle-click zone, multi-finger tap actions, tap-to-drag, per-edge dead zones, palm rejection, haptic and sound feedback, per-app right-click rules, custom scroll sensitivity, battery monitoring for Magic Mouse 2, and start-on-login via the native SMAppService API. Built in native Swift, sandbox-free (required for the private multitouch framework) but hardened, ~5 MB in memory, and makes zero network requests: all touch data stays on the device. Distributed direct at one-time US $2.99, offline Ed25519-signed license activation, and Sparkle-based auto-updates.",
  },
];

const features: string[] = [
  "Tap-to-click (single and double)",
  "Zone-based right-click with left-hand mirror",
  "Pressure-based right-click (contact-area classification)",
  "Middle-click center zone",
  "Multi-finger tap actions (2 & 3 fingers)",
  "Tap-to-drag",
  "Per-edge dead zones",
  "Per-app right-click rules",
  "Haptic, sound, and visual feedback",
  "Scroll sensitivity (0.25–4×) and direction inversion",
  "Palm rejection (typing pause)",
  "Global disable shortcut (⌃⌥⌘T)",
  "Battery monitoring for Magic Mouse 2",
  "Start on login (SMAppService, macOS 13+)",
  "Offline Ed25519 license activation",
];

const palette: { name: string; hex: string; note: string }[] = [
  { name: "Accent Blue", hex: "#2563eb", note: "Primary brand color" },
  { name: "Accent Light", hex: "#60a5fa", note: "Accents on dark backgrounds" },
  { name: "Accent Purple", hex: "#4f46e5", note: "Gradient partner" },
  { name: "Foreground (Light)", hex: "#101010", note: "Body text on light UI" },
  { name: "Foreground (Dark)", hex: "#e4e4ed", note: "Body text on dark UI" },
  { name: "Background (Dark)", hex: "#0a0a0f", note: "Dark theme canvas" },
];

const screenshotSlots = [
  { title: "Menu bar & preferences", note: "Pending release screenshot." },
  { title: "Zone editor", note: "Pending release screenshot." },
  { title: "Calibration window", note: "Pending release screenshot." },
  { title: "Tap overlay in action", note: "Pending release screenshot." },
];

export default function PressKit() {
  return (
    <>
      <Nav />
      <main id="main-content" className="max-w-[900px] mx-auto px-6 pt-32 pb-24">
        <header className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-light mb-3">Press Kit</p>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">Writing about TappitX?</h1>
          <p className="text-lg text-muted leading-relaxed max-w-2xl">
            Everything you need in one place: boilerplate copy at three lengths, the fact sheet, downloadable logo
            assets, brand colors, and screenshots as they become available. Reach us at{" "}
            <a className="text-accent-light hover:underline" href="mailto:support@gettappit.com">
              support@gettappit.com
            </a>{" "}
            for interview requests, review copies, or anything else.
          </p>
        </header>

        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Fact sheet</h2>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <dl className="divide-y divide-border">
              {facts.map((fact) => (
                <div key={fact.label} className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-5 py-3.5">
                  <dt className="text-xs font-semibold uppercase tracking-widest text-muted">{fact.label}</dt>
                  <dd className="sm:col-span-2 text-sm text-foreground">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Boilerplate copy</h2>
          <p className="text-sm text-muted mb-6">
            Copy blocks below are ready to quote. Please link back to{" "}
            <a className="text-accent-light hover:underline" href="https://gettappit.com">
              gettappit.com
            </a>{" "}
            when using them.
          </p>
          <div className="space-y-5">
            {boilerplates.map((entry) => (
              <article key={entry.length} className="rounded-xl border border-border bg-card p-5">
                <header className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-accent-light">{entry.length}</span>
                  <span className="text-xs text-dim">{entry.body.split(/\s+/).length} words</span>
                </header>
                <p className="text-sm text-foreground leading-relaxed">{entry.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Feature list</h2>
          <p className="text-sm text-muted mb-6">Plain-text list, useful for bullet-style coverage.</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 rounded-xl border border-border bg-card p-5">
            {features.map((feature) => (
              <li key={feature} className="text-sm text-foreground flex gap-2">
                <span className="text-accent-light mt-1 shrink-0">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Logo & app icon</h2>
          <p className="text-sm text-muted mb-6">Right-click any asset below to save it, or use the direct links.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-center h-36 bg-surface rounded-lg mb-4">
                <Image src="/app-icon.png" alt="TappitX app icon" width={64} height={64} className="rounded-xl shadow-md shadow-accent/10" />
              </div>
              <p className="text-sm font-semibold">App icon · 64×64</p>
              <p className="text-xs text-dim mt-1 mb-4">PNG with transparency</p>
              <a
                href="/app-icon.png"
                download
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-light hover:underline"
              >
                Download
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-center h-36 bg-surface rounded-lg mb-4">
                <Image src="/app-icon-large.png" alt="TappitX app icon (large)" width={96} height={96} className="rounded-2xl shadow-md shadow-accent/10" />
              </div>
              <p className="text-sm font-semibold">App icon · 512×512</p>
              <p className="text-xs text-dim mt-1 mb-4">PNG with transparency, suitable for print</p>
              <a
                href="/app-icon-large.png"
                download
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-light hover:underline"
              >
                Download
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Brand colors</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {palette.map((color) => (
              <div key={color.hex} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="h-16" style={{ backgroundColor: color.hex }} />
                <div className="p-4">
                  <p className="text-sm font-semibold">{color.name}</p>
                  <p className="text-xs font-mono text-accent-light mt-1">{color.hex.toUpperCase()}</p>
                  <p className="text-xs text-dim mt-1">{color.note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Screenshots</h2>
          <p className="text-sm text-muted mb-6">
            Currently preparing launch screenshots. Email{" "}
            <a className="text-accent-light hover:underline" href="mailto:support@gettappit.com">
              support@gettappit.com
            </a>{" "}
            for early access or custom captures.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {screenshotSlots.map((slot) => (
              <div key={slot.title} className="rounded-xl border border-dashed border-border-light bg-card p-6 h-44 flex flex-col justify-center items-center text-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-dim mb-2" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                </svg>
                <p className="text-sm font-semibold">{slot.title}</p>
                <p className="text-xs text-dim mt-1">{slot.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-accent/20 bg-accent/[0.04] p-6 sm:p-8">
          <h2 className="text-xl font-bold tracking-tight mb-2">Press contact</h2>
          <p className="text-sm text-muted mb-4">
            Review copies, interviews, custom screenshots, or anything we missed. We usually reply within one business day.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:support@gettappit.com"
              className="inline-flex items-center justify-center gap-2 gradient-bg text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:-translate-y-0.5 transition-all"
            >
              support@gettappit.com
            </a>
            <Link
              href="/changelog"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-border-light bg-card hover:bg-card-hover transition-colors"
            >
              View changelog
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
