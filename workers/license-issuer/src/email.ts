import { render } from "@react-email/render";
import LicenseEmail from "./emails/LicenseEmail";
import type { Env } from "./env";

export interface LicenseEmailPayload {
  to: string;
  rawLicenseKey: string;
  signedLicenseToken: string;
}

export async function sendLicenseEmail(
  payload: LicenseEmailPayload,
  env: Env,
): Promise<void> {
  const { to, rawLicenseKey, signedLicenseToken } = payload;

  const element = LicenseEmail({
    rawLicenseKey,
    signedLicenseToken,
    supportEmail: env.SUPPORT_EMAIL,
    recipientEmail: to,
  });
  const [html, text] = await Promise.all([
    render(element),
    render(element, { plainText: true }),
  ]);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to,
      subject: "Your TappitX license",
      html,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "<unreadable>");
    throw new Error(`Resend ${res.status}: ${body}`);
  }

  // Pairs with the failure log in webhook.ts so support can correlate
  // "didn't get email" reports back to a specific Resend Logs entry.
  const result = (await res.json().catch(() => null)) as { id?: string } | null;
  console.log("resend accepted", { to, resendId: result?.id });
}
