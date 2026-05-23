import * as React from "react";
import { Section, Text } from "@react-email/components";
import { EmailShell, EmailButton, H1, P } from "./_shared";

/**
 * Sent immediately after a user submits the waitlist form.
 * One click on the button finalizes their subscription (double opt-in).
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
      <H1>One step left.</H1>
      <P>
        Thanks for joining the waitlist. Tap the button below to confirm your
        email and lock in early access pricing when the Opticks Collection
        launches.
      </P>

      <Section style={{ padding: "8px 0 24px" }}>
        <EmailButton href={confirmUrl} label="Confirm my email" />
      </Section>

      {focus.length > 0 && (
        <P>
          We&apos;ll prioritise updates on{" "}
          <strong style={{ color: "#f5f5f7" }}>
            {focus.map((s) => s.toUpperCase()).join(", ")}
          </strong>{" "}
          for you.
        </P>
      )}

      <Text
        style={{
          fontSize: 13,
          color: "#5a5a66",
          lineHeight: "20px",
          margin: "24px 0 0",
        }}
      >
        If the button doesn&apos;t work, paste this link into your browser:
        <br />
        <span style={{ color: "#9a9aa6", wordBreak: "break-all" }}>
          {confirmUrl}
        </span>
      </Text>
    </EmailShell>
  );
}
