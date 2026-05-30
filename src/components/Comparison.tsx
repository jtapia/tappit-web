"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const comparisons = [
  {
    title: "Kinder on your hands",
    desc: "You click hundreds of times a day. A featherweight tap takes a fraction of the effort of pressing the whole mouse. Your wrist will thank you by 5 PM.",
  },
  {
    title: "Right-click that just works",
    desc: "No more two-finger juggling or holding Control. Tap on the right side, or press a little firmer, whichever feels natural to you. Either way, context menus come up the first time, every time.",
  },
  {
    title: "Trackpad feel, mouse precision",
    desc: "Get the effortless tap-to-click you love on MacBooks, without giving up the precision of a mouse. It's the best of both worlds, right where you already work.",
  },
];

export default function Comparison() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-16 md:py-32 text-center bg-gradient-to-b from-background via-surface to-background">
      <div className="max-w-[1120px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-light mb-3">Why you&apos;ll love it</p>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">A better way to click.</h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Magic Mouse is beautiful, but clicking it gets tiring. TappitX turns those dozens of daily presses into gentle taps.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
          {comparisons.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.12 + index * 0.08 }}
              className="rounded-2xl border border-border bg-card p-7 text-center md:text-left"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent-light text-sm font-bold mx-auto md:mx-0">
                0{index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm text-muted leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
