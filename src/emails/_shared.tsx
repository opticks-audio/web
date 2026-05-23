import * as React from "react";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
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
 *   - Foreground:  #f5f5f7 (off white)
 *   - Accent:      spectrum gradient (violet → cyan)
 *   - Typography:  Geist on web; system serif fallback for clients that
 *                  strip web fonts.
 *
 * Mail clients are notoriously bad at modern CSS, so we keep things
 * conservative and inline-friendly.
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
              maxWidth: 560,
              margin: "0 auto",
              padding: "48px 32px",
            }}
          >
            <Section style={{ paddingBottom: 32 }}>
              <Text
                style={{
                  fontSize: 14,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  color: "#9a9aa6",
                  margin: 0,
                }}
              >
                Opticks Audio
              </Text>
              <div
                style={{
                  marginTop: 8,
                  height: 2,
                  width: 64,
                  background:
                    "linear-gradient(90deg, #7c3aed 0%, #2563eb 33%, #06b6d4 66%, #10b981 100%)",
                  borderRadius: 1,
                }}
              />
            </Section>

            {children}

            <Hr
              style={{
                borderColor: "rgba(255,255,255,0.08)",
                margin: "40px 0 24px",
              }}
            />
            <Section>
              <Text
                style={{
                  color: "#5a5a66",
                  fontSize: 12,
                  lineHeight: "18px",
                  margin: 0,
                }}
              >
                Opticks Audio · Where physics becomes sound. <br />
                Crafted in Latin America for engineers everywhere.
              </Text>
              <Text
                style={{
                  color: "#5a5a66",
                  fontSize: 12,
                  lineHeight: "18px",
                  margin: "12px 0 0",
                }}
              >
                You're receiving this because you joined the Opticks Audio
                waitlist. If you didn't, you can safely ignore this email.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export function EmailButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-block",
        padding: "14px 28px",
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

export function H1({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontFamily: "'Instrument Serif', Georgia, serif",
        fontSize: 36,
        lineHeight: "42px",
        fontWeight: 400,
        color: "#f5f5f7",
        margin: "0 0 24px",
      }}
    >
      {children}
    </Text>
  );
}

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
