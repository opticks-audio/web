import * as React from "react";
import { Section, Text } from "@react-email/components";
import { EmailShell, EmailButton, H1, P, Eyebrow, Small } from "./_shared";

/**
 * Sent immediately after a user submits the waitlist form.
 * One click on the button finalizes their subscription (double opt-in).
 *
 * Editorial intent:
 *   - Short, decisive headline ("One step left").
 *   - Tactile primary CTA right under the headline.
 *   - Surface their plug-in interest so the email feels personalised.
 *   - Plain-text fallback URL for clients that strip the button.
 */
export default function WaitlistConfirm({
  confirmUrl,
  interestedIn,
}: {
  confirmUrl: string;
  interestedIn?: string[];
}) {
  const focus = (interestedIn ?? []).filter(Boolean);
  return (
    <EmailShell preview="One click to confirm your spot on the Opticks Audio waitlist.">
      <Eyebrow>Confirm your email</Eyebrow>
      <H1>One step left.</H1>
      <P>
        Thanks for joining the waitlist. Tap the button below to confirm your
        email and lock in launch-week pricing when REFLEXION, REFRACTION and
        INFLEXION ship.
      </P>

      <Section style={{ padding: "8px 0 8px" }}>
        <EmailButton href={confirmUrl} label="Confirm my email" />
      </Section>

      {focus.length > 0 && (
        <Section
          style={{
            marginTop: 32,
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: "#9a9aa6",
              lineHeight: "22px",
              margin: 0,
            }}
          >
            We&apos;ll prioritise updates on{" "}
            <strong style={{ color: "#f5f5f7" }}>
              {focus.map((s) => s.toUpperCase()).join(", ")}
            </strong>{" "}
            for you.
          </Text>
        </Section>
      )}

      <Small>
        If the button doesn&apos;t work, paste this link into your browser:
        <br />
        <span style={{ color: "#9a9aa6", wordBreak: "break-all" }}>
          {confirmUrl}
        </span>
      </Small>
    </EmailShell>
  );
}
