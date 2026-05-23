import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";
import WaitlistConfirm from "@/emails/WaitlistConfirm";
import WaitlistWelcome from "@/emails/WaitlistWelcome";
import { publicEnv, serverEnv } from "@/lib/env";
import { signEmailToken } from "./signing";

let cachedResend: Resend | null = null;

function resend(): Resend {
  if (cachedResend) return cachedResend;
  cachedResend = new Resend(serverEnv().RESEND_API_KEY);
  return cachedResend;
}

function fromHeader(): string {
  const { RESEND_FROM_EMAIL, RESEND_FROM_NAME } = serverEnv();
  return `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`;
}

export async function sendConfirmationEmail(params: {
  to: string;
  confirmationToken: string;
  interestedIn?: string[];
}): Promise<{ id: string | null }> {
  const { NEXT_PUBLIC_SITE_URL } = publicEnv();
  const confirmUrl = `${NEXT_PUBLIC_SITE_URL}/api/waitlist/confirm?token=${params.confirmationToken}`;

  const html = await render(
    React.createElement(WaitlistConfirm, {
      confirmUrl,
      interestedIn: params.interestedIn,
    })
  );

  const text = [
    "One step left.",
    "",
    "Thanks for joining the Opticks Audio waitlist. Confirm your email to lock in early-access pricing:",
    confirmUrl,
    "",
    "If you didn't sign up, you can safely ignore this email.",
    "— Opticks Audio",
  ].join("\n");

  const { data, error } = await resend().emails.send({
    from: fromHeader(),
    to: params.to,
    subject: "Confirm your spot on the Opticks Audio waitlist",
    html,
    text,
    headers: {
      "X-Entity-Ref-ID": params.confirmationToken,
    },
    tags: [
      { name: "category", value: "waitlist" },
      { name: "stage", value: "confirm" },
    ],
  });

  if (error) {
    throw new Error(`[resend] ${error.name}: ${error.message}`);
  }
  return { id: data?.id ?? null };
}

export async function sendWelcomeEmail(params: {
  to: string;
}): Promise<{ id: string | null }> {
  const { NEXT_PUBLIC_SITE_URL } = publicEnv();
  const unsubscribeToken = signEmailToken(params.to);
  const unsubscribeUrl = `${NEXT_PUBLIC_SITE_URL}/waitlist/unsubscribe?token=${encodeURIComponent(
    unsubscribeToken
  )}`;

  const html = await render(
    React.createElement(WaitlistWelcome, { unsubscribeUrl })
  );

  const text = [
    "You're in.",
    "",
    "Welcome to the Opticks Audio waitlist. You'll hear from us when REFLEXION, REFRACTION and INFLEXION ship — and you'll get launch-week pricing.",
    "",
    "Unsubscribe in one click:",
    unsubscribeUrl,
    "",
    "— Opticks Audio",
  ].join("\n");

  const { data, error } = await resend().emails.send({
    from: fromHeader(),
    to: params.to,
    subject: "Welcome to Opticks Audio",
    html,
    text,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    tags: [
      { name: "category", value: "waitlist" },
      { name: "stage", value: "welcome" },
    ],
  });

  if (error) {
    throw new Error(`[resend] ${error.name}: ${error.message}`);
  }
  return { id: data?.id ?? null };
}
