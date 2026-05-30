import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Use | TappitX",
  description: "Terms of use for TappitX, a tap-to-click utility for Apple Magic Mouse.",
};

export default function TermsOfUse() {
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
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-3">Terms of Use</h1>
          <p className="text-sm text-dim mb-6">Last updated April 18, 2026</p>
          <p className="prose-lead">
            By purchasing or using TappitX, you agree to the following terms. We&apos;ve kept them short and plain, with no surprise clauses.
          </p>
        </header>

        <article className="prose-section">
          <h2>License</h2>
          <p>
            TappitX grants you a personal, non-exclusive, non-transferable license to use the software on any Mac you own.
          </p>

          <h2>Purchase and pricing</h2>
          <p>
            TappitX is sold as a one-time purchase for $2.99. All purchases are processed by <a href="https://stripe.com" target="_blank" rel="noopener noreferrer">Stripe</a>. Prices may change without prior notice, but any purchase you complete is final at the price displayed at checkout.
          </p>

          <h2>Refunds</h2>
          <p>
            If you&apos;re unsatisfied with TappitX, email <a href="mailto:support@gettappit.com">support@gettappit.com</a> within 30 days of purchase for a full refund. No questions asked.
          </p>

          <h2>Permitted use</h2>
          <p>You may:</p>
          <ul>
            <li>Install and use TappitX on multiple Macs you personally own</li>
            <li>Use TappitX for personal or commercial work</li>
          </ul>
          <p>You may not:</p>
          <ul>
            <li>Redistribute, resell, or sublicense TappitX</li>
            <li>Reverse-engineer, decompile, or modify the application</li>
            <li>Share your license key or purchase with others</li>
          </ul>

          <h2>System requirements</h2>
          <p>
            TappitX requires macOS 12.0 (Monterey) or later and an Apple Magic Mouse (1st or 2nd generation). The app requires Accessibility permission to function. TappitX uses the private MultitouchSupport framework, which may change in future macOS versions.
          </p>

          <h2>Disclaimer</h2>
          <p>
            TappitX is provided &ldquo;as is&rdquo; without warranty of any kind, express or implied. We don&apos;t guarantee compatibility with all macOS versions or configurations. TappitX uses undocumented Apple APIs that may change or break in future macOS updates.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            In no event shall TappitX or its developer be liable for any indirect, incidental, special, or consequential damages arising from the use or inability to use the software. Total liability is limited to the purchase price paid.
          </p>

          <h2>Changes to these terms</h2>
          <p>
            We may update these terms from time to time. The updated version will be posted on this page with a new date. Continued use of TappitX after changes constitutes acceptance of the revised terms.
          </p>

          <h2>Contact</h2>
          <p>
            For questions about these terms, email <a href="mailto:support@gettappit.com">support@gettappit.com</a>.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
