"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const VISIBLE_BY_DEFAULT = 10;

const features = [
  {
    title: "Tap to click",
    desc: "A light finger touch triggers a real click. Dial the sensitivity to match the way you tap: airy and quick, or firm and deliberate.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
      </svg>
    ),
  },
  {
    title: "Double-tap",
    desc: "Two quick taps open files, highlight words, or select rows, with a soft ring that confirms it was heard.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" />
      </svg>
    ),
  },
  {
    title: "Zone right-click",
    desc: "The right side of the mouse acts as the right button. Drag the split to where it feels best. Mirror it for left-handed use.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="3" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    title: "Pressure right-click",
    desc: "Press just a little firmer for a right-click, anywhere on the mouse. Three levels of firmness so it matches your natural touch.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20" /><path d="M2 12h20" /><circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    title: "Middle-click strip",
    desc: "Optional center zone for middle-clicks, great for opening links in new tabs or closing them without lifting your hand.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
      </svg>
    ),
  },
  {
    title: "Two- and three-finger taps",
    desc: "Map a two-finger tap to right-click, or three fingers to middle-click. Mix and match to fit the way you already use your Mac.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11V6a2 2 0 014 0v5" /><path d="M13 11V4a2 2 0 014 0v9" /><path d="M17 11a2 2 0 014 0v6a6 6 0 01-6 6H11a6 6 0 01-6-6v-3a2 2 0 014 0" />
      </svg>
    ),
  },
  {
    title: "Tap to drag",
    desc: "Double-tap and hold to grab windows, files, or sliders. No need to clamp the mouse down. Your fingers do the work.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 13l6 6" /><path d="M13 13V5l6 6-6 2z" /><circle cx="6" cy="12" r="2" /><circle cx="12" cy="6" r="2" />
      </svg>
    ),
  },
  {
    title: "Edge dead zones",
    desc: "Drag handles in a visual editor to block taps along any edge. Stops stray clicks exactly where your fingers grip the mouse.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="2 2" /><rect x="7" y="7" width="10" height="10" rx="1" />
      </svg>
    ),
  },
  {
    title: "One-key on/off",
    desc: "Pause TappitX instantly with ⌃⌥⌘T (fully rebindable). Perfect for games, remote sessions, or anyone borrowing your Mac.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" /><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10" />
      </svg>
    ),
  },
  {
    title: "Siri & Shortcuts",
    desc: "Say “Toggle TappitX” to Siri, trigger it from Spotlight, or wire it into any Shortcuts workflow. Built with AppIntents for full Apple ecosystem support.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
  },
  {
    title: "Haptics & sound",
    desc: "A subtle haptic buzz and a soft tick confirm every tap, so you know it landed without even glancing at the screen. Toggle either independently in Preferences.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 010 14.14" /><path d="M15.54 8.46a5 5 0 010 7.07" />
      </svg>
    ),
  },
  {
    title: "Visual click dot",
    desc: "A colored dot flashes at your cursor on every click, with a ring on double-taps. Pick from ten colors and set separate hues for left and right clicks.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: "Palm rejection",
    desc: "Briefly ignores taps while you’re typing, so your hand hovering over the mouse never turns into a misclick.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Per-app rules",
    desc: "Turn off right-click in specific apps. Ideal for games, remote desktops, or anything that prefers pure left-clicks.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    title: "Your own scroll feel",
    desc: "Make scrolling faster, slower, or reversed, separate from the rest of your Mac. No system tweaks required.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" />
      </svg>
    ),
  },
  {
    title: "Battery in the menu bar",
    desc: "See your Magic Mouse 2 battery at a glance with a color-coded icon. Get alerts at 20% and 10% so you’re never caught mid-click.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="6" width="18" height="12" rx="2" /><line x1="23" y1="13" x2="23" y2="11" /><line x1="6" y1="10" x2="6" y2="14" /><line x1="10" y1="10" x2="10" y2="14" />
      </svg>
    ),
  },
  {
    title: "Launch on login",
    desc: "Opens quietly in the background when you log in, so tap-to-click is always ready the moment you are.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.36 6.64a9 9 0 11-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    title: "Live calibration view",
    desc: "See exactly where your fingers land on the mouse surface in real time. Fine-tune dead zones, zone splits, and pressure with instant visual feedback.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="22" y1="12" x2="18" y2="12" /><line x1="6" y1="12" x2="2" y2="12" /><line x1="12" y1="6" x2="12" y2="2" /><line x1="12" y1="22" x2="12" y2="18" />
      </svg>
    ),
  },
  {
    title: "Comfort by design",
    desc: "Lighter taps, dominant-hand mirroring, and pressure right-click without modifier chords. Easier on tired wrists, RSI, and one-handed use, without making any of it the headline.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
  {
    title: "Guided first launch",
    desc: "A quick onboarding walks you through accessibility permissions, checks for Smart Zoom conflicts, and gets you clicking in seconds.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
];

export default function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [expanded, setExpanded] = useState(false);

  const visibleFeatures = expanded ? features : features.slice(0, VISIBLE_BY_DEFAULT);
  const hiddenCount = features.length - VISIBLE_BY_DEFAULT;

  return (
    <section ref={ref} id="features" className="py-16 md:py-32 text-center bg-gradient-to-b from-background via-surface to-background">
      <div className="max-w-[1120px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-light mb-3">Everything included</p>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            <span className="block">Small app.</span>
            <span className="block md:inline gradient-text"> Thoughtful details everywhere.</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Every feature is on for everyone. No upsells, no &ldquo;Pro&rdquo; tier, no strings. Tweak what you like, ignore what you don&apos;t.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {visibleFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + Math.min(index, VISIBLE_BY_DEFAULT - 1) * 0.05 }}
              className="relative bg-card border border-border rounded-xl p-6 text-left hover:border-border-light hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 bg-gradient-to-br from-accent/15 to-accent-purple/15 rounded-lg flex items-center justify-center shrink-0 text-accent-light">
                  {feature.icon}
                </div>
                <h3 className="text-[0.95rem] font-semibold leading-snug">{feature.title}</h3>
              </div>
              <p className="text-sm text-muted leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Expand / collapse toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-8 flex flex-col items-center gap-2"
        >
          {!expanded && (
            <p className="text-sm text-dim">
              +{hiddenCount} more thoughtful details included
            </p>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent-light border border-accent/30 bg-accent/5 hover:bg-accent/10 px-5 py-2.5 rounded-xl transition-all"
          >
            {expanded ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
                Show fewer features
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                See all {features.length} features
              </>
            )}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
