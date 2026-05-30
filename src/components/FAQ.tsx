"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
const faqs = [
  {
    q: "Does it work with my Magic Mouse?",
    a: "Yes, both Magic Mouse 1 and Magic Mouse 2 work for tap detection. Battery status in the menu bar requires Magic Mouse 2, since the original model doesn't report battery level.",
  },
  {
    q: "Is this a subscription?",
    a: "Nope. One-time purchase. Pay $2.99 once and TappitX is yours, including all future updates. No recurring charge, no account.",
  },
  {
    q: "Will I need to give any permissions?",
    a: "Just one: Accessibility. macOS requires it for any app that creates mouse clicks. TappitX walks you through enabling it on first launch. It takes about 10 seconds.",
  },
  {
    q: "Does it change my regular mouse settings?",
    a: "No. TappitX works alongside System Settings without touching them. Your scroll speed, tracking speed, and Magic Mouse gestures all stay exactly as they were.",
  },
  {
    q: "Can I tune how sensitive a tap needs to be?",
    a: "Yes, everything is adjustable. Tap speed, pressure levels, the zone split, double-tap timing. Start with the defaults (most people love them) and tweak only if you feel like it.",
  },
  {
    q: "Does it collect any data about me?",
    a: "Zero. No analytics, no crash reports, no accounts. Your taps and settings never leave your Mac. The only network traffic is the built-in macOS update check, which you can turn off in Preferences.",
  },
  {
    q: "I'm left-handed. Can I flip the zones?",
    a: "Absolutely. In Preferences, set your dominant hand to Left. Right-click moves to the left side, left-click to the right. One setting, done.",
  },
  {
    q: "Is TappitX good for RSI or one-handed use?",
    a: "Many people use it for exactly that. Tap-to-click removes the press, pressure right-click avoids modifier-key chords, and dead zones stop accidental taps where your hand rests. TappitX isn't certified assistive tech, but the lighter touch helps if hard clicking is uncomfortable.",
  },
  {
    q: "Will it conflict with Bartender, Ice, or Hidden Bar?",
    a: "No. TappitX is a well-behaved menu bar app and works alongside every popular menu bar manager.",
  },
  {
    q: "How do I quickly turn it off?",
    a: "Several ways. Click the menu bar icon, use the keyboard shortcut (⌃⌥⌘T by default, rebindable), or ask Siri to \"Toggle TappitX.\" You can also wire it into any Shortcuts workflow or trigger it from Spotlight.",
  },
  {
    q: "Do I need to turn off Smart Zoom?",
    a: "Yes. macOS Smart Zoom uses double-tap on the mouse surface, which conflicts with TappitX's double-tap. The first-launch guide detects this and walks you through disabling it in System Settings. It takes five seconds.",
  },
  {
    q: "What if I change my mind?",
    a: "Email support@gettappit.com within 30 days and we'll refund you, no questions asked. We'd rather you be happy than keep $2.99.",
  },
];

function FAQItem({ faq, index, inView }: { faq: typeof faqs[number]; index: number; inView: boolean }) {
  const [open, setOpen] = useState(false);
  const panelId = `faq-panel-${index}`;
  const buttonId = `faq-button-${index}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.3, delay: 0.05 + index * 0.04 }}
    >
      <h3>
        <button
          id={buttonId}
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls={panelId}
          className="w-full text-left py-5 flex items-start justify-between gap-4 group"
        >
          <span className={`text-[0.95rem] font-medium transition-colors ${open ? "text-foreground" : "group-hover:text-foreground"}`}>
            {faq.q}
          </span>
          <span
            aria-hidden="true"
            className={`shrink-0 text-lg leading-none mt-0.5 transition-[transform,color] duration-200 ${open ? "text-accent-light" : "text-dim group-hover:text-foreground"}`}
            style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
          >
            +
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
      >
        <p className="text-sm text-muted leading-relaxed pb-5 overflow-hidden min-h-0">{faq.a}</p>
      </div>
    </motion.div>
  );
}

export default function FAQ() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="faq" className="py-16 md:py-32 text-center">
      <div className="max-w-[700px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-light mb-3">Good questions</p>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            Everything you might ask.
          </h2>
          <p className="text-lg text-muted max-w-xl mx-auto">
            The stuff people actually want to know: compatibility, permissions, and privacy.
          </p>
        </motion.div>

        <div className="mt-8 text-left divide-y divide-border">
          {faqs.map((faq, index) => (
            <FAQItem key={faq.q} faq={faq} index={index} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
