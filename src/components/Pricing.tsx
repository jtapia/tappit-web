"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { isExternalStripeLink } from "@/lib/site";
import { useCtaHref } from "@/hooks/useCta";

const featureGroups = [
  {
    heading: "The essentials",
    items: [
      "Tap to click (single & double)",
      "Right-click by zone or by pressure",
      "Middle-click and tap-to-drag",
      "Two- and three-finger tap actions",
    ],
  },
  {
    heading: "Polished details",
    items: [
      "Gentle haptics and soft click sound",
      "Customizable on-screen click dot",
      "Scroll speed and direction controls",
      "Per-app rules and visual dead zones",
    ],
  },
  {
    heading: "Everyday comforts",
    items: [
      "Palm rejection while typing",
      "Battery monitor with low-charge alerts",
      "Siri, Shortcuts & Spotlight toggle",
      "One-keystroke on/off shortcut",
    ],
  },
];

const checkIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function Pricing() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const href = useCtaHref();

  return (
    <section ref={ref} id="pricing" className="py-16 md:py-32 text-center">
      <div className="max-w-[640px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-light mb-3">Pricing</p>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            One price. Everything unlocked.
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            No tiers. No subscriptions. No hidden &ldquo;Pro&rdquo; plan. Pay once, enjoy every feature (and every future update) for as long as you want.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="relative rounded-3xl border-2 border-accent/30 bg-card p-6 sm:p-9 text-left mt-12 shadow-xl shadow-accent/5"
        >
          <div className="text-center mt-2">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl sm:text-6xl font-extrabold gradient-text">$2.99</span>
            </div>
            <p className="text-sm text-muted mt-2">One-time payment. Yours forever.</p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 text-left">
            {featureGroups.map((group) => (
              <div key={group.heading}>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-accent-light mb-2.5">{group.heading}</h3>
                <ul className="space-y-2">
                  {group.items.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] leading-snug">
                      <span className="text-accent-light mt-[3px] shrink-0">{checkIcon}</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <a
              href={href}
              target={isExternalStripeLink ? "_blank" : undefined}
              rel={isExternalStripeLink ? "noopener noreferrer" : undefined}
              className="block text-center gradient-bg text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:-translate-y-0.5 transition-all"
            >
              Buy TappitX
            </a>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-sm text-dim mt-6"
        >
          One-time purchase · Instant download · Free updates
        </motion.p>
      </div>
    </section>
  );
}
