import * as React from "react";
import { Section, Text, Link } from "@react-email/components";
import { EmailShell, H1, P, Eyebrow, Small } from "./_shared";

/**
 * Sent after a user confirms their email.
 * This is the moment to set expectations and build brand affinity.
 *
 * Editorial intent:
 *   - Warm headline that signals belonging ("You're in").
 *   - Set realistic expectations on cadence ("one email a month, only when…").
 *   - A "what to expect" card with editorial bullets — feels curated.
 *   - One-click unsubscribe in fine print at the bottom.
 */
export default function WaitlistWelcome({
  unsubscribeUrl,
}: {
  unsubscribeUrl: string;
}) {
  return (
    <EmailShell preview="Welcome to the Opticks Audio waitlist. You're in.">
      <Eyebrow>You&apos;re confirmed</Eyebrow>
      <H1>You&apos;re in.</H1>
      <P>
        Welcome to the Opticks Audio waitlist. You&apos;ll be the first to hear
        when REFLEXION, REFRACTION and INFLEXION leave the studio — and the
        first to receive launch-week pricing reserved for the list.
      </P>

      <Section
        style={{
          padding: "24px 24px",
          borderRadius: 12,
          backgroundColor: "#06060a",
          border: "1px solid rgba(255,255,255,0.06)",
          margin: "32px 0 28px",
        }}
      >
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
          What to expect
        </Text>
        <BulletRow label="Behind-the-scenes notes" detail="DSP design choices, model derivations, A/B listening tests." />
        <BulletRow label="Audio demos" detail="Before they hit the public site — raw, with our notes on what to listen for." />
        <BulletRow label="Beta builds" detail="Closed access for engineers and producers we trust to give honest feedback." />
        <BulletRow label="Launch-week pricing" detail="Reserved for the list — never published anywhere else." last />
      </Section>

      <P>
        We won&apos;t spam you. Maybe one email a month — and only when we have
        something worth playing back.
      </P>

      <Small>
        Changed your mind?{" "}
        <Link
          href={unsubscribeUrl}
          style={{ color: "#9a9aa6", textDecoration: "underline" }}
        >
          Unsubscribe in one click
        </Link>
        .
      </Small>
    </EmailShell>
  );
}

/** One row of the "What to expect" card. */
function BulletRow({
  label,
  detail,
  last,
}: {
  label: string;
  detail: string;
  last?: boolean;
}) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      style={{
        borderCollapse: "collapse",
        width: "100%",
        marginBottom: last ? 0 : 14,
      }}
    >
      <tbody>
        <tr>
          <td
            style={{
              verticalAlign: "top",
              paddingRight: 12,
              width: 8,
              paddingTop: 8,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background:
                  "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
              }}
            />
          </td>
          <td style={{ verticalAlign: "top" }}>
            <Text
              style={{
                fontSize: 14,
                color: "#f5f5f7",
                margin: "0 0 2px",
                fontWeight: 500,
                lineHeight: "22px",
              }}
            >
              {label}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#9a9aa6",
                lineHeight: "20px",
                margin: 0,
              }}
            >
              {detail}
            </Text>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
