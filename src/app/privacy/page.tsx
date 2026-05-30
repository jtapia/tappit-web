import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | TappitX",
  description: "TappitX collects no personal data. Everything stays on your Mac.",
};

export default function PrivacyPolicy() {
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
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-light mb-3">Legal</p>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-sm text-dim mb-6">Last updated April 18, 2026</p>
          <p className="prose-lead">
            TappitX is designed with privacy as a core principle. This policy explains what data we collect, and more importantly, what we don&apos;t.
          </p>
        </header>

        <article className="prose-section">
          <h2>No data collection</h2>
          <p>
            TappitX does not collect, store, transmit, or share any personal information. The app makes <strong>zero network requests</strong> of any kind. There are no analytics, no crash reporters, no telemetry, and no third-party SDKs.
          </p>

          <h2>What stays on your device</h2>
          <p>The following data is stored locally on your Mac only and never leaves your device:</p>
          <ul>
            <li>Your tap sensitivity preferences (duration, precision thresholds)</li>
            <li>Right-click mode selection (zone-based or pressure-based)</li>
            <li>Feedback preferences (haptic, sound, visual overlay colors)</li>
            <li>Per-app right-click rules</li>
            <li>Scroll customization settings</li>
            <li>Start on login preference</li>
          </ul>
          <p>
            All preferences are stored in macOS UserDefaults, a standard local storage mechanism. No cloud sync, no accounts, no external servers.
          </p>

          <h2>Touch data</h2>
          <p>
            TappitX reads raw multitouch data from your Magic Mouse&apos;s capacitive surface to detect taps. This data (finger position, contact area, duration) is processed entirely in memory and in real time. It is never recorded, stored to disk, or transmitted anywhere.
          </p>

          <h2>Accessibility permission</h2>
          <p>
            TappitX requires macOS Accessibility permission to inject synthetic mouse click events. This permission is used exclusively for click injection and is never used to read screen content, monitor keystrokes, or access any other application data.
          </p>

          <h2>Third-party services</h2>
          <p>
            TappitX includes no third-party analytics, advertising, or tracking frameworks. The app is fully self-contained.
          </p>

          <h2>Purchase data</h2>
          <p>
            Purchases are processed by Stripe. TappitX does not receive or store your payment information. Please refer to <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Stripe&apos;s Privacy Policy</a> for details on how they handle payment data.
          </p>

          <h2>Children&apos;s privacy</h2>
          <p>
            TappitX does not knowingly collect any information from anyone, including children under 13.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            If we update this policy, we&apos;ll post the revised version on this page with a new &ldquo;Last updated&rdquo; date. Since TappitX makes no network requests, we can&apos;t notify you in-app.
          </p>

          <h2>Contact</h2>
          <p>
            If you have questions about this privacy policy, email <a href="mailto:support@gettappit.com">support@gettappit.com</a>.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
