import crypto from "node:crypto";
import { serverEnv } from "@/lib/env";

/**
 * Tiny HMAC helper for tamper-proof unsubscribe / confirmation links.
 *
 * Token format:  base64url(payloadJson) + "." + base64url(hmacSha256)
 * Payload:       { e: <email>, t: <issuedAtUnix> }
 *
 * Tokens expire 365 days after issuance to allow re-subscribing.
 */

const TTL_SECONDS = 60 * 60 * 24 * 365;

function b64urlEncode(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function b64urlDecode(input: string): Buffer {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function hmac(payload: string): string {
  const secret = serverEnv().WAITLIST_SECRET;
  const sig = crypto.createHmac("sha256", secret).update(payload).digest();
  return b64urlEncode(sig);
}

export function signEmailToken(email: string): string {
  const payload = JSON.stringify({
    e: email.toLowerCase(),
    t: Math.floor(Date.now() / 1000),
  });
  const encoded = b64urlEncode(payload);
  return `${encoded}.${hmac(encoded)}`;
}

export function verifyEmailToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expected = hmac(encoded);
  // Constant-time compare
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const json = JSON.parse(b64urlDecode(encoded).toString("utf8")) as {
      e: string;
      t: number;
    };
    const ageSec = Math.floor(Date.now() / 1000) - json.t;
    if (ageSec > TTL_SECONDS) return null;
    return json.e;
  } catch {
    return null;
  }
}

/** Hash an IP address for analytics without storing the raw value. */
export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  return crypto
    .createHash("sha256")
    .update(`${ip}|${serverEnv().WAITLIST_SECRET}`)
    .digest("hex")
    .slice(0, 32);
}
