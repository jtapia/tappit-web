import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Page Not Found | TappitX",
};

export default function NotFound() {
  return (
    <>
      <Nav />
      <main id="main-content" className="min-h-screen pt-[60px] flex items-center">
        <div className="max-w-[480px] mx-auto px-6 py-20 text-center">
          <p className="text-[6rem] md:text-[8rem] font-extrabold gradient-text leading-none mb-4">
            404
          </p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Page not found
          </h1>
          <p className="text-muted leading-relaxed mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="gradient-bg text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Go Home
            </Link>
            <Link
              href="/#faq"
              className="px-6 py-3 rounded-xl font-semibold border border-border-light bg-card hover:bg-card-hover transition-colors"
            >
              View FAQ
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}