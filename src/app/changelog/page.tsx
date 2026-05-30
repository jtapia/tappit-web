import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Changelog | TappitX",
  description: "Release notes and version history for TappitX.",
  alternates: {
    canonical: "/changelog",
  },
};

type Release = {
  version: string;
  date: string;
  tag?: "current" | "planned";
  sections: { heading: "Added" | "Changed" | "Fixed" | "Removed"; items: string[] }[];
};

const releases: Release[] = [
  {
    version: "1.0.0",
    date: "Initial release",
    tag: "current",
    sections: [
      {
        heading: "Added",
        items: [
          "Tap-to-click on Apple Magic Mouse: single and double tap",
          "Zone-based right-click: configurable split point with left-hand mirror",
          "Pressure-based right-click: contact area maps to light / medium / firm",
          "Middle-click center zone: optional configurable strip width",
          "Per-edge dead zones: interactive drag editor per top / bottom / left / right edge",
          "Multi-finger tap actions: two- and three-finger taps mappable to any click type",
          "Tap-to-drag: double-tap and hold initiates a drag",
          "Scroll sensitivity: independent multiplier (0.25–4×) via CGEventTap",
          "Scroll direction inversion: independent from system setting",
          "Haptic feedback: Force Touch trackpad vibration on recognized taps",
          "Sound feedback: system \u201CTink\u201D cue with pre-buffered playback",
          "Visual tap overlay: colored dot at cursor, ring on double-tap",
          "Palm rejection: suppresses taps for 500 ms after any keypress",
          "Per-app right-click rules: blocklist apps that always get left-clicks",
          "Battery monitoring: color-coded menu bar badge for Magic Mouse 2",
          "Start on login: SMAppService (macOS 13+)",
          "Touch calibration window: real-time finger position visualization",
          "Offline license activation: Ed25519-signed keys, zero network requests",
          "Onboarding flow: first-launch setup guide",
        ],
      },
    ],
  },
];

export default function Changelog() {
  return (
    <>
      <Nav />
      <main id="main-content" className="max-w-[760px] mx-auto px-6 pt-32 pb-24">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Changelog</h1>
        <p className="text-sm text-dim mb-12">
          Release notes for TappitX. Format follows{" "}
          <a className="text-accent-light hover:underline" href="https://keepachangelog.com/en/1.1.0/" target="_blank" rel="noopener noreferrer">
            Keep a Changelog
          </a>
          ; versions follow{" "}
          <a className="text-accent-light hover:underline" href="https://semver.org/" target="_blank" rel="noopener noreferrer">
            SemVer
          </a>
          .
        </p>

        <ol className="relative border-l border-border pl-6 space-y-12">
          {releases.map((release) => (
            <li key={release.version} className="relative">
              <span className="absolute -left-[33px] top-1.5 w-3 h-3 rounded-full bg-accent shadow-[0_0_0_4px_var(--color-background)]" />

              <div className="flex items-baseline gap-3 flex-wrap">
                <h2 className="text-2xl font-bold tracking-tight">v{release.version}</h2>
                {release.tag === "current" && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-light bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
                {release.tag === "planned" && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-dim bg-card border border-border px-2 py-0.5 rounded-full">
                    Planned
                  </span>
                )}
                <span className="text-sm text-dim">{release.date}</span>
              </div>

              {release.sections.map((section) => (
                <div key={section.heading} className="mt-5">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">{section.heading}</h3>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item} className="text-sm text-muted leading-relaxed flex gap-3">
                        <span className="text-accent-light mt-1.5 shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </li>
          ))}
        </ol>

        <p className="mt-16 text-sm text-dim">
          Questions about a specific release? Email{" "}
          <a className="text-accent-light hover:underline" href="mailto:support@gettappit.com">
            support@gettappit.com
          </a>
          .
        </p>
      </main>
      <Footer />
    </>
  );
}
