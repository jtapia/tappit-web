import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Support | TappitX",
  description: "Get help with TappitX. Find answers to common questions, troubleshooting tips, and contact support.",
};

export default function Support() {
  return (
    <>
      <Nav />
      <main id="main-content" className="max-w-[720px] mx-auto px-6 pt-32 pb-24">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-dim hover:text-foreground transition-colors mb-10"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to home
        </Link>

        <header className="mb-12 pb-10 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-light mb-3">Help</p>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-3">Support</h1>
          <p className="text-sm text-dim mb-6">We&apos;re here to help</p>
          <p className="prose-lead">
            TappitX is designed to be simple and stay out of your way. If you run into anything, this page should cover it.
          </p>
        </header>

        <article className="prose-section">
          <h2>Contact us</h2>
          <p>
            For bug reports, feature requests, or any questions, email <a href="mailto:support@gettappit.com">support@gettappit.com</a>. We typically respond within 24 hours.
          </p>

          <h2>Refund policy</h2>
          <p>
            Not happy with TappitX? Email us within 30 days of your purchase and we&apos;ll refund you in full, no questions asked.
          </p>

          <h2>Frequently asked questions</h2>

          <h3>Does it work with my Magic Mouse?</h3>
          <p>
            Yes. Both Magic Mouse 1 and Magic Mouse 2 work for tap detection. The battery indicator in the menu bar requires Magic Mouse 2, since the original model doesn&apos;t report battery level.
          </p>

          <h3>What permissions does TappitX need?</h3>
          <p>
            Just one: Accessibility. macOS requires it for any app that creates synthetic mouse clicks. TappitX walks you through enabling it on first launch and uses it exclusively for click injection.
          </p>

          <h3>Does TappitX change my system mouse settings?</h3>
          <p>
            No. TappitX works alongside System Settings without touching them. Your scroll speed, tracking speed, and Magic Mouse gestures stay exactly as they were.
          </p>

          <h3>Is it a subscription?</h3>
          <p>
            No. TappitX is a one-time purchase. Pay once and it&apos;s yours, including future updates. No recurring charge, no account.
          </p>

          <h3>Does TappitX collect any data?</h3>
          <p>
            Zero. No analytics, no crash reporter, no accounts. The only network traffic is the built-in macOS update check, which you can turn off in Preferences. See our <Link href="/privacy">Privacy Policy</Link> for full details.
          </p>

          <h2>Troubleshooting</h2>

          <h3>Taps aren&apos;t registering</h3>
          <ul>
            <li>Confirm TappitX is running. Look for the icon in the menu bar.</li>
            <li>Open <strong>System Settings &gt; Privacy &amp; Security &gt; Accessibility</strong> and make sure TappitX is enabled.</li>
            <li>If you recently updated macOS, you may need to toggle the Accessibility permission off and on once.</li>
            <li>Try lowering the tap sensitivity in Preferences if your taps feel too light.</li>
          </ul>

          <h3>Smart Zoom is interfering with double-tap</h3>
          <p>
            macOS Smart Zoom uses double-tap on the mouse surface, which conflicts with TappitX&apos;s double-tap. Open <strong>System Settings &gt; Mouse</strong> and turn off &quot;Smart Zoom.&quot; The first-launch guide also walks you through this.
          </p>

          <h3>The global hotkey doesn&apos;t respond</h3>
          <ul>
            <li>The default toggle hotkey is <strong>&#x2303;&#x2325;&#x2318;T</strong> (Control + Option + Command + T) and is rebindable in Preferences.</li>
            <li>Another app may be using the same shortcut. Check for conflicts and rebind if needed.</li>
            <li>Make sure TappitX has Accessibility permission.</li>
          </ul>

          <h3>Right-click feels off</h3>
          <ul>
            <li>If you&apos;re left-handed, set your dominant hand to <strong>Left</strong> in Preferences. This flips the zone-based right-click side.</li>
            <li>Try the alternate right-click mode (zone-based vs. pressure-based) under Preferences to see which feels more natural.</li>
            <li>Adjust the zone split or pressure threshold to match your hand position.</li>
          </ul>

          <h3>Accidental taps where my hand rests</h3>
          <p>
            Enable edge dead zones in Preferences. The visual editor lets you draw the regions of the mouse surface that should ignore touches.
          </p>

          <h3>Purchase didn&apos;t unlock</h3>
          <ul>
            <li>Use &quot;Restore Purchases&quot; in the TappitX menu.</li>
            <li>Check your email for the license key from your purchase confirmation.</li>
            <li>If you still have trouble, email <a href="mailto:support@gettappit.com">support@gettappit.com</a> with your order ID and we&apos;ll sort it out.</li>
          </ul>

          <h2>System requirements</h2>
          <ul>
            <li><strong>macOS:</strong> macOS 14 Sonoma or later</li>
            <li><strong>Hardware:</strong> Apple Magic Mouse (1 or 2). Battery indicator requires Magic Mouse 2.</li>
          </ul>

          <h2>Links</h2>
          <ul>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Use</Link></li>
          </ul>
        </article>
      </main>
      <Footer />
    </>
  );
}
