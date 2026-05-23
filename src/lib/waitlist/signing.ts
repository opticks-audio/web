import { serverEnv } from "@/lib/env";

/**
 * Tiny HMAC helper for tamper-proof unsubscribe / confirmation links.
 *
 * Token format:  base64url(payloadJson) + "." + base64url(hmacSha256)
 * Payload:       { e: <email>, t: <issuedAtUnix> }
 *
 * Tokens expire 365 days after issuance to allow re-subscribing.
 *
 * Implementation note: this file uses the Web Crypto API (crypto.subtle)
 * rather than node:crypto so the same code runs on Cloudflare Pages /
 * Workers edge runtime as well as Node. The trade-off is that all helpers
 * are async.
 */

const TTL_SECONDS = 60 * 60 * 24 * 365;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function b64urlEncode(bytes: Uint8Array | string): string {
  let str: string;
  if (typeof bytes === "string") {
    str = btoa(bytes);
  } else {
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    str = btoa(binary);
  }
  return str.replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function b64urlDecodeToBytes(input: string): Uint8Array {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function b64urlDecodeToString(input: string): string {
  return textDecoder.decode(b64urlDecodeToBytes(input));
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function hmac(payload: string): Promise<string> {
  const secret = serverEnv().WAITLIST_SECRET;
  const key = await importHmacKey(secret);
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(payload),
  );
  return b64urlEncode(new Uint8Array(sig));
}

/** Constant-time string compare so timing analysis can't leak the sig. */
function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function signEmailToken(email: string): Promise<string> {
  const payload = JSON.stringify({
    e: email.toLowerCase(),
    t: Math.floor(Date.now() / 1000),
  });
  const encoded = b64urlEncode(payload);
  const sig = await hmac(encoded);
  return `${encoded}.${sig}`;
}

export async function verifyEmailToken(token: string): Promise<string | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expected = await hmac(encoded);
  if (!timingSafeEqualStr(sig, expected)) return null;

  try {
    const json = JSON.parse(b64urlDecodeToString(encoded)) as {
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
export async function hashIp(
  ip: string | null | undefined,
): Promise<string | null> {
  if (!ip) return null;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    textEncoder.encode(`${ip}|${serverEnv().WAITLIST_SECRET}`),
  );
  const bytes = new Uint8Array(digest);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex.slice(0, 32);
}
