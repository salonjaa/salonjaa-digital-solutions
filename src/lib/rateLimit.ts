/**
 * Simple in-memory sliding-window rate limiter — good enough for a
 * low-traffic marketing site's two form endpoints on Vercel serverless
 * functions. State resets on cold start, which is an acceptable basic
 * deterrent, not a hard guarantee. If real abuse shows up, upgrade to a
 * persistent store like Upstash Redis.
 */
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

const hits = new Map<string, number[]>();

export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS) {
    hits.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  return true;
}
