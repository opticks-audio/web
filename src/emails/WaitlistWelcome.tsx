import * as React from "react";
import { Section, Text } from "@react-email/components";
import { EmailShell, H1, P } from "./_shared";

/**
 * Sent after a user confirms their email.
 * This is the moment to set expectations and build brand affinity.
 */
export default function WaitlistWelcome({
  unsubscribeUrl,
}: {
  unsubscribeUrl: string;
}) {
  return (
    <EmailShell preview="Welcome to the Opticks Audio waitlist.">
      <H1>You&apos;re in.</H1>
      <P>
        Welcome to the Opticks Audio waitlist. You&apos;ll be the first to hear
        when REFLEXION, REFRACTION and INFLEXION leave the studio — and the
        first to receive launch-week pricing.
      </P>

      <Section
        style={{
          padding: "20px 24px",
          borderRadius: 12,
          backgroundColor: "#0a0a0f",
          border: "1px solid rgba(255,255,255,0.08)",
          margin: "24px 0",
        }}
      >
        <Text
          style={{
            fontSize: 13,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#9a9aa6",
            margin: "0 0 12px",
          }}
        >
          What to expect
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: "#c9c9d2",
            lineHeight: "24px",
            margin: 0,
          }}
        >
          · Behind-the-scenes development notes from the DSP team.
          <br />· Audio demos before they hit the public site.
          <br />· Beta invites for engineers and producers we trust.
          <br />· Early-bird pricing the moment we ship.
        </Text>
      </Section>

      <P>
        We won&apos;t spam you. Maybe one email a month — and only when we have
        something worth playing back.
      </P>

      <Text
        style={{
          fontSize: 12,
          color: "#5a5a66",
          lineHeight: "20px",
          margin: "32px 0 0",
        }}
      >
        Changed your mind?{" "}
        <a
          href={unsubscribeUrl}
          style={{ color: "#9a9aa6", textDecoration: "underline" }}
        >
          Unsubscribe in one click
        </a>
        .
      </Text>
    </EmailShell>
  );
}
