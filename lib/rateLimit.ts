/**
 * Simple in-memory rate limiter.
 *
 * Works per-IP across all requests in the same Node.js process.
 * On Vercel, each serverless function instance has its own memory, so this
 * limits per-IP per-instance — good enough to stop naive brute-force and spam.
 * For stricter global limiting, swap this out for Upstash Redis.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number; // Unix ms
}

// One store per named limiter so different routes don't share counts
const stores = new Map<string, Map<string, RateLimitEntry>>();

function getStore(name: string): Map<string, RateLimitEntry> {
  if (!stores.has(name)) stores.set(name, new Map());
  return stores.get(name)!;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix ms
}

/**
 * Check (and increment) the rate limit for a given key.
 *
 * @param name     A unique name for this limiter (e.g. "auth", "contact")
 * @param key      The identifier to limit on — use the client IP
 * @param max      Max allowed requests in the window
 * @param windowMs Window duration in milliseconds
 */
export function rateLimit(
  name: string,
  key: string,
  max: number,
  windowMs: number
): RateLimitResult {
  const store = getStore(name);
  const now = Date.now();

  const entry = store.get(key);

  // Expired or first request — reset
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
  }

  // Within window
  if (entry.count >= max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt };
}

/**
 * Extract the real client IP from a Next.js request.
 * Vercel sets x-forwarded-for; fall back to a placeholder.
 */
export function getClientIp(req: Request): string {
  const xff = (req as { headers: Headers }).headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}
