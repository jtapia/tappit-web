import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const siteUrl = "https://gettappit.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "TappitX: Tap-to-click for your Magic Mouse",
  description:
    "Add trackpad-style tap-to-click to your Apple Magic Mouse. Light, kinder-on-your-hands clicks, smart right-click, and subtle haptics. One-time $2.99 · Zero data collected.",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "TappitX",
    title: "TappitX: Tap-to-click for your Magic Mouse",
    description:
      "Tap instead of press on your Magic Mouse. Smart right-click, subtle haptics, and every thoughtful detail. One-time $2.99.",
    images: [
      // Primary social card: 1.91:1 for Facebook, LinkedIn, Product Hunt, Slack.
      // TODO: create public/og-image.png at 1200x630 before the PH launch.
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TappitX: tap-to-click for your Apple Magic Mouse",
      },
      // Square fallback for legacy scrapers.
      {
        url: "/app-icon-large.png",
        width: 512,
        height: 512,
        alt: "TappitX app icon",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "TappitX: Tap-to-click for your Magic Mouse",
    description:
      "Tap instead of press on your Magic Mouse. Smart right-click, subtle haptics, and every thoughtful detail. One-time $2.99.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /* Note: dangerouslySetInnerHTML below uses only hardcoded strings (no user input),
     matching the same pattern from the TimeBar site for anti-flash theme and JSON-LD. */
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');else if(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-lg focus:font-semibold"
        >
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "TappitX",
              operatingSystem: "macOS 12.0 or later",
              applicationCategory: "UtilitiesApplication",
              softwareVersion: "1.0.0",
              fileSize: "5 MB",
              processorRequirements: "Apple Silicon or Intel",
              offers: {
                "@type": "Offer",
                price: "2.99",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
              },
              description:
                "Tap-to-click for your Apple Magic Mouse. Kinder clicks, smart right-click, subtle haptics, and thoughtful details. The way it should ship.",
              url: siteUrl,
              image: `${siteUrl}/app-icon-large.png`,
              releaseNotes: `${siteUrl}/changelog`,
            }),
          }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
