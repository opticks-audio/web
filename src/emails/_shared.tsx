import * as React from "react";
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

/**
 * Shared shell for every transactional email.
 *
 * The visual language mirrors the marketing site:
 *   - Background:  #050507 (near black)
 *   - Surface:     #0a0a0f (subtle elevation for content card)
 *   - Foreground:  #f5f5f7 (off white)
 *   - Accent:      spectrum gradient (violet → cyan → emerald)
 *   - Typography:  Instrument Serif for display, system sans for body.
 *
 * Mail clients are notoriously bad at modern CSS, so we keep things
 * conservative and inline-friendly. No <link>s to fonts, no @import,
 * no flex / grid for layout — only block + tables where needed.
 *
 * Tier-A inspirations: Linear release emails, Stripe receipts,
 * Resend's own transactional templates.
 */
export function EmailShell({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body
          style={{
            backgroundColor: "#050507",
            color: "#f5f5f7",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
            margin: 0,
            padding: 0,
          }}
        >
          <Container
            style={{
              maxWidth: 600,
              margin: "0 auto",
              padding: "48px 24px 56px",
            }}
          >
            {/* ─── Header: logo mark + spectrum hairline ─────────────── */}
            <Section style={{ paddingBottom: 36 }}>
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{ borderCollapse: "collapse" }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        verticalAlign: "middle",
                        paddingRight: 14,
                      }}
                    >
                      <OpticksLogoMark />
                    </td>
                    <td style={{ verticalAlign: "middle" }}>
                      <Text
                        style={{
                          fontSize: 18,
                          letterSpacing: 0,
                          color: "#f5f5f7",
                          margin: 0,
                          fontWeight: 500,
                        }}
                      >
                        Opticks{" "}
                        <span style={{ color: "#9a9aa6", fontWeight: 400 }}>
                          Audio
                        </span>
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div
                style={{
                  marginTop: 20,
                  height: 1,
                  width: "100%",
                  background:
                    "linear-gradient(90deg, #7c3aed 0%, #2563eb 33%, #06b6d4 66%, #10b981 100%)",
                  opacity: 0.6,
                }}
              />
            </Section>

            {/* ─── Content card ───────────────────────────────────────── */}
            <Section
              style={{
                backgroundColor: "#0a0a0f",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16,
                padding: "40px 36px",
              }}
            >
              {children}
            </Section>

            {/* ─── Footer ──────────────────────────────────────────────── */}
            <Section style={{ padding: "32px 4px 0" }}>
              <Text
                style={{
                  color: "#6b6b78",
                  fontSize: 12,
                  lineHeight: "20px",
                  margin: 0,
                  letterSpacing: 0.2,
                }}
              >
                <strong style={{ color: "#9a9aa6", fontWeight: 500 }}>
                  Opticks Audio
                </strong>{" "}
                — Where physics becomes sound. Native DSP, designed for serious
                producers.
              </Text>
              <Text
                style={{
                  color: "#5a5a66",
                  fontSize: 12,
                  lineHeight: "20px",
                  margin: "16px 0 0",
                }}
              >
                Questions?{" "}
                <Link
                  href="mailto:hello@opticksaudio.com"
                  style={{ color: "#9a9aa6", textDecoration: "underline" }}
                >
                  hello@opticksaudio.com
                </Link>
                {" · "}
                Beta access?{" "}
                <Link
                  href="mailto:beta@opticksaudio.com"
                  style={{ color: "#9a9aa6", textDecoration: "underline" }}
                >
                  beta@opticksaudio.com
                </Link>
              </Text>
              <Text
                style={{
                  color: "#3f3f48",
                  fontSize: 11,
                  lineHeight: "18px",
                  margin: "20px 0 0",
                }}
              >
                You&apos;re receiving this because you joined the Opticks Audio
                waitlist. If you didn&apos;t, you can safely ignore this email.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

/** The Opticks prism mark as inline SVG data-URI — survives every mail client. */
function OpticksLogoMark() {
  return (
    <Img
      src="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2040%2040%22%20width%3D%2240%22%20height%3D%2240%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%237c3aed%22%2F%3E%3Cstop%20offset%3D%2250%25%22%20stop-color%3D%22%2306b6d4%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%2310b981%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cpath%20d%3D%22M20%204%20L36%2032%20L4%2032%20Z%22%20fill%3D%22none%22%20stroke%3D%22url(%23g)%22%20stroke-width%3D%221.8%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E"
      alt="Opticks Audio"
      width="40"
      height="40"
      style={{ display: "block" }}
    />
  );
}

/** Primary CTA — high-contrast pill, identical across mail clients. */
export function EmailButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-block",
        padding: "14px 32px",
        backgroundColor: "#f5f5f7",
        color: "#050507",
        fontWeight: 600,
        fontSize: 15,
        letterSpacing: 0.2,
        borderRadius: 999,
        textDecoration: "none",
      }}
    >
      {label}
    </Link>
  );
}

/** Secondary CTA — ghost outlined pill. Use sparingly. */
export function EmailGhostButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-block",
        padding: "13px 30px",
        backgroundColor: "transparent",
        color: "#f5f5f7",
        fontWeight: 500,
        fontSize: 15,
        letterSpacing: 0.2,
        borderRadius: 999,
        textDecoration: "none",
        border: "1px solid rgba(255,255,255,0.18)",
      }}
    >
      {label}
    </Link>
  );
}

/** Display headline — Instrument Serif when supported, system serif fallback. */
export function H1({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontFamily:
          "'Instrument Serif', 'Hoefler Text', 'Times New Roman', Georgia, serif",
        fontSize: 38,
        lineHeight: "44px",
        fontWeight: 400,
        letterSpacing: -0.5,
        color: "#f5f5f7",
        margin: "0 0 24px",
      }}
    >
      {children}
    </Text>
  );
}

/** Mono-uppercase eyebrow — placed above H1 for section context. */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 11,
        letterSpacing: 3,
        textTransform: "uppercase",
        color: "#9a9aa6",
        margin: "0 0 16px",
        fontWeight: 500,
      }}
    >
      {children}
    </Text>
  );
}

/** Body paragraph. */
export function P({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 16,
        lineHeight: "26px",
        color: "#c9c9d2",
        margin: "0 0 20px",
      }}
    >
      {children}
    </Text>
  );
}

/** Smaller helper text — fallback link, fine print, etc. */
export function Small({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 13,
        lineHeight: "20px",
        color: "#6b6b78",
        margin: "16px 0 0",
      }}
    >
      {children}
    </Text>
  );
}
