import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export interface LicenseEmailProps {
  rawLicenseKey: string;
  signedLicenseToken: string;
  supportEmail: string;
  recipientEmail: string;
}

const ACCENT = "#2563eb";
const ACCENT_DEEP = "#4f46e5";

export default function LicenseEmail({
  rawLicenseKey,
  signedLicenseToken,
  supportEmail,
  recipientEmail,
}: LicenseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your TappitX license is ready — activate on your Mac.</Preview>
      <Tailwind>
        <Body className="bg-[#f5f5f7] font-sans m-0 py-8">
          <Container className="bg-white rounded-2xl max-w-[560px] mx-auto overflow-hidden border border-black/[0.06]">
            <Section
              style={{
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DEEP})`,
              }}
              className="px-8 py-10 text-center"
            >
              <Img
                src="https://gettappit.com/app-icon.png"
                alt="TappitX"
                width={64}
                height={64}
                style={{
                  borderRadius: 14,
                  margin: "0 auto",
                  display: "block",
                }}
              />
              <Heading className="text-white text-3xl font-extrabold tracking-tight mt-5 mb-0 leading-tight">
                You&apos;re in.
              </Heading>
              <Text className="text-white/85 text-base mt-1 mb-0 leading-relaxed">
                Welcome to TappitX.
              </Text>
            </Section>

            <Section className="px-8 py-8">
              <Text className="text-[#101010] text-base leading-relaxed m-0">
                Thanks for buying TappitX! We&apos;ve issued the license tied to{" "}
                <strong>{recipientEmail}</strong>. To activate TappitX on your Mac,
                paste the license key below.
              </Text>

              <Section className="mt-6">
                <Text className="text-[#616166] text-xs font-semibold uppercase tracking-[0.12em] mb-2">
                  License key
                </Text>
                <Text
                  style={{ fontFamily: '"SF Mono", "Fira Code", monospace' }}
                  className="text-[#101010] text-base bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-4 py-3 m-0 break-all"
                >
                  {rawLicenseKey}
                </Text>
              </Section>

              <Section className="mt-5">
                <Text className="text-[#616166] text-xs font-semibold uppercase tracking-[0.12em] mb-2">
                  Activation token
                </Text>
                <Text
                  style={{ fontFamily: '"SF Mono", "Fira Code", monospace' }}
                  className="text-[#101010] text-xs bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-4 py-3 m-0 break-all leading-relaxed"
                >
                  {signedLicenseToken}
                </Text>
                <Text className="text-[#757578] text-xs mt-2 mb-0 leading-relaxed">
                  The activation token is used by TappitX automatically, you only
                  need to enter the license key.
                </Text>
              </Section>

              <Hr className="border-black/[0.06] my-7" />

              <Heading
                as="h2"
                className="text-[#101010] text-lg font-bold m-0 mb-4"
              >
                How to activate
              </Heading>

              <Section>
                <Step
                  num="1"
                  text={
                    <>
                      Open TappitX on the Mac you want to activate. From the menu
                      bar icon, choose <strong>Preferences → License</strong>.
                    </>
                  }
                />
                <Step
                  num="2"
                  text={
                    <>
                      Enter your email (<strong>{recipientEmail}</strong>) and
                      paste the license key from this email.
                    </>
                  }
                />
                <Step
                  num="3"
                  text={
                    <>
                      Click <strong>Activate</strong>.
                    </>
                  }
                />
              </Section>

              <Hr className="border-black/[0.06] my-7" />

              <Text className="text-[#616166] text-sm leading-relaxed m-0">
                Have questions or trouble activating? Reply to this email or
                write to{" "}
                <Link
                  href={`mailto:${supportEmail}`}
                  className="text-[#2563eb] underline"
                >
                  {supportEmail}
                </Link>
                . We&apos;ll get back to you quickly.
              </Text>
            </Section>

            <Section className="px-8 py-5 bg-[#f5f5f7] border-t border-black/[0.06]">
              <Text className="text-[#757578] text-xs mt-1 mb-0 text-center">
                <Link href="https://gettappit.com" className="text-[#757578] underline">
                  gettappit.com
                </Link>{" "}
              </Text>
              <Text className="text-[#757578] text-xs leading-relaxed m-0 text-center">
                This email is your proof of purchase.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

function Step({ num, text }: { num: string; text: React.ReactNode }) {
  return (
    <Section className="mb-3">
      <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
        <tbody>
          <tr>
            <td style={{ width: 32, verticalAlign: "top" }}>
              <Text
                className="text-white text-sm font-bold m-0 text-center leading-[24px]"
                style={{
                  background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DEEP})`,
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  display: "inline-block",
                }}
              >
                {num}
              </Text>
            </td>
            <td style={{ verticalAlign: "top" }}>
              <Text className="text-[#101010] text-sm leading-relaxed m-0">
                {text}
              </Text>
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  );
}
