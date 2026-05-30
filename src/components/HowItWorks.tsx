"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Touch the surface",
    desc: "Rest your finger on the top of your Magic Mouse. No press, no force. A light tap is all it takes, just like your MacBook trackpad.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 11V3" /><path d="M18.5 8a6.5 6.5 0 11-13 0" /><circle cx="12" cy="16" r="5" /><path d="M12 14v4" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "TappitX reads the tap",
    desc: "It figures out whether you meant left, right, or middle click from where you tapped and how firmly. Pick the style that feels best. It's up to you.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 2v20" /><path d="M2 12h20" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "You feel an instant click",
    desc: "macOS gets a real click, same as a button press. A subtle haptic buzz, soft sound, or on-screen dot confirms it landed. Zero lag.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="how-it-works" className="py-16 md:py-32 text-center">
      <div className="max-w-[1120px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-light mb-3">How it works</p>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            Three steps. Zero presses.
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Your Magic Mouse already senses your finger. TappitX just lets macOS know what those touches mean.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.12 + index * 0.08 }}
              className="rounded-2xl border border-border bg-card p-7 text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-accent-light">{step.icon}</div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent-light text-sm font-bold">
                  {step.number}
                </span>
              </div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm text-muted leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
