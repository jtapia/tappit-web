"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function Privacy() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="privacy" className="py-12 md:py-24 bg-gradient-to-b from-background via-surface to-background">
      <div className="max-w-[600px] mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="text-green-500 mb-5">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            <span className="block">Your taps stay on your Mac.</span>
          </h2>
          <p className="text-base text-muted leading-relaxed">
            No accounts. No tracking. No analytics. Your taps, settings, and license never leave your Mac. The only time TappitX talks to the internet is to check for app updates, and you can disable that in Preferences.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
