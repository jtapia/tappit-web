"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useCtaHref } from "@/hooks/useCta";

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

const navLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export default function Nav() {
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const primaryHref = useCtaHref();

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300 ${
          scrolled
            ? "bg-background/85 border-b border-border shadow-[0_1px_0_rgba(0,0,0,0.02)]"
            : "bg-background/60 border-b border-transparent"
        }`}
      >
        <div className="max-w-[1120px] mx-auto px-6 h-[60px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 -m-1 p-1 rounded-lg">
            <Image src="/app-icon.png" alt="" width={28} height={28} className="rounded-md" aria-hidden="true" />
            <span className="text-lg font-bold tracking-tight">TappitX</span>
          </Link>
          <div className="flex items-center gap-5 sm:gap-6 text-sm text-muted">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="hidden sm:block hover:text-foreground transition-colors">
                {link.label}
              </a>
            ))}
            <button
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            <a
              href={primaryHref}
              className="hidden sm:inline-block gradient-bg text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-accent/20"
            >
              Buy TappitX
            </a>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-panel"
              className="sm:hidden p-2 rounded-lg text-muted hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {menuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-nav-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="sm:hidden overflow-hidden border-t border-border bg-background/95 backdrop-blur-xl"
            >
              <div className="flex flex-col px-6 py-4 gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="py-2.5 text-sm text-muted hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href={primaryHref}
                  onClick={() => setMenuOpen(false)}
                  className="mt-2 text-center gradient-bg text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Buy TappitX
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Sticky mobile bottom CTA — appears after scroll, never covers content */}
      {scrolled && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="sm:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-3 bg-background/90 backdrop-blur-xl border-t border-border"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0) + 0.75rem)" }}
        >
          <a
            href={primaryHref}
            className="block text-center gradient-bg text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-accent/30"
          >
            Buy TappitX
          </a>
        </motion.div>
      )}
    </>
  );
}
