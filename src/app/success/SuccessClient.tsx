"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DOWNLOAD_URL } from "@/lib/site";

const LICENSE_ISSUER_URL =
  process.env.NEXT_PUBLIC_LICENSE_ISSUER_URL ?? "https://license.gettappit.com";
const POLL_INTERVAL_MS = 1500;
// 20 × 1500ms ≈ 30s, tuned to typical Stripe webhook delivery latency.
const MAX_ATTEMPTS = 20;

interface SessionInfo {
  email: string;
  maskedKey: string;
  issuedAt: number;
  status: string;
}

type State =
  | { kind: "loading"; attempt: number }
  | { kind: "missingSessionId" }
  | { kind: "ready"; info: SessionInfo }
  | { kind: "timeout" }
  | { kind: "error"; message: string };

export default function SuccessClient() {
  const [state, setState] = useState<State>({ kind: "loading", attempt: 0 });

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setState({ kind: "missingSessionId" });
      return;
    }

    void poll(sessionId, 0);

    return () => {
      cancelled = true;
    };

    async function poll(id: string, attempt: number): Promise<void> {
      if (cancelled) return;
      try {
        const res = await fetch(`${LICENSE_ISSUER_URL}/session/${encodeURIComponent(id)}`);
        if (res.status === 404) {
          if (attempt + 1 >= MAX_ATTEMPTS) {
            setState({ kind: "timeout" });
            return;
          }
          setState({ kind: "loading", attempt: attempt + 1 });
          setTimeout(() => void poll(id, attempt + 1), POLL_INTERVAL_MS);
          return;
        }
        if (!res.ok) {
          setState({ kind: "error", message: `Server returned ${res.status}` });
          return;
        }
        const info = (await res.json()) as SessionInfo;
        setState({ kind: "ready", info });
      } catch (err) {
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "Network error",
        });
      }
    }
  }, []);

  return (
    <section className="min-h-[calc(100vh-60px)] flex items-center pt-[60px]">
      <div className="max-w-[640px] w-full mx-auto px-6 py-16 sm:py-24">
        <Badge state={state} />

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05] mb-5">
          {headline(state)}
        </h1>

        <p className="text-lg text-muted leading-relaxed mb-8">
          {subhead(state)}
        </p>

        {state.kind === "ready" && <LicenseCard info={state.info} />}

        <Actions />

        <p className="mt-10 text-sm text-dim">
          Need help? Email{" "}
          <Link
            href="mailto:support@gettappit.com"
            className="text-foreground/80 underline underline-offset-4 hover:text-foreground"
          >
            support@gettappit.com
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

function Badge({ state }: { state: State }) {
  const { label, dotClass } = badgeStyle(state);
  return (
    <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent-light bg-accent/10 border border-accent/20 px-3.5 py-1.5 rounded-full mb-6">
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-[pulse-ring_2s_ease-in-out_infinite] absolute inline-flex h-full w-full rounded-full ${dotClass} opacity-60`}
        />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotClass}`} />
      </span>
      {label}
    </div>
  );
}

function badgeStyle(state: State): { label: string; dotClass: string } {
  const dotClass = state.kind === "ready" ? "bg-green-500" : "bg-accent";
  switch (state.kind) {
    case "loading":
      return { label: "Issuing your license…", dotClass };
    case "ready":
      return { label: "Payment confirmed", dotClass };
    case "timeout":
      return { label: "Email is on the way", dotClass };
    case "missingSessionId":
      return { label: "Thanks for your purchase", dotClass };
    case "error":
      return { label: "Confirmation issue", dotClass };
  }
}

function headline(state: State): React.ReactNode {
  switch (state.kind) {
    case "loading":
      return (
        <>
          Setting up your{" "}
          <span className="gradient-text">TappitX license</span>
        </>
      );
    case "ready":
      return (
        <>
          You&apos;re in.
          <br />
          <span className="gradient-text">Welcome to TappitX.</span>
        </>
      );
    case "timeout":
      return (
        <>
          Check your{" "}
          <span className="gradient-text">inbox</span>
        </>
      );
    case "missingSessionId":
      return (
        <>
          Thanks for your{" "}
          <span className="gradient-text">purchase</span>
        </>
      );
    case "error":
      return (
        <>
          We hit a{" "}
          <span className="gradient-text">small snag</span>
        </>
      );
  }
}

function subhead(state: State): string {
  switch (state.kind) {
    case "loading":
      return `Issuing your activation key (attempt ${state.attempt + 1} of ${MAX_ATTEMPTS}). This usually takes a couple of seconds.`;
    case "ready":
      return `Your full license key has been emailed to ${state.info.email}. Open the email on the Mac you want to activate, then paste the key into TappitX → Preferences → License.`;
    case "timeout":
      return "Your license is on its way. The email should arrive in a few minutes — if it doesn't show up, check spam or contact support and we'll resend it.";
    case "missingSessionId":
      return "Your purchase went through. Your license has been emailed — check your inbox (and spam folder) for the activation key.";
    case "error":
      return `Something went wrong loading your confirmation (${state.message}). Your license has still been emailed, so check your inbox while we sort the page out.`;
  }
}

function LicenseCard({ info }: { info: SessionInfo }) {
  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-5 sm:p-6 mb-6">
      <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-3 text-sm">
        <dt className="text-dim font-medium">Email</dt>
        <dd className="font-medium text-foreground break-all">{info.email}</dd>

        <dt className="text-dim font-medium">License</dt>
        <dd className="font-mono tracking-wider text-foreground">{info.maskedKey}</dd>

        <dt className="text-dim font-medium">Status</dt>
        <dd>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1 bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
            {info.status === "active" ? "Active" : info.status}
          </span>
        </dd>
      </dl>

      <p className="mt-5 text-xs text-dim leading-relaxed">
        Only the masked key is shown here. The full key is in your email — keep it
        somewhere safe; it&apos;s your proof of purchase.
      </p>
    </div>
  );
}

function Actions() {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Link
        href={DOWNLOAD_URL ?? "/"}
        className="flex-1 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base gradient-bg text-white hover:opacity-90 transition-opacity text-center flex items-center justify-center gap-2 shadow-md shadow-accent/20"
      >
        Download
      </Link>
      <Link
        href="/"
        className="flex-1 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base border border-border-light bg-card hover:bg-card-hover transition-colors text-center flex items-center justify-center gap-2"
      >
        Back to home
      </Link>
    </div>
  );
}
