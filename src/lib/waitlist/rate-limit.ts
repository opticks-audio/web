/**
 * Minimal in-memory rate limiter.
 *
 * For Phase 1 traffic this is plenty. When we move to Cloudflare Pages
 * functions or hit multi-region deploys we'll swap this for Upstash /
 * Cloudflare Rate Limiting bindings without changing the call site.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit = 5, windowMs = 60_000): {
  ok: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }
  return {
    ok: true,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  };
}
